import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
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

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user) {
                        console.log("No user found with this email");
                        return null;
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        console.log("Incorrect password");
                        return null;
                    }

                    console.log("User authenticated successfully:", user.email);
                    return {
                        id: user.id.toString(),
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                    };
                } catch (error) {
                    console.error("Error during authentication:", error);
                    return null;
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/signin",
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
                    const [firstName, ...lastParts] = user.name.split(" ");
                    const lastName = lastParts.join(" ");
                    const email = user.email;
                    return `/auth/signup?fn=${firstName}&ln=${lastName}&em=${email}`;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
};
