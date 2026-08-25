import React, { useState, useEffect } from 'react';
import { PerfumeProduct } from '../types';
import { Sparkles, X, ChevronRight, RotateCcw } from 'lucide-react';
import { GenderBadge } from './GenderBadge';

interface PerfumeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PerfumeProduct[];
  onSelectProduct: (product: PerfumeProduct) => void;
}

export const PerfumeQuizModal: React.FC<PerfumeQuizModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedAroma, setSelectedAroma] = useState<string>('todos');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('diario');
  const [selectedGender, setSelectedGender] = useState<string>('todos');
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleReset = () => {
    setStep(1);
    setSelectedAroma('todos');
    setSelectedOccasion('diario');
    setSelectedGender('todos');
    setShowResults(false);
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter recommendations based on quiz answers and sort by popularity / best sellers
  const getRecommendations = () => {
    let filtered = products;

    // Filter by gender if not todos
    if (selectedGender !== 'todos') {
      const targetCat = selectedGender === 'dama' ? 'Mujer' : 'Hombre';
      const genderFiltered = products.filter(p => p.category.toLowerCase() === targetCat.toLowerCase());
      if (genderFiltered.length > 0) {
        filtered = genderFiltered;
      }
    }

    // Filter by aroma keywords
    if (selectedAroma !== 'todos') {
      const keywordMap: Record<string, string[]> = {
        fresco: ['fresco', 'cítric', 'limón', 'bergamota', 'acuátic', 'verde'],
        dulce: ['dulce', 'vainilla', 'caramelo', 'gourmand', 'frutal', 'frutos', 'miel'],
        floral: ['floral', 'rosa', 'jazmín', 'gardenia', 'azahar', 'flores'],
        amaderado: ['amaderado', 'sándalo', 'cedro', 'pachulí', 'ámbar', 'almizcle', 'madera']
      };
      const keywords = keywordMap[selectedAroma] || [];
      const aromaFiltered = filtered.filter(p => {
        const text = `${p.name} ${p.description} ${p.notes}`.toLowerCase();
        return keywords.some(kw => text.includes(kw));
      });
      if (aromaFiltered.length > 0) {
        filtered = aromaFiltered;
      }
    }

    // Sort by popularity / top sales rank and return top 4
    const sorted = [...filtered].sort((a, b) => (a.topSalesRank || 999) - (b.topSalesRank || 999));
    return sorted.slice(0, 4);
  };

  const finalRecommendations = getRecommendations();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="perfume-quiz-modal-card"
        className="relative w-full max-w-md bg-[#181822] border border-[#3b3b4a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-[#2d2d3b] flex items-center justify-between bg-[#13131b]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">Te ayudamos a elegir</h2>
              <p className="text-[9px] text-[#a09cb0]">Asistente de fragancias Olor Gardenia</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#252533] hover:bg-[#323246] text-[#a09cb0] hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-3.5 space-y-3 overflow-y-auto">
          {!showResults ? (
            <div className="space-y-2.5">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-[11px] text-[#a09cb0] px-0.5">
                <span className="font-semibold text-[#f2ca50]">Paso {step} de 3</span>
                <span>{step === 1 ? 'Familia Olfativa' : step === 2 ? 'Ocasión de Uso' : 'Género'}</span>
              </div>
              <div className="w-full h-1 bg-[#252533] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#f2ca50] to-[#e5b93b] transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>

              {step === 1 && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <h3 className="text-xs font-bold text-white">¿Qué tipo de aroma o notas te atraen más?</h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: 'fresco', label: '🌿 Fresco / Cítrico', desc: 'Notas limpias y energizantes de bergamota, limón y toques acuáticos' },
                      { id: 'dulce', label: '🍯 Dulce / Gourmand', desc: 'Notas cálidas y reconfortantes de vainilla, caramelo y frutos' },
                      { id: 'floral', label: '🌸 Floral / Elegante', desc: 'Notas románticas y sofisticadas de jazmín, rosa y gardenia' },
                      { id: 'amaderado', label: '🪵 Amaderado / Intenso', desc: 'Notas profundas y seductoras de sándalo, cedro y ámbar' },
                      { id: 'todos', label: '✨ Sorpréndeme', desc: 'Explora nuestra variedad y descubre nuevos favoritos' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedAroma(item.id)}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedAroma === item.id
                            ? 'bg-[#f2ca50]/10 border-[#f2ca50] text-white font-bold shadow-sm'
                            : 'bg-[#13131b] border-[#2d2d3b] text-[#d0ccde] hover:border-[#454559]'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-semibold text-white">{item.label}</div>
                          <div className="text-[10px] text-[#a09cb0] leading-tight">{item.desc}</div>
                        </div>
                        {selectedAroma === item.id && <span className="text-[#f2ca50] font-bold text-xs shrink-0">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <h3 className="text-xs font-bold text-white">¿Para qué ocasión principal buscas tu perfume?</h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: 'diario', label: '☀️ Uso diario / Casual', desc: 'Versátil, fresco y agradable para todo el día' },
                      { id: 'citas', label: '🌙 Citas / Noches especiales', desc: 'Sensual, cautivador y de larga duración' },
                      { id: 'trabajo', label: '💼 Trabajo / Oficina', desc: 'Discreto, profesional y elegante' },
                      { id: 'fiesta', label: '🎉 Fiestas / Eventos', desc: 'Intenso, llamativo y con gran estela' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedOccasion(item.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedOccasion === item.id
                            ? 'bg-[#f2ca50]/10 border-[#f2ca50] text-white font-bold shadow-sm'
                            : 'bg-[#13131b] border-[#2d2d3b] text-[#d0ccde] hover:border-[#454559]'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-semibold text-white">{item.label}</div>
                          <div className="text-[10px] text-[#a09cb0] leading-tight">{item.desc}</div>
                        </div>
                        {selectedOccasion === item.id && <span className="text-[#f2ca50] font-bold text-xs shrink-0">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <h3 className="text-xs font-bold text-white">¿Para quién es la fragancia?</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'dama', label: '👩 Dama / Mujer' },
                      { id: 'caballero', label: '👨 Caballero / Hombre' },
                      { id: 'todos', label: '✨ Unisex / Cualquiera' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedGender(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                          selectedGender === item.id
                            ? 'bg-[#f2ca50]/10 border-[#f2ca50] text-white font-bold'
                            : 'bg-[#13131b] border-[#2d2d3b] text-[#d0ccde] hover:border-[#454559]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {selectedGender === item.id && <span className="text-[#f2ca50] font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2d2d3b]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="py-1.5 px-3.5 rounded-xl bg-[#252533] hover:bg-[#323246] text-white font-semibold text-xs transition-all"
                  >
                    Anterior
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="py-1.5 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffd700] text-[#13131b] font-bold text-xs flex items-center gap-1 shadow-md shadow-[#f2ca50]/20 transition-all ml-auto"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResults(true)}
                    className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#d4aa37] hover:opacity-95 text-[#13131b] font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#f2ca50]/25 transition-all ml-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ver Mis Fragancias</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="bg-[#13131b] p-2.5 rounded-xl border border-[#2d2d3b] text-center space-y-0.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#f2ca50]/15 text-[#f2ca50] text-[10px] font-bold">
                  ✨ Tus Ideales
                </span>
                <h3 className="text-xs font-bold text-white">Selección personalizada para ti</h3>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {finalRecommendations.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[#13131b] border border-[#2d2d3b] hover:border-[#f2ca50] transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#252533] overflow-hidden shrink-0 border border-[#3b3b4a]">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <GenderBadge gender={prod.gender} />
                        <span className="text-[9px] text-[#a09cb0] uppercase">{prod.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#f2ca50]">
                        {prod.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#a09cb0] group-hover:text-[#f2ca50] font-medium pr-1">Ver detalles →</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-1.5 px-3 rounded-xl bg-[#252533] hover:bg-[#323246] text-[#a09cb0] hover:text-white font-semibold text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Repetir</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-1.5 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffd700] text-[#13131b] font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
