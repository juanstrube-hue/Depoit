import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';
import { formatCLP, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ShieldAlert } from 'lucide-react';
import type { GuaranteeDeduction, Contract } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  negotiating: 'En negociación',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  negotiating: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const CATEGORY_LABEL: Record<string, string> = {
  limpieza: 'Limpieza',
  pintura: 'Pintura',
  'daño estructural': 'Daño estructural',
  equipamiento: 'Equipamiento',
  'servicios pendientes': 'Servicios pendientes',
  otro: 'Otro',
};

export default function GuaranteeDeductions() {
  const navigate = useNavigate();
  const [deductions, setDeductions] = useState<GuaranteeDeduction[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [dRes, cRes] = await Promise.all([
          client.entities.guarantee_deductions.queryAll({}),
          client.entities.contracts.queryAll({}),
        ]);
        setDeductions(dRes?.data?.items || []);
        setContracts(cRes?.data?.items || []);
      } catch (err) {
        console.error('Error cargando descuentos garantía:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getAddress = (contractId: number) => {
    const c = contracts.find((ct) => ct.id === contractId);
    return c?.property_address || `Contrato #${contractId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Descuentos garantía</h1>
          <p className="text-[#64748B] mt-1">Propuestas de descuento sobre garantías en custodia</p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => navigate('/guarantee-deductions/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva propuesta
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : deductions.length === 0 ? (
        <Card className="border-[#E2E8F0]">
          <CardContent className="py-16 text-center">
            <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[#64748B] font-medium">Sin descuentos garantía</p>
            <p className="text-sm text-gray-400 mt-1">
              Las propuestas de descuento aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deductions.map((d) => (
            <Card
              key={d.id}
              className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/guarantee-deductions/${d.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-[#0F172A] truncate">{d.title}</h3>
                      <Badge variant="outline" className={STATUS_COLOR[d.status]}>
                        {STATUS_LABEL[d.status]}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
                        {CATEGORY_LABEL[d.category] || d.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#64748B]">{getAddress(d.contract_id)}</p>
                    {d.description && (
                      <p className="text-sm text-gray-400 italic truncate">{d.description}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(d.created_at || '')}</p>
                  </div>
                  <div className="text-right space-y-1 min-w-[160px]">
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-[#64748B]">Monto solicitado</span>
                      <span className="font-medium text-[#0F172A]">{formatCLP(d.requested_amount)}</span>
                    </div>
                    {d.agreed_amount != null && d.agreed_amount !== d.requested_amount && (
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-[#64748B]">Contrapropuesta</span>
                        <span className="font-medium text-blue-600">{formatCLP(d.agreed_amount)}</span>
                      </div>
                    )}
                    {d.status === 'approved' && d.agreed_amount != null && (
                      <div className="border-t border-[#E2E8F0] pt-1">
                        <div className="flex justify-between text-sm gap-4">
                          <span className="text-emerald-700 font-medium">Monto acordado</span>
                          <span className="font-bold text-emerald-700">{formatCLP(d.agreed_amount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
