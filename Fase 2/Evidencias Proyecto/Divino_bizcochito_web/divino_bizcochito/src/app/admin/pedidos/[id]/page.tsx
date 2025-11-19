"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton/BackButton";
import PedidoDetail from "@/app/components/PedidoDetail/PedidoDetail";
import { useAlert } from "@/app/hooks/useAlert";

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
    perfil: { nombre: string };
    detalle_pedido: DetallePedido[];
}

export default function DetallePedidoPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔁 Obtener pedido desde el backend
    const fetchPedido = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/pedidos/${id}`);
            if (!res.ok) throw new Error("Error al obtener pedido");
            const data = await res.json();
            setPedido(data);
        } catch (err) {
            console.error("❌ Error al obtener pedido:", err);
            showAlert("No se pudo cargar el pedido", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedido();
    }, [id]);

    // 🔄 Avanzar estado (usa API)
    const avanzarEstado = async () => {
        if (!pedido) return;
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}/estado`, {
                method: "PUT",
            });
            if (!res.ok) throw new Error("Error al avanzar estado");

            const result = await res.json();
            showAlert(result.message || "Estado actualizado", "success");
            await fetchPedido(); // 🔁 refresca datos
        } catch (err) {
            console.error("❌ Error al avanzar estado:", err);
            showAlert("No se pudo avanzar el estado", "error");
        }
    };

    // ❌ Cancelar pedido (usa API)
    const cancelarPedido = async () => {
        if (!pedido) return;
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}/cancelar`, {
                method: "PUT",
            });
            if (!res.ok) throw new Error("Error al cancelar pedido");

            showAlert("Pedido cancelado correctamente", "warning");
            await fetchPedido();
        } catch (err) {
            console.error("❌ Error al cancelar pedido:", err);
            showAlert("No se pudo cancelar el pedido", "error");
        }
    };

    // 📅 Actualizar fecha de entrega (usa API)
    const actualizarFechaEntrega = async (date: Date) => {
        if (!pedido) return;
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}/entrega`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fechaEntrega: date.toISOString() }),
            });

            if (!res.ok) throw new Error("Error al actualizar fecha de entrega");

            showAlert("Fecha de entrega actualizada.", "success");
            await fetchPedido();
        } catch (err) {
            console.error("❌ Error al actualizar la fecha de entrega:", err);
            showAlert("No se pudo actualizar la fecha de entrega", "error");
        }
    };

    // 🗑️ Eliminar pedido (usa API DELETE)
    const eliminarPedido = async () => {
        if (!pedido) return;
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Error al eliminar pedido");
            showAlert("Pedido eliminado correctamente ✅", "success");
            router.push("/admin/pedidos"); // redirige al listado
        } catch (err) {
            console.error("❌ Error al eliminar pedido:", err);
            showAlert("No se pudo eliminar el pedido", "error");
        }
    };

    // 🧩 Carga y renderizado
    if (loading) return <p className="text-center mt-8">Cargando pedido...</p>;
    if (!pedido) return <p className="text-center mt-8">Pedido no encontrado</p>;

    return (
        <div>
            <BackButton />
            <PedidoDetail
                pedido={pedido}
                isAdmin={true}
                onAvanzarEstado={avanzarEstado}
                onCancelar={cancelarPedido}
                onActualizarFecha={actualizarFechaEntrega}
                onEliminar={eliminarPedido}
            />
        </div>
    );
}
