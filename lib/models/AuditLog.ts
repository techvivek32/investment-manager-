import mongoose, { Schema, type Document } from "mongoose"

interface AuditLogDocument extends Document {
  actorId: Schema.Types.ObjectId
  action: string
  entityType: string
  entityId: Schema.Types.ObjectId
  metadata?: Record<string, any>
  createdAt: Date
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })

export const AuditLog = mongoose.models.AuditLog || mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema)

