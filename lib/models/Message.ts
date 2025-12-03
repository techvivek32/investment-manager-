import mongoose, { Schema, type Document } from "mongoose"

interface MessageDocument extends Document {
  businessId: Schema.Types.ObjectId
  senderId: Schema.Types.ObjectId
  receiverId: Schema.Types.ObjectId
  body: string
  createdAt: Date
}

const messageSchema = new Schema<MessageDocument>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

messageSchema.index({ businessId: 1, createdAt: -1 })

export const Message = mongoose.models.Message || mongoose.model<MessageDocument>("Message", messageSchema)

