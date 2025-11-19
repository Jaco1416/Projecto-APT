"use client";
import { useEffect, useState } from "react";
import { useAlert } from "@/app/hooks/useAlert";
import Link from "next/link";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface Relleno {
    id: string;
    nombre: string;
    descripcion?: string    ;
}

const PAGE_SIZE = 5;

interface RellenoTableProps {
    rellenos: Relleno[];
}

export default function RellenoTable({ rellenos }: RellenoTableProps) {
    const { showAlert } = useAlert();

    // Estado local para la lista de rellenos
    const [rellenosList, setRellenosList] = useState<Relleno[]>(rellenos);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRellenoId, setSelectedRellenoId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // 🧱 Abrir modal
    const handleDeleteClick = (id: string) => {
        setSelectedRellenoId(id);
        setModalOpen(true);
    };

    // 🧱 Confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!selectedRellenoId) return;

        try {
            const res = await fetch(`/api/relleno?id=${selectedRellenoId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al eliminar relleno");

            showAlert("✅ Relleno eliminado correctamente", "success");

            // ✅ Actualizar lista local (sin volver a hacer fetch)
            setRellenosList((prev) => prev.filter((r) => r.id !== selectedRellenoId));
        } catch (error) {
            console.error("❌ Error al eliminar relleno:", error);
            showAlert("❌ No se pudo eliminar el relleno", "error");
        } finally {
            setModalOpen(false);
            setSelectedRellenoId(null);
        }
    };

    useEffect(() => {
        const total = Math.max(1, Math.ceil(rellenosList.length / PAGE_SIZE));
        if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [rellenosList.length, currentPage]);

    if (rellenosList.length === 0) {
        return (
            <p className="text-center text-gray-600 mt-6">
                No hay rellenos registrados.
            </p>
        );
    }

    const totalPages = Math.max(1, Math.ceil(rellenosList.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedRellenos = rellenosList.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="w-full flex justify-center mt-6">
            <div className="w-full max-w-6xl px-6 py-4">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Nombre</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Descripción</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRellenos.map((relleno) => (
                                <tr
                                    key={relleno.id}
                                    className="bg-[#A26B6B] text-white border border-[#ffff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-medium">
                                        {relleno.nombre}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {relleno.descripcion || "-"}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <Link href={`/admin/rellenos/${relleno.id}`}>
                                                <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition cursor-pointer">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(relleno.id)}
                                                className="bg-[#530708] hover:bg-[#3D0506] text-white font-semibold px-3 py-1 rounded transition cursor-pointer"
                                            >
                                                Eliminar
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

            {/* 🧩 Modal de confirmación */}
            <ConfirmModal
                isOpen={modalOpen}
                title="Eliminar relleno"
                message="¿Estás seguro de eliminar este relleno? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}
