"use client";

import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; // 👈 usamos el contexto

interface ProductCardProps {
  nombre: string;
  categoriaId: string;
  precio: number;
  descripcion: string;
  imagen: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewRecipe?: () => void;
}

export default function ProductCard({
  nombre,
  categoriaId,
  precio,
  descripcion,
  imagen,
  onEdit,
  onDelete,
  onViewRecipe,
}: ProductCardProps) {
  // 🔐 Obtenemos el rol directamente desde el contexto global
  const { perfil } = useAuth();
  const isAdmin = perfil?.rol === "admin";

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
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col justify-between flex-1 p-4">
        {/* Nombre + Categoría */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-red-600 font-semibold text-base truncate">
            {nombre}
          </h2>
          <span className="text-sm text-gray-700 font-medium truncate ml-2">
            {categoriaId}
          </span>
        </div>

        {/* Precio */}
        <p className="text-gray-900 font-bold text-sm mb-2">
          ${precio.toLocaleString("es-CL")}
        </p>

        {/* Descripción */}
        <p className="text-gray-700 text-sm line-clamp-2 leading-snug flex-1">
          {descripcion || "Sin descripción"}
        </p>

        {/* Botones */}
        <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#e0d3c0]">
          {/* 👇 Solo visible si el usuario es admin */}
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={onEdit}
                  className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                  title="Editar"
                >
                  <FaPen size={14} />
                </button>
                <button
                  onClick={onDelete}
                  className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <FaTrashAlt size={14} />
                </button>
              </>
            )}
          </div>

          <button
            onClick={onViewRecipe}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            Ver producto
          </button>
        </div>
      </div>
    </div>
  );
}
