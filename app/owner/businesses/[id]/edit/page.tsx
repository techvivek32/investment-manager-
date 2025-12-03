"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

interface Business {
  _id: string
  name: string
  description: string
  category: string
  latitude: number
  longitude: number
  minInvestmentAmount: number
  maxInvestmentAmount: number
  expectedReturnPercentage?: number
  status: string
}

export default function EditBusinessPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<Partial<Business>>({})

  useEffect(() => {
    fetchBusiness()
  }, [businessId])

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.data)
        setFormData(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch business:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Amount") ||
        name.includes("Percentage") ||
        name.includes("latitude") ||
        name.includes("longitude")
          ? Number.parseFloat(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/owner/businesses/${businessId}`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update business")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setSaving(false)
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
          <Link
            href={`/owner/businesses/${businessId}`}
            className="text-primary hover:text-primary/80 text-sm mb-2 inline-flex items-center gap-1"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">Edit Business</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-xl p-8">
          {business.status === "approved" && (
            <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg text-sm mb-6">
              This business has been approved and cannot be edited.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" disabled={business.status === "approved"}>
            {/* Business Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Business Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                disabled={business.status === "approved"}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                disabled={business.status === "approved"}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <input
                id="category"
                type="text"
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                disabled={business.status === "approved"}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-foreground mb-2">
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="number"
                  name="latitude"
                  value={formData.latitude || ""}
                  onChange={handleChange}
                  step="0.0001"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  disabled={business.status === "approved"}
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-foreground mb-2">
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="number"
                  name="longitude"
                  value={formData.longitude || ""}
                  onChange={handleChange}
                  step="0.0001"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  disabled={business.status === "approved"}
                />
              </div>
            </div>

            {/* Investment Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minInvestmentAmount" className="block text-sm font-medium text-foreground mb-2">
                  Min Investment Amount
                </label>
                <input
                  id="minInvestmentAmount"
                  type="number"
                  name="minInvestmentAmount"
                  value={formData.minInvestmentAmount || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  disabled={business.status === "approved"}
                />
              </div>
              <div>
                <label htmlFor="maxInvestmentAmount" className="block text-sm font-medium text-foreground mb-2">
                  Max Investment Amount
                </label>
                <input
                  id="maxInvestmentAmount"
                  type="number"
                  name="maxInvestmentAmount"
                  value={formData.maxInvestmentAmount || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  disabled={business.status === "approved"}
                />
              </div>
            </div>

            {/* Expected Return */}
            <div>
              <label htmlFor="expectedReturnPercentage" className="block text-sm font-medium text-foreground mb-2">
                Expected Return Percentage
              </label>
              <input
                id="expectedReturnPercentage"
                type="number"
                name="expectedReturnPercentage"
                value={formData.expectedReturnPercentage || ""}
                onChange={handleChange}
                step="0.1"
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                disabled={business.status === "approved"}
              />
            </div>

            {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">{error}</div>}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || business.status === "approved"}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href={`/owner/businesses/${businessId}`}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2.5 px-4 rounded-lg transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
