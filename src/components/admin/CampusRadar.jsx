"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  subscribeCheckpoints,
  subscribeTeams,
  subscribeCompletionEvents,
  getAllMissionPacks,
} from "@/lib/firebase";

// ── Colour palette per team index ────────────────────────────
const TEAM_COLORS = [
  "#00ff41", "#3ECFA4", "#4FC3F7", "#FF8A65",
  "#CE93D8", "#FFD54F", "#F06292", "#81C784",
];
function teamColor(i) { return TEAM_COLORS[i % TEAM_COLORS.length]; }

// ── Helpers ──────────────────────────────────────────────────
function fmt(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function elapsed(startMs, endMs) {
  if (!startMs || !endMs) return null;
  const s = Math.floor((endMs - startMs) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ── Sub-components ───────────────────────────────────────────

function WinnerBanner({ team, totalCheckpoints, startTs, finishTs }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        background: "linear-gradient(135deg, rgba(0,255,65,0.12) 0%, rgba(62,207,164,0.08) 100%)",
        border: "1px solid rgba(0,255,65,0.5)",
        borderRadius: "12px",
        padding: "1.5rem 2rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
        boxShadow: "0 0 40px rgba(0,255,65,0.15), inset 0 1px 0 rgba(0,255,65,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer */}
      <motion.div
        animate={{ x: ["−100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.06), transparent)",
          pointerEvents: "none",
        }}
      />

      <div style={{ fontSize: "2.5rem" }}>🏆</div>

      <div style={{ flex: 1, minWidth: "160px" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.6rem",
          color: "var(--text-muted)",
          letterSpacing: "0.2em",
          marginBottom: "0.3rem",
        }}>WINNER</div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "var(--green-bright)",
          textShadow: "0 0 20px rgba(0,255,65,0.6)",
          letterSpacing: "0.05em",
        }}>{team.name}</div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--text-secondary)",
          marginTop: "0.2rem",
        }}>
          {team.leaderName} · {totalCheckpoints} checkpoints
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>TOTAL TIME</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--green-bright)", fontWeight: 700 }}>
          {elapsed(startTs, finishTs) || "—"}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>
          Finished {fmt(finishTs)}
        </div>
      </div>
    </motion.div>
  );
}

function RouteTimeline({ team, route, checkpointMap, events, color, startTs }) {
  return (
    <div style={{ padding: "0 0 0.5rem" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(route.length, 6)}, 1fr)`,
        gap: "0.5rem",
      }}>
        {route.map((cpId, stepIdx) => {
          const cp = checkpointMap[cpId];
          const ev = events?.find((e) => e.stationId === cpId);
          const isDone  = stepIdx < team.currentCheckpointIndex;
          const isNext  = stepIdx === team.currentCheckpointIndex && !team.completedAt;
          const isPast  = team.completedAt && stepIdx >= team.currentCheckpointIndex;

          return (
            <div
              key={cpId}
              style={{
                background: isDone
                  ? `rgba(${hexToRgb(color)}, 0.08)`
                  : isNext
                  ? "rgba(255,140,0,0.06)"
                  : "rgba(0,0,0,0.2)",
                border: isDone
                  ? `1px solid ${color}55`
                  : isNext
                  ? "1px solid rgba(255,140,0,0.4)"
                  : "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.6rem 0.5rem",
                textAlign: "center",
                position: "relative",
              }}
            >
              {/* Step number badge */}
              <div style={{
                position: "absolute",
                top: "4px",
                left: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                color: isDone ? color : "var(--text-muted)",
                opacity: 0.8,
              }}>#{stepIdx + 1}</div>

              {/* Status icon */}
              <div style={{ fontSize: "1rem", marginBottom: "0.2rem", marginTop: "0.3rem" }}>
                {isDone ? "✓" : isNext ? "▶" : "○"}
              </div>

              {/* Checkpoint name */}
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                color: isDone ? "var(--text-primary)" : "var(--text-muted)",
                letterSpacing: "0.06em",
                marginBottom: "0.25rem",
                lineHeight: 1.2,
              }}>
                {cp?.name || cpId}
              </div>

              {/* Timestamp */}
              {isDone && ev && (
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color: color,
                  opacity: 0.9,
                }}>
                  {fmt(ev.timestamp)}
                  {startTs && (
                    <div style={{ color: "var(--text-muted)", marginTop: "1px" }}>
                      +{elapsed(startTs, ev.timestamp)}
                    </div>
                  )}
                </div>
              )}
              {isNext && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(255,140,0,0.8)" }}>
                  IN PROGRESS
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamCard({ team, teamIdx, route, checkpointMap, events, totalCheckpoints, rank }) {
  const [expanded, setExpanded] = useState(false);
  const color = teamColor(teamIdx);
  const pct   = totalCheckpoints > 0 ? (team.currentCheckpointIndex / totalCheckpoints) * 100 : 0;

  // Find earliest event for this team = start time
  const teamEvents = events.filter((e) => e.teamId === (team.id || team.teamId));
  const startTs  = teamEvents.length > 0 ? Math.min(...teamEvents.map((e) => e.timestamp)) : null;
  const finishTs = team.completedAt
    ? (typeof team.completedAt === "number" ? team.completedAt : team.completedAt?.toMillis?.() ?? null)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-secondary, #0e1117)",
        border: `1px solid ${team.completedAt ? color + "66" : "var(--border)"}`,
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: team.completedAt ? `0 0 20px ${color}22` : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Header row */}
      <div
        onClick={() => setExpanded((x) => !x)}
        style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr auto auto auto",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.85rem 1rem",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Rank */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 700,
          color: rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "var(--text-muted)",
          textAlign: "center",
        }}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
        </div>

        {/* Team name + leader */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "0.03em",
          }}>
            {team.name}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>
            {team.leaderName}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: "120px" }}>
          <div style={{
            height: "4px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "2px",
            overflow: "hidden",
            marginBottom: "4px",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", background: color, borderRadius: "2px" }}
            />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", textAlign: "right" }}>
            {team.currentCheckpointIndex}/{totalCheckpoints}
          </div>
        </div>

        {/* Status badge */}
        <div>
          {team.completedAt ? (
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.55rem",
              letterSpacing: "0.12em",
              color: color,
              background: `${color}22`,
              border: `1px solid ${color}55`,
              borderRadius: "4px",
              padding: "2px 6px",
            }}>DONE · {elapsed(startTs, finishTs)}</span>
          ) : team.currentCheckpointIndex > 0 ? (
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.55rem",
              letterSpacing: "0.12em",
              color: "#ff8c00",
              background: "rgba(255,140,0,0.1)",
              border: "1px solid rgba(255,140,0,0.3)",
              borderRadius: "4px",
              padding: "2px 6px",
            }}>ACTIVE</span>
          ) : (
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.55rem",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "2px 6px",
            }}>WAITING</span>
          )}
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          style={{ color: "var(--text-muted)", fontSize: "0.7rem", flexShrink: 0 }}
        >▼</motion.div>
      </div>

      {/* Expandable route timeline */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: "1px solid var(--border)",
              padding: "1rem",
              background: "rgba(0,0,0,0.25)",
            }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                marginBottom: "0.75rem",
              }}>
                ASSIGNED ROUTE — {route.length} CHECKPOINTS
              </div>
              {route.length > 0 ? (
                <RouteTimeline
                  team={team}
                  route={route}
                  checkpointMap={checkpointMap}
                  events={teamEvents}
                  color={color}
                  startTs={startTs}
                />
              ) : (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Route data not available — mission pack may not be loaded yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Helper: parse hex to r,g,b string ───────────────────────
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

// ── Main component ───────────────────────────────────────────
export default function CampusRadar() {
  const [checkpoints, setCheckpoints]   = useState([]);
  const [teams, setTeams]               = useState([]);
  const [events, setEvents]             = useState([]);
  const [missionPacks, setMissionPacks] = useState({});
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const unsubCp  = subscribeCheckpoints(setCheckpoints);
    const unsubT   = subscribeTeams(setTeams);
    const unsubEv  = subscribeCompletionEvents(setEvents);

    getAllMissionPacks().then((packs) => {
      setMissionPacks(packs);
      setLoading(false);
    });

    return () => { unsubCp(); unsubT(); unsubEv(); };
  }, []);

  // Build checkpoint lookup map
  const checkpointMap = useMemo(() =>
    checkpoints.reduce((acc, cp) => { acc[cp.id] = cp; return acc; }, {}),
  [checkpoints]);

  // Sort teams: finished first (by completion time), then by progress
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const aFinish = a.completedAt ? (typeof a.completedAt === "number" ? a.completedAt : a.completedAt?.toMillis?.() ?? Infinity) : Infinity;
      const bFinish = b.completedAt ? (typeof b.completedAt === "number" ? b.completedAt : b.completedAt?.toMillis?.() ?? Infinity) : Infinity;
      if (aFinish !== bFinish) return aFinish - bFinish;
      return b.currentCheckpointIndex - a.currentCheckpointIndex;
    });
  }, [teams]);

  const winner = sortedTeams.find((t) => t.completedAt);
  const totalCheckpoints = checkpoints.length;

  // Get route for a team (from mission pack)
  function getTeamRoute(team) {
    const teamId = team.id || team.teamId;
    const pack   = missionPacks[teamId];
    return pack?.route ?? [];
  }

  // Get earliest team event as "start time"
  function getTeamStartTs(team) {
    const teamId = team.id || team.teamId;
    const ev = events.filter((e) => e.teamId === teamId);
    return ev.length > 0 ? Math.min(...ev.map((e) => e.timestamp)) : null;
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
        <div style={{
          width: "32px", height: "32px",
          border: "2px solid rgba(0,255,65,0.2)",
          borderTop: "2px solid var(--green-bright, #00ff41)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem",
        }} />
        LOADING RADAR...
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", border: "1px dashed var(--border)", borderRadius: "8px" }}>
        No checkpoints configured yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Winner banner */}
      {winner && (
        <WinnerBanner
          team={winner}
          totalCheckpoints={totalCheckpoints}
          startTs={getTeamStartTs(winner)}
          finishTs={
            typeof winner.completedAt === "number"
              ? winner.completedAt
              : winner.completedAt?.toMillis?.() ?? null
          }
        />
      )}

      {/* Live stats strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "0.75rem",
      }}>
        {[
          { label: "TEAMS", value: teams.length },
          { label: "CHECKPOINTS", value: totalCheckpoints },
          { label: "ACTIVE", value: teams.filter((t) => !t.completedAt && t.currentCheckpointIndex > 0).length },
          { label: "FINISHED", value: teams.filter((t) => t.completedAt).length },
          { label: "WAITING", value: teams.filter((t) => t.currentCheckpointIndex === 0 && !t.completedAt).length },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "rgba(0,255,65,0.04)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            textAlign: "center",
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--green-bright, #00ff41)", lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Team cards */}
      {teams.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", border: "1px dashed var(--border)", borderRadius: "8px" }}>
          No teams registered yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 120px auto 20px",
            gap: "0.75rem",
            padding: "0 1rem",
            fontFamily: "var(--font-display)",
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            color: "var(--text-muted)",
          }}>
            <div>RNK</div>
            <div>TEAM</div>
            <div>PROGRESS</div>
            <div>STATUS</div>
            <div />
          </div>

          <AnimatePresence mode="popLayout">
            {sortedTeams.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                teamIdx={teams.findIndex((t) => t.id === team.id)}
                route={getTeamRoute(team)}
                checkpointMap={checkpointMap}
                events={events}
                totalCheckpoints={totalCheckpoints}
                rank={i + 1}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: "1.5rem",
        flexWrap: "wrap",
        fontFamily: "var(--font-display)",
        fontSize: "0.6rem",
        letterSpacing: "0.12em",
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border)",
        paddingTop: "1rem",
      }}>
        <span>✓ COMPLETED CHECKPOINT</span>
        <span>▶ CURRENT STATION</span>
        <span>○ NOT YET REACHED</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
          Click any team to expand route ▼
        </span>
      </div>
    </div>
  );
}
