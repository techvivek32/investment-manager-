import { connectDB } from "@/lib/db/mongoose"
import { Investment } from "@/lib/models/Investment"
import { Business } from "@/lib/models/Business"
import { BusinessVisibility } from "@/lib/models/BusinessVisibility"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/response"

// GET - List own investments (investor) or investments for own businesses (owner)
export async function GET(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    await connectDB()

    let investments

    if (user.role === "investor") {
      // Investors see their own investments
      investments = await Investment.find({ investorId: user.id })
        .populate("businessId", "name minInvestmentAmount maxInvestmentAmount")
        .sort({ createdAt: -1 })
    } else if (user.role === "business_owner") {
      // Business owners see investments for their businesses
      const businesses = await Business.find({ ownerId: user.id })
      const businessIds = businesses.map((b) => b._id)

      investments = await Investment.find({ businessId: { $in: businessIds } })
        .populate("businessId", "name")
        .populate("investorId", "name email")
        .sort({ createdAt: -1 })
    } else {
      return errorResponse("Invalid role for this endpoint", 403)
    }

    return successResponse(investments)
  } catch (error) {
    console.error("Get investments error:", error)
    return errorResponse("Failed to fetch investments", 500)
  }
}

// POST - Create investment (investor only)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "investor") {
      return errorResponse("Only investors can create investments", 403)
    }

    const body = await request.json()
    const { businessId, amount } = body

    if (!businessId || !amount) {
      return errorResponse("Missing businessId or amount", 400)
    }

    if (amount <= 0) {
      return errorResponse("Investment amount must be greater than 0", 400)
    }

    await connectDB()

    // Verify business exists and is approved
    const business = await Business.findById(businessId)
    if (!business) {
      return notFoundResponse()
    }

    if (business.status !== "approved") {
      return errorResponse("Business is not approved for investments", 400)
    }

    // Verify investor has visibility to this business
    const visibility = await BusinessVisibility.findOne({
      investorId: user.id,
      businessId,
    })

    if (!visibility) {
      return errorResponse("You do not have access to this business", 403)
    }

    // Validate amount is within range
    if (amount < business.minInvestmentAmount || amount > business.maxInvestmentAmount) {
      return errorResponse(
        `Investment amount must be between ${business.minInvestmentAmount} and ${business.maxInvestmentAmount}`,
        400,
      )
    }

    const investment = await Investment.create({
      investorId: user.id,
      businessId,
      amount,
      status: "confirmed",
    })

    // Create agreement document (HTML endpoint reference) and notifications/audit
    try {
      const { DocumentModel } = await import("@/lib/models/Document")
      const { Notification } = await import("@/lib/models/Notification")
      const { AuditLog } = await import("@/lib/models/AuditLog")

      await DocumentModel.create({
        businessId,
        fileName: `investment-agreement-${investment._id}.html`,
        fileUrl: `/api/investments/${investment._id}/agreement`,
        documentType: "financials",
        verified: true,
        verifiedBy: user.id,
        verifiedAt: new Date(),
      })

      // Notify owner and admin
      const businessOwner = business.ownerId.toString()
      await Notification.create({
        userId: businessOwner,
        type: "investment_created",
        message: `New investment of ${amount} in ${business.name}`,
        data: { investmentId: investment._id.toString(), businessId },
      })
      // For admin notifications, we may not have a single admin user; skip or log audit
      await AuditLog.create({
        actorId: user.id,
        action: "create_investment",
        entityType: "Investment",
        entityId: investment._id,
        metadata: { amount, businessId },
      })
    } catch {}

    return successResponse(investment, 201)
  } catch (error) {
    console.error("Create investment error:", error)
    return errorResponse("Failed to create investment", 500)
  }
}
