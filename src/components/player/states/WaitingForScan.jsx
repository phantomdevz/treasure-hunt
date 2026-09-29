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

export default function WaitingForScan({ riddle, currentIndex, onScan }) {
  const [scannerOpen, setScannerOpen] = useState(false);

  const locationHint = riddle?.building || riddle?.nextDestLabelPlaintext || "—";

  return (
    <div
      key="waiting"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        padding: "2.5rem",
        textAlign: "center",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      <MatrixRain />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            letterSpacing: "0.15em",
            marginBottom: "0.5rem",
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
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "rgba(0,255,65,0.06)",
            border: "2px solid var(--green-bright)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "1rem auto",
            fontSize: "2.5rem",
          }}
        >
          📷
        </motion.div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            color: "var(--green-bright)",
            marginBottom: "0.5rem",
          }}
        >
          SCAN QR CODE
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginBottom: "0.5rem",
          }}
        >
          Find the QR code at your target location
        </p>

        {locationHint && locationHint !== "—" && (
          <div
            style={{
              background: "rgba(0,255,65,0.05)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              marginTop: "0.5rem",
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
