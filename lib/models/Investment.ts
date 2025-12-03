import mongoose, { Schema, type Document } from "mongoose"
import type { IInvestment } from "../types"

interface InvestmentDocument extends Document, IInvestment {}

const investmentSchema = new Schema<InvestmentDocument>(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
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

// Indexes for queries
investmentSchema.index({ investorId: 1 })
investmentSchema.index({ businessId: 1 })

export const Investment =
  mongoose.models.Investment || mongoose.model<InvestmentDocument>("Investment", investmentSchema)
