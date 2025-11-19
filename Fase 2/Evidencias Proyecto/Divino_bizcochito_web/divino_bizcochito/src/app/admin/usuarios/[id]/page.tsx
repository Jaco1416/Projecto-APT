"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "@/app/hooks/useAlert";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";

interface Usuario {
    id: string;
    nombre: string;
    telefono: string;
    rol: string;
    imagen: string;
}

export default function GetUsuario() {
    const { showAlert } = useAlert();
    const { id } = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 🔁 Obtener datos del usuario
    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const res = await fetch(`/api/perfiles?id=${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al obtener usuario");
                setUsuario(data); // ahora el endpoint devuelve un solo objeto
            } catch (error) {
                console.error("❌ Error al obtener usuario:", error);
                showAlert("❌ No se pudo cargar el usuario");
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [id]);

    // 🧾 Actualizar datos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUsuario((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    // 💾 Guardar cambios
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario) return;

        setSaving(true);

        try {
            const res = await fetch("/api/perfiles", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(usuario),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al actualizar usuario");

            showAlert("✅ Usuario actualizado correctamente", "success");
            router.push("/admin/usuarios");
        } catch (error) {
            console.error("❌ Error al actualizar:", error);
            showAlert("❌ No se pudo actualizar el usuario");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-center mt-10 text-gray-600">Cargando datos del usuario...</p>;

    return (
        <ProtectedRoute role="admin">
            <BackButton label="Volver a la lista" />
            <div className="max-w-xl mx-auto mb-10 bg-[#C72C2F] border border-[#530708] rounded-xl p-6 shadow-md">
                
                <h1 className="text-2xl font-bold text-[#ffff] text-center mt-4 mb-6">
                    Editar Usuario
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-[#ffff] font-medium mb-1">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={usuario?.nombre || ""}
                            onChange={handleChange}
                            required
                            className="w-full border border-[#ffff] rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-[#ffff] font-medium mb-1">Teléfono</label>
                        <input
                            type="text"
                            name="telefono"
                            value={usuario?.telefono || ""}
                            onChange={handleChange}
                            required
                            className="w-full border border-[#ffff] rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-[#ffff] font-medium mb-1">Rol</label>
                        <select
                            name="rol"
                            value={usuario?.rol || "cliente"}
                            onChange={handleChange}
                            required
                            className="w-full border border-[#ffff] rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
                        >
                            <option value="admin">Administrador</option>
                            <option value="cliente">Cliente</option>
                        </select>
                    </div>
                    {/* Botón Guardar */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#ffff] hover:bg-[#A92225] text-red-600 hover:text-red-50 font-semibold py-2 rounded-lg mt-4 transition"
                    >
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    );
}
