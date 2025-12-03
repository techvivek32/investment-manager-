import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { SessionUser, UserRole } from "../types"

/**
 * Get current session user
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  return session?.user as SessionUser | null
}

/**
 * Check if user has required role
 */
export async function requireRole(requiredRoles: UserRole | UserRole[]): Promise<{
  user: SessionUser | null
  authorized: boolean
}> {
  const user = await getSessionUser()
  if (!user) {
    return { user: null, authorized: false }
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  const authorized = roles.includes(user.role)

  return { user, authorized }
}

/**
 * Verify owner of resource
 */
export function isOwner(userId: string, ownerId: string): boolean {
  return userId === ownerId
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const { authorized } = await requireRole("admin")
  return authorized
}
