import pool from '@/lib/db';
import {
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail,
  type OrderEmailData,
  type EmailOrderItem,
} from '@/lib/emails';

export async function sendOrderPaidNotificationEmails(orderNumber: string): Promise<void> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM orders WHERE order_number = ?',
      [orderNumber]
    ) as [Record<string, unknown>[], unknown];

    if (rows.length === 0) {
      console.warn('[EMAIL] Commande introuvable:', orderNumber);
      return;
    }

    const row = rows[0];
    const items = row.items
      ? (JSON.parse(row.items as string) as EmailOrderItem[])
      : [];

    const emailData: OrderEmailData = {
      orderNumber: String(row.order_number),
      customerName: String(row.nom),
      customerEmail: String(row.email),
      customerPhone: row.telephone ? String(row.telephone) : null,
      items,
      deliveryType: row.delivery_type as OrderEmailData['deliveryType'],
      relayPoint: row.relay_point
        ? JSON.parse(row.relay_point as string)
        : null,
      shippingAddress: row.shipping_address
        ? JSON.parse(row.shipping_address as string)
        : null,
      pays: row.pays ? String(row.pays) : 'FR',
      paysResidence: row.pays_residence ? String(row.pays_residence) : null,
      shippingCost: Number(row.shipping_cost ?? 0),
      total: Number(row.total),
      notes: row.notes ? String(row.notes) : null,
      paymentConfirmed: true,
    };

    await Promise.all([
      sendOrderConfirmationEmail(emailData),
      sendAdminNewOrderEmail(emailData),
    ]);
  } finally {
    conn.release();
  }
}
