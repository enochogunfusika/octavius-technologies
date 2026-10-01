import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSupabase } from "@/lib/supabase";
import { formatNaira, shortId, type Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; mail?: string }>;
}) {
  const { order: orderId, mail } = await searchParams;
  const session = await auth();
  if (!session?.user?.email) redirect("/");
  if (!orderId) redirect("/orders");

  const { data } = await getSupabase()
    .from("orders")
    .select("*, order_items(product_name, quantity, unit_price)")
    .eq("id", orderId)
    .eq("user_email", session.user.email)
    .maybeSingle();
  const order = data as Order | null;

  if (!order) {
    return (
      <div className="empty">
        <h1>Order not found</h1>
        <Link href="/orders" className="btn btn-primary">See my orders</Link>
      </div>
    );
  }

  return (
    <div className="success">
      <div className="check">✓</div>
      <h1>Order confirmed</h1>
      <p className="muted">Order <strong>#{shortId(order.id)}</strong></p>
      {mail === "0" ? (
        <p className="notice">Your order is saved, but the confirmation email couldn&apos;t be sent right now.</p>
      ) : (
        <p>A confirmation email is on its way to <strong>{order.user_email}</strong>.</p>
      )}

      <div className="summary left">
        {order.order_items?.map((i, idx) => (
          <div key={idx} className="row">
            <span>{i.product_name} × {i.quantity}</span>
            <span>{formatNaira(i.unit_price * i.quantity)}</span>
          </div>
        ))}
        <div className="row total"><span>Total</span><span>{formatNaira(order.total)}</span></div>
        <p className="muted small">Delivering to {order.address}, {order.city}</p>
      </div>

      <Link href="/" className="btn btn-primary">Continue shopping</Link>
    </div>
  );
}
