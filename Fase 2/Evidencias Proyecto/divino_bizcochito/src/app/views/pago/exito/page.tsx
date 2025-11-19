"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PagoExitoPage() {
  // En /pago/exito/page.tsx
  useEffect(() => {
    if (localStorage.getItem("carrito")) {
      localStorage.removeItem("carrito");
      console.log("🧹 Carrito eliminado del almacenamiento local.");
    } else {
      console.warn("⚠️ No se encontró ningún carrito para eliminar.");
    }
  }, []);
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white p-6">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md text-center border border-green-300">
        <h1 className="text-3xl font-bold text-green-700 mb-4">✅ Pago exitoso</h1>
        <p className="text-gray-700 mb-6">
          Tu pago ha sido procesado correctamente.
          En breve recibirás un correo con los detalles de tu compra.
        </p>
        <Link
          href="/"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
