"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { sha256, generateSecretToken } from "@/lib/crypto";
import { createCheckpoint, updateCheckpoint } from "@/lib/firebase";

const emptyForm = {
  name: "",
  building: "",
  order: 1,
  riddleText: "",
  hints: ["", "", ""],
  answer: "",
  nextDestinationLabel: "",
};

export default function CheckpointForm({ checkpoint, checkpointCount, onClose }) {
  const isNew = !checkpoint;
  const [form, setForm]     = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [token, setToken]   = useState("");

  useEffect(() => {
    if (checkpoint) {
      setForm({
        name:                 checkpoint.name || "",
        building:             checkpoint.building || "",
        order:                checkpoint.order ?? 1,
        riddleText:           checkpoint.riddleText || "",
        hints:                checkpoint.hints?.length
          ? [...checkpoint.hints, "", "", ""].slice(0, 3)
          : ["", "", ""],
        answer:               "", // never pre-filled
        nextDestinationLabel: checkpoint.nextDestinationLabel || "",
      });
      setToken(checkpoint.secretToken || "");
    } else {
      setForm({ ...emptyForm, order: checkpointCount + 1 });
      setToken(generateSecretToken());
    }
  }, [checkpoint, checkpointCount]);

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setHint(i, val) {
    const hints = [...form.hints];
    hints[i] = val;
    setForm((f) => ({ ...f, hints }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.riddleText || (!checkpoint && !form.answer)) {
      setError("Name, riddle text, and answer are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Hash the answer — never store raw
      let answerHashHex = checkpoint?.answerHashHex;
      if (form.answer.trim()) {
        answerHashHex = await sha256(form.answer.trim().toLowerCase());
      }

      const data = {
        name:                 form.name.trim(),
        building:             form.building.trim(),
        order:                Number(form.order),
        riddleText:           form.riddleText.trim(),
        hints:                form.hints.map((h) => h.trim()).filter(Boolean),
        answerHashHex,
        secretToken:          token,
        nextDestinationLabel: form.nextDestinationLabel.trim(),
      };

      if (isNew) {
        await createCheckpoint(data);
      } else {
        await updateCheckpoint(checkpoint.id, data);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="modal-panel"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--green-bright)",
              letterSpacing: "0.08em",
            }}
          >
            {isNew ? "NEW CHECKPOINT" : `EDIT: ${checkpoint.name}`}
          </h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: "0.7rem" }}>
            ✕ CLOSE
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Name + Building row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="NAME" required>
              <input className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Zairza Lab" required />
            </Field>
            <Field label="BUILDING / LOCATION">
              <input className="input" value={form.building} onChange={(e) => setField("building", e.target.value)} placeholder="e.g. Block B" />
            </Field>
          </div>

          {/* Order */}
          <Field label="DISPLAY ORDER">
            <input
              className="input"
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setField("order", e.target.value)}
              style={{ width: "80px" }}
            />
          </Field>

          {/* Riddle text */}
          <Field label="RIDDLE TEXT" required>
            <textarea
              className="input"
              rows={4}
              value={form.riddleText}
              onChange={(e) => setField("riddleText", e.target.value)}
              placeholder="Write the riddle players will see at this station..."
              required
              style={{ resize: "vertical" }}
            />
          </Field>

          {/* Hints */}
          <Field label="HINTS (up to 3, optional)">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                className="input"
                value={form.hints[i]}
                onChange={(e) => setHint(i, e.target.value)}
                placeholder={`Hint ${i + 1}...`}
                style={{ marginBottom: i < 2 ? "0.4rem" : 0 }}
              />
            ))}
          </Field>

          {/* Answer */}
          <Field label={isNew ? "ANSWER (required)" : "NEW ANSWER (leave blank to keep existing)"} required={isNew}>
            <input
              className="input"
              type="password"
              value={form.answer}
              onChange={(e) => setField("answer", e.target.value)}
              placeholder={isNew ? "Correct answer..." : "Leave blank to keep current hash"}
              required={isNew}
              autoComplete="new-password"
            />
            <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.3rem", fontFamily: "var(--font-mono)" }}>
              ⚠ Answer is SHA-256 hashed before saving — never stored in plaintext.
            </p>
          </Field>

          {/* Next destination */}
          <Field label="NEXT DESTINATION LABEL">
            <input
              className="input"
              value={form.nextDestinationLabel}
              onChange={(e) => setField("nextDestinationLabel", e.target.value)}
              placeholder="e.g. Head to the Main Library..."
            />
          </Field>

          {/* Secret Token (read-only) */}
          <Field label="SECRET TOKEN (auto-generated)">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--green-dim)",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "0.6rem 0.75rem",
                wordBreak: "break-all",
              }}
            >
              {token}
            </div>
          </Field>

          {error && (
            <div
              style={{
                background: "rgba(255,32,32,0.08)",
                border: "1px solid rgba(255,32,32,0.3)",
                borderRadius: "6px",
                padding: "0.6rem 0.8rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--accent-error)",
              }}
            >
              ✗ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
              CANCEL
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {saving ? "SAVING..." : isNew ? "▷ CREATE CHECKPOINT" : "▷ SAVE CHANGES"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-display)",
          fontSize: "0.6rem",
          color: "var(--text-muted)",
          letterSpacing: "0.15em",
          marginBottom: "0.4rem",
        }}
      >
        {label}{required && <span style={{ color: "var(--accent-error)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
