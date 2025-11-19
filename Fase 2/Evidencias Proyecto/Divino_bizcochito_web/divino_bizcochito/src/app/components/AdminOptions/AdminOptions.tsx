"use client";

import React from "react";

interface AdminOptionsProps {
  onSelect?: (option: string) => void;
}

const options = [
  "Usuarios",
  "Productos",
  "Recetas",
  "Pedidos",
  "Toppings",
  "Rellenos",
  "Categorias",
];

export default function AdminOptions({ onSelect }: AdminOptionsProps) {
  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-[#EDE2D3] border border-[#530708] rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-center text-[#530708] mb-6">
        Panel de Administración
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect?.(option.toLowerCase())}
            className="bg-[#B21E1E] hover:bg-[#8F1616] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
