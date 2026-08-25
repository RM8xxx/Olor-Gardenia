import React, { useState } from 'react';
import { getNoteInfo, OlfactoryNoteInfo } from '../data/olfactoryNotesDict';
import { NoteDetailModal } from './NoteDetailModal';

interface OlfactoryNotesLinksProps {
  notesString?: string;
  className?: string;
}

export const OlfactoryNotesLinks: React.FC<OlfactoryNotesLinksProps> = ({
  notesString,
  className = ''
}) => {
  const [selectedNote, setSelectedNote] = useState<OlfactoryNoteInfo | null>(null);

  if (!notesString) return null;

  // Split by common delimiters and conjunctions while keeping structure
  const parts = notesString.split(/([,;•]|\s+y\s+|\s+e\s+|\s+and\s+)/i);

  const handleNoteClick = (e: React.MouseEvent, noteText: string) => {
    e.stopPropagation();
    e.preventDefault();
    const info = getNoteInfo(noteText);
    setSelectedNote(info);
  };

  return (
    <>
      <span className={`text-sm text-[#e4e1ed] leading-relaxed font-serif-luxury ${className}`}>
        {parts.map((part, idx) => {
          const trimmed = part.trim();
          if (!trimmed || /^[,;•ye\s]+$/i.test(trimmed)) {
            return <span key={idx}>{part}</span>;
          }

          const cleaned = trimmed
            .replace(/^[-•*y]\s*/i, '')
            .replace(/\.$/, '')
            .trim();

          if (
            cleaned.length >= 2 &&
            !/^(el|la|los|las|un|una|con|para|mas|muy|salida|corazon|fondo|top|middle|base)\b/i.test(
              cleaned
            )
          ) {
            const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleNoteClick(e, formatted)}
                title={`Ver qué es ${formatted}`}
                className="text-[#f2ca50] hover:text-[#ffd700] hover:underline font-semibold transition-colors cursor-pointer inline text-left bg-transparent border-none p-0 focus:outline-none"
              >
                {part}
              </button>
            );
          }

          return <span key={idx}>{part}</span>;
        })}
      </span>

      {/* Pop-up modal with Google-verified ingredient and note details */}
      <NoteDetailModal
        noteInfo={selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </>
  );
};
