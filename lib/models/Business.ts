import mongoose, { Schema, type Document } from "mongoose"
import type { IBusiness } from "../types"

interface BusinessDocument extends Document, IBusiness {}

const businessSchema = new Schema<BusinessDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: null,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "verified", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    minInvestmentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxInvestmentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedReturnPercentage: {
      type: Number,
      default: null,
    },
    documents: {
      type: [Schema.Types.ObjectId],
      ref: "Document",
      default: [],
    },
    monthlyRevenue: {
      type: Number,
      default: null,
    },
    profitMargin: {
      type: Number,
      default: null,
    },
    growthPercentage: {
      type: Number,
      default: null,
    },
    customerCount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
businessSchema.index({ ownerId: 1 })
businessSchema.index({ status: 1 })
businessSchema.index({ createdAt: -1 })

export const Business = mongoose.models.Business || mongoose.model<BusinessDocument>("Business", businessSchema)
