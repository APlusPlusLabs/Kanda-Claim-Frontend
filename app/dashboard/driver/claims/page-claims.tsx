"use client"

import { useEffect, useState } from "react"
import Link from "@/Next.js/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Car,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  FileImage,
  FileIcon as FilePdf,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
// Update the mock claims data to be within a reasonable timeframe (not going beyond April 2025)// Assuming you've fetched claims data that includes vehicles (through a relation)
// This function handles filtering claims based on search query and status
const filterClaims = (claims, searchQuery = "", statusFilter = "all") => {
    // Step 1: Filter based on search query and status
    const filteredClaims = claims.filter((claim) => {
      // Search matching - check if any relevant field contains the search query
      const matchesSearch = searchQuery === "" || (
        // Core claim fields from your schema
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.policy_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        
        // Related vehicle fields (assuming they're loaded with claim)
        // Note: These need to be adjusted based on your actual data structure
        claim.vehicles?.[0]?.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.vehicles?.[0]?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.vehicles?.[0]?.model?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
      // Status filtering based on your schema's status enum
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && 
          ["Draft", "Submitted", "Under Review", "Approved"].includes(claim.status)) ||
        (statusFilter === "completed" && claim.status === "Closed") ||
        (statusFilter === "rejected" && claim.status === "Rejected");
  
      return matchesSearch && matchesStatus;
    });
  
    return filteredClaims;
  };
  
  // Function to categorize claims by status
  const categorizeClaims = (filteredClaims) => {
    // Based on your database schema status options
    const activeClaims = filteredClaims.filter(
      (claim) => ["Draft", "Submitted", "Under Review", "Approved"].includes(claim.status)
    );
    
    const completedClaims = filteredClaims.filter(
      (claim) => claim.status === "Closed"
    );
    
    const rejectedClaims = filteredClaims.filter(
      (claim) => claim.status === "Rejected"
    );
  
    return {
      activeClaims,
      completedClaims,
      rejectedClaims,
      allClaims: filteredClaims
    };
  };
  
  // Usage example
  const handleFilterAndSearch = (claims, searchQuery, statusFilter) => {
    const filteredClaims = filterClaims(claims, searchQuery, statusFilter);
    const categorizedClaims = categorizeClaims(filteredClaims);
    
    return categorizedClaims;
  };
  
  // Example implementation in a component
  const ClaimsPage = () => {
    const [claims, setClaims] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    
    useEffect(() => {
      // Fetch claims from API
      const fetchClaims = async () => {
        try {
          const response = await apiRequest(`${API_URL}claims`, "GET");
          setClaims(response.data);
        } catch (error) {
          console.error("Error fetching claims:", error);
        }
      };
      
      fetchClaims();
    }, []);
    
    // Apply filters whenever search or status changes
    const { activeClaims, completedClaims, rejectedClaims } = 
      handleFilterAndSearch(claims, searchQuery, statusFilter);
    
    return (
      <div>
        {/* Search and filter UI */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Claims</option>
            <option value="active">Active Claims</option>
            <option value="completed">Completed Claims</option>
            <option value="rejected">Rejected Claims</option>
          </select>
        </div>
        
        {/* Display claims based on status */}
        <div className="claims-section">
          <h2>Active Claims ({activeClaims.length})</h2>
          <ClaimsList claims={activeClaims} />
          
          <h2>Completed Claims ({completedClaims.length})</h2>
          <ClaimsList claims={completedClaims} />
          
          <h2>Rejected Claims ({rejectedClaims.length})</h2>
          <ClaimsList claims={rejectedClaims} />
        </div>
      </div>
    );
  };