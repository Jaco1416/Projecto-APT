import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ✅ Cambia esto por el nombre exacto de tu tabla
const TABLE_NAME = "Perfiles";

// ============================================================
// 📥 GET → Obtener registros
// ============================================================
export async function GET(request: Request) {
  try {
    // obtener parámetro id si existe
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let data, error;

    if (id) {
      // traer un solo usuario por id
      ({ data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single()); // .single() para obtener un objeto en vez de array
    } else {
      // traer todos los usuarios
      ({ data, error } = await supabaseAdmin.from(TABLE_NAME).select("*"));
    }

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error GET:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// ➕ POST → Crear un nuevo registro No se utiliza pq existe trigger en la bd
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .insert(body)
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// 🛠️ PUT → Actualizar un registro por ID
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
    console.error("❌ Error PUT:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// ❌ DELETE → Eliminar un registro por ID
// ============================================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere un ID de usuario" },
        { status: 400 }
      );
    }

    // 🧩 Paso 1: Eliminar usuario del sistema de autenticación
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error("❌ Error al eliminar de auth:", authError);
      return NextResponse.json(
        { error: "No se pudo eliminar el usuario de Supabase Auth" },
        { status: 500 }
      );
    }

    // 🧹 Paso 2: Eliminar perfil asociado (mismo id)
    const { error: perfilError } = await supabaseAdmin
      .from("Perfiles")
      .delete()
      .eq("id", id);

    if (perfilError) {
      console.warn("⚠️ Usuario eliminado de Auth, pero falló borrar perfil:", perfilError);
      return NextResponse.json(
        { message: "Usuario eliminado de Auth, pero el perfil no se pudo borrar completamente" },
        { status: 207 } // Multi-Status
      );
    }

    // ✅ Éxito total
    return NextResponse.json(
      { message: `Usuario ${id} eliminado correctamente de Auth y Perfiles` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error general DELETE:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
