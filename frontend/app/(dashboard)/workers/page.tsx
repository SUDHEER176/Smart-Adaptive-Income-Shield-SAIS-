"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRealtimeData } from "@/hooks/use-realtime"
import { Search, Filter, UserPlus, Phone, MapPin, Clock, IndianRupee, Shield, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function WorkersPage() {
  const { data, isLoading } = useRealtimeData()
  const workers = data.workers
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null)

  if (isLoading || !workers) {
    return (
      <div className="flex flex-col">
        <Header
          title="Workers"
          description="Manage and monitor your workforce"
        />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading real-time worker data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phone.includes(searchQuery) ||
      worker.zone.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || worker.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const policies = workers.map((worker, index) => ({
    workerId: worker.id,
    premium: 200 + (index % 5) * 50,
    coverageLimit: 50000 + (index % 10) * 5000,
    weekStart: '2024-01-01',
    weekEnd: '2024-01-07',
    status: index % 2 === 0 ? 'active' : 'inactive'
  }))

  const getWorkerPolicy = (workerId: string) => {
    return policies.find(p => p.workerId === workerId && p.status === 'active')
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Workers Management"
        description="Manage gig workers and their coverage"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Workers</p>
                  <p className="text-2xl font-bold">{workers.length}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-info">
                  <UserPlus className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Covered</p>
                  <p className="text-2xl font-bold">{workers.filter(w => w.status === 'covered').length}</p>
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
                  <p className="text-2xl font-bold">{workers.filter(w => w.status === 'active').length}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-success">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Income</p>
                  <p className="text-2xl font-bold">₹{Math.round(workers.reduce((acc, w) => acc + w.avgIncome, 0) / workers.length)}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-warning">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or zone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-secondary">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="covered">Covered</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workers Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Worker</TableHead>
                  <TableHead className="text-muted-foreground">Zone</TableHead>
                  <TableHead className="text-muted-foreground">Platform</TableHead>
                  <TableHead className="text-muted-foreground">Avg Income</TableHead>
                  <TableHead className="text-muted-foreground">Risk Score</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => {
                  const policy = getWorkerPolicy(worker.id)
                  return (
                    <TableRow key={worker.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                            {worker.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{worker.name}</p>
                            <p className="text-sm text-muted-foreground">{worker.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{worker.zone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{worker.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₹{worker.avgIncome}/day</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                worker.riskScore < 0.4 ? "bg-success" :
                                worker.riskScore < 0.7 ? "bg-warning" : "bg-destructive"
                              )}
                              style={{ width: `${worker.riskScore * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{(worker.riskScore * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          worker.status === 'covered' ? 'default' :
                          worker.status === 'active' ? 'secondary' : 'outline'
                        } className={worker.status === 'covered' ? 'bg-primary text-primary-foreground' : ''}>
                          {worker.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedWorker(worker)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Worker Details</DialogTitle>
                              <DialogDescription>
                                Complete information about the worker
                              </DialogDescription>
                            </DialogHeader>
                            {selectedWorker && (
                              <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-xl font-medium">
                                    {selectedWorker.name.split(' ').map((n: string) => n[0]).join('')}
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold">{selectedWorker.name}</h3>
                                    <p className="text-muted-foreground">{selectedWorker.platform} Partner</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="rounded-lg bg-secondary p-3">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                      <Phone className="h-4 w-4" />
                                      <span className="text-xs">Phone</span>
                                    </div>
                                    <p className="font-medium">{selectedWorker.phone}</p>
                                  </div>
                                  <div className="rounded-lg bg-secondary p-3">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                      <MapPin className="h-4 w-4" />
                                      <span className="text-xs">Zone</span>
                                    </div>
                                    <p className="font-medium text-sm">{selectedWorker.zone}</p>
                                  </div>
                                  <div className="rounded-lg bg-secondary p-3">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                      <IndianRupee className="h-4 w-4" />
                                      <span className="text-xs">Avg Daily Income</span>
                                    </div>
                                    <p className="font-medium">₹{selectedWorker.avgIncome}</p>
                                  </div>
                                  <div className="rounded-lg bg-secondary p-3">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                      <Clock className="h-4 w-4" />
                                      <span className="text-xs">Weekly Hours</span>
                                    </div>
                                    <p className="font-medium">{selectedWorker.weeklyHours} hrs</p>
                                  </div>
                                  <div className="rounded-lg bg-secondary p-3">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                      <IndianRupee className="h-4 w-4" />
                                      <span className="text-xs">UPI ID</span>
                                    </div>
                                    <p className="font-medium text-sm">{selectedWorker.upiId || 'Not set'}</p>
                                  </div>
                                </div>

                                {policy && (
                                  <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-primary">Active Policy</span>
                                      <Badge className="bg-primary text-primary-foreground">₹{policy.premium}/week</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Coverage: ₹{policy.coverageLimit} | Valid: {policy.weekStart} to {policy.weekEnd}
                                    </p>
                                  </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                  <Button className="flex-1 bg-primary text-primary-foreground">
                                    Send Message
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    View History
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
