"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRealtimeData } from "@/hooks/use-realtime"
import { AlertCircle, MessageCircle, CheckCircle } from "lucide-react"

export default function RegistrationPage() {
  const { data, isLoading } = useRealtimeData()
  const registrations = data.registrations || []
  const workers = data.workers || []

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Header
          title="Worker Registration"
          description="Register via WhatsApp Chatbot"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading registration data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const recentRegistrations = registrations.filter((r: any) => r.source === 'chatbot').slice(-5)

  return (
    <div className="flex flex-col">
      <Header
        title="Worker Registration"
        description="All registrations via WhatsApp Chatbot"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* How to Register Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageCircle className="h-5 w-5" />
              How to Register
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold text-blue-900">Open WhatsApp</p>
                  <p className="text-sm text-blue-800">Send a message to Twilio Sandbox: <code className="bg-white px-2 py-1 rounded">+1 415-523-8886</code></p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold text-blue-900">Type: REGISTER</p>
                  <p className="text-sm text-blue-800">The chatbot will guide you through a 4-step registration process</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold text-blue-900">Follow the Steps</p>
                  <p className="text-sm text-blue-800">Name → Zone → Platform → Weekly Hours</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">4</div>
                <div>
                  <p className="font-semibold text-blue-900">Done! 🎉</p>
                  <p className="text-sm text-blue-800">Your worker ID and insurance policy are created automatically</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commands Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Available WhatsApp Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono font-bold text-primary">REGISTER</p>
                <p className="text-sm text-muted-foreground">Start the registration process</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono font-bold text-primary">POLICY</p>
                <p className="text-sm text-muted-foreground">View your insurance policy details</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono font-bold text-primary">CLAIM</p>
                <p className="text-sm text-muted-foreground">File a new claim for income loss</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono font-bold text-primary">STATUS</p>
                <p className="text-sm text-muted-foreground">Check your profile and statistics</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono font-bold text-primary">REPORT</p>
                <p className="text-sm text-muted-foreground">Report an issue or problem</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="font-mono font-bold text-primary">HELP</p>
                <p className="text-sm text-muted-foreground">View full command menu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              What You Get After Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-900">
              <li>✅ Unique Worker ID for tracking</li>
              <li>✅ Instant Insurance Policy with dynamic premium calculation</li>
              <li>✅ Automatic weekly coverage renewal</li>
              <li>✅ Ability to file claims directly via chatbot</li>
              <li>✅ Real-time claim status updates</li>
              <li>✅ Automatic 80% payout on approved claims</li>
              <li>✅ 24/7 WhatsApp chatbot support</li>
            </ul>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        {recentRegistrations.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Registrations via Chatbot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRegistrations.map((reg: any) => (
                  <div key={reg.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-semibold">{reg.name}</p>
                      <p className="text-xs text-muted-foreground">{reg.phone} • {reg.zone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{reg.id}</p>
                      <p className="text-xs text-green-600">✅ Registered</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Alert */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">💡 Multi-Phone Support</p>
              <p>Each phone number gets its own worker profile and can independently register, manage policies, and file claims via WhatsApp.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

