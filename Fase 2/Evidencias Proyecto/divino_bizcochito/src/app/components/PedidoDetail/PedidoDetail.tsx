"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface DatosEnvio {
    nombre: string;
    correo: string;
    direccion: string;
    comentarios?: string;
}

interface DetallePedido {
    id: number;
    cantidad: number;
    precioUnitario: number;
    nombreProducto: string;
    imagenProducto: string | null;
    toppingId: number | null;
    rellenoId: number | null;
}

interface Pedido {
    id: number;
    tipoEntrega: string;
    datosEnvio: DatosEnvio | null;
    estado: string;
    fechaCreacion: string;
    fechaEntrega: string | null;
    total: number;
    perfil?: { nombre: string };
    detalle_pedido: DetallePedido[];
}

interface PedidoDetailProps {
    pedido: Pedido;
    isAdmin?: boolean;
    onAvanzarEstado?: () => Promise<void>;
    onCancelar?: () => Promise<void>;
    onActualizarFecha?: (fecha: Date) => Promise<void>;
    onEliminar?: () => Promise<void>;
}

export default function PedidoDetail({
    pedido,
    isAdmin = false,
    onAvanzarEstado,
    onCancelar,
    onActualizarFecha,
    onEliminar,
}: PedidoDetailProps) {
    const [updating, setUpdating] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        pedido.fechaEntrega ? new Date(pedido.fechaEntrega) : null
    );
    const [modalOpen, setModalOpen] = useState(false);

    const handleAvanzarEstado = async () => {
        setUpdating(true);
        await onAvanzarEstado?.();
        setUpdating(false);
        setModalOpen(false);
    };

    const handleCancelar = async () => {
        setUpdating(true);
        await onCancelar?.();
        setUpdating(false);
    };

    const handleActualizarFecha = async (date: Date) => {
        setUpdating(true);
        setSelectedDate(date);
        await onActualizarFecha?.(date);
        setUpdating(false);
    };

    const handleEliminar = async () => {
        if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;
        setUpdating(true);
        await onEliminar?.();
        setUpdating(false);
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 mb-20 space-y-10">
            {/* 🧁 Tabla de productos */}
            <section>
                <h2 className="text-xl font-semibold mb-3 text-[#530708] text-center">
                    Productos del Pedido #{pedido.id}
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-[#e0d3c0] rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-[#7c0a02] text-white">
                                <th className="py-2 px-4 text-left font-semibold">Producto</th>
                                <th className="py-2 px-4 text-center font-semibold">Cantidad</th>
                                <th className="py-2 px-4 text-center font-semibold">Precio Unitario</th>
                                <th className="py-2 px-4 text-center font-semibold">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white text-gray-800">
                            {pedido.detalle_pedido?.length > 0 ? (
                                pedido.detalle_pedido.map((d) => (
                                    <tr key={d.id} className="border-t border-[#e0d3c0]">
                                        <td className="py-3 px-4 flex items-center gap-3">
                                            {d.imagenProducto && (
                                                <img
                                                    src={d.imagenProducto}
                                                    alt={d.nombreProducto}
                                                    className="w-14 h-14 object-cover rounded-md border border-[#e0d3c0]"
                                                />
                                            )}
                                            <span className="font-medium">{d.nombreProducto}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">{d.cantidad}</td>
                                        <td className="py-3 px-4 text-center">
                                            ${d.precioUnitario.toLocaleString("es-CL")}
                                        </td>
                                        <td className="py-3 px-4 text-center font-semibold">
                                            ${(d.cantidad * d.precioUnitario).toLocaleString("es-CL")}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-500 italic">
                                        Este pedido no contiene productos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 📅 Fecha de entrega - solo para admin */}
            {isAdmin && pedido.estado !== "Entregado" && pedido.estado !== "Cancelado" && (
                <section className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-[#530708]">Fecha de entrega</h3>
                    <div className="flex items-center gap-3">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => date && handleActualizarFecha(date)}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Selecciona una fecha"
                            className="border border-[#e0d3c0] rounded-md px-3 py-2 w-52"
                        />
                    </div>
                </section>
            )}

            {/* 👤 Datos del pedido */}
            <section className="text-gray-800 space-y-2">
                <h2 className="text-xl font-bold mb-3 text-[#530708]">Datos del Pedido</h2>

                {isAdmin && pedido.perfil && (
                    <p><strong>Cliente:</strong> {pedido.perfil.nombre}</p>
                )}
                <p><strong>Tipo de entrega:</strong> {pedido.tipoEntrega}</p>
                <p>
                    <strong>Estado: </strong>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            pedido.estado === "Recibido"
                                ? "bg-blue-100 text-blue-700"
                                : pedido.estado === "En Producción"
                                ? "bg-yellow-100 text-yellow-800"
                                : pedido.estado === "Listo"
                                ? "bg-green-100 text-green-700"
                                : pedido.estado === "Entregado"
                                ? "bg-gray-200 text-gray-700"
                                : pedido.estado === "Cancelado"
                                ? "bg-red-100 text-red-700"
                                : ""
                        }`}
                    >
                        {pedido.estado}
                    </span>
                </p>

                {pedido.datosEnvio && (
                    <div className="mt-4 space-y-1">
                        <p><strong>Nombre:</strong> {pedido.datosEnvio.nombre}</p>
                        <p><strong>Correo:</strong> {pedido.datosEnvio.correo}</p>
                        <p><strong>Dirección:</strong> {pedido.datosEnvio.direccion}</p>
                        {pedido.datosEnvio.comentarios && (
                            <p><strong>Comentarios:</strong> {pedido.datosEnvio.comentarios}</p>
                        )}
                    </div>
                )}

                <p><strong>Fecha creación:</strong> {new Date(pedido.fechaCreacion).toLocaleString()}</p>
                {pedido.fechaEntrega ? (
                    <p><strong>Fecha entrega:</strong> {new Date(pedido.fechaEntrega).toLocaleString()}</p>
                ) : (
                    <p className="text-sm text-amber-600 mt-1">
                        ⚠️ No se ha establecido una fecha de entrega.
                    </p>
                )}
                <p><strong>Total:</strong> ${pedido.total.toLocaleString("es-CL")}</p>
            </section>

            {/* 🔘 Botones - solo para admin */}
            {isAdmin && (
                <div className="flex justify-between mt-6">
                    <button
                        onClick={handleCancelar}
                        disabled={updating || pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
                        className={`px-4 py-2 rounded-md font-semibold text-white transition ${
                            pedido.estado === "Cancelado" || pedido.estado === "Entregado"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 cursor-pointer"
                        }`}
                    >
                        Cancelar
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setModalOpen(true)}
                            disabled={
                                updating || pedido.estado === "Entregado" || pedido.estado === "Cancelado"
                            }
                            className={`px-4 py-2 rounded-md font-semibold text-white ${
                                pedido.estado === "Entregado" || pedido.estado === "Cancelado"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 cursor-pointer"
                            }`}
                        >
                            Avanzar estado
                        </button>

                        <button
                            onClick={handleEliminar}
                            className="px-4 py-2 rounded-md font-semibold text-white bg-[#530708] hover:bg-[#3d0606] cursor-pointer"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={modalOpen}
                title="Avanzar estado del pedido"
                message="¿Estás seguro de avanzar el estado de este pedido? Esta acción no se puede deshacer."
                confirmText="Avanzar"
                cancelText="Cancelar"
                onConfirm={handleAvanzarEstado}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}
