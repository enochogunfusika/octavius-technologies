import { auth } from "@/auth";
import CheckoutForm from "@/components/CheckoutForm";
import GoogleSignIn from "@/components/GoogleSignIn";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="empty">
        <h1>Sign in to check out</h1>
        <p className="muted">We use your Google account to save your order and email your receipt.</p>
        <GoogleSignIn redirectTo="/checkout" />
      </div>
    );
  }

  return <CheckoutForm email={session.user.email} name={session.user.name ?? ""} />;
}
