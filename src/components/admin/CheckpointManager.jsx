"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import { deleteCheckpoint } from "@/lib/firebase";
import CheckpointForm from "./CheckpointForm";

export default function CheckpointManager() {
  const { checkpoints, loading } = useCheckpoints();
  const [editing, setEditing]   = useState(null); // null | "new" | checkpoint
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(id) {
    if (deleting !== id) { setDeleting(id); return; }
    await deleteCheckpoint(id);
    setDeleting(null);
  }

  return (
    <div>
      {/* Header */}
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
            CHECKPOINT MANAGER
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.2rem",
            }}
          >
            {loading
              ? "Loading..."
              : `${checkpoints.length} checkpoint${checkpoints.length !== 1 ? "s" : ""} — Latin Square supports up to ${checkpoints.length} teams`}
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="btn btn-primary"
          style={{ fontSize: "0.75rem" }}
        >
          + NEW CHECKPOINT
        </button>
      </div>

      {/* Checkpoint list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
          LOADING...
        </div>
      ) : checkpoints.length === 0 ? (
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
          No checkpoints yet. Click "NEW CHECKPOINT" to get started.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <AnimatePresence>
            {checkpoints.map((cp, idx) => (
              <motion.div
                key={cp.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1rem 1.25rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                {/* Order badge */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(0,255,65,0.1)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.75rem",
                    color: "var(--green-bright)",
                    flexShrink: 0,
                  }}
                >
                  {cp.order}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.9rem",
                        color: "var(--text-primary)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {cp.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      • {cp.building}
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "0.3rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "400px",
                    }}
                  >
                    {cp.riddleText}
                  </p>

                  {/* Token */}
                  <div
                    style={{
                      marginTop: "0.4rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--green-dim)",
                    }}
                  >
                    TOKEN: {cp.secretToken}
                  </div>

                  {/* Hints count */}
                  {cp.hints?.length > 0 && (
                    <span className="badge badge-amber" style={{ marginTop: "0.4rem" }}>
                      {cp.hints.length} HINT{cp.hints.length > 1 ? "S" : ""}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button
                    onClick={() => setEditing(cp)}
                    className="btn btn-ghost"
                    style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(cp.id)}
                    className={deleting === cp.id ? "btn btn-danger" : "btn btn-ghost"}
                    style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
                  >
                    {deleting === cp.id ? "CONFIRM" : "DEL"}
                  </button>
                  {deleting === cp.id && (
                    <button
                      onClick={() => setDeleting(null)}
                      className="btn btn-ghost"
                      style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form modal */}
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
