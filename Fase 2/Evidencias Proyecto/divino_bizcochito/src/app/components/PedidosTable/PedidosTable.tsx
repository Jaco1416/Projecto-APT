"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAlert } from "@/app/hooks/useAlert";

interface Pedido {
    id: number;
    tipoEntrega: string;
    datosEnvio: any;
    estado: string;
    fechaCreacion: string;
    fechaEntrega: string | null;
    total: number;
    perfil: {
        nombre: string | null;
    } | null;
}

const PAGE_SIZE = 5;

export default function PedidosTable() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { showAlert } = useAlert();

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                // Llamada al endpoint interno que devuelve { data: Pedido[], meta: { ... } }
                const res = await fetch('/api/pedidos')
                if (!res.ok) throw new Error(`Error al obtener pedidos: ${res.status} ${res.statusText}`)
                const json = await res.json()
                // Manejar dos posibles formatos: { data: [...] } o directamente [...]
                const items = Array.isArray(json) ? json : (json?.data ?? [])
                setPedidos((items as unknown as Pedido[]) ?? [])
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    useEffect(() => {
        const total = Math.max(1, Math.ceil(pedidos.length / PAGE_SIZE));
        if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [pedidos.length, currentPage]);

    if (loading) return <p className="text-center text-white mt-8">Cargando pedidos...</p>;
    if (error) return <p className="text-center text-red-500 mt-8">Error: {error}</p>;
    if (pedidos.length === 0) {
        return <p className="text-center text-white mt-8">No hay pedidos registrados.</p>;
    }

    const totalPages = Math.max(1, Math.ceil(pedidos.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedPedidos = pedidos.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="w-full flex justify-center mt-6 mb-15">
            <div className="w-full max-w-6xl px-6 py-4">
                <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8">
                    Gestionar pedidos
                </h1>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">ID</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Cliente</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Tipo entrega</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Estado</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Fecha creación</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Fecha entrega</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Total</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedPedidos.map((p) => (
                                <tr
                                    key={p.id}
                                    className="bg-[#A26B6B] text-white border border-[#fff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A]">{p.id}</td>

                                    {/* ✅ Muestra el nombre del cliente desde el join */}
                                    <td className="px-4 py-2 border border-[#8B3A3A] truncate max-w-[150px]">
                                        {p.perfil?.nombre || "Sin nombre"}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A] capitalize">
                                        {p.tipoEntrega}
                                    </td>

                                    <td
                                        className={`px-4 py-2 border border-[#8B3A3A] font-semibold`}
                                    >
                                        <span
                                            className={`px-3 py-1 rounded-md text-xs font-semibold ${p.estado === "Recibido"
                                                ? "bg-blue-400 text-blue-100"
                                                : p.estado === "En Producción"
                                                    ? "bg-yellow-600 text-yellow-100"
                                                    : p.estado === "Listo"
                                                        ? "bg-purple-500 text-purple-100"
                                                        : p.estado === "Entregado"
                                                            ? "bg-green-600 text-green-100"
                                                            : p.estado === "Cancelado"
                                                                ? "bg-red-500 text-red-100"
                                                                : "bg-white text-black"
                                            }`}
                                        >
                                            {p.estado}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {new Date(p.fechaCreacion).toLocaleDateString("es-CL")}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {p.fechaEntrega
                                            ? new Date(p.fechaEntrega).toLocaleDateString("es-CL")
                                            : "pendiente"}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        ${p.total.toLocaleString("es-CL")}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <Link href={`/admin/pedidos/${p.id}`}>
                                                <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition cursor-pointer">
                                                    Ver detalle
                                                </button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

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
            </div>
        </div>
    );
}
