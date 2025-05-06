"use client"

import { BreadcrumbPage } from "@/components/ui/breadcrumb"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building2,
  Search,
  FileText,
  Upload,
  FolderOpen,
  File,
  FileIcon as FilePdf,
  FileImage,
  FileSpreadsheet,
  FileTextIcon,
  Download,
  Trash2,
  Eye,
  SlidersHorizontal,
  FolderIcon,
  MessageSquare,
  Bell,
  Clock,
  User,
  Plus,
  Edit,
  Save,
  X,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types
type DocumentCategory =
  | "Police Report"
  | "Scene Photos"
  | "Accident Photos"
  | "Driver's Identification"
  | "Related Documents"
  | "Invoices"
  | "Purchase Orders"
  | "Repair Quotations"

type DocumentType = "pdf" | "image" | "spreadsheet" | "text" | "other"

type Comment = {
  id: string
  text: string
  user: {
    id: string
    name: string
    avatar: string
  }
  timestamp: string
}

type Document = {
  id: string
  name: string
  type: DocumentType
  category: DocumentCategory
  claimId: string
  size: string
  uploadedBy: {
    id: string
    name: string
    avatar: string
  }
  uploadedAt: string
  lastModifiedBy?: {
    id: string
    name: string
    avatar: string
  }
  lastModifiedAt?: string
  tags: string[]
  comments: Comment[]
  annotations?: string
  url: string
}

type Claim = {
  id: string
  policyHolder: string
  vehicle: string
  date: string
  status: string
}

// Mock data with Rwandan names
const mockClaims: Claim[] = [
  {
    id: "CL-2024-001",
    policyHolder: "Hakizimana Jean",
    vehicle: "Toyota Corolla",
    date: "2024-01-15",
    status: "In Progress",
  },
  {
    id: "CL-2024-002",
    policyHolder: "Mukamana Claire",
    vehicle: "Honda Civic",
    date: "2024-01-20",
    status: "Completed",
  },
  {
    id: "CL-2024-003",
    policyHolder: "Bizimana Robert",
    vehicle: "Nissan Altima",
    date: "2024-02-05",
    status: "In Progress",
  },
  { id: "CL-2024-004", policyHolder: "Umutoni Emily", vehicle: "Ford Focus", date: "2024-02-10", status: "Pending" },
  {
    id: "CL-2024-005",
    policyHolder: "Ndayishimiye Michael",
    vehicle: "Hyundai Elantra",
    date: "2024-02-15",
    status: "In Progress",
  },
]

const documentCategories: DocumentCategory[] = [
  "Police Report",
  "Scene Photos",
  "Accident Photos",
  "Driver's Identification",
  "Related Documents",
  "Invoices",
  "Purchase Orders",
  "Repair Quotations",
]

// Rwandan users for the system
const rwandanUsers = {
  "user-1": {
    id: "user-1",
    name: "Mugabo Jean",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "user-2": {
    id: "user-2",
    name: "Uwase Marie",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "user-3": {
    id: "user-3",
    name: "Kigali Auto Services",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "user-4": {
    id: "user-4",
    name: "Habimana Eric",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "user-5": {
    id: "user-5",
    name: "Mukamana Claire",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "user-6": {
    id: "user-6",
    name: "Niyonzima Pascal",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "user-7": {
    id: "user-7",
    name: "Uwineza Diane",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  "user-8": {
    id: "user-8",
    name: "Nsengimana Claude",
    avatar: "/placeholder.svg?height=40&width=40",
  },
}

const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Police Report.pdf",
    type: "pdf",
    category: "Police Report",
    claimId: "CL-2024-001",
    size: "2.4 MB",
    uploadedBy: rwandanUsers["user-1"],
    uploadedAt: "2024-01-16 09:30",
    tags: ["report", "official"],
    comments: [
      {
        id: "comment-1",
        text: "This report confirms the accident details as described by the claimant.",
        user: rwandanUsers["user-2"],
        timestamp: "2024-01-17 10:15",
      },
    ],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-2",
    name: "Front Damage.jpg",
    type: "image",
    category: "Accident Photos",
    claimId: "CL-2024-001",
    size: "3.7 MB",
    uploadedBy: rwandanUsers["user-1"],
    uploadedAt: "2024-01-16 09:35",
    lastModifiedBy: rwandanUsers["user-1"],
    lastModifiedAt: "2024-01-16 10:20",
    tags: ["photo", "damage", "evidence"],
    comments: [],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-3",
    name: "Driver License.jpg",
    type: "image",
    category: "Driver's Identification",
    claimId: "CL-2024-001",
    size: "1.2 MB",
    uploadedBy: rwandanUsers["user-1"],
    uploadedAt: "2024-01-16 09:40",
    tags: ["id", "verification"],
    comments: [],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-4",
    name: "Repair Quote - Kigali Auto.pdf",
    type: "pdf",
    category: "Repair Quotations",
    claimId: "CL-2024-001",
    size: "1.8 MB",
    uploadedBy: rwandanUsers["user-3"],
    uploadedAt: "2024-01-18 14:20",
    tags: ["quote", "repair"],
    comments: [
      {
        id: "comment-2",
        text: "This quote seems reasonable for the damage described.",
        user: rwandanUsers["user-4"],
        timestamp: "2024-01-19 09:30",
      },
    ],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-5",
    name: "Accident Scene.jpg",
    type: "image",
    category: "Scene Photos",
    claimId: "CL-2024-001",
    size: "4.5 MB",
    uploadedBy: rwandanUsers["user-1"],
    uploadedAt: "2024-01-16 09:32",
    tags: ["scene", "evidence"],
    comments: [],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-6",
    name: "Invoice - Parts.pdf",
    type: "pdf",
    category: "Invoices",
    claimId: "CL-2024-001",
    size: "0.9 MB",
    uploadedBy: rwandanUsers["user-3"],
    uploadedAt: "2024-01-25 16:45",
    tags: ["invoice", "parts"],
    comments: [],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-7",
    name: "Purchase Order - Bumper.pdf",
    type: "pdf",
    category: "Purchase Orders",
    claimId: "CL-2024-001",
    size: "0.7 MB",
    uploadedBy: rwandanUsers["user-3"],
    uploadedAt: "2024-01-20 11:30",
    tags: ["order", "parts"],
    comments: [],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-8",
    name: "Insurance Policy.pdf",
    type: "pdf",
    category: "Related Documents",
    claimId: "CL-2024-001",
    size: "3.2 MB",
    uploadedBy: rwandanUsers["user-2"],
    uploadedAt: "2024-01-16 10:15",
    tags: ["policy", "contract"],
    comments: [],
    url: "/placeholder.svg?height=800&width=600",
  },
  // Documents for CL-2024-002
  {
    id: "doc-9",
    name: "Police Report.pdf",
    type: "pdf",
    category: "Police Report",
    claimId: "CL-2024-002",
    size: "2.1 MB",
    uploadedBy: rwandanUsers["user-5"],
    uploadedAt: "2024-01-21 08:45",
    tags: ["report", "official"],
    comments: [
      {
        id: "comment-3",
        text: "The police report is complete and verified.",
        user: rwandanUsers["user-6"],
        timestamp: "2024-01-22 11:20",
      },
    ],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-10",
    name: "Side Damage.jpg",
    type: "image",
    category: "Accident Photos",
    claimId: "CL-2024-002",
    size: "2.9 MB",
    uploadedBy: rwandanUsers["user-5"],
    uploadedAt: "2024-01-21 08:50",
    tags: ["photo", "damage", "evidence"],
    comments: [
      {
        id: "comment-4",
        text: "The damage appears consistent with the accident description.",
        user: rwandanUsers["user-7"],
        timestamp: "2024-01-22 14:35",
      },
    ],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-11",
    name: "Driver ID - Mukamana.jpg",
    type: "image",
    category: "Driver's Identification",
    claimId: "CL-2024-002",
    size: "1.5 MB",
    uploadedBy: rwandanUsers["user-5"],
    uploadedAt: "2024-01-21 09:05",
    tags: ["id", "verification"],
    comments: [],
    url: "/placeholder.svg?height=800&width=600",
  },
  {
    id: "doc-12",
    name: "Repair Estimate - Nyamirambo Garage.pdf",
    type: "pdf",
    category: "Repair Quotations",
    claimId: "CL-2024-002",
    size: "2.2 MB",
    uploadedBy: rwandanUsers["user-8"],
    uploadedAt: "2024-01-23 10:40",
    tags: ["quote", "repair", "estimate"],
    comments: [
      {
        id: "comment-5",
        text: "This estimate includes all necessary parts and labor.",
        user: rwandanUsers["user-8"],
        timestamp: "2024-01-23 10:45",
      },
    ],
    url: "/placeholder.svg?height=800&width=600",
  },
]

// Helper functions
const getDocumentIcon = (type: DocumentType) => {
  switch (type) {
    case "pdf":
      return <FilePdf className="h-6 w-6 text-red-500" />
    case "image":
      return <FileImage className="h-6 w-6 text-blue-500" />
    case "spreadsheet":
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />
    case "text":
      return <FileTextIcon className="h-6 w-6 text-yellow-500" />
    default:
      return <File className="h-6 w-6 text-gray-500" />
  }
}

const getCategoryIcon = (category: DocumentCategory) => {
  switch (category) {
    case "Police Report":
      return <FileTextIcon className="h-5 w-5 text-blue-600" />
    case "Scene Photos":
      return <FileImage className="h-5 w-5 text-green-600" />
    case "Accident Photos":
      return <FileImage className="h-5 w-5 text-orange-600" />
    case "Driver's Identification":
      return <User className="h-5 w-5 text-purple-600" />
    case "Related Documents":
      return <FileText className="h-5 w-5 text-gray-600" />
    case "Invoices":
      return <FileText className="h-5 w-5 text-red-600" />
    case "Purchase Orders":
      return <FileText className="h-5 w-5 text-yellow-600" />
    case "Repair Quotations":
      return <FileText className="h-5 w-5 text-cyan-600" />
    default:
      return <File className="h-5 w-5 text-gray-600" />
  }
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  // State
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [claims, setClaims] = useState<Claim[]>(mockClaims)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false)
  const [isAddCommentOpen, setIsAddCommentOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false)
  const [annotationText, setAnnotationText] = useState("")
  const [notificationCount, setNotificationCount] = useState(3)

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: documentCategories[0],
    claimId: "",
    tags: "",
    description: "",
  })

  // Effect to reset selected category when claim changes
  useEffect(() => {
    setSelectedCategory(null)
    setSelectedDocuments([])
  }, [selectedClaimId])

  // Filtered documents based on current selections
  const filteredDocuments = documents.filter((doc) => {
    // Filter by claim
    if (selectedClaimId && doc.claimId !== selectedClaimId) return false

    // Filter by category
    if (selectedCategory && doc.category !== selectedCategory) return false

    // Filter by search query
    if (
      searchQuery &&
      !doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false
    }

    return true
  })

  // Get unique claims that have documents
  const claimsWithDocuments = Array.from(new Set(documents.map((doc) => doc.claimId)))

  // Get documents for the current claim
  const documentsForCurrentClaim = documents.filter((doc) => doc.claimId === selectedClaimId)

  // Get categories that have documents for the current claim
  const categoriesForCurrentClaim = Array.from(new Set(documentsForCurrentClaim.map((doc) => doc.category)))

  // Handle document selection
  const handleSelectDocument = (id: string) => {
    setSelectedDocuments((prev) => (prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]))
  }

  // Handle select all documents
  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id))
    }
  }

  // Handle document deletion
  const handleDeleteSelected = () => {
    setDocuments((prev) => prev.filter((doc) => !selectedDocuments.includes(doc.id)))
    toast({
      title: `${selectedDocuments.length} document(s) deleted`,
      description: "The selected documents have been deleted successfully.",
    })
    setSelectedDocuments([])
  }

  // Handle document upload
  const handleUploadDocument = () => {
    if (!uploadForm.name || !uploadForm.category || !uploadForm.claimId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newDocument: Document = {
      id: `doc-${documents.length + 1}`,
      name: uploadForm.name,
      type: uploadForm.name.endsWith(".pdf")
        ? "pdf"
        : uploadForm.name.endsWith(".jpg") || uploadForm.name.endsWith(".png")
          ? "image"
          : uploadForm.name.endsWith(".xlsx") || uploadForm.name.endsWith(".csv")
            ? "spreadsheet"
            : uploadForm.name.endsWith(".txt") || uploadForm.name.endsWith(".doc")
              ? "text"
              : "other",
      category: uploadForm.category,
      claimId: uploadForm.claimId,
      size: "1.2 MB", // Mock size
      uploadedBy: {
        id: user?.id || "user-1",
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Mugabo Jean",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      uploadedAt: new Date().toLocaleString(),
      tags: uploadForm.tags.split(",").map((tag) => tag.trim()),
      comments: [],
      url: "/placeholder.svg?height=800&width=600", // Mock URL
    }

    setDocuments((prev) => [...prev, newDocument])

    // Reset form
    setUploadForm({
      name: "",
      category: documentCategories[0],
      claimId: "",
      tags: "",
      description: "",
    })

    setIsUploadDialogOpen(false)

    // Show notification to relevant parties
    toast({
      title: "Document uploaded successfully",
      description: `${newDocument.name} has been added to ${newDocument.claimId}.`,
    })

    // If we're currently viewing the claim this document belongs to, select it
    if (selectedClaimId === newDocument.claimId) {
      setSelectedCategory(newDocument.category)
    } else {
      setSelectedClaimId(newDocument.claimId)
      setSelectedCategory(newDocument.category)
    }
  }

  // Handle adding a comment
  const handleAddComment = () => {
    if (!selectedDocument || !newComment.trim()) return

    const updatedDocuments = documents.map((doc) => {
      if (doc.id === selectedDocument.id) {
        return {
          ...doc,
          comments: [
            ...doc.comments,
            {
              id: `comment-${doc.comments.length + 1}`,
              text: newComment,
              user: {
                id: user?.id || "user-1",
                name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Mugabo Jean",
                avatar: "/placeholder.svg?height=40&width=40",
              },
              timestamp: new Date().toLocaleString(),
            },
          ],
        }
      }
      return doc
    })

    setDocuments(updatedDocuments)
    setNewComment("")
    setIsAddCommentOpen(false)

    // Update the selected document
    const updatedDoc = updatedDocuments.find((doc) => doc.id === selectedDocument.id)
    if (updatedDoc) setSelectedDocument(updatedDoc)

    // Show notification
    toast({
      title: "Comment added",
      description: "Your comment has been added to the document.",
    })

    // Increment notification count to simulate notification to other users
    setNotificationCount((prev) => prev + 1)
  }

  // Handle saving annotation
  const handleSaveAnnotation = () => {
    if (!selectedDocument || !annotationText.trim()) return

    const updatedDocuments = documents.map((doc) => {
      if (doc.id === selectedDocument.id) {
        return {
          ...doc,
          annotations: annotationText,
          lastModifiedBy: {
            id: user?.id || "user-1",
            name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Mugabo Jean",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          lastModifiedAt: new Date().toLocaleString(),
        }
      }
      return doc
    })

    setDocuments(updatedDocuments)

    // Update the selected document
    const updatedDoc = updatedDocuments.find((doc) => doc.id === selectedDocument.id)
    if (updatedDoc) setSelectedDocument(updatedDoc)

    setIsAddingAnnotation(false)

    // Show notification
    toast({
      title: "Annotation saved",
      description: "Your annotation has been saved to the document.",
    })

    // Increment notification count to simulate notification to other users
    setNotificationCount((prev) => prev + 1)
  }

  // Handle view document
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setAnnotationText(document.annotations || "")
    setIsViewDocumentOpen(true)
  }

  // Breadcrumb path based on selections
  const getBreadcrumbPath = () => {
    const path = []

    path.push({ name: "All Claims", id: null })

    if (selectedClaimId) {
      const claim = claims.find((c) => c.id === selectedClaimId)
      if (claim) {
        path.push({ name: claim.id, id: claim.id })
      }

      if (selectedCategory) {
        path.push({ name: selectedCategory, id: selectedCategory })
      }
    }

    return path
  }

  return (
    <DashboardLayout
      user={{
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "Sanlam Rwanda",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Documents", href: "/dashboard/insurer/documents", icon: <FileText className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Management System</h1>
            <p className="text-muted-foreground mt-2">Organize and manage claim-related documents</p>
          </div>

          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Document notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to the system and categorize it appropriately.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="document">Document</Label>
                    <Input id="document" type="file" />
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="documentName">Document Name</Label>
                    <Input
                      id="documentName"
                      placeholder="Enter document name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={uploadForm.category}
                      onValueChange={(value) => setUploadForm({ ...uploadForm, category: value as DocumentCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center">
                              {getCategoryIcon(category)}
                              <span className="ml-2">{category}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="claimId">Claim Number</Label>
                    <Select
                      value={uploadForm.claimId}
                      onValueChange={(value) => setUploadForm({ ...uploadForm, claimId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select claim" />
                      </SelectTrigger>
                      <SelectContent>
                        {claims.map((claim) => (
                          <SelectItem key={claim.id} value={claim.id}>
                            {claim.id} - {claim.policyHolder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., report, accident, evidence"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    />
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter a brief description of the document"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadDocument}>Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            {getBreadcrumbPath().map((item, index) => {
              const isLast = index === getBreadcrumbPath().length - 1

              return isLast ? (
                <BreadcrumbItem key={index}>
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink
                    onClick={() => {
                      if (index === 0) {
                        setSelectedClaimId(null)
                        setSelectedCategory(null)
                      } else if (index === 1) {
                        setSelectedCategory(null)
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {item.name}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documents by name or tag..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar - Claims and Categories */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4">Claims</h3>
                <div className="space-y-2">
                  <div
                    className={`flex items-center p-2 rounded-md cursor-pointer ${selectedClaimId === null ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedClaimId(null)}
                  >
                    <FolderOpen className="h-5 w-5 mr-2" />
                    <span>All Claims</span>
                    <Badge className="ml-auto">{documents.length}</Badge>
                  </div>

                  {claims.map((claim) => {
                    const docCount = documents.filter((doc) => doc.claimId === claim.id).length
                    if (docCount === 0) return null

                    return (
                      <div
                        key={claim.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer ${selectedClaimId === claim.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                        onClick={() => setSelectedClaimId(claim.id)}
                      >
                        <FolderIcon className="h-5 w-5 mr-2" />
                        <span>{claim.id}</span>
                        <Badge className="ml-auto">{docCount}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {selectedClaimId && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categoriesForCurrentClaim.map((category) => {
                      const docCount = documents.filter(
                        (doc) => doc.claimId === selectedClaimId && doc.category === category,
                      ).length

                      return (
                        <div
                          key={category}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${selectedCategory === category ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {getCategoryIcon(category)}
                          <span className="ml-2">{category}</span>
                          <Badge className="ml-auto">{docCount}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main content - Document list */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-0">
                {selectedDocuments.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-muted border-b">
                    <div>
                      <span className="font-medium">{selectedDocuments.length}</span> document(s) selected
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                )}

                {filteredDocuments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={
                              filteredDocuments.length > 0 && selectedDocuments.length === filteredDocuments.length
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all documents"
                          />
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Uploaded At</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDocuments.includes(doc.id)}
                              onCheckedChange={() => handleSelectDocument(doc.id)}
                              aria-label={`Select ${doc.name}`}
                            />
                          </TableCell>
                          <TableCell>{getDocumentIcon(doc.type)}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="truncate max-w-[200px]">{doc.name}</span>
                              <div className="flex gap-1 mt-1">
                                {doc.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{doc.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={doc.uploadedBy.avatar} alt={doc.uploadedBy.name} />
                                <AvatarFallback>{doc.uploadedBy.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{doc.uploadedBy.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-sm">{doc.uploadedAt}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {doc.lastModifiedAt ? (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{doc.lastModifiedAt}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedDocument(doc)
                                  setIsAddCommentOpen(true)
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
                                  toast({
                                    title: "Document deleted",
                                    description: `${doc.name} has been deleted.`,
                                  })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      {selectedClaimId
                        ? selectedCategory
                          ? `No ${selectedCategory} documents found for claim ${selectedClaimId}.`
                          : `No documents found for claim ${selectedClaimId}.`
                        : "Select a claim to view its documents or upload a new document."}
                    </p>
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Document Viewer Dialog */}
      <Dialog open={isViewDocumentOpen} onOpenChange={setIsViewDocumentOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedDocument && getDocumentIcon(selectedDocument.type)}
              <span className="ml-2">{selectedDocument?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
            {/* Document preview */}
            <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
              {selectedDocument &&
                (selectedDocument.type === "image" ? (
                  <img
                    src={selectedDocument.url || "/placeholder.svg"}
                    alt={selectedDocument.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center p-4">
                      <FilePdf className="h-16 w-16 mx-auto text-red-500 mb-4" />
                      <p>Preview not available</p>
                      <Button variant="outline" className="mt-4">
                        <Download className="mr-2 h-4 w-4" /> Download to View
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Document details and comments */}
            <div className="w-full md:w-80 flex flex-col overflow-hidden">
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments
                    {selectedDocument && selectedDocument.comments.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedDocument.comments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="annotations">Annotations</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 overflow-auto">
                  {selectedDocument && (
                    <div className="space-y-4 p-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                        <p className="flex items-center mt-1">
                          {getCategoryIcon(selectedDocument.category)}
                          <span className="ml-2">{selectedDocument.category}</span>
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Claim</h4>
                        <p className="mt-1">{selectedDocument.claimId}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                        <p className="mt-1">{selectedDocument.size}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Uploaded By</h4>
                        <div className="flex items-center mt-1">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={selectedDocument.uploadedBy.avatar}
                              alt={selectedDocument.uploadedBy.name}
                            />
                            <AvatarFallback>{selectedDocument.uploadedBy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{selectedDocument.uploadedBy.name}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Uploaded At</h4>
                        <p className="mt-1">{selectedDocument.uploadedAt}</p>
                      </div>

                      {selectedDocument.lastModifiedAt && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Last Modified</h4>
                          <div className="flex items-center mt-1">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={selectedDocument.lastModifiedBy?.avatar}
                                alt={selectedDocument.lastModifiedBy?.name}
                              />
                              <AvatarFallback>{selectedDocument.lastModifiedBy?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>{selectedDocument.lastModifiedBy?.name}</span>
                              <span className="text-xs text-muted-foreground">{selectedDocument.lastModifiedAt}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDocument.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="flex-1 flex flex-col">
                  {selectedDocument && (
                    <>
                      <ScrollArea className="flex-1">
                        <div className="space-y-4 p-2">
                          {selectedDocument.comments.length > 0 ? (
                            selectedDocument.comments.map((comment) => (
                              <div key={comment.id} className="bg-muted rounded-lg p-3">
                                <div className="flex items-center mb-2">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{comment.user.name}</span>
                                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                  </div>
                                </div>
                                <p className="text-sm">{comment.text}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No comments yet</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      <div className="p-2 border-t mt-auto">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleAddComment()
                              }
                            }}
                          />
                          <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="annotations" className="flex-1 flex flex-col">
                  {selectedDocument && (
                    <>
                      {isAddingAnnotation ? (
                        <div className="flex-1 flex flex-col p-2">
                          <Textarea
                            placeholder="Add annotations or notes about this document..."
                            className="flex-1 min-h-[200px]"
                            value={annotationText}
                            onChange={(e) => setAnnotationText(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAnnotationText(selectedDocument.annotations || "")
                                setIsAddingAnnotation(false)
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveAnnotation} disabled={!annotationText.trim()}>
                              <Save className="h-4 w-4 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 p-2">
                          {selectedDocument.annotations ? (
                            <>
                              <div className="bg-muted rounded-lg p-3 mb-4">
                                <p className="whitespace-pre-wrap">{selectedDocument.annotations}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setIsAddingAnnotation(true)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit Annotations
                              </Button>
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground mb-4">No annotations yet</p>
                              <Button variant="outline" size="sm" onClick={() => setIsAddingAnnotation(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Annotations
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={isAddCommentOpen} onOpenChange={setIsAddCommentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>Add a comment to {selectedDocument?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCommentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
