import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "@/database/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getUserByEmail(credentials.email as string);
          
          if (!user) {
            return null;
          }

          // Check if user is active
          if (!user.is_active) {
            throw new Error("Account is deactivated");
          }

          // Check if user is approved (except for admins)
          if (user.user_type !== 'admin' && !user.is_approved) {
            throw new Error("Account is pending admin approval");
          }

          // For now, we'll use a simple password check
          // In production, you should hash passwords properly
          if (user.password_hash === credentials.password) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: `${user.first_name} ${user.last_name}`,
              userType: user.user_type,
              entityType: user.entity_type,
              company: user.company,
              isApproved: user.is_approved,
              isActive: user.is_active,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.userType = user.userType;
        token.entityType = user.entityType;
        token.company = user.company;
        token.isApproved = user.isApproved;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!;
        session.user.userType = token.userType;
        session.user.entityType = token.entityType;
        session.user.company = token.company;
        session.user.isApproved = token.isApproved;
        session.user.isActive = token.isActive;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
