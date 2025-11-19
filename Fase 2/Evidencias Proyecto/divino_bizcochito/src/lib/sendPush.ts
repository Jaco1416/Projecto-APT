import { supabaseAdmin } from '@/lib/supabaseAdmin'

type ExpoResponse = {
  data?: any
  errors?: any
}

async function sendExpoPush(token: string, title: string, body: string, data?: any) {
  try {
    const message: any = {
      to: token,
      title,
      body,
      sound: 'default'
    }
    if (data) message.data = data

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('⚠️ Expo push failed:', res.status, text)
      return { ok: false, status: res.status, text }
    }

    const json = await res.json()
    console.log('✅ Expo push sent:', json)
    return { ok: true, json }
  } catch (err) {
    console.error('⚠️ Error sending expo push:', err)
    return { ok: false, error: err }
  }
}

export async function getTokensForPerfil(perfilId: string) {
  if (!perfilId) return []

  try {
    const { data, error } = await supabaseAdmin
      .from('PushTokens')
      .select('token')
      .eq('perfil_id', perfilId)

    if (error) {
      console.warn('⚠️ No se pudieron obtener tokens para perfil:', error.message)
      return []
    }

    const tokens = (data ?? [])
      .map((row) => row?.token)
      .filter((token): token is string => Boolean(token))

    return Array.from(new Set(tokens))
  } catch (err: any) {
    console.error('⚠️ Error consultando tokens de push:', err?.message ?? err)
    return []
  }
}

export async function sendPushToPerfil(perfilId: string, title: string, body: string, data?: any) {
  const tokens = await getTokensForPerfil(perfilId)

  if (!tokens.length) {
    console.log(`ℹ️ No hay tokens de push para perfil ${perfilId}`)
    return { sent: 0 }
  }

  let sent = 0
  for (const token of tokens) {
    const r = await sendExpoPush(token, title, body, data)
    if (r.ok) sent++
  }

  return { sent, total: tokens.length }
}

export default sendExpoPush
