"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Pedido {
    id: number;
    tipoEntrega: string;
    datosEnvio: any;
    estado: string;
    fechaCreacion: string;
    fechaEntrega: string | null;
    total: number;
}

function MisPedidos() {
    const router = useRouter();
    const { perfil } = useAuth();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMisPedidos = async () => {
            if (!perfil?.id) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/pedidos/usuario?usuarioId=${perfil.id}`);
                if (!res.ok) throw new Error("Error al obtener pedidos");
                
                const data = await res.json();
                setPedidos(data ?? []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMisPedidos();
    }, [perfil]);

    const handleVerDetalle = (id: number) => {
        router.push(`/views/pedido/${id}`);
    };

    if (loading) {
        return <p className="text-center text-gray-600 mt-8">Cargando tus pedidos...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-8">Error: {error}</p>;
    }

    if (!perfil) {
        return <p className="text-center text-gray-600 mt-8">Debes iniciar sesión para ver tus pedidos</p>;
    }

    return (
        <div className="w-full flex justify-center mt-6 mb-15">
            <div className="w-full max-w-6xl px-6 py-4">
                <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8">
                    Mis pedidos
                </h1>
                
                {pedidos.length === 0 ? (
                    <p className="text-center text-gray-600 mt-8">No tienes pedidos registrados.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-center text-sm text-white">
                            <thead className="bg-[#530708] uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-4 py-3 border border-[#8B3A3A]">ID</th>
                                    <th className="px-4 py-3 border border-[#8B3A3A]">Tipo entrega</th>
                                    <th className="px-4 py-3 border border-[#8B3A3A]">Estado</th>
                                    <th className="px-4 py-3 border border-[#8B3A3A]">Fecha creación</th>
                                    <th className="px-4 py-3 border border-[#8B3A3A]">Fecha entrega</th>
                                    <th className="px-4 py-3 border border-[#8B3A3A]">Total</th>
                                    <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pedidos.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="bg-[#A26B6B] text-white border border-[#fff] transition-colors"
                                    >
                                        <td className="px-4 py-2 border border-[#8B3A3A]">{p.id}</td>

                                        <td className="px-4 py-2 border border-[#8B3A3A] capitalize">
                                            {p.tipoEntrega}
                                        </td>

                                        <td className="px-4 py-2 border border-[#8B3A3A] font-semibold">
                                            <span
                                                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                                                    p.estado === "Recibido"
                                                        ? "bg-blue-300 text-blue-900"
                                                        : p.estado === "En producción"
                                                        ? "bg-yellow-300 text-yellow-900"
                                                        : p.estado === "Listo"
                                                        ? "bg-purple-300 text-purple-900"
                                                        : p.estado === "Entregado"
                                                        ? "bg-green-600 text-green-100"
                                                        : p.estado === "Cancelado"
                                                        ? "bg-red-500 text-red-100"
                                                        : "bg-gray-300 text-gray-900"
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
                                            <button
                                                onClick={() => handleVerDetalle(p.id)}
                                                className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition"
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MisPedidos;