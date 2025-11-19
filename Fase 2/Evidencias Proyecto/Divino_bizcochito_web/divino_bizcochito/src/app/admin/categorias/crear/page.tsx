"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import { useAlert } from "@/app/hooks/useAlert";

interface Categoria {
  nombre: string;
  descripcion: string;
}

export default function CrearCategoriaPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [categoria, setCategoria] = useState<Categoria>({
    nombre: "",
    descripcion: "",
  });

  const [saving, setSaving] = useState(false);

  // 🧾 Manejar cambios de campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategoria((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Guardar nueva categoría
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoria),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear categoría");

      showAlert("✅ Categoría creada correctamente", "success");
      router.push("/admin/categorias");
    } catch (error) {
      console.error("❌ Error al crear categoría:", error);
      showAlert("❌ No se pudo crear la categoría", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <BackButton label="Volver al panel" to="/admin/categorias" />

          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            Crear categoría
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-[#530708] font-medium mb-1">
                Nombre de la categoría
              </label>
              <input
                type="text"
                name="nombre"
                value={categoria.nombre}
                onChange={handleChange}
                required
                placeholder="Ingresar nombre..."
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
                value={categoria.descripcion}
                onChange={handleChange}
                required
                placeholder="Ingresar descripción..."
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
                {saving ? "Guardando..." : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
