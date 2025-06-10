"use client"

import { useEffect, useState } from "react"
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
import { useAuth } from "@/lib/auth-provider"
import { formatDistanceToNow } from "date-fns"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/components/ui/use-toast"
import { Notification } from "@/lib/types/messaging"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
export default function InsurerNotifications() {
  const { user, apiRequest } = useAuth()
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all")
  // const [notifications, setNotifications] = useState(initialNotifications)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiRequest(`${API_URL}notifications-by-tenant/${user?.tenant_id}`, "GET");
        setNotifications(response);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
      }
    };
    fetchNotifications();
  }, []);
  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const readNotifications = notifications.filter((notification) => notification.read)


  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`${API_URL}notifications/${id}/read/${user?.id}`, "PATCH");
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast({ title: "Error", description: "Failed to mark notification as read", variant: "destructive" });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiRequest(`${API_URL}notifications/${id}`, "DELETE");
      setNotifications(notifications.filter((n) => n.id !== id));
      toast({ title: "Success", description: "Notification deleted" });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "pickup") {
      setSelectedNotification(notification);
      setIsPickupDialogOpen(true);
    }
    if (!notification.read) {
      markAsRead(notification.id.toString());
    }
  };

  const handlePickupConfirm = async () => {
    if (!selectedNotification) return;

    try {
      const response = await apiRequest(`${API_URL}notifications/${selectedNotification.id}/pickup/${user?.id}`, "POST");
      setIsPickupDialogOpen(false);
      setNotifications(
        notifications.map((n) =>
          n.id === selectedNotification.id ? { ...n, read: true } : n
        )
      );
      toast({ title: "Pickup Confirmed", description: "Thank you for confirming your vehicle pickup" });

      // Open rating dialog with garage data
      setTimeout(() => {
        setIsRatingDialogOpen(true);
      }, 500);
    } catch (error) {
      console.error("Failed to confirm pickup:", error);
      toast({ title: "Error", description: "Failed to confirm pickup", variant: "destructive" });
    }
  };

  const handleRateGarage = async (rating: number, comment?: string) => {
    if (!selectedNotification) return;

    try {
      await apiRequest(`${API_URL}notifications/${selectedNotification.id}/rating/${user?.id}`, "POST", {
        rating,
        comment,
      });
      setIsRatingDialogOpen(false);
      toast({ title: "Success", description: "Garage rated successfully" });
    } catch (error) {
      console.error("Failed to rate garage:", error);
      toast({ title: "Error", description: "Failed to rate garage", variant: "destructive" });
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
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
        name: user.name,
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }
      ]}
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
                              {notification.timestamp}
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
                              {notification.timestamp}
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
