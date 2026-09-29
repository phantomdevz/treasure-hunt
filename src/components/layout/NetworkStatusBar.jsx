"use client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { motion, AnimatePresence } from "framer-motion";

export default function NetworkStatusBar() {
  const { isOnline, isManualOffline } = useNetworkStatus();
  const isOffline = !isOnline || isManualOffline;

  return (
    <AnimatePresence>
      {isOffline ? (
        <motion.div
          key="offline-bar"
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="network-bar offline"
        >
          ⚠ OFFLINE — Actions queued for sync when connection restores
        </motion.div>
      ) : (
        <motion.div
          key="online-bar"
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="network-bar online"
        >
          ◉ NEXUS ONLINE
        </motion.div>
      )}
    </AnimatePresence>
  );
}
