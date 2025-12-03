"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { InvestorSidebar } from "@/components/investor-sidebar"

interface Business {
  _id: string
  name: string
  description: string
  category?: string
  minInvestmentAmount: number
  maxInvestmentAmount: number
  expectedReturnPercentage?: number
  ownerId: { name: string }
}

export default function InvestorBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/investor/businesses")
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <InvestorSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Available Businesses</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No businesses available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link
                key={business._id}
                href={`/investor/businesses/${business._id}`}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{business.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{business.description}</p>

                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground">By: <span className="text-foreground">{business.ownerId.name}</span></p>
                    {business.category && <p className="text-sm text-muted-foreground">Category: <span className="text-foreground">{business.category}</span></p>}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Min Investment:</span>
                      <span className="font-medium text-foreground">${business.minInvestmentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Max Investment:</span>
                      <span className="font-medium text-foreground">${business.maxInvestmentAmount.toLocaleString()}</span>
                    </div>
                    {business.expectedReturnPercentage && (
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                        <span className="text-muted-foreground">Expected Return:</span>
                        <span className="font-semibold text-chart-3">{business.expectedReturnPercentage}%</span>
                      </div>
                    )}
                  </div>

                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg text-sm transition-all shadow-md shadow-primary/20">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  )
}
