import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT (
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const body = await req.json()
    const { estado, fechaEntrega } = body

    const updateData: Record<string, any> = {}
    if (estado) updateData.estado = estado
    if (fechaEntrega) updateData.fechaEntrega = fechaEntrega

    const { error } = await supabaseAdmin
      .from('Pedido')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: `Pedido #${id} actualizado correctamente` },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ Error PUT pedido:', err.message)
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
}
