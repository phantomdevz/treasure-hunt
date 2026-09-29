"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { onAdminAuthChange, adminSignOut } from "@/lib/firebase";

const NAV_ITEMS = [
  { href: "/admin/dashboard",              label: "Overview",     icon: "◈" },
  { href: "/admin/dashboard/checkpoints",  label: "Checkpoints",  icon: "◉" },
  { href: "/admin/dashboard/register",     label: "Register Team", icon: "＋" },
  { href: "/admin/dashboard/radar",        label: "Radar",        icon: "◎" },
  { href: "/admin/dashboard/qr-generator", label: "QR Generator", icon: "⊞" },
];

export default function AdminDashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAdminAuthChange((u) => {
      if (!u) { router.replace("/admin"); return; }
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [router]);

  if (loading) {
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
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        minHeight: "calc(100vh - 72px)",
      }}
    >
      {/* Sidebar — shared base colors, no effects */}
      <aside
        style={{
          background: "var(--graphite)",
          borderRight: "1px solid var(--border)",
          padding: "0",
          position: "sticky",
          top: "72px",
          height: "calc(100vh - 72px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* User identity */}
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--border)" }}>
          {/* Tick + role label */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
            <span style={{
              display: "inline-block",
              width: "2px",
              height: "12px",
              background: "var(--red)",
              transform: "rotate(-10deg)",
              borderRadius: "1px",
            }} />
            <span className="section-label">Administrator</span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.email}
          </p>
        </div>

        {/* Nav */}
        <nav style={{ padding: "0.75rem 0", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none", display: "block" }}>
                <motion.div
                  whileHover={{ x: 3 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "0.6rem 1.25rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--silver)" : "var(--text-muted)",
                    background: active ? "rgba(232, 234, 237, 0.05)" : "transparent",
                    borderLeft: active ? "2px solid var(--red)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    letterSpacing: "0.01em",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: active ? "var(--red-tint)" : "var(--text-muted)",
                    width: "14px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </span>
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={async () => { await adminSignOut(); router.replace("/admin"); }}
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: "12px", padding: "0.5rem" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ padding: "2.5rem 2rem", background: "var(--void)" }}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
