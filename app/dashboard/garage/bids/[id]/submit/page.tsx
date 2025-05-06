"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "@/Next.js/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"

export default function SubmitBidPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = useParams()
  const { toast } = useToast()

  const [costBreakdown, setCostBreakdown] = useState([
    { item: "Part 1", cost: 100000, description: "" },
    { item: "Labor", cost: 50000, description: "" },
  ])
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState("")
  const [notes, setNotes] = useState("")

  const addCostItem = () => {
    setCostBreakdown([...costBreakdown, { item: `Part ${costBreakdown.length + 1}`, cost: 0, description: "" }])
  }

  const updateCostItem = (index, field, value) => {
    const newCostBreakdown = [...costBreakdown]
    newCostBreakdown[index][field] = value
    setCostBreakdown(newCostBreakdown)
  }

  const calculateTotalCost = () => {
    return costBreakdown.reduce((sum, item) => sum + item.cost, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Bid Submitted",
      description: "Your bid has been submitted successfully.",
    })

    router.push("/dashboard/garage/bids")
  }

  // Mock bid data
  const bid = {
    id: "BID-2025-001",
    claimId: "CL-2025-001",
    vehicleInfo: {
      make: "Toyota",
      model: "RAV4",
      year: "2020",
      licensePlate: "RAC 123A",
    },
    damageDescription: "Front bumper damage and headlight broken due to collision",
    estimatedCost: 450000,
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Kigali Auto Services",
        role: "Garage",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/garage", icon: null },
        { name: "Repairs", href: "/dashboard/garage/repairs", icon: null },
        { name: "Bids", href: "/dashboard/garage/bids", icon: null },
        { name: "Schedule", href: "/dashboard/garage/schedule", icon: null },
      ]}
      actions={[]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Submit Bid</h1>
            <p className="text-muted-foreground">Submit your bid for repair services</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bid Information</CardTitle>
            <CardDescription>Enter the details of your bid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bid ID</Label>
              <Input type="text" value={bid.id} readOnly />
            </div>
            <div>
              <Label>Claim ID</Label>
              <Input type="text" value={bid.claimId} readOnly />
            </div>
            <div>
              <Label>Vehicle Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Make</Label>
                  <Input type="text" value={bid.vehicleInfo.make} readOnly />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input type="text" value={bid.vehicleInfo.model} readOnly />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input type="text" value={bid.vehicleInfo.year} readOnly />
                </div>
                <div>
                  <Label>License Plate</Label>
                  <Input type="text" value={bid.vehicleInfo.licensePlate} readOnly />
                </div>
              </div>
            </div>
            <div>
              <Label>Damage Description</Label>
              <Input type="text" value={bid.damageDescription} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Enter the cost for each item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costBreakdown.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`item-${index}`}>Item</Label>
                  <Input
                    type="text"
                    id={`item-${index}`}
                    value={item.item}
                    onChange={(e) => updateCostItem(index, "item", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`cost-${index}`}>Cost (RWF)</Label>
                  <Input
                    type="number"
                    id={`cost-${index}`}
                    value={item.cost}
                    onChange={(e) => updateCostItem(index, "cost", Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    placeholder="Optional description"
                    value={item.description}
                    onChange={(e) => updateCostItem(index, "description", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addCostItem}>
              Add Item
            </Button>
            <div className="text-xl font-bold">Total Cost: {calculateTotalCost().toLocaleString()} RWF</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Provide additional details about your bid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="completion-time">Estimated Completion Time (days)</Label>
              <Input
                type="number"
                id="completion-time"
                placeholder="Enter estimated completion time"
                value={estimatedCompletionTime}
                onChange={(e) => setEstimatedCompletionTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/garage/bids">Cancel</Link>
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Submit Bid
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
