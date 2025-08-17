import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, User } from "@/database/user";
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
          return null;
        }

        try {
          // Test database connection first
          const { testConnection } = await import("@/database/index");
          const isConnected = await testConnection();
          
          if (!isConnected) {
            console.error("Database connection failed during authentication");
            return null;
          }

          const user = await getUserByEmail(credentials.email as string);
          
          if (!user) {
            return null;
          }

          // Type assertion to ensure user has the expected properties
          const typedUser = user as User;

          // Check if user is active
          if (!typedUser.is_active) {
            return null;
          }

          // Check if user is approved (except for admins)
          if (typedUser.user_type !== 'admin' && !typedUser.is_approved) {
            return null;
          }

          // Verify password using bcrypt
          const isPasswordValid = await verifyPassword(credentials.password as string, typedUser.password_hash);
          
          if (!isPasswordValid) {
            return null;
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
            isSuperAdmin: Boolean((typedUser as any).is_super_admin),
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
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
        token.isSuperAdmin = Boolean(user.isSuperAdmin);
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
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
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
  // Add error handling to prevent HTML responses
  logger: {
    error(code, ...message) {
      console.error(`[NextAuth] Error ${code}:`, ...message);
    },
    warn(code, ...message) {
      console.warn(`[NextAuth] Warning ${code}:`, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[NextAuth] Debug ${code}:`, ...message);
      }
    },
  },
});
