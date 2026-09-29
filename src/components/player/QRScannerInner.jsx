"use client";
import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScannerInner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const domId = "qr-scanner-container";

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      domId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {});
        scannerRef.current = null;
        onScan(decodedText);
      },
      (err) => {
        // ignore scan errors (user moving camera etc.)
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid var(--border-bright)",
        boxShadow: "0 0 30px rgba(0,255,65,0.3)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.8rem",
            color: "var(--green-bright)",
            letterSpacing: "0.1em",
          }}
        >
          ▷ SCANNING FOR QR CODE
        </span>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
        >
          ✕ CANCEL
        </button>
      </div>

      {/* Scanner viewport */}
      <div
        style={{
          padding: "1rem",
          background: "#000",
        }}
      >
        {/* Override html5-qrcode default styles */}
        <style>{`
          #${domId} video { border-radius: 6px; border: 2px solid rgba(0,255,65,0.4) !important; }
          #${domId} img  { filter: invert(1) sepia(1) saturate(4) hue-rotate(85deg); }
          #${domId} button {
            background: transparent !important;
            color: var(--green-bright) !important;
            border: 1px solid var(--border) !important;
            border-radius: 4px !important;
            font-family: var(--font-display) !important;
            font-size: 0.7rem !important;
            letter-spacing: 0.08em !important;
            padding: 0.3rem 0.7rem !important;
            cursor: pointer !important;
          }
          #${domId} button:hover { background: rgba(0,255,65,0.1) !important; }
          #${domId} select {
            background: var(--bg-tertiary) !important;
            color: var(--green-bright) !important;
            border: 1px solid var(--border) !important;
            border-radius: 4px !important;
            font-family: var(--font-mono) !important;
          }
          #${domId} span { color: var(--text-muted) !important; font-size: 0.75rem !important; }
        `}</style>
        <div id={domId} />
      </div>
    </div>
  );
}
