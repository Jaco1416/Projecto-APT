"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import ProductTable from "@/app/components/ProductsTable/ProductsTable";
import Link from "next/link";

interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    disponible: boolean;
    imagen: string;
    categoriaId: string;
    toppingId: string;
    rellenoId: string;
}


export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Cargar productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("/api/productos");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al obtener productos");

        setProductos(data);
      } catch (error) {
        console.error("❌ Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute role="admin">
        <div className="min-h-screen flex items-center justify-center text-[#530708] font-medium">
          Cargando productos...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen  px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Botón volver y encabezado */}
          <div className="flex items-center justify-between mb-6">
            <BackButton label="Volver al panel" />
          </div>

          <h1 className="text-3xl font-bold text-[#530708] text-center mb-8">
            Lista de productos
          </h1>

          {/* Tabla de productos */}
          <ProductTable productos={productos} />
          <Link href="/admin/productos/crear">
            <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-5 py-2 rounded-lg transition cursor-pointer">
              + Nuevo producto
            </button>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
