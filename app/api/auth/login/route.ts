import { connectDB } from "@/lib/db/mongoose"
import { findUserByEmail, verifyPassword } from "@/lib/db/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse("Email and password are required", 400)
    }

    await connectDB()

    // Find user
    const user = await findUserByEmail(email)
    if (!user) {
      return unauthorizedResponse()
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse("User account is deactivated", 403)
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return unauthorizedResponse()
    }

    // Return user data (without password)
    return successResponse({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return errorResponse("Login failed", 500)
  }
}
