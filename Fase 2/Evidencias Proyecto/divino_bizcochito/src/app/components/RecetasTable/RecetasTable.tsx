"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Receta {
    id: number;
    titulo: string;
    autorId: string;
    autor: string;
    estado: string;
    creado_en: string;
    imagen?: string;
    imagenUrl?: string;
}

interface RecetasTableProps {
    onView?: (id: number) => void;
}

const PAGE_SIZE = 5;

export default function RecetasTable({ onView }: RecetasTableProps) {
    const router = useRouter();
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchRecetas = async () => {
        try {
            const res = await fetch("/api/recetas");
            if (!res.ok) throw new Error("Error al obtener recetas");
            const data = await res.json();
            setRecetas(data);
            setCurrentPage(1);
        } catch (err) {
            console.error("❌ Error al cargar recetas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecetas();
    }, []);

    useEffect(() => {
        const total = Math.max(1, Math.ceil(recetas.length / PAGE_SIZE));
        if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [recetas.length, currentPage]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40 text-gray-500">
                Cargando recetas...
            </div>
        );
    }

    if (recetas.length === 0) {
        return (
            <div className="w-full flex flex-col items-center mt-6 gap-6">
                <div className="text-center text-gray-600">
                    No hay recetas registradas.
                </div>
                <div className="w-full max-w-6xl px-6 flex justify-start">
                    <button
                        onClick={() => router.push("/views/recetas/agregar")}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                        + Añadir receta
                    </button>
                </div>
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(recetas.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedRecetas = recetas.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="w-full flex flex-col items-center mt-6">
            <div className="w-full max-w-6xl px-6 py-4">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">ID Receta</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Foto</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Autor</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Nombre de la receta</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Estado</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Fecha de subida</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedRecetas.map((receta) => (
                                <tr
                                    key={receta.id}
                                    className="bg-[#A26B6B] text-white border border-[#fff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-semibold">
                                        {receta.id.toString().padStart(2, "0")}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <img
                                            src={receta.imagenUrl || receta.imagen || "/placeholder.jpg"}
                                            alt={receta.titulo}
                                            className="w-16 h-16 object-cover rounded-md mx-auto"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {receta.autor || "Sin autor"}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-medium capitalize">
                                        {receta.titulo}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <span
                                            className={`px-3 py-1 rounded-md text-xs font-semibold ${receta.estado === "publicada"
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
                                                onClick={() => onView?.(receta.id)}
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
                <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-60"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-60"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
            <div className="w-full max-w-6xl px-6 flex justify-start mb-6">
                <button
                    onClick={() => router.push("/views/recetas/agregar")}
                    className="bg-[#B21E1E] hover:bg-[#8B1515] text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                    + Añadir receta
                </button>
            </div>
        </div>
    );
}
