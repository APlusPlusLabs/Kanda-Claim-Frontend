import { User } from "./users";

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

export interface Document {
  id: string;
  file_name: string;
  mime_type: string;
  file_path: string;
  created_at: string;
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
  date: string;
}
export interface Assignment {
  id: string;
  tenant_id: string;
  claim_id: string;
  assessor: any;
  assigned_at: string;
  status: string;
  reassigned_at: string;
  notes: string;
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
