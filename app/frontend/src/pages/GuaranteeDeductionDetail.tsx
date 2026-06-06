import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';
import { formatCLP, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileImage,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import type {
  GuaranteeDeduction,
  GuaranteeDeductionEvent,
  GuaranteeDeductionFile,
  Contract,
} from '@/types';

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

const EVENT_LABEL: Record<string, string> = {
  created: 'Propuesta creada',
  accepted: 'Propuesta aceptada',
  rejected: 'Propuesta rechazada',
  counter_proposed: 'Contrapropuesta enviada',
  cancelled: 'Propuesta cancelada',
};

const EVENT_ICON: Record<string, React.ReactNode> = {
  created: <ShieldAlert className="h-4 w-4 text-blue-500" />,
  accepted: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  counter_proposed: <MessageSquare className="h-4 w-4 text-yellow-500" />,
  cancelled: <XCircle className="h-4 w-4 text-gray-400" />,
};

const CATEGORY_LABEL: Record<string, string> = {
  limpieza: 'Limpieza',
  pintura: 'Pintura',
  'daño estructural': 'Daño estructural',
  equipamiento: 'Equipamiento',
  'servicios pendientes': 'Servicios pendientes',
  otro: 'Otro',
};

export default function GuaranteeDeductionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  const [deduction, setDeduction] = useState<GuaranteeDeduction | null>(null);
  const [events, setEvents] = useState<GuaranteeDeductionEvent[]>([]);
  const [files, setFiles] = useState<GuaranteeDeductionFile[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterComment, setCounterComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadAll = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [dRes, eRes, fRes] = await Promise.all([
        client.entities.guarantee_deductions.getById({ id: Number(id) }),
        client.entities.guarantee_deductions.getEvents({ id: Number(id) }),
        client.entities.guarantee_deductions.getFiles({ id: Number(id) }),
      ]);
      const d: GuaranteeDeduction = dRes?.data;
      setDeduction(d);
      setEvents(eRes?.data || []);
      setFiles(fRes?.data || []);

      if (d?.contract_id) {
        const cRes = await client.entities.contracts.getById({ id: d.contract_id });
        setContract(cRes?.data || null);
      }
    } catch (err) {
      console.error('Error cargando detalle:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const doAction = async (action: () => Promise<void>) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await action();
      await loadAll();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || 'Error al procesar la acción.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = () =>
    doAction(async () => {
      await client.entities.guarantee_deductions.accept({ id: Number(id) });
    });

  const handleReject = () =>
    doAction(async () => {
      await client.entities.guarantee_deductions.reject({
        id: Number(id),
        body: { comment: rejectComment || undefined },
      });
      setShowReject(false);
      setRejectComment('');
    });

  const handleCounter = () =>
    doAction(async () => {
      const amount = parseInt(counterAmount, 10);
      if (isNaN(amount) || amount <= 0) throw new Error('Monto inválido');
      await client.entities.guarantee_deductions.counter_propose({
        id: Number(id),
        body: { new_amount: amount, comment: counterComment || undefined },
      });
      setShowCounter(false);
      setCounterAmount('');
      setCounterComment('');
    });

  const handleCancel = () =>
    doAction(async () => {
      await client.entities.guarantee_deductions.cancel({ id: Number(id) });
    });

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!deduction) {
    return (
      <div className="text-center py-16 text-[#64748B]">
        Descuento garantía no encontrado.
      </div>
    );
  }

  const isActive = deduction.status === 'pending' || deduction.status === 'negotiating';
  const isArrendador = currentRole === 'arrendador';
  const isArrendatario = currentRole === 'arrendatario';
  const displayAmount = deduction.agreed_amount ?? deduction.requested_amount;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/guarantee-deductions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[#0F172A] truncate">{deduction.title}</h1>
            <Badge variant="outline" className={STATUS_COLOR[deduction.status]}>
              {STATUS_LABEL[deduction.status]}
            </Badge>
          </div>
          <p className="text-sm text-[#64748B] mt-0.5">
            {contract?.property_address || `Contrato #${deduction.contract_id}`}
          </p>
        </div>
      </div>

      {/* Detalle */}
      <Card className="border-[#E2E8F0]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#0F172A]">Detalle de la propuesta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#64748B]">Categoría</p>
              <p className="font-medium text-[#0F172A] mt-0.5">
                {CATEGORY_LABEL[deduction.category] || deduction.category}
              </p>
            </div>
            <div>
              <p className="text-[#64748B]">Fecha de creación</p>
              <p className="font-medium text-[#0F172A] mt-0.5">{formatDate(deduction.created_at || '')}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Monto solicitado</p>
              <p className="font-medium text-[#0F172A] mt-0.5">{formatCLP(deduction.requested_amount)}</p>
            </div>
            {deduction.agreed_amount != null && (
              <div>
                <p className="text-[#64748B]">
                  {deduction.status === 'approved' ? 'Monto acordado' : 'Contrapropuesta actual'}
                </p>
                <p className={`font-bold mt-0.5 ${deduction.status === 'approved' ? 'text-emerald-700' : 'text-blue-600'}`}>
                  {formatCLP(deduction.agreed_amount)}
                </p>
              </div>
            )}
          </div>

          {deduction.description && (
            <div>
              <p className="text-[#64748B] text-sm">Descripción</p>
              <p className="text-sm text-[#0F172A] mt-1 bg-slate-50 rounded-lg p-3 border border-[#E2E8F0]">
                {deduction.description}
              </p>
            </div>
          )}

          {/* Resumen devolución si aprobado */}
          {deduction.status === 'approved' && contract && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-emerald-800">Impacto en devolución de garantía</p>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">Garantía en custodia</span>
                <span className="font-medium">{formatCLP(contract.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">Este descuento aprobado</span>
                <span className="font-medium text-red-600">-{formatCLP(deduction.agreed_amount || 0)}</span>
              </div>
              <div className="border-t border-emerald-300 pt-2 flex justify-between text-sm font-bold text-emerald-800">
                <span>Monto a devolver</span>
                <span>{formatCLP(contract.deposit_amount - (deduction.agreed_amount || 0))}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidencias */}
      {files.length > 0 && (
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <FileImage className="h-4 w-4 text-emerald-600" />
              Evidencias adjuntas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((f) => (
                <a
                  key={f.id}
                  href={f.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  <FileImage className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{f.file_type || 'Archivo'} #{f.id}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      {isActive && (
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#0F172A]">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            {/* Arrendatario: aceptar / rechazar / contraproponerr */}
            {isArrendatario && (
              <>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleAccept}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceptar propuesta
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => { setShowCounter(!showCounter); setShowReject(false); }}
                    disabled={actionLoading}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Realizar contrapropuesta
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => { setShowReject(!showReject); setShowCounter(false); }}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>

                {showCounter && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-blue-800">Contrapropuesta</p>
                    <div className="space-y-1.5">
                      <Label htmlFor="counter_amount" className="text-sm">Nuevo monto (CLP)</Label>
                      <Input
                        id="counter_amount"
                        type="number"
                        min={1}
                        placeholder="Ej: 80000"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="counter_comment" className="text-sm">Comentario (opcional)</Label>
                      <Textarea
                        id="counter_comment"
                        placeholder="Explica tu propuesta..."
                        rows={2}
                        value={counterComment}
                        onChange={(e) => setCounterComment(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCounter} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Enviar contrapropuesta
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowCounter(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {showReject && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-red-800">Rechazar propuesta</p>
                    <div className="space-y-1.5">
                      <Label htmlFor="reject_comment" className="text-sm">Motivo (opcional)</Label>
                      <Textarea
                        id="reject_comment"
                        placeholder="Indica el motivo del rechazo..."
                        rows={2}
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white">
                        Confirmar rechazo
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Arrendador: cancelar */}
            {isArrendador && (
              <Button
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar propuesta
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline de negociación */}
      <Card className="border-[#E2E8F0]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            Historial de negociación
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-[#64748B]">Sin eventos registrados.</p>
          ) : (
            <ol className="relative border-l border-[#E2E8F0] space-y-6 ml-2">
              {events.map((ev) => (
                <li key={ev.id} className="ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#E2E8F0] ring-4 ring-white">
                    {EVENT_ICON[ev.event_type] || <Clock className="h-3 w-3 text-gray-400" />}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {EVENT_LABEL[ev.event_type] || ev.event_type}
                    </p>
                    {ev.proposed_amount != null && (
                      <p className="text-sm text-[#64748B]">
                        Monto: <span className="font-medium text-[#0F172A]">{formatCLP(ev.proposed_amount)}</span>
                        {ev.previous_amount != null && ev.previous_amount !== ev.proposed_amount && (
                          <span className="text-gray-400 ml-1">(antes: {formatCLP(ev.previous_amount)})</span>
                        )}
                      </p>
                    )}
                    {ev.comment && (
                      <p className="text-sm text-[#64748B] italic">{ev.comment}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(ev.created_at || '')}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
