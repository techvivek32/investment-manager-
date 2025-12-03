import { connectDB } from "@/lib/db/mongoose"
import { Notification } from "@/lib/models/Notification"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List current user's notifications
export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    await connectDB()
    const items = await Notification.find({ userId: user.id }).sort({ createdAt: -1 })
    return successResponse(items)
  } catch (error) {
    console.error("Get notifications error:", error)
    return errorResponse("Failed to fetch notifications", 500)
  }
}

// PATCH - Mark notification as read
export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    const body = await request.json()
    const { id } = body
    if (!id) return errorResponse("Missing id", 400)
    await connectDB()
    await Notification.updateOne({ _id: id, userId: user.id }, { $set: { read: true } })
    return successResponse({ updated: true })
  } catch (error) {
    console.error("Patch notifications error:", error)
    return errorResponse("Failed to update notification", 500)
  }
}

