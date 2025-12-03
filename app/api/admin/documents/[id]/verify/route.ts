import { connectDB } from "@/lib/db/mongoose"
import { DocumentModel } from "@/lib/models/Document"
import { getSessionUser } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/response"

// PATCH - Verify or unverify a document (admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== "admin") return errorResponse("Only admins can verify documents", 403)

    const body = await request.json()
    const { verified } = body
    if (typeof verified !== "boolean") return errorResponse("Missing verified flag", 400)

    const { id } = await params
    await connectDB()
    const doc = await DocumentModel.findById(id)
    if (!doc) return notFoundResponse()

    doc.verified = verified
    doc.verifiedBy = verified ? user.id : null
    doc.verifiedAt = verified ? new Date() : null
    await doc.save()

    return successResponse(doc)
  } catch (error) {
    console.error("Verify document error:", error)
    return errorResponse("Failed to verify document", 500)
  }
}

