"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { OwnerSidebar } from "@/components/owner-sidebar"

interface Investment {
  _id: string
  businessId: { _id: string; name: string }
  investorId: { name: string; email: string }
  amount: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string
}

export default function OwnerInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    try {
      const response = await fetch("/api/investments")
      if (response.ok) {
        const data = await response.json()
        setInvestments(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch investments:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="min-h-screen bg-background flex">
      <OwnerSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Investments</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{investments.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-chart-3/5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <div className="w-10 h-10 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-chart-3">${totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Investments Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : investments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No investments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Investor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-border">
                  {investments.map((investment) => (
                    <tr key={investment._id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {investment.businessId.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{investment.investorId.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        ${investment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            investment.status === "confirmed"
                              ? "bg-chart-3/20 text-chart-3"
                              : investment.status === "pending"
                                ? "bg-chart-4/20 text-chart-4"
                                : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {investment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(investment.createdAt).toLocaleDateString()}
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
