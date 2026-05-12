import { Card, CardContent } from '@/components/ui/card';
import {
  Wallet as WalletIcon,
  Shield,
  TrendingUp,
  ArrowLeftRight,
  Lock,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Depósitos en custodia',
    description: 'Visualiza el estado de todos tus depósitos de garantía en tiempo real.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'Rendimientos acumulados',
    description: 'Consulta los intereses generados por tus fondos en custodia.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: ArrowLeftRight,
    title: 'Historial de movimientos',
    description: 'Registro detallado de cada transacción asociada a tus contratos.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

const trustPoints = [
  'Fondos protegidos en cuentas segregadas',
  'Auditoría y trazabilidad completa',
  'Cumplimiento normativo chileno',
];

export default function Wallet() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Billetera Digital</h1>
        <p className="text-[#64748B] mt-1">
          Tu billetera digital para gestionar fondos de garantía
        </p>
      </div>

      {/* Hero card */}
      <Card className="border-[#E2E8F0] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8 sm:p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
              <WalletIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
              Tu billetera está casi lista
            </h2>
            <p className="text-[#64748B] max-w-md mx-auto leading-relaxed">
              Estamos preparando una experiencia completa para que puedas gestionar
              tus fondos de garantía de forma segura y transparente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className={`${feature.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-1">{feature.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust section */}
      <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Lock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-[#0F172A] mb-1">Seguridad garantizada</h3>
              <p className="text-sm text-[#64748B]">
                Tus fondos están siempre protegidos con los más altos estándares de seguridad.
              </p>
            </div>
          </div>
          <div className="space-y-2 ml-8">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-[#64748B]">{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer note */}
      <p className="text-sm text-gray-400 text-center pb-4">
        Esta funcionalidad estará disponible próximamente. Tus fondos están siempre protegidos.
      </p>
    </div>
  );
}