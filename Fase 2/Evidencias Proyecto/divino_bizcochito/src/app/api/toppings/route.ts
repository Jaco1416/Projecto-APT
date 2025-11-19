import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TABLE_NAME = "Topping";

// ============================================================
// 📥 GET → Obtener todos los toppings o uno por ID
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // 🔹 Si viene ?id=..., traer solo ese registro
      const { data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 200 });
    }

    // 🔹 Si no viene id, traer todos
    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .select("*")
      .order("nombre", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error GET /topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// ➕ POST → Crear un nuevo topping
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .insert([
        {
          nombre: body.nombre,
          descripcion: body.descripcion || null,
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST /topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// 🛠️ PUT → Actualizar un topping existente por ID
// ============================================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Se requiere un ID para actualizar" },
        { status: 400 }
      );
    }

    const { id, ...updateData } = body;

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error PUT /topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// ❌ DELETE → Eliminar un topping por ID
// ============================================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere un ID para eliminar" },
        { status: 400 }
      );
    }

    // Obtener un topping alternativo
    const { data: fallbackTopping, error: fallbackError } = await supabaseAdmin
      .from(TABLE_NAME)
      .select("id")
      .neq("id", id)
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (fallbackError) throw fallbackError;
    if (!fallbackTopping) {
      return NextResponse.json(
        { error: "No se puede eliminar el topping porque no existe un topping alternativo." },
        { status: 400 }
      );
    }

    // Actualizar productos que usan este topping
    const { error: updateError } = await supabaseAdmin
      .from("Producto")
      .update({ toppingId: fallbackTopping.id })
      .eq("toppingId", id);

    if (updateError) throw updateError;

    const { error } = await supabaseAdmin.from(TABLE_NAME).delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json(
      { message: `Topping ${id} eliminado correctamente` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error DELETE /topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
