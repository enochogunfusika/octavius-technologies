export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  stock: number;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  qty: number;
};

export type Order = {
  id: string;
  user_email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  status: string;
  email_sent: boolean;
  created_at: string;
  order_items?: { product_name: string; quantity: number; unit_price: number }[];
};

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number) {
  return naira.format(Number(amount));
}

export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export const categoryIcon: Record<string, string> = {
  Laptops: "💻",
  Phones: "📱",
  Audio: "🎧",
  Wearables: "⌚",
  Accessories: "🔌",
  Displays: "🖥️",
};
