"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useRealtimeData } from "@/hooks/use-realtime"
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig = {
  "auto-approved": { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  "under-review": { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  "rejected": { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  "paid": { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
  "pending": { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  "processing": { icon: RefreshCw, color: "text-info", bg: "bg-info/10" },
  "completed": { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  "failed": { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
}


export default function ClaimsPage() {
  const { data, isLoading } = useRealtimeData()
  const claims = data.claims
  const payouts = data.payouts
  const workers = data.workers || []
  const [activeTab, setActiveTab] = useState("claims")

  if (isLoading || !claims || !payouts) {
    return (
      <div className="flex flex-col">
        <Header
          title="Claims & Payouts"
          description="Track and manage worker claims and payouts"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading real-time claims and payouts data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalClaims = claims.length
  const approvedClaims = claims.filter(c => c.status === 'auto-approved' || c.status === 'paid').length
  const pendingClaims = claims.filter(c => c.status === 'under-review').length
  const rejectedClaims = claims.filter(c => c.status === 'rejected').length
  const totalPayoutAmount = claims.reduce((acc, c) => acc + c.payout, 0)



  return (
    <div className="flex flex-col">
      <Header
        title="Claims & Payouts"
        description="Track and manage worker claims and payouts"
      />

      <div className="flex-1 p-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Claims</p>
                  <p className="text-2xl font-bold">{totalClaims}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-info">
                  <FileCheck className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-success">{approvedClaims}</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3 text-success">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{pendingClaims}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3 text-warning">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-destructive">{rejectedClaims}</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Payouts</p>
                  <p className="text-2xl font-bold">₹{totalPayoutAmount.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">All Claims</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Claim ID</TableHead>
                      <TableHead className="text-muted-foreground">Worker</TableHead>
                      <TableHead className="text-muted-foreground">Trigger</TableHead>
                      <TableHead className="text-muted-foreground">Income Loss</TableHead>
                      <TableHead className="text-muted-foreground">Payout</TableHead>
                      <TableHead className="text-muted-foreground">Fraud Score</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => {
                      const StatusIcon = statusConfig[claim.status]?.icon || AlertCircle
                      return (
                        <TableRow key={claim.id} className="border-border">
                          <TableCell className="font-mono text-sm">{claim.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                {claim.workerName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span>{claim.workerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{claim.triggerType}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-destructive font-medium">
                              <ArrowDownRight className="h-3 w-3 inline mr-1" />
                              ₹{claim.incomeLoss}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-success font-medium">
                              {claim.payout > 0 && <ArrowUpRight className="h-3 w-3 inline mr-1" />}
                              ₹{claim.payout}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={claim.fraudScore * 100}
                                className={cn(
                                  "h-2 w-16",
                                  claim.fraudScore > 0.7 ? "[&>div]:bg-destructive" :
                                  claim.fraudScore > 0.3 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                                )}
                              />
                              <span className={cn(
                                "text-sm font-medium",
                                claim.fraudScore > 0.7 ? "text-destructive" :
                                claim.fraudScore > 0.3 ? "text-warning" : "text-success"
                              )}>
                                {(claim.fraudScore * 100).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                statusConfig[claim.status]?.bg,
                                statusConfig[claim.status]?.color
                              )}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {claim.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(claim.timestamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Payout History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Payout ID</TableHead>
                      <TableHead className="text-muted-foreground">Worker</TableHead>
                      <TableHead className="text-muted-foreground">Claim ID</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">UPI ID</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => {
                      const StatusIcon = statusConfig[payout.status]?.icon || AlertCircle
                      return (
                        <TableRow key={payout.id} className="border-border">
                          <TableCell className="font-mono text-sm">{payout.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                {payout.workerName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span>{payout.workerName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{payout.claimId}</TableCell>
                          <TableCell>
                            <span className="text-success font-bold">₹{payout.amount}</span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{payout.upiId}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                statusConfig[payout.status]?.bg,
                                statusConfig[payout.status]?.color
                              )}
                            >
                              <StatusIcon className={cn(
                                "h-3 w-3 mr-1",
                                payout.status === 'processing' && "animate-spin"
                              )} />
                              {payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(payout.timestamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
