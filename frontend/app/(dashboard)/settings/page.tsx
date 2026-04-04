"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Shield,
  Database,
  Key,
  Globe,
  Smartphone,
  Mail,
  Clock,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Settings"
        description="Configure platform settings and integrations"
      />

      <div className="flex-1 p-6 space-y-6 max-w-4xl">
        {/* General Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              General Settings
            </CardTitle>
            <CardDescription>Configure basic platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="SAIS Platform" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="Asia/Kolkata (IST)" className="bg-secondary" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" defaultValue="support@sais.in" className="bg-secondary" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Trigger Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when new triggers are detected</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fraud Detection Alerts</Label>
                <p className="text-sm text-muted-foreground">Immediate alerts for suspicious activities</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payout Notifications</Label>
                <p className="text-sm text-muted-foreground">Updates on payout processing</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Configuration
            </CardTitle>
            <CardDescription>External service integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weather-api">Weather API Key</Label>
              <Input id="weather-api" type="password" defaultValue="sk-weather-xxxxx" className="bg-secondary font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aqi-api">AQI API Key</Label>
              <Input id="aqi-api" type="password" defaultValue="sk-aqi-xxxxx" className="bg-secondary font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-api">Payment Gateway API</Label>
              <Input id="payment-api" type="password" defaultValue="sk-payment-xxxxx" className="bg-secondary font-mono" />
            </div>
          </CardContent>
        </Card>

        {/* Fraud Detection Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Fraud Detection
            </CardTitle>
            <CardDescription>Configure fraud detection thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="auto-approve">Auto-Approve Threshold</Label>
                <Input id="auto-approve" type="number" defaultValue="0.3" step="0.1" className="bg-secondary" />
                <p className="text-xs text-muted-foreground">Score below this = auto approve</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review">Review Threshold</Label>
                <Input id="review" type="number" defaultValue="0.7" step="0.1" className="bg-secondary" />
                <p className="text-xs text-muted-foreground">Score above this = reject</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grace">Grace Period (mins)</Label>
                <Input id="grace" type="number" defaultValue="15" className="bg-secondary" />
                <p className="text-xs text-muted-foreground">Time for soft verification</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Coordinated Fraud Detection</Label>
                <p className="text-sm text-muted-foreground">Detect group fraud attempts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Premium Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Premium Configuration
            </CardTitle>
            <CardDescription>Weekly premium calculation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="base-premium">Base Premium (Rs)</Label>
                <Input id="base-premium" type="number" defaultValue="30" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-coverage">Max Coverage (Rs)</Label>
                <Input id="max-coverage" type="number" defaultValue="2000" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonal-factor">Seasonal Multiplier (Monsoon)</Label>
                <Input id="seasonal-factor" type="number" defaultValue="1.3" step="0.1" className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="high-risk-factor">High Risk Zone Multiplier</Label>
                <Input id="high-risk-factor" type="number" defaultValue="1.5" step="0.1" className="bg-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button className="bg-primary text-primary-foreground">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
