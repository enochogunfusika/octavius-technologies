import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getSupabase } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    // Save (or update) every user in the database when they sign in with Google
    async signIn({ user }) {
      if (!user.email) return false;
      const { error } = await getSupabase()
        .from("users")
        .upsert(
          {
            email: user.email,
            name: user.name,
            image: user.image,
            last_login_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );
      if (error) {
        console.error("Could not save user:", error.message);
        return false;
      }
      return true;
    },
  },
});
