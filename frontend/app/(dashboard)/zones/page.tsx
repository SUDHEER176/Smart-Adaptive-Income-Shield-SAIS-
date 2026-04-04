"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { ZoneCard } from "@/components/dashboard/zone-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRealtimeData } from "@/hooks/use-realtime"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { MapPin, AlertTriangle, Users, TrendingUp, CloudRain, Wind } from "lucide-react"

export default function ZonesPage() {
  const { data, isLoading } = useRealtimeData()
  const zones = data.zones
  
  const [selectedZone, setSelectedZone] = useState<any | null>(null)
  const [cityFilter, setCityFilter] = useState<string>("all")

  if (isLoading || !zones) {
    return (
      <div className="flex flex-col">
        <Header
          title="Zone Risk Map"
          description="Monitor real-time risk levels across zones"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading real-time zone data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filteredZones = cityFilter === "all"
    ? zones
    : zones.filter(z => z.city === cityFilter)

  const cities = [...new Set(zones.map(z => z.city))]

  const radarData = selectedZone ? [
    { metric: "Weather Risk", value: selectedZone.weatherCondition === "Rainy" ? 80 : selectedZone.weatherCondition === "Extreme Heat" ? 70 : 30, fullMark: 100 },
    { metric: "AQI Risk", value: Math.min(selectedZone.avgAQI / 3, 100), fullMark: 100 },
    { metric: "Demand Level", value: 100 - selectedZone.demandLevel, fullMark: 100 },
    { metric: "Worker Density", value: selectedZone.activeWorkers / 4, fullMark: 100 },
    { metric: "Overall Risk", value: selectedZone.riskScore * 100, fullMark: 100 },
  ] : []

  const cityWiseData = cities.map(city => ({
    city,
    workers: zones.filter(z => z.city === city).reduce((sum, z) => sum + z.activeWorkers, 0)
  }))

  const triggerTypeData = data.triggers ? [
    { type: "Weather", count: data.triggers.filter(t => t.type === "weather").length },
    { type: "Demand", count: data.triggers.filter(t => t.type === "demand").length },
    { type: "AQI", count: data.triggers.filter(t => t.type === "aqi").length },
    { type: "System", count: data.triggers.filter(t => t.type === "system").length },
  ] : []

  return (
    <div className="flex flex-col">
      <Header
        title="Zone Risk Map"
        description="Monitor and analyze risk across delivery zones"
      />

      <div className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="grid" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-secondary">
              <TabsTrigger value="grid">Zone Grid</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[180px] bg-secondary">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="grid" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Zone List */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredZones.map(zone => (
                    <ZoneCard
                      key={zone.id}
                      zone={zone}
                      selected={selectedZone?.id === zone.id}
                      onClick={() => setSelectedZone(zone)}
                    />
                  ))}
                </div>
              </div>

              {/* Zone Details */}
              {selectedZone && (
                <Card className="bg-card border-border h-fit sticky top-24">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Zone Details</CardTitle>
                      <Badge variant={
                        selectedZone.riskLevel === "Low" ? "default" :
                        selectedZone.riskLevel === "Medium" ? "secondary" : "destructive"
                      }>
                        {selectedZone.riskLevel} Risk
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{selectedZone.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedZone.city}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-secondary p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Users className="h-4 w-4" />
                          <span className="text-xs">Active Workers</span>
                        </div>
                        <p className="text-xl font-bold">{selectedZone.activeWorkers}</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs">Demand Level</span>
                        </div>
                        <p className="text-xl font-bold">{selectedZone.demandLevel}%</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Wind className="h-4 w-4" />
                          <span className="text-xs">AQI Level</span>
                        </div>
                        <p className={`text-xl font-bold ${
                          selectedZone.avgAQI > 150 ? "text-destructive" :
                          selectedZone.avgAQI > 100 ? "text-warning" : "text-success"
                        }`}>{selectedZone.avgAQI}</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <CloudRain className="h-4 w-4" />
                          <span className="text-xs">Weather</span>
                        </div>
                        <p className="text-lg font-bold">{selectedZone.weatherCondition}</p>
                      </div>
                    </div>

                    {/* Risk Radar */}
                    <div className="h-[200px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                          <Radar
                            dataKey="value"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Coordinates</p>
                      <p className="text-sm font-mono">
                        {selectedZone.coordinates.lat.toFixed(4)}, {selectedZone.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* City-wise Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Workers by City</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cityWiseData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis dataKey="city" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="workers" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Claims by City */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Claims by City</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cityWiseData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis dataKey="city" type="category" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="claims" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Trigger Types */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Trigger Distribution by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={triggerTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
