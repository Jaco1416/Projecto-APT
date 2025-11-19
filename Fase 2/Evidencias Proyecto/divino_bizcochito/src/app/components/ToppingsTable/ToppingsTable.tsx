"use client";
import { useEffect, useState } from "react";
import { useAlert } from "@/app/hooks/useAlert";
import Link from "next/link";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface Topping {
    id: string;
    nombre: string;
    descripcion?: string;
}

const PAGE_SIZE = 5;

interface ToppingTableProps {
    toppings: Topping[];
}

export default function ToppingsTable({ toppings }: ToppingTableProps) {
    const { showAlert } = useAlert();

    // Estado local para la lista de toppings
    const [toppingsList, setToppingsList] = useState<Topping[]>(toppings);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedToppingId, setSelectedToppingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // 🧱 Abrir modal
    const handleDeleteClick = (id: string) => {
        setSelectedToppingId(id);
        setModalOpen(true);
    };

    // 🧱 Confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!selectedToppingId) return;

        try {
            const res = await fetch(`/api/toppings?id=${selectedToppingId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al eliminar topping");

            showAlert("✅ Topping eliminado correctamente", "success");

            // ✅ Actualizar lista local (sin volver a hacer fetch)
            setToppingsList((prev) => prev.filter((t) => t.id !== selectedToppingId));
        } catch (error) {
            console.error("❌ Error al eliminar topping:", error);
            showAlert("❌ No se pudo eliminar el topping", "error");
        } finally {
            setModalOpen(false);
            setSelectedToppingId(null);
        }
    };

    useEffect(() => {
        const total = Math.max(1, Math.ceil(toppingsList.length / PAGE_SIZE));
        if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [toppingsList.length, currentPage]);

    if (toppingsList.length === 0) {
        return (
            <p className="text-center text-gray-600 mt-6">
                No hay toppings registrados.
            </p>
        );
    }

    const totalPages = Math.max(1, Math.ceil(toppingsList.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedToppings = toppingsList.slice(startIndex, startIndex + PAGE_SIZE);

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
                            {paginatedToppings.map((topping) => (
                                <tr
                                    key={topping.id}
                                    className="bg-[#A26B6B] text-white border border-[#ffff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-medium">
                                        {topping.nombre}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {topping.descripcion || "-"}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <Link href={`/admin/toppings/${topping.id}`}>
                                                <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition cursor-pointer">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(topping.id)}
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
                title="Eliminar topping"
                message="¿Estás seguro de eliminar este topping? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}
