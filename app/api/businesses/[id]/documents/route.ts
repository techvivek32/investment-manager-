import { connectDB } from "@/lib/db/mongoose"
import { DocumentModel } from "@/lib/models/Document"
import { Business } from "@/lib/models/Business"
import { BusinessVisibility } from "@/lib/models/BusinessVisibility"
import { getSessionUser, isOwner } from "@/lib/middleware/auth"
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
} from "@/lib/utils/response"

// GET - List documents for a business
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params
    await connectDB()

    const business = await Business.findById(id)
    if (!business) {
      return notFoundResponse()
    }

    // Authorization: owner, admin, or assigned investor
    if (user.role === "business_owner") {
      if (!isOwner(user.id, business.ownerId.toString())) {
        return forbiddenResponse()
      }
    } else if (user.role === "investor") {
      if (business.status !== "approved") {
        return forbiddenResponse()
      }

      const visibility = await BusinessVisibility.findOne({
        investorId: user.id,
        businessId: id,
      })

      if (!visibility) {
        return forbiddenResponse()
      }
    }
    // Admins can see all documents

    const documents = await DocumentModel.find({ businessId: id })

    return successResponse(documents)
  } catch (error) {
    console.error("Get documents error:", error)
    return errorResponse("Failed to fetch documents", 500)
  }
}

// POST - Upload document (owner only)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params
    await connectDB()

    const business = await Business.findById(id)
    if (!business) {
      return notFoundResponse()
    }

    if (user.role !== "business_owner" || !isOwner(user.id, business.ownerId.toString())) {
      return forbiddenResponse()
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string

    if (!file || !documentType) {
      return errorResponse("Missing required fields", 400)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fs = await import("fs/promises")
    const path = await import("path")
    
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })
    
    const fileName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)
    
    const fileUrl = `/uploads/${fileName}`

    const document = await DocumentModel.create({
      businessId: id,
      fileName: file.name,
      fileUrl,
      documentType,
    })

    business.documents.push(document._id)
    await business.save()

    try {
      const { AuditLog } = await import("@/lib/models/AuditLog")
      await AuditLog.create({
        actorId: user.id,
        action: "upload_document",
        entityType: "Document",
        entityId: document._id,
        metadata: { businessId: id, documentType },
      })
    } catch {}

    return successResponse(document, 201)
  } catch (error) {
    console.error("Create document error:", error)
    return errorResponse("Failed to upload document", 500)
  }
}
