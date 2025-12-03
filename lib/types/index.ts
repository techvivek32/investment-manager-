// Shared types for the entire application

export type UserRole = "admin" | "business_owner" | "investor"

export type BusinessStatus = "pending" | "approved" | "rejected"

export type InvestmentStatus = "pending" | "confirmed" | "cancelled"

export type DocumentType = "registration" | "license" | "financials" | "image" | "proof" | "other"

// User type
export interface IUser {
  _id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Business type
export interface IBusiness {
  _id: string
  ownerId: string
  name: string
  description: string
  category?: string
  latitude: number
  longitude: number
  status: BusinessStatus
  minInvestmentAmount: number
  maxInvestmentAmount: number
  expectedReturnPercentage?: number
  documents: string[] // Document IDs
  createdAt: Date
  updatedAt: Date
}

// Document type
export interface IDocument {
  _id: string
  businessId: string
  fileName: string
  fileUrl: string
  documentType: DocumentType
  uploadedAt: Date
}

// Business Visibility type
export interface IBusinessVisibility {
  _id: string
  investorId: string
  businessId: string
  createdAt: Date
}

// Investment type
export interface IInvestment {
  _id: string
  investorId: string
  businessId: string
  amount: number
  status: InvestmentStatus
  createdAt: Date
}

// Session user type (for NextAuth)
export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}
