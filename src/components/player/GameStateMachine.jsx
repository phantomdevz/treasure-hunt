"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameState, GameState } from "@/hooks/useGameState";
import ProgressTrail from "./ProgressTrail";
import WaitingForScan from "./states/WaitingForScan";
import RiddleActive from "./states/RiddleActive";
import AnswerGating from "./states/AnswerGating";
import SuccessReveal from "./states/SuccessReveal";

export default function GameStateMachine({ team }) {
  const {
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
    totalCheckpoints,
  } = useGameState(team);

  const [hintsRevealed, setHintsRevealed] = useState(0);

  // Reset hint count when riddle changes
  const handleRevealHint = (i) => {
    setHintsRevealed(i + 1);
  };

  const isLast = currentIndex >= totalCheckpoints - 1;

  if (state === GameState.COMPLETED) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: "center",
          padding: "3rem",
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          border: "1px solid var(--border-bright)",
          boxShadow: "0 0 60px rgba(0,255,65,0.3)",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏆</div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            color: "var(--green-bright)",
            textShadow: "0 0 20px rgba(0,255,65,0.8)",
            letterSpacing: "0.1em",
            marginBottom: "1rem",
          }}
        >
          MISSION COMPLETE
        </h1>
        <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          All {totalCheckpoints} checkpoints cleared.<br />
          Report to HQ immediately.
        </p>
        <div
          style={{
            marginTop: "2rem",
            fontFamily: "var(--font-display)",
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
          }}
        >
          TEAM: {team?.name}
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Progress indicator */}
      {totalCheckpoints > 0 && (
        <ProgressTrail current={currentIndex} total={totalCheckpoints} />
      )}

      {/* State display */}
      {!missionPack ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.1em",
            fontSize: "0.8rem",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid var(--bg-tertiary)",
              borderTop: "2px solid var(--green-bright)",
              borderRadius: "50%",
              margin: "0 auto 1rem",
            }}
          />
          LOADING MISSION PACK...
        </div>
      ) : (
        <div>
          {(state === GameState.WAITING_FOR_SCAN || state === GameState.VERIFYING) && (
            <WaitingForScan
              key="waiting"
              riddle={currentRiddle}
              currentIndex={currentIndex}
              nextClue={currentClue}
              onScan={handleScan}
              error={error}
            />
          )}
          {state === GameState.RIDDLE_ACTIVE && (
            <RiddleActive
              key={`riddle-${currentIndex}`}
              riddle={currentRiddle}
              onSubmitAnswer={handleAnswer}
              hintsRevealed={hintsRevealed}
              onRevealHint={handleRevealHint}
              error={error}
            />
          )}
          {state === GameState.ANSWER_GATING && (
            <AnswerGating key="gating" error={error} />
          )}
          {state === GameState.SUCCESS_REVEAL && (
            <SuccessReveal
              key="success"
              nextLabel={decryptedNextLabel}
              isLast={isLast}
              onAdvance={() => { setHintsRevealed(0); handleAdvance(); }}
            />
          )}
        </div>
      )}

      {/* Error toast for scan failures */}
      <AnimatePresence>
        {error && state === GameState.WAITING_FOR_SCAN && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              background: "rgba(255,32,32,0.1)",
              border: "1px solid rgba(255,32,32,0.4)",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--accent-error)",
            }}
          >
            ✗ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
