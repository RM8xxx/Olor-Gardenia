import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Loader2, X, Check, Droplets, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { searchPerfumesApi, FormattedPerfumeApiData } from '../utils/perfumeApi';

interface PerfumeApiSearchBoxProps {
  onSelectPerfume: (perfume: FormattedPerfumeApiData) => void;
  selectedPerfumeName?: string;
}

const QUICK_SUGGESTIONS = [
  'Aventus',
  'Sauvage',
  'Born in Roma',
  'Good Girl',
  'Baccarat Rouge',
  'Libre',
  'Oud Wood',
  'Eros'
];

export const PerfumeApiSearchBox: React.FC<PerfumeApiSearchBoxProps> = ({
  onSelectPerfume,
  selectedPerfumeName,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FormattedPerfumeApiData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<FormattedPerfumeApiData | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Perform search
  const handleSearch = async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchPerfumesApi(term);
      setResults(data);
      if (data.length === 0) {
        setError(`No se encontraron resultados en la API para "${term}". Puedes intentar con otra marca o nombre.`);
      }
    } catch (err: any) {
      console.error('API search error:', err);
      setError('Ocurrió un error al consultar la base de datos de perfumes. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced auto-search when typing 3+ characters
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(val);
      }, 500);
    } else if (val.trim().length === 0) {
      setResults([]);
      setHasSearched(false);
      setError(null);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleSelect = (item: FormattedPerfumeApiData) => {
    setSelectedItem(item);
    onSelectPerfume(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1b23] border border-[#f2ca50]/40 shadow-xl space-y-3.5 relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#292932] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#f2ca50]/15 text-[#f2ca50] flex items-center justify-center shrink-0 border border-[#f2ca50]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#e4e1ed] flex items-center gap-2">
              <span>Búsqueda Oficial en Base de Datos de Perfumes</span>
            </h3>
            <p className="text-[10px] text-[#99907c]">
              Conectado exclusivamente a <span className="font-mono text-[#f2ca50]/80">perfumapidatabase.onrender.com</span>
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 tracking-wide">
          API Oficial
        </span>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleManualSearch} className="space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="perfume-api-search-input"
            value={query}
            onChange={handleInputChange}
            placeholder="Escribe el nombre o marca (ej. Sauvage, Born in Roma, Creed)..."
            className="w-full pl-10 pr-24 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-xs sm:text-sm text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-[#99907c] hover:text-[#e4e1ed] transition-colors"
                title="Limpiar"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              id="perfume-api-search-btn"
              className="px-3 py-1.5 rounded-lg bg-[#f2ca50] hover:bg-[#ffe088] disabled:opacity-50 text-[#13131b] font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline">Buscar</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-[#99907c] font-medium">Sugerencias:</span>
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-[#13131b] hover:bg-[#292932] text-[#d0c5af] hover:text-[#f2ca50] border border-[#292932] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Selected Item Notification Banner */}
      {selectedItem && (
        <div className="p-3 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/40 text-[#4edea3] flex items-center justify-between gap-2 animate-fade-in text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 shrink-0 font-bold" />
            <span className="truncate">
              Información oficial cargada: <strong className="text-white">{selectedItem.cleanName}</strong> ({selectedItem.brand} {selectedItem.releaseYear ? `• ${selectedItem.releaseYear}` : ''})
            </span>
          </div>
          <span className="text-[10px] font-bold bg-[#4edea3]/20 px-2 py-0.5 rounded text-white shrink-0">
            Foto Asignada
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-6 text-center rounded-xl bg-[#13131b] border border-[#292932] space-y-2">
          <Loader2 className="w-6 h-6 text-[#f2ca50] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#e4e1ed]">
            Consultando API de Perfumes...
          </p>
          <p className="text-[10px] text-[#99907c]">
            Obteniendo notas olfativas, año, género y URL oficial de la imagen.
          </p>
        </div>
      )}

      {/* Error / Empty State */}
      {!isLoading && error && (
        <div className="p-3.5 rounded-xl bg-[#13131b] border border-[#292932] text-center text-xs text-[#99907c]">
          <p>{error}</p>
        </div>
      )}

      {/* Results Dropdown / Grid */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#99907c] px-0.5">
            <span>
              Resultados encontrados en la API: <strong className="text-[#f2ca50]">{results.length}</strong>
            </span>
            <span className="text-[10px]">Toca para auto-completar el formulario</span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-[#292932]/50">
            {results.map((item) => {
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#f2ca50]/10 border-[#f2ca50] shadow-md shadow-[#f2ca50]/10'
                      : 'bg-[#13131b] hover:bg-[#1f1f2a] border-[#292932] hover:border-[#f2ca50]/50'
                  }`}
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-lg bg-[#0d0d14] border border-[#292932] shrink-0 p-1 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Droplets className="w-5 h-5 text-[#99907c]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-[#f2ca50] uppercase tracking-wider">
                          {item.brand}
                        </span>
                        {item.releaseYear && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#292932] text-[#99907c] font-mono">
                            {item.releaseYear}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          item.gender === 'Mujer' ? 'bg-[#f472b6]/20 text-[#f472b6]' :
                          item.gender === 'Hombre' ? 'bg-[#38bdf8]/20 text-[#38bdf8]' :
                          'bg-[#a78bfa]/20 text-[#a78bfa]'
                        }`}>
                          {item.gender}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#e4e1ed] truncate">
                        {item.cleanName}
                      </h4>

                      <p className="text-[10px] text-[#99907c] line-clamp-1">
                        {item.notes}
                      </p>
                    </div>
                  </div>

                  {/* Right: Select Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                    className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 w-full xs:w-auto justify-center ${
                      isSelected
                        ? 'bg-[#4edea3] text-[#13131b]'
                        : 'bg-[#292932] hover:bg-[#f2ca50] text-[#e4e1ed] hover:text-[#13131b]'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Seleccionado</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Usar Datos y Foto</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
