import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/User"
import { createUser } from "@/lib/db/auth"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List all users (admin only)
export async function GET(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can access this endpoint", 403)
    }

    await connectDB()

    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 })

    return successResponse(users)
  } catch (error) {
    console.error("Get users error:", error)
    return errorResponse("Failed to fetch users", 500)
  }
}

// POST - Create new user (admin only)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can create users", 403)
    }

    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return errorResponse("Missing required fields", 400)
    }

    if (!["admin", "business_owner", "investor"].includes(role)) {
      return errorResponse("Invalid role", 400)
    }

    await connectDB()

    const newUser = await createUser(name, email, password, role)

    return successResponse(newUser, 201)
  } catch (error) {
    console.error("Create user error:", error)
    const message = error instanceof Error ? error.message : "Failed to create user"
    return errorResponse(message, 500)
  }
}
