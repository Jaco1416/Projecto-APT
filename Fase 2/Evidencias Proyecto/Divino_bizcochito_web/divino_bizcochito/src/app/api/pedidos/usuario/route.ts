import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Se requiere el parámetro usuarioId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("Pedido")
      .select(`
        id,
        tipoEntrega,
        datosEnvio,
        estado,
        fechaCreacion,
        fechaEntrega,
        total
      `)
      .eq("perfilId", usuarioId)
      .order("fechaCreacion", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error al obtener pedidos del usuario:", err.message);
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
