"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"

interface Business {
  _id: string
  name: string
  description: string
  status: "pending" | "approved" | "rejected"
  ownerId: { name: string; email: string }
  minInvestmentAmount: number
  maxInvestmentAmount: number
  createdAt: string
}

export default function AdminBusinessesPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")

  useEffect(() => {
    fetchBusinesses()
  }, [])

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

  const filteredBusinesses = filterStatus === "all" ? businesses : businesses.filter((b) => b.status === filterStatus)

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Businesses</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 font-medium text-sm capitalize border-b-2 transition-colors ${
                filterStatus === status
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Businesses Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No businesses found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Investment Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-border">
                  {filteredBusinesses.map((business) => (
                    <tr key={business._id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{business.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {business.ownerId.name} ({business.ownerId.email})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        ${business.minInvestmentAmount.toLocaleString()} - $
                        {business.maxInvestmentAmount.toLocaleString()}
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/businesses/${business._id}`}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  )
}
