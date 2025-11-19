"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import ConfirmModal from "../ui/ConfirmModal";
import { useAlert } from "@/app/hooks/useAlert";

interface Receta {
    titulo: string;
    descripcion: string;
    ingredientes: string;
    pasos: string;
    imagen: File | null;
    categoria: string;
}

export default function AddRecipe() {
    const { user } = useAuth();
    const router = useRouter();
    const { showAlert } = useAlert();
    const [open, setOpen] = useState(false);
    const [receta, setReceta] = useState<Receta>({
        titulo: "",
        descripcion: "",
        ingredientes: "",
        pasos: "",
        imagen: null,
        categoria: "",
    });

    const [preview, setPreview] = useState<string>("");
    const [saving, setSaving] = useState(false);

    // 📸 Manejar subida de imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        setReceta((prev) => ({ ...prev, imagen: file }));
    };

    // ✏️ Manejar cambios de texto
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setReceta((prev) => ({ ...prev, [name]: value }));
    };

    // 💾 Guardar receta
    const handleSubmit = async () => {
        if (!receta.titulo || !receta.descripcion || !receta.ingredientes || !receta.pasos) {
            showAlert("Por favor completa todos los campos obligatorios.", "warning");
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("titulo", receta.titulo);
            formData.append("descripcion", receta.descripcion);
            formData.append("ingredientes", receta.ingredientes);
            formData.append("pasos", receta.pasos);
            formData.append("categoria", receta.categoria || "");
            formData.append("autorId", user.id);
            if (receta.imagen) formData.append("imagen", receta.imagen);

            const res = await fetch("/api/recetas", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al crear la receta");

            showAlert("✅ Receta creada correctamente (pendiente de aprobación).", "success");
            router.push("/admin/recetas");
        } catch (error) {
            console.error("❌ Error al crear receta:", error);
            showAlert("❌ No se pudo crear la receta.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white py-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <BackButton label="Volver a la lista" />

                    <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
                        Crear receta
                    </h1>

                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
                    >
                        {/* 📸 Imagen */}
                        <div className="flex flex-col items-center justify-center bg-[#C72C2F] text-white rounded-2xl h-[380px] relative overflow-hidden">
                            {preview ? (
                                <>
                                    <img
                                        src={preview}
                                        alt="Vista previa"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreview("");
                                            setReceta({ ...receta, imagen: null });
                                        }}
                                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
                                        title="Quitar imagen"
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <label
                                    htmlFor="imagen"
                                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-16 w-16 mb-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-center font-medium">
                                        Sube una foto del resultado de la receta
                                    </p>
                                </label>
                            )}
                            <input
                                id="imagen"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                required
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* 🧾 Campos de texto */}
                        <div className="flex flex-col gap-5">
                            {/* Título */}
                            <div>
                                <label className="block text-[#000] font-medium mb-1">
                                    Nombre de la receta
                                </label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={receta.titulo}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingresar nombre de la receta..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-[#000] font-medium mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={receta.descripcion}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingresar descripción de la receta..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                />
                            </div>

                            {/* Ingredientes */}
                            <div>
                                <label className="block text-[#000] font-medium mb-1">
                                    Ingredientes
                                </label>
                                <textarea
                                    name="ingredientes"
                                    value={receta.ingredientes}
                                    onChange={handleChange}
                                    required
                                    placeholder="Lista los ingredientes..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                    rows={3}
                                />
                            </div>

                            {/* Pasos */}
                            <div>
                                <label className="block text-[#000] font-medium mb-1">
                                    Paso a paso
                                </label>
                                <textarea
                                    name="pasos"
                                    value={receta.pasos}
                                    onChange={handleChange}
                                    required
                                    placeholder="Describe el paso a paso detallado..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                    rows={4}
                                />
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-[#000] font-medium mb-1">
                                    Categoría
                                </label>
                                <input
                                    type="text"
                                    name="categoria"
                                    value={receta.categoria}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: Torta, Pie..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                />
                            </div>

                            {/* Botón */}
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setOpen(true)}
                                    className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition cursor-pointer"
                                >
                                    {saving ? "Guardando..." : "Crear receta"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <ConfirmModal
                    isOpen={open}
                    title="Aviso"
                    message="Antes de subir la recetas deberá ser aprobada por un administrador. ¿Desea continuar?"
                    onConfirm={() => {
                        handleSubmit(); // 👈 ejecuta tu función
                        setOpen(false);
                    }}
                    onCancel={() => setOpen(false)}
                />
            </div>
        </ProtectedRoute>
    );
}
