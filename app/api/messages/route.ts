import { connectDB } from "@/lib/db/mongoose"
import { Message } from "@/lib/models/Message"
import { BusinessVisibility } from "@/lib/models/BusinessVisibility"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List messages for a business where user participates
export async function GET(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")
    if (!businessId) return errorResponse("Missing businessId", 400)
    await connectDB()
    const messages = await Message.find({ businessId }).sort({ createdAt: 1 })
    return successResponse(messages)
  } catch (error) {
    console.error("Get messages error:", error)
    return errorResponse("Failed to fetch messages", 500)
  }
}

// POST - Send message (owner <-> investor, access controlled by visibility)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    const body = await request.json()
    const { businessId, receiverId, body: text } = body
    if (!businessId || !text) return errorResponse("Missing fields", 400)
    await connectDB()
    // ensure either owner or investor assigned
    const vis = await BusinessVisibility.findOne({ businessId })
    if (!vis) return errorResponse("No visibility", 403)
    let to = receiverId
    if (!to && user.role === "investor") {
      // send to owner
      to = vis.investorId.toString() === user.id ? (await (await import("@/lib/models/Business")).Business.findById(businessId))?.ownerId?.toString() : undefined
    }
    if (!to) return errorResponse("Missing receiverId", 400)
    const message = await Message.create({ businessId, senderId: user.id, receiverId: to, body: text })
    return successResponse(message, 201)
  } catch (error) {
    console.error("Post message error:", error)
    return errorResponse("Failed to send message", 500)
  }
}
