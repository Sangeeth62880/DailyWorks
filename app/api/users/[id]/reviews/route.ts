import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerAuthSession } from "@/lib/auth"

// Define review interface
interface Review {
  _id?: string
  jobId: string
  reviewerId: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Create reviews collection if it doesn't exist
    const db = (await getCollections()).users.dbName
    const collections = await db.collections()

    if (!collections.find((c) => c.collectionName === "reviews")) {
      await db.createCollection("reviews")
    }

    const reviews = db.collection<Review>("reviews")

    // Get reviews for the user
    const userReviews = await reviews.find({ userId }).sort({ createdAt: -1 }).toArray()

    // Get reviewer details
    const { users, jobs } = await getCollections()

    const reviewsWithDetails = await Promise.all(
      userReviews.map(async (review) => {
        const reviewer = await users.findOne(
          { _id: new ObjectId(review.reviewerId) },
          { projection: { name: 1, image: 1 } },
        )

        const job = await jobs.findOne({ _id: new ObjectId(review.jobId) }, { projection: { title: 1 } })

        return {
          ...review,
          _id: review._id?.toString(),
          reviewer: reviewer
            ? {
                _id: reviewer._id.toString(),
                name: reviewer.name,
                image: reviewer.image,
              }
            : null,
          job: job
            ? {
                _id: job._id.toString(),
                title: job.title,
              }
            : null,
        }
      }),
    )

    return NextResponse.json({
      reviews: reviewsWithDetails,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Create reviews collection if it doesn't exist
    const db = (await getCollections()).users.dbName
    const collections = await db.collections()

    if (!collections.find((c) => c.collectionName === "reviews")) {
      await db.createCollection("reviews")
    }

    const reviews = db.collection<Review>("reviews")
    const { jobs, users } = await getCollections()

    const { jobId, rating, comment } = await request.json()

    // Validate required fields
    if (!jobId || !rating) {
      return NextResponse.json({ error: "Job ID and rating are required" }, { status: 400 })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if job exists and is completed
    const job = await jobs.findOne({
      _id: new ObjectId(jobId),
      status: "completed",
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found or not completed" }, { status: 404 })
    }

    // Check if user has already reviewed this job
    const existingReview = await reviews.findOne({
      jobId,
      reviewerId: session.user.id,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this job" }, { status: 400 })
    }

    // Create review
    const review: Review = {
      jobId,
      reviewerId: session.user.id,
      userId,
      rating,
      comment: comment || "",
      createdAt: new Date(),
    }

    const result = await reviews.insertOne(review)

    // Update user's average rating
    const allUserReviews = await reviews.find({ userId }).toArray()

    const totalRating = allUserReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allUserReviews.length

    await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          rating: Number.parseFloat(averageRating.toFixed(1)),
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      review: {
        ...review,
        _id: result.insertedId.toString(),
      },
      message: "Review submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}

