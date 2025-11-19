import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface Params {
  params: Promise<{ id: string }>
}

// ✅ GET - Obtener una receta por ID
export async function GET (_: Request, { params }: Params) {
  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from('Receta')
      .select(
        `
        id,
        titulo,
        descripcion,
        categoria,
        ingredientes,
        pasos,
        imagenUrl,
        autorId,
        estado,
        creado_en,
        actualizado_en,
        perfiles:autorId (nombre, imagen)
      `
      )
      .eq('id', id)
      .single()

    if (error) throw error

    // Agregar campos de autor
    const perfil = Array.isArray(data.perfiles) ? data.perfiles[0] : data.perfiles
    const receta = {
      ...data,
      autor: perfil?.nombre || 'Sin autor',
      autorAvatar: perfil?.imagen || null
    }

    return NextResponse.json(receta, { status: 200 })
  } catch (err: any) {
    console.error('❌ Error al obtener receta:', err.message)
    return NextResponse.json(
      { error: 'Error al obtener receta' },
      { status: 500 }
    )
  }
}

// ✅ PUT - Actualizar una receta existente
export async function PUT (req: Request, { params }: Params) {
  const { id } = await params

  try {
    const body = await req.json()
    const {
      titulo,
      descripcion,
      ingredientes,
      pasos,
      imagenUrl,
      categoria,
      autorId
    } = body

    const { error } = await supabaseAdmin
      .from('Receta')
      .update({
        titulo,
        descripcion,
        ingredientes,
        pasos,
        imagenUrl,
        categoria,
        autorId,
        actualizado_en: new Date()
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Receta actualizada correctamente' },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ Error al actualizar receta:', err.message)
    return NextResponse.json(
      { error: 'Error al actualizar receta' },
      { status: 500 }
    )
  }
}

// ✅ DELETE - Eliminar receta
export async function DELETE (_: Request, { params }: Params) {
  const { id } = await params

  try {
    const { error } = await supabaseAdmin.from('Receta').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: 'Receta eliminada correctamente' },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ Error al eliminar receta:', err.message)
    return NextResponse.json(
      { error: 'Error al eliminar receta' },
      { status: 500 }
    )
  }
}
