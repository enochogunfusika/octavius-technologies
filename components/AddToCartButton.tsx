"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className="btn btn-primary"
      disabled={product.stock <= 0}
      onClick={() => {
        add({ id: product.id, name: product.name, price: Number(product.price), category: product.category });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {product.stock <= 0 ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
