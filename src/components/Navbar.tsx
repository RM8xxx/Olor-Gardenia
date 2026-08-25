import React, { useState, useRef } from 'react';
import { Sparkles, HelpCircle, ArrowLeftRight, Heart, Trash2, Share2, MessageCircle } from 'lucide-react';
import { LotusIcon } from './LotusIcon';
import { triggerAdminAccessHaptic, triggerAdminActionHaptic } from '../utils/haptics';

interface NavbarProps {
  totalCount: number;
  inquiryCount?: number;
  onOpenInquiry?: () => void;
  onClearInquiry?: () => void;
  onOpenDeliveryPoints?: () => void;
  onOpenFaq?: () => void;
  onOpenComparison?: () => void;
  onOpenQuiz?: () => void;
  onOpenShare?: () => void;
  onOpenContact?: () => void;
  onEnterPcMode?: () => void;
  onOpenEasterEgg?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  inquiryCount = 0,
  onOpenInquiry,
  onClearInquiry,
  onOpenFaq,
  onOpenComparison,
  onOpenQuiz,
  onOpenShare,
  onOpenContact,
  onEnterPcMode
}) => {
  const [tapCount, setTapCount] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didTriggerLongPressRef = useRef<boolean>(false);

  // Long press handler (1.2 seconds hold)
  const startLongPress = () => {
    didTriggerLongPressRef.current = false;
    setIsPressing(true);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    longPressTimeoutRef.current = setTimeout(() => {
      didTriggerLongPressRef.current = true;
      setIsPressing(false);
      triggerAdminAccessHaptic();
      onEnterPcMode?.();
    }, 1200);
  };

  const cancelLongPress = () => {
    setIsPressing(false);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // Handle tap / click
  const handleLogoClick = () => {
    if (didTriggerLongPressRef.current) {
      didTriggerLongPressRef.current = false;
      return;
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    const newCount = tapCount + 1;
    if (newCount >= 3) {
      setTapCount(0);
      triggerAdminAccessHaptic();
      onEnterPcMode?.();
    } else {
      setTapCount(newCount);
      triggerAdminActionHaptic();
      clickTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 1500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#13131b]/95 backdrop-blur-xl border-b border-[#292932]/80 transition-all">
      {/* Main App Bar */}
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand Identity with Long-Press / 3-Tap Secret Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleLogoClick}
            onPointerDown={startLongPress}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onPointerCancel={cancelLongPress}
            id="navbar-star-secret-btn"
            title="Olor Gardenia (Toca o mantén presionado para acceso)"
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#f2ca50] via-[#e5b93b] to-[#a37c15] flex items-center justify-center p-[2px] shadow-lg shadow-[#f2ca50]/25 shrink-0 transition-all cursor-pointer select-none touch-manipulation ${
              isPressing ? 'scale-110 shadow-xl shadow-[#f2ca50]/50 ring-2 ring-[#f2ca50]' : 'active:scale-95 hover:shadow-[#f2ca50]/35'
            }`}
            aria-label="Logo Olor Gardenia"
          >
            <div className="w-full h-full bg-[#13131b] rounded-[14px] flex items-center justify-center p-1.5">
              <LotusIcon className="w-full h-full text-[#f2ca50]" />
            </div>
          </button>
          
          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-display-friendly leading-tight whitespace-nowrap drop-shadow-[0_0_8px_rgba(242,202,80,0.7)]">
                Olor Gardenia
              </h1>

              {/* Action buttons (FAQs, Vs, Compartir Icon-Only) */}
              <div className="flex items-center gap-1 shrink-0">
                {onOpenFaq && (
                  <button
                    type="button"
                    onClick={onOpenFaq}
                    id="navbar-faq-title-btn"
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#1b1b23] hover:bg-[#282834] border border-[#f2ca50]/40 text-[#f2ca50] hover:text-white text-[10px] font-bold transition-all shadow-sm active:scale-95"
                    title="Preguntas Frecuentes"
                  >
                    <HelpCircle className="w-2.5 h-2.5 text-[#f2ca50] shrink-0" />
                    <span>FAQs</span>
                  </button>
                )}

                {onOpenComparison && (
                  <button
                    type="button"
                    onClick={onOpenComparison}
                    id="navbar-comparison-title-btn"
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#1b1b23] hover:bg-[#282834] border border-[#f2ca50]/40 text-[#f2ca50] hover:text-white text-[10px] font-bold transition-all shadow-sm active:scale-95"
                    title="Comparar Perfumes (Vs.)"
                  >
                    <ArrowLeftRight className="w-2.5 h-2.5 text-[#f2ca50] shrink-0" />
                    <span>Vs.</span>
                  </button>
                )}

                {/* Compartir / Guardar Catálogo - ICON ONLY */}
                {onOpenShare && (
                  <button
                    type="button"
                    onClick={onOpenShare}
                    id="navbar-share-catalog-btn"
                    className="p-1 rounded bg-[#1b1b23] hover:bg-[#282834] border border-[#292932] hover:border-[#f2ca50]/50 text-[#f2ca50] hover:text-white transition-all shadow-sm active:scale-95"
                    title="Compartir o guardar catálogo"
                    aria-label="Compartir catálogo"
                  >
                    <Share2 className="w-3 h-3 text-[#f2ca50]" />
                  </button>
                )}
              </div>
            </div>

            {/* Mini quiz button below FAQs & Vs */}
            {onOpenQuiz && (
              <div>
                <button
                  type="button"
                  onClick={onOpenQuiz}
                  id="navbar-quiz-mini-btn"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#232018] hover:bg-[#2c271e] border border-[#f2ca50]/50 text-[#f2ca50] hover:text-white text-[9.5px] font-bold transition-all shadow-sm active:scale-95 leading-none"
                  title="¿No sabes qué elegir? Te ayudamos"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#f2ca50] shrink-0" />
                  <span>¿No sabes qué elegir?</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Favs & Contacto Buttons */}
        <div className="flex flex-col gap-1 items-end justify-center shrink-0">
          {/* Top Button: Favs */}
          {onOpenInquiry && (
            <div className="flex items-center gap-1">
              {inquiryCount > 0 && onClearInquiry && (
                <button
                  type="button"
                  onClick={onClearInquiry}
                  className="h-[22px] sm:h-[24px] px-1.5 rounded-md bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 hover:text-white transition-all text-[9px] font-bold flex items-center gap-0.5 shadow-sm active:scale-95"
                  title="Vaciar favoritos"
                >
                  <Trash2 className="w-2.5 h-2.5 shrink-0" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenInquiry}
                id="navbar-inquiry-header-btn"
                className="h-[22px] sm:h-[24px] px-2 rounded-md bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                title="Mis Favoritos"
              >
                <div className="w-3.5 h-3.5 rounded bg-pink-500 flex items-center justify-center shrink-0">
                  <Heart className="w-2 h-2 text-white fill-white" />
                </div>
                <span className="text-[10px] font-bold">Favs</span>
                {inquiryCount > 0 && (
                  <span className="px-1 rounded-full bg-pink-500 text-white text-[9px] font-black shrink-0 leading-none">
                    {inquiryCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Bottom Button: Contacto (opens Contact Modal with Instagram & WhatsApp) */}
          <button
            type="button"
            onClick={onOpenContact}
            id="navbar-contact-btn"
            className="h-[22px] sm:h-[24px] px-2 rounded-md bg-[#1b1b23] hover:bg-[#252530] border border-[#f2ca50]/40 text-[#f2ca50] hover:text-white transition-all text-[10px] font-bold shadow-sm active:scale-95 flex items-center gap-1.5"
            title="Contacto (WhatsApp e Instagram)"
          >
            <MessageCircle className="w-3 h-3 text-[#f2ca50] shrink-0" />
            <span>Contacto</span>
          </button>
        </div>
      </div>
    </header>
  );
};
