import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

interface TimePickerInputProps {
  id?: string;
  value: string; // "HH:mm" (24-hour format)
  onChange: (newTime: string) => void;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const PRESETS = [
  '09:00',
  '11:00',
  '13:00',
  '15:00',
  '17:00',
  '19:00',
  '21:00',
];

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  id = 'time-picker-input',
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const [currentHour, currentMin] = (value && value.includes(':') ? value.split(':') : ['12', '00']).map(
    (s) => s.trim()
  );

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSetNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    onChange(`${h}:${m}`);
    setIsOpen(false);
  };

  const handleSelectHour = (h: string) => {
    const m = currentMin || '00';
    onChange(`${h}:${m}`);
  };

  const handleSelectMinute = (m: string) => {
    const h = currentHour || '12';
    onChange(`${h}:${m}`);
  };

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger input/button */}
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          id={id}
          className="w-full flex items-center justify-between pl-3 pr-3 py-2.5 rounded-xl bg-[#13131b] border border-[#292932] hover:border-[#f2ca50]/50 text-xs font-mono text-[#e4e1ed] transition-colors focus:outline-none focus:border-[#f2ca50]"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#99907c]" />
            <span className="font-bold text-[#e4e1ed] text-xs sm:text-sm">
              {value || '12:00'}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#99907c] transition-transform ${
              isOpen ? 'rotate-180 text-[#f2ca50]' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 p-3 rounded-2xl bg-[#1b1b23] border border-[#f2ca50]/40 shadow-2xl space-y-3 min-w-[260px] animate-fadeIn">
          {/* Header with Quick Now button */}
          <div className="flex items-center justify-between pb-2 border-b border-[#292932]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#99907c]">
              Seleccionar Hora
            </span>
            <button
              type="button"
              onClick={handleSetNow}
              className="px-2 py-0.5 rounded-md bg-[#f2ca50]/15 text-[#f2ca50] hover:bg-[#f2ca50]/25 text-[11px] font-bold transition-colors"
            >
              Hora Actual
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#99907c] block">
              Horarios Rápidos
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                    value === p
                      ? 'bg-[#f2ca50] text-[#13131b] font-bold'
                      : 'bg-[#13131b] hover:bg-[#292932] text-[#e4e1ed] border border-[#292932]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Hours & Minutes Dual Columns */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#292932]">
            {/* Hour Picker Column */}
            <div>
              <span className="text-[9px] uppercase font-bold text-[#99907c] block mb-1 text-center">
                Hora (00-23)
              </span>
              <div className="max-h-36 overflow-y-auto rounded-xl bg-[#13131b] border border-[#292932] p-1 space-y-0.5 custom-scrollbar">
                {HOURS.map((h) => {
                  const isSelected = h === currentHour;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectHour(h)}
                      className={`w-full py-1 rounded-lg text-xs font-mono font-medium flex items-center justify-between px-2 transition-colors ${
                        isSelected
                          ? 'bg-[#f2ca50] text-[#13131b] font-bold'
                          : 'hover:bg-[#292932] text-[#e4e1ed]'
                      }`}
                    >
                      <span>{h}:00</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Picker Column */}
            <div>
              <span className="text-[9px] uppercase font-bold text-[#99907c] block mb-1 text-center">
                Minuto (00-55)
              </span>
              <div className="max-h-36 overflow-y-auto rounded-xl bg-[#13131b] border border-[#292932] p-1 space-y-0.5 custom-scrollbar">
                {MINUTES.map((m) => {
                  const isSelected = m === currentMin;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={`w-full py-1 rounded-lg text-xs font-mono font-medium flex items-center justify-between px-2 transition-colors ${
                        isSelected
                          ? 'bg-[#f2ca50] text-[#13131b] font-bold'
                          : 'hover:bg-[#292932] text-[#e4e1ed]'
                      }`}
                    >
                      <span>:{m}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Confirm selection */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 rounded-xl bg-[#292932] hover:bg-[#34343d] text-xs font-bold text-[#e4e1ed] transition-colors"
            >
              Aceptar ({value})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
