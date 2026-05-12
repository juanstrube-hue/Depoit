import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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