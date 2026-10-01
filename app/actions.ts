"use server";

import { auth } from "@/auth";
import { getSupabase } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/mail";

type PlaceOrderInput = {
  items: { id: string; qty: number }[];
  shipping: { fullName: string; phone: string; address: string; city: string };
};

type PlaceOrderResult =
  | { ok: true; orderId: string; emailSent: boolean }
  | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false, error: "Please sign in with Google to place your order." };

  const { fullName, phone, address, city } = input.shipping;
  if (![fullName, phone, address, city].every((v) => typeof v === "string" && v.trim().length > 1)) {
    return { ok: false, error: "Please fill in all delivery details." };
  }

  const items = (input.items ?? []).filter((i) => Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 99);
  if (items.length === 0) return { ok: false, error: "Your cart is empty." };

  const db = getSupabase();

  // Always use prices from the database, never from the browser
  const { data: products, error: productError } = await db
    .from("products")
    .select("id, name, price, stock")
    .in("id", items.map((i) => i.id));
  if (productError) return { ok: false, error: "Could not load products. Please try again." };

  const lines = items.map((i) => {
    const p = products?.find((x) => x.id === i.id);
    return p ? { id: p.id, name: p.name as string, unitPrice: Number(p.price), qty: i.qty, stock: p.stock as number } : null;
  });
  if (lines.some((l) => l === null)) {
    return { ok: false, error: "Some items in your cart are no longer available. Please review your cart." };
  }
  const valid = lines as NonNullable<(typeof lines)[number]>[];
  const outOfStock = valid.find((l) => l.qty > l.stock);
  if (outOfStock) return { ok: false, error: `Only ${outOfStock.stock} left of ${outOfStock.name}.` };

  const total = valid.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      user_email: email,
      full_name: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      total,
    })
    .select("id")
    .single();
  if (orderError || !order) return { ok: false, error: "Could not save your order. Please try again." };

  const { error: itemsError } = await db.from("order_items").insert(
    valid.map((l) => ({
      order_id: order.id,
      product_id: l.id,
      product_name: l.name,
      quantity: l.qty,
      unit_price: l.unitPrice,
    }))
  );
  if (itemsError) {
    await db.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Could not save your order items. Please try again." };
  }

  // Reduce stock
  for (const l of valid) {
    await db.from("products").update({ stock: l.stock - l.qty }).eq("id", l.id);
  }

  // Send the confirmation email. The order is already saved, so an email
  // failure is recorded rather than failing the whole checkout.
  let emailSent = false;
  try {
    await sendOrderConfirmation(email, {
      id: order.id,
      full_name: fullName.trim(),
      address: address.trim(),
      city: city.trim(),
      total,
      items: valid.map((l) => ({ name: l.name, qty: l.qty, unitPrice: l.unitPrice })),
    });
    emailSent = true;
    await db.from("orders").update({ email_sent: true }).eq("id", order.id);
  } catch (e) {
    console.error("Mailgun error:", e);
  }

  return { ok: true, orderId: order.id, emailSent };
}
