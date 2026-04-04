"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRealtimeData } from "@/hooks/use-realtime"
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Fraud validation signals
const fraudSignals = [
  { id: 1, signal: "Location Match", description: "Worker is in registered zone", status: "pass" },
  { id: 2, signal: "Activity Level", description: "Active app usage and orders", status: "pass" },
  { id: 3, signal: "Peer Comparison", description: "Nearby workers' activity", status: "warning" },
  { id: 4, signal: "Demand Check", description: "Order volume in exact zone", status: "pass" },
  { id: 5, signal: "Historical Behavior", description: "Worker's normal patterns", status: "pass" },
  { id: 6, signal: "Time Validation", description: "Within expected working hours", status: "fail" },
]

// Mock suspicious activities
const suspiciousActivities = [
  {
    id: 1,
    type: "Coordinated Inactivity",
    zone: "Mumbai - Andheri East",
    workers: 5,
    timestamp: "2026-03-20T14:30:00",
    severity: "High",
    status: "investigating",
  },
  {
    id: 2,
    type: "GPS Spoofing Detected",
    zone: "Delhi NCR - Sector 18",
    workers: 1,
    timestamp: "2026-03-20T13:15:00",
    severity: "Critical",
    status: "blocked",
  },
  {
    id: 3,
    type: "Duplicate Claim Attempt",
    zone: "Chennai - T Nagar",
    workers: 2,
    timestamp: "2026-03-20T12:00:00",
    severity: "Medium",
    status: "resolved",
  },
]

export default function FraudPage() {
  const { data, isLoading } = useRealtimeData()
  const claims = data.claims
  
  if (isLoading || !claims) {
    return (
      <div className="flex flex-col">
        <Header
          title="Fraud Detection"
          description="Multi-signal validation system for claim verification"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading real-time fraud data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const highRiskClaims = claims.filter(c => c.fraudScore > 0.5)
  const blockedClaims = claims.filter(c => c.status === 'rejected')

  return (
    <div className="flex flex-col">
      <Header
        title="Fraud Detection"
        description="Multi-signal validation system for claim verification"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Auto Approved</p>
                  <p className="text-2xl font-bold text-success">
                    {claims.filter(c => c.fraudScore < 0.3).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Score {"<"} 0.3</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold text-warning">
                    {claims.filter(c => c.fraudScore >= 0.3 && c.fraudScore <= 0.7).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Score 0.3 - 0.7</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-destructive">
                    {claims.filter(c => c.fraudScore > 0.7).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Score {">"} 0.7</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saved</p>
                  <p className="text-2xl font-bold text-primary">₹{blockedClaims.reduce((acc, c) => acc + c.incomeLoss, 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">From fraud</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Multi-Signal Validation */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Multi-Signal Validation System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fraudSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-full p-2",
                      signal.status === "pass" && "bg-success/20 text-success",
                      signal.status === "warning" && "bg-warning/20 text-warning",
                      signal.status === "fail" && "bg-destructive/20 text-destructive"
                    )}>
                      {signal.status === "pass" && <CheckCircle className="h-4 w-4" />}
                      {signal.status === "warning" && <AlertTriangle className="h-4 w-4" />}
                      {signal.status === "fail" && <XCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{signal.signal}</p>
                      <p className="text-sm text-muted-foreground">{signal.description}</p>
                    </div>
                  </div>
                  <Badge variant={
                    signal.status === "pass" ? "default" :
                    signal.status === "warning" ? "secondary" : "destructive"
                  } className={cn(
                    signal.status === "pass" && "bg-success text-success-foreground"
                  )}>
                    {signal.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Suspicious Activities */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Suspicious Activities</CardTitle>
              <Badge variant="destructive">{suspiciousActivities.length} Alerts</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {suspiciousActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "h-5 w-5",
                        activity.severity === "Critical" && "text-destructive",
                        activity.severity === "High" && "text-warning",
                        activity.severity === "Medium" && "text-info"
                      )} />
                      <span className="font-medium">{activity.type}</span>
                    </div>
                    <Badge variant={
                      activity.status === "blocked" ? "destructive" :
                      activity.status === "investigating" ? "secondary" : "outline"
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{activity.zone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{activity.workers} workers</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(activity.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      Block Workers
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* High Risk Claims */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">High Risk Claims (Score {">"} 0.5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highRiskClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 text-destructive text-sm font-medium">
                      {claim.workerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{claim.workerName}</p>
                      <p className="text-sm text-muted-foreground">{claim.triggerType} - ₹{claim.incomeLoss} claimed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Fraud Score</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={claim.fraudScore * 100}
                          className="h-2 w-20 [&>div]:bg-destructive"
                        />
                        <span className="text-sm font-bold text-destructive">
                          {(claim.fraudScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Badge variant={claim.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {claim.status.replace('-', ' ')}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
