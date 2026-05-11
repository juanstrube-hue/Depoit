import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Lock, TrendingUp, Users } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Shield className="h-9 w-9 text-emerald-400" />
          <span className="text-2xl font-bold text-white">Depoit</span>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Custodia digital de<br />
            garantías de arriendo
          </h1>
          <p className="text-lg text-gray-300 max-w-md">
            La plataforma más segura para administrar depósitos de arriendo en Chile.
            Transparencia total para arrendadores, arrendatarios y corredores.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <Lock className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-white">Custodia Segura</p>
              <p className="text-xs text-gray-400 mt-1">Fondos protegidos y auditados</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <TrendingUp className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-white">Rendimiento</p>
              <p className="text-xs text-gray-400 mt-1">Tu depósito genera intereses</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <Users className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-white">Multi-actor</p>
              <p className="text-xs text-gray-400 mt-1">Todos los participantes conectados</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <Shield className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-white">Transparencia</p>
              <p className="text-xs text-gray-400 mt-1">Trazabilidad completa</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          © 2026 Depoit. Todos los derechos reservados.
        </p>
      </div>

      {/* Right panel - login */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold text-[#0F172A]">Depoit</span>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#0F172A]">
                Bienvenido a Depoit
              </h2>
              <p className="text-[#64748B]">
                Inicia sesión para gestionar tus garantías de arriendo
              </p>
            </div>

            <Button
              onClick={login}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              Iniciar Sesión
            </Button>

            <div className="text-center">
              <p className="text-xs text-[#64748B]">
                Al continuar, aceptas nuestros{' '}
                <span className="text-emerald-600 hover:underline cursor-pointer">
                  Términos de Servicio
                </span>{' '}
                y{' '}
                <span className="text-emerald-600 hover:underline cursor-pointer">
                  Política de Privacidad
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}