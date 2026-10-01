"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "./CartProvider";
import { placeOrder } from "@/app/actions";
import { formatNaira } from "@/lib/types";

export default function CheckoutForm({ email, name }: { email: string; name: string }) {
  const { items, ready, total, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <p className="muted">Loading…</p>;

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>Nothing to check out</h1>
        <Link href="/" className="btn btn-primary">Back to shop</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const shipping = {
      fullName: String(f.get("fullName") ?? ""),
      phone: String(f.get("phone") ?? ""),
      address: String(f.get("address") ?? ""),
      city: String(f.get("city") ?? ""),
    };
    startTransition(async () => {
      const res = await placeOrder({ items: items.map((i) => ({ id: i.id, qty: i.qty })), shipping });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clear();
      router.push(`/success?order=${res.orderId}${res.emailSent ? "" : "&mail=0"}`);
    });
  }

  return (
    <div className="two-col">
      <form className="form" onSubmit={onSubmit}>
        <h1>Checkout</h1>
        <p className="muted small">Signed in as {email}. Your confirmation email goes here.</p>

        <label>Full name<input name="fullName" defaultValue={name} required /></label>
        <label>Phone number<input name="phone" type="tel" placeholder="080..." required /></label>
        <label>Delivery address<input name="address" required /></label>
        <label>City<input name="city" placeholder="Abuja" required /></label>

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary btn-block" disabled={pending}>
          {pending ? "Placing order…" : `Place order · ${formatNaira(total)}`}
        </button>
      </form>

      <aside className="summary">
        <h2>Order summary</h2>
        {items.map((i) => (
          <div key={i.id} className="row">
            <span>{i.name} × {i.qty}</span>
            <span>{formatNaira(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="row"><span>Delivery</span><span>Free</span></div>
        <div className="row total"><span>Total</span><span>{formatNaira(total)}</span></div>
      </aside>
    </div>
  );
}
