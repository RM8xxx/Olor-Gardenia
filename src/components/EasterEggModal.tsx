import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Play looping audio effect when modal opens
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    if (isOpen) {
      try {
        audio = new Audio('/poncho-risa.mp3');
        audio.loop = true;
        audio.volume = 0.8;
        audio.play().catch((err) => {
          console.log('Audio autoplay prevented or file missing:', err);
        });
      } catch (e) {
        console.log('Audio initialization error:', e);
      }
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/98 animate-fadeIn">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#f2ca50]/10 rounded-full blur-[80px] pointer-events-none" />

      <div 
        id="easter-egg-modal-content"
        className="relative w-full max-w-2xl flex flex-col items-center text-center space-y-6 z-10 my-auto"
      >
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[#f2ca50] text-xs font-bold uppercase tracking-widest shadow-md">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Área Secreta Descubierta</span>
        </div>

        {/* Image Container with tight yellow border */}
        <div className="relative inline-block max-w-[280px] xs:max-w-[320px] sm:max-w-md w-auto rounded-3xl overflow-hidden border-2 border-[#f2ca50]/50 bg-[#13131b] shadow-2xl shadow-[#f2ca50]/20 p-2.5 sm:p-3 group">
          <img
            src="/2yxc0ymalg061.jpg"
            alt="Easter Egg Secret"
            className="w-full h-auto max-h-[50vh] sm:max-h-[55vh] object-contain object-center rounded-2xl group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop';
            }}
          />
        </div>

        {/* Subtitle / Footer Action */}
        <div className="space-y-3 pt-1">
          <p className="text-sm sm:text-base text-[#f2ca50] font-medium max-w-md mx-auto italic">
            El desarrollador manda saludos a tu curiosidad
          </p>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#f2ca50] via-[#e5b93b] to-[#a37c15] text-[#13131b] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#f2ca50]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

