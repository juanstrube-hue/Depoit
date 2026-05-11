import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { client } from '@/lib/api';
import { formatCLP, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Wallet,
  FileText,
  TrendingUp,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import type { Contract } from '@/types';

export default function Dashboard() {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await client.entities.contracts.queryAll({});
        setContracts(response?.data?.items || []);
      } catch (err) {
        console.error('Error fetching contracts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalDeposits = contracts.reduce((sum, c) => sum + (c.deposit_amount || 0), 0);
  const activeContracts = contracts.filter((c) => c.status === 'active').length;
  const totalYield = contracts.reduce((sum, c) => sum + (c.yield_generated || 0), 0);
  const pendingReturns = contracts.filter((c) => c.status === 'pending').length;

  const roleGreeting = {
    arrendador: 'Resumen de tus propiedades',
    arrendatario: 'Resumen de tus arriendos',
    corredor: 'Resumen de contratos gestionados',
  };

  const metrics = [
    {
      title: 'Total en Custodia',
      value: formatCLP(totalDeposits),
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Contratos Activos',
      value: activeContracts.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Rendimiento Generado',
      value: formatCLP(totalYield),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Devoluciones Pendientes',
      value: pendingReturns.toString(),
      icon: RotateCcw,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-[#64748B] mt-1">{roleGreeting[currentRole]}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-[#64748B]">{metric.title}</p>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold text-[#0F172A]">{metric.value}</p>
                  )}
                </div>
                <div className={`${metric.bg} p-2.5 rounded-lg`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent contracts */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold text-[#0F172A]">
            Contratos Recientes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600 hover:text-emerald-700"
            onClick={() => navigate('/contracts')}
          >
            Ver todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[#64748B]">No hay contratos aún</p>
              <p className="text-sm text-gray-400 mt-1">Los contratos aparecerán aquí cuando se creen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propiedad</TableHead>
                    <TableHead>Arrendatario</TableHead>
                    <TableHead>Depósito</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.slice(0, 5).map((contract) => (
                    <TableRow
                      key={contract.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                    >
                      <TableCell className="font-medium text-[#0F172A]">
                        {contract.property_address}
                      </TableCell>
                      <TableCell className="text-[#64748B]">
                        {contract.tenant_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCLP(contract.deposit_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(contract.status)}>
                          {getStatusLabel(contract.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#64748B]">
                        {formatDate(contract.start_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}