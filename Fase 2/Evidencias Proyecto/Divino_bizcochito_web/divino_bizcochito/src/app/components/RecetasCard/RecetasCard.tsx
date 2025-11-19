"use client";

import React from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa";

interface RecetasCardProps {
  id: string;
  titulo: string;
  categoria: string;
  autorId: string;
  autor?: string;
  descripcion: string;
  imagen: string;
  isAdmin?: boolean;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function RecetasCard({
  id,
  titulo,
  categoria,
  autorId,
  autor,
  descripcion,
  imagen,
  isAdmin = false,
  isOwner = false,
  onEdit,
  onDelete,
  onView,
}: RecetasCardProps) {
  const showActions = isAdmin || isOwner;

  return (
    <div
      className="
        bg-[#f7efe3]
        border border-[#e0d3c0]
        rounded-lg
        shadow-sm
        overflow-hidden
        w-72
        h-[400px]
        flex flex-col
        justify-between
        transition-transform
        hover:scale-[1.02]
        hover:shadow-md
      "
    >
      {/* Imagen */}
      <div className="relative w-full h-44">
        <img
          src={imagen}
          alt={titulo}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col justify-between flex-1 p-4">
        {/* Título + Categoría */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-red-600 font-semibold text-base truncate">
            {titulo}
          </h2>
          <span className="text-sm text-gray-700 font-medium truncate ml-2">
            {categoria}
          </span>
        </div>

        {/* Autor */}
        <p className="text-gray-900 font-bold text-sm mb-2">
          Por: {autor || autorId}
        </p>

        {/* Descripción */}
        <p className="text-gray-700 text-sm line-clamp-2 leading-snug flex-1">
          {descripcion || "Sin descripción"}
        </p>

        {/* Botones */}
        <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#e0d3c0]">
          <div className="flex gap-2">
            {showActions && (
              <button
                onClick={() => onEdit?.(id)}
                className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                title="Editar"
              >
                <FaPen size={14} />
              </button>
            )}
            {showActions && (
              <button
                onClick={() => onDelete?.(id)}
                className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                title="Eliminar"
              >
                <FaTrashAlt size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => onView?.(id)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            Ver receta
          </button>
        </div>
      </div>
    </div>
  );
}
