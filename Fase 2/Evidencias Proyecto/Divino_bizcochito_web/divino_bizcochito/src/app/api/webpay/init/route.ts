import { NextResponse } from "next/server";
import {
  WebpayPlus,
  Options,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
  Environment,
} from "transbank-sdk";

export async function POST(req: Request) {
  try {
    const { amount, sessionId, returnUrl } = await req.json();

    if (!amount || !sessionId || !returnUrl) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const tx = new WebpayPlus.Transaction(
      new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
        Environment.Integration
      )
    );

    const buyOrder = Math.floor(Math.random() * 1000000000).toString();

    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    console.log("✅ Transacción creada:", response);

    return NextResponse.json({
      token: response.token,
      url: response.url,
    });
  } catch (error) {
    console.error("❌ Error iniciando Webpay:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago", details: String(error) },
      { status: 500 }
    );
  }
}
