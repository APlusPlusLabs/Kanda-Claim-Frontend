import { Activity, Document } from "./claims"
import { User } from "./users"

export interface Bid {
  id: string
  code: string
  claim_id: string
  claim: any
  vehicle_info: {
    make: string
    model: string
    year: string
    license_plate: string
    vin: string
  }
  damage_description: string
  scope_of_work: string[]
  estimated_cost: number
  photos: Document[]
  documents: Document[]
  status: "open" | "in-progress" | "awarded" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  created_by: string
  interested_garages: string[]
  submissions: BidSubmission[]
  awarded_to?: string
  completed_at?: string
  activities: Activity[],
  user: User
}
export interface CostBreakdown{
  item: string
  cost: number
  description: string
}
export interface BidSubmission {
  id: string
  bid_id: string
  garage_id: string
  garage: any
  cost_breakdown: CostBreakdown []
  proposed_cost: number
  estimated_completion_time: string
  notes: string
  created_at: string
  status: "pending" | "accepted" | "rejected"
}

export interface BidActivity {
  id: string
  bid_id: string
  activityType:
    | "bid_created"
    | "bid_updated"
    | "garage_interested"
    | "inspection_scheduled"
    | "bid_submitted"
    | "bid_awarded"
    | "bid_completed"
    | "bid_cancelled"
  description: string
  user?: {
    id: string
    name: string
    role_name: string
  }
  timestamp: string
  metadata?: Record<string, any>
}

export interface InspectionSchedule {
  id: string
  bid_id: string
  garage_id: string
  scheduled_date: string
  scheduled_time: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  created_at: string
}
