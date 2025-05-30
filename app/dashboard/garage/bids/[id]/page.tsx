"use client"

import { useState, useEffect, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import type { Bid } from "@/lib/types/bidding"
import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";
interface Props {
  params: Promise<{ id: string }>;
}
export default function GarageBidDetailsPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter()
  const { user , apiRequest } = useAuth()

  const [bid, setBid] = useState<Bid | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetchBid = async () => {
    setIsLoading(true)
    try {
      const response = await apiRequest(`${API_URL}bids/${id}/${user.tenant_id}`, "GET");
      setBid(response)
    } catch (error) {
      console.error("Error loading bid:", error)
      toast({
        title: "Error Loading Bid",
        description: "There was an error loading the bid details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchBid()
    }
  }, [id])

  if (isLoading) {
    return <div>Loading bid details...</div>
  }

  if (!bid) {
    return <div>Bid not found.</div>
  }

  return (
    <DashboardLayout
      user={{
        name: user?.name,
        role: "Garage",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: null },
        { name: "Repairs", href: "/dashboard/garage/repairs", icon: null },
        { name: "Bids", href: "/dashboard/garage/bids", icon: null },
        { name: "Schedule", href: "/dashboard/garage/schedule", icon: null },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bid Details</h1>
            <p className="text-muted-foreground">View details for bid #{bid.code}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/garage/bids">Back to Bids</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bid Information</CardTitle>
            <CardDescription>Details about the bid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bid ID</Label>
              <Input type="text" value={bid.code} readOnly />
            </div>
            <div>
              <Label>Claim ID</Label>
              <Input type="text" value={bid.claim.code} readOnly />
            </div>
            <div>
              <Label>Vehicle Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Make</Label>
                  <Input type="text" value={bid.vehicle_info.make} readOnly />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input type="text" value={bid.vehicle_info.model} readOnly />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input type="text" value={bid.vehicle_info.year} readOnly />
                </div>
                <div>
                  <Label>License Plate</Label>
                  <Input type="text" value={bid.vehicle_info.license_plate} readOnly />
                </div>
              </div>
            </div>
            <div>
              <Label>Damage Description</Label>
              <Input type="text" value={bid.damage_description} readOnly />
            </div>
            <div>
              <Label>Scope of Work</Label>
              <ul>
                {bid.scope_of_work.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <Label>Estimated Cost</Label>
              <Input type="text" value={bid.estimated_cost.toLocaleString()} readOnly />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-5 container">
          <Button variant="outline" asChild>
            <Link href="/dashboard/garage/bids">Back to Bids</Link>
          </Button>
          {bid.status === "open" && (
            <Button asChild >
              <Link href={`/dashboard/garage/bids/${bid.id}/submit`}>Submit Bid</Link>
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
