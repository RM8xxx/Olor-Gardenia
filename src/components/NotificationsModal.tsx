import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#1b1b23] border border-[#292932] rounded-3xl overflow-hidden shadow-2xl mt-12 animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#292932] bg-[#16161e]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#f2ca50]" />
            <h3 className="text-sm font-bold text-[#e4e1ed]">Notificaciones</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[10px] text-[#f2ca50] hover:underline"
            >
              Marcar leídas
            </button>
            <button onClick={onClose} className="p-1 text-[#99907c] hover:text-[#e4e1ed]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto space-y-2 divide-y divide-[#292932]/50">
          {notifications.length === 0 ? (
            <p className="text-xs text-center text-[#99907c] py-6">No hay notificaciones pendientes.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#292932] text-[#f2ca50] shrink-0 mt-0.5">
                  {n.type === 'alert' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ffc37b]" />
                  ) : n.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-[#f2ca50]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#e4e1ed]">{n.title}</p>
                  <p className="text-[11px] text-[#99907c] leading-tight mt-0.5">{n.message}</p>
                  <span className="text-[9px] text-[#99907c]/80 font-mono-numbers block mt-1">
                    {n.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
