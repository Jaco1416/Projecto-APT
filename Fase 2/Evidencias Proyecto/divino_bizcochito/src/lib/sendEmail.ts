import nodemailer from 'nodemailer'
/**
 * Crea el transportador SMTP usando Gmail.
 * Se autentica con tu correo y una contraseña de aplicación (no tu contraseña normal).
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER, // tu correo Gmail
    pass: process.env.NODEMAILER_PASS  // tu contraseña de aplicación de Gmail
  }
})

/**
 * Envía un correo al cliente cuando cambia el estado del pedido.
 */
export async function sendEstadoEmail(
  to: string,
  nombre: string,
  nuevoEstado: string,
  pedidoId: number
) {
  const subject = `Actualización de tu pedido #${pedidoId}`
  const html = `
    <h2>Hola ${nombre},</h2>
    <p>Queríamos informarte que el estado de tu pedido <strong>#${pedidoId}</strong> ha cambiado a:</p>
    <h3 style="color:#7c0a02;">${nuevoEstado}</h3>
    <p>Gracias por confiar en <strong>Divino Bizcochito 🍰</strong>.<br/>
    Puedes revisar el estado completo de tu pedido en nuestra plataforma.</p>
    <hr/>
    <p style="font-size:0.9rem;color:#777;">Este mensaje se envía automáticamente, no respondas a este correo.</p>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Divino Bizcochito 🍰" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })

    console.log(`📧 Correo enviado a ${to}: ${nuevoEstado}`)
    return info
  } catch (err: any) {
    console.error('❌ Error al enviar correo:', err.message)
  }
}

interface CancelacionEmailProps {
  to: string
  nombre: string
  pedidoId: number
  total: number
  fecha: string
}

/**
 * Envía un correo de cancelación de pedido.
 */
export async function sendCancelacionEmail({
  to,
  nombre,
  pedidoId,
  total,
  fecha
}: CancelacionEmailProps) {
  const subject = `Tu pedido #${pedidoId} ha sido cancelado`
  const html = `
    <div style="font-family: Arial, sans-serif; background: #fff7f7; padding: 20px; border-radius: 8px; border: 1px solid #ffd6d6;">
      <h2 style="color:#b91c1c;">Hola ${nombre},</h2>
      <p>Lamentamos informarte que tu <strong>pedido #${pedidoId}</strong> ha sido <span style="color:#b91c1c;">cancelado</span>.</p>
      <p>Tu pago por un total de <strong>$${total.toLocaleString('es-CL')}</strong> será <strong>reembolsado</strong> en las próximas horas.</p>
      <p>Fecha del pedido: ${new Date(fecha).toLocaleDateString('es-CL')}</p>
      <p>Si tienes dudas sobre el proceso, contáctanos respondiendo este correo o por WhatsApp.</p>
      <p>Gracias por tu comprensión 💛</p>
      <hr/>
      <p style="font-size: 12px; color: #555;">Este correo fue generado automáticamente. Por favor, no respondas a este mensaje.</p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Divino Bizcochito 🍰" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })

    console.log(`📧 Correo de cancelación enviado a ${to}`)
    return info
  } catch (error: any) {
    console.error('❌ Error al enviar correo de cancelación:', error.message)
  }
}
