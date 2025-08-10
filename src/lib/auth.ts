import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, User } from "@/database/db";
import { verifyPassword, SESSION_CONFIG } from "./security";

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
          throw new Error("Email and password are required");
        }

        try {
          const user = await getUserByEmail(credentials.email as string);
          
          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Type assertion to ensure user has the expected properties
          const typedUser = user as User;

          // Check if user is active
          if (!typedUser.is_active) {
            throw new Error("Account is deactivated. Please contact support.");
          }

          // Check if user is approved (except for admins)
          if (typedUser.user_type !== 'admin' && !typedUser.is_approved) {
            throw new Error("Account is pending admin approval. Please wait for approval or contact support.");
          }

          // Verify password using bcrypt
          const isPasswordValid = await verifyPassword(credentials.password as string, typedUser.password_hash);
          
          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: typedUser.id.toString(),
            email: typedUser.email,
            name: `${typedUser.first_name} ${typedUser.last_name}`,
            userType: typedUser.user_type,
            entityType: typedUser.entity_type,
            company: typedUser.company,
            isApproved: typedUser.is_approved,
            isActive: typedUser.is_active,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Re-throw the error with a custom message if it's not already an Error object
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error("Authentication failed. Please try again.");
          }
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
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + (SESSION_CONFIG.maxAge);
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
    maxAge: SESSION_CONFIG.maxAge,
    updateAge: SESSION_CONFIG.updateAge,
  },
  jwt: {
    maxAge: SESSION_CONFIG.maxAge,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
