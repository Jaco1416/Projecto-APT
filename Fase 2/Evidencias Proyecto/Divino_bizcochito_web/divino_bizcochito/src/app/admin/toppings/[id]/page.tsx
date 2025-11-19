"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import { useAlert } from "@/app/hooks/useAlert";

interface Topping {
  id?: string;
  nombre: string;
  descripcion: string;
}

export default function EditarToppingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [topping, setTopping] = useState<Topping>({
    nombre: "",
    descripcion: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔁 Obtener datos del topping
  useEffect(() => {
    const fetchTopping = async () => {
      try {
        const res = await fetch(`/api/toppings?id=${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al obtener el topping");
        setTopping(data);
      } catch (error) {
        console.error("❌ Error al cargar topping:", error);
        showAlert("No se pudo cargar el topping", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTopping();
  }, [id]);

  // 🧾 Manejar cambios en los campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTopping((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/toppings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...topping, id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar topping");

      showAlert("✅ Topping actualizado correctamente", "success");
      router.push("/admin/toppings");
    } catch (error) {
      console.error("❌ Error al actualizar topping:", error);
      showAlert("❌ No se pudo actualizar el topping", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando topping...</p>;

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <BackButton label="Volver a la lista" to="/admin/toppings" />

          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            Editar topping
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                value={topping.descripcion}
                required
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
