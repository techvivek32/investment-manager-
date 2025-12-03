import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "@/lib/db/mongoose"
import { findUserByEmail, verifyPassword } from "@/lib/db/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        try {
          await connectDB()

          // Find user by email
          const user = await findUserByEmail(credentials.email)
          if (!user) {
            throw new Error("Invalid email or password")
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error("User account is deactivated")
          }

          // Verify password
          const isValid = await verifyPassword(credentials.password, user.passwordHash)
          if (!isValid) {
            throw new Error("Invalid email or password")
          }

          // Return user object for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On login, add user data to token
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Add token data to session
      if (session.user) {
        session.user = {
          id: token.id as string,
          email: token.email || "",
          name: token.name as string,
          role: token.role as any,
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
