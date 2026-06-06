import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import type { Contract } from '@/types';

const CATEGORIES = [
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'pintura', label: 'Pintura' },
  { value: 'daño estructural', label: 'Daño estructural' },
  { value: 'equipamiento', label: 'Equipamiento' },
  { value: 'servicios pendientes', label: 'Servicios pendientes' },
  { value: 'otro', label: 'Otro' },
];

export default function GuaranteeDeductionNew() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    contract_id: '',
    category: '',
    title: '',
    description: '',
    requested_amount: '',
  });

  useEffect(() => {
    client.entities.contracts.queryAll({}).then((res) => {
      setContracts(res?.data?.items || []);
    });
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.contract_id || !form.category || !form.title || !form.requested_amount) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    const amount = parseInt(form.requested_amount, 10);
    if (isNaN(amount) || amount <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await client.entities.guarantee_deductions.create({
        contract_id: parseInt(form.contract_id, 10),
        category: form.category,
        title: form.title,
        description: form.description || undefined,
        requested_amount: amount,
      });
      navigate(`/guarantee-deductions/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al crear la propuesta. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/guarantee-deductions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Nueva propuesta de descuento</h1>
          <p className="text-[#64748B] text-sm mt-0.5">Descuentos garantía</p>
        </div>
      </div>

      <Card className="border-[#E2E8F0]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <ShieldAlert className="h-5 w-5 text-emerald-600" />
            Detalle de la propuesta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contrato */}
            <div className="space-y-1.5">
              <Label htmlFor="contract_id">Contrato <span className="text-red-500">*</span></Label>
              <Select value={form.contract_id} onValueChange={(v) => setForm((f) => ({ ...f, contract_id: v }))}>
                <SelectTrigger id="contract_id">
                  <SelectValue placeholder="Selecciona un contrato" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.property_address} — {c.tenant_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría <span className="text-red-500">*</span></Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="Ej: Limpieza profunda del departamento"
                value={form.title}
                onChange={set('title')}
                maxLength={200}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el daño, incumplimiento o motivo del descuento..."
                value={form.description}
                onChange={set('description')}
                rows={4}
              />
            </div>

            {/* Monto */}
            <div className="space-y-1.5">
              <Label htmlFor="requested_amount">Monto solicitado (CLP) <span className="text-red-500">*</span></Label>
              <Input
                id="requested_amount"
                type="number"
                min={1}
                placeholder="Ej: 150000"
                value={form.requested_amount}
                onChange={set('requested_amount')}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/guarantee-deductions')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Crear propuesta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
