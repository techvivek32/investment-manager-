import mongoose, { Schema, type Document } from "mongoose"
import type { IDocument } from "../types"

interface DocumentDocument extends Document, IDocument {}

const documentSchema = new Schema<DocumentDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false, // Only use uploadedAt
  },
)

// Index for business documents
documentSchema.index({ businessId: 1 })

export const DocumentModel = mongoose.models.Document || mongoose.model<DocumentDocument>("Document", documentSchema)
