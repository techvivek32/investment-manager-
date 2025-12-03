"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { InvestorSidebar } from "@/components/investor-sidebar"

interface BusinessPreview {
  _id: string
  name: string
  minInvestmentAmount: number
  maxInvestmentAmount: number
  expectedReturnPercentage?: number
}

export default function InvestorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<BusinessPreview[]>([])
  const [investmentCount, setInvestmentCount] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const [bizRes, invRes] = await Promise.all([fetch("/api/investor/businesses"), fetch("/api/investments")])

      if (bizRes.ok) {
        const data = await bizRes.json()
        setBusinesses(data.data || [])
      }

      if (invRes.ok) {
        const data = await invRes.json()
        const investments = data.data || []
        setInvestmentCount(investments.length)
        const total = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0)
        setTotalInvested(total)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <InvestorSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <button
              onClick={() => router.push("/api/auth/signout")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-chart-4/10 via-card to-accent/5 border border-border rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, {session?.user?.name}</h2>
          <p className="text-muted-foreground">Explore available businesses and manage your investments.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Available Businesses</p>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{businesses.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-chart-2/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Active Investments</p>
              <div className="w-10 h-10 bg-chart-2/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-chart-2">{investmentCount}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-chart-3/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
              <div className="w-10 h-10 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-chart-3">${totalInvested.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/investor/businesses"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-primary/20"
          >
            Browse Businesses
          </Link>
          <Link
            href="/investor/investments"
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2.5 px-6 rounded-lg transition-all"
          >
            My Investments
          </Link>
        </div>

        {/* Featured Businesses */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Available Businesses</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : businesses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No businesses available yet</p>
              <p className="text-sm text-muted-foreground/70">Admin will assign businesses to you soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {businesses.map((business) => (
                <Link
                  key={business._id}
                  href={`/investor/businesses/${business._id}`}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
                >
                  <h4 className="text-lg font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">{business.name}</h4>
                  <div className="space-y-2 mb-6">
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
                </Link>
              ))}
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  )
}
