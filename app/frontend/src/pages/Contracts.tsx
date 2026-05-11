import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';
import { formatCLP, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FileText, MapPin, Calendar } from 'lucide-react';
import type { Contract } from '@/types';

export default function Contracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchContracts = async () => {
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
    fetchContracts();
  }, []);

  const filtered = contracts.filter((c) => {
    const matchesSearch =
      !search ||
      c.property_address?.toLowerCase().includes(search.toLowerCase()) ||
      c.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.landlord_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Contratos</h1>
          <p className="text-[#64748B] mt-1">Gestiona todos tus contratos de arriendo</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por dirección, arrendatario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="in_process">En Proceso</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contract list */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-[#E2E8F0]">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[#64748B] font-medium">No se encontraron contratos</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Los contratos aparecerán aquí cuando se creen'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((contract) => (
            <Card
              key={contract.id}
              className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/contracts/${contract.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#0F172A] group-hover:text-emerald-700 transition-colors">
                        {contract.property_address}
                      </h3>
                      <Badge variant="outline" className={getStatusColor(contract.status)}>
                        {getStatusLabel(contract.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {contract.property_city}, {contract.property_region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-[#64748B]">
                        Arrendatario: <span className="text-[#0F172A] font-medium">{contract.tenant_name}</span>
                      </span>
                      <span className="text-[#64748B]">
                        Arrendador: <span className="text-[#0F172A] font-medium">{contract.landlord_name}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#64748B]">Depósito</p>
                    <p className="text-lg font-bold text-[#0F172A]">
                      {formatCLP(contract.deposit_amount)}
                    </p>
                    {contract.yield_generated > 0 && (
                      <p className="text-xs text-emerald-600 font-medium">
                        +{formatCLP(contract.yield_generated)} rendimiento
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