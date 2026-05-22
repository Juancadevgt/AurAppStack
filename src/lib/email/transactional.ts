import { getResend, FROM_EMAIL } from "./resend";
import { APP_NAME } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

interface PurchaseData {
  id: string;
  amount_cents: number;
  apps?: { title?: string; slug?: string } | null;
  profiles?: { email?: string; full_name?: string } | null;
  buyer_id: string;
  developer_id: string;
}

export async function sendPurchaseEmail(purchase: PurchaseData) {
  if (!purchase.profiles?.email) return;
  const appTitle = purchase.apps?.title ?? "tu app";

  await getResend().emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: purchase.profiles.email,
    subject: `Confirmación: ${appTitle}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h1 style="color:#7c3aed;">¡Gracias por tu compra!</h1>
        <p>Hola ${purchase.profiles.full_name ?? ""},</p>
        <p>Has comprado <strong>${appTitle}</strong> por ${formatPrice(purchase.amount_cents)}.</p>
        <p>Accede a tu app desde tu dashboard:</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/purchases"
             style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
            Ver mis compras
          </a>
        </p>
        <p style="color:#666;font-size:14px;margin-top:30px;">
          Si necesitas soporte de la app, contacta directamente al desarrollador desde tu panel.
        </p>
      </div>
    `,
  });
}

export async function sendNewSaleEmail(purchase: PurchaseData) {
  // Email al desarrollador
  // El developer_id está en purchase, pero necesitamos su email. Esto idealmente se pasa o se consulta antes.
  const appTitle = purchase.apps?.title ?? "tu app";
  // Para simplicidad, esta función espera que se llame con datos enriquecidos.
  // En webhook real, hacer JOIN con profiles del developer.
  console.log("Notificar al dev sobre venta:", purchase.id, appTitle);
}

export async function sendNewAppNotification(
  emails: string[],
  app: { title: string; tagline: string; slug: string },
) {
  if (emails.length === 0) return;

  await getResend().batch.send(
    emails.map((email) => ({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `🚀 Nueva app: ${app.title}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <h1 style="color:#7c3aed;">Nueva app disponible</h1>
          <h2>${app.title}</h2>
          <p>${app.tagline}</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/apps/${app.slug}"
               style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
              Ver app
            </a>
          </p>
        </div>
      `,
    })),
  );
}
