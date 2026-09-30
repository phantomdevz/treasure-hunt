"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import { deleteCheckpoint } from "@/lib/firebase";
import CheckpointForm from "./CheckpointForm";
import QRCode from "qrcode";

function QRCard({
  checkpoint,
  onEdit,
  onDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
}) {
  const canvasRef = useRef(null);

  const payload = `ROUTE404:${checkpoint.id}:${checkpoint.secretToken}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, payload, {
      width: 200,
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
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
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
        position: "relative",
      }}
    >
      {/* Order badge */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(0,255,65,0.1)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          color: "var(--green-bright)",
        }}
      >
        {checkpoint.order ?? 1}
      </div>

      {/* QR canvas — white bg for high contrast scanning */}
      <div
        style={{
          background: "#fff",
          borderRadius: "6px",
          padding: "6px",
          display: "inline-block",
          boxShadow: "0 0 16px rgba(0,255,65,0.3)",
          marginTop: "0.5rem",
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Info & Riddle Preview */}
      <div style={{ textAlign: "center", width: "100%" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            color: "var(--green-bright)",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          {checkpoint.name}
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: "0.15rem",
          }}
        >
          📍 {checkpoint.building}
        </p>

        {/* Riddle text preview */}
        {checkpoint.riddleText && (
          <div
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "0.6rem 0.75rem",
              marginTop: "0.6rem",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: "0.2rem",
              }}
            >
              RIDDLE:
            </span>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                lineHeight: "1.4",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                margin: 0,
              }}
            >
              {checkpoint.riddleText}
            </p>
          </div>
        )}

        {/* Next destination label preview */}
        {checkpoint.nextDestinationLabel && (
          <div
            style={{
              marginTop: "0.4rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--green-bright)",
              textAlign: "left",
              background: "rgba(0,255,65,0.04)",
              border: "1px dashed rgba(0,255,65,0.25)",
              borderRadius: "4px",
              padding: "0.3rem 0.5rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>NEXT CLUE: </span>
            {checkpoint.nextDestinationLabel}
          </div>
        )}

        {/* Hints badge */}
        {checkpoint.hints?.filter(Boolean).length > 0 && (
          <div style={{ marginTop: "0.4rem", textAlign: "left" }}>
            <span className="badge badge-amber" style={{ fontSize: "0.6rem" }}>
              {checkpoint.hints.filter(Boolean).length} HINT
              {checkpoint.hints.filter(Boolean).length > 1 ? "S" : ""}
            </span>
          </div>
        )}

        {/* Payload snippet */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--green-dim)",
            marginTop: "0.5rem",
            wordBreak: "break-all",
          }}
        >
          {payload}
        </p>
      </div>

      {/* Action buttons (hidden when printing) */}
      <div
        className="no-print"
        style={{
          display: "flex",
          gap: "0.5rem",
          width: "100%",
          marginTop: "0.25rem",
        }}
      >
        <button
          onClick={downloadPNG}
          className="btn btn-primary"
          style={{
            flex: 1,
            fontSize: "0.68rem",
            padding: "0.4rem 0.5rem",
            justifyContent: "center",
          }}
        >
          ↓ PNG
        </button>
        <button
          onClick={() => onEdit(checkpoint)}
          className="btn btn-ghost"
          style={{
            fontSize: "0.68rem",
            padding: "0.4rem 0.65rem",
            border: "1px solid var(--border-bright)",
          }}
          title="Edit riddle, hints, answer and QR settings"
        >
          ✏ EDIT
        </button>
        {isDeleting ? (
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              onClick={() => onConfirmDelete(checkpoint.id)}
              className="btn btn-danger"
              style={{ fontSize: "0.68rem", padding: "0.4rem 0.5rem" }}
            >
              CONFIRM
            </button>
            <button
              onClick={onCancelDelete}
              className="btn btn-ghost"
              style={{ fontSize: "0.68rem", padding: "0.4rem 0.4rem" }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => onDelete(checkpoint.id)}
            className="btn btn-ghost"
            style={{
              fontSize: "0.68rem",
              padding: "0.4rem 0.5rem",
              color: "var(--accent-error)",
            }}
            title="Delete this checkpoint and QR code"
          >
            🗑
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function QRPayloadGenerator() {
  const { checkpoints, loading } = useCheckpoints();
  const [editing, setEditing] = useState(null); // null | "new" | checkpoint
  const [deletingId, setDeletingId] = useState(null);

  function handlePrintAll() {
    window.print();
  }

  async function handleConfirmDelete(id) {
    try {
      await deleteCheckpoint(id);
      setDeletingId(null);
    } catch (err) {
      alert("Failed to delete checkpoint: " + (err.message || "Unknown error"));
    }
  }

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
        }}
      >
        LOADING CHECKPOINTS...
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
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
          <button
            onClick={() => setEditing("new")}
            className="btn btn-primary no-print"
            style={{ fontSize: "0.75rem" }}
          >
            + NEW QR CODE
          </button>
        </div>
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
          No checkpoints configured yet. Click "+ NEW QR CODE" to create one.
        </div>

        {/* Modal form */}
        {editing !== null && (
          <CheckpointForm
            checkpoint={editing === "new" ? null : editing}
            checkpointCount={checkpoints.length}
            onClose={() => setEditing(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header + Actions */}
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
            {checkpoints.length} QR code{checkpoints.length !== 1 ? "s" : ""}{" "}
            ready for printing, editing, and deployment
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => setEditing("new")}
            className="btn btn-ghost no-print"
            style={{ fontSize: "0.75rem", border: "1px solid var(--border-bright)" }}
          >
            + NEW QR CODE
          </button>
          <button
            onClick={handlePrintAll}
            className="btn btn-primary no-print"
            style={{ fontSize: "0.75rem" }}
          >
            ⎙ PRINT ALL
          </button>
        </div>
      </div>

      {/* QR grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <AnimatePresence>
          {checkpoints.map((cp) => (
            <QRCard
              key={cp.id}
              checkpoint={cp}
              onEdit={(checkpoint) => setEditing(checkpoint)}
              onDelete={(id) => setDeletingId(id)}
              isDeleting={deletingId === cp.id}
              onConfirmDelete={handleConfirmDelete}
              onCancelDelete={() => setDeletingId(null)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Checkpoint / Riddle Form Modal */}
      {editing !== null && (
        <CheckpointForm
          checkpoint={editing === "new" ? null : editing}
          checkpointCount={checkpoints.length}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
