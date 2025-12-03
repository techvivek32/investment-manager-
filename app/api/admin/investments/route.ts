import { connectDB } from "@/lib/db/mongoose"
import { Investment } from "@/lib/models/Investment"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List all investments (admin only)
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

    const investments = await Investment.find()
      .populate("investorId", "name email")
      .populate("businessId", "name")
      .sort({ createdAt: -1 })

    return successResponse(investments)
  } catch (error) {
    console.error("Get investments error:", error)
    return errorResponse("Failed to fetch investments", 500)
  }
}
