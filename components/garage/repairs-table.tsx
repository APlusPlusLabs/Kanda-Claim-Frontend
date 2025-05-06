"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  ChevronDown,
  FileText,
  MessageSquare,
  Bell,
  User,
  LogOut,
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth-hooks"

export function RepairsTable() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("startDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock data for repairs
        const mockRepairs = [
          {
            id: "REP-2025-001",
            claimId: "CL-2025-001",
            vehicle: {
              make: "Toyota",
              model: "RAV4",
              year: "2023",
              plateNumber: "RAA 123A",
            },
            customer: {
              name: "Mugisha Nkusi",
              phone: "+250 788 123 456",
            },
            insurer: "Sanlam Alianz",
            damages: "Front bumper damaged, headlight broken",
            status: "In Progress",
            startDate: "2025-03-25",
            estimatedCompletionDate: "2025-03-30",
            actualCompletionDate: null,
            estimatedCost: 350000,
            approvedCost: 350000,
            partsOrdered: true,
            partsReceived: false,
            assignedTechnicians: ["Kamanzi Eric", "Uwase Marie"],
            notes: "Parts ordered on March 23, expected delivery on March 26",
          },
          {
            id: "REP-2025-002",
            claimId: "CL-2025-002",
            vehicle: {
              make: "Suzuki",
              model: "Swift",
              year: "2022",
              plateNumber: "RAC 789C",
            },
            customer: {
              name: "Uwimana Jean",
              phone: "+250 788 234 567",
            },
            insurer: "Sanlam Alianz",
            damages: "Side mirror broken, driver's door scratched",
            status: "Scheduled",
            startDate: "2025-04-02",
            estimatedCompletionDate: "2025-04-05",
            actualCompletionDate: null,
            estimatedCost: 280000,
            approvedCost: 280000,
            partsOrdered: true,
            partsReceived: false,
            assignedTechnicians: ["Nkusi Emmanuel"],
            notes: "Parts ordered, waiting for customer to bring in vehicle",
          },
          {
            id: "REP-2025-003",
            claimId: "CL-2025-003",
            vehicle: {
              make: "Honda",
              model: "Civic",
              year: "2024",
              plateNumber: "RAD 456D",
            },
            customer: {
              name: "Mutoni Sarah",
              phone: "+250 788 345 678",
            },
            insurer: "Sanlam Alianz",
            damages: "Rear bumper dented, tail light broken",
            status: "Completed",
            startDate: "2025-03-15",
            estimatedCompletionDate: "2025-03-20",
            actualCompletionDate: "2025-03-19",
            estimatedCost: 320000,
            approvedCost: 320000,
            partsOrdered: true,
            partsReceived: true,
            assignedTechnicians: ["Kamanzi Eric", "Mugabo Jean"],
            notes: "Repairs completed ahead of schedule. Customer notified for pickup.",
          },
          {
            id: "REP-2025-004",
            claimId: "CL-2025-005",
            vehicle: {
              make: "Nissan",
              model: "X-Trail",
              year: "2023",
              plateNumber: "RAG 789G",
            },
            customer: {
              name: "Gasana Robert",
              phone: "+250 788 567 890",
            },
            insurer: "Sanlam Alianz",
            damages: "Multiple dents on roof, hood, and trunk from hail",
            status: "Completed",
            startDate: "2025-01-04",
            estimatedCompletionDate: "2025-01-09",
            actualCompletionDate: "2025-01-09",
            estimatedCost: 520000,
            approvedCost: 520000,
            partsOrdered: false,
            partsReceived: false,
            assignedTechnicians: ["Uwase Marie", "Nkusi Emmanuel", "Mugabo Jean"],
            notes: "Extensive dent repair work completed. Vehicle ready for pickup.",
          },
          {
            id: "REP-2025-005",
            claimId: "CL-2025-007",
            vehicle: {
              make: "Toyota",
              model: "Corolla",
              year: "2023",
              plateNumber: "RAF 678F",
            },
            customer: {
              name: "Hakizimana Jean",
              phone: "+250 788 456 789",
            },
            insurer: "Radiant Insurance",
            damages: "Front and rear bumper damage, broken headlight",
            status: "Pending Approval",
            startDate: null,
            estimatedCompletionDate: null,
            actualCompletionDate: null,
            estimatedCost: 420000,
            approvedCost: null,
            partsOrdered: false,
            partsReceived: false,
            assignedTechnicians: [],
            notes: "Waiting for repair approval from insurer",
          },
        ]

        setRepairs(mockRepairs)
      } catch (error) {
        console.error("Error fetching repairs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      repair.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${repair.vehicle.make} ${repair.vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.insurer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "scheduled" && repair.status === "Scheduled") ||
      (statusFilter === "in_progress" && repair.status === "In Progress") ||
      (statusFilter === "completed" && repair.status === "Completed") ||
      (statusFilter === "pending" && repair.status === "Pending Approval")

    return matchesSearch && matchesStatus
  })

  const sortedRepairs = [...filteredRepairs].sort((a, b) => {
    let aValue, bValue

    // Determine the values to compare based on the sort field
    switch (sortField) {
      case "startDate":
        aValue = a.startDate ? new Date(a.startDate).getTime() : 0
        bValue = b.startDate ? new Date(b.startDate).getTime() : 0
        break
      default:
        aValue = a[sortField]
        bValue = b[sortField]
    }

    // Handle null or undefined values
    if (aValue == null) return -1
    if (bValue == null) return 1

    // Compare the values based on the sort direction
    if (sortDirection === "asc") {
      if (aValue < bValue) return -1
      if (aValue > bValue) return 1
      return 0
    } else {
      if (aValue < bValue) return 1
      if (aValue > bValue) return -1
      return 0
    }
  })

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search repairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2"
          />
          <Search className="h-4 w-4 text-gray-500 mr-4" />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
          <Filter className="h-4 w-4 text-gray-500 ml-4" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 ml-auto">
              Sort By <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSortField("startDate")
                setSortDirection(sortField === "startDate" && sortDirection === "asc" ? "desc" : "asc")
              }}
            >
              Start Date {sortField === "startDate" && (sortDirection === "asc" ? "▲" : "▼")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortField("id")
                setSortDirection(sortField === "id" && sortDirection === "asc" ? "desc" : "asc")
              }}
            >
              Repair ID {sortField === "id" && (sortDirection === "asc" ? "▲" : "▼")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortField("claimId")
                setSortDirection(sortField === "claimId" && sortDirection === "asc" ? "desc" : "asc")
              }}
            >
              Claim ID {sortField === "claimId" && (sortDirection === "asc" ? "▲" : "▼")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View All</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repair ID</TableHead>
              <TableHead>Claim ID</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Insurer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show loading skeletons during client-side data fetching
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={`loading-client-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
            ) : sortedRepairs.length > 0 ? (
              // Show actual data
              sortedRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>{repair.id}</TableCell>
                  <TableCell>{repair.claimId}</TableCell>
                  <TableCell>
                    {repair.vehicle.make} {repair.vehicle.model} ({repair.vehicle.plateNumber})
                  </TableCell>
                  <TableCell>{repair.customer.name}</TableCell>
                  <TableCell>{repair.insurer}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        repair.status === "Scheduled"
                          ? "secondary"
                          : repair.status === "In Progress"
                            ? "warning"
                            : repair.status === "Completed"
                              ? "success"
                              : repair.status === "Pending Approval"
                                ? "destructive"
                                : "default"
                      }
                    >
                      {repair.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{repair.startDate ? format(new Date(repair.startDate), "PPP") : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/garage/repairs/${repair.id}`)}>
                          <Eye className="h-4 w-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" /> View Claim
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" /> Add Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Bell className="h-4 w-4 mr-2" /> Send Notification
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" /> Assign Technician
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <LogOut className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Show empty state
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No repairs found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
