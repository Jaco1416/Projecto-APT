"use client";
import Link from "next/link";
import { useAlert } from "@/app/hooks/useAlert";
import { useEffect, useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";

const PAGE_SIZE = 5;

interface UsuariosTableProps {
    usuarios: any[];
    onDelete?: (id: string) => void;
}

export default function UsuariosTable({ usuarios, onDelete }: UsuariosTableProps) {

    const { showAlert } = useAlert();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rolFiltro, setRolFiltro] = useState<string>("todos");


    useEffect(() => {
        const total = Math.max(1, Math.ceil(usuarios.length / PAGE_SIZE));
        if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [usuarios.length, currentPage]);

    if (usuarios.length === 0) {
        return (
            <p className="text-center text-gray-600 mt-6">
                No hay usuarios registrados.
            </p>
        );
    }

    const usuariosFiltrados =
        rolFiltro === "todos"
            ? usuarios
            : usuarios.filter((user) => user.rol === rolFiltro);

    const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedUsuarios = usuariosFiltrados.slice(startIndex, startIndex + PAGE_SIZE);

    const handleDeleteClick = (id: string) => {
        setSelectedUserId(id);
        setModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUserId) return;

        try {
            const res = await fetch(`/api/perfiles?id=${selectedUserId}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

            showAlert("✅ Usuario eliminado correctamente", "success");
            onDelete?.(selectedUserId);
        } catch (error) {
            console.error("❌ Error al eliminar usuario:", error);
            showAlert("❌ No se pudo eliminar el usuario", "error");
        } finally {
            setModalOpen(false);
            setSelectedUserId(null);
        }
    };

    return (
        <div className="w-full flex flex-col items-center mt-6 gap-4">
            <div className="w-full max-w-6xl px-6 py-1 flex justify-end">
                <select
                    value={rolFiltro}
                    onChange={(e) => {
                        setRolFiltro(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                >
                    <option value="todos">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="cliente">Cliente</option>
                </select>
            </div>
            <div className="w-full max-w-6xl px-6 py-4">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Imagen</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Nombre</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Rol</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Teléfono</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsuarios.map((user) => (
                                <tr
                                    key={user.id}
                                    className="bg-[#A26B6B] text-white border border-[#ffff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-medium">
                                        <img
                                            src={user.imagen}
                                            alt={user.nombre}
                                            className="w-10 h-10 rounded-full border bg-amber-50 border-white mx-auto shadow-sm"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A] capitalize">
                                        {user.nombre}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {user.rol}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {user.telefono || "-"}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <Link href={`/admin/usuarios/${user.id}`}>
                                                <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(user.id)} // 👈 Aquí se llama
                                                className="bg-[#530708] hover:bg-[#3D0506] text-white font-semibold px-3 py-1 rounded transition"
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
            <ConfirmModal
                isOpen={modalOpen}
                title="Eliminar usuario"
                message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}
