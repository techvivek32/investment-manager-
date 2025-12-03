"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Map from "@/components/map"
import { useRouter, useParams } from "next/navigation"
import { InvestorSidebar } from "@/components/investor-sidebar"

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
  category?: string
  status: string
  latitude: number
  longitude: number
  minInvestmentAmount: number
  maxInvestmentAmount: number
  expectedReturnPercentage?: number
  documents: Document[]
  ownerId: { name: string; email: string }
  createdAt: string
}

export default function InvestorBusinessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [investing, setInvesting] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [invested, setInvested] = useState(false)
  const [confirmStep, setConfirmStep] = useState(false)
  const [onWatchlist, setOnWatchlist] = useState(false)

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

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!investmentAmount || !business) return
    if (!confirmStep) {
      setConfirmStep(true)
      return
    }
    setInvesting(true)
    try {
      const amount = Number.parseFloat(investmentAmount)
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          amount,
        }),
      })

      if (response.ok) {
        setInvested(true)
        setInvestmentAmount("")
        setConfirmStep(false)
        setTimeout(() => {
          router.push("/investor/investments")
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to create investment:", error)
    } finally {
      setInvesting(false)
    }
  }

  const toggleWatchlist = async () => {
    try {
      if (!onWatchlist) {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId }),
        })
        if (res.ok) setOnWatchlist(true)
      } else {
        const res = await fetch(`/api/watchlist?businessId=${businessId}`, { method: "DELETE" })
        if (res.ok) setOnWatchlist(false)
      }
    } catch {}
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!business) {
    return <div className="min-h-screen flex items-center justify-center">Business not found</div>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <InvestorSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-4">
            <Link href="/investor/businesses" className="text-primary hover:text-primary/80 text-sm mb-2 inline-flex items-center gap-1">
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

            {/* Business Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Business Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Business Owner</p>
                  <p className="text-foreground font-medium">{business.ownerId.name}</p>
                </div>
                {business.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <p className="text-foreground font-medium">{business.category}</p>
                  </div>
                )}
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
                <p className="text-muted-foreground">No documents available</p>
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

          {/* Investment Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-foreground mb-4">Invest in This Business</h2>

              {invested ? (
                <div className="bg-chart-3/10 border border-chart-3/20 text-chart-3 px-4 py-3 rounded-lg text-sm mb-4">
                  Investment successful! Redirecting...
                </div>
              ) : (
                <form onSubmit={handleInvest} className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                      Investment Amount
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      min={business.minInvestmentAmount}
                      max={business.maxInvestmentAmount}
                      step="0.01"
                      placeholder="Enter amount"
                      className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Between ${business.minInvestmentAmount.toLocaleString()} and $
                      {business.maxInvestmentAmount.toLocaleString()}
                    </p>
                  </div>

                  {!confirmStep ? (
                    <button
                      type="submit"
                      disabled={investing || !investmentAmount}
                      className="w-full bg-chart-3 hover:bg-chart-3/90 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-chart-3/20 transition-all"
                    >
                      {investing ? "Processing..." : "Invest Now"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-chart-4/10 border border-chart-4/20 text-chart-4 px-4 py-3 rounded-lg text-sm">
                        Please confirm your investment of ${Number.parseFloat(investmentAmount).toLocaleString()} in {business.name}.
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={investing}
                          className="flex-1 bg-chart-3 hover:bg-chart-3/90 text-white font-medium py-2 px-4 rounded-lg transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmStep(false)}
                          className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Investment Summary */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-4">Investment Summary:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Investment:</span>
                    <span className="font-medium text-foreground">${business.minInvestmentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Investment:</span>
                    <span className="font-medium text-foreground">${business.maxInvestmentAmount.toLocaleString()}</span>
                  </div>
                  {business.expectedReturnPercentage && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Expected Return:</span>
                      <span className="font-semibold text-chart-3">{business.expectedReturnPercentage}%</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={toggleWatchlist}
                    className={`w-full ${onWatchlist ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"} font-medium py-2 px-4 rounded-lg transition-all`}
                  >
                    {onWatchlist ? "★ On Watchlist" : "☆ Add to Watchlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
