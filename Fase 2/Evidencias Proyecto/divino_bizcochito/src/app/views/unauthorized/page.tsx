"use client";
import React from 'react'

function Unauthorized() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-3xl font-bold text-[#530708] mt-10">Acceso no autorizado</h1>

            <p className="text-gray-700 mt-4">
                No tienes permiso para acceder a esta página.
            </p>

            <div className="mt-8">
                <button
                    onClick={() => (window.location.href = "/")}
                    className="bg-[#C72C2F] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#A92225] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#530708]"
                >
                    Volver a la página de inicio
                </button>
            </div>
        </div>

    )
}

export default Unauthorized