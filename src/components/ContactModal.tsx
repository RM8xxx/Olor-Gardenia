import React from 'react';
import { X, MessageCircle, Instagram, Phone, Sparkles, MapPin, Clock } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INSTAGRAM_URL = 'https://www.instagram.com/olorgardenia';
const WHATSAPP_PHONE = '529987099043';
const WHATSAPP_DISPLAY = '+52 998 709 9043';

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent('¡Hola! Me comunico desde el catálogo digital de Olor Gardenia ✨ Me gustaría recibir más información.');
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-sm sm:max-w-md bg-[#13131b] border border-[#292932] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#292932]/80 bg-[#161620]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f2ca50] block">
                Atención Personalizada
              </span>
              <h3 className="text-base font-bold font-serif-luxury text-[#e4e1ed] leading-tight">
                Contacto Olor Gardenia
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            id="contact-modal-close-btn"
            className="p-1.5 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5">
          {/* WhatsApp Direct Action */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            id="contact-modal-whatsapp-btn"
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#25D366]/20 via-[#25D366]/10 to-transparent hover:from-[#25D366]/30 border border-[#25D366]/50 text-left flex items-center gap-3 transition-all active:scale-98 shadow-sm group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#25D366]/20 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#25D366] tracking-wider">
                  WhatsApp Oficial
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366]">
                  En línea
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                {WHATSAPP_DISPLAY}
              </p>
              <p className="text-[11px] text-[#d0c5af]/80 truncate">
                Toca para enviar mensaje directo
              </p>
            </div>
          </button>

          {/* Instagram Direct Action */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="contact-modal-instagram-btn"
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#E1306C]/20 via-[#E1306C]/10 to-transparent hover:from-[#E1306C]/30 border border-[#E1306C]/50 text-left flex items-center gap-3 transition-all active:scale-98 shadow-sm group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#dc2743]/20 group-hover:scale-105 transition-transform">
              <Instagram className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#ff80a6] tracking-wider">
                  Instagram
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1306C]/20 text-[#ff80a6]">
                  Comunidad
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                @olorgardenia
              </p>
              <p className="text-[11px] text-[#d0c5af]/80 truncate">
                Fotos, videos y novedades de fragancias
              </p>
            </div>
          </a>

          {/* Extra Info Box */}
          <div className="p-3.5 rounded-2xl bg-[#0c0c13] border border-[#292932] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#d0c5af]">
              <Clock className="w-3.5 h-3.5 text-[#f2ca50] shrink-0" />
              <span>Atención y pedidos: <strong>Lunes a Domingo</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#d0c5af]">
              <MapPin className="w-3.5 h-3.5 text-[#f2ca50] shrink-0" />
              <span>Entregas locales y envíos a todo México</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#292932]/80 bg-[#161620]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1b1b23] hover:bg-[#252530] border border-[#292932] text-[#e4e1ed] font-bold text-xs transition-colors shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
