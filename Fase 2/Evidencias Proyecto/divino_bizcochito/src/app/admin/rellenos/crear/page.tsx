"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import { useAlert } from "@/app/hooks/useAlert";

interface Relleno {
  nombre: string;
  descripcion: string;
}

export default function CrearRellenoPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [relleno, setRelleno] = useState<Relleno>({
    nombre: "",
    descripcion: "",
  });

  const [saving, setSaving] = useState(false);


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
  const target = e.target as HTMLInputElement;
  const { name, value, type } = target;
  setRelleno((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? target.checked : value,
  }));
};

  // Guardar Relleno
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/relleno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(relleno),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear relleno");

      showAlert("✅ Relleno creado correctamente", "success");
      router.push("/admin/rellenos");
    } catch (error) {
      console.error("❌ Error al crear relleno:", error);
      showAlert("❌ No se pudo crear el relleno", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <BackButton label="Volver a la lista" to="/admin/rellenos"/>

          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            Crear relleno
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-[#000000] font-medium mb-1">
                Nombre del relleno
              </label>
              <input
                type="text"
                name="nombre"
                value={relleno.nombre}
                onChange={handleChange}
                required
                placeholder="Ingresar nombre del relleno..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-[#000000] font-medium mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={relleno.descripcion}
                onChange={handleChange}
                placeholder="Ingresar descripción del relleno..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
              />
            </div>
            {/* BTN crear */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                {saving ? "Guardando..." : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
