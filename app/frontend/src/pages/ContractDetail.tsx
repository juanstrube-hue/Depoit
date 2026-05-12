import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';
import {
  formatCLP,
  formatDate,
  getContractStatusLabel,
  getContractStatusColor,
  getContractStatusDot,
  getDepositStatusLabel,
  getDepositStatusColor,
  getDepositStatusDot,
  getNextContractActions,
  getNextDepositActions,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Mail,
  DollarSign,
  Clock,
  FileText,
  PenTool,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import type { Contract, ContractEvent, DepositDeduction, ContractStatus, DepositStatus } from '@/types';

/* ------------------------------------------------------------------ */
/*  Action button config per state                                     */
/* ------------------------------------------------------------------ */
interface ActionConfig {
  label: string;
  icon: React.ElementType;
  targetContractStatus?: ContractStatus;
  targetDepositStatus?: DepositStatus;
  variant: 'default' | 'outline';
  color: string;
  eventType: string;
  eventTitle: string;
  eventDescription: (c: Contract) => string;
}

function getAvailableActions(contract: Contract): ActionConfig[] {
  const actions: ActionConfig[] = [];
  const cs = contract.contract_status;
  const ds = contract.deposit_status;

  // Contract status actions
  if (cs === 'draft') {
    actions.push({
      label: 'Enviar a firma',
      icon: PenTool,
      targetContractStatus: 'pending_signatures',
      variant: 'default',
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      eventType: 'sent_for_signatures',
      eventTitle: 'Enviado a firma',
      eventDescription: (c) => `Contrato enviado para firma a ${c.landlord_name} y ${c.tenant_name}.`,
    });
  }

  if (cs === 'pending_signatures') {
    if (!contract.signed_by_landlord) {
      actions.push({
        label: 'Firmar como arrendador',
        icon: PenTool,
        variant: 'default',
        color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        eventType: 'landlord_signed',
        eventTitle: 'Firma del arrendador',
        eventDescription: (c) => `${c.landlord_name} firmó el contrato digitalmente.`,
      });
    }
    if (!contract.signed_by_tenant) {
      actions.push({
        label: 'Firmar como arrendatario',
        icon: PenTool,
        variant: 'outline',
        color: 'border-indigo-300 text-indigo-700 hover:bg-indigo-50',
        eventType: 'tenant_signed',
        eventTitle: 'Firma del arrendatario',
        eventDescription: (c) => `${c.tenant_name} firmó el contrato digitalmente.`,
      });
    }
  }

  if (cs === 'signed' && ds === 'pending_deposit') {
    actions.push({
      label: 'Confirmar depósito recibido',
      icon: Banknote,
      targetDepositStatus: 'deposited',
      variant: 'default',
      color: 'bg-teal-600 hover:bg-teal-700 text-white',
      eventType: 'deposit_received',
      eventTitle: 'Depósito recibido',
      eventDescription: (c) => `Depósito de ${formatCLP(c.deposit_amount)} recibido y confirmado.`,
    });
  }

  if (cs === 'signed' && ds === 'deposited') {
    actions.push({
      label: 'Activar custodia',
      icon: Shield,
      targetContractStatus: 'active',
      targetDepositStatus: 'in_custody',
      variant: 'default',
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      eventType: 'custody_activated',
      eventTitle: 'Custodia activada',
      eventDescription: (c) => `Depósito de ${formatCLP(c.deposit_amount)} ahora en custodia segura.`,
    });
  }

  if (cs === 'active' && ds === 'in_custody') {
    actions.push({
      label: 'Finalizar contrato',
      icon: FileText,
      targetContractStatus: 'finished',
      targetDepositStatus: 'return_review',
      variant: 'outline',
      color: 'border-blue-300 text-blue-700 hover:bg-blue-50',
      eventType: 'contract_finished',
      eventTitle: 'Contrato finalizado',
      eventDescription: () => 'Contrato finalizado. Depósito en revisión para devolución.',
    });
  }

  if (cs === 'finished' && ds === 'return_review') {
    actions.push({
      label: 'Devolver depósito completo',
      icon: RotateCcw,
      targetDepositStatus: 'returned',
      targetContractStatus: 'closed',
      variant: 'default',
      color: 'bg-green-600 hover:bg-green-700 text-white',
      eventType: 'deposit_returned',
      eventTitle: 'Depósito devuelto',
      eventDescription: (c) => `Depósito de ${formatCLP(c.deposit_amount)} devuelto íntegramente al arrendatario.`,
    });
    actions.push({
      label: 'Devolución parcial (con descuentos)',
      icon: DollarSign,
      targetDepositStatus: 'partially_returned',
      targetContractStatus: 'closed',
      variant: 'outline',
      color: 'border-orange-300 text-orange-700 hover:bg-orange-50',
      eventType: 'deposit_partial_return',
      eventTitle: 'Devolución parcial',
      eventDescription: () => 'Depósito devuelto parcialmente con descuentos aplicados.',
    });
  }

  return actions;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [deductions, setDeductions] = useState<DepositDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contractsRes, eventsRes, deductionsRes] = await Promise.all([
        client.entities.contracts.queryAll({}),
        client.entities.contract_events.queryAll({}),
        client.entities.deposit_deductions.queryAll({}),
      ]);

      const allContracts = contractsRes?.data?.items || [];
      const found = allContracts.find((c: Contract) => String(c.id) === id);
      setContract(found || null);

      const allEvents = eventsRes?.data?.items || [];
      const contractEvents = allEvents
        .filter((e: ContractEvent) => String(e.contract_id) === id)
        .sort((a: ContractEvent, b: ContractEvent) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      setEvents(contractEvents);

      const allDeductions = deductionsRes?.data?.items || [];
      setDeductions(allDeductions.filter((d: DepositDeduction) => String(d.contract_id) === id));
    } catch (err) {
      console.error('Error fetching contract detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------------------------------------------------------- */
  /*  Action handler                                                   */
  /* ---------------------------------------------------------------- */
  const handleAction = async (action: ActionConfig) => {
    if (!contract) return;
    setActionLoading(true);

    try {
      const updates: Record<string, unknown> = {};
      let newContractStatus = contract.contract_status;
      let newDepositStatus = contract.deposit_status;

      // Handle signature actions specially
      if (action.eventType === 'landlord_signed') {
        updates.signed_by_landlord = true;
        updates.signed_at = new Date().toISOString();
        // If tenant already signed, transition to signed
        if (contract.signed_by_tenant) {
          updates.contract_status = 'signed';
          newContractStatus = 'signed';
        }
      } else if (action.eventType === 'tenant_signed') {
        updates.signed_by_tenant = true;
        // If landlord already signed, transition to signed
        if (contract.signed_by_landlord) {
          updates.contract_status = 'signed';
          updates.signed_at = new Date().toISOString();
          newContractStatus = 'signed';
        }
      } else {
        // Standard transitions
        if (action.targetContractStatus) {
          updates.contract_status = action.targetContractStatus;
          newContractStatus = action.targetContractStatus;
        }
        if (action.targetDepositStatus) {
          updates.deposit_status = action.targetDepositStatus;
          newDepositStatus = action.targetDepositStatus;
        }
      }

      // Sync legacy status field
      if (newContractStatus === 'active' && newDepositStatus === 'in_custody') {
        updates.status = 'in_custody';
      } else if (newContractStatus === 'finished') {
        updates.status = 'in_return_process';
      } else if (newContractStatus === 'closed') {
        updates.status = 'completed';
      } else if (newContractStatus === 'pending_signatures') {
        updates.status = 'pending_signature';
      } else if (newContractStatus === 'signed') {
        updates.status = 'signed';
      }

      if (action.targetDepositStatus === 'deposited') {
        updates.deposit_received_at = new Date().toISOString();
      }

      // Update contract
      await client.entities.contracts.update({
        id: contract.id,
        data: updates,
      });

      // Create timeline event
      await client.entities.contract_events.create({
        data: {
          contract_id: contract.id,
          event_type: action.eventType,
          title: action.eventTitle,
          description: action.eventDescription(contract),
          actor_name: user?.email || 'Sistema',
        },
      });

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error executing action:', err);
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading / Not found                                              */
  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748B]">Contrato no encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/contracts')}>
          Volver a Contratos
        </Button>
      </div>
    );
  }

  const actions = getAvailableActions(contract);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/contracts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0F172A]">{contract.property_address}</h1>
          </div>
          <p className="text-[#64748B] mt-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {contract.property_city}, {contract.property_region}
          </p>
        </div>
      </div>

      {/* Dual status badges */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Contrato:</span>
          <Badge variant="outline" className={getContractStatusColor(contract.contract_status)}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${getContractStatusDot(contract.contract_status)}`} />
            {getContractStatusLabel(contract.contract_status)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#64748B] uppercase tracking-wide">Depósito:</span>
          <Badge variant="outline" className={getDepositStatusColor(contract.deposit_status)}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${getDepositStatusDot(contract.deposit_status)}`} />
            {getDepositStatusLabel(contract.deposit_status)}
          </Badge>
        </div>
        {/* Signature indicators */}
        {contract.contract_status === 'pending_signatures' && (
          <div className="flex items-center gap-3 ml-2">
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              {contract.signed_by_landlord ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              )}
              Arrendador
            </span>
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              {contract.signed_by_tenant ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              )}
              Arrendatario
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {actions.length > 0 && (
        <Card className="border-[#E2E8F0] bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-[#64748B] mb-3">Acciones disponibles</p>
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button
                  key={action.eventType}
                  onClick={() => handleAction(action)}
                  disabled={actionLoading}
                  className={action.color}
                  variant={action.variant}
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <action.icon className="h-4 w-4 mr-2" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4">
            <p className="text-sm text-[#64748B]">Depósito</p>
            <p className="text-xl font-bold text-[#0F172A] mt-1">{formatCLP(contract.deposit_amount)}</p>
            <p className="text-xs text-[#64748B] mt-1">{getDepositStatusLabel(contract.deposit_status)}</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4">
            <p className="text-sm text-[#64748B]">Arriendo Mensual</p>
            <p className="text-xl font-bold text-[#0F172A] mt-1">{formatCLP(contract.rent_amount)}</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4">
            <p className="text-sm text-[#64748B]">Rendimiento Generado</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatCLP(contract.yield_generated || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
        </TabsList>

        {/* Timeline — now the default tab */}
        <TabsContent value="timeline" className="mt-4">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[#64748B]">No hay eventos registrados</p>
                  <p className="text-xs text-gray-400 mt-1">Los eventos aparecerán aquí cuando se realicen acciones sobre el contrato.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {events.map((event, index) => {
                    const isLast = index === events.length - 1;
                    const dotColor = getEventDotColor(event.event_type);
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                          {!isLast && <div className="flex-1 w-px bg-[#E2E8F0] min-h-[24px]" />}
                        </div>
                        <div className="pb-5">
                          <p className="font-medium text-[#0F172A] text-sm">{event.title}</p>
                          <p className="text-sm text-[#64748B] mt-0.5">{event.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {event.actor_name} · {formatDate(event.created_at || '')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resumen */}
        <TabsContent value="resumen" className="mt-4">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#64748B]">Inicio:</span>
                    <span className="font-medium">{formatDate(contract.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#64748B]">Término:</span>
                    <span className="font-medium">{formatDate(contract.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#64748B]">Tipo propiedad:</span>
                    <span className="font-medium">{contract.property_type}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#64748B]">Firmado:</span>
                    <span className="font-medium">{formatDate(contract.signed_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#64748B]">Depósito recibido:</span>
                    <span className="font-medium">{formatDate(contract.deposit_received_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#64748B]">Creado:</span>
                    <span className="font-medium">{formatDate(contract.created_at || '')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Descuentos */}
        <TabsContent value="descuentos" className="mt-4">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6">
              {deductions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[#64748B]">No hay descuentos registrados</p>
                  <p className="text-xs text-gray-400 mt-1">Los descuentos se registrarán durante el proceso de devolución.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deductions.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F172A]">{d.description}</p>
                        <p className="text-sm text-[#64748B]">{d.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">-{formatCLP(d.amount)}</p>
                        <Badge variant="outline" className={getStatusColor(d.status)}>
                          {getStatusLabel(d.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participantes */}
        <TabsContent value="participantes" className="mt-4">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6 space-y-4">
              {/* Arrendador */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#64748B] uppercase tracking-wide">Arrendador</p>
                    {contract.signed_by_landlord && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> Firmado
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-[#0F172A]">{contract.landlord_name}</p>
                  <p className="text-sm text-[#64748B] flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {contract.landlord_email}
                  </p>
                </div>
              </div>

              {/* Arrendatario */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#64748B] uppercase tracking-wide">Arrendatario</p>
                    {contract.signed_by_tenant && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> Firmado
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-[#0F172A]">{contract.tenant_name}</p>
                  <p className="text-sm text-[#64748B] flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {contract.tenant_email}
                  </p>
                </div>
              </div>

              {/* Corredor */}
              {contract.broker_name && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#64748B] uppercase tracking-wide">Corredor</p>
                    <p className="font-medium text-[#0F172A]">{contract.broker_name}</p>
                    <p className="text-sm text-[#64748B] flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {contract.broker_email}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: event dot color by type                                    */
/* ------------------------------------------------------------------ */
function getEventDotColor(eventType: string): string {
  switch (eventType) {
    case 'contract_created':
      return 'bg-blue-500';
    case 'sent_for_signatures':
      return 'bg-amber-500';
    case 'landlord_signed':
    case 'tenant_signed':
      return 'bg-indigo-500';
    case 'deposit_received':
      return 'bg-teal-500';
    case 'custody_activated':
      return 'bg-emerald-500';
    case 'contract_finished':
      return 'bg-blue-500';
    case 'deposit_returned':
      return 'bg-green-500';
    case 'deposit_partial_return':
      return 'bg-orange-500';
    default:
      return 'bg-gray-400';
  }
}