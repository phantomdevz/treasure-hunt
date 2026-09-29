"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function RiddleActive({ riddle, onSubmitAnswer, hintsRevealed, onRevealHint, error }) {
  const [displayedText, setDisplayedText] = useState("");
  const [answer, setAnswer]               = useState("");
  const [isTyping, setIsTyping]           = useState(true);

  const fullRiddle = riddle?.plaintextRiddle || "";
  const hints = riddle?.plaintextHints || [];

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    if (!fullRiddle) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullRiddle.slice(0, i + 1));
      i++;
      if (i >= fullRiddle.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [fullRiddle]);

  return (
    <motion.div
      key="riddle"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-bright)",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 0 24px rgba(0,255,65,0.15)",
      }}
    >
      {/* Header */}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.65rem",
          color: "var(--text-muted)",
          letterSpacing: "0.2em",
          marginBottom: "1rem",
        }}
      >
        ▷ DECRYPTED TRANSMISSION
      </p>

      {/* Riddle text */}
      <div
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          minHeight: "120px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            color: "var(--text-primary)",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
          }}
        >
          {displayedText}
          {isTyping && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "1.1em",
                background: "var(--green-bright)",
                verticalAlign: "text-bottom",
                animation: "phosphorBlink 1.2s step-start infinite",
                marginLeft: "2px",
              }}
            />
          )}
        </p>
      </div>

      {/* Hint system */}
      {hints.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              letterSpacing: "0.15em",
              marginBottom: "0.75rem",
            }}
          >
            HINT SYSTEM
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {hints.map((hint, i) => (
              <div key={i}>
                {i < hintsRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{
                      background: "rgba(255,170,0,0.06)",
                      border: "1px solid rgba(255,170,0,0.3)",
                      borderRadius: "6px",
                      padding: "0.5rem 0.75rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.65rem",
                        color: "var(--accent-warn)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      HINT {i + 1}:{" "}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {hint}
                    </span>
                  </motion.div>
                ) : i === hintsRevealed ? (
                  <button
                    onClick={() => onRevealHint(i)}
                    className="btn btn-ghost"
                    style={{ fontSize: "0.7rem", width: "100%", justifyContent: "flex-start" }}
                  >
                    <span style={{ color: "var(--accent-warn)" }}>⚠</span>
                    &nbsp;Reveal Hint {i + 1}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer input */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            letterSpacing: "0.15em",
          }}
        >
          ENTER ANSWER
        </label>
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(255, 32, 32, 0.12)",
              border: "1px solid rgba(255, 32, 32, 0.5)",
              borderRadius: "6px",
              padding: "0.6rem 0.85rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "#ff4d4d",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>✗</span>
            <span>{error}</span>
          </motion.div>
        )}

        <input
          className="input"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && answer.trim() && onSubmitAnswer(answer)}
          placeholder="Type your answer here..."
          autoComplete="off"
          spellCheck={false}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => answer.trim() && onSubmitAnswer(answer)}
          className="btn btn-primary"
          disabled={!answer.trim()}
        >
          ▷ SUBMIT ANSWER
        </motion.button>
      </div>
    </motion.div>
  );
}
