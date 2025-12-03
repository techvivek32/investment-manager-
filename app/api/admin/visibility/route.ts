import { connectDB } from "@/lib/db/mongoose"
import { BusinessVisibility } from "@/lib/models/BusinessVisibility"
import { User } from "@/lib/models/User"
import { Business } from "@/lib/models/Business"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/response"

// GET - List all visibility assignments (admin only)
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

    const visibility = await BusinessVisibility.find()
      .populate("investorId", "name email")
      .populate("businessId", "name status")

    return successResponse(visibility)
  } catch (error) {
    console.error("Get visibility error:", error)
    return errorResponse("Failed to fetch visibility records", 500)
  }
}

// POST - Assign business to investor (admin only)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can assign visibility", 403)
    }

    const body = await request.json()
    const { investorId, businessId } = body

    if (!investorId || !businessId) {
      return errorResponse("Missing investorId or businessId", 400)
    }

    await connectDB()

    // Verify investor exists and has investor role
    const investor = await User.findById(investorId)
    if (!investor || investor.role !== "investor") {
      return errorResponse("Invalid investor", 400)
    }

    // Verify business exists
    const business = await Business.findById(businessId)
    if (!business) {
      return notFoundResponse()
    }

    // Check if assignment already exists
    const existing = await BusinessVisibility.findOne({ investorId, businessId })
    if (existing) {
      return errorResponse("Business already assigned to this investor", 400)
    }

    const visibility = await BusinessVisibility.create({
      investorId,
      businessId,
    })

    // Notify investor and audit
    try {
      const { Notification } = await import("@/lib/models/Notification")
      const { AuditLog } = await import("@/lib/models/AuditLog")
      await Notification.create({
        userId: investorId,
        type: "business_assigned",
        message: "A new business has been assigned to you",
        data: { businessId },
      })
      await AuditLog.create({
        actorId: user.id,
        action: "assign_visibility",
        entityType: "BusinessVisibility",
        entityId: visibility._id,
        metadata: { investorId, businessId },
      })
    } catch {}

    return successResponse(visibility, 201)
  } catch (error) {
    console.error("Create visibility error:", error)
    return errorResponse("Failed to assign business to investor", 500)
  }
}
