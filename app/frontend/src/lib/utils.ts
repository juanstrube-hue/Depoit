import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ContractStatus, DepositStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/* ------------------------------------------------------------------ */
/*  Contract Status helpers                                            */
/* ------------------------------------------------------------------ */
export function getContractStatusLabel(status: ContractStatus): string {
  const labels: Record<ContractStatus, string> = {
    draft: 'Borrador',
    pending_signatures: 'Pendiente de firmas',
    signed: 'Firmado',
    active: 'Activo',
    finished: 'Finalizado',
    closed: 'Cerrado',
  };
  return labels[status] || status;
}

export function getContractStatusColor(status: ContractStatus): string {
  const colors: Record<ContractStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    pending_signatures: 'bg-amber-100 text-amber-800 border-amber-200',
    signed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    finished: 'bg-blue-100 text-blue-800 border-blue-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getContractStatusDot(status: ContractStatus): string {
  const dots: Record<ContractStatus, string> = {
    draft: 'bg-gray-400',
    pending_signatures: 'bg-amber-400',
    signed: 'bg-indigo-500',
    active: 'bg-emerald-500',
    finished: 'bg-blue-500',
    closed: 'bg-gray-400',
  };
  return dots[status] || 'bg-gray-400';
}

/* ------------------------------------------------------------------ */
/*  Deposit Status helpers                                             */
/* ------------------------------------------------------------------ */
export function getDepositStatusLabel(status: DepositStatus): string {
  const labels: Record<DepositStatus, string> = {
    pending_deposit: 'Pendiente de depósito',
    deposited: 'Depositado',
    in_custody: 'En custodia',
    return_review: 'En revisión de devolución',
    partially_returned: 'Parcialmente devuelto',
    returned: 'Devuelto',
    disputed: 'En disputa',
  };
  return labels[status] || status;
}

export function getDepositStatusColor(status: DepositStatus): string {
  const colors: Record<DepositStatus, string> = {
    pending_deposit: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    deposited: 'bg-teal-100 text-teal-800 border-teal-200',
    in_custody: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    return_review: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    partially_returned: 'bg-orange-100 text-orange-800 border-orange-200',
    returned: 'bg-green-100 text-green-800 border-green-200',
    disputed: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getDepositStatusDot(status: DepositStatus): string {
  const dots: Record<DepositStatus, string> = {
    pending_deposit: 'bg-yellow-400',
    deposited: 'bg-teal-500',
    in_custody: 'bg-emerald-500',
    return_review: 'bg-indigo-500',
    partially_returned: 'bg-orange-500',
    returned: 'bg-green-500',
    disputed: 'bg-red-500',
  };
  return dots[status] || 'bg-gray-400';
}

/* ------------------------------------------------------------------ */
/*  State transition validation                                        */
/* ------------------------------------------------------------------ */
const VALID_CONTRACT_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  draft: ['pending_signatures'],
  pending_signatures: ['signed'],
  signed: ['active'],
  active: ['finished'],
  finished: ['closed'],
  closed: [],
};

const VALID_DEPOSIT_TRANSITIONS: Record<DepositStatus, DepositStatus[]> = {
  pending_deposit: ['deposited'],
  deposited: ['in_custody'],
  in_custody: ['return_review'],
  return_review: ['returned', 'partially_returned', 'disputed'],
  partially_returned: [],
  returned: [],
  disputed: ['return_review'],
};

export function canTransitionContract(from: ContractStatus, to: ContractStatus): boolean {
  return VALID_CONTRACT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionDeposit(from: DepositStatus, to: DepositStatus): boolean {
  return VALID_DEPOSIT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextContractActions(status: ContractStatus): ContractStatus[] {
  return VALID_CONTRACT_TRANSITIONS[status] || [];
}

export function getNextDepositActions(status: DepositStatus): DepositStatus[] {
  return VALID_DEPOSIT_TRANSITIONS[status] || [];
}

/* ------------------------------------------------------------------ */
/*  Legacy helpers (kept for backward compatibility)                    */
/* ------------------------------------------------------------------ */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending_signature':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'active':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'in_process':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in_custody':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'in_return_process':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'deposited':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'signed':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'partial':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'pending_signature':
      return 'Pendiente de firma';
    case 'active':
      return 'Activo';
    case 'in_process':
      return 'En Proceso';
    case 'in_custody':
      return 'En custodia';
    case 'in_return_process':
      return 'En devolución';
    case 'completed':
      return 'Completado';
    case 'rejected':
      return 'Rechazado';
    case 'approved':
      return 'Aprobado';
    case 'paid':
      return 'Pagado';
    case 'deposited':
      return 'Depositado';
    case 'signed':
      return 'Firmado';
    case 'cancelled':
      return 'Cancelado';
    case 'partial':
      return 'Parcial';
    case 'tenant':
      return 'Arrendatario';
    case 'landlord':
      return 'Arrendador';
    default:
      return status;
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-400';
    case 'pending_signature':
      return 'bg-amber-400';
    case 'active':
      return 'bg-emerald-400';
    case 'in_process':
      return 'bg-blue-400';
    case 'in_custody':
      return 'bg-teal-400';
    case 'in_return_process':
      return 'bg-indigo-400';
    case 'completed':
      return 'bg-gray-400';
    case 'rejected':
      return 'bg-red-500';
    case 'approved':
      return 'bg-emerald-500';
    case 'paid':
      return 'bg-green-500';
    case 'deposited':
      return 'bg-teal-500';
    case 'signed':
      return 'bg-indigo-500';
    case 'cancelled':
      return 'bg-red-400';
    case 'partial':
      return 'bg-orange-400';
    default:
      return 'bg-gray-400';
  }
}