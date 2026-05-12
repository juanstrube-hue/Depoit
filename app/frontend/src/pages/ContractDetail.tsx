import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';
import { formatCLP, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
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
} from 'lucide-react';
import type { Contract, ContractEvent, DepositDeduction } from '@/types';

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [deductions, setDeductions] = useState<DepositDeduction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
        setEvents(allEvents.filter((e: ContractEvent) => String(e.contract_id) === id));

        const allDeductions = deductionsRes?.data?.items || [];
        setDeductions(allDeductions.filter((d: DepositDeduction) => String(d.contract_id) === id));
      } catch (err) {
        console.error('Error fetching contract detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/contracts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F172A]">{contract.property_address}</h1>
            <Badge variant="outline" className={getStatusColor(contract.status)}>
              {getStatusLabel(contract.status)}
            </Badge>
          </div>
          <p className="text-[#64748B] mt-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {contract.property_city}, {contract.property_region}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-4">
            <p className="text-sm text-[#64748B]">Depósito en Custodia</p>
            <p className="text-xl font-bold text-[#0F172A] mt-1">{formatCLP(contract.deposit_amount)}</p>
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
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatCLP(contract.yield_generated)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
          <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
        </TabsList>

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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-4">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6">
              {events.length === 0 ? (
                <p className="text-center text-[#64748B] py-8">No hay eventos registrados</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 mt-1.5" />
                        <div className="flex-1 w-px bg-[#E2E8F0]" />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-[#0F172A]">{event.title}</p>
                        <p className="text-sm text-[#64748B] mt-0.5">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {event.actor_name} · {formatDate(event.created_at || '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Descuentos */}
        <TabsContent value="descuentos" className="mt-4">
          <Card className="border-[#E2E8F0]">
            <CardContent className="p-6">
              {deductions.length === 0 ? (
                <p className="text-center text-[#64748B] py-8">No hay descuentos registrados</p>
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
                  <p className="text-xs text-[#64748B] uppercase tracking-wide">Arrendador</p>
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
                  <p className="text-xs text-[#64748B] uppercase tracking-wide">Arrendatario</p>
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