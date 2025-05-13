"use client"

import { useState } from "react"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Car, FileText, MessageSquare, Bell, User, LogOut, Plus, Clock, CheckCircle2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useLanguage } from "@/lib/language-context"
import { EmergencyContacts } from "@/components/emergency-contacts"

export default function DriverDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()

  // Update the dates to be within a reasonable timeframe (not going beyond April 2025)
  const [activeClaims, setActiveClaims] = useState([
    {
      id: "CL-2025-001",
      vehicle: "Toyota RAV4",
      date: "2025-03-15",
      status: "In Progress",
      progress: 45,
      insurer: "Sanlam Alianz",
      amount: 450000,
    },
    {
      id: "CL-2025-002",
      vehicle: "Suzuki Swift",
      date: "2025-02-28",
      status: "Assessment",
      progress: 25,
      insurer: "Sanlam Alianz",
      amount: 280000,
    },
  ])

  const [completedClaims, setCompletedClaims] = useState([
    {
      id: "CL-2025-003",
      vehicle: "Honda Civic",
      date: "2025-01-05",
      status: "Completed",
      progress: 100,
      insurer: "Sanlam Alianz",
      amount: 320000,
    },
  ])

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your claim CL-2025-001 has been approved for assessment.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      message: "Garage 'Kigali Auto Services' has submitted a repair quote for your vehicle.",
      time: "1 day ago",
      read: true,
    },
    {
      id: 3,
      message: "Your claim CL-2025-002 requires additional documentation.",
      time: "2 days ago",
      read: false,
    },
  ])

  return (
    <DashboardLayout
      user={{
        name: user?.name ? `${user.name} ` : "User name",
        role: user?.role.name,
        avatar: user?.avatar? user?.avatar:"/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        {
          name: `Kanda Claim - ${t("nav.dashboard")}`,
          href: "/dashboard/driver",
          icon: <Car className="h-5 w-5" />,
          translationKey: "nav.dashboard",
        },
        {
          name: t("nav.claims"),
          href: "/dashboard/driver/claims",
          icon: <FileText className="h-5 w-5" />,
          translationKey: "nav.claims",
        },
        {
          name: t("nav.messages"),
          href: "/dashboard/driver/messages",
          icon: <MessageSquare className="h-5 w-5" />,
          translationKey: "nav.messages",
        },
        {
          name: t("nav.notifications"),
          href: "/dashboard/driver/notifications",
          icon: <Bell className="h-5 w-5" />,
          translationKey: "nav.notifications",
        },
        {
          name: t("nav.profile"),
          href: "/dashboard/driver/profile",
          icon: <User className="h-5 w-5" />,
          translationKey: "nav.profile",
        },  { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" />}
      ]}
      // actions={[
      //   {
      //     name: t("action.new_claim"),
      //     href: "/dashboard/driver/claims/new",
      //     icon: <Plus className="h-5 w-5" />,
      //     translationKey: "action.new_claim",
      //   },
      //   { name: t("nav.logout"), href: "/logout", icon: <LogOut className="h-5 w-5" />, translationKey: "nav.logout" },
      // ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("nav.dashboard")}</h1>
          <Button asChild>
            <Link href="/dashboard/driver/claims/new">
              <Plus className="mr-2 h-4 w-4" /> {t("action.new_claim")}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("claims.active")}</CardTitle>
              <CardDescription className="text-2xl font-bold">{activeClaims.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {activeClaims.length > 0 ? t("claims.in_progress") : t("claims.no_active")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("claims.total")}</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {activeClaims.length + completedClaims.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{t("claims.lifetime")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("notifications.unread")}</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {notifications.filter((n) => !n.read).length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {notifications.filter((n) => !n.read).length > 0
                  ? t("notifications.new_updates")
                  : t("notifications.no_new")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">{t("claims.active")}</TabsTrigger>
            <TabsTrigger value="completed">{t("claims.completed")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("notifications.recent")}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeClaims.length > 0 ? (
              activeClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle} • {claim.date}
                        </p>
                      </div>
                      <Badge
                        className="mt-2 md:mt-0 w-fit"
                        variant={claim.status === "In Progress" ? "default" : "secondary"}
                      >
                        {claim.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t("claims.progress")}:</span>
                        <span>{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                    </div>

                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t("claims.insurer")}:</span> {claim.insurer}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">{t("claims.estimated_amount")}:</span>{" "}
                        {claim.amount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/driver/claims/${claim.id}`}>{t("action.view_details")}</Link>
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
                    <h3 className="text-lg font-semibold mb-2">{t("claims.no_active_claims")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("claims.no_active_message")}</p>
                    <Button asChild>
                      <Link href="/dashboard/driver/claims/new">
                        <Plus className="mr-2 h-4 w-4" /> {t("claims.new")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedClaims.length > 0 ? (
              completedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Claim #{claim.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle} • {claim.date}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0 w-fit" variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {claim.status}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t("claims.insurer")}:</span> {claim.insurer}
                      </div>
                      <div className="text-sm mt-2 md:mt-0">
                        <span className="text-muted-foreground">{t("claims.final_amount")}:</span>{" "}
                        {claim.amount.toLocaleString()} RWF
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/driver/claims/${claim.id}`}>{t("action.view_details")}</Link>
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
                    <h3 className="text-lg font-semibold mb-2">{t("claims.no_completed_claims")}</h3>
                    <p className="text-sm text-muted-foreground">{t("claims.no_completed_message")}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card key={notification.id} className={notification.read ? "bg-gray-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-2 ${notification.read ? "bg-gray-200" : "bg-primary/10"}`}>
                        {notification.read ? (
                          <Bell className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Bell className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notification.read ? "text-muted-foreground" : "font-medium"}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("notifications.no_notifications_title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("notifications.no_notifications_message")}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {notifications.length > 0 && (
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/driver/notifications">{t("notifications.view_all")}</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Emergency Contacts Section - Moved to bottom */}
        <div className="mt-8">
          <EmergencyContacts />
        </div>
      </div>
    </DashboardLayout>
  )
}
