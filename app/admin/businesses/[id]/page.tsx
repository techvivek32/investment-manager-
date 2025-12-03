"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import Map from "@/components/map"

interface Document {
  _id: string
  fileName: string
  fileUrl: string
  documentType: string
}

interface Business {
  _id: string
  name: string
  description: string
  category: string
  status: "pending" | "approved" | "rejected"
  ownerId: { name: string; email: string }
  latitude: number
  longitude: number
  minInvestmentAmount: number
  maxInvestmentAmount: number
  expectedReturnPercentage?: number
  documents: Document[]
  createdAt: string
}

export default function AdminBusinessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBusiness()
  }, [businessId])

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch business:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const data = await response.json()
        setBusiness(data.data)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!business) {
    return <div className="min-h-screen flex items-center justify-center">Business not found</div>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-4">
            <Link href="/admin/businesses" className="text-primary hover:text-primary/80 text-sm mb-2 inline-flex items-center gap-1">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-2">{business.name}</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground">{business.description}</p>
            </div>

            {/* Details Grid */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="text-foreground font-medium">{business.category || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Owner</p>
                  <p className="text-foreground font-medium">{business.ownerId.name}</p>
                  <p className="text-xs text-muted-foreground">{business.ownerId.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Min Investment</p>
                  <p className="text-foreground font-medium">${business.minInvestmentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Max Investment</p>
                  <p className="text-foreground font-medium">${business.maxInvestmentAmount.toLocaleString()}</p>
                </div>
                {business.expectedReturnPercentage && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Return</p>
                    <p className="text-chart-3 font-semibold">{business.expectedReturnPercentage}%</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-foreground font-medium">{new Date(business.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
              <div className="text-muted-foreground text-sm mb-4">
                Latitude: {business.latitude}, Longitude: {business.longitude}
              </div>
              <div className="rounded-lg overflow-hidden border border-border">
                <Map latitude={business.latitude} longitude={business.longitude} />
              </div>
            </div>

            {/* Documents */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Documents ({business.documents.length})</h2>
              {business.documents.length === 0 ? (
                <p className="text-muted-foreground">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {business.documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground capitalize">{doc.documentType}</p>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Status & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Status</h2>
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize mb-4 ${
                  business.status === "approved"
                    ? "bg-chart-3/20 text-chart-3"
                    : business.status === "rejected"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-chart-4/20 text-chart-4"
                }`}
              >
                {business.status}
              </div>

              {business.status === "pending" && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={updating}
                    className="w-full bg-chart-3 hover:bg-chart-3/90 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-chart-3/20"
                  >
                    {updating ? "Updating..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updating}
                    className="w-full bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-destructive-foreground font-medium py-2.5 px-4 rounded-lg transition-all"
                  >
                    {updating ? "Updating..." : "Reject"}
                  </button>
                </div>
              )}
            </div>

            {/* Assign to Investors */}
            {business.status === "approved" && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Assign to Investors</h2>
                <Link
                  href={`/admin/visibility?business=${businessId}`}
                  className="inline-block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all"
                >
                  Manage Access
                </Link>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
