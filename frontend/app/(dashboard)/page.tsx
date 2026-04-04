"use client"

import { Header } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Shield,
  IndianRupee,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileCheck,
  ShieldAlert,
} from "lucide-react"
import { useRealtimeData } from "@/hooks/use-realtime"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

const COLORS = ["#4ade80", "#facc15", "#ef4444"]

export default function DashboardPage() {
  const { data, isLoading } = useRealtimeData()
  const stats = data.dashboardStats
  const liveClaims = data.claims
  const liveTriggers = data.triggers

  // Chart data for weekly claims & payouts
  const weeklyClaimsData = [
    { day: "Mon", payouts: 1200 },
    { day: "Tue", payouts: 1800 },
    { day: "Wed", payouts: 1400 },
    { day: "Thu", payouts: 2200 },
    { day: "Fri", payouts: 2800 },
    { day: "Sat", payouts: 3200 },
    { day: "Sun", payouts: 1900 },
  ]

  // Risk distribution data for pie chart
  const riskDistributionData = [
    { name: 'Low Risk', value: 45, fill: 'var(--chart-1)' },
    { name: 'Medium Risk', value: 35, fill: 'var(--chart-3)' },
    { name: 'High Risk', value: 20, fill: 'var(--chart-4)' },
  ]

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col">
        <Header
          title="Dashboard"
          description="Real-time overview of your SAIS platform"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading real-time data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard Overview"
        description="Real-time monitoring of SAIS platform metrics"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Workers"
            value={stats.totalWorkers.toLocaleString()}
            change={`+${stats.weeklyGrowth}% this week`}
            changeType="positive"
            icon={Users}
            iconColor="text-info"
          />
          <StatsCard
            title="Covered Workers"
            value={stats.coveredWorkers.toLocaleString()}
            change={`${Math.round((stats.coveredWorkers / stats.totalWorkers) * 100)}% coverage rate`}
            changeType="neutral"
            icon={Shield}
            iconColor="text-primary"
          />
          <StatsCard
            title="Premiums Collected"
            value={`₹${stats.totalPremiumsCollected.toLocaleString()}`}
            change="This week"
            changeType="neutral"
            icon={IndianRupee}
            iconColor="text-success"
          />
          <StatsCard
            title="Active Triggers"
            value={stats.activeTriggers}
            change={`${stats.claimsToday} claims today`}
            changeType="negative"
            icon={AlertTriangle}
            iconColor="text-warning"
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Payouts Processed"
            value={`₹${stats.totalPayoutsProcessed.toLocaleString()}`}
            change="This week"
            changeType="neutral"
            icon={FileCheck}
            iconColor="text-info"
          />
          <StatsCard
            title="Avg Processing Time"
            value={stats.avgProcessingTime}
            change="Automated payouts"
            changeType="positive"
            icon={Clock}
            iconColor="text-primary"
          />
          <StatsCard
            title="Fraud Detected"
            value={stats.fraudDetected}
            change="Blocked this week"
            changeType="neutral"
            icon={ShieldAlert}
            iconColor="text-destructive"
          />
          <StatsCard
            title="Active Workers"
            value={stats.activeWorkers.toLocaleString()}
            change="Currently online"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-success"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Claims & Payouts Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Weekly Claims & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyClaimsData}>
                    <defs>
                      <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="payouts"
                      stroke="var(--chart-1)"
                      fillOpacity={1}
                      fill="url(#colorPayouts)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Zone Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {riskDistributionData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Triggers & Recent Claims */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Active Triggers */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Active Triggers</CardTitle>
              <Badge variant="destructive">{liveTriggers.filter(t => !t.endTime).length} Active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveTriggers.filter(t => !t.endTime).slice(0, 4).map((trigger) => (
                <div
                  key={trigger.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      trigger.severity === 'Critical' ? 'bg-destructive/20 text-destructive' :
                      trigger.severity === 'High' ? 'bg-warning/20 text-warning' :
                      'bg-info/20 text-info'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{trigger.type}</p>
                      <p className="text-sm text-muted-foreground">{trigger.zone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      trigger.severity === 'Critical' ? 'destructive' :
                      trigger.severity === 'High' ? 'secondary' : 'outline'
                    }>
                      {trigger.severity}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trigger.affectedWorkers} workers
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Claims */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Claims</CardTitle>
              <Badge variant="outline">{liveClaims.length} Total</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveClaims.slice(0, 4).map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
                >
                  <div>
                    <p className="font-medium text-card-foreground">{claim.workerName}</p>
                    <p className="text-sm text-muted-foreground">{claim.triggerType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">₹{claim.payout}</p>
                    <Badge variant={
                      claim.status === 'paid' ? 'default' :
                      claim.status === 'auto-approved' ? 'secondary' :
                      claim.status === 'rejected' ? 'destructive' : 'outline'
                    } className={claim.status === 'paid' ? 'bg-success text-success-foreground' : ''}>
                      {claim.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
