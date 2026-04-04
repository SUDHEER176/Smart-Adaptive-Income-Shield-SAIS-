"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRealtimeData } from "@/hooks/use-realtime"
import { Shield, TrendingUp, IndianRupee, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PoliciesPage() {
  const { data, isLoading } = useRealtimeData()
  const policies = data.policies || []
  const workers = data.workers || []
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null)

  if (isLoading || !policies.length) {
    return (
      <div className="flex flex-col">
        <Header
          title="Insurance Policies"
          description="Manage worker insurance coverage and premiums"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading policies...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const activePolicies = policies.filter(p => p.status === 'active').length
  const totalCoverage = policies.reduce((sum, p) => sum + p.coverageLimit, 0)
  const avgPremium = Math.round(policies.reduce((sum, p) => sum + p.premium, 0) / policies.length)

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId)
    return worker?.name || 'Unknown'
  }

  const getPolicyDetails = (policy: any) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Worker</p>
            <p className="font-semibold">{getWorkerName(policy.workerId)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Policy ID</p>
            <p className="font-semibold">{policy.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Weekly Premium</p>
            <p className="font-semibold text-lg">₹{policy.premium}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Coverage Limit</p>
            <p className="font-semibold text-lg">₹{policy.coverageLimit.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold mb-3">Premium Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Premium</span>
              <span>₹{policy.premiumBreakdown?.basePremium || 200}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Adjustment</span>
              <span className="text-orange-600">+₹{policy.premiumBreakdown?.riskAdjustment || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hours Bonus</span>
              <span className="text-green-600">+₹{policy.premiumBreakdown?.hoursBonus || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zone Risk</span>
              <span className="text-orange-600">+₹{policy.premiumBreakdown?.zoneRisk || 0}</span>
            </div>
            <div className="border-t border-border my-2 pt-2 flex justify-between font-semibold">
              <span>Total Premium</span>
              <span>₹{policy.premium}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-semibold mb-3">Coverage Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payout</span>
              <span className="font-semibold">₹{policy.monthlyPayout?.toLocaleString('en-IN') || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid Period</span>
              <span>{policy.weekStart} to {policy.weekEnd}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-Renewal</span>
              <span className="text-green-600">✅ Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created Date</span>
              <span>{policy.createdDate}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Insurance Policies"
        description="Manage worker insurance coverage and dynamic premiums"
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Policies</p>
                  <p className="text-2xl font-bold">{policies.length}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activePolicies}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-success">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Premium</p>
                  <p className="text-2xl font-bold">₹{avgPremium}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-warning">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Coverage</p>
                  <p className="text-xl font-bold">₹{(totalCoverage / 1000000).toFixed(1)}M</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-info">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Dynamic Premium Calculation</p>
              <p>Premiums are calculated based on: Worker Risk Score, Weekly Working Hours, Zone Risk Level, and Claim History</p>
            </div>
          </CardContent>
        </Card>

        {/* Policies Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Policies</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Policy ID</TableHead>
                    <TableHead className="text-muted-foreground">Worker</TableHead>
                    <TableHead className="text-muted-foreground">Premium</TableHead>
                    <TableHead className="text-muted-foreground">Coverage</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Valid Until</TableHead>
                    <TableHead className="text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id} className="border-border">
                      <TableCell className="font-mono text-sm">{policy.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getWorkerName(policy.workerId)}</p>
                          <p className="text-xs text-muted-foreground">{policy.workerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">₹{policy.premium}/week</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">₹{policy.coverageLimit.toLocaleString('en-IN')}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={policy.status === 'active' ? 'default' : 'outline'}
                          className={cn(
                            policy.status === 'active' ? 'bg-green-600 text-white' : ''
                          )}
                        >
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {policy.weekEnd}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPolicy(selectedPolicy?.id === policy.id ? null : policy)}
                        >
                          {selectedPolicy?.id === policy.id ? "Hide" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Policy Details */}
        {selectedPolicy && (
          <Card className="bg-card border-border border-primary">
            <CardHeader>
              <CardTitle>Policy Details - {selectedPolicy.id}</CardTitle>
            </CardHeader>
            <CardContent>
              {getPolicyDetails(selectedPolicy)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
