"use server"

import { getCollections } from "@/lib/db"
import { getServerAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

export async function createJob(formData: FormData) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return {
        error: "You must be logged in to post a job",
      }
    }

    const { jobs } = await getCollections()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const date = new Date(formData.get("date") as string)
    const duration = Number.parseInt(formData.get("duration") as string)
    const rate = Number.parseInt(formData.get("rate") as string)
    const requirements = formData.get("requirements") as string

    // Validate required fields
    if (!title || !description || !category || !location || !date || !duration || !rate) {
      return {
        error: "All required fields must be provided",
      }
    }

    const newJob = {
      title,
      description,
      category,
      location,
      date,
      duration,
      rate,
      requirements,
      status: "open",
      createdBy: session.user.id,
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await jobs.insertOne(newJob)

    revalidatePath("/jobs")
    revalidatePath("/dashboard")

    return {
      success: true,
      jobId: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error creating job:", error)
    return {
      error: "Failed to create job. Please try again.",
    }
  }
}

export async function applyToJob(jobId: string, message: string) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return {
        error: "You must be logged in to apply for a job",
      }
    }

    const { jobs, applications } = await getCollections()
    const userId = session.user.id

    // Check if job exists
    const job = await jobs.findOne({ _id: new ObjectId(jobId) })

    if (!job) {
      return {
        error: "Job not found",
      }
    }

    // Check if user has already applied
    const existingApplication = await applications.findOne({
      jobId: jobId,
      userId: userId,
    })

    if (existingApplication) {
      return {
        error: "You have already applied to this job",
      }
    }

    // Create application
    const application = {
      jobId: jobId,
      userId: userId,
      status: "pending",
      message: message || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await applications.insertOne(application)

    // Update job applicants
    await jobs.updateOne({ _id: new ObjectId(jobId) }, { $push: { applicants: userId } })

    revalidatePath(`/jobs/${jobId}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      applicationId: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error applying to job:", error)
    return {
      error: "Failed to submit application. Please try again.",
    }
  }
}

