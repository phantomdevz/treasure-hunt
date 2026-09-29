"use client";
import { motion } from "framer-motion";

export default function AnswerGating({ error }) {
  return (
    <motion.div
      key="gating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: "var(--bg-secondary)",
        border: `1px solid ${error ? "rgba(255,32,32,0.6)" : "var(--border)"}`,
        borderRadius: "12px",
        padding: "3rem 2rem",
        textAlign: "center",
        boxShadow: error
          ? "0 0 24px rgba(255,32,32,0.2)"
          : "0 0 24px rgba(0,255,65,0.1)",
      }}
    >
      {error ? (
        <motion.div
          animate={{ x: [-6, 6, -6, 6, 0] }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✗</div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--accent-error)",
              fontSize: "1.2rem",
              marginBottom: "0.5rem",
              letterSpacing: "0.1em",
            }}
          >
            ACCESS DENIED
          </h3>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: "60px",
              height: "60px",
              border: "3px solid var(--bg-tertiary)",
              borderTop: "3px solid var(--green-bright)",
              borderRadius: "50%",
              margin: "0 auto 1.5rem",
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-muted)",
              letterSpacing: "0.15em",
              fontSize: "0.8rem",
            }}
          >
            VERIFYING HASH...
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--green-dim)",
              fontSize: "0.7rem",
              marginTop: "0.4rem",
            }}
          >
            AES-256-GCM DECRYPTION IN PROGRESS
          </p>
        </>
      )}
    </motion.div>
  );
}
