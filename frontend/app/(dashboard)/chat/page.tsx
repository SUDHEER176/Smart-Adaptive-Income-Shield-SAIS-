"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { workers } from "@/lib/mock-data"
import {
  MessageSquare,
  Send,
  Phone,
  CheckCheck,
  Clock,
  Shield,
  AlertTriangle,
  IndianRupee,
  CloudRain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Worker } from "@/lib/mock-data"

interface Message {
  id: string
  type: "bot" | "user"
  content: string
  timestamp: Date
  status?: "sent" | "delivered" | "read"
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "bot",
    content: "Welcome to SAIS - Smart Adaptive Income Shield! I'm here to help you protect your income. Type 'hi' to get started.",
    timestamp: new Date(Date.now() - 3600000),
    status: "read",
  },
]

const botResponses: Record<string, string[]> = {
  hi: [
    "Hi! Welcome to SAIS Income Protection.",
    "I can help you with:\n1. Check your coverage status\n2. View recent claims\n3. Opt-in for weekly coverage\n4. Get help\n\nJust type the number or keyword!",
  ],
  hello: [
    "Hello! Welcome to SAIS.",
    "How can I help you today?\n\n1. Coverage Status\n2. Recent Claims\n3. Opt-in Coverage\n4. Help",
  ],
  "1": [
    "Checking your coverage status...",
    "Your coverage is ACTIVE for this week.\n\nPolicy Details:\nPremium: Rs 45/week\nCoverage Limit: Rs 1,500\nValid: Mar 16 - Mar 22, 2026\n\nYou're protected against rain, pollution, and other disruptions.",
  ],
  coverage: [
    "Checking your coverage status...",
    "Your coverage is ACTIVE for this week.\n\nPolicy Details:\nPremium: Rs 45/week\nCoverage Limit: Rs 1,500\nValid: Mar 16 - Mar 22, 2026",
  ],
  "2": [
    "Fetching your recent claims...",
    "Recent Claims:\n\n1. Heavy Rain (Mar 20)\n   Status: PAID\n   Amount: Rs 350\n\n2. High Pollution (Mar 18)\n   Status: AUTO-APPROVED\n   Amount: Rs 280\n\nTotal received this month: Rs 630",
  ],
  claims: [
    "Your recent claims are being processed automatically!",
    "Claim History:\n- Mar 20: Rs 350 (Heavy Rain) - Paid\n- Mar 18: Rs 280 (Pollution) - Paid\n\nNo pending claims.",
  ],
  "3": [
    "Great choice! Let's set up your weekly coverage.",
    "Based on your profile:\n\nZone: Vijayawada Central\nRisk Level: Medium\nSuggested Premium: Rs 45/week\nMax Coverage: Rs 1,500\n\nReply 'CONFIRM' to activate or 'SKIP' to cancel.",
  ],
  confirm: [
    "Processing your opt-in request...",
    "Congratulations! Your coverage is now ACTIVE.\n\nYou're protected from:\n- Heavy Rain\n- Extreme Heat\n- High Pollution\n- Traffic Disruptions\n- Low Demand\n\nPayments will be automatic. Stay safe!",
  ],
  "4": [
    "Here's how SAIS works:",
    "SAIS automatically:\n\n1. Monitors weather, pollution & demand\n2. Detects when you're affected\n3. Calculates your income loss\n4. Sends payment to your UPI\n\nNo claims needed! Everything is automatic.\n\nFor support: support@sais.in",
  ],
  help: [
    "SAIS Support",
    "Common questions:\n\nQ: How do I get paid?\nA: Automatically to your UPI when disruption detected.\n\nQ: What's covered?\nA: Rain, heat, pollution, traffic, low demand.\n\nQ: Can I cancel?\nA: Yes, just don't opt-in next week.\n\nType 'agent' for human support.",
  ],
  rain: [
    "Rain Alert Detected!",
    "Heavy rain detected in your area.\n\nYour coverage is ACTIVE. If your earnings drop, compensation will be processed automatically within 2 hours.\n\nStay safe!",
  ],
  status: [
    "Checking system status...",
    "Current Status:\n\nYour Zone: Vijayawada Central\nWeather: Rainy\nAQI: 89 (Moderate)\nDemand: 72%\n\nNo disruptions affecting your income right now.",
  ],
}

export default function ChatPage() {
  const [selectedWorker, setSelectedWorker] = useState<Worker>(workers[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response
    const keyword = inputValue.toLowerCase().trim()
    const responses = botResponses[keyword] || [
      "I didn't understand that. Please try:",
      "1. Coverage - Check your status\n2. Claims - View recent claims\n3. Help - Get assistance\n\nOr just say 'Hi' to start over!",
    ]

    // Simulate typing delay
    setTimeout(() => {
      responses.forEach((response, index) => {
        setTimeout(() => {
          const botMessage: Message = {
            id: `${Date.now()}-${index}`,
            type: "bot",
            content: response,
            timestamp: new Date(),
            status: "delivered",
          }
          setMessages((prev) => [...prev, botMessage])
          if (index === responses.length - 1) {
            setIsTyping(false)
          }
        }, (index + 1) * 800)
      })
    }, 500)
  }

  return (
    <div className="flex flex-col">
      <Header
        title="WhatsApp Simulator"
        description="Preview the worker chat experience"
      />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Worker List */}
          <Card className="bg-card border-border lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Workers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {workers.map((worker) => (
                  <button
                    key={worker.id}
                    onClick={() => setSelectedWorker(worker)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 border-b border-border transition-colors text-left",
                      selectedWorker.id === worker.id
                        ? "bg-primary/10"
                        : "hover:bg-secondary"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground text-sm font-medium">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{worker.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{worker.phone}</p>
                    </div>
                    {worker.status === 'covered' && (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="bg-card border-border lg:col-span-3 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border p-4 bg-success/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground text-sm font-medium">
                  {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{selectedWorker.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedWorker.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <Phone className="h-3 w-3 mr-1" />
                  WhatsApp
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 h-[450px]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        message.type === "user"
                          ? "bg-success text-success-foreground rounded-br-none"
                          : "bg-secondary text-secondary-foreground rounded-bl-none"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        message.type === "user" ? "justify-end" : "justify-start"
                      )}>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.type === "user" && (
                          <CheckCheck className={cn(
                            "h-3 w-3",
                            message.status === "read" ? "text-info" : "opacity-50"
                          )} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-lg p-3 rounded-bl-none">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message... (try 'hi', 'coverage', 'claims', 'help')"
                  className="flex-1 bg-secondary"
                />
                <Button
                  onClick={handleSend}
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInputValue("hi")
                    setTimeout(handleSend, 100)
                  }}
                >
                  Start Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInputValue("coverage")
                    setTimeout(handleSend, 100)
                  }}
                >
                  Check Coverage
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInputValue("rain")
                    setTimeout(handleSend, 100)
                  }}
                >
                  Simulate Rain Alert
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
