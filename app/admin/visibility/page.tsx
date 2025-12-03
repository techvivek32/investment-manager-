"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"

interface VisibilityRecord {
  _id: string
  investorId: { _id: string; name: string; email: string }
  businessId: { _id: string; name: string }
  createdAt: string
}

interface User {
  _id: string
  name: string
  email: string
}

interface Business {
  _id: string
  name: string
}

export default function AdminVisibilityPage() {
  const router = useRouter()
  const [visibility, setVisibility] = useState<VisibilityRecord[]>([])
  const [investors, setInvestors] = useState<User[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvestor, setSelectedInvestor] = useState("")
  const [selectedBusiness, setSelectedBusiness] = useState("")
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [visRes, usersRes, bizRes] = await Promise.all([
        fetch("/api/admin/visibility"),
        fetch("/api/admin/users"),
        fetch("/api/businesses"),
      ])

      if (visRes.ok) {
        const data = await visRes.json()
        setVisibility(data.data || [])
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        const investorList = data.data.filter((u: User & { role: string }) => u.role === "investor")
        setInvestors(investorList)
      }

      if (bizRes.ok) {
        const data = await bizRes.json()
        setBusinesses(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvestor || !selectedBusiness) return

    setAssigning(true)
    try {
      const response = await fetch("/api/admin/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorId: selectedInvestor,
          businessId: selectedBusiness,
        }),
      })

      if (response.ok) {
        setSelectedInvestor("")
        setSelectedBusiness("")
        fetchData()
      }
    } catch (error) {
      console.error("Failed to assign visibility:", error)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Business Visibility Control</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assign Form */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Assign Business to Investor</h2>
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Investor</label>
                  <select
                    value={selectedInvestor}
                    onChange={(e) => setSelectedInvestor(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground"
                  >
                    <option value="">Select investor...</option>
                    {investors.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.name} ({inv.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Business</label>
                  <select
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background text-foreground"
                  >
                    <option value="">Select business...</option>
                    {businesses
                      .filter((b: Business & { status?: string }) => b.status === "approved")
                      .map((biz) => (
                        <option key={biz._id} value={biz._id}>
                          {biz.name}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={assigning || !selectedInvestor || !selectedBusiness}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-2 px-4 rounded-lg shadow-lg shadow-primary/20 transition-all"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </form>
            </div>
          </div>

          {/* Visibility List */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Current Assignments</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : visibility.length === 0 ? (
                <p className="text-muted-foreground">No assignments yet</p>
              ) : (
                <div className="space-y-3">
                  {visibility.map((record) => (
                    <div
                      key={record._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{record.businessId.name}</p>
                        <p className="text-sm text-muted-foreground">{record.investorId.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
