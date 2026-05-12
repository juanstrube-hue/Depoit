import { Card, CardContent } from '@/components/ui/card';
import {
  Activity,
  FileSignature,
  Banknote,
  TrendingUp,
  Bell,
  Clock,
} from 'lucide-react';

const mockTimeline = [
  {
    icon: FileSignature,
    title: 'Contrato firmado',
    description: 'Todas las partes firmaron el contrato de arriendo digitalmente.',
    date: '15 ene 2026',
    color: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    icon: Banknote,
    title: 'Depósito recibido',
    description: 'El depósito de garantía fue recibido y puesto en custodia segura.',
    date: '16 ene 2026',
    color: 'bg-blue-500',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    icon: TrendingUp,
    title: 'Rendimiento generado',
    description: 'Se generaron intereses sobre el depósito en custodia.',
    date: '01 feb 2026',
    color: 'bg-purple-500',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
  },
];

const upcomingFeatures = [
  {
    icon: Clock,
    text: 'Línea de tiempo detallada por contrato',
  },
  {
    icon: Bell,
    text: 'Alertas en tiempo real de cambios',
  },
  {
    icon: Activity,
    text: 'Exportación de reportes de actividad',
  },
];

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Registro de Actividad</h1>
        <p className="text-[#64748B] mt-1">
          Seguimiento completo de todas las acciones en tus contratos
        </p>
      </div>

      {/* Hero card */}
      <Card className="border-[#E2E8F0] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 sm:p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
              Trazabilidad completa
            </h2>
            <p className="text-[#64748B] max-w-md mx-auto leading-relaxed">
              Cada acción en tus contratos queda registrada. Pronto podrás consultar
              el historial completo de actividad desde aquí.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mock timeline */}
      <Card className="border-[#E2E8F0] shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-[#64748B] uppercase tracking-wide mb-6">
            Vista previa del registro
          </h3>
          <div className="space-y-0">
            {mockTimeline.map((item, index) => (
              <div key={item.title} className="flex gap-4 opacity-60">
                <div className="flex flex-col items-center">
                  <div className={`${item.iconBg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  {index < mockTimeline.length - 1 && (
                    <div className="flex-1 w-px bg-[#E2E8F0] my-2 min-h-[24px]" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="font-medium text-[#0F172A]">{item.title}</p>
                  <p className="text-sm text-[#64748B] mt-0.5">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming features */}
      <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#0F172A] mb-4">Próximamente</h3>
          <div className="space-y-3">
            {upcomingFeatures.map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-[#64748B]">{feature.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer note */}
      <p className="text-sm text-gray-400 text-center pb-4">
        El registro detallado de actividad estará disponible próximamente.
      </p>
    </div>
  );
}