import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("No user found with this email");
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          console.log("Incorrect password");
          return null;
        }
        if (!user.verified) {
          throw new Error("User not verified");
        }
        return {
          id: user.id.toString(), // Convert to string because JWT only stores strings
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // you're using JWT sessions
  },

  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          if (!dbUser.google_signin) {
            console.log("User found but not registered for Google Sign-In.");
            return `/auth/signin?error=GoogleSignInNotAllowed`;
          } else {
            return true;
          }
        } else {
          console.log("User not registered in the system.");
          const [firstName, ...lastParts] = user.name!.split(" ");
          const lastName = lastParts.join(" ");
          return `/auth/signup?fn=${firstName}&ln=${lastName}&em=${user.email}`;
        }
      }

      return true;
    },

    // 👇 Attach user.id to session.user
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id;
      }
      return session;
    },

    // 👇 Save user.id into token on login
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
  },
};
