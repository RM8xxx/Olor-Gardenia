import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { OlfactoryNoteInfo } from '../data/olfactoryNotesDict';

interface NoteDetailModalProps {
  noteInfo: OlfactoryNoteInfo | null;
  onClose: () => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  noteInfo,
  onClose,
}) => {
  if (!noteInfo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
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
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f2ca50] block truncate">
              {noteInfo.category}
            </span>
            <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-[#e4e1ed] leading-tight truncate">
              {noteInfo.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            id="note-modal-close-btn"
            className="p-1.5 rounded-xl text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] transition-colors shrink-0"
            aria-label="Cerrar modal de ingrediente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Clean & focused on "¿Qué es?" */}
        <div className="p-5 space-y-3">
          <div className="p-4 rounded-2xl bg-[#0c0c13] border border-[#f2ca50]/30 space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#f2ca50]">
              <Sparkles className="w-3.5 h-3.5 text-[#f2ca50] shrink-0" />
              <span>¿Qué es?</span>
            </div>
            <p className="text-xs sm:text-sm text-[#e4e1ed] leading-relaxed">
              {noteInfo.whatIsIt}
            </p>
          </div>
        </div>

        {/* Footer button */}
        <div className="px-5 py-3 border-t border-[#292932]/80 bg-[#161620]">
          <button
            type="button"
            onClick={onClose}
            id="note-modal-done-btn"
            className="w-full py-2.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] font-bold text-xs transition-colors shadow-sm active:scale-98"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
