import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export default async function AuthButtons() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button className="btn btn-ghost">Sign in</button>
      </form>
    );
  }

  return (
    <div className="user-menu">
      <Link href="/orders">My orders</Link>
      <span className="muted">Hi, {session.user.name?.split(" ")[0] ?? "there"}</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button className="btn btn-ghost">Sign out</button>
      </form>
    </div>
  );
}
