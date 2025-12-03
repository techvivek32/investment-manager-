import bcrypt from "bcryptjs"
import { User } from "../models/User"
import { connectDB } from "./mongoose"
import type { SessionUser } from "../types"

/**
 * Hash password for secure storage
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<any> {
  await connectDB()
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash")
  return user ? user.toObject() : null
}

/**
 * Get user session data (without password)
 */
export async function getUserSession(userId: string): Promise<SessionUser | null> {
  await connectDB()
  const user = await User.findById(userId)
  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

/**
 * Create a new user (Admin only)
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "admin" | "business_owner" | "investor",
): Promise<any> {
  await connectDB()

  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  const passwordHash = await hashPassword(password)

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  })

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  }
}
