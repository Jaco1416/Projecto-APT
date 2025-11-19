import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Params {
  params: Promise<{ id: string }>;
}

// ✅ PUT - Cambiar el estado de una receta
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { nuevoEstado } = await req.json();

    // Validar que el nuevo estado sea uno permitido
    const estadosValidos = ["pendiente", "publicada", "rechazada"];

    if (!estadosValidos.includes(nuevoEstado)) {
      return NextResponse.json(
        { error: "Estado inválido. Debe ser pendiente, publicada o rechazada." },
        { status: 400 }
      );
    }

    // Actualizar el estado en la base de datos
    const { data, error } = await supabaseAdmin
      .from("Receta")
      .update({ estado: nuevoEstado, actualizado_en: new Date() })
      .eq("id", id)
      .select("id, titulo, estado")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: "Estado actualizado correctamente", receta: data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error al actualizar el estado:", err.message);
    return NextResponse.json(
      { error: "Error al actualizar el estado de la receta" },
      { status: 500 }
    );
  }
}
