"use client";
import { useAlertContext } from "@/context/AlertContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Alert() {
  const { alert } = useAlertContext();

  const color =
    alert?.type === "success"
      ? "bg-green-500"
      : alert?.type === "error"
      ? "bg-red-500"
      : alert?.type === "warning"
      ? "bg-yellow-500"
      : "bg-blue-500";

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.message}
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 200, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`${color} text-white px-4 py-2 rounded-md fixed top-5 right-5 shadow-lg z-50`}
        >
          {alert.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
