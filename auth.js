import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [Discord({ authorization: { params: { scope: "identify" } } })],
  callbacks: {
    jwt({ token, account, profile }) {
      // make sure the token carries the real Discord snowflake id
      if (account?.providerAccountId) token.sub = String(account.providerAccountId);
      else if (profile?.id) token.sub = String(profile.id);
      return token;
    },
    session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
        const adminIds = (process.env.ADMIN_DISCORD_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
        session.user.admin = adminIds.includes(token.sub);
      }
      return session;
    },
  },
});
