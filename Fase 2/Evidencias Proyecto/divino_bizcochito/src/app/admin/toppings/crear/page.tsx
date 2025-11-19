"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import { useAlert } from "@/app/hooks/useAlert";

interface Topping {
  nombre: string;
  descripcion: string;
}

export default function CrearToppingPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [topping, setTopping] = useState<Topping>({
    nombre: "",
    descripcion: "",
  });

  const [saving, setSaving] = useState(false);

  // 🧾 Manejar cambios
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTopping((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Crear topping
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!topping.nombre.trim() || !topping.descripcion.trim()) {
        showAlert("Completa todos los campos antes de continuar.", "warning");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/toppings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topping),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear topping");

      showAlert("✅ Topping creado correctamente", "success");
      router.push("/admin/toppings");
    } catch (error) {
      console.error("❌ Error al crear topping:", error);
      showAlert("❌ No se pudo crear el topping", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <BackButton label="Volver a la lista" to="/admin/toppings" />

          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            Crear topping
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-[#530708] font-medium mb-1">
                Nombre del topping
              </label>
              <input
                type="text"
                name="nombre"
                value={topping.nombre}
                required
                onChange={handleChange}
                placeholder="Ingresar nombre del topping..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-[#530708] font-medium mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={topping.descripcion}
                required
                onChange={handleChange}
                placeholder="Ingresar descripción del topping..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
              />
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                {saving ? "Guardando..." : "Crear topping"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
