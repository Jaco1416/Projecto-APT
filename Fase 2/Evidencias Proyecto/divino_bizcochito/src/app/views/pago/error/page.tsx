"use client";

import Link from "next/link";

export default function PagoErrorPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-6">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md text-center border border-red-300">
        <h1 className="text-3xl font-bold text-red-700 mb-4">❌ Pago fallido</h1>
        <p className="text-gray-700 mb-6">
          Hubo un problema al procesar tu pago.  
          Por favor, inténtalo nuevamente.
        </p>
        <Link
          href="/views/carrito"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Volver al carrito
        </Link>
      </div>
    </div>
  );
}
