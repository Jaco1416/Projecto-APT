"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Receta {
    id: number;
    titulo: string;
    categoria: string;
    estado: string;
    creado_en: string;
    imagenUrl?: string;
}

export default function MisRecetas() {
    const router = useRouter();
    const { perfil } = useAuth();
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMisRecetas = async () => {
        if (!perfil?.id) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/recetas");
            if (!res.ok) throw new Error("Error al obtener recetas");
            const data = await res.json();
            
            // Filtrar solo las recetas del usuario actual
            const misRecetas = data.filter((receta: any) => receta.autorId === perfil.id);
            setRecetas(misRecetas);
        } catch (err) {
            console.error("❌ Error al cargar recetas:", err);
            setRecetas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMisRecetas();
    }, [perfil]);

    const handleViewReceta = (id: number) => {
        router.push(`/views/recetas/detalle/${id}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40 text-gray-500">
                Cargando tus recetas...
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="text-center text-gray-600 mt-6">
                Debes iniciar sesión para ver tus recetas.
            </div>
        );
    }

    if (recetas.length === 0) {
        return (
            <div className="text-center text-gray-600 mt-6">
                No tienes recetas registradas.
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-6xl px-6 py-4">
                <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8">
                    Mis recetas
                </h1>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">ID</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Nombre de la receta</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Categoría</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Estado</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Fecha de subida</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recetas.map((receta) => (
                                <tr
                                    key={receta.id}
                                    className="bg-[#A26B6B] text-white border border-[#fff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-semibold">
                                        {receta.id.toString().padStart(2, "0")}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-medium capitalize">
                                        {receta.titulo}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A] capitalize">
                                        {receta.categoria}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <span
                                            className={`px-3 py-1 rounded-md text-xs font-semibold ${
                                                receta.estado === "publicada"
                                                    ? "bg-green-200 text-green-900"
                                                    : receta.estado === "rechazada"
                                                    ? "bg-red-200 text-red-900"
                                                    : "bg-yellow-200 text-yellow-900"
                                            }`}
                                        >
                                            {receta.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {new Date(receta.creado_en).toLocaleDateString("es-CL")}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => handleViewReceta(receta.id)}
                                                className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition"
                                            >
                                                Ver detalle
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
