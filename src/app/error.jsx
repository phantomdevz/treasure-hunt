"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[Route:404 Error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "var(--bg-secondary, #1C1F24)",
          border: "1px solid rgba(232, 52, 42, 0.4)",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "460px",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "2.5rem", marginBottom: "1rem", display: "inline-block" }}>⚠️</span>
        <h2
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.4rem",
            color: "var(--red-tint, #F4776E)",
            marginBottom: "0.75rem",
          }}
        >
          Something Went Wrong
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.85rem",
            color: "var(--steel, #8A8F98)",
            marginBottom: "1.5rem",
            wordBreak: "break-word",
          }}
        >
          {error?.message || "An unexpected error occurred while loading the hunt."}
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
          >
            ▷ Try Again
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                indexedDB.deleteDatabase("Route404DB");
                window.location.href = "/player";
              }
            }}
            className="btn btn-ghost"
            style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
          >
            Reset Session
          </button>
        </div>
      </div>
    </div>
  );
}
