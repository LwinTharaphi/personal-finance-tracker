// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin", // Redirect to your sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET, // Add your secret here
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to the dashboard after sign-in
      return '/dashboard'; // Redirect to the dashboard page
    },
    async session({ session, token }) {
      // Add user ID to session if needed
      session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // Save user ID in the token
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
