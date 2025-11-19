import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEstadoEmail } from '@/lib/sendEmail'
import { sendPushToPerfil } from '@/lib/sendPush'

export async function PUT (
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    // 🔹 1. Obtener el pedido actual (estado + perfilId)
    const { data: pedido, error: fetchError } = await supabaseAdmin
      .from('Pedido')
      .select('estado, perfilId')
      .eq('id', id)
      .single()

    if (fetchError || !pedido) {
      console.error('❌ Error al obtener el pedido:', fetchError?.message)
      return NextResponse.json(
        { error: 'No se pudo obtener el pedido' },
        { status: 404 }
      )
    }

    // 🔹 2. Obtener el usuario desde Supabase Auth
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(pedido.perfilId)

    if (userError || !userData?.user) {
      console.error(
        '❌ No se encontró el usuario del pedido:',
        userError?.message
      )
      return NextResponse.json(
        { error: 'No se encontró el usuario asociado al pedido' },
        { status: 404 }
      )
    }

    const user = userData.user
    const email = user.email || 'divinobizcochito@gmail.com'

    // 🔹 2.5 Obtener el nombre desde la tabla Perfil
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('Perfiles')
      .select('nombre')
      .eq('id', pedido.perfilId)
      .single()

    if (perfilError) {
      console.warn(
        '⚠️ No se pudo obtener el nombre desde Perfiles:',
        perfilError.message
      )
    }

    const nombre = perfil?.nombre || 'Cliente'

    // 🔹 3. Estados válidos y ordenados
    const estadosOrdenados = [
      'Recibido',
      'En Producción',
      'Listo',
      'Entregado',
      'Cancelado'
    ]

    const estadoActual = pedido.estado
    const indexActual = estadosOrdenados.indexOf(estadoActual)

    if (indexActual === -1) {
      return NextResponse.json(
        { error: 'Estado actual inválido' },
        { status: 400 }
      )
    }

    // 🔹 4. Determinar el siguiente estado
    const siguienteEstado = estadosOrdenados[indexActual + 1]

    if (
      !siguienteEstado ||
      estadoActual === 'Entregado' ||
      estadoActual === 'Cancelado'
    ) {
      return NextResponse.json(
        { message: 'No se puede avanzar más el estado del pedido.' },
        { status: 400 }
      )
    }

    // 🔹 5. Actualizar el estado del pedido en la base de datos
    const { error: updateError } = await supabaseAdmin
      .from('Pedido')
      .update({ estado: siguienteEstado })
      .eq('id', id)

    if (updateError) {
      console.error('❌ Error al actualizar el estado:', updateError.message)
      return NextResponse.json(
        { error: 'Error al actualizar el estado del pedido' },
        { status: 500 }
      )
    }

    console.log(`✅ Estado del pedido #${id} actualizado a: ${siguienteEstado}`)

    // 🔹 6. Enviar correo al usuario (ajustado para Nodemailer)
    try {
      const info = await sendEstadoEmail(
        email,
        nombre,
        siguienteEstado,
        Number(id)
      )

      if (info?.accepted?.length) {
        console.log(
          `📧 Correo enviado correctamente a ${email} (${siguienteEstado})`
        )
      } else {
        console.warn(`⚠️ No se pudo confirmar el envío del correo a ${email}`)
      }
    } catch (mailError: any) {
      console.error('⚠️ Error al enviar correo:', mailError.message)
    }

    // 🔹 6.5 Enviar notificación push (si existe token)
    try {
      if (pedido?.perfilId) {
        const pushRes = await sendPushToPerfil(
          String(pedido.perfilId),
          `Estado pedido: ${siguienteEstado}`,
          `Tu pedido #${id} cambió a: ${siguienteEstado}`,
          { pedidoId: Number(id), estado: siguienteEstado }
        )
        console.log('📲 Push result:', pushRes)
      }
    } catch (pushErr: any) {
      console.error('⚠️ Error enviando push:', pushErr?.message ?? pushErr)
    }

    // 🔹 7. Responder al cliente
    return NextResponse.json(
      {
        message: `Estado actualizado a: ${siguienteEstado}`,
        estado: siguienteEstado
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ Error general en PUT estado:', err.message)
    return NextResponse.json(
      { error: 'Error al actualizar el estado del pedido' },
      { status: 500 }
    )
  }
}
