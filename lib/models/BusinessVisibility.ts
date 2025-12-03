import mongoose, { Schema, type Document } from "mongoose"
import type { IBusinessVisibility } from "../types"

interface BusinessVisibilityDocument extends Document, IBusinessVisibility {}

const businessVisibilitySchema = new Schema<BusinessVisibilityDocument>(
  {
    investorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Only use createdAt
  },
)

// Composite index to prevent duplicate visibility assignments
businessVisibilitySchema.index({ investorId: 1, businessId: 1 }, { unique: true })

export const BusinessVisibility =
  mongoose.models.BusinessVisibility ||
  mongoose.model<BusinessVisibilityDocument>("BusinessVisibility", businessVisibilitySchema)
