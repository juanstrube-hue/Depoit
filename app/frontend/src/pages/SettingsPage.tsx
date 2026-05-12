import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  User,
  Bell,
  Lock,
  SlidersHorizontal,
  Shield,
} from 'lucide-react';

const settingsCategories = [
  {
    icon: User,
    title: 'Perfil',
    description: 'Gestiona tu información personal, RUT y datos de contacto.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Configura cómo y cuándo recibir alertas de tus contratos.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Lock,
    title: 'Seguridad',
    description: 'Autenticación de dos factores, sesiones activas y contraseña.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: SlidersHorizontal,
    title: 'Preferencias',
    description: 'Idioma, formato de moneda, zona horaria y tema visual.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Configuración</h1>
        <p className="text-[#64748B] mt-1">
          Personaliza tu experiencia en Depoit
        </p>
      </div>

      {/* Hero card */}
      <Card className="border-[#E2E8F0] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-8 sm:p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
              Tu cuenta, tu control
            </h2>
            <p className="text-[#64748B] max-w-md mx-auto leading-relaxed">
              Pronto podrás personalizar cada aspecto de tu experiencia en Depoit,
              desde notificaciones hasta seguridad avanzada.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsCategories.map((category) => (
          <Card
            key={category.title}
            className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`${category.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-gray-400 border-gray-200 bg-gray-50 font-normal"
                >
                  Próximamente
                </Badge>
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-1">{category.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust section */}
      <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
        <CardContent className="p-6 flex items-start gap-3">
          <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-[#0F172A] mb-1">Tu privacidad es prioridad</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              En Depoit protegemos tu información con encriptación de nivel bancario.
              Nunca compartimos tus datos con terceros sin tu consentimiento explícito.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer note */}
      <p className="text-sm text-gray-400 text-center pb-4">
        Las opciones de configuración estarán disponibles próximamente.
      </p>
    </div>
  );
}