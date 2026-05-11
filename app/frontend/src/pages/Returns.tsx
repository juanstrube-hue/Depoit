import { useEffect, useState } from 'react';
import { client } from '@/lib/api';
import { formatCLP, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw } from 'lucide-react';
import type { DepositReturn, Contract } from '@/types';

export default function Returns() {
  const [returns, setReturns] = useState<DepositReturn[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [returnsRes, contractsRes] = await Promise.all([
          client.entities.deposit_returns.queryAll({}),
          client.entities.contracts.queryAll({}),
        ]);
        setReturns(returnsRes?.data?.items || []);
        setContracts(contractsRes?.data?.items || []);
      } catch (err) {
        console.error('Error fetching returns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getContractAddress = (contractId: number) => {
    const c = contracts.find((ct) => ct.id === contractId);
    return c?.property_address || `Contrato #${contractId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Devoluciones</h1>
        <p className="text-[#64748B] mt-1">Solicitudes de devolución de depósitos</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <Card className="border-[#E2E8F0]">
          <CardContent className="py-16 text-center">
            <RotateCcw className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[#64748B] font-medium">No hay devoluciones</p>
            <p className="text-sm text-gray-400 mt-1">
              Las solicitudes de devolución aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {returns.map((ret) => (
            <Card key={ret.id} className="border-[#E2E8F0] shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#0F172A]">
                        {getContractAddress(ret.contract_id)}
                      </h3>
                      <Badge variant="outline" className={getStatusColor(ret.status)}>
                        {getStatusLabel(ret.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#64748B]">
                      Iniciado por: {ret.initiated_by}
                    </p>
                    {ret.notes && (
                      <p className="text-sm text-[#64748B] italic">"{ret.notes}"</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatDate(ret.created_at || '')}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-[#64748B]">Monto a devolver</p>
                    <p className="text-xl font-bold text-[#0F172A]">
                      {formatCLP(ret.amount_returned)}
                    </p>
                    {ret.total_deductions > 0 && (
                      <p className="text-sm text-red-500">
                        Deducciones: -{formatCLP(ret.total_deductions)}
                      </p>
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