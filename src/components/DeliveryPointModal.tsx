import React from 'react';
import { 
  X, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Sparkles,
  Calendar,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

interface DeliveryPointModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_PHONE_NUMBER = '529987099043';

export const DeliveryPointModal: React.FC<DeliveryPointModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleWhatsAppChat = (message: string) => {
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-0 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-xl bg-[#13131b] border-t sm:border border-[#292932] rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull indicator */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[#34343d]" />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#292932]/70 shrink-0 bg-[#161620]">
          <button
            type="button"
            onClick={onClose}
            id="delivery-modal-back-btn"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#99907c] hover:text-[#e4e1ed] py-1.5 px-2.5 -ml-2 rounded-xl hover:bg-[#1b1b23] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#f2ca50]" />
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#f2ca50]" />
            <h3 className="text-sm sm:text-base font-bold font-serif-luxury text-[#e4e1ed]">
              Puntos de Entrega
            </h3>
          </div>

          <button
            onClick={onClose}
            id="delivery-modal-close-btn"
            className="p-2 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center -mr-2"
            aria-label="Cerrar modal de entregas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 overscroll-contain">
          {/* Option 1: Mercado del Chorro */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c1b24] to-[#16161f] border border-[#f2ca50]/30 shadow-lg space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f2ca50] uppercase tracking-wider">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Punto Principal</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#e4e1ed] mt-0.5">
                  Mercado del Chorro
                </h2>
                <p className="text-xs text-[#99907c] mt-0.5">Punto habitual de entrega personal</p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#f2ca50]/10 border border-[#f2ca50]/30 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#f2ca50]" />
              </div>
            </div>

            {/* Schedule Badge */}
            <div className="p-3 rounded-xl bg-[#13131b] border border-[#292932] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#f2ca50]/15 text-[#f2ca50] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-[#99907c] block">
                  Días y Horarios
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#f2ca50] flex items-center gap-1.5">
                  Solo los viernes de 5:00 PM a 10:00 PM
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleWhatsAppChat('¡Hola! Me gustaría coordinar mi entrega de perfumes en el Mercado del Chorro para este viernes (5 a 10 PM) ✨')}
              id="delivery-chorro-whatsapp-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Coordinar entrega en Mercado del Chorro</span>
            </button>
          </div>

          {/* Option 2: Colonia Chapultepec (Domingos) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c1b24] to-[#16161f] border border-[#f2ca50]/30 shadow-lg space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f2ca50] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Entregas de Fin de Semana</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#e4e1ed] mt-0.5">
                  Col. Chapultepec
                </h2>
                <p className="text-xs text-[#99907c] mt-0.5">San Nicolás de los Garza, Nuevo León</p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#f2ca50]/10 border border-[#f2ca50]/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#f2ca50]" />
              </div>
            </div>

            {/* Schedule Badge */}
            <div className="p-3 rounded-xl bg-[#13131b] border border-[#292932] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#f2ca50]/15 text-[#f2ca50] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-[#99907c] block">
                  Días y Horarios
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#f2ca50] flex items-center gap-1.5">
                  Domingos de 12:00 PM a 8:00 PM
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-[#d0c5af]">
              La ubicación exacta te la enviamos por WhatsApp al confirmar tu pedido.
            </div>

            <button
              type="button"
              onClick={() => handleWhatsAppChat('¡Hola! Me gustaría coordinar mi entrega de perfumes para este domingo en la Col. Chapultepec, San Nicolás de los Garza ✨')}
              id="delivery-chapultepec-whatsapp-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Solicitar Ubicación por WhatsApp</span>
            </button>
          </div>

          {/* Quick summary note */}
          <div className="p-3.5 rounded-2xl bg-[#161622] border border-[#292932] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f2ca50]">
              <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
              <span>Envíos a todo México</span>
            </div>
            <p className="text-xs text-[#d0c5af] leading-relaxed">
              Si no puedes acudir a los puntos de entrega presenciales, te enviamos tu paquete con paquetería segura a cualquier parte del país.
            </p>
          </div>

          {/* Close / Return Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#1b1b23] hover:bg-[#292932] text-[#e4e1ed] font-bold text-xs sm:text-sm border border-[#292932] transition-colors active:scale-98"
            >
              Cerrar y Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
