"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import QRScanner from "../QRScanner";

// Matrix rain canvas
function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth || 320;
    canvas.height = canvas.offsetHeight || 400;

    const cols = Math.max(1, Math.floor(canvas.width / 16));
    const drops = Array(cols).fill(1);
    const chars = "NEXUSHUNT01アイウエオカキクケコサシスセソ0123456789ABCDEF".split("");

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = "14px monospace";

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.15,
        pointerEvents: "none",
      }}
    />
  );
}

export default function WaitingForScan({ riddle, currentIndex, nextClue, onScan }) {
  const [scannerOpen, setScannerOpen] = useState(false);

  const locationHint =
    riddle?.building ||
    riddle?.name ||
    (currentIndex === 0 && riddle?.nextDestLabelPlaintext) ||
    "—";

  return (
    <div
      key="waiting"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        padding: "2rem 1.5rem",
        textAlign: "center",
        minHeight: "420px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
      }}
    >
      <MatrixRain />

      {/* Header & Clue Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            letterSpacing: "0.15em",
            marginBottom: "0.25rem",
          }}
        >
          CHECKPOINT {currentIndex + 1}
        </p>

        {/* Animated camera icon */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 12px rgba(0,255,65,0.4)",
              "0 0 30px rgba(0,255,65,0.8)",
              "0 0 12px rgba(0,255,65,0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(0,255,65,0.06)",
            border: "2px solid var(--green-bright)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0.75rem auto",
            fontSize: "2.2rem",
          }}
        >
          📷
        </motion.div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            color: "var(--green-bright)",
            marginBottom: "0.35rem",
          }}
        >
          SCAN QR CODE
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginBottom: "0.75rem",
          }}
        >
          Find the station QR code at your target location
        </p>

        {/* Next Clue / Directive Card — remains visible until next QR is decoded */}
        {nextClue ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "rgba(0, 255, 65, 0.08)",
              border: "1.5px solid var(--green-bright)",
              borderRadius: "10px",
              padding: "1.2rem 1.4rem",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              boxShadow: "0 0 24px rgba(0, 255, 65, 0.2)",
              textAlign: "left",
              maxWidth: "460px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                marginBottom: "0.5rem",
                borderBottom: "1px solid rgba(0, 255, 65, 0.25)",
                paddingBottom: "0.4rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1rem" }}>🧭</span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    color: "var(--green-bright)",
                    letterSpacing: "0.15em",
                    fontWeight: 700,
                  }}
                >
                  NEXT STATION CLUE
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                }}
              >
                TARGET #{currentIndex + 1}
              </span>
            </div>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                lineHeight: "1.6",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {nextClue}
            </p>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                marginTop: "0.6rem",
                borderTop: "1px dashed rgba(0,255,65,0.2)",
                paddingTop: "0.4rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ color: "var(--green-bright)" }}>▷</span>
              <span>Find this location and scan the station QR code below.</span>
            </div>
          </motion.div>
        ) : (
          locationHint && locationHint !== "—" && (
            <div
              style={{
                background: "rgba(0,255,65,0.05)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
                display: "inline-block",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                }}
              >
                TARGET LOCATION:{" "}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--green-bright)",
                  fontSize: "0.85rem",
                }}
              >
                {locationHint}
              </span>
            </div>
          )
        )}
      </div>

      {/* Scan button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setScannerOpen(true)}
        className="btn btn-primary"
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "0.9rem",
          padding: "0.8rem 2rem",
          letterSpacing: "0.15em",
        }}
      >
        ▷ OPEN SCANNER
      </motion.button>

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ width: "100%", maxWidth: "440px" }}
          >
            <QRScanner
              onScan={(data) => {
                setScannerOpen(false);
                onScan(data);
              }}
              onClose={() => setScannerOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
