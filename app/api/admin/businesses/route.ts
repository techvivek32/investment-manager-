import { connectDB } from "@/lib/db/mongoose"
import { Business } from "@/lib/models/Business"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List all businesses with optional status filter (admin only)
export async function GET(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can access this endpoint", 403)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    await connectDB()
    const query: any = {}
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status
    }

    const businesses = await Business.find(query).populate("ownerId", "name email").sort({ createdAt: -1 })
    return successResponse(businesses)
  } catch (error) {
    console.error("Admin list businesses error:", error)
    return errorResponse("Failed to fetch businesses", 500)
  }
}

