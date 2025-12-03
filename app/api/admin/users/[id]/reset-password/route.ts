import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/User"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/response"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

// PATCH - Reset user password (admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can reset passwords", 403)
    }

    const { id } = await params
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400)
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user id", 400)
    }

    await connectDB()
    const target = await User.findById(id)
    if (!target) {
      return notFoundResponse()
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    target.passwordHash = passwordHash
    await target.save()

    return successResponse({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return errorResponse("Failed to reset password", 500)
  }
}
