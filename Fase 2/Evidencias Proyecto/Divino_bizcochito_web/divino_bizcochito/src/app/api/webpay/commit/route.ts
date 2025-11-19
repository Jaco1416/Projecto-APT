import { NextResponse } from 'next/server'
import {
  WebpayPlus,
  Options,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
  Environment
} from 'transbank-sdk'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const supabase = supabaseAdmin

const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token_ws')

  if (!token) {
    return NextResponse.json({ error: 'Token no recibido' }, { status: 400 })
  }

  try {
    const result = await tx.commit(token)
    console.log('✅ Resultado de Webpay Commit:', result)

    if (result.response_code === 0 && result.status === 'AUTHORIZED') {
      const { buy_order, session_id, amount } = result
      const estado = 'APROBADA'
      const timestamp = new Date().toISOString()

      // 1️⃣ Guardar transacción
      const { error: errTx } = await supabase.from('TransaccionWebpay').insert([
        {
          buyOrder: buy_order,
          sessionId: session_id,
          monto: amount,
          estado,
          payload: result,
          createdAt: timestamp
        }
      ])
      if (errTx) throw errTx

      // 2️⃣ Recuperar carrito desde la BD
      let carrito
      if (session_id) {
        console.log('🛒 Recuperando carrito con ID:', session_id)
        const { data, error } = await supabase
          .from('Carrito')
          .select('*')
          .eq('id', session_id)
          .single()

        if (error || !data) {
          console.error('❌ No se encontró el carrito:', error)
          throw new Error('Carrito no encontrado')
        }

        carrito = data
        console.log('✅ Carrito recuperado:', carrito)
      } else {
        console.error('⚠️ sessionId inválido:', session_id)
        throw new Error('Carrito inválido')
      }

      if (!carrito.items || !Array.isArray(carrito.items)) {
        throw new Error('El carrito no contiene productos válidos.')
      }

      // 3️⃣ Crear pedido
      const { data: pedido, error: errPedido } = await supabase
        .from('Pedido')
        .insert([
          {
            carritoId: carrito.id,
            perfilId: carrito.perfilid,
            tipoEntrega: carrito.tipoentrega,
            datosEnvio: carrito.datosenvio,
            estado: 'Recibido',
            total: amount,
            createdAt: timestamp
          }
        ])
        .select()
        .single()
      if (errPedido) throw errPedido

      // 4️⃣ Crear detalles del pedido
      const detalles = carrito.items.map((item: any) => ({
        pedidoId: pedido.id,
        productoId: item.id,
        toppingId: item.toppingId,
        rellenoId: item.rellenoId,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        nombreProducto: item.nombre,
        imagenProducto: item.imagen
      }))

      const { error: errDetalles } = await supabase
        .from('DetallePedido')
        .insert(detalles)
      if (errDetalles) throw errDetalles

      // 5️⃣ Incrementar las ventas por cada producto comprado
      for (const item of carrito.items) {
        const { error: errVentas } = await supabase.rpc('incrementar_ventas', {
          producto_id: item.id,
          cantidad: item.cantidad ?? 1 // por si no tiene campo cantidad
        })

        if (errVentas) {
          console.error(`⚠️ Error actualizando ventas del producto ${item.id}:`, errVentas)
        } else {
          console.log(`✅ Ventas actualizadas para producto ${item.id}`)
        }
      }

      // 6️⃣ Marcar carrito como pagado
      await supabase.from('Carrito').update({ estado: 'pagado' }).eq('id', carrito.id)

      console.log('✅ Pedido, detalles y ventas actualizadas correctamente.')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/views/pago/exito`
      )
    }

    // ❌ Si no fue autorizado
    console.warn('⚠️ Pago rechazado:', result)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/views/pago/error`
    )
  } catch (error) {
    console.error('❌ Error al confirmar pago:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/views/pago/error`
    )
  }
}
