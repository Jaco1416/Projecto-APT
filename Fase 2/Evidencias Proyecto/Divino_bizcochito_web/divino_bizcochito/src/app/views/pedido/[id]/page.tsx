"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PedidoDetail from '@/app/components/PedidoDetail/PedidoDetail';
import BackButton from "@/app/components/BackButton/BackButton";

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
    detalle_pedido: DetallePedido[];
}

function PedidoDetailPage() {
    const { id } = useParams();
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPedido();
        }
    }, [id]);

    // 🧩 Carga y renderizado
    if (loading) return <p className="text-center mt-8">Cargando pedido...</p>;
    if (!pedido) return <p className="text-center mt-8">Pedido no encontrado</p>;

    return (
        <div>
            <BackButton />
            <PedidoDetail
                pedido={pedido}
                isAdmin={false}
            />
        </div>
    );
}

export default PedidoDetailPage;