"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { motion } from "framer-motion";

export default function NavBar() {
  const pathname = usePathname();
  const { isOnline, isManualOffline, toggleManualOffline } = useNetworkStatus();

  const isAdmin  = pathname?.startsWith("/admin");
  const isPlayer = pathname?.startsWith("/player");

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: "fixed",
        top: "28px",
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        height: "44px",
        background: "rgba(10, 11, 13, 0.92)",
        borderBottom: "1px solid rgba(138, 143, 152, 0.14)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Wordmark */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Tick-mark motif beside logo */}
        <span style={{
          display: "inline-block",
          width: "2px",
          height: "18px",
          background: "linear-gradient(180deg, var(--red) 0%, var(--blue) 100%)",
          transform: "rotate(-10deg)",
          borderRadius: "1px",
          flexShrink: 0,
        }} />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--silver)",
            letterSpacing: "0.06em",
          }}
        >
          ROUTE<span style={{ color: "var(--steel)", fontWeight: 400 }}>:404</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <NavLink href="/player" active={isPlayer} label="Player" />
        <NavLink href="/admin"  active={isAdmin}  label="Admin" />

        {/* Network status indicator */}
        <button
          onClick={toggleManualOffline}
          style={{
            marginLeft: "8px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "var(--radius)",
            background: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: isManualOffline || !isOnline ? "var(--red-tint)" : "var(--text-muted)",
            letterSpacing: "0.08em",
            transition: "all 0.2s ease",
          }}
          title="Toggle offline simulation"
        >
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isManualOffline || !isOnline ? "var(--red)" : "var(--accent-success)",
            flexShrink: 0,
          }} />
          {isManualOffline ? "OFFLINE" : isOnline ? "ONLINE" : "OFFLINE"}
        </button>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, active, label }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--silver)" : "var(--text-muted)",
        textDecoration: "none",
        padding: "5px 12px",
        borderRadius: "var(--radius)",
        background: active ? "rgba(232, 234, 237, 0.06)" : "transparent",
        border: active ? "1px solid rgba(138,143,152,0.2)" : "1px solid transparent",
        transition: "all 0.2s ease",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </Link>
  );
}
