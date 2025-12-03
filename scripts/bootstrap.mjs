import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("MONGODB_URI not set in environment")
  process.exit(1)
}

const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@example.com"
const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "password123"
const adminName = process.env.BOOTSTRAP_ADMIN_NAME || "Admin User"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "business_owner", "investor"], default: "investor" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema)

async function run() {
  await mongoose.connect(uri)
  const existing = await User.findOne({ email: adminEmail.toLowerCase() })
  if (existing) {
    console.log("Admin already exists:", existing.email)
    await mongoose.disconnect()
    return
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(adminPassword, salt)
  const user = await User.create({ name: adminName, email: adminEmail.toLowerCase(), passwordHash: hash, role: "admin" })
  console.log("Created admin:", user.email)
  await mongoose.disconnect()
}

run().catch(async (e) => {
  console.error(e)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})

