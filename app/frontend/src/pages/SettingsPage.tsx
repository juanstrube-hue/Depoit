import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Settings,
  User,
  Bell,
  Lock,
  SlidersHorizontal,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type ExpandedCard = 'perfil' | 'notificaciones' | 'seguridad' | 'preferencias' | null;

const settingsCategories = [
  {
    id: 'perfil' as const,
    icon: User,
    title: 'Perfil',
    description: 'Gestiona tu información personal, RUT y datos de contacto.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'notificaciones' as const,
    icon: Bell,
    title: 'Notificaciones',
    description: 'Configura cómo y cuándo recibir alertas de tus contratos.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'seguridad' as const,
    icon: Lock,
    title: 'Seguridad',
    description: 'Autenticación de dos factores, sesiones activas y contraseña.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: 'preferencias' as const,
    icon: SlidersHorizontal,
    title: 'Preferencias',
    description: 'Idioma, formato de moneda, zona horaria y tema visual.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
        on ? 'bg-emerald-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          on ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </div>
  );
}

function ExpandedPerfil() {
  return (
    <div className="space-y-3 pt-4 border-t border-[#E2E8F0] mt-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#64748B]">Nombre completo</label>
        <Input disabled value="María González Pérez" className="h-9 bg-gray-50 text-sm" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#64748B]">RUT</label>
        <Input disabled value="12.345.678-9" className="h-9 bg-gray-50 text-sm" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#64748B]">Teléfono</label>
        <Input disabled value="+56 9 1234 5678" className="h-9 bg-gray-50 text-sm" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#64748B]">Correo</label>
        <Input disabled value="maria.gonzalez@ejemplo.cl" className="h-9 bg-gray-50 text-sm" />
      </div>
      <p className="text-xs text-[#64748B] italic pt-2">Los cambios estarán habilitados próximamente</p>
    </div>
  );
}

function ExpandedNotificaciones() {
  return (
    <div className="space-y-3 pt-4 border-t border-[#E2E8F0] mt-4">
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#0F172A]">Correo electrónico</span>
        <Toggle on={true} />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#0F172A]">Notificaciones push</span>
        <Toggle on={true} />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#0F172A]">SMS</span>
        <Toggle on={true} />
      </div>
      <p className="text-xs text-[#64748B] italic pt-2">Los cambios estarán habilitados próximamente</p>
    </div>
  );
}

function ExpandedSeguridad() {
  return (
    <div className="space-y-3 pt-4 border-t border-[#E2E8F0] mt-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#64748B]">Contraseña actual</label>
        <Input disabled type="password" value="••••••••••••" className="h-9 bg-gray-50 text-sm" />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#0F172A]">Autenticación de dos factores</span>
        <Toggle on={false} />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#64748B]">Sesiones activas</span>
        <span className="text-sm font-medium text-[#0F172A]">1 dispositivo</span>
      </div>
      <p className="text-xs text-[#64748B] italic pt-2">Los cambios estarán habilitados próximamente</p>
    </div>
  );
}

function ExpandedPreferencias() {
  return (
    <div className="space-y-3 pt-4 border-t border-[#E2E8F0] mt-4">
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#64748B]">Idioma</span>
        <span className="text-sm font-medium text-[#0F172A]">Español</span>
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#64748B]">Moneda</span>
        <span className="text-sm font-medium text-[#0F172A]">CLP</span>
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-[#64748B]">Zona horaria</span>
        <span className="text-sm font-medium text-[#0F172A]">America/Santiago</span>
      </div>
      <p className="text-xs text-[#64748B] italic pt-2">Los cambios estarán habilitados próximamente</p>
    </div>
  );
}

export default function SettingsPage() {
  const [expandedCard, setExpandedCard] = useState<ExpandedCard>(null);

  const toggleCard = (id: ExpandedCard) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  const renderExpanded = (id: ExpandedCard) => {
    switch (id) {
      case 'perfil':
        return <ExpandedPerfil />;
      case 'notificaciones':
        return <ExpandedNotificaciones />;
      case 'seguridad':
        return <ExpandedSeguridad />;
      case 'preferencias':
        return <ExpandedPreferencias />;
      default:
        return null;
    }
  };

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
              Personaliza cada aspecto de tu experiencia en Depoit,
              desde notificaciones hasta seguridad avanzada.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsCategories.map((category) => {
          const isExpanded = expandedCard === category.id;
          return (
            <Card
              key={category.title}
              className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              tabIndex={0}
              onClick={() => toggleCard(category.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCard(category.id);
                }
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${category.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-1">{category.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {category.description}
                </p>
                {isExpanded && renderExpanded(category.id)}
              </CardContent>
            </Card>
          );
        })}
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
    </div>
  );
}