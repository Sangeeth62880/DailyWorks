import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { getServerSession } from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/db/mongodb"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { users } = await getCollections()
          const user = await users.findOne({ email: credentials.email })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role || "job_finder", // Include role in the token
          }
        } catch (error) {
          console.error("Error during authentication:", error)
          return null
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string

        // Ensure role is set from token first
        if (token.role) {
          session.user.role = token.role as string
        }

        // Fetch additional user data if needed
        try {
          const { users } = await getCollections()
          const userData = await users.findOne({ _id: new ObjectId(token.sub) }, { projection: { password: 0 } })

          if (userData) {
            // Update with fresh data from database
            session.user.role = userData.role || "job_finder"
            session.user.rating = userData.rating || 0
            session.user.jobsCompleted = userData.jobsCompleted || 0
          }
        } catch (error) {
          console.error("Error fetching user data for session:", error)
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = user.role || "job_finder" // Add role to token
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  debug: process.env.NODE_ENV === "development",
}

export const getServerAuthSession = () => getServerSession(authOptions)

// Type definitions for enhanced session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      rating?: number
      jobsCompleted?: number
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

