"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealtimeData } from "@/hooks/use-realtime"
import {
  AlertTriangle,
  CloudRain,
  Thermometer,
  Wind,
  Car,
  TrendingDown,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const triggerIcons = {
  "Heavy Rain": CloudRain,
  "Extreme Heat": Thermometer,
  "High Pollution": Wind,
  "Traffic Disruption": Car,
  "Low Demand": TrendingDown,
  "Area Restriction": MapPin,
}

const severityColors = {
  "Low": { bg: "bg-info/10", text: "text-info", border: "border-info/30" },
  "Medium": { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  "High": { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  "Critical": { bg: "bg-destructive/20", text: "text-destructive", border: "border-destructive/50" },
}

export default function TriggersPage() {
  const { data, isLoading } = useRealtimeData()
  const triggers = data.triggers
  
  if (isLoading || !triggers) {
    return (
      <div className="flex flex-col">
        <Header
          title="Active Triggers"
          description="Monitor parametric triggers and affected workers"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading real-time trigger data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const activeTriggers = triggers.filter(t => !t.endTime)
  const resolvedTriggers = triggers.filter(t => t.endTime)

  return (
    <div className="flex flex-col">
      <Header
        title="Active Triggers"
        description="Real-time monitoring of parametric triggers"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Triggers</p>
                  <p className="text-2xl font-bold text-destructive">{activeTriggers.length}</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-success">{resolvedTriggers.length}</p>
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
                  <p className="text-sm text-muted-foreground">Workers Affected</p>
                  <p className="text-2xl font-bold">{activeTriggers.reduce((acc, t) => acc + (t.affectedWorkers || 0), 0)}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3 text-warning">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Zones Impacted</p>
                  <p className="text-2xl font-bold">{new Set(activeTriggers.map(t => t.zone)).size}</p>
                </div>
                <div className="rounded-lg bg-info/10 p-3 text-info">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Triggers */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Active Triggers</CardTitle>
            <Badge variant="destructive" className="animate-pulse">
              {activeTriggers.length} Active
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
              {activeTriggers.map((trigger) => {
                const Icon = (triggerIcons as any)[trigger.type] || AlertTriangle
                const colors = (severityColors as any)[trigger.severity] || severityColors.Medium

              return (
                <div
                  key={trigger.id}
                  className={cn(
                    "rounded-lg border p-4",
                    colors.border,
                    colors.bg
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("rounded-lg p-3", colors.bg, colors.text)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{trigger.type}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{trigger.zone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        trigger.severity === "Critical" ? "destructive" :
                        trigger.severity === "High" ? "secondary" : "outline"
                      }>
                        {trigger.severity}
                      </Badge>
                      {trigger.verified && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="rounded-lg bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Affected Workers</p>
                      <p className="text-xl font-bold">{trigger.affectedWorkers || 0}</p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                      <p className="text-sm font-medium">
                        {new Date(trigger.startTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Duration</p>
                      <p className="text-sm font-medium">
                        {Math.round((new Date().getTime() - new Date(trigger.startTime).getTime()) / (1000 * 60))} mins
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
                      Process Claims
                    </Button>
                    <Button size="sm" variant="secondary">
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Resolved Triggers */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recently Resolved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resolvedTriggers.map((trigger) => {
              const Icon = (triggerIcons as any)[trigger.type] || AlertTriangle

              return (
                <div
                  key={trigger.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-success/10 p-2 text-success">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{trigger.type}</p>
                      <p className="text-sm text-muted-foreground">{trigger.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {Math.round((new Date(trigger.endTime!).getTime() - new Date(trigger.startTime).getTime()) / (1000 * 60 * 60))}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Workers</p>
                      <p className="font-medium">{trigger.affectedWorkers || 0}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
