"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  Car,
  Calendar,
  MessageSquareText,
  Wrench,
  ClipboardCheck,
  X,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { formatDistanceToNow } from "date-fns"

export default function InsurerNotifications() {
  const { user } = useAuth()

  // In a real app, you would fetch this data from an API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "claim_submitted",
      title: "New Claim Submitted",
      description: "Mugisha Nkusi has submitted a new claim for Toyota RAV4 (CL-2025-001)",
      timestamp: "2025-03-15T10:30:00",
      read: false,
      link: "/dashboard/insurer/claims/CL-2025-001",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: 2,
      type: "assessment_completed",
      title: "Assessment Completed",
      description: "Habimana Jean has completed the assessment for Suzuki Swift (CL-2025-002)",
      timestamp: "2025-03-14T14:20:00",
      read: false,
      link: "/dashboard/insurer/claims/CL-2025-002",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      id: 3,
      type: "repair_completed",
      title: "Repairs Completed",
      description: "Kigali Auto Center has completed repairs for Honda Civic (CL-2025-003)",
      timestamp: "2025-03-10T16:45:00",
      read: true,
      link: "/dashboard/insurer/claims/CL-2025-003",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      id: 4,
      type: "message",
      title: "New Message",
      description: "You have a new message from Mugisha Nkusi regarding claim CL-2025-001",
      timestamp: "2025-03-15T11:15:00",
      read: true,
      link: "/dashboard/insurer/messages",
      icon: <MessageSquareText className="h-5 w-5" />,
    },
    {
      id: 5,
      type: "claim_update",
      title: "Claim Status Updated",
      description: "Claim CL-2025-003 has been marked as Completed",
      timestamp: "2025-03-10T17:30:00",
      read: true,
      link: "/dashboard/insurer/claims/CL-2025-003",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      id: 6,
      type: "third_party_claim",
      title: "Third-Party Claim Submitted",
      description: "A third-party claim has been submitted against policy POL-2024-12345",
      timestamp: "2025-03-13T09:45:00",
      read: false,
      link: "/dashboard/insurer/claims",
      icon: <Car className="h-5 w-5" />,
    },
    {
      id: 7,
      type: "appointment",
      title: "Assessment Scheduled",
      description: "Assessment for claim CL-2025-002 scheduled for March 17, 2025",
      timestamp: "2025-03-12T13:20:00",
      read: true,
      link: "/dashboard/insurer/claims/CL-2025-002",
      icon: <Calendar className="h-5 w-5" />,
    },
  ])

  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const readNotifications = notifications.filter((notification) => notification.read)

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "claim_submitted":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "assessment_completed":
        return <ClipboardCheck className="h-5 w-5 text-green-500" />
      case "repair_completed":
        return <Wrench className="h-5 w-5 text-green-500" />
      case "message":
        return <MessageSquareText className="h-5 w-5 text-purple-500" />
      case "claim_update":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "third_party_claim":
        return <Car className="h-5 w-5 text-orange-500" />
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Marie Uwase",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge className="ml-2 bg-muted text-muted-foreground">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadNotifications.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">{unreadNotifications.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card key={notification.id} className={notification.read ? "" : "border-primary"}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-0.5 bg-muted rounded-full p-2">{getNotificationIcon(notification.type)}</div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{notification.title}</h3>
                            {!notification.read && (
                              <Badge className="ml-2 bg-primary text-primary-foreground">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            Mark as Read
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                <p className="text-sm text-muted-foreground">You don't have any notifications at the moment.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4 mt-4">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <Card key={notification.id} className="border-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-0.5 bg-muted rounded-full p-2">{getNotificationIcon(notification.type)}</div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{notification.title}</h3>
                            <Badge className="ml-2 bg-primary text-primary-foreground">New</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                          <div className="flex items-center mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark as Read
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground">You have no unread notifications.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
