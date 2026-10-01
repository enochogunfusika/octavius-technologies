"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { categoryIcon, formatNaira } from "@/lib/types";

export default function CartPage() {
  const { items, ready, total, setQty, remove } = useCart();

  if (!ready) return <p className="muted">Loading cart…</p>;

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>
        <p className="muted">Find something you like in the shop.</p>
        <Link href="/" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="two-col">
      <section>
        <h1>Your cart</h1>
        <ul className="line-items">
          {items.map((i) => (
            <li key={i.id} className="line-item">
              <span className="mini-thumb">{categoryIcon[i.category] ?? "📦"}</span>
              <div className="grow">
                <strong>{i.name}</strong>
                <div className="muted small">{formatNaira(i.price)} each</div>
              </div>
              <div className="qty">
                <button aria-label="Decrease" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
                <span>{i.qty}</span>
                <button aria-label="Increase" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
              </div>
              <strong className="line-total">{formatNaira(i.price * i.qty)}</strong>
              <button className="link-btn" onClick={() => remove(i.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </section>
      <aside className="summary">
        <h2>Summary</h2>
        <div className="row"><span>Subtotal</span><span>{formatNaira(total)}</span></div>
        <div className="row"><span>Delivery</span><span>Free</span></div>
        <div className="row total"><span>Total</span><span>{formatNaira(total)}</span></div>
        <Link href="/checkout" className="btn btn-primary btn-block">Proceed to checkout</Link>
      </aside>
    </div>
  );
}
