import { connectDB } from "@/lib/db/mongoose"
import { Business } from "@/lib/models/Business"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/response"

// PATCH - Approve or reject business (admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can update business status", 403)
    }

    const body = await request.json()
    const { status } = body

    if (!["pending", "under_review", "verified", "approved", "rejected"].includes(status)) {
      return errorResponse("Invalid status", 400)
    }

    const { id } = await params
    await connectDB()

    const business = await Business.findByIdAndUpdate(id, { status }, { new: true }).populate(
      "ownerId",
      "name email",
    )

    if (!business) {
      return notFoundResponse()
    }

    // Notifications & audit log
    try {
      const { Notification } = await import("@/lib/models/Notification")
      const { AuditLog } = await import("@/lib/models/AuditLog")
      await Notification.create({
        userId: business.ownerId._id,
        type: status === "approved" ? "business_approved" : status === "rejected" ? "business_rejected" : "business_status",
        message: `Your business "${business.name}" status changed to ${status}`,
        data: { businessId: business._id.toString(), status },
      })
      await AuditLog.create({
        actorId: user.id,
        action: "update_business_status",
        entityType: "Business",
        entityId: business._id,
        metadata: { status },
      })
    } catch {}

    return successResponse(business)
  } catch (error) {
    console.error("Update business status error:", error)
    return errorResponse("Failed to update business status", 500)
  }
}
