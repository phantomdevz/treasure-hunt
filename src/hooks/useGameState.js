"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { verifyAnswer, decrypt } from "@/lib/crypto";
import { queueCompletion, getMissionPack, saveTeamSession, saveMissionPack as savePackDexie } from "@/lib/db";
import { updateTeamProgress, getMissionPackFromFirestore } from "@/lib/firebase";
import { useNetworkStatus } from "./useNetworkStatus";

export const GameState = {
  WAITING_FOR_SCAN: "WAITING_FOR_SCAN",
  VERIFYING:        "VERIFYING",
  RIDDLE_ACTIVE:    "RIDDLE_ACTIVE",
  ANSWER_GATING:    "ANSWER_GATING",
  SUCCESS_REVEAL:   "SUCCESS_REVEAL",
  COMPLETED:        "COMPLETED",
};

export function useGameState(team) {
  const [state, setState]     = useState(GameState.WAITING_FOR_SCAN);
  const [missionPack, setPack] = useState(null);
  const [currentIndex, setIdx] = useState(team?.currentCheckpointIndex ?? 0);
  const [currentRiddle, setRiddle] = useState(null);
  const [decryptedNextLabel, setNextLabel] = useState(null);
  const [currentClue, setCurrentClue] = useState(team?.currentClue || null);
  const [error, setError]     = useState(null);
  const [prevAnswer, setPrevAnswer] = useState(null);
  const { isOnline } = useNetworkStatus();

  // Refs so callbacks always read fresh values — eliminates stale closure bugs
  const packRef       = useRef(null);
  const idxRef        = useRef(team?.currentCheckpointIndex ?? 0);
  const prevAnswerRef = useRef(null);
  const clueRef       = useRef(team?.currentClue || null);

  const teamId = team?.id || team?.teamId;

  // Keep refs in sync with state
  useEffect(() => { packRef.current = missionPack; }, [missionPack]);
  useEffect(() => { idxRef.current  = currentIndex; }, [currentIndex]);
  useEffect(() => { prevAnswerRef.current = prevAnswer; }, [prevAnswer]);
  useEffect(() => { clueRef.current = currentClue; }, [currentClue]);

  // Load mission pack from Dexie (with Firestore fallback if online)
  useEffect(() => {
    if (!teamId) return;
    (async () => {
      try {
        let pack = await getMissionPack(teamId);
        if (!pack) {
          // Fallback: fetch from Firestore if missing locally
          const remote = await getMissionPackFromFirestore(teamId);
          if (remote) {
            pack = { teamId, ...remote };
            await savePackDexie(pack);
          }
        }
        if (pack) {
          // Normalize mission packs so nextDestLabelPlaintext always points to the next checkpoint in the route
          if (pack.riddles && pack.riddles.length > 0 && !pack.riddles[0].stationClue) {
            pack.riddles = pack.riddles.map((r, i) => {
              const stationClue = r.nextDestLabelPlaintext || (r.building ? `Head to ${r.building}` : r.name || "");
              const nextRiddle = pack.riddles[i + 1];
              const nextClueText = nextRiddle
                ? (nextRiddle.nextDestLabelPlaintext || (nextRiddle.building ? `Head to ${nextRiddle.building}` : `Proceed to Station ${i + 2}`))
                : "All checkpoints cleared! Report to HQ to claim victory.";
              return {
                ...r,
                stationClue,
                nextDestLabelPlaintext: nextClueText,
              };
            });
            savePackDexie(pack).catch(() => {});
          }

          packRef.current = pack;
          setPack(pack);
          const initialIdx = team.currentCheckpointIndex ?? 0;
          idxRef.current = initialIdx;
          setIdx(initialIdx);
          if (initialIdx >= (pack.route?.length ?? 0)) {
            setState(GameState.COMPLETED);
          } else {
            setRiddle(pack.riddles[initialIdx] ?? null);
            setError(null);
            // Initialize clue: for station 0, show the starting station clue;
            // for station > 0, show prior station's nextDestLabelPlaintext
            let initialClue = team?.currentClue || null;
            if (!initialClue) {
              if (initialIdx === 0 && pack.riddles?.[0]) {
                initialClue =
                  pack.riddles[0].stationClue ||
                  (pack.riddles[0].building ? `Head to ${pack.riddles[0].building}` : null);
              } else if (initialIdx > 0 && pack.riddles?.[initialIdx - 1]) {
                initialClue = pack.riddles[initialIdx - 1].nextDestLabelPlaintext || null;
              }
            }
            if (initialClue) {
              setCurrentClue(initialClue);
              clueRef.current = initialClue;
            }
          }
        } else {
          setError("Mission pack not found. Please log out and log in again.");
        }
      } catch (err) {
        console.warn("[NexusHunt] Error loading mission pack:", err);
        setError("Error loading game data: " + (err.message || "Unknown"));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);



  // Called when a QR code is scanned — reads from refs to avoid stale closure
  const handleScan = useCallback(async (qrData) => {
    setError(null);
    setState(GameState.VERIFYING);
    try {
      const parts = qrData.split(":");
      if (parts[0] !== "NEXUSHUNT" || parts.length < 3) {
        throw new Error("Invalid QR code format");
      }
      const scannedCheckpointId = parts[1];
      const scannedToken        = parts[2];

      const pack = packRef.current;
      const idx  = idxRef.current;

      if (!pack) throw new Error("No mission pack loaded");
      const expected = pack.route[idx];

      if (scannedCheckpointId !== expected) {
        throw new Error(`Wrong station! Check your route.`);
      }

      const riddle = pack.riddles[idx];
      if (riddle?.secretToken && scannedToken !== riddle.secretToken) {
        throw new Error("Token mismatch — is this QR current?");
      }

      if (riddle) {
        setRiddle({
          ...riddle,
          plaintextRiddle: riddle.plaintextRiddle || "",
          plaintextHints:  riddle.plaintextHints  || [],
        });
      }

      // Next QR code has been successfully scanned and decoded: clear previous station clue
      setCurrentClue(null);
      clueRef.current = null;
      if (teamId) {
        saveTeamSession({ ...team, teamId, currentCheckpointIndex: idx, currentClue: null }).catch(() => {});
      }

      setState(GameState.RIDDLE_ACTIVE);
    } catch (e) {
      setError(e.message);
      setState(GameState.WAITING_FOR_SCAN);
    }
  }, [team, teamId]);

  // Called when user submits an answer
  const handleAnswer = useCallback(async (answer) => {
    if (!currentRiddle) return;
    setState(GameState.ANSWER_GATING);
    setError(null);
    try {
      const ok = await verifyAnswer(answer, currentRiddle.answerHashHex);
      if (!ok) {
        setError("Incorrect answer. Try again.");
        setState(GameState.RIDDLE_ACTIVE);
        return;
      }

      const normAnswer = answer.trim().toLowerCase();

      // Write to ref immediately — handleAdvance reads from ref, not state
      prevAnswerRef.current = normAnswer;
      setPrevAnswer(normAnswer);

      // Decrypt next destination label
      let nextLabel = currentRiddle.nextDestLabelPlaintext || "";
      if (currentRiddle.nextDestLabelCiphertextB64) {
        try {
          nextLabel = await decrypt(currentRiddle.nextDestLabelCiphertextB64, normAnswer);
        } catch {
          nextLabel = currentRiddle.nextDestLabelPlaintext || "";
        }
      }
      setNextLabel(nextLabel);
      if (nextLabel) {
        setCurrentClue(nextLabel);
        clueRef.current = nextLabel;
      }

      const pack    = packRef.current;
      const idx     = idxRef.current;
      const nextIdx = idx + 1;

      // Queue completion event (works offline)
      await queueCompletion({
        teamId,
        stationId: pack.route[idx],
        timestamp: Date.now(),
      });

      // Update Firestore progress if online
      if (isOnline && teamId) {
        try {
          await updateTeamProgress(
            teamId,
            nextIdx,
            nextIdx >= pack.route.length ? Date.now() : null
          );
        } catch (err) {
          console.warn("[NexusHunt] Could not update Firestore immediately:", err);
        }
      }

      // Persist progress to local Dexie session so reload doesn't reset state
      if (teamId) {
        try {
          await saveTeamSession({
            ...team,
            teamId,
            currentCheckpointIndex: nextIdx,
            currentClue: nextLabel || null,
          });
        } catch (err) {
          console.warn("[NexusHunt] Could not update local session:", err);
        }
      }

      setState(GameState.SUCCESS_REVEAL);
    } catch (e) {
      setError(e.message || "An error occurred while checking answer");
      setState(GameState.RIDDLE_ACTIVE);
    }
  }, [currentRiddle, team, teamId, isOnline]);

  // Called after success animation — always reads from refs to avoid stale closure
  const handleAdvance = useCallback(async () => {
    const pack    = packRef.current;
    const idx     = idxRef.current;
    const prevAns = prevAnswerRef.current;
    const nextIdx = idx + 1;

    console.log(`[NexusHunt] handleAdvance: idx=${idx} nextIdx=${nextIdx} routeLen=${pack?.route?.length}`);

    if (!pack || nextIdx >= (pack.route?.length ?? 0)) {
      setState(GameState.COMPLETED);
      return;
    }

    const nextRiddle = pack.riddles[nextIdx];
    let decryptedRiddle = { ...nextRiddle };

    // Decrypt next riddle using previous answer as key if encrypted
    if (nextRiddle?.ciphertextB64 && prevAns) {
      try {
        decryptedRiddle.plaintextRiddle = await decrypt(nextRiddle.ciphertextB64, prevAns);
        if (nextRiddle.hintsEncryptedB64?.length) {
          decryptedRiddle.plaintextHints = await Promise.all(
            nextRiddle.hintsEncryptedB64.map((h) => decrypt(h, prevAns))
          );
        }
      } catch (err) {
        console.warn("[NexusHunt] Decryption fallback to plaintext:", err);
      }
    }

    // Fallback to plaintextRiddle if decrypt didn't run
    if (!decryptedRiddle.plaintextRiddle && nextRiddle?.plaintextRiddle) {
      decryptedRiddle.plaintextRiddle = nextRiddle.plaintextRiddle;
    }

    if (teamId) {
      try {
        await saveTeamSession({
          ...team,
          teamId,
          currentCheckpointIndex: nextIdx,
          currentClue: clueRef.current || null,
        });
      } catch (err) {
        console.warn("[NexusHunt] Failed to update local session index:", err);
      }
    }

    // Update ref before setState so any synchronous subscribers see the new index
    idxRef.current = nextIdx;
    setIdx(nextIdx);
    setRiddle(decryptedRiddle);
    setError(null);
    setNextLabel(null);
    // Notice: currentClue remains intact so it displays on WAITING_FOR_SCAN until next QR is decoded
    setState(GameState.WAITING_FOR_SCAN);
  }, [team, teamId]);

  return {
    state,
    currentIndex,
    currentRiddle,
    decryptedNextLabel,
    currentClue,
    error,
    missionPack,
    handleScan,
    handleAnswer,
    handleAdvance,
    totalCheckpoints: missionPack?.route?.length ?? 0,
  };
}
