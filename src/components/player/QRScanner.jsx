"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// html5-qrcode accesses window/navigator — must be client-only
const QRScannerInner = dynamic(() => import("./QRScannerInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "300px",
        color: "var(--green-dim)",
        fontFamily: "var(--font-display)",
        fontSize: "0.8rem",
        letterSpacing: "0.1em",
      }}
    >
      INITIALISING SCANNER...
    </div>
  ),
});

export default function QRScanner({ onScan, onClose }) {
  return <QRScannerInner onScan={onScan} onClose={onClose} />;
}
