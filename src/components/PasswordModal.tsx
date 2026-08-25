import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { triggerAdminUnlockSuccessHaptic, triggerAdminErrorHaptic } from '../utils/haptics';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFailure: () => void;
  title?: string;
  subtitle?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFailure,
  title = "Acceso Administrativo",
  subtitle = "Introduce la contraseña para acceder a las funciones protegidas."
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPwd = password.trim().toLowerCase();
    if (cleanPwd === 'pepeyfer' || cleanPwd === 'ferypepe') {
      localStorage.setItem('gardenia_business_auth_until', String(Date.now() + 24 * 60 * 60 * 1000));
      setPassword('');
      setError(false);
      triggerAdminUnlockSuccessHaptic();
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      triggerAdminErrorHaptic();
      onClose();
      onFailure();
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none animate-fadeIn">
      <div 
        className="relative w-full max-w-sm bg-[#13131b] border border-[#f2ca50]/40 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1b1b23] text-[#99907c] hover:text-[#f2ca50] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EAB308]/15 border border-[#EAB308]/40 text-[#EAB308] flex items-center justify-center mb-3 shadow-lg shadow-[#EAB308]/10">
            <Lock className="w-7 h-7 text-[#EAB308]" />
          </div>
          <span className="px-3 py-1 rounded-full bg-[#EAB308]/15 border border-[#EAB308]/40 text-xs font-black text-[#EAB308] uppercase tracking-wider">
            {title}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#e4e1ed] font-display-friendly">
            Clave de Seguridad
          </h3>
          <p className="text-xs text-[#99907c]">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••••"
              autoFocus
              maxLength={20}
              className="w-full px-4 py-3 text-center text-lg tracking-widest bg-[#1b1b23] border border-[#292932] focus:border-[#f2ca50] rounded-xl text-[#f2ca50] font-mono outline-none transition-colors"
            />
            {error && (
              <p className="text-[11px] text-red-400 mt-1.5 font-medium">
                Contraseña incorrecta. Acceso denegado.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#f2ca50] via-[#e5b93b] to-[#a37c15] text-[#13131b] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#f2ca50]/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Verificar Acceso</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1b1b23] hover:bg-[#252533] border border-[#292932] text-[#99907c] hover:text-[#e4e1ed] font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
