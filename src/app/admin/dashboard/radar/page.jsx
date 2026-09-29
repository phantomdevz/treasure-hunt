"use client";
import CampusRadar from "@/components/admin/CampusRadar";

export default function RadarPage() {
  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
          <span style={{
            display: "inline-block",
            width: "2px",
            height: "20px",
            background: "var(--red)",
            transform: "rotate(-10deg)",
            borderRadius: "1px",
          }} />
          <span className="section-label">NexusHunt</span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--silver)",
          letterSpacing: "-0.01em",
          marginBottom: "0.3rem",
        }}>
          Campus Radar
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-muted)" }}>
          Live team positions · route breakdown · real-time completion timestamps
        </p>
      </div>

      <CampusRadar />
    </div>
  );
}
