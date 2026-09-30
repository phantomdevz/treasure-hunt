"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { sha256 } from "@/lib/crypto";
import { teamLogin } from "@/lib/firebase";
import { getMissionPackFromFirestore } from "@/lib/firebase";
import { saveMissionPack as savePackDexie, saveTeamSession } from "@/lib/db";

export default function LoginForm({ onLogin }) {
  const [teamName, setTeamName] = useState("");
  const [pin, setPin]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teamName.trim() || pin.length !== 4) return;
    setLoading(true);
    setError(null);

    try {
      const pinHash = await sha256(pin.trim());
      const team = await teamLogin(teamName.trim(), pinHash);
      if (!team) {
        setError("Invalid team name or PIN. Check your credentials.");
        setLoading(false);
        return;
      }

      const pack = await getMissionPackFromFirestore(team.id);
      if (!pack) {
        setError("Mission pack not found. Contact admin.");
        setLoading(false);
        return;
      }
      await savePackDexie({ teamId: team.id, ...pack });
      await saveTeamSession({ teamId: team.id, ...team });
      onLogin(team);
    } catch (err) {
      setError(err.message || "Login failed. Check your network connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ maxWidth: "420px", margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
          <span style={{
            display: "inline-block",
            width: "2px",
            height: "20px",
            background: "linear-gradient(180deg, var(--red) 0%, var(--blue) 100%)",
            transform: "rotate(-10deg)",
            borderRadius: "1px",
          }} />
          <span className="section-label">Route:404</span>
        </div>

        <h1
          className="glitch"
          data-text="Enter the Hunt"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            color: "var(--silver)",
            letterSpacing: "-0.01em",
            marginBottom: "0.5rem",
          }}
        >
          Enter the Hunt
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-muted)" }}>
          Enter your team credentials to begin
        </p>
      </div>

      {/* Form card — shared base, fully legible */}
      <div className="card" style={{ padding: "1.75rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label htmlFor="team-name">Team name</label>
            <input
              id="team-name"
              className="input"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Your team name"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="team-pin">4-digit PIN</label>
            <input
              id="team-pin"
              className="input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              required
              style={{ letterSpacing: pin ? "0.3em" : undefined }}
            />
          </div>

          {/* PIN dots indicator */}
          <div style={{ display: "flex", gap: "6px", paddingLeft: "2px" }}>
            {[0,1,2,3].map((i) => (
              <span
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: i < pin.length ? "var(--blue)" : "var(--border-bright)",
                  transition: "background 0.15s ease",
                }}
              />
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(232, 52, 42, 0.08)",
                border: "1px solid rgba(232, 52, 42, 0.28)",
                borderRadius: "var(--radius)",
                padding: "0.65rem 0.875rem",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--red-tint)",
                lineHeight: 1.5,
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !teamName.trim() || pin.length !== 4}
            className="btn btn-blue"
            style={{ marginTop: "0.25rem", padding: "0.75rem" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="spinner" style={{ borderTopColor: "var(--silver)" }} />
                Authenticating
              </span>
            ) : (
              "Begin Hunt"
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
