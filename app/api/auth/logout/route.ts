import { successResponse } from "@/lib/utils/response"

export async function POST() {
  return successResponse({ message: "Logged out successfully" })
}
