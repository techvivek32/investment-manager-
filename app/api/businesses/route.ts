import { connectDB } from "@/lib/db/mongoose"
import { Business } from "@/lib/models/Business"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List businesses (owner lists their own, admin lists all)
export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    await connectDB()

    const query: any = {}

    // Business owners see only their own businesses
    if (user.role === "business_owner") {
      query.ownerId = user.id
    }
    // Admins see all businesses
    // Investors shouldn't directly access this endpoint

    const businesses = await Business.find(query).populate("ownerId", "name email").sort({ createdAt: -1 })

    return successResponse(businesses)
  } catch (error) {
    console.error("Get businesses error:", error)
    return errorResponse("Failed to fetch businesses", 500)
  }
}

// POST - Create new business (owner only)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "business_owner") {
      return errorResponse("Only business owners can create businesses", 403)
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      latitude,
      longitude,
      minInvestmentAmount,
      maxInvestmentAmount,
      expectedReturnPercentage,
    } = body

    // Validation
    if (!name || !description || latitude === undefined || longitude === undefined) {
      return errorResponse("Missing required fields", 400)
    }

    if (!minInvestmentAmount || !maxInvestmentAmount || minInvestmentAmount > maxInvestmentAmount) {
      return errorResponse("Invalid investment amounts", 400)
    }

    await connectDB()

    const business = await Business.create({
      ownerId: user.id,
      name,
      description,
      category,
      latitude,
      longitude,
      minInvestmentAmount,
      maxInvestmentAmount,
      expectedReturnPercentage,
      status: "pending",
    })

    return successResponse(business, 201)
  } catch (error) {
    console.error("Create business error:", error)
    return errorResponse("Failed to create business", 500)
  }
}
