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
    const existingUser = await users.findOne({ email })

    if (existingUser) {
      return {
        error: "Email already in use",
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await users.insertOne(newUser)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      error: "Failed to register. Please try again.",
    }
  }
}

