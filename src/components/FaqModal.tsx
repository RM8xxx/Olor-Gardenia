import React, { useState, useRef } from 'react';
import { 
  X, 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Search,
  MapPin,
  Instagram,
  ExternalLink
} from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeliveryPoints?: () => void;
  onOpenEasterEgg?: () => void;
  isPcMode?: boolean;
}

const WHATSAPP_PHONE_NUMBER = '529987099043';
const INSTAGRAM_URL = 'https://www.instagram.com/olorgardenia';

interface FaqItem {
  id: string;
  category: 'dupes' | 'pedidos' | 'entregas';
  question: string;
  answer: string;
  highlight?: string;
  icon: React.ReactNode;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'que-es-dupe',
    category: 'dupes',
    question: '¿Qué es un Dupe o Inspiración olfativa?',
    answer: 'Nuestros perfumes son inspiraciones de alta calidad elaboradas con esencias de perfumería fina. Replican la pirámide olfativa de las fragancias de diseñador y marcas nicho más reconocidas con más del 95% de similitud, ofreciéndote la misma experiencia aromática de lujo a una fracción de su precio comercial.',
    highlight: 'Más del 95% de similitud aromática sin pagar sobreprecio de marketing.',
    icon: <Sparkles className="w-4 h-4 text-[#f2ca50]" />
  },
  {
    id: 'como-pedir',
    category: 'pedidos',
    question: '¿Cómo hago mi pedido o consulta de disponibilidad?',
    answer: 'Es muy sencillo: explora el catálogo, abre la fragancia que te guste y presiona "Consultar por WhatsApp", o guarda tus favoritos con el botón ❤️ para enviar tu selección completa en un solo mensaje. Te respondemos de inmediato confirmando stock y coordinando tu entrega.',
    highlight: 'Respuesta inmediata por WhatsApp con confirmación de stock.',
    icon: <Package className="w-4 h-4 text-[#33ccff]" />
  },
  {
    id: 'puntos-entrega-horarios',
    category: 'entregas',
    question: '¿Dónde y cuándo son las entregas personales?',
    answer: 'Contamos con dos opciones de entrega presencial:\n\n• Mercado del Chorro: Solo los viernes de 5:00 PM a 10:00 PM.\n• Domingos: Colonia Chapultepec en San Nicolás de los Garza, de 12:00 PM a 8:00 PM (la ubicación exacta se envía por WhatsApp al confirmar tu pedido).\n\nTambién contamos con envíos seguros a todo México.',
    highlight: 'Viernes (5 a 10 PM) en Mercado del Chorro y Domingos (12 a 8 PM) en Col. Chapultepec.',
    icon: <MapPin className="w-4 h-4 text-[#4edea3]" />
  },
  {
    id: 'asesoria-personalizada',
    category: 'pedidos',
    question: '¿Me pueden asesorar si no sé qué perfume elegir?',
    answer: '¡Totalmente! Escríbenos por WhatsApp comentándonos qué tipo de aromas te gustan (dulces, frescos, amaderados, cítricos) o para qué ocasión lo buscas (citas, oficina, diario, clima cálido) y con gusto te asesoramos de forma personalizada.',
    highlight: 'Asesoría olfativa gratuita y personalizada vía WhatsApp.',
    icon: <MessageCircle className="w-4 h-4 text-[#25D366]" />
  }
];

export const FaqModal: React.FC<FaqModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenEasterEgg,
  isPcMode = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // All accordion items are closed by default
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [rm8Clicks, setRm8Clicks] = useState<number>(0);
  const rm8TimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRm8Click = () => {
    if (rm8TimeoutRef.current) {
      clearTimeout(rm8TimeoutRef.current);
    }
    const nextClicks = rm8Clicks + 1;
    if (nextClicks >= 4) {
      setRm8Clicks(0);
      onOpenEasterEgg?.();
    } else {
      setRm8Clicks(nextClicks);
      rm8TimeoutRef.current = setTimeout(() => {
        setRm8Clicks(0);
      }, 2500);
    }
  };

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleWhatsAppContact = (customMessage?: string) => {
    const text = encodeURIComponent(customMessage || '¡Hola! Tengo una duda sobre los perfumes y el catálogo de Olor Gardenia.');
    window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const filteredFaqs = FAQ_DATA.filter(faq => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-0 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`relative w-full bg-[#13131b] border-t sm:border border-[#292932] rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-slide-up ${
          isPcMode 
            ? 'max-w-3xl max-h-[88vh]' 
            : 'max-w-xl max-h-[94vh] sm:max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile pull indicator */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[#34343d]" />
        </div>

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#292932]/70 shrink-0 bg-[#161620]">
          <button
            type="button"
            onClick={onClose}
            id="faq-modal-back-btn"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#99907c] hover:text-[#e4e1ed] py-1.5 px-2.5 -ml-2 rounded-xl hover:bg-[#1b1b23] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#f2ca50]" />
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#f2ca50]" />
            <h3 className="text-sm sm:text-base font-bold font-serif-luxury text-[#e4e1ed]">
              Preguntas Frecuentes (FAQs)
            </h3>
          </div>

          <button
            onClick={onClose}
            id="faq-modal-close-btn"
            className="p-2 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center -mr-2"
            aria-label="Cerrar modal de preguntas frecuentes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 overscroll-contain">
          {/* Quick Search in FAQs */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pregunta (ej. dupes, pedidos, entregas)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
            />
          </div>

          {/* Questions List (Closed by default) */}
          <div className="space-y-2.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className="rounded-2xl bg-[#1b1b23] border border-[#292932] hover:border-[#383848] transition-all overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#13131b] border border-[#292932] flex items-center justify-center shrink-0">
                        {faq.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#e4e1ed] leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div className="p-1 rounded-lg text-[#99907c] shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#f2ca50]" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#d0c5af] leading-relaxed border-t border-[#292932]/60 space-y-2.5 animate-fade-in flex-1">
                      <p className="whitespace-pre-line">{faq.answer}</p>

                      {faq.highlight && (
                        <div className="p-2.5 rounded-xl bg-[#13131b] border border-[#f2ca50]/20 text-[11px] text-[#f2ca50] font-medium flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#f2ca50]" />
                          <span>{faq.highlight}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Social Media Strip */}
          <div className="pt-1">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="faq-instagram-link-btn"
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#201323]/80 via-[#181822] to-[#1a1528] border border-[#E1306C]/35 hover:border-[#E1306C]/70 flex items-center justify-between gap-2.5 group transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shrink-0 shadow-md shadow-[#dc2743]/20 group-hover:scale-105 transition-transform">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white leading-tight">Instagram Oficial</p>
                  <p className="text-[10px] text-[#dc8fb0] truncate">@olorgardenia • Novedades y catálogo</p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#ff80a6] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
          </div>

          {/* WhatsApp Direct Help Box */}
          <div className="p-4 rounded-2xl bg-[#181822] border border-[#292932] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-[#e4e1ed]">¿Tienes alguna duda con tu pedido?</p>
              <p className="text-[11px] text-[#99907c]">Escríbenos directamente y te ayudamos en minutos.</p>
            </div>

            <button
              type="button"
              onClick={() => handleWhatsAppContact()}
              id="faq-whatsapp-direct-btn"
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chatear por WhatsApp</span>
            </button>
          </div>

          {/* Back to Catalog Button */}
          <div className="pt-1 space-y-3">
            <button
              type="button"
              onClick={onClose}
              id="faq-modal-close-bottom-btn"
              className="w-full py-3 rounded-xl bg-[#1b1b23] hover:bg-[#292932] text-[#e4e1ed] font-bold text-xs sm:text-sm border border-[#292932] transition-colors active:scale-98"
            >
              Cerrar y Volver a la Colección
            </button>

            {/* Developer Watermark with Easter Egg Trigger */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleRm8Click}
                id="faq-developer-watermark-btn"
                className="text-[10px] text-[#706859] hover:text-[#f2ca50] font-mono tracking-widest uppercase transition-colors cursor-pointer select-none inline-block"
                title="Developed by RM8"
              >
                Developed by RM8 {rm8Clicks > 0 && `(${rm8Clicks}/4)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
