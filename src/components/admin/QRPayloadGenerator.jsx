"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import QRCode from "qrcode";

function QRCard({ checkpoint }) {
  const canvasRef = useRef(null);

  const payload = `NEXUSHUNT:${checkpoint.id}:${checkpoint.secretToken}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, payload, {
      width: 220,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [payload]);

  function downloadPNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr_${checkpoint.name.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="qr-card"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: "0 0 12px rgba(0,255,65,0.1)",
      }}
    >
      {/* QR canvas — white bg for scanning */}
      <div
        style={{
          background: "#fff",
          borderRadius: "6px",
          padding: "8px",
          display: "inline-block",
          boxShadow: "0 0 16px rgba(0,255,65,0.3)",
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Info */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.9rem",
            color: "var(--green-bright)",
            letterSpacing: "0.05em",
          }}
        >
          {checkpoint.name}
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
          {checkpoint.building}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--green-dim)",
            marginTop: "0.4rem",
            wordBreak: "break-all",
          }}
        >
          {payload}
        </p>
      </div>

      {/* Download button */}
      <button
        onClick={downloadPNG}
        className="btn btn-primary no-print"
        style={{ fontSize: "0.7rem", padding: "0.4rem 1rem" }}
      >
        ↓ DOWNLOAD PNG
      </button>
    </motion.div>
  );
}

export default function QRPayloadGenerator() {
  const { checkpoints, loading } = useCheckpoints();

  function handlePrintAll() {
    window.print();
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
        LOADING CHECKPOINTS...
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
          border: "1px dashed var(--border)",
          borderRadius: "8px",
        }}
      >
        No checkpoints configured. Add checkpoints first.
      </div>
    );
  }

  return (
    <div>
      {/* Header + Print all */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--green-bright)",
              fontSize: "1.2rem",
              letterSpacing: "0.08em",
            }}
          >
            QR PAYLOAD GENERATOR
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.2rem",
            }}
          >
            {checkpoints.length} QR codes ready for printing
          </p>
        </div>
        <button
          onClick={handlePrintAll}
          className="btn btn-primary no-print"
          style={{ fontSize: "0.75rem" }}
        >
          ⎙ PRINT ALL
        </button>
      </div>

      {/* QR grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {checkpoints.map((cp) => (
          <QRCard key={cp.id} checkpoint={cp} />
        ))}
      </div>
    </div>
  );
}
