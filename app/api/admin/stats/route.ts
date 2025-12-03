import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/User"
import { Business } from "@/lib/models/Business"
import { Investment } from "@/lib/models/Investment"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - Platform stats (admin only)
export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can access this endpoint", 403)
    }

    await connectDB()

    const [totalUsers, totalBusinesses, pendingBusinesses, approvedBusinesses, rejectedBusinesses, totalInvestments] =
      await Promise.all([
        User.countDocuments({}),
        Business.countDocuments({}),
        Business.countDocuments({ status: "pending" }),
        Business.countDocuments({ status: "approved" }),
        Business.countDocuments({ status: "rejected" }),
        Investment.countDocuments({}),
      ])

    return successResponse({
      users: { total: totalUsers },
      businesses: {
        total: totalBusinesses,
        pending: pendingBusinesses,
        approved: approvedBusinesses,
        rejected: rejectedBusinesses,
      },
      investments: { total: totalInvestments },
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    return errorResponse("Failed to fetch stats", 500)
  }
}

