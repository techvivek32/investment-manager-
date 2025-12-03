import { connectDB } from "@/lib/db/mongoose"
import { Watchlist } from "@/lib/models/Watchlist"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

// GET - List watchlist for investor
export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== "investor") return errorResponse("Only investors can view watchlist", 403)
    await connectDB()
    const items = await Watchlist.find({ investorId: user.id }).sort({ createdAt: -1 })
    return successResponse(items)
  } catch (error) {
    console.error("Get watchlist error:", error)
    return errorResponse("Failed to fetch watchlist", 500)
  }
}

// POST - Add to watchlist
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== "investor") return errorResponse("Only investors can modify watchlist", 403)
    const body = await request.json()
    const { businessId } = body
    if (!businessId) return errorResponse("Missing businessId", 400)
    await connectDB()
    const item = await Watchlist.findOneAndUpdate(
      { investorId: user.id, businessId },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true },
    )
    return successResponse(item, 201)
  } catch (error) {
    console.error("Add watchlist error:", error)
    return errorResponse("Failed to add to watchlist", 500)
  }
}

// DELETE - Remove from watchlist
export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== "investor") return errorResponse("Only investors can modify watchlist", 403)
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")
    if (!businessId) return errorResponse("Missing businessId", 400)
    await connectDB()
    await Watchlist.deleteOne({ investorId: user.id, businessId })
    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Delete watchlist error:", error)
    return errorResponse("Failed to remove from watchlist", 500)
  }
}

