import { MongoClient } from "mongodb"
import type { User, Job, Application, Message, Conversation, Category } from "./models"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Helper function to get database collections
export async function getCollections() {
  const client = await clientPromise
  const db = client.db("daywork")

  return {
    users: db.collection<User>("users"),
    jobs: db.collection<Job>("jobs"),
    applications: db.collection<Application>("applications"),
    messages: db.collection<Message>("messages"),
    conversations: db.collection<Conversation>("conversations"),
    categories: db.collection<Category>("categories"),
  }
}

export default clientPromise

