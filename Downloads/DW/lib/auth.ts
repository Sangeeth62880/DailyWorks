import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { getServerSession } from "next-auth/next"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/db/mongodb"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"

// Define your user structure with the correct _id type
interface DbUser {
  _id: ObjectId;
  name?: string;
  email?: string;
  image?: string;
  password?: string;
  role?: string;
  rating?: number;
  jobsCompleted?: number;
  // other user properties
}

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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

        // Fetch additional user data if needed
        try {
          const { users } = await getCollections()
          
          // Use type assertion to work around the strict typing issues
          // This tells TypeScript that our filter is valid, even when mixing string and ObjectId
          const filter = { _id: new ObjectId(token.sub) } as any;
          
          const userData = await users.findOne(
            filter,
            { projection: { password: 0 } }
          ) as DbUser | null;

          if (userData) {
            session.user.role = userData.role || "user"
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
      }
      return token
    },
  },
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
}