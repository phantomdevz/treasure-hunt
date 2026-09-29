"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Particle burst component
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    tx: `${(Math.random() - 0.5) * 160}px`,
    ty: `${(Math.random() - 0.5) * 160}px`,
    delay: Math.random() * 0.3,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.tx, y: p.ty, scale: 0, opacity: 0 }}
          transition={{ delay: p.delay, duration: 0.7, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--green-bright)",
            boxShadow: "0 0 8px var(--green-bright)",
          }}
        />
      ))}
    </div>
  );
}

// SVG Padlock
function AnimatedPadlock({ isOpen }) {
  return (
    <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
      {/* Body */}
      <rect
        x="8" y="44" width="64" height="50" rx="8"
        fill="rgba(0,255,65,0.1)"
        stroke="#00ff41"
        strokeWidth="2"
        style={{ filter: "drop-shadow(0 0 8px #00ff41)" }}
      />
      {/* Keyhole */}
      <circle cx="40" cy="68" r="8" fill="#00ff41" opacity="0.3" />
      <circle cx="40" cy="68" r="4" fill="#00ff41" />
      <rect x="38" y="70" width="4" height="8" rx="2" fill="#00ff41" />

      {/* Shackle */}
      <motion.g
        initial={{ rotate: 0, y: 0 }}
        animate={isOpen ? { rotate: -40, y: -10 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.3 }}
        style={{ transformOrigin: "14px 44px" }}
      >
        <path
          d="M14 44 V22 Q14 6 40 6 Q66 6 66 22 V44"
          stroke="#00ff41"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 4px #00ff41)" }}
        />
      </motion.g>
    </svg>
  );
}

export default function SuccessReveal({ nextLabel, isLast, onAdvance }) {
  const [padlockOpen, setPadlockOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPadlockOpen(true), 400);
    const t2 = setTimeout(() => setShowParticles(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-bright)",
        borderRadius: "12px",
        padding: "3rem 2rem",
        textAlign: "center",
        boxShadow: "0 0 40px rgba(0,255,65,0.25)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Green flare bg */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.2, 0], scale: [0, 3] }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle, rgba(0,255,65,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Padlock */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <AnimatedPadlock isOpen={padlockOpen} />
        {showParticles && <Particles />}
      </div>

      {/* Success text */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.8rem",
          color: "var(--green-bright)",
          marginTop: "1rem",
          letterSpacing: "0.1em",
          textShadow: "0 0 20px rgba(0,255,65,0.8)",
        }}
      >
        {isLast ? "MISSION COMPLETE" : "CHECKPOINT CLEARED"}
      </motion.h2>

      {/* Next destination */}
      {!isLast && nextLabel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            background: "rgba(0,255,65,0.06)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1rem",
            margin: "1.5rem 0",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              letterSpacing: "0.15em",
              marginBottom: "0.4rem",
            }}
          >
            NEXT DESTINATION
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.1rem",
              color: "var(--green-bright)",
              textShadow: "0 0 8px rgba(0,255,65,0.5)",
            }}
          >
            {nextLabel}
          </p>
        </motion.div>
      )}

      {isLast && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            margin: "1.5rem 0",
          }}
        >
          You have completed all checkpoints!<br />
          Return to HQ to submit your time.
        </motion.p>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdvance}
        className="btn btn-primary"
        style={{ marginTop: "0.5rem", padding: "0.8rem 2rem" }}
      >
        {isLast ? "▷ FINISH" : "▷ NEXT CHECKPOINT"}
      </motion.button>
    </motion.div>
  );
}
