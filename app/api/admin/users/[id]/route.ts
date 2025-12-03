import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/User"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/response"
import mongoose from "mongoose"

// PATCH - Update user (admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can update users", 403)
    }

    const body = await request.json()
    const allowed = ["name", "email", "role", "isActive"]
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user id", 400)
    }

    await connectDB()
    const target = await User.findById(id)
    if (!target) {
      return notFoundResponse()
    }

    allowed.forEach((k) => {
      if (body[k] !== undefined) {
        ;(target as any)[k] = body[k]
      }
    })

    await target.save()
    const sanitized = await User.findById(id).select("-passwordHash")
    return successResponse(sanitized)
  } catch (error) {
    console.error("Update user error:", error)
    return errorResponse("Failed to update user", 500)
  }
}

// DELETE - Remove user (admin only)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    if (user.role !== "admin") {
      return errorResponse("Only admins can delete users", 403)
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user id", 400)
    }

    await connectDB()
    const result = await User.findByIdAndDelete(id)
    if (!result) {
      return notFoundResponse()
    }
    return successResponse({ deleted: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return errorResponse("Failed to delete user", 500)
  }
}
