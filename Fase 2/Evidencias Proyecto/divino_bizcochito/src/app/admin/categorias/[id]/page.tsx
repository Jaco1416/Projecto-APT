"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import { useAlert } from "@/app/hooks/useAlert";

interface Categoria {
  id?: string;
  nombre: string;
  descripcion: string;
}

export default function EditarCategoriaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [categoria, setCategoria] = useState<Categoria>({
    nombre: "",
    descripcion: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔁 Obtener datos de la categoría
  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const res = await fetch(`/api/categorias?id=${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al obtener la categoría");
        setCategoria(data);
      } catch (error) {
        console.error("❌ Error al cargar categoría:", error);
        showAlert("No se pudo cargar la categoría", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoria();
  }, [id]);

  // 🧾 Manejar cambios
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategoria((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/categorias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...categoria, id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar categoría");

      showAlert("✅ Categoría actualizada correctamente", "success");
      router.push("/admin/categorias");
    } catch (error) {
      console.error("❌ Error al actualizar categoría:", error);
      showAlert("❌ No se pudo actualizar la categoría", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando categoría...</p>;

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <BackButton label="Volver a la lista" to="/admin/categorias" />

          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            Editar categoría
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
