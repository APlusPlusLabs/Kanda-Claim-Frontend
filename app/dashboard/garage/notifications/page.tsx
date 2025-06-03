"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { VehiclePickupDialog } from "@/components/vehicle-pickup-dialog"
import { GarageRatingDialog } from "@/components/garage-rating-dialog"
import { useToast } from "@/components/ui/use-toast"
import { BellIcon, CheckIcon, Cross2Icon, InfoCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Bell, Car, FileText, LogOut, MessageSquare, User } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useLanguage } from "@/lib/language-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
// Mock data for notifications

interface Notification {
  id: string | number;
  title: string;
  description: string;
  timestamp: string;
  type: string;
  read: boolean;
  vehicle?: { make: string; model: string; plateNumber: string; garage: string };
  garage?: { name: string; address: string };
}
export default function NotificationsPage() {
  const { user, apiRequest } = useAuth()
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all")
  // const [userNotifications, setUserNotifications] = useState(initialNotifications)
  const [userNotifications, setUserNotifications] = useState<Notification[]>([])
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiRequest(`${API_URL}notifications/${user?.id}`, "GET");
        setUserNotifications(response);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
      }
    };
    fetchNotifications();
  }, []);
  const unreadCount = userNotifications.filter((n) => !n.read).length

  const filteredNotifications = userNotifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  // const markAllAsRead = () => {
  //   setUserNotifications(userNotifications.map((n) => ({ ...n, read: true })))
  // }
  const markAllAsRead = async () => {
    try {
      const unread = userNotifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) => apiRequest(`${API_URL}notifications/${n.id}/read/${user?.id}`, "PATCH"))
      );
      setUserNotifications(userNotifications.map((n) => ({ ...n, read: true })));
      toast({ title: "Success", description: "All notifications marked as read" });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast({ title: "Error", description: "Failed to mark notifications as read", variant: "destructive" });
    }
  };
  // const markAsRead = (id: string) => {
  //   setUserNotifications(userNotifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  // }

  // const deleteNotification = (id: string) => {
  //   setUserNotifications(userNotifications.filter((n) => n.id !== id))
  // }

  // const handleNotificationClick = (notification: any) => {
  //   // If it's a pickup notification, open the pickup dialog
  //   if (notification.type === "pickup") {
  //     setSelectedNotification(notification)
  //     setIsPickupDialogOpen(true)
  //   }

  //   // Mark as read
  //   markAsRead(notification.id)
  // }

  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`${API_URL}notifications/${id}/read/${user?.id}`, "PATCH");
      setUserNotifications(userNotifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast({ title: "Error", description: "Failed to mark notification as read", variant: "destructive" });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiRequest(`${API_URL}notifications/${id}`, "DELETE");
      setUserNotifications(userNotifications.filter((n) => n.id !== id));
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
      setUserNotifications(
        userNotifications.map((n) =>
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
  // const handlePickupConfirm = () => {
  //   setIsPickupDialogOpen(false)

  //   // Show success toast
  //   toast({
  //     title: "Pickup Confirmed",
  //     description: "Thank you for confirming your vehicle pickup.",
  //   })

  //   // Open rating dialog
  //   setTimeout(() => {
  //     setIsRatingDialogOpen(true)
  //   }, 500)
  // }

  const getIconForType = (type: string) => {
    switch (type) {
      case "info":
        return <InfoCircledIcon className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckIcon className="h-5 w-5 text-green-500" />
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
      case "pickup":
        return <Car className="h-5 w-5 text-blue-500" />
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name || "Name",
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
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
        },
        { name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Notifications</CardTitle>
                <CardDescription>Stay updated on your claims and account activity</CardDescription>
              </div>
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="success">Success</TabsTrigger>
                <TabsTrigger value="warning">Alerts</TabsTrigger>
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No notifications to display</div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-4 p-4 rounded-lg border ${!notification.read ? "bg-muted/50" : ""
                          } ${notification.type === "pickup" ? "cursor-pointer hover:bg-muted/70" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="mt-0.5">{getIconForType(notification.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                          {notification.type === "pickup" && !notification.read && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                Confirm Pickup
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {!notification.read && notification.type !== "pickup" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id.toString())}
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id.toString());
                            }}
                            title="Delete notification"
                          >
                            <Cross2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedNotification && (
        <VehiclePickupDialog
          open={isPickupDialogOpen}
          onOpenChange={setIsPickupDialogOpen}
          onConfirm={handlePickupConfirm}
          vehicle={selectedNotification.vehicle}
        />
      )}

      {selectedNotification && (
        <GarageRatingDialog
          open={isRatingDialogOpen}
          onOpenChange={setIsRatingDialogOpen}
          garage={selectedNotification.garage}
          //onSubmit={handleRateGarage}
        />
      )}
    </DashboardLayout>
  )

}
