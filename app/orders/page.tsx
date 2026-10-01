import Link from "next/link";
import { auth } from "@/auth";
import { getSupabase } from "@/lib/supabase";
import { formatNaira, shortId, type Order } from "@/lib/types";
import GoogleSignIn from "@/components/GoogleSignIn";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.email) {
    return (
      <div className="empty">
        <h1>Sign in to see your orders</h1>
        <GoogleSignIn redirectTo="/orders" />
      </div>
    );
  }

  const { data } = await getSupabase()
    .from("orders")
    .select("*, order_items(product_name, quantity, unit_price)")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <section>
      <h1>My orders</h1>
      {orders.length === 0 ? (
        <div className="empty">
          <p className="muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="btn btn-primary">Start shopping</Link>
        </div>
      ) : (
        <ul className="orders">
          {orders.map((o) => (
            <li key={o.id} className="order">
              <div className="order-head">
                <strong>#{shortId(o.id)}</strong>
                <span className="tag">{o.status}</span>
                <span className="muted small">{new Date(o.created_at).toLocaleString("en-NG")}</span>
                <strong className="push">{formatNaira(o.total)}</strong>
              </div>
              <div className="muted small">
                {o.order_items?.map((i) => `${i.product_name} × ${i.quantity}`).join(", ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
