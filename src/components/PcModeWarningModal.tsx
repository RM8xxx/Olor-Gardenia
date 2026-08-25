import React, { useEffect } from 'react';
import { Laptop, Store, Smartphone, ShieldCheck, Lock, X, ChevronRight } from 'lucide-react';
import { GardeniaIcon } from './LotusIcon';
import { triggerAdminAccessHaptic, triggerAdminActionHaptic } from '../utils/haptics';

interface PcModeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPcMode: () => void;
  onSelectBusinessMode: () => void;
}

export const PcModeWarningModal: React.FC<PcModeWarningModalProps> = ({
  isOpen,
  onClose,
  onSelectPcMode,
  onSelectBusinessMode
}) => {
  useEffect(() => {
    if (isOpen) {
      triggerAdminAccessHaptic();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-4 select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#13131b] border border-[#f2ca50]/40 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 text-center animate-slide-up space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close top button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1b1b23] text-[#99907c] hover:text-[#f2ca50] transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Badge */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f2ca50] via-[#e5b93b] to-[#a37c15] p-0.5 shadow-lg shadow-[#f2ca50]/25 mb-2.5">
            <div className="w-full h-full bg-[#13131b] rounded-[14px] flex items-center justify-center p-2">
              <GardeniaIcon className="w-full h-full text-[#f2ca50]" />
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[11px] font-black text-[#f2ca50] uppercase tracking-widest">
            Panel de Administrador
          </span>
          <h3 className="text-lg font-bold text-[#e4e1ed] font-display-friendly mt-1.5">
            Opciones de Gestión
          </h3>
          <p className="text-xs text-[#99907c] max-w-xs">
            Selecciona la modalidad a la que deseas acceder:
          </p>
        </div>

        {/* The 3 Main Options */}
        <div className="space-y-2.5 pt-1 text-left">
          {/* Option 1: Modo Negocio (Con Contraseña) */}
          <button
            type="button"
            onClick={() => {
              triggerAdminActionHaptic();
              onClose();
              onSelectBusinessMode();
            }}
            id="admin-option-business-mode-btn"
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#1c1a14] to-[#252115] hover:from-[#262217] hover:to-[#332b1a] border-2 border-[#EAB308]/60 hover:border-[#EAB308] text-left transition-all group cursor-pointer flex items-center justify-between gap-3 shadow-md shadow-[#EAB308]/10 active:scale-98"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#EAB308]/20 border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 text-[#EAB308]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-[#f6d77e] group-hover:text-white transition-colors">
                    1. Modo Negocio
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-[#EAB308]/20 border border-[#EAB308]/40 text-[9px] font-bold text-[#EAB308]">
                    <Lock className="w-2.5 h-2.5" /> Clave
                  </span>
                </div>
                <p className="text-[11px] text-[#b8ab8d] line-clamp-1">
                  Ventas POS, Entradas, Stock y Ticketera
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#EAB308] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Option 2: Modo PC / Mostrador Panorámico */}
          <button
            type="button"
            onClick={() => {
              triggerAdminActionHaptic();
              onClose();
              onSelectPcMode();
            }}
            id="admin-option-pc-mode-btn"
            className="w-full p-3.5 rounded-2xl bg-[#1b1b23] hover:bg-[#232330] border border-[#2e2e3d] hover:border-[#f2ca50]/50 text-left transition-all group cursor-pointer flex items-center justify-between gap-3 active:scale-98"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#2a2a38] border border-[#3b3b4f] flex items-center justify-center text-[#99907c] group-hover:text-[#f2ca50] shrink-0 group-hover:scale-105 transition-transform">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#e4e1ed] group-hover:text-[#f2ca50] transition-colors">
                    2. Modo PC (Mostrador)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#2a2a38] text-[9px] font-semibold text-[#a8a3b8]">
                    Panorámico
                  </span>
                </div>
                <p className="text-[11px] text-[#99907c] line-clamp-1">
                  Catálogo en pantalla ancha para clientes en laptop
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#99907c] group-hover:text-[#f2ca50] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Option 3: Volver al Modo Normal */}
          <button
            type="button"
            onClick={onClose}
            id="admin-option-normal-mode-btn"
            className="w-full p-3.5 rounded-2xl bg-[#181820] hover:bg-[#20202b] border border-[#262633] text-left transition-all group cursor-pointer flex items-center justify-between gap-3 active:scale-98"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#22222e] flex items-center justify-center text-[#99907c] shrink-0">
                <Smartphone className="w-5 h-5 text-[#99907c]" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-[#c8c5d3] group-hover:text-white transition-colors">
                  3. Volver al Modo Normal
                </span>
                <p className="text-[11px] text-[#7d788c] line-clamp-1">
                  Continuar explorando el catálogo móvil
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#7d788c] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

