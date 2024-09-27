
// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
// import type { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Add your secret here
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to the dashboard after sign-in
      if (url === baseUrl) {
        return '/dashboard'; // Redirect to dashboard after sign-in
      }
      // Redirect to home page after sign-out
      return baseUrl; // Redirect to base URL after sign-out
    },
    async session({ session, token }) {
      if (token){
        session.user.id = token.id;
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile.id; // Save user ID in the token
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
