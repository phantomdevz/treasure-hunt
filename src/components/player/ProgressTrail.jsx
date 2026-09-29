"use client";
import { motion } from "framer-motion";

export default function ProgressTrail({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ padding: "0.5rem 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.4rem",
          fontFamily: "var(--font-display)",
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
        }}
      >
        <span>PROGRESS</span>
        <span style={{ color: "var(--green-bright)" }}>
          {current}/{total} CHECKPOINTS
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Step dots */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginTop: "0.6rem",
          flexWrap: "wrap",
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background:
                i < current
                  ? "var(--green-bright)"
                  : i === current
                  ? "var(--green-mid)"
                  : "var(--bg-tertiary)",
              border: `1px solid ${
                i < current
                  ? "var(--green-bright)"
                  : "var(--border)"
              }`,
              boxShadow: i < current ? "0 0 6px var(--green-bright)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
