"use client"

import { useState } from "react"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wrench, FileText, MessageSquare, Bell, User, LogOut, Clock, CheckCircle2, DollarSign } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"

export default function GarageDashboard() {
  const { user } = useAuth()
  const [pendingRepairs, setPendingRepairs] = useState([
    {
      id: "REP-2025-001",
      vehicle: "Toyota RAV4",
      date: "2025-03-15",
      status: "Awaiting Approval",
      customer: "Mugisha Nkusi",
      insurer: "Sanlam Alianz",
      estimatedAmount: 450000,
    },
    {
      id: "REP-2025-002",
      vehicle: "Suzuki Swift",
      date: "2025-02-28",
      status: "Approved",
      customer: "Uwase Marie",
      insurer: "Sanlam Alianz",
      estimatedAmount: 280000,
    },
  ])

  const [activeRepairs, setActiveRepairs] = useState([
    {
      id: "REP-2025-003",
      vehicle: "Honda Civic",
      date: "2025-01-05",
      status: "In Progress",
      customer: "Kamanzi Eric",
      insurer: "Sanlam Alianz",
      estimatedAmount: 320000,
      progress: 60,
    },
  ])

  const [completedRepairs, setCompletedRepairs] = useState([
    {
      id: "REP-2024-004",
      vehicle: "Nissan X-Trail",
      date: "2024-12-20",
      status: "Completed",
      customer: "Mutesi Sarah",
      insurer: "Sanlam Alianz",
      finalAmount: 520000,
      paymentStatus: "Paid",
    },
  ])

  return (
    <DashboardLayout
      user={{
        name: user?.name ? `${user.name}` : "User",
        role: "Garage",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: <Wrench className="h-5 w-5" /> },
        { name: "Repair Jobs", href: "/dashboard/garage/repairs", icon: <FileText className="h-5 w-5" /> },
        { name: "Bids", href: "/dashboard/garage/bids", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/garage/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/garage/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/garage/profile", icon: <User className="h-5 w-5" /> },
      ]}
     // actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Garage Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/garage/repairs">View All Repairs</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Repairs</CardTitle>
              <CardDescription className="text-2xl font-bold">{pendingRepairs.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Awaiting approval or assignment</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Repairs</CardTitle>
              <CardDescription className="text-2xl font-bold">{activeRepairs.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Currently in progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {completedRepairs.reduce((sum, repair) => sum + repair.finalAmount, 0).toLocaleString()} RWF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">From completed repairs</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Repairs</TabsTrigger>
            <TabsTrigger value="active">Active Repairs</TabsTrigger>
            <TabsTrigger value="completed">Completed Repairs</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRepairs.length > 0 ? (
              pendingRepairs.map((repair) => (
                <Card key={repair.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Repair #{repair.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {repair.vehicle} • {repair.date}
                        </p>
                      </div>
                      <Badge
                        className="mt-2 md:mt-0 w-fit"
                        variant={repair.status === "Approved" ? "default" : "secondary"}
                      >
                        {repair.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {repair.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {repair.insurer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                        {repair.estimatedAmount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      {repair.status === "Awaiting Approval" ? (
                        <>
                          <Button variant="outline" size="sm">
                            Update Estimate
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">Start Repair</Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/garage/repairs/${repair.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Repairs</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any pending repair requests at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeRepairs.length > 0 ? (
              activeRepairs.map((repair) => (
                <Card key={repair.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Repair #{repair.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {repair.vehicle} • {repair.date}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit">{repair.status}</Badge>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{repair.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${repair.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {repair.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {repair.insurer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Amount:</span>{" "}
                        {repair.estimatedAmount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button size="sm">Update Progress</Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/garage/repairs/${repair.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Repairs</h3>
                    <p className="text-sm text-muted-foreground">You don't have any active repairs in progress.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRepairs.length > 0 ? (
              completedRepairs.map((repair) => (
                <Card key={repair.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Repair #{repair.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {repair.vehicle} • {repair.date}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 space-x-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {repair.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            repair.paymentStatus === "Paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          <DollarSign className="h-3 w-3 mr-1" /> {repair.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {repair.customer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Insurer:</span> {repair.insurer}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Final Amount:</span>{" "}
                        {repair.finalAmount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/garage/repairs/${repair.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Completed Repairs</h3>
                    <p className="text-sm text-muted-foreground">You don't have any completed repairs yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
