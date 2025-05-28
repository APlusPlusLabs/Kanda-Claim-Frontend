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
  address: string;
  phone: string;
  repair_estimate: number;
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
      users: []
    },
    avatar: "",
    status: "",
    last_login: ""
  },
  department: {},
  created_at: "",
  updated_at: "",
  submitted_at: "",
  submitted_by: "",
  tenant: {
    id: "",
    name: "",
    users: []
  }
};