"use client";

import React, { use, useEffect, useState } from 'react'
import RecetasCard from '@/app/components/RecetasCard/RecetasCard'
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";

interface Receta {
    id: string;
    titulo: string;
    categoria: string;
    autorId: string;
    autor?: string;
    descripcion: string;
    imagen: string;
    imagenUrl?: string;
    estado?: string;
}

function RecetasPage() {
    const router = useRouter();
    const { perfil, user } = useAuth();
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 12; // 3 filas x 4 columnas

    useEffect(() => {
        if (perfil) {
            setIsAdmin(perfil.rol === 'admin');
        }
    }, [perfil]);

    const fetchRecetas = async () => {
        try {
            const res = await fetch("/api/recetas");
            if (!res.ok) throw new Error("Error al obtener recetas");

            const data = await res.json();
            
            // Filtrar solo recetas publicadas
            const recetasPublicadas = Array.isArray(data) 
                ? data.filter((receta: any) => receta.estado === "publicada")
                : [];
            
            setRecetas(recetasPublicadas);
        } catch (err) {
            console.error("❌ Error al traer recetas:", err);
            setRecetas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecetas();
    }, []);

    const handleViewReceta = (id: string) => {
        router.push(`/views/recetas/detalle/${id}`);
    };

    const handleAddReceta = () => {
        if (!user) {
            router.push("/views/login");
            return;
        }
        router.push("/views/recetas/agregar");
    };

    if (loading) return <p className="text-center mt-8">Cargando recetas...</p>;

    const totalPages = Math.max(1, Math.ceil(recetas.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const recetasPagina = recetas.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-4xl font-bold text-[#C72C2F] text-center mb-8">
                Recetas de la comunidad
            </h1>

            
            {recetas.length === 0 ? (
                <p className="text-center text-gray-500">No hay recetas publicadas disponibles</p>
            ) : (
                <div className="grid 
                    grid-cols-1 
                    sm:grid-cols-2 
                    md:grid-cols-3 
                    lg:grid-cols-4 
                    gap-8 
                    justify-center 
                    place-items-center 
                    max-w-7xl 
                    mx-auto
                    px-4
                    mb-8">
                    {recetasPagina.map((receta) => (
                        <RecetasCard
                            key={receta.id}
                            id={receta.id}
                            titulo={receta.titulo}
                            categoria={receta.categoria}
                            autorId={receta.autorId}
                            autor={receta.autor}
                            descripcion={receta.descripcion}
                            imagen={receta.imagenUrl || receta.imagen}
                            onView={() => handleViewReceta(receta.id)}
                            isAdmin={isAdmin}
                            isOwner={receta.autorId === perfil?.id}
                        />
                    ))}
                </div>
            )}
            {recetas.length > 0 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-60"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-600">
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
            )}
            
            {/* Botón para agregar receta */}
            <div className="flex justify-center mt-8">
                <button
                    onClick={handleAddReceta}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110 cursor-pointer"
                    title="Agregar receta"
                >
                    <FaPlus size={24} />
                </button>
            </div>
        </div>
    )
}

export default RecetasPage
