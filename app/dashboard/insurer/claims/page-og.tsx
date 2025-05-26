"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  FileImage,
  FileIcon as FilePdf,
  Car,
  User,
  CalendarClock,
  ArrowUpDown,
  ChevronDown,
  Info,
  AlertCircle,
  UserCog,
  Wrench,
  ClipboardCheck,
  Brain,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

// Mock data for claims with more detailed information
const mockClaims = [
  {
    id: "CL-2025-001",
    policyNumber: "POL-2024-12345",
    vehicle: {
      make: "Toyota",
      model: "RAV4",
      year: "2023",
      plateNumber: "RAA 123A",
      color: "Silver",
    },
    driver: {
      name: "Mugisha Nkusi",
      phone: "+250 788 123 456",
      licenseNumber: "DL-2024-45678",
      licenseCategory: "B",
    },
    accident: {
      date: "2025-01-15",
      time: "14:30",
      location: "Kimironko Junction, Kigali",
      description:
        "Front bumper damage due to collision with another vehicle at Kimironko junction. The other driver ran a red light.",
      policeReport: true,
      policeStation: "Kimironko Police Station",
      policeReportNumber: "PR-2025-0123",
    },
    otherVehicles: [
      {
        make: "Honda",
        model: "Civic",
        plateNumber: "RAB 456B",
        owner: "Kamanzi Eric",
        insurer: "Sanlam Alianz",
        policyNumber: "POL-2024-67890",
      },
    ],
    injuries: [
      {
        name: "Uwase Marie",
        age: 28,
        description: "Minor cuts and bruises on arms",
        severity: "Minor",
      },
    ],
    damages: [
      {
        type: "Vehicle",
        description: "Front bumper damaged, headlight broken",
        estimatedCost: 350000,
      },
      {
        type: "Property",
        description: "Street sign knocked down",
        estimatedCost: 100000,
      },
    ],
    garage: {
      name: "Kigali Auto Services",
      address: "KK 123 St, Kigali",
      phone: "+250 788 987 654",
    },
    documents: [
      { name: "Accident_Scene_1.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Accident_Scene_2.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Police_Report.pdf", type: "pdf", uploadedAt: "2025-01-16" },
      { name: "Damage_Photos_1.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Damage_Photos_2.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Driver_License.jpg", type: "image", uploadedAt: "2025-01-15" },
      { name: "Vehicle_Registration.jpg", type: "image", uploadedAt: "2025-01-15" },
    ],
    status: "Pending Review",
    pendingReason: "Waiting for initial assessment",
    pendingWith: "Claims Department",
    responsiblePerson: "Marie Uwase",
    priority: "Medium",
    submittedAt: "2025-01-15 15:45",
    lastUpdated: "2025-01-16 09:30",
    estimatedAmount: 450000,
    timeline: [
      {
        date: "2025-01-15 15:45",
        event: "Claim submitted by driver",
        status: "complete",
        actor: "Mugisha Nkusi (Driver)",
      },
      {
        date: "2025-01-16 09:30",
        event: "Claim received and assigned for review",
        status: "complete",
        actor: "System",
      },
      {
        date: "2025-01-16 10:15",
        event: "Initial review started",
        status: "in-progress",
        actor: "Marie Uwase (Claims Agent)",
      },
      { date: "2025-01-18", event: "Assessment scheduling", status: "pending", actor: "Assessment Department" },
      { date: "2025-01-20", event: "Assessment", status: "pending", actor: "Assessor" },
      { date: "2025-01-22", event: "Repair approval", status: "pending", actor: "Claims Department" },
      { date: "2025-01-25", event: "Repairs", status: "pending", actor: "Garage" },
      { date: "2025-01-30", event: "Claim settlement", status: "pending", actor: "Finance Department" },
    ],
    notes: [
      {
        date: "2025-01-16 09:35",
        author: "Marie Uwase",
        content: "Claim appears to be valid. All required documents provided. Proceeding with initial review.",
      },
    ],
  },
  {
    id: "CL-2025-002",
    policyNumber: "POL-2024-78901",
    vehicle: {
      make: "Suzuki",
      model: "Swift",
      year: "2022",
      plateNumber: "RAC 789C",
      color: "Blue",
    },
    driver: {
      name: "Uwimana Jean",
      phone: "+250 788 234 567",
      licenseNumber: "DL-2024-12345",
      licenseCategory: "B",
    },
    accident: {
      date: "2025-01-10",
      time: "08:45",
      location: "Kigali Heights Parking, Kigali",
      description:
        "Side mirror and door damage from parking incident at Kigali Heights. Another vehicle scraped against while parked.",
      policeReport: false,
    },
    otherVehicles: [],
    injuries: [],
    damages: [
      {
        type: "Vehicle",
        description: "Side mirror broken, driver's door scratched",
        estimatedCost: 280000,
      },
    ],
    garage: {
      name: "Rwanda Motors",
      address: "KN 5 Ave, Kigali",
      phone: "+250 788 456 789",
    },
    documents: [
      { name: "Damage_Photos_1.jpg", type: "image", uploadedAt: "2025-01-10" },
      { name: "Damage_Photos_2.jpg", type: "image", uploadedAt: "2025-01-10" },
      { name: "Damage_Photos_3.jpg", type: "image", uploadedAt: "2025-01-10" },
      { name: "Driver_License.jpg", type: "image", uploadedAt: "2025-01-10" },
      { name: "Vehicle_Registration.jpg", type: "image", uploadedAt: "2025-01-10" },
    ],
    status: "Assessment Scheduled",
    pendingReason: "Waiting for assessor visit",
    pendingWith: "Assessment Department",
    responsiblePerson: "Habimana Jean",
    priority: "Low",
    submittedAt: "2025-01-10 10:15",
    lastUpdated: "2025-01-12 14:20",
    estimatedAmount: 280000,
    timeline: [
      {
        date: "2025-01-10 10:15",
        event: "Claim submitted by driver",
        status: "complete",
        actor: "Uwimana Jean (Driver)",
      },
      {
        date: "2025-01-10 11:30",
        event: "Claim received and assigned for review",
        status: "complete",
        actor: "System",
      },
      {
        date: "2025-01-11 09:45",
        event: "Initial review completed",
        status: "complete",
        actor: "Eric Kamanzi (Claims Agent)",
      },
      {
        date: "2025-01-12 14:20",
        event: "Assessment scheduled for 2025-01-17",
        status: "complete",
        actor: "Assessment Department",
      },
      { date: "2025-01-17", event: "Assessment", status: "pending", actor: "Habimana Jean (Assessor)" },
      { date: "2025-01-19", event: "Repair approval", status: "pending", actor: "Claims Department" },
      { date: "2025-01-22", event: "Repairs", status: "pending", actor: "Garage" },
      { date: "2025-01-27", event: "Claim settlement", status: "pending", actor: "Finance Department" },
    ],
    notes: [
      {
        date: "2025-01-11 09:45",
        author: "Eric Kamanzi",
        content: "No police report as it was a minor parking incident. Damage appears consistent with description.",
      },
      {
        date: "2025-01-12 14:20",
        author: "Mutesi Sarah",
        content: "Assessment scheduled for January 17th at Rwanda Motors garage.",
      },
    ],
  },
  {
    id: "CL-2025-003",
    policyNumber: "POL-2024-56789",
    vehicle: {
      make: "Honda",
      model: "Civic",
      year: "2024",
      plateNumber: "RAD 456D",
      color: "White",
    },
    driver: {
      name: "Mutoni Sarah",
      phone: "+250 788 345 678",
      licenseNumber: "DL-2024-78901",
      licenseCategory: "B",
    },
    accident: {
      date: "2025-01-05",
      time: "17:20",
      location: "Nyabugogo Bus Station, Kigali",
      description:
        "Rear bumper damage from being hit while parked at Nyabugogo bus station. Driver was not present at the time of the incident.",
      policeReport: true,
      policeStation: "Nyabugogo Police Station",
      policeReportNumber: "PR-2025-0089",
    },
    otherVehicles: [
      {
        make: "Toyota",
        model: "Coaster",
        plateNumber: "RAE 567E",
        owner: "Kigali Bus Services",
        insurer: "Sanlam Alianz",
        policyNumber: "POL-2024-34567",
      },
    ],
    injuries: [],
    damages: [
      {
        type: "Vehicle",
        description: "Rear bumper dented, tail light broken",
        estimatedCost: 320000,
      },
    ],
    garage: {
      name: "Kigali Auto Center",
      address: "KG 123 St, Kigali",
      phone: "+250 788 567 890",
    },
    documents: [
      { name: "Accident_Scene.jpg", type: "image", uploadedAt: "2025-01-05" },
      { name: "Police_Report.pdf", type: "pdf", uploadedAt: "2025-01-06" },
      { name: "Damage_Photos_1.jpg", type: "image", uploadedAt: "2025-01-05" },
      { name: "Damage_Photos_2.jpg", type: "image", uploadedAt: "2025-01-05" },
      { name: "Driver_License.jpg", type: "image", uploadedAt: "2025-01-05" },
      { name: "Vehicle_Registration.jpg", type: "image", uploadedAt: "2025-01-05" },
    ],
    status: "Repair Approved",
    pendingReason: "Waiting for repairs to begin",
    pendingWith: "Garage",
    responsiblePerson: "Kigali Auto Center",
    priority: "Medium",
    submittedAt: "2025-01-05 18:45",
    lastUpdated: "2025-01-11 15:30",
    estimatedAmount: 320000,
    timeline: [
      {
        date: "2025-01-05 18:45",
        event: "Claim submitted by driver",
        status: "complete",
        actor: "Mutoni Sarah (Driver)",
      },
      {
        date: "2025-01-06 09:15",
        event: "Claim received and assigned for review",
        status: "complete",
        actor: "System",
      },
      {
        date: "2025-01-07 11:30",
        event: "Initial review completed",
        status: "complete",
        actor: "Jean Mugabo (Claims Agent)",
      },
      { date: "2025-01-08 14:00", event: "Assessment scheduled", status: "complete", actor: "Assessment Department" },
      {
        date: "2025-01-09 10:30",
        event: "Assessment completed",
        status: "complete",
        actor: "Claude Nshimiyimana (Assessor)",
      },
      { date: "2025-01-11 15:30", event: "Repair approved", status: "complete", actor: "Marie Uwase (Claims Manager)" },
      { date: "2025-01-15", event: "Repairs to begin", status: "pending", actor: "Kigali Auto Center (Garage)" },
      { date: "2025-01-20", event: "Claim settlement", status: "pending", actor: "Finance Department" },
    ],
    notes: [
      {
        date: "2025-01-07 11:30",
        author: "Jean Mugabo",
        content:
          "Police report confirms the incident. The other party (Kigali Bus Services) has accepted responsibility.",
      },
      {
        date: "2025-01-09 10:30",
        author: "Claude Nshimiyimana",
        content: "Damage assessment completed. Repair cost estimated at 320,000 RWF.",
      },
      { date: "2025-01-11 15:30", author: "Marie Uwase", content: "Repair approved. Garage can proceed with repairs." },
    ],
  },
  {
    id: "CL-2025-004",
    policyNumber: "POL-2024-23456",
    vehicle: {
      make: "Toyota",
      model: "Corolla",
      year: "2023",
      plateNumber: "RAF 678F",
      color: "Black",
    },
    driver: {
      name: "Nkusi Emmanuel",
      phone: "+250 788 456 789",
      licenseNumber: "DL-2024-56789",
      licenseCategory: "B",
    },
    accident: {
      date: "2025-01-02",
      time: "11:15",
      location: "Kigali-Musanze Highway, 20km from Kigali",
      description:
        "Windshield crack from road debris on Kigali-Musanze highway. A truck ahead kicked up a stone that hit the windshield.",
      policeReport: false,
    },
    otherVehicles: [],
    injuries: [],
    damages: [
      {
        type: "Vehicle",
        description: "Windshield cracked on driver's side",
        estimatedCost: 150000,
      },
    ],
    garage: {
      name: "Glass Auto Rwanda",
      address: "KK 456 St, Kigali",
      phone: "+250 788 678 901",
    },
    documents: [
      { name: "Damage_Photos_1.jpg", type: "image", uploadedAt: "2025-01-02" },
      { name: "Damage_Photos_2.jpg", type: "image", uploadedAt: "2025-01-02" },
      { name: "Driver_License.jpg", type: "image", uploadedAt: "2025-01-02" },
      { name: "Vehicle_Registration.jpg", type: "image", uploadedAt: "2025-01-02" },
    ],
    status: "Rejected",
    pendingReason: null,
    pendingWith: null,
    responsiblePerson: null,
    priority: "Low",
    submittedAt: "2025-01-02 12:30",
    lastUpdated: "2025-01-04 14:45",
    estimatedAmount: 0,
    timeline: [
      {
        date: "2025-01-02 12:30",
        event: "Claim submitted by driver",
        status: "complete",
        actor: "Nkusi Emmanuel (Driver)",
      },
      {
        date: "2025-01-02 14:15",
        event: "Claim received and assigned for review",
        status: "complete",
        actor: "System",
      },
      {
        date: "2025-01-03 10:30",
        event: "Initial review completed",
        status: "complete",
        actor: "Eric Kamanzi (Claims Agent)",
      },
      {
        date: "2025-01-04 14:45",
        event: "Claim rejected - Not covered under policy",
        status: "rejected",
        actor: "Marie Uwase (Claims Manager)",
      },
    ],
    notes: [
      {
        date: "2025-01-03 10:30",
        author: "Eric Kamanzi",
        content: "Policy does not cover windshield damage from road debris unless comprehensive coverage is included.",
      },
      {
        date: "2025-01-04 14:45",
        author: "Marie Uwase",
        content:
          "Claim rejected as policy POL-2024-23456 only has third-party coverage, not comprehensive. Customer has been notified.",
      },
    ],
  },
  {
    id: "CL-2025-005",
    policyNumber: "POL-2024-90123",
    vehicle: {
      make: "Nissan",
      model: "X-Trail",
      year: "2023",
      plateNumber: "RAG 789G",
      color: "Green",
    },
    driver: {
      name: "Gasana Robert",
      phone: "+250 788 567 890",
      licenseNumber: "DL-2024-34567",
      licenseCategory: "B",
    },
    accident: {
      date: "2024-12-28",
      time: "19:45",
      location: "Remera, Kigali",
      description:
        "Vehicle damaged during a hailstorm while parked outside residence in Remera. Multiple dents on roof and hood.",
      policeReport: false,
    },
    otherVehicles: [],
    injuries: [],
    damages: [
      {
        type: "Vehicle",
        description: "Multiple dents on roof, hood, and trunk from hail",
        estimatedCost: 520000,
      },
    ],
    garage: {
      name: "Premium Auto Body",
      address: "KN 78 Ave, Kigali",
      phone: "+250 788 789 012",
    },
    documents: [
      { name: "Damage_Photos_1.jpg", type: "image", uploadedAt: "2024-12-28" },
      { name: "Damage_Photos_2.jpg", type: "image", uploadedAt: "2024-12-28" },
      { name: "Damage_Photos_3.jpg", type: "image", uploadedAt: "2024-12-28" },
      { name: "Damage_Photos_4.jpg", type: "image", uploadedAt: "2024-12-28" },
      { name: "Driver_License.jpg", type: "image", uploadedAt: "2024-12-28" },
      { name: "Vehicle_Registration.jpg", type: "image", uploadedAt: "2024-12-28" },
      { name: "Weather_Report.pdf", type: "pdf", uploadedAt: "2024-12-29" },
    ],
    status: "Completed",
    pendingReason: null,
    pendingWith: null,
    responsiblePerson: null,
    priority: "Medium",
    submittedAt: "2024-12-28 20:30",
    lastUpdated: "2025-01-10 16:15",
    estimatedAmount: 520000,
    finalAmount: 520000,
    timeline: [
      {
        date: "2024-12-28 20:30",
        event: "Claim submitted by driver",
        status: "complete",
        actor: "Gasana Robert (Driver)",
      },
      {
        date: "2024-12-29 09:00",
        event: "Claim received and assigned for review",
        status: "complete",
        actor: "System",
      },
      {
        date: "2024-12-29 14:30",
        event: "Initial review completed",
        status: "complete",
        actor: "Jean Mugabo (Claims Agent)",
      },
      { date: "2024-12-30 10:15", event: "Assessment scheduled", status: "complete", actor: "Assessment Department" },
      {
        date: "2025-01-02 11:30",
        event: "Assessment completed",
        status: "complete",
        actor: "Habimana Jean (Assessor)",
      },
      { date: "2025-01-03 15:45", event: "Repair approved", status: "complete", actor: "Marie Uwase (Claims Manager)" },
      { date: "2025-01-04 09:30", event: "Repairs begun", status: "complete", actor: "Premium Auto Body (Garage)" },
      { date: "2025-01-09 14:00", event: "Repairs completed", status: "complete", actor: "Premium Auto Body (Garage)" },
      { date: "2025-01-10 16:15", event: "Claim settled and closed", status: "complete", actor: "Finance Department" },
    ],
    notes: [
      {
        date: "2024-12-29 14:30",
        author: "Jean Mugabo",
        content:
          "Weather report confirms hailstorm in Remera on the date of the incident. Damage appears consistent with hail damage.",
      },
      {
        date: "2025-01-02 11:30",
        author: "Habimana Jean",
        content:
          "Assessment completed. Extensive hail damage to roof, hood, and trunk. Repair cost estimated at 520,000 RWF.",
      },
      {
        date: "2025-01-03 15:45",
        author: "Marie Uwase",
        content: "Repair approved as damage is covered under comprehensive policy.",
      },
      {
        date: "2025-01-09 14:00",
        author: "Premium Auto Body",
        content: "Repairs completed. Vehicle ready for pickup.",
      },
      {
        date: "2025-01-10 16:15",
        author: "Finance Department",
        content: "Payment of 520,000 RWF processed to Premium Auto Body. Claim closed.",
      },
    ],
  },
  {
    id: "CL-2025-006",
    policyNumber: "POL-2024-45678",
    vehicle: {
      make: "Mazda",
      model: "CX-5",
      year: "2024",
      plateNumber: "RAH 890H",
      color: "Red",
    },
    driver: {
      name: "Kamana Alex",
      phone: "+250 788 678 901",
      licenseNumber: "DL-2024-67890",
      licenseCategory: "B",
    },
    accident: {
      date: "2025-01-08",
      time: "13:20",
      location: "Gisozi, Kigali",
      description:
        "Vehicle stolen from parking lot at Gisozi shopping center. Driver returned from shopping to find vehicle missing.",
      policeReport: true,
      policeStation: "Gisozi Police Station",
      policeReportNumber: "PR-2025-0102",
    },
    otherVehicles: [],
    injuries: [],
    damages: [
      {
        type: "Vehicle Theft",
        description: "Complete vehicle theft",
        estimatedCost: 15000000,
      },
    ],
    documents: [
      { name: "Police_Report.pdf", type: "pdf", uploadedAt: "2025-01-08" },
      { name: "Driver_License.jpg", type: "image", uploadedAt: "2025-01-08" },
      { name: "Vehicle_Registration.jpg", type: "image", uploadedAt: "2025-01-08" },
      { name: "Purchase_Invoice.pdf", type: "pdf", uploadedAt: "2025-01-08" },
    ],
    status: "Investigation",
    pendingReason: "Waiting for police investigation results",
    pendingWith: "Special Investigation Unit",
    responsiblePerson: "Nshimiyimana Claude",
    priority: "High",
    submittedAt: "2025-01-08 15:45",
    lastUpdated: "2025-01-10 11:30",
    estimatedAmount: 15000000,
    timeline: [
      {
        date: "2025-01-08 15:45",
        event: "Claim submitted by driver",
        status: "complete",
        actor: "Kamana Alex (Driver)",
      },
      {
        date: "2025-01-08 16:30",
        event: "Claim received and assigned for review",
        status: "complete",
        actor: "System",
      },
      {
        date: "2025-01-09 09:15",
        event: "Initial review completed",
        status: "complete",
        actor: "Jean Mugabo (Claims Agent)",
      },
      {
        date: "2025-01-09 11:30",
        event: "Claim escalated to Special Investigation Unit",
        status: "complete",
        actor: "Marie Uwase (Claims Manager)",
      },
      {
        date: "2025-01-10 11:30",
        event: "Investigation initiated",
        status: "in-progress",
        actor: "Nshimiyimana Claude (Special Investigator)",
      },
      { date: "2025-01-20", event: "Investigation results", status: "pending", actor: "Special Investigation Unit" },
      { date: "2025-01-25", event: "Claim decision", status: "pending", actor: "Claims Department" },
    ],
    notes: [
      {
        date: "2025-01-09 09:15",
        author: "Jean Mugabo",
        content:
          "Police report confirms vehicle theft. Due to high value, claim is being escalated to Special Investigation Unit.",
      },
      {
        date: "2025-01-09 11:30",
        author: "Marie Uwase",
        content: "Claim assigned to Special Investigation Unit for thorough verification before processing.",
      },
      {
        date: "2025-01-10 11:30",
        author: "Nshimiyimana Claude",
        content: "Investigation initiated. Will coordinate with police and verify all circumstances of the theft.",
      },
    ],
  },
]

export default function InsurerClaimsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [sortField, setSortField] = useState("submittedAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Filter claims based on search query, status filter, priority filter, and date filter
  const filteredClaims = mockClaims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.accident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        (claim.status === "Pending Review" ||
          claim.status === "Assessment Scheduled" ||
          claim.status === "Investigation")) ||
      (statusFilter === "approved" && claim.status === "Repair Approved") ||
      (statusFilter === "completed" && claim.status === "Completed") ||
      (statusFilter === "rejected" && claim.status === "Rejected")

    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "high" && claim.priority === "High") ||
      (priorityFilter === "medium" && claim.priority === "Medium") ||
      (priorityFilter === "low" && claim.priority === "Low")

    // Date filtering logic
    const claimDate = new Date(claim.submittedAt)
    const now = new Date()
    const isToday = claimDate.toDateString() === now.toDateString()
    const isThisWeek = claimDate > new Date(now.setDate(now.getDate() - 7))
    const isThisMonth = claimDate > new Date(now.setFullYear(now.getFullYear(), now.getMonth() - 1))

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && isToday) ||
      (dateFilter === "week" && isThisWeek) ||
      (dateFilter === "month" && isThisMonth)

    return matchesSearch && matchesStatus && matchesPriority && matchesDate
  })

  // Sort claims
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let aValue, bValue

    // Determine the values to compare based on the sort field
    switch (sortField) {
      case "submittedAt":
        aValue = new Date(a.submittedAt).getTime()
        bValue = new Date(b.submittedAt).getTime()
        break
      case "lastUpdated":
        aValue = new Date(a.lastUpdated).getTime()
        bValue = new Date(b.lastUpdated).getTime()
        break
      case "priority":
        const priorityOrder = { High: 3, Medium: 2, Low: 1 }
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      case "id":
        aValue = a.id
        bValue = b.id
        break
      default:
        aValue = a.id
        bValue = b.id
    }

    // Apply sort direction
    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
  })

  const pendingClaims = sortedClaims.filter(
    (claim) =>
      claim.status === "Pending Review" || claim.status === "Assessment Scheduled" || claim.status === "Investigation",
  )
  const approvedClaims = sortedClaims.filter((claim) => claim.status === "Repair Approved")
  const completedClaims = sortedClaims.filter((claim) => claim.status === "Completed")
  const rejectedClaims = sortedClaims.filter((claim) => claim.status === "Rejected")

  const openClaimDetails = (claim: any) => {
    setSelectedClaim(claim)
    setIsDetailsOpen(true)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Review":
        return <Badge className="bg-yellow-500">Pending Review</Badge>
      case "Assessment Scheduled":
        return <Badge className="bg-blue-500">Assessment Scheduled</Badge>
      case "Investigation":
        return <Badge className="bg-purple-500">Investigation</Badge>
      case "Repair Approved":
        return <Badge className="bg-green-500/80">Repair Approved</Badge>
      case "Completed":
        return <Badge className="bg-green-600">Completed</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            High
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Medium
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTimelineStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-300" />
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="h-5 w-5 text-blue-500" />
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getResponsibleIcon = (pendingWith: string) => {
    switch (pendingWith) {
      case "Claims Department":
        return <UserCog className="h-5 w-5 text-blue-500" />
      case "Assessment Department":
        return <ClipboardCheck className="h-5 w-5 text-yellow-500" />
      case "Garage":
        return <Wrench className="h-5 w-5 text-green-500" />
      case "Special Investigation Unit":
        return <AlertCircle className="h-5 w-5 text-purple-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  }

  const handleAddNote = () => {
    if (!selectedClaim || !newNote.trim()) return

    const updatedClaim = {
      ...selectedClaim,
      notes: [
        ...selectedClaim.notes,
        {
          date: format(new Date(), "yyyy-MM-dd HH:mm"),
          author: user?.first_name ? `${user.first_name} ${user.last_name}` : "Claims Agent",
          content: newNote,
        },
      ],
    }

    // In a real app, this would call an API to update the claim
    // For now, we'll just update the local state
    setSelectedClaim(updatedClaim)
    setNewNote("")
    setIsNotesDialogOpen(false)

    toast({
      title: "Note added",
      description: "Your note has been added to the claim.",
    })
  }

  const handleAssignClaim = (department: string, person: string) => {
    if (!selectedClaim) return

    const updatedClaim = {
      ...selectedClaim,
      pendingWith: department,
      responsiblePerson: person,
      lastUpdated: format(new Date(), "yyyy-MM-dd HH:mm"),
      notes: [
        ...selectedClaim.notes,
        {
          date: format(new Date(), "yyyy-MM-dd HH:mm"),
          author: user?.first_name ? `${user.first_name} ${user.last_name}` : "Claims Agent",
          content: `Claim assigned to ${person} in ${department}.`,
        },
      ],
    }

    // In a real app, this would call an API to update the claim
    // For now, we'll just update the local state
    setSelectedClaim(updatedClaim)
    setIsAssignDialogOpen(false)

    toast({
      title: "Claim assigned",
      description: `Claim has been assigned to ${person} in ${department}.`,
    })
  }

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedClaim) return

    const updatedClaim = {
      ...selectedClaim,
      status: newStatus,
      lastUpdated: format(new Date(), "yyyy-MM-dd HH:mm"),
      notes: [
        ...selectedClaim.notes,
        {
          date: format(new Date(), "yyyy-MM-dd HH:mm"),
          author: user?.first_name ? `${user.first_name} ${user.last_name}` : "Claims Agent",
          content: `Claim status updated to ${newStatus}.`,
        },
      ],
    }

    // In a real app, this would call an API to update the claim
    // For now, we'll just update the local state
    setSelectedClaim(updatedClaim)

    toast({
      title: "Status updated",
      description: `Claim status has been updated to ${newStatus}.`,
    })
  }

  const handleAIAnalysis = () => {
    router.push(`/dashboard/insurer/claims/${selectedClaim?.id}/analysis`)
  }

  return (
    <DashboardLayout
      user={{
        name: user?.first_name ? `${user.first_name} ${user.last_name}` : "Sanlam Rwanda",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Claims Management</h1>
            <p className="text-muted-foreground mt-2">View, process, and manage all insurance claims</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/insurer/analytics")}>
              View Analytics
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/insurer/documents")}>
              Document Center
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search claims by ID, vehicle, driver, or policy number..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending Claims</CardTitle>
              <div className="text-2xl font-bold text-yellow-900">{pendingClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-yellow-700">Awaiting review or assessment</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Approved Claims</CardTitle>
              <div className="text-2xl font-bold text-blue-900">{approvedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-blue-700">Repairs approved, in progress</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Completed Claims</CardTitle>
              <div className="text-2xl font-bold text-green-900">{completedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-green-700">Successfully processed claims</div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Rejected Claims</CardTitle>
              <div className="text-2xl font-bold text-red-900">{rejectedClaims.length}</div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-red-700">Claims that were not approved</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Claims ({sortedClaims.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingClaims.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedClaims.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedClaims.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedClaims.length})</TabsTrigger>
            <TabsTrigger value="multi-signature">Multi-Signature</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("id")}>
                          Claim ID
                          {sortField === "id" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("status")}>
                          Status
                          {sortField === "status" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("priority")}>
                          Priority
                          {sortField === "priority" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("submittedAt")}>
                          Submitted
                          {sortField === "submittedAt" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedClaims.length > 0 ? (
                      sortedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policyNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicle.make} {claim.vehicle.model}
                              </span>
                              <span className="text-xs">{claim.vehicle.plateNumber}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident.date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.accident.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.accident.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(claim.status)}
                              {claim.pendingReason && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center text-xs text-muted-foreground mt-1 cursor-help">
                                        <Info className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[120px]">{claim.pendingReason}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{claim.pendingReason}</p>
                                      {claim.pendingWith && (
                                        <p className="font-semibold mt-1">
                                          With: {claim.pendingWith} ({claim.responsiblePerson})
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submittedAt), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submittedAt), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsAssignDialogOpen(true)
                                    }}
                                  >
                                    Assign Claim
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingClaims.length > 0 ? (
                      pendingClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policyNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicle.make} {claim.vehicle.model}
                              </span>
                              <span className="text-xs">{claim.vehicle.plateNumber}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident.date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.accident.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.accident.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(claim.status)}
                              {claim.pendingReason && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center text-xs text-muted-foreground mt-1 cursor-help">
                                        <Info className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[120px]">{claim.pendingReason}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{claim.pendingReason}</p>
                                      {claim.pendingWith && (
                                        <p className="font-semibold mt-1">
                                          With: {claim.pendingWith} ({claim.responsiblePerson})
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submittedAt), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submittedAt), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsAssignDialogOpen(true)
                                    }}
                                  >
                                    Assign Claim
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No pending claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedClaims.length > 0 ? (
                      approvedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policyNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicle.make} {claim.vehicle.model}
                              </span>
                              <span className="text-xs">{claim.vehicle.plateNumber}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident.date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.accident.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.accident.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(claim.status)}
                              {claim.pendingReason && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center text-xs text-muted-foreground mt-1 cursor-help">
                                        <Info className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[120px]">{claim.pendingReason}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{claim.pendingReason}</p>
                                      {claim.pendingWith && (
                                        <p className="font-semibold mt-1">
                                          With: {claim.pendingWith} ({claim.responsiblePerson})
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submittedAt), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submittedAt), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsAssignDialogOpen(true)
                                    }}
                                  >
                                    Assign Claim
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No approved claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedClaims.length > 0 ? (
                      completedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policyNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicle.make} {claim.vehicle.model}
                              </span>
                              <span className="text-xs">{claim.vehicle.plateNumber}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident.date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.accident.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.accident.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">{getStatusBadge(claim.status)}</div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submittedAt), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submittedAt), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/dashboard/insurer/claims/${claim.id}/analysis`)
                                    }}
                                  >
                                    AI Analysis
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No completed claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Claim ID</TableHead>
                      <TableHead>Vehicle & Driver</TableHead>
                      <TableHead>Incident Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedClaims.length > 0 ? (
                      rejectedClaims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openClaimDetails(claim)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{claim.id}</span>
                              <span className="text-xs text-muted-foreground">{claim.policyNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {claim.vehicle.make} {claim.vehicle.model}
                              </span>
                              <span className="text-xs">{claim.vehicle.plateNumber}</span>
                              <span className="text-xs text-muted-foreground mt-1">{claim.driver.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.accident.date), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">{claim.accident.location}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {claim.accident.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">{getStatusBadge(claim.status)}</div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(claim.submittedAt), "MMM d, yyyy")}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(claim.submittedAt), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openClaimDetails(claim)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedClaim(claim)
                                      setIsNotesDialogOpen(true)
                                    }}
                                  >
                                    Add Note
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No rejected claims found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-signature">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Multi-Signature Claims</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Claims that require approval from multiple parties.
                  </p>
                  <Button onClick={() => router.push("/dashboard/insurer/multi-signature-claims")}>
                    View Multi-Signature Claims
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Claim Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedClaim && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl">Claim #{selectedClaim.id}</DialogTitle>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(selectedClaim.priority)}
                      {getStatusBadge(selectedClaim.status)}
                    </div>
                  </div>
                  <DialogDescription>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
                      <span>
                        Policy: <span className="font-medium">{selectedClaim.policyNumber}</span> • Submitted:{" "}
                        {format(new Date(selectedClaim.submittedAt), "MMM d, yyyy h:mm a")}
                      </span>
                      {selectedClaim.pendingWith && (
                        <div className="flex items-center mt-2 sm:mt-0">
                          <span className="text-muted-foreground mr-1">Pending with:</span>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getResponsibleIcon(selectedClaim.pendingWith)}
                            <span>
                              {selectedClaim.pendingWith} ({selectedClaim.responsiblePerson})
                            </span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Claim Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents ({selectedClaim.documents.length})</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="notes">Notes ({selectedClaim.notes.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <Car className="h-4 w-4 mr-2" /> Vehicle Information
                          </h3>
                          <div className="bg-muted p-3 rounded-md space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Make & Model:</div>
                              <div>
                                {selectedClaim.vehicle.make} {selectedClaim.vehicle.model} ({selectedClaim.vehicle.year}
                                )
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Plate Number:</div>
                              <div>{selectedClaim.vehicle.plateNumber}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Color:</div>
                              <div>{selectedClaim.vehicle.color}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <User className="h-4 w-4 mr-2" /> Driver Information
                          </h3>
                          <div className="bg-muted p-3 rounded-md space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Name:</div>
                              <div>{selectedClaim.driver.name}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Phone:</div>
                              <div>{selectedClaim.driver.phone}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">License Number:</div>
                              <div>{selectedClaim.driver.licenseNumber}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">License Category:</div>
                              <div>{selectedClaim.driver.licenseCategory}</div>
                            </div>
                          </div>
                        </div>

                        {selectedClaim.garage && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center">
                              <Wrench className="h-4 w-4 mr-2" /> Garage Information
                            </h3>
                            <div className="bg-muted p-3 rounded-md space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">Name:</div>
                                <div>{selectedClaim.garage.name}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">Address:</div>
                                <div>{selectedClaim.garage.address}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">Phone:</div>
                                <div>{selectedClaim.garage.phone}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <CalendarClock className="h-4 w-4 mr-2" /> Accident Information
                          </h3>
                          <div className="bg-muted p-3 rounded-md space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Date & Time:</div>
                              <div>
                                {format(new Date(selectedClaim.accident.date), "MMM d, yyyy")} at{" "}
                                {selectedClaim.accident.time}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Location:</div>
                              <div>{selectedClaim.accident.location}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Police Report:</div>
                              <div>
                                {selectedClaim.accident.policeReport ? (
                                  <span className="text-green-600">Yes</span>
                                ) : (
                                  <span className="text-red-600">No</span>
                                )}
                              </div>
                            </div>
                            {selectedClaim.accident.policeReport && (
                              <>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-muted-foreground">Police Station:</div>
                                  <div>{selectedClaim.accident.policeStation}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-muted-foreground">Report Number:</div>
                                  <div>{selectedClaim.accident.policeReportNumber}</div>
                                </div>
                              </>
                            )}
                            <div className="text-sm mt-2">
                              <div className="text-muted-foreground mb-1">Description:</div>
                              <div className="text-sm">{selectedClaim.accident.description}</div>
                            </div>
                          </div>
                        </div>

                        {selectedClaim.otherVehicles && selectedClaim.otherVehicles.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center">
                              <Car className="h-4 w-4 mr-2" /> Other Vehicles Involved
                            </h3>
                            <div className="bg-muted p-3 rounded-md space-y-3">
                              {selectedClaim.otherVehicles.map((vehicle: any, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Make & Model:</div>
                                    <div>
                                      {vehicle.make} {vehicle.model}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Plate Number:</div>
                                    <div>{vehicle.plateNumber}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Owner:</div>
                                    <div>{vehicle.owner}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Insurer:</div>
                                    <div>
                                      {vehicle.insurer} ({vehicle.policyNumber})
                                    </div>
                                  </div>
                                  {index < selectedClaim.otherVehicles.length - 1 && <Separator className="my-2" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedClaim.injuries && selectedClaim.injuries.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" /> Injuries
                            </h3>
                            <div className="bg-muted p-3 rounded-md space-y-3">
                              {selectedClaim.injuries.map((injury: any, index: number) => (
                                <div key={index} className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Person:</div>
                                    <div>
                                      {injury.name} ({injury.age} years)
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Severity:</div>
                                    <div>{injury.severity}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Description:</div>
                                    <div>{injury.description}</div>
                                  </div>
                                  {index < selectedClaim.injuries.length - 1 && <Separator className="my-2" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" /> Damages & Estimated Costs
                      </h3>
                      <div className="bg-muted p-3 rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Estimated Cost (RWF)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedClaim.damages.map((damage: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{damage.type}</TableCell>
                                <TableCell>{damage.description}</TableCell>
                                <TableCell className="text-right">{damage.estimatedCost.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} className="font-semibold text-right">
                                Total Estimated Cost:
                              </TableCell>
                              <TableCell className="font-semibold text-right">
                                {selectedClaim.damages
                                  .reduce((sum: number, damage: any) => sum + damage.estimatedCost, 0)
                                  .toLocaleString()}{" "}
                                RWF
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedClaim.documents.map((doc: any, index: number) => (
                          <Card key={index} className="overflow-hidden">
                            <CardContent className="p-0">
                              {doc.type === "image" ? (
                                <div
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setSelectedImage(
                                      `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(doc.name)}`,
                                    )
                                  }
                                >
                                  <AspectRatio ratio={4 / 3} className="bg-muted">
                                    <img
                                      src={`/placeholder.svg?height=300&width=400&text=${encodeURIComponent(doc.name)}`}
                                      alt={doc.name}
                                      className="object-cover w-full h-full"
                                    />
                                  </AspectRatio>
                                </div>
                              ) : (
                                <div className="h-[200px] flex items-center justify-center bg-muted">
                                  <FilePdf className="h-16 w-16 text-red-500" />
                                </div>
                              )}
                              <div className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {getDocumentIcon(doc.type)}
                                    <span className="ml-2 text-sm font-medium truncate max-w-[150px]">{doc.name}</span>
                                  </div>
                                  <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Uploaded: {doc.uploadedAt}</div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline">
                    <div className="space-y-4">
                      {selectedClaim.timeline.map((item: any, index: number) => (
                        <div key={index} className="flex">
                          <div className="mr-3">{getTimelineStatusIcon(item.status)}</div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-medium">{item.event}</p>
                              <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{item.actor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="space-y-4">
                      {selectedClaim.notes.length > 0 ? (
                        selectedClaim.notes.map((note: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <div className="font-medium">{note.author}</div>
                                <div className="text-xs text-muted-foreground">{note.date}</div>
                              </div>
                              <p className="text-sm">{note.content}</p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No notes have been added to this claim yet.</p>
                        </div>
                      )}
                      <Button onClick={() => setIsNotesDialogOpen(true)} className="w-full">
                        Add Note
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start flex-1">
                    <Button variant="outline" onClick={() => setIsAssignDialogOpen(true)}>
                      Assign
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Update Status <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Pending Review")}>
                          Pending Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Assessment Scheduled")}>
                          Assessment Scheduled
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Investigation")}>
                          Investigation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Repair Approved")}>
                          Repair Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Completed")}>Completed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("Rejected")}>Rejected</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={handleAIAnalysis}>
                      <Brain className="mr-2 h-4 w-4" /> AI Analysis
                    </Button>
                  </div>
                  <Button variant="default" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Claim</DialogTitle>
              <DialogDescription>Assign this claim to a department and responsible person.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select defaultValue="Claims Department">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Claims Department">Claims Department</SelectItem>
                    <SelectItem value="Assessment Department">Assessment Department</SelectItem>
                    <SelectItem value="Special Investigation Unit">Special Investigation Unit</SelectItem>
                    <SelectItem value="Finance Department">Finance Department</SelectItem>
                    <SelectItem value="Garage">Garage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="person">Responsible Person</Label>
                <Select defaultValue="Marie Uwase">
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marie Uwase">Marie Uwase</SelectItem>
                    <SelectItem value="Jean Mugabo">Jean Mugabo</SelectItem>
                    <SelectItem value="Eric Kamanzi">Eric Kamanzi</SelectItem>
                    <SelectItem value="Habimana Jean">Habimana Jean</SelectItem>
                    <SelectItem value="Nshimiyimana Claude">Nshimiyimana Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleAssignClaim("Claims Department", "Marie Uwase")}>Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>Add a note to this claim. Notes are visible to all staff members.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Enter your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
            {selectedImage && (
              <div className="relative">
                <img src={selectedImage || "/placeholder.svg"} alt="Document preview" className="w-full h-auto" />
                <Button
                  className="absolute top-2 right-2"
                  variant="secondary"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
