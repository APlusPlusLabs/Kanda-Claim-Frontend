"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { VehiclePickupDialog } from "@/components/vehicle-pickup-dialog"
import { GarageRatingDialog } from "@/components/garage-rating-dialog"
import { useToast } from "@/components/ui/use-toast"
import { BellIcon, CheckIcon, Cross2Icon, InfoCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Car } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"

// Mock data for notifications
const initialNotifications = [
  {
    id: "1",
    title: "Claim Status Update",
    description: "Your claim #CL-2023-0042 has been approved and is now in processing.",
    timestamp: "2 hours ago",
    type: "info",
    read: false,
  },
  {
    id: "2",
    title: "Assessment Scheduled",
    description: "An assessor has been assigned to your claim and will visit on 15th May at 10:00 AM.",
    timestamp: "Yesterday",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "Document Request",
    description: "Please provide additional photos of the vehicle damage for your claim #CL-2023-0042.",
    timestamp: "2 days ago",
    type: "warning",
    read: true,
  },
  {
    id: "4",
    title: "Payment Processed",
    description: "A payment of RWF 450,000 has been processed for your claim #CL-2023-0039.",
    timestamp: "1 week ago",
    type: "success",
    read: true,
  },
  {
    id: "5",
    title: "Claim Submission Confirmation",
    description: "Your new claim #CL-2023-0042 has been successfully submitted.",
    timestamp: "2 weeks ago",
    type: "info",
    read: true,
  },
  {
    id: "6",
    title: "Vehicle Ready for Pickup",
    description:
      "Your Toyota RAV4 (RAA 123A) is ready for pickup from Kigali Auto Services. Please collect your vehicle at your earliest convenience.",
    timestamp: "3 hours ago",
    type: "pickup",
    read: false,
    vehicleDetails: {
      make: "Toyota",
      model: "RAV4",
      plateNumber: "RAA 123A",
      garage: "Kigali Auto Services",
    },
    garageDetails: {
      name: "Kigali Auto Services",
      address: "KK 123 St, Kigali",
    },
  },
]

export default function NotificationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [userNotifications, setUserNotifications] = useState(initialNotifications)
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const { toast } = useToast()

  const unreadCount = userNotifications.filter((n) => !n.read).length

  const filteredNotifications = userNotifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  const markAllAsRead = () => {
    setUserNotifications(userNotifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setUserNotifications(userNotifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setUserNotifications(userNotifications.filter((n) => n.id !== id))
  }

  const handleNotificationClick = (notification: any) => {
    // If it's a pickup notification, open the pickup dialog
    if (notification.type === "pickup") {
      setSelectedNotification(notification)
      setIsPickupDialogOpen(true)
    }

    // Mark as read
    markAsRead(notification.id)
  }

  const handlePickupConfirm = () => {
    setIsPickupDialogOpen(false)

    // Show success toast
    toast({
      title: "Pickup Confirmed",
      description: "Thank you for confirming your vehicle pickup.",
    })

    // Open rating dialog
    setTimeout(() => {
      setIsRatingDialogOpen(true)
    }, 500)
  }

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
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Mugisha Nkusi",
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/driver", icon: <Car className="h-5 w-5" /> },
        { name: "My Claims", href: "/dashboard/driver/claims", icon: <BellIcon className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/driver/notifications", icon: <BellIcon className="h-5 w-5" /> },
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
                        className={`flex items-start space-x-4 p-4 rounded-lg border ${
                          !notification.read ? "bg-muted/50" : ""
                        } ${notification.type === "pickup" ? "cursor-pointer hover:bg-muted/70" : ""}`}
                        onClick={() => notification.type === "pickup" && handleNotificationClick(notification)}
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
                                  e.stopPropagation()
                                  handleNotificationClick(notification)
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
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
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

      {/* Vehicle Pickup Dialog */}
      {selectedNotification && (
        <VehiclePickupDialog
          open={isPickupDialogOpen}
          onOpenChange={setIsPickupDialogOpen}
          onConfirm={handlePickupConfirm}
          vehicleDetails={selectedNotification.vehicleDetails}
        />
      )}

      {/* Garage Rating Dialog */}
      {selectedNotification && (
        <GarageRatingDialog
          open={isRatingDialogOpen}
          onOpenChange={setIsRatingDialogOpen}
          garageDetails={selectedNotification.garageDetails}
        />
      )}
    </DashboardLayout>
  )
}
