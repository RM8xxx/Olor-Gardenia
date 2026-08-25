import React, { useRef, useEffect } from 'react';
import { Home, X } from 'lucide-react';

interface VideoLoopModalProps {
  isOpen: boolean;
  onReturnHome: () => void;
}

export const VideoLoopModal: React.FC<VideoLoopModalProps> = ({
  isOpen,
  onReturnHome
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-4 select-none animate-fade-in">
      {/* Top right floating X close button */}
      <button
        type="button"
        onClick={onReturnHome}
        id="video-loop-close-x-btn"
        className="absolute top-5 right-5 p-3 rounded-full bg-[#1b1b24]/90 hover:bg-[#2e2e3a] border border-[#f2ca50]/50 text-[#f2ca50] hover:text-white shadow-xl transition-all cursor-pointer z-20 active:scale-90"
        title="Cerrar y volver al modo normal"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Container with yellow border */}
      <div className="relative inline-block max-w-[340px] xs:max-w-[380px] sm:max-w-xl md:max-w-2xl w-full rounded-3xl overflow-hidden border-2 border-[#f2ca50]/70 bg-[#13131b] shadow-2xl shadow-[#f2ca50]/30 p-2 sm:p-3 group">
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/ssqqbmum/video/upload/v1787562208/videoplayback.mp4"
          autoPlay
          loop
          playsInline
          controls
          className="w-full h-auto max-h-[60vh] object-contain object-center rounded-2xl bg-black"
        />
      </div>

      {/* Return to Main Screen Button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onReturnHome}
          id="video-loop-return-home-btn"
          className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#f2ca50] via-[#e5b93b] to-[#a37c15] text-[#13131b] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-[#f2ca50]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
        >
          <Home className="w-4 h-4 text-[#13131b]" />
          <span>Volver al Modo Normal</span>
        </button>
      </div>
    </div>
  );
};
