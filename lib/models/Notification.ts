import mongoose, { Schema, type Document } from "mongoose"

interface NotificationDocument extends Document {
  userId: Schema.Types.ObjectId
  type: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: Date
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

notificationSchema.index({ userId: 1, createdAt: -1 })

export const Notification =
  mongoose.models.Notification || mongoose.model<NotificationDocument>("Notification", notificationSchema)

