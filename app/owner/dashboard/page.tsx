"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { OwnerSidebar } from "@/components/owner-sidebar"

interface BusinessSummary {
  _id: string
  name: string
  status: "pending" | "approved" | "rejected"
  investmentCount: number
}

export default function OwnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchBusinesses()
    }
  }, [status])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/businesses")
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

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const approvedCount = businesses.filter((b) => b.status === "approved").length
  const pendingCount = businesses.filter((b) => b.status === "pending").length

  return (
    <div className="min-h-screen bg-background flex">
      <OwnerSidebar />
      
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
        <div className="bg-gradient-to-br from-chart-3/10 via-card to-accent/5 border border-border rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, {session?.user?.name}</h2>
          <p className="text-muted-foreground">Manage your businesses and track investments.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{businesses.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-chart-3/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <div className="w-10 h-10 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-chart-3">{approvedCount}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-chart-4/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
              <div className="w-10 h-10 bg-chart-4/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-chart-4">{pendingCount}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/owner/businesses/new"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-primary/20"
          >
            Create New Business
          </Link>
          <Link
            href="/owner/investments"
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2.5 px-6 rounded-lg transition-all"
          >
            View Investments
          </Link>
        </div>

        {/* Businesses List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Your Businesses</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : businesses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No businesses yet</p>
              <Link href="/owner/businesses/new" className="text-primary hover:text-primary/80 font-medium">
                Create your first business
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {businesses.map((business) => (
                    <tr key={business._id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{business.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            business.status === "approved"
                              ? "bg-chart-3/20 text-chart-3"
                              : business.status === "rejected"
                                ? "bg-destructive/20 text-destructive"
                                : "bg-chart-4/20 text-chart-4"
                          }`}
                        >
                          {business.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <Link
                          href={`/owner/businesses/${business._id}`}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          View
                        </Link>
                        {business.status !== "approved" && (
                          <Link
                            href={`/owner/businesses/${business._id}/edit`}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            Edit
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  )
}
