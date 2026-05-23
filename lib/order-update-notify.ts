import { sendOrderUpdateEmail, type OrderUpdateEmailData } from '@/lib/emails';

type OrderRow = {
  status: string;
  email: string;
  nom: string;
  admin_notes: string | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  relay_point: string | null;
  shipping_address: string | null;
  shipping_cost: number | null;
  pays: string | null;
  delivery_type: string | null;
};

type OrderUpdateBody = {
  status?: string;
  admin_notes?: string | null;
  nom?: string;
  email?: string;
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  relay_point?: Record<string, string> | null;
  shipping_address?: Record<string, string> | null;
  shipping_cost?: number;
  pays?: string;
};

function normStr(v: unknown): string {
  return v == null ? '' : String(v).trim();
}

function jsonNorm(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') {
    try {
      return JSON.stringify(JSON.parse(v));
    } catch {
      return v.trim();
    }
  }
  return JSON.stringify(v);
}

function parseJsonField<T extends Record<string, string>>(val: unknown): T | null {
  if (!val) return null;
  if (typeof val === 'object') return val as T;
  try {
    return JSON.parse(String(val)) as T;
  } catch {
    return null;
  }
}

export function detectOrderCustomerNotification(
  prev: OrderRow,
  body: OrderUpdateBody
): OrderUpdateEmailData | null {
  const statusChanged = body.status !== undefined && body.status !== prev.status;

  const shippingChanged =
    (body.carrier !== undefined && normStr(body.carrier) !== normStr(prev.carrier)) ||
    (body.tracking_number !== undefined && normStr(body.tracking_number) !== normStr(prev.tracking_number)) ||
    (body.tracking_url !== undefined && normStr(body.tracking_url) !== normStr(prev.tracking_url)) ||
    (body.relay_point !== undefined && jsonNorm(body.relay_point) !== jsonNorm(prev.relay_point)) ||
    (body.shipping_address !== undefined && jsonNorm(body.shipping_address) !== jsonNorm(prev.shipping_address)) ||
    (body.shipping_cost !== undefined && Number(body.shipping_cost) !== Number(prev.shipping_cost ?? 0)) ||
    (body.pays !== undefined && normStr(body.pays) !== normStr(prev.pays));

  const nextAdminNotes = body.admin_notes !== undefined ? body.admin_notes : prev.admin_notes;
  const notesChanged =
    body.admin_notes !== undefined &&
    normStr(body.admin_notes) !== normStr(prev.admin_notes) &&
    normStr(body.admin_notes) !== '';

  if (!statusChanged && !shippingChanged && !notesChanged) return null;

  const currentStatus = body.status ?? prev.status;
  const relayPoint = parseJsonField(
    body.relay_point !== undefined ? body.relay_point : prev.relay_point
  );
  const shippingAddress = parseJsonField(
    body.shipping_address !== undefined ? body.shipping_address : prev.shipping_address
  );

  return {
    orderNumber: '',
    customerEmail: body.email ?? prev.email,
    customerName: body.nom ?? prev.nom,
    currentStatus,
    previousStatus: prev.status,
    statusChanged,
    shippingChanged,
    notesChanged,
    notes: nextAdminNotes ?? null,
    carrier: body.carrier !== undefined ? body.carrier : prev.carrier,
    trackingNumber: body.tracking_number !== undefined ? body.tracking_number : prev.tracking_number,
    trackingUrl: body.tracking_url !== undefined ? body.tracking_url : prev.tracking_url,
    deliveryType: prev.delivery_type,
    relayPoint,
    shippingAddress,
    pays: body.pays !== undefined ? body.pays : prev.pays,
    shippingCost: body.shipping_cost !== undefined ? body.shipping_cost : prev.shipping_cost,
  };
}

export function notifyOrderCustomerUpdate(
  orderNumber: string,
  payload: OrderUpdateEmailData
): void {
  sendOrderUpdateEmail({ ...payload, orderNumber }).catch((err) =>
    console.error('[EMAIL ERROR]', err)
  );
}
