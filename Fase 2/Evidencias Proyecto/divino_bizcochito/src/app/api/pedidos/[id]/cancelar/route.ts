import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendCancelacionEmail } from "@/lib/sendEmail";
import { sendPushToPerfil } from "@/lib/sendPush";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 🔹 1. Obtener el pedido
    // Seleccionar sólo columnas existentes; `fk_pedido_perfiles` no es una columna en la tabla
    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from("Pedido")
      .select("id, total, estado, perfilId, fechaCreacion")
      .eq("id", id)
      .single();

    if (pedidoError || !pedido) {
      console.error("❌ Error al obtener pedido:", pedidoError?.message);
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estado === "Cancelado" || pedido.estado === "Entregado") {
      return NextResponse.json(
        { message: "Este pedido ya no puede cancelarse." },
        { status: 400 }
      );
    }

    // 🔹 2. Obtener nombre del cliente desde tabla perfil
  const perfilId = pedido.perfilId ?? null;
    let nombreCliente = "Cliente";
    let correoCliente: string | null = null;

    if (perfilId) {
      const { data: perfil, error: perfilError } = await supabaseAdmin
        .from("Perfiles")
        .select("nombre")
        .eq("id", perfilId)
        .single();

      if (perfilError) console.warn("⚠️ Error al obtener perfil:", perfilError.message);
      nombreCliente = perfil?.nombre ?? nombreCliente;

      // Validar que sea un UUID v4 antes de consultar Auth
      const esUUID = /^[0-9a-fA-F-]{36}$/.test(perfilId);
      if (esUUID) {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
          perfilId
        );

        if (userError) console.warn("⚠️ Error al obtener usuario:", userError.message);
        correoCliente = userData?.user?.email ?? null;
      } else {
        console.warn("⚠️ El perfilId no es un UUID válido, se omite búsqueda en Auth.");
      }
    } else {
      console.warn("⚠️ Pedido sin perfil asociado, se omite envío de correo.");
    }

    // 🔹 4. Actualizar estado a "Cancelado"
    const { error: updateError } = await supabaseAdmin
      .from("Pedido")
      .update({ estado: "Cancelado" })
      .eq("id", id);

    if (updateError) {
      console.error("❌ Error al actualizar estado:", updateError.message);
      return NextResponse.json(
        { error: "Error al actualizar el pedido." },
        { status: 500 }
      );
    }

    console.log(`🛑 Pedido #${id} marcado como "Cancelado"`);

    // 🔹 5. Enviar correo si hay dirección disponible
    if (correoCliente) {
      try {
        const info = await sendCancelacionEmail({
          to: correoCliente,
          nombre: nombreCliente,
          pedidoId: pedido.id,
          total: pedido.total,
          fecha: pedido.fechaCreacion,
        });

        if (info?.accepted?.length) {
          console.log(`📧 Correo de cancelación enviado a ${correoCliente}`);
        } else {
          console.warn(`⚠️ No se pudo confirmar el envío del correo a ${correoCliente}`);
        }
      } catch (mailError: any) {
        console.error("⚠️ Error al enviar correo de cancelación:", mailError.message);
      }
    } else {
      console.warn("⚠️ No se encontró correo asociado al cliente, no se envió email.");
    }

    // 🔹 6. Enviar notificación push (si existe token)
    try {
      if (perfilId) {
        const pushRes = await sendPushToPerfil(
          String(perfilId),
          'Pedido cancelado',
          `Tu pedido #${pedido.id} ha sido cancelado.`,
          { pedidoId: pedido.id, estado: 'Cancelado' }
        )
        console.log('📲 Push result:', pushRes)
      }
    } catch (pushErr: any) {
      console.error('⚠️ Error enviando push:', pushErr?.message ?? pushErr)
    }

    // 🔹 7. Responder al cliente
    return NextResponse.json(
      { message: "Pedido cancelado correctamente." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error al cancelar pedido:", err);
    return NextResponse.json(
      { error: "Error interno del servidor", details: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
