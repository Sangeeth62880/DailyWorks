"use server"

import { getCollections } from "@/lib/db"
import { hash } from "bcryptjs"
import { z } from "zod"

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function registerUser(formData: FormData) {
  try {
    // Extract and validate form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate input
    const result = registerSchema.safeParse({ name, email, password })

    if (!result.success) {
      return {
        error: result.error.errors[0].message,
      }
    }

    const { users } = await getCollections()

    // Check if user already exists
    const existingUser = await users.findOne({ 
      email: email.toLowerCase() 
    })

    if (existingUser) {
      return {
        error: "Email already registered",
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      rating: 0,
      jobsCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.insertOne(newUser)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      error: "Failed to register. Please try again.",
    }
  }
}