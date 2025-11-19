import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// ✅ GET - Obtener todas las recetas
export async function GET () {
  try {
    const { data, error } = await supabaseAdmin
      .from('Receta')
      .select(
        `
        id,
        titulo,
        descripcion,
        categoria,
        imagenUrl,
        autorId,
        estado,
        creado_en,
        actualizado_en,
        perfil:autorId (nombre)
      `
      )
      .order('creado_en', { ascending: false })

    if (error) throw error
    const recetas = data.map((r: any) => ({
      ...r,
      autor: r.perfil?.nombre || 'Sin autor'
    }))

    return NextResponse.json(recetas, { status: 200 })
  } catch (err: any) {
    console.error('❌ Error al obtener recetas:', err.message)
    return NextResponse.json(
      { error: 'Error al obtener recetas' },
      { status: 500 }
    )
  }
}

// ✅ POST - Crear una nueva receta
export async function POST (req: Request) {
  try {
    // 🔹 Si el frontend envía FormData (no JSON)
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()

      const titulo = formData.get('titulo')?.toString()
      const descripcion = formData.get('descripcion')?.toString()
      const ingredientes = formData.get('ingredientes')?.toString()
      const pasos = formData.get('pasos')?.toString()
      const categoria = formData.get('categoria')?.toString() || ''
      const autorId = formData.get('autorId')?.toString()
      const imagen = formData.get('imagen') as File | null

      if (!titulo || !ingredientes || !pasos || !autorId) {
        return NextResponse.json(
          { error: 'Faltan campos obligatorios' },
          { status: 400 }
        )
      }

      // 🔹 Subida de imagen a Supabase Storage
      let imagenUrl = '/placeholder.png'
      if (imagen) {
        const buffer = Buffer.from(await imagen.arrayBuffer())
        const fileName = `${Date.now()}-${imagen.name.replace(/\s+/g, '_')}`
        const filePath = `Recipes/${fileName}` // 👈 subcarpeta dentro del bucket

        const { error: uploadError } = await supabaseAdmin.storage
          .from('project_assets') // 👈 el nombre correcto de tu bucket
          .upload(filePath, buffer, {
            contentType: imagen.type,
            upsert: false
          })

        if (uploadError) {
          console.error('⚠️ Error al subir imagen:', uploadError.message)
          return NextResponse.json(
            { error: 'Error al subir la imagen' },
            { status: 500 }
          )
        }

        // ✅ Obtener URL pública del archivo subido
        const { data: urlData } = supabaseAdmin.storage
          .from('project_assets')
          .getPublicUrl(filePath)

        imagenUrl = urlData.publicUrl
      }
      // 🔹 Insertar en la tabla Receta
      const { data, error } = await supabaseAdmin
        .from('Receta')
        .insert([
          {
            titulo,
            descripcion,
            ingredientes,
            pasos,
            imagenUrl,
            categoria,
            autorId,
            creado_en: new Date(),
            actualizado_en: new Date()
          }
        ])
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 201 })
    }

    // 🔹 Si el frontend envía JSON (sin imagen)
    const body = await req.json()
    const {
      titulo,
      descripcion,
      ingredientes,
      pasos,
      imagenUrl,
      categoria,
      estado,
      autorId
    } = body

    if (!titulo || !ingredientes || !pasos || !autorId) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('Receta')
      .insert([
        {
          titulo,
          descripcion,
          ingredientes,
          pasos,
          imagenUrl,
          categoria,
          autorId,
          estado,
          creado_en: new Date(),
          actualizado_en: new Date()
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('❌ Error al crear receta:', err.message)
    return NextResponse.json(
      { error: 'Error al crear receta' },
      { status: 500 }
    )
  }
}
