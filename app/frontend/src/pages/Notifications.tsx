import { useEffect, useState } from 'react';
import { client } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle, AlertCircle, Info, FileText } from 'lucide-react';
import type { Notification } from '@/types';

const typeIcons: Record<string, React.ElementType> = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  contract: FileText,
};

const typeColors: Record<string, string> = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  contract: 'text-purple-500',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await client.entities.notifications.queryAll({});
        setNotifications(response?.data?.items || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Notificaciones</h1>
        <p className="text-[#64748B] mt-1">Mantente al día con la actividad de tus contratos</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-[#E2E8F0]">
          <CardContent className="py-16 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[#64748B] font-medium">No hay notificaciones</p>
            <p className="text-sm text-gray-400 mt-1">
              Las notificaciones aparecerán aquí cuando haya actividad
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const iconColor = typeColors[notif.type] || 'text-gray-500';

            return (
              <Card
                key={notif.id}
                className={`border-[#E2E8F0] shadow-sm transition-colors ${
                  !notif.is_read ? 'bg-blue-50/50 border-blue-100' : ''
                }`}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#0F172A] text-sm">{notif.title}</p>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-[#64748B] mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notif.created_at || '')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}