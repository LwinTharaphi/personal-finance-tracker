import dbConnect from "@/lib/mongodb";
import GithubProvider from "next-auth/providers/github";
import User from "@/models/User"

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
  
      },
      async redirect({ url, baseUrl }) {
        // Redirect to the dashboard after sign-in
        if (url === baseUrl) {
          return '/dashboard'; // Redirect to dashboard after sign-in
        }
        // Redirect to home page after sign-out
        return baseUrl; 
      },
      async session({ session, token }) {
        // Update session with user data from your database
        const user = await User.findOne({ githubId: token.githubId });
        if (user) {
          session.user = user;
          session.user.profilePicture = token.picture;
        }
        return session;
      },
      async jwt({ token, user }) {
        if (user) {
          token.githubId = user.githubId;
          token.username = user.username;
        }
        console.log({token});
        return token;
      },
    },
  };