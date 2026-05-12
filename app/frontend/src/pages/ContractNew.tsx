import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Home,
  Users,
  Banknote,
  PenTool,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Eye,
  CheckCircle,
  ArrowRight,
  Calendar,
  Mail,
  Building2,
  User,
  Briefcase,
  FileText,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { client } from '@/lib/api';
import { formatCLP } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FormData {
  // Step 1 — Property
  property_address: string;
  property_city: string;
  property_region: string;
  property_type: string;
  // Step 2 — Participants
  landlord_name: string;
  landlord_email: string;
  tenant_name: string;
  tenant_email: string;
  broker_name: string;
  broker_email: string;
  // Step 3 — Financial
  rent_amount: string;
  deposit_amount: string;
  start_date: string;
  end_date: string;
}

interface StepProps {
  form: FormData;
  updateField: (field: keyof FormData, value: string) => void;
}

interface SignatureStepProps extends StepProps {
  signed: boolean;
  setSigned: (v: boolean) => void;
  userEmail: string;
}

interface StepperProps {
  currentStep: number;
  completed: boolean;
}

const initialFormData: FormData = {
  property_address: '',
  property_city: '',
  property_region: '',
  property_type: '',
  landlord_name: '',
  landlord_email: '',
  tenant_name: '',
  tenant_email: '',
  broker_name: '',
  broker_email: '',
  rent_amount: '',
  deposit_amount: '',
  start_date: '',
  end_date: '',
};

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */
const steps = [
  { id: 1, label: 'Propiedad', icon: Home },
  { id: 2, label: 'Participantes', icon: Users },
  { id: 3, label: 'Términos', icon: Banknote },
  { id: 4, label: 'Firma', icon: PenTool },
  { id: 5, label: 'Custodia', icon: Shield },
];

const regions = [
  'Región Metropolitana',
  'Valparaíso',
  'Biobío',
  'Araucanía',
  'Los Lagos',
  'O\'Higgins',
  'Maule',
  'Coquimbo',
  'Antofagasta',
  'Tarapacá',
  'Atacama',
  'Los Ríos',
  'Aysén',
  'Magallanes',
  'Arica y Parinacota',
  'Ñuble',
];

const propertyTypes = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'local_comercial', label: 'Local Comercial' },
  { value: 'bodega', label: 'Bodega' },
];

/* ------------------------------------------------------------------ */
/*  TrustBadge (extracted)                                             */
/* ------------------------------------------------------------------ */
function TrustBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-emerald-600 mt-4">
      <Lock className="h-3.5 w-3.5" />
      <span>{text}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stepper (extracted)                                                */
/* ------------------------------------------------------------------ */
function Stepper({ currentStep, completed }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep || completed;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-2'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium hidden sm:block ${
                  isActive ? 'text-emerald-700' : isDone ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                  step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Property (extracted)                                      */
/* ------------------------------------------------------------------ */
function StepProperty({ form, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <Home className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A]">¿Dónde está la propiedad?</h2>
        <p className="text-[#64748B] mt-1 max-w-sm mx-auto">
          Comencemos con los datos de la propiedad que será arrendada.
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label className="text-[#0F172A] font-medium">Dirección de la propiedad</Label>
          <Input
            placeholder="Ej: Av. Providencia 1234, Depto 501"
            value={form.property_address}
            onChange={(e) => updateField('property_address', e.target.value)}
            className="h-11 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-medium">Comuna</Label>
            <Input
              placeholder="Ej: Providencia"
              value={form.property_city}
              onChange={(e) => updateField('property_city', e.target.value)}
              className="h-11 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-medium">Región</Label>
            <Select value={form.property_region} onValueChange={(v) => updateField('property_region', v)}>
              <SelectTrigger className="h-11 border-[#E2E8F0]">
                <SelectValue placeholder="Seleccionar región" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[#0F172A] font-medium">Tipo de propiedad</Label>
          <Select value={form.property_type} onValueChange={(v) => updateField('property_type', v)}>
            <SelectTrigger className="h-11 border-[#E2E8F0]">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((pt) => (
                <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TrustBadge text="La información de la propiedad se almacena de forma segura y encriptada." />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Participants (extracted)                                   */
/* ------------------------------------------------------------------ */
function StepParticipants({ form, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <Users className="h-7 w-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A]">¿Quiénes participan?</h2>
        <p className="text-[#64748B] mt-1 max-w-sm mx-auto">
          Identifica a las partes del contrato. Les enviaremos una invitación por correo.
        </p>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        {/* Landlord */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Building2 className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-[#0F172A]">Arrendador</p>
                <p className="text-xs text-[#64748B]">Propietario de la propiedad</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-[#64748B]">Nombre completo</Label>
                <Input
                  placeholder="Nombre del arrendador"
                  value={form.landlord_name}
                  onChange={(e) => updateField('landlord_name', e.target.value)}
                  className="h-10 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[#64748B]">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.cl"
                    value={form.landlord_email}
                    onChange={(e) => updateField('landlord_email', e.target.value)}
                    className="h-10 pl-9 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenant */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-[#0F172A]">Arrendatario</p>
                <p className="text-xs text-[#64748B]">Quien arrienda la propiedad</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-[#64748B]">Nombre completo</Label>
                <Input
                  placeholder="Nombre del arrendatario"
                  value={form.tenant_name}
                  onChange={(e) => updateField('tenant_name', e.target.value)}
                  className="h-10 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[#64748B]">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.cl"
                    value={form.tenant_email}
                    onChange={(e) => updateField('tenant_email', e.target.value)}
                    className="h-10 pl-9 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Broker (optional) */}
        <Card className="border-dashed border-[#E2E8F0] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Briefcase className="h-4.5 w-4.5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#0F172A]">Corredor</p>
                <p className="text-xs text-[#64748B]">Intermediario (opcional)</p>
              </div>
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-200 bg-gray-50 font-normal">
                Opcional
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-[#64748B]">Nombre completo</Label>
                <Input
                  placeholder="Nombre del corredor"
                  value={form.broker_name}
                  onChange={(e) => updateField('broker_name', e.target.value)}
                  className="h-10 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-[#64748B]">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.cl"
                    value={form.broker_email}
                    onChange={(e) => updateField('broker_email', e.target.value)}
                    className="h-10 pl-9 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TrustBadge text="Las invitaciones se envían de forma segura. Solo las partes autorizadas tendrán acceso." />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Financial (extracted)                                     */
/* ------------------------------------------------------------------ */
function StepFinancial({ form, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <Banknote className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A]">Términos financieros</h2>
        <p className="text-[#64748B] mt-1 max-w-sm mx-auto">
          Define los montos y fechas del contrato. Todo queda registrado de forma transparente.
        </p>
      </div>

      <div className="space-y-5 max-w-lg mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-medium">Arriendo mensual (CLP)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <Input
                type="number"
                placeholder="650.000"
                value={form.rent_amount}
                onChange={(e) => updateField('rent_amount', e.target.value)}
                className="h-11 pl-7 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-medium">Depósito de garantía (CLP)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <Input
                type="number"
                placeholder="650.000"
                value={form.deposit_amount}
                onChange={(e) => updateField('deposit_amount', e.target.value)}
                className="h-11 pl-7 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-medium">Fecha de inicio</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                className="h-11 pl-9 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#0F172A] font-medium">Fecha de término</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                className="h-11 pl-9 border-[#E2E8F0] focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Summary preview */}
        {form.rent_amount && form.deposit_amount && (
          <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-emerald-800 mb-2">Resumen financiero</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Arriendo mensual</span>
                  <span className="font-medium text-[#0F172A]">{formatCLP(parseInt(form.rent_amount) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Depósito en custodia</span>
                  <span className="font-medium text-[#0F172A]">{formatCLP(parseInt(form.deposit_amount) || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <TrustBadge text="Los montos se registran en CLP. El depósito será custodiado de forma segura." />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Signature (extracted)                                     */
/* ------------------------------------------------------------------ */
function StepSignature({ form, signed, setSigned, userEmail }: SignatureStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <PenTool className="h-7 w-7 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A]">Firma digital</h2>
        <p className="text-[#64748B] mt-1 max-w-sm mx-auto">
          Revisa los detalles y confirma tu firma digital para formalizar el contrato.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-5">
        {/* Contract summary */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardContent className="p-5 space-y-4">
            <p className="text-sm font-medium text-[#64748B] uppercase tracking-wide">Resumen del contrato</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Home className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{form.property_address}</p>
                  <p className="text-xs text-[#64748B]">{form.property_city}, {form.property_region}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#0F172A]">
                    <span className="font-medium">{form.landlord_name}</span>
                    <span className="text-[#64748B]"> → </span>
                    <span className="font-medium">{form.tenant_name}</span>
                  </p>
                  {form.broker_name && (
                    <p className="text-xs text-[#64748B]">Corredor: {form.broker_name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Banknote className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#0F172A]">
                    Arriendo: <span className="font-medium">{formatCLP(parseInt(form.rent_amount) || 0)}</span>
                    {' · '}
                    Depósito: <span className="font-medium">{formatCLP(parseInt(form.deposit_amount) || 0)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#0F172A]">
                  {form.start_date} — {form.end_date}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature area */}
        <Card className={`border-2 transition-colors shadow-sm ${signed ? 'border-emerald-300 bg-emerald-50/30' : 'border-dashed border-[#E2E8F0]'}`}>
          <CardContent className="p-6 text-center">
            {signed ? (
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-700">Firma confirmada</p>
                  <p className="text-sm text-[#64748B] mt-1">
                    Firmado por {userEmail || 'usuario'} · {new Date().toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <PenTool className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">Confirma tu firma digital</p>
                  <p className="text-sm text-[#64748B] mt-1">
                    Al firmar, aceptas los términos del contrato y autorizas la custodia del depósito.
                  </p>
                </div>
                <Button
                  onClick={() => setSigned(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Firmar digitalmente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal note */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100">
          <Eye className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#64748B] leading-relaxed">
            Tu firma digital tiene validez legal según la Ley 19.799 de Chile. Todas las firmas quedan
            registradas con marca de tiempo y son verificables por todas las partes del contrato.
          </p>
        </div>
      </div>

      <TrustBadge text="Firma protegida con encriptación de nivel bancario. Trazabilidad completa." />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 5 — Custody (extracted)                                       */
/* ------------------------------------------------------------------ */
function StepCustody({ form }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <Shield className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A]">Custodia del depósito</h2>
        <p className="text-[#64748B] mt-1 max-w-sm mx-auto">
          El depósito será resguardado en una cuenta de custodia segura e independiente.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-5">
        {/* Deposit summary */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-[#64748B] mb-1">Depósito a custodiar</p>
            <p className="text-3xl font-bold text-[#0F172A]">
              {formatCLP(parseInt(form.deposit_amount) || 0)}
            </p>
            <p className="text-sm text-emerald-600 mt-2 flex items-center justify-center gap-1.5">
              <Shield className="h-4 w-4" />
              Custodia segura activada
            </p>
          </CardContent>
        </Card>

        {/* Security features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Lock, text: 'Cuenta segregada', desc: 'Fondos separados del operador' },
            { icon: Eye, text: 'Transparencia total', desc: 'Visible para todas las partes' },
            { icon: Shield, text: 'Protección garantizada', desc: 'Respaldado por regulación' },
            { icon: FileText, text: 'Trazabilidad', desc: 'Registro de cada movimiento' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <item.icon className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{item.text}</p>
                <p className="text-xs text-[#64748B]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Simulated payment */}
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-[#64748B] uppercase tracking-wide mb-3">Simulación de pago</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Depósito de garantía</span>
                <span className="font-medium text-[#0F172A]">{formatCLP(parseInt(form.deposit_amount) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Comisión Depoit</span>
                <span className="font-medium text-emerald-600">$0 CLP</span>
              </div>
              <div className="border-t border-[#E2E8F0] pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#0F172A]">Total</span>
                  <span className="font-bold text-[#0F172A]">{formatCLP(parseInt(form.deposit_amount) || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TrustBadge text="El depósito queda protegido desde el momento de la transferencia." />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function ContractNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(form.property_address && form.property_city && form.property_region && form.property_type);
      case 2:
        return !!(form.landlord_name && form.landlord_email && form.tenant_name && form.tenant_email);
      case 3:
        return !!(form.rent_amount && form.deposit_amount && form.start_date && form.end_date);
      case 4:
        return signed;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await client.entities.contracts.create({
        landlord_name: form.landlord_name,
        landlord_email: form.landlord_email,
        tenant_name: form.tenant_name,
        tenant_email: form.tenant_email,
        broker_name: form.broker_name || '',
        broker_email: form.broker_email || '',
        property_address: form.property_address,
        property_city: form.property_city,
        property_region: form.property_region,
        property_type: form.property_type,
        rent_amount: parseInt(form.rent_amount) || 0,
        deposit_amount: parseInt(form.deposit_amount) || 0,
        start_date: form.start_date,
        end_date: form.end_date,
        status: 'active',
        yield_generated: 0,
        signed_at: new Date().toISOString(),
        deposit_received_at: new Date().toISOString(),
      });
      setCompleted(true);
    } catch (err) {
      console.error('Error creating contract:', err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Success screen                                                   */
  /* ---------------------------------------------------------------- */
  if (completed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-lg w-full text-center space-y-8 px-4">
          {/* Success icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">¡Contrato creado exitosamente!</h1>
            <p className="text-[#64748B] max-w-sm mx-auto">
              El contrato ha sido formalizado y el depósito está ahora bajo custodia segura de Depoit.
            </p>
          </div>

          {/* Timeline preview */}
          <Card className="border-[#E2E8F0] shadow-sm text-left">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-[#64748B] uppercase tracking-wide mb-4">
                Próximos pasos
              </p>
              <div className="space-y-0">
                {[
                  { icon: Send, text: 'Invitaciones enviadas', desc: 'Los participantes recibirán un correo para unirse.', done: true },
                  { icon: PenTool, text: 'Firmas pendientes', desc: 'Todas las partes deben confirmar su firma digital.', done: true },
                  { icon: Shield, text: 'Custodia activada', desc: 'El depósito está protegido en cuenta segregada.', done: true },
                  { icon: Clock, text: 'Seguimiento activo', desc: 'Recibirás notificaciones sobre el estado del contrato.', done: false },
                ].map((item, i, arr) => (
                  <div key={item.text} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.done ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <item.icon className={`h-4 w-4 ${item.done ? 'text-emerald-600' : 'text-gray-400'}`} />
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`flex-1 w-px my-1 min-h-[16px] ${item.done ? 'bg-emerald-200' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${item.done ? 'text-[#0F172A]' : 'text-gray-400'}`}>
                        {item.text}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/contracts')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Ver mis contratos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-[#E2E8F0]"
            >
              Volver al Dashboard
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            Contrato registrado el {new Date().toLocaleDateString('es-CL')} · Custodia activa · Trazabilidad completa
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepProperty form={form} updateField={updateField} />;
      case 2: return <StepParticipants form={form} updateField={updateField} />;
      case 3: return <StepFinancial form={form} updateField={updateField} />;
      case 4: return <StepSignature form={form} updateField={updateField} signed={signed} setSigned={setSigned} userEmail={user?.email || ''} />;
      case 5: return <StepCustody form={form} updateField={updateField} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Back to contracts */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/contracts')}
        className="text-[#64748B] hover:text-[#0F172A] mb-6 -ml-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a contratos
      </Button>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Nuevo Contrato</h1>
        <p className="text-[#64748B] mt-1">Crea un contrato de arriendo en minutos</p>
      </div>

      {/* Stepper */}
      <Stepper currentStep={currentStep} completed={completed} />

      {/* Step content */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-6 sm:p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="border-[#E2E8F0] text-[#64748B]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <span className="text-sm text-[#64748B]">
          Paso {currentStep} de 5
        </span>

        {currentStep < 5 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Confirmar y custodiar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}