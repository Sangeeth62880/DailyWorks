// This file defines the MongoDB schemas and models for the application

// User model
export interface User {
  _id?: string
  name: string
  email: string
  password?: string // Hashed password for credential auth
  image?: string
  bio?: string
  skills?: string[]
  rating?: number
  jobsCompleted?: number
  createdAt: Date
  updatedAt: Date
  // OAuth related fields
  accounts?: Account[]
  // Session related fields
  sessions?: Session[]
}

// OAuth Account model
export interface Account {
  provider: string
  providerAccountId: string
  userId: string
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_at?: number
}

// Session model
export interface Session {
  sessionToken: string
  userId: string
  expires: Date
}

// Job model
export interface Job {
  _id?: string
  title: string
  description: string
  location: string
  date: Date
  duration: number // in hours
  rate: number
  category: string
  skills?: string[]
  status: "open" | "assigned" | "completed" | "cancelled"
  createdBy: string // User ID
  assignedTo?: string // User ID
  applicants?: string[] // Array of User IDs
  createdAt: Date
  updatedAt: Date
}

// Application model
export interface Application {
  _id?: string
  jobId: string
  userId: string
  status: "pending" | "accepted" | "rejected"
  message?: string
  createdAt: Date
  updatedAt: Date
}

// Message model
export interface Message {
  _id?: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: Date
}

// Conversation model
export interface Conversation {
  _id?: string
  participants: string[] // Array of User IDs
  jobId?: string // Optional, if the conversation is related to a job
  lastMessage?: string
  lastMessageDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Category model
export interface Category {
  _id?: string
  name: string
  slug: string
  description?: string
  icon?: string
  createdAt: Date
  updatedAt: Date
}

