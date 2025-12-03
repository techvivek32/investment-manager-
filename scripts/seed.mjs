import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/investment_platform"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "business_owner", "investor"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: null },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], required: true, default: "pending" },
    minInvestmentAmount: { type: Number, required: true, min: 0 },
    maxInvestmentAmount: { type: Number, required: true, min: 0 },
    expectedReturnPercentage: { type: Number, default: null },
    documents: { type: [mongoose.Schema.Types.ObjectId], ref: "Document", default: [] },
  },
  { timestamps: true },
)

const documentSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    documentType: { type: String, enum: ["registration", "license", "financials", "image", "proof", "other"], required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

const visibilitySchema = new mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)
visibilitySchema.index({ investorId: 1, businessId: 1 }, { unique: true })

const investmentSchema = new mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], required: true, default: "confirmed" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

const User = mongoose.models.User || mongoose.model("User", userSchema)
const Business = mongoose.models.Business || mongoose.model("Business", businessSchema)
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema)
const BusinessVisibility = mongoose.models.BusinessVisibility || mongoose.model("BusinessVisibility", visibilitySchema)
const Investment = mongoose.models.Investment || mongoose.model("Investment", investmentSchema)

async function ensureUser(name, email, password, role) {
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return existing
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return User.create({ name, email: email.toLowerCase(), passwordHash: hash, role })
}

async function run() {
  await mongoose.connect(uri)

  const admin = await ensureUser("Admin User", "admin@example.com", "password123", "admin")
  const owner = await ensureUser("Business Owner", "owner@example.com", "password123", "business_owner")
  const investor = await ensureUser("Investor User", "investor@example.com", "password123", "investor")

  let biz1 = await Business.findOne({ name: "Prime Realty Complex" })
  if (!biz1) {
    biz1 = await Business.create({
      ownerId: owner._id,
      name: "Prime Realty Complex",
      description: "A premium real estate development with strong rental yields.",
      category: "real_estate",
      latitude: 37.7749,
      longitude: -122.4194,
      status: "approved",
      minInvestmentAmount: 5000,
      maxInvestmentAmount: 500000,
      expectedReturnPercentage: 12,
    })
  }

  let biz2 = await Business.findOne({ name: "Franchise Coffee Hub" })
  if (!biz2) {
    biz2 = await Business.create({
      ownerId: owner._id,
      name: "Franchise Coffee Hub",
      description: "Expanding coffee franchise targeting high footfall zones.",
      category: "franchise",
      latitude: 34.0522,
      longitude: -118.2437,
      status: "pending",
      minInvestmentAmount: 2000,
      maxInvestmentAmount: 200000,
      expectedReturnPercentage: 18,
    })
  }

  const docs = [
    { businessId: biz1._id, fileName: "registration.pdf", fileUrl: "/uploads/registration.pdf", documentType: "registration" },
    { businessId: biz1._id, fileName: "license.pdf", fileUrl: "/uploads/license.pdf", documentType: "license" },
  ]
  for (const d of docs) {
    const exists = await Document.findOne({ businessId: d.businessId, fileName: d.fileName })
    if (!exists) await Document.create(d)
  }

  const visExists = await BusinessVisibility.findOne({ investorId: investor._id, businessId: biz1._id })
  if (!visExists) {
    await BusinessVisibility.create({ investorId: investor._id, businessId: biz1._id })
  }

  const invExists = await Investment.findOne({ investorId: investor._id, businessId: biz1._id })
  if (!invExists) {
    const amt = Math.min(Math.max(10000, biz1.minInvestmentAmount), biz1.maxInvestmentAmount)
    await Investment.create({ investorId: investor._id, businessId: biz1._id, amount: amt, status: "confirmed" })
  }

  await mongoose.disconnect()
}

run().catch(async (e) => {
  console.error(e)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})

