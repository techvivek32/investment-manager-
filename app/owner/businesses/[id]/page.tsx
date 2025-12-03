"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Map from "@/components/map"
import { useRouter, useParams } from "next/navigation"

interface Document {
  _id: string
  fileName: string
  fileUrl: string
  documentType: string
  uploadedAt: string
}

interface Business {
  _id: string
  name: string
  description: string
  category: string
  status: "pending" | "approved" | "rejected"
  latitude: number
  longitude: number
  minInvestmentAmount: number
  maxInvestmentAmount: number
  expectedReturnPercentage?: number
  documents: Document[]
  createdAt: string
}

export default function OwnerBusinessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState("")
  const [uploading, setUploading] = useState(false)

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

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documentFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", documentFile)
       formData.append("documentType", documentType)

      const response = await fetch(`/api/businesses/${businessId}/documents`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setDocumentFile(null)
        setDocumentType("")
        fetchBusiness()
      }
    } catch (error) {
      console.error("Failed to upload document:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    
    try {
      const response = await fetch(`/api/businesses/${businessId}/documents/${docId}`, {
        method: "DELETE",
      })
      if (response.ok) fetchBusiness()
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!business) {
    return <div className="min-h-screen flex items-center justify-center">Business not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/owner/dashboard" className="text-primary hover:text-primary/80 text-sm mb-2 inline-flex items-center gap-1">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">{business.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Status */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Status</h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  business.status === "approved"
                    ? "bg-chart-3/20 text-chart-3"
                    : business.status === "rejected"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-chart-4/20 text-chart-4"
                }`}
              >
                {business.status}
              </span>
            </div>
            {business.status !== "approved" && (
              <Link
                href={`/owner/businesses/${businessId}/edit`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Business Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-foreground">{business.description}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Category</p>
              <p className="text-foreground">{business.category || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Min Investment</p>
              <p className="text-foreground font-medium">${business.minInvestmentAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Max Investment</p>
              <p className="text-foreground font-medium">${business.maxInvestmentAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Location</p>
            <div className="text-muted-foreground mb-4 text-sm">Latitude: {business.latitude}, Longitude: {business.longitude}</div>
            <div className="rounded-lg overflow-hidden border border-border">
              <Map latitude={business.latitude} longitude={business.longitude} />
            </div>
          </div>
        </div>

        {/* Documents Upload */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Documents</h2>

          {/* Upload Form */}
          <form onSubmit={handleDocumentUpload} className="mb-6 p-4 border border-border rounded-lg bg-accent/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">File</label>
                <input
                  type="file"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Document Type</label>
                <input
                  type="text"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder="e.g., License, Registration, Proof"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!documentFile || !documentType.trim() || uploading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-2 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </form>

          {/* Documents List */}
          {business.documents.length === 0 ? (
            <p className="text-muted-foreground">No documents uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {business.documents.map((doc, index) => (
                <div key={doc._id || index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{doc.fileName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-muted-foreground capitalize">{doc.documentType}</p>
                      {doc.uploadedAt && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString()} {new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="text-destructive hover:text-destructive/80 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
