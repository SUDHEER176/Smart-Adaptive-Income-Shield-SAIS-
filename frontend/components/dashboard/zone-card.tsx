import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CloudRain, Sun, Wind, CloudFog, Users, TrendingUp } from "lucide-react"

interface Zone {
  id: string
  name: string
  city: string
  riskLevel: string
  riskScore: number
  activeWorkers: number
  avgAQI: number
  weatherCondition: string
  demandLevel: number
  coordinates: { lat: number; lng: number }
}

interface ZoneCardProps {
  zone: Zone
  onClick?: () => void
  selected?: boolean
}

const weatherIcons = {
  "Clear": Sun,
  "Rainy": CloudRain,
  "Extreme Heat": Sun,
  "Foggy": CloudFog,
}

export function ZoneCard({ zone, onClick, selected }: ZoneCardProps) {
  const WeatherIcon = weatherIcons[zone.weatherCondition] || Sun

  return (
    <Card
      className={cn(
        "bg-card border-border cursor-pointer transition-all hover:border-primary/50",
        selected && "border-primary ring-1 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-card-foreground">{zone.name}</h3>
            <p className="text-sm text-muted-foreground">{zone.city}</p>
          </div>
          <Badge
            variant={
              zone.riskLevel === "Low" ? "default" :
              zone.riskLevel === "Medium" ? "secondary" : "destructive"
            }
            className={cn(
              zone.riskLevel === "Low" && "bg-success text-success-foreground",
              zone.riskLevel === "Medium" && "bg-warning text-warning-foreground"
            )}
          >
            {zone.riskLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{zone.activeWorkers} workers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <WeatherIcon className={cn(
              "h-4 w-4",
              zone.weatherCondition === "Rainy" && "text-info",
              zone.weatherCondition === "Extreme Heat" && "text-destructive",
              zone.weatherCondition === "Clear" && "text-success",
              zone.weatherCondition === "Foggy" && "text-muted-foreground"
            )} />
            <span className="text-muted-foreground">{zone.weatherCondition}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              zone.avgAQI > 150 ? "text-destructive" :
              zone.avgAQI > 100 ? "text-warning" : "text-muted-foreground"
            )}>
              AQI: {zone.avgAQI}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Demand: {zone.demandLevel}%</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    zone.riskScore < 0.4 ? "bg-success" :
                    zone.riskScore < 0.7 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${zone.riskScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{(zone.riskScore * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
