"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminSignIn, adminSignOut, onAdminAuthChange, hasFirebaseConfig } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPass]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAdminAuthChange((user) => {
      if (user) router.replace("/admin/dashboard");
      setChecking(false);
    });
    return unsub;
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!hasFirebaseConfig) {
      setError("Firebase credentials not configured. Fill in .env.local and restart the server.");
      setLoading(false);
      return;
    }

    try {
      await adminSignIn(email, password);
      router.replace("/admin/dashboard");
    } catch (err) {
      if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.");
      } else if (["auth/user-not-found","auth/wrong-password","auth/invalid-credential"].includes(err.code)) {
        setError("Invalid credentials. Verify the user exists in Firebase Console → Authentication → Users.");
      } else if (err.code === "auth/api-key-not-valid" || err.message?.includes("api-key-not-valid")) {
        setError("Invalid API key. Restart the dev server (Ctrl+C, npm run dev) to reload .env.local.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: "12px" }}>
        <span className="spinner" />
        <span className="section-label">Verifying access</span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
      }}
    >
      {/* Ambient background — red accent (admin = forward time) */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 60% 30%, rgba(232, 52, 42, 0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: "100%", maxWidth: "400px", position: "relative" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          {/* Tick mark motif */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
            <span style={{
              display: "inline-block",
              width: "2px",
              height: "20px",
              background: "var(--red)",
              transform: "rotate(-10deg)",
              borderRadius: "1px",
            }} />
            <span className="section-label">Command access</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              fontWeight: 700,
              color: "var(--silver)",
              letterSpacing: "-0.01em",
              marginBottom: "0.3rem",
            }}
          >
            Admin Access
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-muted)" }}>
            Sign in to the command center
          </p>
        </div>

        {/* Config warning */}
        {!hasFirebaseConfig && (
          <div
            style={{
              background: "rgba(232, 160, 42, 0.08)",
              border: "1px solid rgba(232, 160, 42, 0.28)",
              borderRadius: "var(--radius)",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: "var(--accent-warn)", fontSize: "13px", flexShrink: 0 }}>⚠</span>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-warn)", fontWeight: 500, marginBottom: "2px" }}>
                Firebase not configured
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-muted)" }}>
                Add credentials to <code style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>.env.local</code> and restart the server.
              </p>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
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
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: "0.25rem", padding: "0.75rem" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="spinner" style={{ borderTopColor: "var(--silver)" }} />
                  Signing in
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
