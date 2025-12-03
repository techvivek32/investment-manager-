import { connectDB } from "@/lib/db/mongoose"
import { Business } from "@/lib/models/Business"
import { Investment } from "@/lib/models/Investment"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== "business_owner") return errorResponse("Only owners", 403)
    await connectDB()
    const businesses = await Business.find({ ownerId: user.id }).lean()
    const businessIds = businesses.map((b) => b._id)
    const investments = await Investment.find({ businessId: { $in: businessIds } }).lean()

    const byBusiness = new Map<string, { amount: number; count: number }>()
    const byDay = new Map<string, number>()
    for (const i of investments) {
      const b = i.businessId.toString()
      byBusiness.set(b, { amount: (byBusiness.get(b)?.amount || 0) + i.amount, count: (byBusiness.get(b)?.count || 0) + 1 })
      const d = new Date(i.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      byDay.set(key, (byDay.get(key) || 0) + i.amount)
    }

    const breakdown = businesses.map((b) => ({
      businessId: b._id.toString(),
      name: b.name,
      investments: byBusiness.get(b._id.toString())?.count || 0,
      amount: byBusiness.get(b._id.toString())?.amount || 0,
      monthlyRevenue: b.monthlyRevenue,
      profitMargin: b.profitMargin,
      growthPercentage: b.growthPercentage,
      customerCount: b.customerCount,
    }))

    const daily = Array.from(byDay.entries()).map(([day, amount]) => ({ day, amount })).sort((a, b) => a.day.localeCompare(b.day))

    return successResponse({ breakdown, daily })
  } catch (error) {
    console.error("Owner analytics error:", error)
    return errorResponse("Failed to fetch analytics", 500)
  }
}

