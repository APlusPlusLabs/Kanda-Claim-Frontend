import { Tenant, User } from "./users";

export interface Vehicle {
  id: string;
  tenant_id: string;
  user_id: string;
  license_plate: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  created_at?: string;
  updated_at?: string;
}
export interface DocumentCategory {
  id?: string; name: string;
};
// export interface Document {
//   id: string;
//   category: any;
//   category_id?: any;
//   tenant_id?: any; 
//   user_id?: any; 
//   claim_id?: any; 
//   file_name: string;
//   mime_type: string;
//   file_path: string;
//   created_at: string;
// }
export interface Document {
  id: string;
  tenant_id: string;
  category_id: string;
  claim_id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  created_at?: string;
  updated_at?: string;
  // Relationships
  category?: {
    id: string;
    name: string;
  };
  claim?: {
    id: string;
    code: string;
  };
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}
export interface ReportPart {
  id: string;
  cost: number;
  name: string;
  category?: string;
  selected: boolean;
}
export interface AssignmentReport {
  "photos": any[],
  "laborCost": number,
  "totalCost": number,
  "submittedAt": string,
  "selectedParts": ReportPart[],
  "partsToReplace": ReportPart[],
  "damageDescription": string,
  "repairRecommendation": string
}
export interface Activity {
  id: string;
  event: string;
  status: string;
  created_at: string;
  user?: { info: string }
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  date?: string;
  timestamp?: string;
}
export interface Assignment {
  id: string;
  code: string;
  tenant_id: string;
  tenant: Tenant;
  claim_id: string;
  claim: Claim;
  assessor: User;
  assigned_at: string;
  status: string;
  reassigned_at: string;
  notes: string;
  priority: string;
  scheduled_date: string;
}
export interface Garage {
  id: string;
  tenant_id: string;
  claim_id: string;
  name: string;
  phone: string;
  email?: string;
  repair_estimate: number;
  rating?: number,
  address: string;
  description?: string;
  specializations?: string[];
  openHours?: any;
  latitude?: number,
  longitude?: number,
  distance?: number,
}
export interface PoliceReport {
  id: string;
  tenant_id: string;
  claim_id: string;
  police_visited: string;
  police_station: string;
  police_report_number: string;
  police_officer_name: string;
  police_officer_phone: string;
  note: string;
}
export interface ClaimType {
  id: string;
  tenant_id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  claims?: Claim[]
}
export interface Claim {
  id: string;
  tenant_id: string;
  tenant: Tenant;
  user_id: string;
  claim_type_id: string;
  code: string;
  amount: number;
  approved_amount: string;
  currency: string;
  status: string;
  priority: string;
  policy_number: string;
  accident_date: string;
  accident_time: string;
  location: string;
  description: string;
  rejection_reason?: string;
  note?: string;
  driver_details?: any;
  user: User;
  vehicles: Vehicle[];
  police_assignment?: any[];
  injuries?: any[];
  damages?: any[];
  garages?: Garage[];
  documents: Document[];
  messages: Message[];
  assessments?: any[];
  activities: Activity[];
  insurer: any;
  department: any;
  progress: number;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  submitted_by: string;
  pending_reason?: string;
  assignment?: Assignment;
  feedback?: {
    id: string;
    overall_rating: number;
    process_rating?: number;
    communication_rating?: number;
    speed_rating?: number;
    feedback_text?: string;
    created_at: string;
  };
}
export const defaultClaim: Claim = {
  id: "",
  tenant_id: "",
  user_id: "",
  claim_type_id: "",
  code: "",
  amount: 0,
  approved_amount: "0",
  currency: "RWF",
  status: "",
  priority: "",
  policy_number: "",
  accident_date: "",
  accident_time: "",
  location: "",
  description: "",
  vehicles: [],
  documents: [],
  messages: [],
  activities: [],
  insurer: { name: "" },
  progress: 0,
  assessments: [],
  user: {
    id: "",
    email: "",
    name: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: {},
    role_id: "",
    tenant_id: "",
    tenant: {
      id: "",
      name: "",
      users: [],
      email: "",
      phone: "",
      address: "",
      website: "",
      contact_person: null,
      description: "",
      min_amount_multisignature: 0
    },
    avatar: "",
    status: "",
    last_login: "",
    garage_id: "",
    info: ""
  },
  department: {},
  created_at: "",
  updated_at: "",
  submitted_at: "",
  submitted_by: "",
  tenant: {
    id: "",
    name: "",
    users: [],
    email: "",
    phone: "",
    address: "",
    website: "",
    contact_person: null,
    description: "",
    min_amount_multisignature: 0
  }
};

export interface Contract {
  id: string;
  code: string;
  tenant_id: string;
  bid_id: string;
  garage_id: string;
  claim_id: string;
  terms: string;
  document: string;
  status: string;
  contract_value: number;
  expires_at: string;
  created_by: string;
  signed_by: string;
  signed_at: string;
}
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface Payment {
  id: string
  code: string
  tenant_id: string
  claim_id?: string | null
  user_id: string
  amount: number
  currency: string
  payment_method?: string | null
  payment_code?: string | null
  document?: string | null
  status: PaymentStatus
  transaction_reference?: string | null
  payment_gateway?: string | null
  gateway_response?: string | null
  processed_at?: string | null
  failure_reason?: string | null
  contract_id?: string | null
  created_at: string
  updated_at: string

  claim?: Claim
  user?: User
  contract?: Contract
  tenant?: Tenant

  formatted_amount?: string
  is_refund?: boolean
  is_completed?: boolean
  is_pending?: boolean
  is_failed?: boolean
  status_color?: string
}
export type SettlementStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'


export interface Settlement {
  id: string
  code: string
  tenant_id: string
  claim_id: string
  payment_id: string
  user_id: string
  settled_amount: number
  settled_at?: string | null
  status: SettlementStatus
  settlement_notes?: string | null
  approved_by?: string | null
  requested_amount?: number | null
  created_at: string
  updated_at: string

  claim?: Claim
  payment?: Payment
  user?: User
  approver?: User
  tenant?: Tenant

  is_pending?: boolean
  is_approved?: boolean
  is_completed?: boolean
  is_rejected?: boolean
  formatted_amount?: string
  settlement_days?: number
}