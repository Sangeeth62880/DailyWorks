import { NextResponse } from "next/server"
import { getCollections } from "@/lib/db"

export async function GET() {
  try {
    const { categories } = await getCollections()

    const categoriesData = await categories.find().toArray()

    return NextResponse.json({ categories: categoriesData })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

