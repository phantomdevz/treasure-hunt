"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import { sha256, encrypt } from "@/lib/crypto";
import { assignRoute, nextTeamIndex } from "@/lib/routing";
import { createTeam, getTeams, saveMissionPack } from "@/lib/firebase";

export default function TeamRegistrationForm() {
  const { checkpoints, loading: cpLoading } = useCheckpoints();
  const [form, setForm]       = useState({ name: "", leaderName: "", pin: "" });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const N = checkpoints.length;

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.leaderName.trim() || form.pin.length !== 4) return;
    if (N === 0) { setError("No checkpoints configured. Add checkpoints first."); return; }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Fetch existing teams to calculate routeIndex
      const existingTeams = await getTeams();
      const routeIndex = nextTeamIndex(existingTeams.length, N);

      // Hash PIN
      const pinHash = await sha256(form.pin.trim());

      // Build team ID from name slug
      const teamId = `team_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      // Assign route via Latin Square
      const route = assignRoute(routeIndex, checkpoints);

      // Build mission pack
      const riddles = [];

      for (let i = 0; i < route.length; i++) {
        const cp = checkpoints.find((c) => c.id === route[i]);
        if (!cp) continue;

        const entry = {
          index: i,
          checkpointId: cp.id,
          secretToken: cp.secretToken || "",
          answerHashHex: cp.answerHashHex || "",
          plaintextRiddle: cp.riddleText || "",
          plaintextHints: cp.hints || [],
          nextDestLabelPlaintext: cp.nextDestinationLabel || "",
        };

        riddles.push(entry);
      }

      // Save team
      await createTeam({
        id: teamId,
        name: form.name.trim(),
        leaderName: form.leaderName.trim(),
        pinHash,
        routeIndex,
        currentCheckpointIndex: 0,
      });

      // Save mission pack
      await saveMissionPack(teamId, { teamId, route, riddles });

      setSuccess({
        teamId,
        teamName: form.name.trim(),
        routeIndex,
        route: route.map((id) => checkpoints.find((c) => c.id === id)?.name || id),
      });
      setForm({ name: "", leaderName: "", pin: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--green-bright)",
          fontSize: "1.2rem",
          letterSpacing: "0.08em",
          marginBottom: "0.5rem",
        }}
      >
        TEAM REGISTRATION
      </h2>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginBottom: "1.5rem",
        }}
      >
        {cpLoading
          ? "Loading checkpoints..."
          : N === 0
          ? "⚠ No checkpoints configured"
          : `${N} checkpoints — registering as Team #${0} will start at: ${checkpoints[0]?.name}`}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>TEAM NAME</label>
            <input className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Team Alpha" required />
          </div>
          <div>
            <label style={labelStyle}>LEADER NAME</label>
            <input className="input" value={form.leaderName} onChange={(e) => setField("leaderName", e.target.value)} placeholder="Leader's full name" required />
          </div>
          <div>
            <label style={labelStyle}>4-DIGIT PIN</label>
            <input
              className="input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={form.pin}
              onChange={(e) => setField("pin", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              required
            />
          </div>

          {error && (
            <div style={errorStyle}>✗ {error}</div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={saving || N === 0}
            className="btn btn-primary"
          >
            {saving ? "REGISTERING..." : "▷ REGISTER TEAM"}
          </motion.button>
        </form>

        {/* Success / route preview */}
        {success && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: "rgba(0,255,65,0.05)",
              border: "1px solid var(--border-bright)",
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                marginBottom: "0.75rem",
              }}
            >
              ✓ TEAM REGISTERED
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                color: "var(--green-bright)",
                marginBottom: "0.5rem",
              }}
            >
              {success.teamName}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Route Index: {success.routeIndex}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.65rem",
                color: "var(--text-muted)",
                letterSpacing: "0.12em",
                marginBottom: "0.5rem",
              }}
            >
              ASSIGNED ROUTE:
            </p>
            <ol style={{ paddingLeft: "1rem" }}>
              {success.route.map((name, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    padding: "0.1rem 0",
                  }}
                >
                  {i + 1}. {name}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontSize: "0.6rem",
  color: "var(--text-muted)",
  letterSpacing: "0.15em",
  marginBottom: "0.4rem",
};

const errorStyle = {
  background: "rgba(255,32,32,0.08)",
  border: "1px solid rgba(255,32,32,0.3)",
  borderRadius: "6px",
  padding: "0.6rem 0.8rem",
  fontFamily: "var(--font-mono)",
  fontSize: "0.8rem",
  color: "var(--accent-error)",
};
