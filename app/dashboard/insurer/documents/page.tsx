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
  Clock,
  User,
  Plus,
  Edit,
  Save,
  X,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
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
import { format } from "date-fns"
import { DocumentCategory, Document, Claim } from "@/lib/types/claims"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";


const documentCategories: DocumentCategory[] = [
  { id: "1", name: "Police Report" },
  { id: "2", name: "Scene Photos" },
  { id: "3", name: "Accident Photos" },
  { id: "4", name: "Driver's Identification" },
  { id: "5", name: "Related Documents" },
  { id: "6", name: "Invoices" },
  { id: "7", name: "Purchase Orders" },
  { id: "8", name: "Repair Quotations" },
]

// Helper functions
const getDocumentIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return <FilePdf className="h-6 w-6 text-red-500" />
  } else if (mimeType.includes('image')) {
    return <FileImage className="h-6 w-6 text-blue-500" />
  } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="h-6 w-6 text-green-500" />
  } else if (mimeType.includes('text') || mimeType.includes('document')) {
    return <FileTextIcon className="h-6 w-6 text-yellow-500" />
  } else {
    return <File className="h-6 w-6 text-gray-500" />
  }
}

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function DocumentsPage() {
  const { user, apiRequest } = useAuth()
  const { toast } = useToast()

  // State
  const [documents, setDocuments] = useState<Document[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>(documentCategories)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    file_name: "",
    category_id: "",
    claim_id: "",
    file: null as File | null,
  })

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch documents
        const documentsData = await apiRequest(`${API_URL}documents/by-tenant/${user.tenant_id}`, "GET")
        setDocuments(documentsData)

        // Fetch claims (if needed for dropdown)
        const claimsData = await apiRequest(`${API_URL}claims/${user.tenant_id}/get-by-insurer-mininfo`, "GET")
        setClaims(claimsData.data)

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch data.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user?.tenant_id) {
      fetchData()
    }
  }, [apiRequest, toast, user?.tenant_id])

  // Reset selections when claim changes
  useEffect(() => {
    setSelectedCategoryId(null)
    setSelectedDocuments([])
  }, [selectedClaimId])

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    // Filter by claim
    if (selectedClaimId && doc.claim_id !== selectedClaimId) return false

    // Filter by category
    if (selectedCategoryId && doc.category_id !== selectedCategoryId) return false

    // Filter by search query
    if (searchQuery && !doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  // Get unique claims that have documents
  const claimsWithDocuments = Array.from(new Set(documents.map((doc) => doc.claim_id)))
    .map(claimId => claims.find(claim => claim.id === claimId))
    .filter(Boolean) as Claim[]

  // Get documents for the current claim
  const documentsForCurrentClaim = documents.filter((doc) => doc.claim_id === selectedClaimId)

  // Get categories that have documents for the current claim
  const categoriesForCurrentClaim = Array.from(new Set(documentsForCurrentClaim.map((doc) => doc.category_id)))
    .map(categoryId => categories.find(cat => cat.id === categoryId))
    .filter(Boolean) as DocumentCategory[]

  // Handle document selection
  const handleSelectDocument = (id: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    )
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
  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedDocuments.map(docId =>
          apiRequest(`${API_URL}documents/${docId}`, "DELETE")
        )
      )

      setDocuments((prev) => prev.filter((doc) => !selectedDocuments.includes(doc.id)))
      setSelectedDocuments([])

      toast({
        title: `${selectedDocuments.length} document(s) deleted`,
        description: "The selected documents have been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete documents.",
      })
    }
  }

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!uploadForm.file || !uploadForm.category_id || !uploadForm.claim_id) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('type', uploadForm.category_id)
   //   formData.append('category_id', uploadForm.category_id)
      formData.append('claim_id', uploadForm.claim_id)
      formData.append('tenant_id', user.tenant_id)
      formData.append('user_id', user.id)

      const response = await apiRequest(`${API_URL}claims/${uploadForm.claim_id}/documents/upload`, "POST", formData)

      // Add the new document to the state
      setDocuments((prev) => [response,...prev])

      // Reset form
      setUploadForm({
        file_name: "",
        category_id: "",
        claim_id: "",
        file: null,
      })

      setIsUploadDialogOpen(false)

      toast({
        title: "Document uploaded successfully",
        description: `Document has been added to the claim.`,
      })

      // Navigate to the uploaded document's location
      if (selectedClaimId !== uploadForm.claim_id) {
        setSelectedClaimId(uploadForm.claim_id)
      }
      setSelectedCategoryId(uploadForm.category_id)

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload document.",
      })
    }
  }

  // Handle view document
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsViewDocumentOpen(true)
  }

  // Handle download document
  const handleDownloadDocument = async (document: Document) => {
    window.location.assign(STORAGES_URL + document.file_path);
  }

  // Breadcrumb path
  const getBreadcrumbPath = () => {
    const path = []
    path.push({ name: "All Claims", id: null })

    if (selectedClaimId) {
      const claim = claims.find((c) => c.id === selectedClaimId)
      if (claim) {
        path.push({ name: claim.code, id: claim.id })
      }

      if (selectedCategoryId) {
        const category = categories.find((c) => c.id === selectedCategoryId)
        if (category) {
          path.push({ name: category.name, id: category.id })
        }
      }
    }

    return path
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
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
        { name: "Documents", href: "/dashboard/insurer/documents", icon: <FileText className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-muted-foreground mt-2">Organize and manage claim-related documents</p>
          </div>

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
                  Upload a document and categorize it appropriately.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="document">Select File</Label>
                  <Input
                    id="document"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadForm({
                          ...uploadForm,
                          file,
                          file_name: file.name
                        })
                      }
                    }}
                  />
                </div>

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={uploadForm.category_id}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center">
                            {getCategoryIcon(category.name)}
                            <span className="ml-2">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="claim">Claim</Label>
                  <Select
                    value={uploadForm.claim_id}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, claim_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select claim" />
                    </SelectTrigger>
                    <SelectContent>
                      {claims.map((claim) => (
                        <SelectItem key={claim.id} value={claim.id}>
                          {claim.code} - {claim.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

        {/* Breadcrumb navigation */}
        <Breadcrumb>
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
                        setSelectedCategoryId(null)
                      } else if (index === 1) {
                        setSelectedCategoryId(null)
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

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documents by name..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    className={`flex items-center p-2 rounded-md cursor-pointer ${selectedClaimId === null ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                      }`}
                    onClick={() => setSelectedClaimId(null)}
                  >
                    <FolderOpen className="h-5 w-5 mr-2" />
                    <span>All Claims</span>
                    <Badge className="ml-auto">{documents.length}</Badge>
                  </div>

                  {claimsWithDocuments.map((claim) => {
                    const docCount = documents.filter((doc) => doc.claim_id === claim.id).length

                    return (
                      <div
                        key={claim.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer ${selectedClaimId === claim.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                          }`}
                        onClick={() => setSelectedClaimId(claim.id)}
                      >
                        <FolderIcon className="h-5 w-5 mr-2" />
                        <span className="truncate">{claim.code}</span>
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
                        (doc) => doc.claim_id === selectedClaimId && doc.category_id === category.id
                      ).length

                      return (
                        <div
                          key={category.id}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${selectedCategoryId === category.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                            }`}
                          onClick={() => setSelectedCategoryId(category.id)}
                        >
                          {getCategoryIcon(category.name)}
                          <span className="ml-2 truncate">{category.name}</span>
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
                        <TableHead>Claim</TableHead>
                        <TableHead>Uploaded At</TableHead>
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
                              aria-label={`Select ${doc.file_name}`}
                            />
                          </TableCell>
                          <TableCell>{getDocumentIcon(doc.mime_type)}</TableCell>
                          <TableCell className="font-medium">
                            <span className="truncate max-w-[200px] block">{doc.category?.name} {doc.mime_type}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{doc.category?.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{doc.claim?.code}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-sm">
                                {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => window.open(STORAGES_URL + doc.file_path, "_blank")}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  try {
                                    await apiRequest(`${API_URL}documents/${doc.id}`, "DELETE")
                                    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
                                    toast({
                                      title: "Document deleted",
                                      description: `${doc.file_name} has been deleted.`,
                                    })
                                  } catch (error: any) {
                                    toast({
                                      variant: "destructive",
                                      title: "Error",
                                      description: error.message || "Failed to delete document.",
                                    })
                                  }
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
                        ? selectedCategoryId
                          ? `No documents found in this category.`
                          : `No documents found for this claim.`
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
              {selectedDocument && getDocumentIcon(selectedDocument.mime_type)}
              <span className="ml-2">{selectedDocument?.file_name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
            {/* Document preview */}
            <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
              {selectedDocument ? (
                selectedDocument.mime_type.includes('image') ? (
                  <img
                    src={`${STORAGES_URL + selectedDocument.file_path}`}
                    alt={`Document: ${selectedDocument.category?.name} ${selectedDocument.mime_type}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback if preview fails
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement?.querySelector('.preview-fallback')?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center p-4">
                      {getDocumentIcon(selectedDocument.mime_type)}
                      <p className="mt-4">Preview not available</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.open(STORAGES_URL + selectedDocument.file_path, "_blank")}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download to View
                      </Button>
                    </div>
                  </div>
                )
              ) : null}

              {/* Fallback for failed image previews */}
              <div className="preview-fallback hidden flex items-center justify-center h-full bg-gray-100">
                <div className="text-center p-4">
                  {selectedDocument && getDocumentIcon(selectedDocument.mime_type)}
                  <p className="mt-4">Preview not available</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download to View
                  </Button>
                </div>
              </div>
            </div>

            {/* Document details and comments */}
            <div className="w-full md:w-80 flex flex-col overflow-hidden">
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">
                    {/* Comments
                    {selectedDocument && selectedDocument.comments?.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedDocument.comments.length}
                      </Badge>
                    )} */}
                  </TabsTrigger>
                  <TabsTrigger value="annotations">Annotations</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 overflow-auto">
                  {selectedDocument && (
                    <div className="space-y-4 p-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                        <p className="flex items-center mt-1">
                          {getCategoryIcon(selectedDocument?.category?.name || '')}
                          <span className="ml-2">{selectedDocument.category?.name}</span>
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Claim</h4>
                        <p className="mt-1">{selectedDocument?.claim?.code}</p>
                      </div>

                      {/* <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                        <p className="mt-1">{selectedDocument?.size}</p>
                      </div> */}

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Uploaded By</h4>
                        <div className="flex items-center mt-1">
                          {/* <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={selectedDocument.uploadedBy.avatar}
                              alt={selectedDocument.uploadedBy.name}
                            />
                            <AvatarFallback>{selectedDocument.uploadedBy.name.charAt(0)}</AvatarFallback>
                          </Avatar> */}
                          <span>{selectedDocument?.user?.name}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Uploaded At</h4>
                        <p className="mt-1">{format(selectedDocument.created_at, 'yyyy/MM/dd')}</p>
                      </div>

                      {/* {selectedDocument.lastModifiedAt && (
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
                      )} */}

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline">
                            {selectedDocument.mime_type}
                          </Badge>
                          <Badge variant="secondary">
                            {selectedDocument.category?.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                {/* 
                <TabsContent value="comments" className="flex-1 flex flex-col">
                  {selectedDocument && (
                    <>
                      <ScrollArea className="flex-1">
                        <div className="space-y-4 p-2">
                          {selectedDocument?.comments?.length > 0 ? (
                            selectedDocument?.comments?.map((comment) => (
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
                </TabsContent> */}

              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog */}
      {/* <Dialog open={isAddCommentOpen} onOpenChange={setIsAddCommentOpen}>
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
      </Dialog> */}
    </DashboardLayout>
  )
}
