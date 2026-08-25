import React, { useState } from 'react';
import { PerfumeProduct } from '../types';
import { Image as ImageIcon, Copy, Check, Download, Upload, RefreshCw, X, AlertCircle } from 'lucide-react';

interface PhotoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PerfumeProduct[];
  onUpdateProductsWithPhotos: (newPhotoMap: Record<string, string>) => void;
}

export const PhotoSyncModal: React.FC<PhotoSyncModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProductsWithPhotos,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportCode, setExportCode] = useState<string>('');
  const [importCode, setImportCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate export JSON mapping normalized perfume names to image URLs/base64
  const handleGenerateExportCode = () => {
    const photoMap: Record<string, string> = {};
    products.forEach((p) => {
      if (p.name && p.image) {
        // Use normalized name as key so perfumes with the same name match across instances
        const normalizedName = p.name.trim().toLowerCase();
        photoMap[normalizedName] = p.image;
      }
    });
    const jsonStr = JSON.stringify(photoMap, null, 2);
    setExportCode(jsonStr);
  };

  const handleCopyExportCode = () => {
    if (!exportCode) {
      handleGenerateExportCode();
    }
    const codeToCopy = exportCode || JSON.stringify(
      products.reduce((acc, p) => {
        if (p.name && p.image) {
          acc[p.name.trim().toLowerCase()] = p.image;
        }
        return acc;
      }, {} as Record<string, string>),
      null,
      2
    );

    navigator.clipboard.writeText(codeToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback
    });
  };

  const handleDownloadJson = () => {
    const photoMap = products.reduce((acc, p) => {
      if (p.name && p.image) {
        acc[p.name.trim().toLowerCase()] = p.image;
      }
      return acc;
    }, {} as Record<string, string>);

    const blob = new Blob([JSON.stringify(photoMap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `olor-gardenia-fotos-perfumes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAndSync = () => {
    setSyncError(null);
    setSyncSuccess(null);

    if (!importCode.trim()) {
      setSyncError('Por favor pega el código de sincronización de fotos.');
      return;
    }

    try {
      const parsed = JSON.parse(importCode.trim());
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('El formato del código no es válido.');
      }

      // Count how many matches will occur
      let matchCount = 0;
      const newPhotoMap: Record<string, string> = {};

      products.forEach((p) => {
        const normName = p.name.trim().toLowerCase();
        // Check exact match or partial match in imported keys
        let foundImage: string | null = null;
        for (const [key, imgVal] of Object.entries(parsed)) {
          if (key === normName || normName.includes(key) || key.includes(normName)) {
            foundImage = imgVal as string;
            break;
          }
        }

        if (foundImage) {
          newPhotoMap[p.id] = foundImage;
          matchCount++;
        }
      });

      if (matchCount === 0) {
        setSyncError('No se encontró coincidencia de nombres de perfumes con el código pegado.');
        return;
      }

      onUpdateProductsWithPhotos(newPhotoMap);
      setSyncSuccess(`¡Sincronización exitosa! Se actualizaron las fotos de ${matchCount} perfumes correctamente.`);
      setTimeout(() => {
        onClose();
        setSyncSuccess(null);
        setImportCode('');
      }, 2000);

    } catch (err: any) {
      setSyncError('Error al leer el código JSON. Verifica que esté completo y correcto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="photo-sync-modal-card"
        className="relative w-full max-w-xl bg-[#181822] border border-[#3b3b4a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2d2d3b] flex items-center justify-between bg-[#13131b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Sincronizar Fotos de Perfumes</h2>
              <p className="text-xs text-[#a09cb0]">Iguala las fotos corregidas con perfumes del mismo nombre</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#252533] hover:bg-[#323246] text-[#a09cb0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2d2d3b] bg-[#13131b]/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'border-[#f2ca50] text-[#f2ca50]'
                : 'border-transparent text-[#a09cb0] hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>1. Copiar Fotos de Aquí</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
              activeTab === 'import'
                ? 'border-[#f2ca50] text-[#f2ca50]'
                : 'border-transparent text-[#a09cb0] hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Sincronizar en Allá</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="bg-[#13131b] p-4 rounded-2xl border border-[#2d2d3b] space-y-2">
                <p className="text-xs sm:text-sm text-[#d0ccde] leading-relaxed">
                  Copia el código de las fotos corregidas en este dispositivo ("aquí") para llevarlo al otro dispositivo ("allá") donde las fotos están incorrectas.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#a09cb0]">Código de Sincronización de Fotos</label>
                  <button
                    type="button"
                    onClick={handleGenerateExportCode}
                    className="text-[11px] text-[#f2ca50] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Actualizar datos
                  </button>
                </div>
                <textarea
                  readOnly
                  value={exportCode || JSON.stringify(
                    products.reduce((acc, p) => {
                      if (p.name && p.image) {
                        acc[p.name.trim().toLowerCase()] = p.image;
                      }
                      return acc;
                    }, {} as Record<string, string>),
                    null,
                    2
                  )}
                  rows={6}
                  className="w-full bg-[#111118] border border-[#2d2d3b] rounded-xl p-3 text-xs font-mono text-[#f2ca50] focus:outline-none resize-none"
                  placeholder="Generando código..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyExportCode}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#f2ca50] hover:bg-[#ffd700] text-[#13131b] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#f2ca50]/20 active:scale-[0.98] transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Código Copiado con Éxito!' : 'Copiar Código de Fotos'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="py-3 px-4 rounded-xl bg-[#252533] hover:bg-[#323246] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-[#f2ca50]" />
                  <span>Descargar Archivo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#13131b] p-4 rounded-2xl border border-[#2d2d3b] space-y-2">
                <p className="text-xs sm:text-sm text-[#d0ccde] leading-relaxed">
                  Pega aquí el código copiado del dispositivo donde ya corregiste las fotos. Los perfumes con el mismo nombre se actualizarán automáticamente.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#a09cb0]">Pegar Código de Fotos</label>
                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  rows={6}
                  placeholder="Pega el código JSON aquí..."
                  className="w-full bg-[#111118] border border-[#2d2d3b] rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#f2ca50] resize-none transition-colors"
                />
              </div>

              {syncError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{syncError}</span>
                </div>
              )}

              {syncSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{syncSuccess}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleImportAndSync}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sincronizar y Actualizar Fotos por Nombre</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2d2d3b] bg-[#13131b] flex items-center justify-between text-[11px] text-[#8e8a9d]">
          <span>Sincronización instantánea por nombre de perfume</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#f2ca50] hover:underline font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
