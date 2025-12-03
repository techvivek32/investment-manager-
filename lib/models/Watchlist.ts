import mongoose, { Schema, type Document } from "mongoose"

interface WatchlistDocument extends Document {
  investorId: Schema.Types.ObjectId
  businessId: Schema.Types.ObjectId
  createdAt: Date
}

const watchlistSchema = new Schema<WatchlistDocument>(
  {
    investorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

watchlistSchema.index({ investorId: 1, businessId: 1 }, { unique: true })

export const Watchlist = mongoose.models.Watchlist || mongoose.model<WatchlistDocument>("Watchlist", watchlistSchema)

