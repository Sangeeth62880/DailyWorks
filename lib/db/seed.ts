import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

// This script would be run separately to seed the database with initial data

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI is not defined")
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("daywork")

    // Clear existing collections
    await db.collection("users").deleteMany({})
    await db.collection("jobs").deleteMany({})
    await db.collection("applications").deleteMany({})
    await db.collection("messages").deleteMany({})
    await db.collection("conversations").deleteMany({})
    await db.collection("categories").deleteMany({})

    // Create categories
    const categories = [
      {
        name: "Cleaning",
        slug: "cleaning",
        description: "House cleaning, office cleaning, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Delivery",
        slug: "delivery",
        description: "Package delivery, food delivery, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Moving",
        slug: "moving",
        description: "Help with moving furniture, boxes, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Gardening",
        slug: "gardening",
        description: "Lawn mowing, planting, weeding, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Handyman",
        slug: "handyman",
        description: "Minor repairs, furniture assembly, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Photography",
        slug: "photography",
        description: "Event photography, product photography, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Event Staff",
        slug: "event-staff",
        description: "Bartenders, servers, security, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Office Help",
        slug: "office-help",
        description: "Administrative tasks, data entry, and more",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const categoriesResult = await db.collection("categories").insertMany(categories)
    console.log(`${categoriesResult.insertedCount} categories inserted`)

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10)

    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        image: null,
        bio: "Experienced handyman with 5+ years of experience",
        skills: ["Moving", "Handyman", "Gardening"],
        rating: 4.8,
        jobsCompleted: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        image: null,
        bio: "Professional cleaner and organizer",
        skills: ["Cleaning", "Office Help"],
        rating: 4.9,
        jobsCompleted: 36,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: hashedPassword,
        image: null,
        bio: "Reliable delivery driver with own vehicle",
        skills: ["Delivery", "Moving"],
        rating: 4.7,
        jobsCompleted: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const usersResult = await db.collection("users").insertMany(users)
    console.log(`${usersResult.insertedCount} users inserted`)

    // Create jobs
    const jobs = [
      {
        title: "Moving Assistant",
        description: "Help with moving furniture and boxes for a small apartment. No heavy lifting required.",
        location: "Downtown",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: 8,
        rate: 150,
        category: "moving",
        requirements: [
          "Ability to lift up to 25 pounds",
          "Reliable transportation to the job site",
          "Good communication skills",
          "Previous moving experience is a plus but not required",
        ],
        status: "open",
        createdBy: usersResult.insertedIds[0].toString(),
        applicants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Event Staff - Concert",
        description: "Assist with ticket scanning, crowd management, and general support at a local concert.",
        location: "Music Hall",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        duration: 6,
        rate: 120,
        category: "event-staff",
        requirements: [
          "Previous event experience preferred",
          "Ability to stand for long periods",
          "Customer service skills",
          "Must be 18 or older",
        ],
        status: "open",
        createdBy: usersResult.insertedIds[1].toString(),
        applicants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Office Help - Data Entry",
        description: "Data entry and administrative support for a local business. Experience with Excel preferred.",
        location: "Business District",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 8,
        rate: 140,
        category: "office-help",
        requirements: [
          "Proficient in Microsoft Office",
          "Attention to detail",
          "Fast typing speed",
          "Professional demeanor",
        ],
        status: "open",
        createdBy: usersResult.insertedIds[2].toString(),
        applicants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const jobsResult = await db.collection("jobs").insertMany(jobs)
    console.log(`${jobsResult.insertedCount} jobs inserted`)

    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

// Run the seed function
seed().catch(console.error)

