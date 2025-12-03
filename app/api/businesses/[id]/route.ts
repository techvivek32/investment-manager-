import { connectDB } from "@/lib/db/mongoose"
import { Business } from "@/lib/models/Business"
import { BusinessVisibility } from "@/lib/models/BusinessVisibility"
import { getSessionUser, isOwner } from "@/lib/middleware/auth"
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
} from "@/lib/utils/response"

// GET - Retrieve business details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params
    await connectDB()

    const business = await Business.findById(id).populate("ownerId", "name email").populate("documents")

    if (!business) {
      return notFoundResponse()
    }

    // Authorization checks
    if (user.role === "business_owner") {
      // Owners can only see their own businesses
      if (!isOwner(user.id, business.ownerId._id.toString())) {
        return forbiddenResponse()
      }
    } else if (user.role === "investor") {
      // Investors can only see businesses assigned to them
      if (business.status !== "approved") {
        return forbiddenResponse()
      }

      const visibility = await BusinessVisibility.findOne({
        investorId: user.id,
        businessId: id,
      })

      if (!visibility) {
        return forbiddenResponse()
      }
    }
    // Admins can see all businesses

    return successResponse(business)
  } catch (error) {
    console.error("Get business error:", error)
    return errorResponse("Failed to fetch business", 500)
  }
}

// PATCH - Update business (owner only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params
    await connectDB()

    const business = await Business.findById(id)
    if (!business) {
      return notFoundResponse()
    }

    // Only owner can edit
    if (!isOwner(user.id, business.ownerId.toString())) {
      return forbiddenResponse()
    }

    // Can only edit if pending or rejected
    if (business.status === "approved") {
      return errorResponse("Cannot edit approved businesses", 400)
    }

    const body = await request.json()
    const allowedFields = [
      "name",
      "description",
      "category",
      "latitude",
      "longitude",
      "minInvestmentAmount",
      "maxInvestmentAmount",
      "expectedReturnPercentage",
      "monthlyRevenue",
      "profitMargin",
      "growthPercentage",
      "customerCount",
    ]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        ;(business as any)[field] = body[field]
      }
    })

    await business.save()

    return successResponse(business)
  } catch (error) {
    console.error("Update business error:", error)
    return errorResponse("Failed to update business", 500)
  }
}
