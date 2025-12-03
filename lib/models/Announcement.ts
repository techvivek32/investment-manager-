import mongoose, { Schema, type Document } from "mongoose"

interface AnnouncementDocument extends Document {
  businessId: Schema.Types.ObjectId
  ownerId: Schema.Types.ObjectId
  title: string
  content: string
  createdAt: Date
}

const announcementSchema = new Schema<AnnouncementDocument>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

announcementSchema.index({ businessId: 1, createdAt: -1 })

export const Announcement =
  mongoose.models.Announcement || mongoose.model<AnnouncementDocument>("Announcement", announcementSchema)

