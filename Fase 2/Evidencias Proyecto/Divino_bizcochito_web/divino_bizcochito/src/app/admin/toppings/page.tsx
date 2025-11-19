"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import ToppingsTable from "@/app/components/ToppingsTable/ToppingsTable";
import Link from "next/link";

interface Topping {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function ToppingsPage() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Cargar toppings al montar el componente
  useEffect(() => {
    const fetchToppings = async () => {
      try {
        const res = await fetch("/api/toppings");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al obtener toppings");

        setToppings(data);
      } catch (error) {
        console.error("❌ Error al obtener toppings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToppings();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute role="admin">
        <div className="min-h-screen flex items-center justify-center text-[#530708] font-medium">
          Cargando toppings...
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
            <BackButton label="Volver al panel" to="/views/perfil"/>
          </div>

          <h1 className="text-3xl font-bold text-[#530708] text-center mb-8">
            Lista de toppings
          </h1>

          {/* Tabla de toppings */}
          <ToppingsTable toppings={toppings} />

          {/* Botón crear */}
          <div className="flex justify-start">
            <Link href="/admin/toppings/crear">
              <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-5 py-2 rounded-lg transition">
                + Nuevo topping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
