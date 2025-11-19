import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
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
        perfil:fk_pedido_perfiles ( nombre )
      `)
      .order("fechaCreacion", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error al listar pedidos:", err.message);
    return NextResponse.json({ error: "Error al listar pedidos" }, { status: 500 });
  }
}
