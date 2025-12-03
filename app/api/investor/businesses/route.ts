import { connectDB } from "@/lib/db/mongoose"
import { Business } from "@/lib/models/Business"
import { BusinessVisibility } from "@/lib/models/BusinessVisibility"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List visible businesses for investor
export async function GET(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "investor") {
      return errorResponse("Only investors can access this endpoint", 403)
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || undefined
    const category = searchParams.get("category") || undefined
    const status = searchParams.get("status") || "approved"
    const min = searchParams.get("min")
    const max = searchParams.get("max")

    // Find all visibility records for this investor
    const visibilityRecords = await BusinessVisibility.find({ investorId: user.id })
    const businessIds = visibilityRecords.map((record) => record.businessId)

    const query: any = { _id: { $in: businessIds } }
    if (status) query.status = status
    if (category) query.category = category
    if (q) query.name = { $regex: q, $options: "i" }
    if (min || max) {
      query.minInvestmentAmount = {}
      if (min) query.minInvestmentAmount.$gte = Number(min)
      if (max) query.minInvestmentAmount.$lte = Number(max)
    }

    const businesses = await Business.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 })

    return successResponse(businesses)
  } catch (error) {
    console.error("Get investor businesses error:", error)
    return errorResponse("Failed to fetch businesses", 500)
  }
}
