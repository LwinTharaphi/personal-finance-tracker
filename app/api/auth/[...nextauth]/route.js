// app/api/auth/[...nextauth]/route.ts

// import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import dbConnect from "@/lib/mongodb";
import NextAuth from "next-auth";
// import {Account , User as AuthUser} from "next-auth";
import GithubProvider from "next-auth/providers/github";
// import Credentials from "next-auth/providers/credentials";
import User from "@/models/User"
// import mongoose from "mongoose";
// import { signIn } from "next-auth/react";
// import clientPromise from "@/lib/mongodb"
// await dbConnect();
export const authOptions = {
  // await dbConnect();
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
  // adapter: MongoDBAdapter({
  //   db: mongoose.connection.getClient(),
  // }),
  // adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET, // Add your secret here
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({user,account,profile}){
      if (account.provider == 'github'){
        await dbConnect();
        const existingUser = await User.findOne({githubId: profile.id});
        if (!existingUser){
          const newUser = new User({
            githubId: profile.id,
            username: profile.login,
            email: user.email,
            profilePictue: profile.avatar_url,
          });
          try {
            await newUser.save();
          } catch(error){
            console.error('Error saving user to database:',error);
            return false;
          }
        }
        user.githubId = profile.id;
        user.username = profile.login;
        return true;
      } 
      return false;
      //   try {
      //     const existingUser = await User.findOne({email: user.email});
      //     if (!existingUser){
      //       const newUser = new User({
      //         email: user.email
      //       });

      //       await newUser.save();
      //       return true;
      //     }
      //     return true
      //   } catch(err){
      //     console.log("Error saving user",err);
      //     return false;
      //   }
      // }

    },
    async redirect({ url, baseUrl }) {
      // Redirect to the dashboard after sign-in
      if (url === baseUrl) {
        return '/dashboard'; // Redirect to dashboard after sign-in
      }
      // Redirect to home page after sign-out
      return baseUrl; // Redirect to base URL after sign-out
    },
    async session({ session, token }) {
      if (token && token.githubId){
        session.user.githubId = token.githubId;
        // session.accessToken = token.accessToken;
        // session.user.githubId = user.githubId || token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // token.accessToken = account.accessToken;
        token.githubId = user.githubId;
        token.username = user.username;
        // token.id = profile.id; // Save user ID in the token
      }
      console.log({token});
      return token;
    },
  },
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
