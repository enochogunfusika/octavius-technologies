import { getSupabase } from "@/lib/supabase";
import { categoryIcon, formatNaira, type Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Product[] = [];
  let loadError: string | null = null;

  try {
    const { data, error } = await getSupabase()
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    products = data ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load products.";
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Octavius Technologies</p>
        <h1>Tech that keeps up with you.</h1>
        <p className="muted">Laptops, phones, audio and accessories, delivered anywhere in Nigeria.</p>
      </section>

      {loadError ? (
        <div className="notice">
          <strong>Products couldn&apos;t load.</strong> {loadError}
          <br />Check your Supabase keys in <code>.env.local</code> and that you ran <code>supabase/schema.sql</code>.
        </div>
      ) : products.length === 0 ? (
        <div className="notice">No products yet. Run <code>supabase/schema.sql</code> to add the starter catalogue.</div>
      ) : (
        <section className="grid">
          {products.map((p) => (
            <article key={p.id} className="card">
              <div className="thumb">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} />
                ) : (
                  <span aria-hidden="true">{categoryIcon[p.category] ?? "📦"}</span>
                )}
              </div>
              <div className="card-body">
                <span className="tag">{p.category}</span>
                <h3>{p.name}</h3>
                <p className="muted small">{p.description}</p>
                <div className="card-foot">
                  <strong className="price">{formatNaira(p.price)}</strong>
                  <AddToCartButton product={p} />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
