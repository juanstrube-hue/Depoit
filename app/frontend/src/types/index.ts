export type ContractStatus = 'draft' | 'pending_signatures' | 'signed' | 'active' | 'finished' | 'closed';
export type DepositStatus = 'pending_deposit' | 'deposited' | 'in_custody' | 'return_review' | 'partially_returned' | 'returned' | 'disputed';

export interface UserProfile {
  id: number;
  user_id: string;
  display_name: string;
  roles: string;
  phone: string;
  rut: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface Contract {
  id: number;
  user_id: string;
  landlord_name: string;
  landlord_email: string;
  tenant_name: string;
  tenant_email: string;
  broker_name: string;
  broker_email: string;
  property_address: string;
  property_city: string;
  property_region: string;
  property_type: string;
  rent_amount: number;
  deposit_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  contract_status: ContractStatus;
  deposit_status: DepositStatus;
  signed_by_landlord: boolean;
  signed_by_tenant: boolean;
  yield_generated: number;
  signed_at: string;
  deposit_received_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface DepositReturn {
  id: number;
  user_id: string;
  contract_id: number;
  amount_returned: number;
  total_deductions: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  initiated_by: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface DepositDeduction {
  id: number;
  user_id: string;
  contract_id: number;
  category: string;
  description: string;
  amount: number;
  evidence_url: string;
  status: 'pending' | 'approved' | 'rejected';
  tenant_comment: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContractEvent {
  id: number;
  user_id: string;
  contract_id: number;
  event_type: string;
  title: string;
  description: string;
  actor_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  contract_id: number;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'arrendador' | 'arrendatario' | 'corredor';

export type GuaranteeDeductionStatus = 'pending' | 'negotiating' | 'approved' | 'rejected' | 'cancelled';
export type GuaranteeDeductionCategory =
  | 'limpieza'
  | 'pintura'
  | 'daño estructural'
  | 'equipamiento'
  | 'servicios pendientes'
  | 'otro';

export interface GuaranteeDeduction {
  id: number;
  contract_id: number;
  created_by: string;
  category: GuaranteeDeductionCategory;
  title: string;
  description?: string;
  requested_amount: number;
  agreed_amount?: number;
  status: GuaranteeDeductionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface GuaranteeDeductionFile {
  id: number;
  deduction_id: number;
  file_url: string;
  file_type?: string;
  created_at?: string;
}

export type GuaranteeDeductionEventType =
  | 'created'
  | 'accepted'
  | 'rejected'
  | 'counter_proposed'
  | 'cancelled';

export interface GuaranteeDeductionEvent {
  id: number;
  deduction_id: number;
  user_id: string;
  event_type: GuaranteeDeductionEventType;
  previous_amount?: number;
  proposed_amount?: number;
  comment?: string;
  created_at?: string;
}