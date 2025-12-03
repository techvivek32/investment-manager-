import mongoose, { Schema, type Document } from "mongoose"
import type { IUser } from "../types"

interface UserDocument extends Document, IUser {}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't return password hash by default
    },
    role: {
      type: String,
      enum: ["admin", "business_owner", "investor"],
      default: "investor",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

export const User = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema)
