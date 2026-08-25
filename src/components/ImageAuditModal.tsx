import React, { useState, useEffect, useMemo } from 'react';
import { PerfumeProduct } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { X, Copy, Check, Download, AlertTriangle, CheckCircle, RefreshCw, Search, ShieldCheck } from 'lucide-react';

interface ImageAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: PerfumeProduct[];
}

interface AuditResultItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  status: 'valid' | 'missing' | 'error' | 'testing';
  reason: string;
}

export const ImageAuditModal: React.FC<ImageAuditModalProps> = ({
  isOpen,
  onClose,
  products = INITIAL_PRODUCTS,
}) => {
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [results, setResults] = useState<AuditResultItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'errors' | 'valid'>('errors');
  const [progress, setProgress] = useState<{ checked: number; total: number }>({ checked: 0, total: 0 });

  // Run audit when modal opens
  useEffect(() => {
    if (isOpen) {
      runAudit();
    }
  }, [isOpen]);

  const runAudit = async () => {
    setIsAuditing(true);
    const targetProducts = products && products.length > 0 ? products : INITIAL_PRODUCTS;
    setProgress({ checked: 0, total: targetProducts.length });

    const auditList: AuditResultItem[] = targetProducts.map((p) => {
      let status: 'valid' | 'missing' | 'error' | 'testing' = 'testing';
      let reason = 'Comprobando...';

      if (!p.image || p.image.trim() === '') {
        status = 'missing';
        reason = 'Sin URL de imagen';
      } else if (!p.image.startsWith('http://') && !p.image.startsWith('https://') && !p.image.startsWith('/')) {
        status = 'error';
        reason = 'URL con formato inválido';
      }

      return {
        id: p.id,
        name: p.name || 'Sin nombre',
        brand: p.brand || 'Sin marca',
        image: p.image || '',
        status,
        reason,
      };
    });

    setResults([...auditList]);

    // Check images in parallel batches
    const batchSize = 15;
    const finalResults = [...auditList];

    for (let i = 0; i < targetProducts.length; i += batchSize) {
      const batch = targetProducts.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (prod, idx) => {
          const itemIndex = i + idx;
          if (finalResults[itemIndex].status === 'missing' || finalResults[itemIndex].status === 'error') {
            return;
          }

          try {
            // Test image load via browser Image constructor
            const isLoaded = await new Promise<boolean>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              img.src = prod.image;
              // Timeout after 4 seconds
              setTimeout(() => resolve(false), 4000);
            });

            if (isLoaded) {
              finalResults[itemIndex].status = 'valid';
              finalResults[itemIndex].reason = 'Imagen cargada correctamente (200 OK)';
            } else {
              finalResults[itemIndex].status = 'error';
              finalResults[itemIndex].reason = 'No encontrada / Error 404 en Cloudinary';
            }
          } catch {
            finalResults[itemIndex].status = 'error';
            finalResults[itemIndex].reason = 'Error de red al comprobar imagen';
          }
        })
      );

      setProgress({ checked: Math.min(i + batchSize, targetProducts.length), total: targetProducts.length });
      setResults([...finalResults]);
    }

    setIsAuditing(false);
  };

  const missingAndErrorItems = useMemo(() => {
    return results.filter((r) => r.status === 'missing' || r.status === 'error');
  }, [results]);

  const validItems = useMemo(() => {
    return results.filter((r) => r.status === 'valid');
  }, [results]);

  const filteredDisplayResults = useMemo(() => {
    return results.filter((r) => {
      if (filterType === 'errors' && r.status !== 'missing' && r.status !== 'error') return false;
      if (filterType === 'valid' && r.status !== 'valid') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.brand.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [results, filterType, searchQuery]);

  // Generate plain text format
  const plainTextList = useMemo(() => {
    const header = `# REPORTE DE FRAGANCIAS SIN IMAGEN O CON ERROR EN CLOUDINARY
# Fecha: ${new Date().toLocaleString()}
# Total analizado: ${results.length}
# Fragancias faltantes / con error: ${missingAndErrorItems.length}
# ----------------------------------------------------------------------
`;

    if (missingAndErrorItems.length === 0) {
      return header + '¡Excelente! Todas las fragancias cuentan con su imagen válida.';
    }

    const items = missingAndErrorItems.map((item, index) => {
      return `${index + 1}. ID: ${item.id}
   Nombre: ${item.name}
   Marca: ${item.brand}
   Estado: ${item.reason}
   URL: ${item.image || '(Ninguna)'}`;
    }).join('\n\n');

    return header + items;
  }, [results, missingAndErrorItems]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainTextList).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([plainTextList], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fragancias_faltantes_imagenes_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#13131b] border border-[#292932] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#e4e1ed]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292932] bg-[#161622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-display-friendly">
                  Auditor de Imágenes (Modo PC)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#f2ca50]/15 border border-[#f2ca50]/30 text-[10px] font-bold text-[#f2ca50]">
                  src/data/initialProducts.ts
                </span>
              </div>
              <p className="text-xs text-[#99907c]">
                Verificación en tiempo real de URLs, errores 404 en Cloudinary e imágenes faltantes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAudit}
              disabled={isAuditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b1b23] hover:bg-[#282834] border border-[#292932] hover:border-[#f2ca50]/40 text-xs font-semibold text-[#e4e1ed] transition-all disabled:opacity-50"
              title="Re-ejecutar auditoría"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#f2ca50] ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Comprobando...' : 'Re-auditar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1b1b23] hover:bg-[#282834] border border-[#292932] text-[#99907c] hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Bar & Summary */}
        <div className="px-6 py-3 bg-[#181824] border-b border-[#292932] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setFilterType('errors')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'errors'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'bg-[#13131b] text-[#99907c] hover:text-rose-400 border border-[#292932]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Faltantes / Con Error ({missingAndErrorItems.length})</span>
            </button>

            <button
              onClick={() => setFilterType('valid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'valid'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'bg-[#13131b] text-[#99907c] hover:text-emerald-400 border border-[#292932]'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Válidas en Cloudinary ({validItems.length})</span>
            </button>

            <button
              onClick={() => setFilterType('all')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 shadow-sm'
                  : 'bg-[#13131b] text-[#99907c] hover:text-[#f2ca50] border border-[#292932]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#f2ca50]" />
              <span>Todas ({results.length})</span>
            </button>
          </div>

          {/* Action Buttons: Copy .txt & Download .txt */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              id="btn-copy-missing-txt"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] text-xs font-bold transition-all shadow-md active:scale-95"
              title="Copiar reporte exacto en texto plano (.txt)"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado en .txt!' : 'Copiar Lista (.txt)'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              id="btn-download-missing-txt"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b1b23] hover:bg-[#282834] border border-[#292932] hover:border-[#f2ca50]/40 text-[#e4e1ed] text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="Descargar archivo .txt con las fragancias faltantes"
            >
              <Download className="w-3.5 h-3.5 text-[#f2ca50]" />
              <span>Descargar .txt</span>
            </button>
          </div>
        </div>

        {/* Search input and progress bar */}
        <div className="px-6 pt-3 pb-2 flex flex-col gap-2">
          {isAuditing && (
            <div className="w-full">
              <div className="flex justify-between text-[11px] text-[#99907c] mb-1">
                <span>Comprobando URLs de imágenes en Cloudinary...</span>
                <span>{progress.checked} de {progress.total}</span>
              </div>
              <div className="w-full h-1.5 bg-[#1b1b23] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#f2ca50] transition-all duration-200"
                  style={{ width: `${(progress.checked / (progress.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por id, nombre o marca..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#161622] border border-[#292932] text-xs text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99907c] hover:text-[#e4e1ed]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content list & Plain text block preview */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2.5 custom-scrollbar max-h-[50vh]">
          {filteredDisplayResults.length === 0 ? (
            <div className="py-12 text-center text-[#99907c]">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">No se encontraron elementos en esta vista</p>
              <p className="text-xs mt-0.5">Todas las imágenes cumplen con el criterio seleccionado.</p>
            </div>
          ) : (
            filteredDisplayResults.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  item.status === 'valid'
                    ? 'bg-[#161622]/60 border-[#292932]/70 hover:border-emerald-500/40'
                    : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#1b1b23] border border-[#292932] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.status === 'valid' ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                      <span className="text-[11px] text-[#f2ca50] font-medium truncate">• {item.brand}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-[#99907c] bg-[#1b1b23] px-1.5 py-0.5 rounded border border-[#292932]">
                        ID: {item.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          item.status === 'valid' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.reason}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const singleTxt = `ID: ${item.id}\nNombre: ${item.name}\nMarca: ${item.brand}\nURL: ${item.image}`;
                      navigator.clipboard.writeText(singleTxt);
                    }}
                    className="p-1.5 rounded-lg bg-[#1b1b23] hover:bg-[#282834] border border-[#292932] text-[#99907c] hover:text-[#f2ca50] text-[11px] transition-all"
                    title="Copiar datos de esta fragancia"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Plain Text Code Block */}
        <div className="p-4 bg-[#161622] border-t border-[#292932] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#99907c]">
            <span className="font-semibold text-white">
              Vista previa de texto plano ({missingAndErrorItems.length} faltantes detectadas):
            </span>
            <span>Formato listo para exportar</span>
          </div>

          <pre className="p-3 bg-[#0d0d12] border border-[#292932] rounded-xl text-[11px] font-mono text-amber-200/90 overflow-x-auto max-h-28 custom-scrollbar select-all">
            {plainTextList}
          </pre>
        </div>
      </div>
    </div>
  );
};
