"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#EDE2D3] border border-[#530708] rounded-xl shadow-lg w-full max-w-sm p-6 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-[#530708] mb-3">{title}</h2>
            <p className="text-gray-700 mb-6">{message}</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={onCancel}
                className="bg-[#530708] hover:bg-[#3D0506] text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
