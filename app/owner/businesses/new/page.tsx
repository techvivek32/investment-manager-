"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [locationType, setLocationType] = useState<"text" | "link" | "coordinates">("text")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    latitude: 0,
    longitude: 0,
    minInvestmentAmount: 0,
    maxInvestmentAmount: 0,
    expectedReturnPercentage: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const extractCoordinates = (input: string) => {
    // Google Maps patterns: @lat,lng or ?q=lat,lng or /place/name/@lat,lng
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
    }
    
    return null
  }

  const isGoogleMapsLink = (input: string) => {
    return input.includes('maps.google') || input.includes('maps.app.goo.gl') || input.includes('goo.gl/maps')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let submitData = { ...formData }
      
      if (locationType === "link" || locationType === "text") {
        const coords = extractCoordinates(formData.location)
        if (coords) {
          submitData.latitude = coords.lat
          submitData.longitude = coords.lng
        } else if (locationType === "link") {
          if (isGoogleMapsLink(formData.location)) {
            setError("Shortened Google Maps links are not supported. Please open the link, then copy the full URL from the address bar (it should contain coordinates like @40.7128,-74.0060).")
          } else {
            setError("Invalid location link. Please use a valid Google Maps link with coordinates.")
          }
          setLoading(false)
          return
        }
      }

      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/owner/businesses/${data.data._id}`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create business")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/owner/dashboard" className="text-primary hover:text-primary/80 text-sm mb-2 inline-flex items-center gap-1">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-2">Create New Business</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Business Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Tech Startup Inc."
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your business..."
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                required
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
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Technology, Real Estate, etc."
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setLocationType("text")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    locationType === "text"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Address/Text
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType("link")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    locationType === "link"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Google Maps Link
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType("coordinates")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    locationType === "coordinates"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Coordinates
                </button>
              </div>

              {locationType === "text" && (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main St, New York, NY 10001"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              )}

              {locationType === "link" && (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., https://maps.google.com/?q=40.7128,-74.0060"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              )}

              {locationType === "coordinates" && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.0001"
                    placeholder="Latitude (e.g., 40.7128)"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.0001"
                    placeholder="Longitude (e.g., -74.0060)"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              )}
            </div>

            {/* Investment Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minInvestmentAmount" className="block text-sm font-medium text-foreground mb-2">
                  Min Investment Amount *
                </label>
                <input
                  id="minInvestmentAmount"
                  type="number"
                  name="minInvestmentAmount"
                  value={formData.minInvestmentAmount}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <label htmlFor="maxInvestmentAmount" className="block text-sm font-medium text-foreground mb-2">
                  Max Investment Amount *
                </label>
                <input
                  id="maxInvestmentAmount"
                  type="number"
                  name="maxInvestmentAmount"
                  value={formData.maxInvestmentAmount}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  required
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
                value={formData.expectedReturnPercentage}
                onChange={handleChange}
                step="0.1"
                placeholder="0"
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">{error}</div>}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all"
              >
                {loading ? "Creating..." : "Create Business"}
              </button>
              <Link
                href="/owner/dashboard"
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
