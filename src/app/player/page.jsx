"use client";
import React, { Component, useState, useEffect } from "react";
import LoginForm from "@/components/player/LoginForm";
import GameStateMachine from "@/components/player/GameStateMachine";
import { getActiveSession, clearTeamSession } from "@/lib/db";
import { useOfflineSync } from "@/hooks/useOfflineSync";

class PlayerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[NexusHunt] Player Page Component Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: "460px",
          margin: "3rem auto",
          padding: "2rem",
          background: "var(--graphite, #1C1F24)",
          border: "1px solid rgba(232, 52, 42, 0.4)",
          borderRadius: "10px",
          textAlign: "center",
        }}>
          <span style={{ fontSize: "2.5rem", display: "inline-block", marginBottom: "0.75rem" }}>⚠️</span>
          <h2 style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.2rem",
            color: "var(--red-tint, #F4776E)",
            marginBottom: "0.5rem",
          }}>
            Display Error on Mobile
          </h2>
          <p style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.8rem",
            color: "var(--steel, #8A8F98)",
            marginBottom: "1.5rem",
            wordBreak: "break-word",
          }}>
            {this.state.error?.message || String(this.state.error)}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn btn-primary"
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            >
              ▷ Retry
            </button>
            <button
              onClick={async () => {
                try {
                  indexedDB.deleteDatabase("NexusHuntDB");
                } catch {}
                window.location.reload();
              }}
              className="btn btn-ghost"
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            >
              Reset All Data
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PlayerPage() {
  const [team, setTeam]       = useState(null);
  const [loading, setLoading] = useState(true);

  useOfflineSync();

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout: if IndexedDB doesn't respond in 2.5s on mobile, unblock loading
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2500);

    getActiveSession()
      .then((session) => {
        if (!isMounted) return;
        clearTimeout(timer);
        if (session) setTeam(session);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        clearTimeout(timer);
        console.warn("[NexusHunt] Could not load offline session:", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  async function handleLogout() {
    const tid = team?.id || team?.teamId;
    if (tid) await clearTeamSession(tid);
    setTeam(null);
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        gap: "12px",
      }}>
        <span className="spinner" />
        <span className="section-label">Loading</span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        padding: "2rem 1rem",
        position: "relative",
      }}
    >
      {/* Ambient blue glow for player side */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at 40% 30%, rgba(46, 94, 255, 0.05) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <PlayerErrorBoundary>
          {/* Active session header */}
          {team && (
            <div
              style={{
                maxWidth: "560px",
                margin: "0 auto 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1.25rem",
                background: "var(--graphite)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <span style={{
                    display: "inline-block",
                    width: "2px",
                    height: "12px",
                    background: "var(--blue)",
                    transform: "rotate(-10deg)",
                    borderRadius: "1px",
                  }} />
                  <span className="section-label">Active session</span>
                </div>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--silver)",
                }}>
                  {team.name || team.teamId}
                </p>
                {team.leaderName && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-muted)" }}>
                    Led by {team.leaderName}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ fontSize: "12px", padding: "0.4rem 0.875rem" }}
              >
                Exit
              </button>
            </div>
          )}

          {/* Main content */}
          {team ? (
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>
              <GameStateMachine team={team} />
            </div>
          ) : (
            <LoginForm onLogin={setTeam} />
          )}
        </PlayerErrorBoundary>
      </div>
    </div>
  );
}
