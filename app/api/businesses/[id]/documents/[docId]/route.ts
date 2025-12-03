import { connectDB } from "@/lib/db/mongoose"
import { DocumentModel } from "@/lib/models/Document"
import { Business } from "@/lib/models/Business"
import { getSessionUser, isOwner } from "@/lib/middleware/auth"
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
} from "@/lib/utils/response"

// DELETE - Remove document (owner only)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { id, docId } = await params
    await connectDB()

    const business = await Business.findById(id)
    if (!business) {
      return notFoundResponse()
    }

    if (user.role !== "business_owner" || !isOwner(user.id, business.ownerId.toString())) {
      return forbiddenResponse()
    }

    const document = await DocumentModel.findById(docId)
    if (!document || document.businessId.toString() !== id) {
      return notFoundResponse()
    }

    await DocumentModel.findByIdAndDelete(docId)
    business.documents = business.documents.filter((d: any) => d.toString() !== docId)
    await business.save()

    return successResponse({ message: "Document deleted" })
  } catch (error) {
    console.error("Delete document error:", error)
    return errorResponse("Failed to delete document", 500)
  }
}
