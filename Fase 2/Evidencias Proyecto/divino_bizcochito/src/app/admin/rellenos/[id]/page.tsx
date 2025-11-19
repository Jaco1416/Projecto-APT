"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import { useAlert } from "@/app/hooks/useAlert";

interface Relleno {
  id?: string;
  nombre: string;
  descripcion: string;
}

export default function EditarRellenoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [relleno, setRelleno] = useState<Relleno>({
    nombre: "",
    descripcion: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔁 Obtener datos del relleno
  useEffect(() => {
    const fetchRelleno = async () => {
      try {
        const res = await fetch(`/api/relleno?id=${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al obtener el relleno");
        setRelleno(data); // ✅ asumimos que viene un array con un solo elemento
      } catch (error) {
        console.error("❌ Error al cargar relleno:", error);
        showAlert("No se pudo cargar el relleno", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRelleno();
  }, [id]);

  // 🧾 Manejar cambios de campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRelleno((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/relleno", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...relleno, id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar relleno");

      showAlert("✅ Relleno actualizado correctamente", "success");
      router.push("/admin/rellenos");
    } catch (error) {
      console.error("❌ Error al actualizar relleno:", error);
      showAlert("❌ No se pudo actualizar el relleno", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando relleno...</p>;

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <BackButton label="Volver a la lista" to="/admin/rellenos" />

          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            Editar relleno
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nombre */}
            <div>
              <label className="block text-[#530708] font-medium mb-1">
                Nombre del relleno
              </label>
              <input
                type="text"
                name="nombre"
                value={relleno.nombre}
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
                value={relleno.descripcion}
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
