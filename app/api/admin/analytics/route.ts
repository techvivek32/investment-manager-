import { connectDB } from "@/lib/db/mongoose"
import { Business } from "@/lib/models/Business"
import { Investment } from "@/lib/models/Investment"
import { User } from "@/lib/models/User"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== "admin") return errorResponse("Only admins", 403)
    await connectDB()

    const [investments, businesses, users] = await Promise.all([
      Investment.find({}).lean(),
      Business.find({}).lean(),
      User.find({}).lean(),
    ])

    const totalInvestments = investments.length
    const totalAmount = investments.reduce((s, i) => s + (i.amount || 0), 0)
    const byBusiness = new Map<string, number>()
    const byInvestor = new Map<string, number>()
    const byMonth = new Map<string, number>()

    for (const i of investments) {
      const b = i.businessId.toString()
      byBusiness.set(b, (byBusiness.get(b) || 0) + i.amount)
      const inv = i.investorId.toString()
      byInvestor.set(inv, (byInvestor.get(inv) || 0) + i.amount)
      const d = new Date(i.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      byMonth.set(key, (byMonth.get(key) || 0) + i.amount)
    }

    const mostInvestedBusinessId = Array.from(byBusiness.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
    const topInvestorId = Array.from(byInvestor.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]

    const mostInvestedBusiness = businesses.find((b) => b._id.toString() === mostInvestedBusinessId) || null
    const topInvestor = users.find((u) => u._id.toString() === topInvestorId) || null

    const statusCounts = businesses.reduce(
      (acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return successResponse({
      totals: { investments: totalInvestments, amount: totalAmount, users: users.length, businesses: businesses.length },
      mostInvestedBusiness,
      topInvestor,
      monthly: Array.from(byMonth.entries()).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)),
      businessStatus: statusCounts,
    })
  } catch (error) {
    console.error("Admin analytics error:", error)
    return errorResponse("Failed to fetch analytics", 500)
  }
}

