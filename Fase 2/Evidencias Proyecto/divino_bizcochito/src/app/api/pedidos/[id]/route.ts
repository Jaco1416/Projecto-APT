import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("Pedido")
      .select(`
        id,
        tipoEntrega,
        datosEnvio,
        estado,
        fechaCreacion,
        fechaEntrega,
        total,
        perfil:fk_pedido_perfiles ( nombre ),
        detalle_pedido:DetallePedido (
          id,
          cantidad,
          precioUnitario,
          nombreProducto,
          imagenProducto,
          toppingId,
          rellenoId
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error GET pedido:", err.message);
    return NextResponse.json(
      { error: "Error al obtener el pedido" },
      { status: 500 }
    );
  }
}


// 🔴 Eliminar pedido por ID (y opcionalmente sus detalles)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const pedidoId = parseInt(id);

    // Primero eliminar detalles (si no hay ON DELETE CASCADE)
    const { error: detalleError } = await supabaseAdmin
      .from("DetallePedido")
      .delete()
      .eq("pedidoId", pedidoId);

    if (detalleError) {
      console.warn("⚠️ No se pudieron eliminar detalles:", detalleError.message);
    }

    // Luego eliminar el pedido principal
    const { error: pedidoError } = await supabaseAdmin
      .from("Pedido")
      .delete()
      .eq("id", pedidoId);

    if (pedidoError) throw pedidoError;

    return NextResponse.json(
      { message: `Pedido #${pedidoId} eliminado correctamente` },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error DELETE pedido:", err.message);
    return NextResponse.json(
      { error: "Error al eliminar pedido" },
      { status: 500 }
    );
  }
}