import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TABLE_NAME = 'Producto'
const BUCKET_NAME = 'project_assets'

const folder = 'Products'
// ============================================================
// 📥 GET → Obtener todos los productos
// ============================================================

export async function GET (request: Request) {
  try {
    // obtener parámetro id si existe
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    let data, error

    if (id) {
      // traer un solo producto por id
      ;({ data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single()) // .single() para obtener un objeto en vez de array
    } else {
      // traer todos los productos
      ;({ data, error } = await supabaseAdmin.from(TABLE_NAME).select('*'))
    }

    if (error) throw error
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error GET:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ============================================================
// ➕ POST → Crear un nuevo producto
// ============================================================
export async function POST (request: Request) {
  try {
    const formData = await request.formData()
    const nombre = formData.get('nombre') as string
    const descripcion = formData.get('descripcion') as string
    const precio = parseFloat(formData.get('precio') as string)
    const imagen = formData.get('imagen') as File | null
    const categoriaId = formData.get('categoriaId') as string | null
    const toppingId = formData.get('toppingId') as string | null
    const rellenoId = formData.get('rellenoId') as string | null

    let imagenUrl = null

    // 📸 Subir imagen si existe
    if (imagen) {
      const ext = imagen.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${ext}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, imagen, { contentType: imagen.type })

      if (uploadError) throw uploadError

      // 🔗 Obtener URL pública
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      imagenUrl = publicUrlData.publicUrl
    }

    // 💾 Insertar producto en la base
    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .insert([
        {
          nombre,
          descripcion,
          precio,
          imagen: imagenUrl,
          toppingId: toppingId,
          rellenoId: rellenoId,
          categoriaId: categoriaId
        }
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error POST /Producto:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT (request: Request) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para actualizar' },
        { status: 400 }
      )
    }

    const nombre = formData.get('nombre') as string
    const descripcion = formData.get('descripcion') as string
    const precio = parseFloat(formData.get('precio') as string)
    const categoriaId = formData.get('categoriaId') as string | null
    const toppingId = formData.get('toppingId') as string | null
    const rellenoId = formData.get('rellenoId') as string | null

    // 📸 Imagen: puede ser File o URL
    const imagen = formData.get('imagen') as File | null
    const imagenUrlActual = formData.get('imagenUrl') as string | null // conservar la existente si no hay nueva
    let nuevaImagenUrl: string | null = null

    // 🖼️ Subir nueva imagen solo si realmente se cambió
    if (imagen && typeof imagen.name === 'string' && imagen.size > 0) {
      const ext = imagen.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${ext}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, imagen, { contentType: imagen.type })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      nuevaImagenUrl = publicUrlData.publicUrl || null
    }

    // ============================================================
    // ✏️ Armar objeto de actualización dinámico
    // ============================================================
    const updateData: Record<string, any> = {
      nombre,
      descripcion,
      precio,
      categoriaId,
      toppingId,
      rellenoId
    }

    // ✅ Solo actualiza la imagen si hay una nueva
    if (nuevaImagenUrl) {
      updateData.imagen = nuevaImagenUrl
    }

    // ✅ Si no hay imagen nueva, no toca el campo "imagen"
    // (así conserva la actual)

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error PUT /Producto:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ============================================================
// ❌ DELETE → Eliminar un relleno por ID
// ============================================================
export async function DELETE (request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere un ID para eliminar' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.from(TABLE_NAME).delete().eq('id', id)

    if (error) throw error
    return NextResponse.json(
      { message: `Producto ${id} eliminado correctamente` },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error DELETE /Producto:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
