import { connectDB } from "@/lib/db/mongoose"
import { Announcement } from "@/lib/models/Announcement"
import { BusinessVisibility } from "@/lib/models/BusinessVisibility"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List announcements for a business
export async function GET(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")
    await connectDB()
    const query: any = {}
    if (businessId) query.businessId = businessId
    const items = await Announcement.find(query).sort({ createdAt: -1 })
    return successResponse(items)
  } catch (error) {
    console.error("Get announcements error:", error)
    return errorResponse("Failed to fetch announcements", 500)
  }
}

// POST - Create announcement (owner only)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== "business_owner") return errorResponse("Only owners can post updates", 403)
    const body = await request.json()
    const { businessId, title, content } = body
    if (!businessId || !title || !content) return errorResponse("Missing fields", 400)
    await connectDB()
    const item = await Announcement.create({ businessId, ownerId: user.id, title, content })
    // notify assigned investors
    try {
      const { Notification } = await import("@/lib/models/Notification")
      const assigns = await BusinessVisibility.find({ businessId })
      await Promise.all(
        assigns.map((a) =>
          Notification.create({
            userId: a.investorId,
            type: "business_update",
            message: title,
            data: { businessId },
          }),
        ),
      )
    } catch {}
    return successResponse(item, 201)
  } catch (error) {
    console.error("Post announcement error:", error)
    return errorResponse("Failed to post announcement", 500)
  }
}

