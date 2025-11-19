"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import CategoriasTable from "@/app/components/CategoriasTable/CategoriasTable";
import Link from "next/link";

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("/api/categorias");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al obtener categorías");

        setCategorias(data);
      } catch (error) {
        console.error("❌ Error al obtener categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute role="admin">
        <div className="min-h-screen flex items-center justify-center text-[#530708] font-medium">
          Cargando categorías...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Botón volver y encabezado */}
          <div className="flex items-center justify-between mb-6">
            <BackButton label="Volver al panel" to="/views/perfil" />
          </div>

          <h1 className="text-3xl font-bold text-[#530708] text-center mb-8">
            Lista de categorías
          </h1>

          {/* Tabla de categorías */}
          <CategoriasTable categorias={categorias} />

          {/* Botón nuevo */}
          <div className="w-full flex justify-start">
            <Link href="/admin/categorias/crear">
              <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-5 py-2 rounded-lg transition cursor-pointer">
                + Nueva categoría
              </button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
