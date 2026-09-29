"use client";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { subscribeTeams } from "@/lib/firebase";
import Link from "next/link";

function StatCard({ label, value, sub, href, accent = "silver" }) {
  const accentColor = {
    red:   "var(--red-tint)",
    blue:  "var(--blue-tint)",
    green: "#3ECFA4",
    silver: "var(--silver)",
  }[accent] || "var(--silver)";

  const card = (
    <motion.div
      whileHover={{ y: -2, borderColor: "var(--border-bright)" }}
      style={{
        background: "var(--graphite)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem 1.5rem",
        cursor: href ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
    >
      {/* Tick mark decoration */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.875rem" }}>
        <span style={{
          display: "inline-block",
          width: "2px",
          height: "10px",
          background: accentColor,
          transform: "rotate(-10deg)",
          borderRadius: "1px",
          opacity: 0.7,
        }} />
        <span className="section-label">{label}</span>
      </div>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "40px",
          fontWeight: 700,
          color: accentColor,
          lineHeight: 1,
          marginBottom: "0.4rem",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>

      {sub && (
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "var(--text-muted)",
          marginTop: "0.3rem",
        }}>
          {sub}
        </p>
      )}
    </motion.div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>{card}</Link>
  ) : card;
}

function QuickAction({ href, label, accent = "secondary" }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`btn btn-${accent}`}
        style={{ fontSize: "13px" }}
      >
        {label}
      </motion.button>
    </Link>
  );
}

export default function DashboardOverview() {
  const { checkpoints, loading: cpLoading } = useCheckpoints();
  const [teams, setTeams]   = useState([]);
  const [tLoading, setTL]   = useState(true);

  useEffect(() => {
    const unsub = subscribeTeams((t) => { setTeams(t); setTL(false); });
    return unsub;
  }, []);

  const completedTeams = teams.filter((t) => t.completedAt).length;
  const activeTeams    = teams.filter((t) => !t.completedAt && t.currentCheckpointIndex > 0).length;

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
          <span style={{
            display: "inline-block",
            width: "2px",
            height: "20px",
            background: "var(--red)",
            transform: "rotate(-10deg)",
            borderRadius: "1px",
          }} />
          <span className="section-label">Nexushunt</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "32px",
            fontWeight: 700,
            color: "var(--silver)",
            letterSpacing: "-0.01em",
            marginBottom: "0.3rem",
          }}
        >
          Command Center
        </motion.h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-muted)" }}>
          Real-time overview of the hunt
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <StatCard
          label="Checkpoints"
          value={cpLoading ? "—" : checkpoints.length}
          sub="Stations configured"
          href="/admin/dashboard/checkpoints"
          accent="blue"
        />
        <StatCard
          label="Teams"
          value={tLoading ? "—" : teams.length}
          sub="Registered"
          href="/admin/dashboard/register"
          accent="silver"
        />
        <StatCard
          label="Active"
          value={tLoading ? "—" : activeTeams}
          sub="Currently hunting"
          href="/admin/dashboard/radar"
          accent="red"
        />
        <StatCard
          label="Finished"
          value={tLoading ? "—" : completedTeams}
          sub="All checkpoints done"
          accent="green"
        />
      </div>

      {/* Divider with tick motif */}
      <hr className="tick-rule" />

      {/* Quick actions */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="section-label" style={{ marginBottom: "1rem" }}>Quick actions</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <QuickAction href="/admin/dashboard/checkpoints" label="Manage checkpoints" accent="secondary" />
          <QuickAction href="/admin/dashboard/register"    label="Register team"       accent="secondary" />
          <QuickAction href="/admin/dashboard/radar"       label="Open radar"          accent="secondary" />
          <QuickAction href="/admin/dashboard/qr-generator" label="Generate QR codes"  accent="secondary" />
        </div>
      </div>

      {/* Teams table — shared base, fully legible */}
      {teams.length > 0 && (
        <div>
          <p className="section-label" style={{ marginBottom: "1rem" }}>Registered teams</p>
          <div
            style={{
              background: "var(--graphite)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
                <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Team name</th>
                    <th>Leader</th>
                    <th>Route #</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Finished at</th>
                  </tr>
                </thead>
                <tbody>
                  {teams
                    .slice()
                    .sort((a, b) => {
                      const af = a.completedAt ? (typeof a.completedAt === "number" ? a.completedAt : a.completedAt?.toMillis?.() ?? Infinity) : Infinity;
                      const bf = b.completedAt ? (typeof b.completedAt === "number" ? b.completedAt : b.completedAt?.toMillis?.() ?? Infinity) : Infinity;
                      if (af !== bf) return af - bf;
                      return b.currentCheckpointIndex - a.currentCheckpointIndex;
                    })
                    .map((t, rank) => {
                      const finishTs = t.completedAt
                        ? (typeof t.completedAt === "number" ? t.completedAt : t.completedAt?.toMillis?.() ?? null)
                        : null;
                      return (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 500, color: "var(--silver)" }}>
                            {rank === 0 && t.completedAt ? "🥇 " : rank === 1 && t.completedAt ? "🥈 " : rank === 2 && t.completedAt ? "🥉 " : ""}
                            {t.name}
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>{t.leaderName}</td>
                          <td>
                            <span className="badge badge-steel">#{t.routeIndex ?? "—"}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div className="progress-track" style={{ width: "80px" }}>
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: checkpoints.length
                                      ? `${(t.currentCheckpointIndex / checkpoints.length) * 100}%`
                                      : "0%",
                                  }}
                                />
                              </div>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                                {t.currentCheckpointIndex}/{checkpoints.length}
                              </span>
                            </div>
                          </td>
                          <td>
                            {t.completedAt ? (
                              <span className="badge badge-green">Done</span>
                            ) : t.currentCheckpointIndex > 0 ? (
                              <span className="badge badge-blue">Active</span>
                            ) : (
                              <span className="badge badge-steel">Waiting</span>
                            )}
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                            {finishTs
                              ? new Date(finishTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!tLoading && teams.length === 0 && (
        <div
          style={{
            background: "var(--graphite)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
            No teams registered yet
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            Register the first team to get the hunt started.
          </p>
          <Link href="/admin/dashboard/register">
            <button className="btn btn-primary" style={{ fontSize: "13px" }}>Register a team</button>
          </Link>
        </div>
      )}
    </div>
  );
}
