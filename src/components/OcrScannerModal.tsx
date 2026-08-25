import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  Check, 
  ShieldCheck,
  ImageIcon,
  ShoppingBag,
  PackagePlus
} from 'lucide-react';
import { OcrBatchResult, OcrBatchItem, PerfumeProduct } from '../types';

interface OcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PerfumeProduct[];
  mode?: 'SALE' | 'RESTOCK';
  onApplyBatchToInventory: (batchResult: OcrBatchResult) => void;
}

export const OcrScannerModal: React.FC<OcrScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  mode = 'SALE',
  onApplyBatchToInventory,
}) => {
  const [currentMode, setCurrentMode] = useState<'SALE' | 'RESTOCK'>(mode);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // OCR Batch Result state
  const [batchResult, setBatchResult] = useState<OcrBatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Sync mode whenever modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      setSelectedImage(null);
      setBatchResult(null);
      setErrorMsg(null);
      setNotesText('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const isSaleMode = currentMode === 'SALE';

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setBatchResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Camera capture
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setErrorMsg("No se pudo acceder a la cámara. Puedes seleccionar o subir una foto directamente.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      setBatchResult(null);
    }
    stopCamera();
    setActiveTab('upload');
  };

  // Run Gemini OCR Engine
  const runGeminiOcr = async () => {
    if (!selectedImage && !notesText.trim()) {
      setErrorMsg("Por favor sube una foto o escribe texto de la nota para escanear.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setWebhookStatus('idle');

    try {
      const knownCatalogNames = products.map(p => p.name);

      const response = await fetch('/api/gemini/ocr-notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          notesText: notesText,
          knownCatalog: knownCatalogNames,
          targetMode: currentMode,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Error al procesar libreta con OCR");
      }

      // Normalization helper for accurate matching
      const normalizeText = (s: string) => 
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ").trim();

      // Format items with UUID and product match mapping
      const rawData = json.data;
      const formattedItems: OcrBatchItem[] = (rawData.items || []).map((item: any, idx: number) => {
        const rawNorm = normalizeText(item.matchedProductName || item.rawText || '');
        
        // Attempt strict or fuzzy product matching
        let matched = products.find(p => {
          const pNameNorm = normalizeText(p.name);
          const pBrandNorm = normalizeText(p.brand || '');
          return (
            pNameNorm === rawNorm ||
            pNameNorm.includes(rawNorm) ||
            rawNorm.includes(pNameNorm) ||
            `${pBrandNorm} ${pNameNorm}`.includes(rawNorm) ||
            rawNorm.includes(`${pBrandNorm} ${pNameNorm}`)
          );
        });

        // Secondary token match (e.g. "sauvage", "aventus", "one million", "eros", "good girl")
        if (!matched) {
          const rawTokens = rawNorm.split(/\s+/).filter(t => t.length > 2);
          matched = products.find(p => {
            const pTokens = normalizeText(p.name).split(/\s+/);
            return rawTokens.some(rt => pTokens.includes(rt));
          });
        }

        return {
          id: `item-${Date.now()}-${idx}`,
          rawText: item.rawText || '',
          matchedProductName: matched ? matched.name : (item.matchedProductName || 'Fragancia No Identificada'),
          matchedProductId: matched?.id || '',
          quantity: Math.max(1, Number(item.quantity) || 1),
          movementType: currentMode, // Strictly respect active mode (SALE vs RESTOCK)
          unitPriceDetected: item.unitPriceDetected || (currentMode === 'SALE' ? matched?.price : matched?.cost) || null,
          requiresHumanReview: Boolean(item.requiresHumanReview || !matched),
          isConfirmed: Boolean(matched && !item.requiresHumanReview),
          brand: matched?.brand,
          matchedProduct: matched,
        };
      });

      setBatchResult({
        batchId: rawData.batchId || `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
        extractionConfidence: rawData.extractionConfidence || 'HIGH',
        totalItemsDetected: formattedItems.length,
        items: formattedItems,
        imageUrl: selectedImage || undefined,
        timestamp: new Date().toLocaleTimeString(),
        source: 'Motor OCR Inteligente',
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al conectar con el motor de escaneo inteligente");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Switch mode and update items if already parsed
  const handleModeChange = (newMode: 'SALE' | 'RESTOCK') => {
    setCurrentMode(newMode);
    if (batchResult) {
      const updatedItems = batchResult.items.map(item => ({
        ...item,
        movementType: newMode,
      }));
      setBatchResult({ ...batchResult, items: updatedItems });
    }
  };

  // Update row in batch result
  const handleUpdateItem = (index: number, updates: Partial<OcrBatchItem>) => {
    if (!batchResult) return;
    const newItems = [...batchResult.items];
    newItems[index] = { ...newItems[index], ...updates };
    setBatchResult({ ...batchResult, items: newItems });
  };

  // Approve a single item
  const handleApproveItem = (index: number) => {
    handleUpdateItem(index, { requiresHumanReview: false, isConfirmed: true });
  };

  // Trigger Antigravity Webhook
  const handleDispatchWebhook = async () => {
    if (!batchResult) return;
    setWebhookStatus('sending');

    try {
      await fetch('/api/webhook/antigravity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batchResult.batchId,
          items: batchResult.items,
          timestamp: new Date().toISOString(),
          targetUrl: 'https://api.antigravity.internal/v1/reconciliations',
        }),
      });
      setWebhookStatus('success');
    } catch (err) {
      console.error("Webhook error:", err);
      setWebhookStatus('idle');
    }
  };

  // Apply to store inventory
  const handleApplyToInventory = () => {
    if (!batchResult) return;
    onApplyBatchToInventory(batchResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#13131b] border border-[#f2ca50]/30 rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#292932] bg-[#16161e] shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
              isSaleMode 
                ? 'bg-gradient-to-tr from-[#f2ca50] to-[#ffe088] text-[#13131b] shadow-[#f2ca50]/20'
                : 'bg-gradient-to-tr from-[#4edea3] to-[#7fffc5] text-[#13131b] shadow-[#4edea3]/20'
            }`}>
              {isSaleMode ? (
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <PackagePlus className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-[#e4e1ed] flex items-center gap-2">
                {isSaleMode ? 'Escanear Nota de Venta' : 'Escanear Nota de Abastecimiento'}
              </h3>
              <p className="text-xs text-[#99907c]">
                {isSaleMode
                  ? 'Detecta el nombre del perfume y las piezas vendidas'
                  : 'Detecta el nombre del perfume y las piezas compradas'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            id="ocr-modal-close-btn"
            className="p-2 rounded-xl bg-[#1f1f27] hover:bg-[#292932] text-[#99907c] hover:text-[#e4e1ed] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Mode Selector Tabs: Venta vs Abastecimiento */}
          <div className="bg-[#1b1b23] p-1 rounded-2xl flex items-center border border-[#292932]">
            <button
              type="button"
              onClick={() => handleModeChange('SALE')}
              className={`flex-1 py-2.5 px-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                isSaleMode
                  ? 'bg-[#292932] text-[#f2ca50] border border-[#f2ca50]/30 shadow-sm'
                  : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1f1f27]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Venta (Piezas vendidas)</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('RESTOCK')}
              className={`flex-1 py-2.5 px-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                !isSaleMode
                  ? 'bg-[#292932] text-[#4edea3] border border-[#4edea3]/30 shadow-sm'
                  : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1f1f27]'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              <span>Abastecer (Piezas compradas)</span>
            </button>
          </div>

          {/* Source Tabs: Subir Foto vs Camara */}
          <div className="flex items-center justify-between gap-2 border-b border-[#292932] pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('upload');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-[#f2ca50] text-[#13131b] shadow-sm'
                    : 'bg-[#1b1b23] text-[#99907c] hover:text-[#e4e1ed]'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Subir Foto</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  startCamera();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'camera'
                    ? 'bg-[#f2ca50] text-[#13131b] shadow-sm'
                    : 'bg-[#1b1b23] text-[#99907c] hover:text-[#e4e1ed]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cámara en Vivo</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {selectedImage && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setBatchResult(null);
                }}
                className="text-xs text-[#ff7b72] hover:underline font-medium"
              >
                Quitar foto
              </button>
            )}
          </div>

          {/* Camera live preview */}
          {activeTab === 'camera' && isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-[#f2ca50] max-h-64 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-64 object-cover" />
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-4 px-5 py-2 rounded-full bg-[#f2ca50] text-[#13131b] font-bold text-xs shadow-xl flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar Foto</span>
              </button>
            </div>
          )}

          {/* Selected Image & Text Context Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Preview & Upload Area */}
            <div className="relative rounded-2xl bg-[#1b1b23] border border-[#292932] overflow-hidden p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#99907c]">
                  Foto de la Nota {isSaleMode ? 'de Venta' : 'de Abastecimiento'}
                </span>
                {selectedImage ? (
                  <span className="text-[10px] text-[#4edea3] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Foto cargada
                  </span>
                ) : (
                  <span className="text-[10px] text-[#99907c]">
                    Pendiente
                  </span>
                )}
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 rounded-xl overflow-hidden bg-[#0d0d15] border border-dashed border-[#292932] hover:border-[#f2ca50]/50 cursor-pointer relative flex flex-col items-center justify-center p-3 text-center transition-colors group"
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Nota manuscrita"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="space-y-1.5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#1b1b23] text-[#f2ca50] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#e4e1ed]">
                      Toca para seleccionar o tomar una foto
                    </p>
                    <p className="text-[10px] text-[#99907c]">
                      {isSaleMode ? 'Foto con perfumes y piezas vendidas' : 'Foto con perfumes y piezas compradas'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transcription / Notes Context */}
            <div className="rounded-2xl bg-[#1b1b23] border border-[#292932] p-3 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#99907c]">
                    Texto o apuntes adicionales (Opcional)
                  </span>
                </div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder={
                    isSaleMode
                      ? "Ej: '2 Sauvage, 1 Good Girl vendidas ayer'..."
                      : "Ej: '5 One Million, 3 Sauvage compradas al distribuidor'..."
                  }
                  className="w-full h-28 p-2.5 rounded-xl bg-[#13131b] border border-[#292932] text-xs font-mono-numbers text-[#e4e1ed] placeholder-[#99907c] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              {/* Action: Run Analysis */}
              <button
                type="button"
                onClick={runGeminiOcr}
                disabled={isAnalyzing || (!selectedImage && !notesText.trim())}
                id="ocr-run-gemini-btn"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSaleMode
                    ? 'bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] shadow-[#f2ca50]/20'
                    : 'bg-[#4edea3] hover:bg-[#7fffc5] text-[#13131b] shadow-[#4edea3]/20'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Procesando Nota...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isSaleMode ? 'Escanear Piezas Vendidas' : 'Escanear Piezas Compradas'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Extraction & Reconciliation Table */}
          {batchResult && (
            <div className="space-y-4 pt-2 border-t border-[#292932] animate-fade-in">
              {/* Batch Metadata Header */}
              <div className="p-4 rounded-2xl bg-[#1b1b23] border border-[#292932] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSaleMode ? 'bg-[#f2ca50]/10 text-[#f2ca50]' : 'bg-[#4edea3]/10 text-[#4edea3]'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#e4e1ed]">
                        Lote: <span className="text-[#f2ca50] font-mono-numbers">{batchResult.batchId}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4edea3]/20 text-[#4edea3]">
                        Confianza: {batchResult.extractionConfidence}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#99907c]">
                      {batchResult.items.length} {isSaleMode ? 'fragancias vendidas detectadas' : 'fragancias compradas detectadas'}
                    </p>
                  </div>
                </div>

                {/* Webhook trigger button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDispatchWebhook}
                    disabled={webhookStatus === 'sending'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#292932] hover:bg-[#34343d] text-xs font-bold text-[#f2ca50] border border-[#f2ca50]/30 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{webhookStatus === 'success' ? 'Webhook Enviado ✓' : 'Enviar Webhook'}</span>
                  </button>
                </div>
              </div>

              {/* Table of items with human review badges */}
              <div className="rounded-2xl bg-[#1b1b23] border border-[#292932] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#292932] bg-[#16161e] flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#99907c]">
                    Perfumes y Cantidades Detectadas
                  </h4>
                  {batchResult.items.some(i => i.requiresHumanReview) && (
                    <span className="text-[11px] text-[#ffc37b] font-medium">
                      ⚠️ {batchResult.items.filter(i => i.requiresHumanReview).length} requieren validación
                    </span>
                  )}
                </div>

                <div className="divide-y divide-[#292932] overflow-x-auto">
                  {batchResult.items.map((item, idx) => {
                    const isItemSale = item.movementType === 'SALE';
                    const prodImage = item.matchedProduct?.image;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                          item.requiresHumanReview ? 'bg-[#ffc37b]/5 border-l-4 border-l-[#ffc37b]' : 'hover:bg-[#20202a]'
                        }`}
                      >
                        {/* Left: Product Thumbnail, Raw text vs Standardized Name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Image or Number badge */}
                          <div className="w-11 h-11 rounded-xl bg-[#292932] border border-[#3b3b47] overflow-hidden shrink-0 flex items-center justify-center relative">
                            {prodImage ? (
                              <img src={prodImage} alt={item.matchedProductName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-mono font-bold text-[#99907c]">#{idx + 1}</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base text-[#e4e1ed] truncate">
                                {item.matchedProductName}
                              </span>
                              
                              {/* Movement Type Pill */}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isItemSale
                                    ? 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                                    : 'bg-[#4edea3]/15 text-[#4edea3]'
                                }`}
                              >
                                {isItemSale ? 'VENTA' : 'ABASTECER'}
                              </span>

                              {/* Human Review Yellow Badge */}
                              {item.requiresHumanReview && (
                                <span className="px-2 py-0.5 rounded-full bg-[#f2ca50] text-[#13131b] text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Requiere Validación</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#99907c]">
                              Detectado en nota: <span className="text-[#d0c5af] font-mono font-medium">"{item.rawText}"</span>
                              {item.matchedProduct && (
                                <span className="text-[#99907c]"> • Stock actual: <strong className="text-white">{item.matchedProduct.stock} u.</strong></span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Middle & Right: Quantity Stepper & Controls */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          {/* Quantity Stepper */}
                          <div className="flex items-center bg-[#13131b] rounded-xl border border-[#292932] p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(idx, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-7 h-7 rounded-lg bg-[#1f1f27] hover:bg-[#292932] text-white flex items-center justify-center text-xs active:scale-95 cursor-pointer"
                              title="Disminuir unidades"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-mono font-bold text-xs text-[#e4e1ed]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(idx, { quantity: item.quantity + 1 })}
                              className="w-7 h-7 rounded-lg bg-[#1f1f27] hover:bg-[#292932] text-white flex items-center justify-center text-xs active:scale-95 cursor-pointer"
                              title="Aumentar unidades"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="text-[10px] text-[#99907c] block uppercase font-bold">
                              {isItemSale ? 'Vendido' : 'Comprado'}
                            </span>
                            <span className={`font-mono-numbers text-xs font-black ${
                              isItemSale ? 'text-[#ffb4ab]' : 'text-[#4edea3]'
                            }`}>
                              {isItemSale ? `-${item.quantity} u.` : `+${item.quantity} u.`}
                            </span>
                          </div>

                          {item.requiresHumanReview ? (
                            <button
                              type="button"
                              onClick={() => handleApproveItem(idx)}
                              className="px-3 py-1.5 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] text-xs font-bold flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Aprobar</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-[#4edea3]/10 text-[#4edea3] text-xs font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Validado</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Final Action: Apply to Inventory */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[#99907c]">
                  {isSaleMode
                    ? 'Al confirmar, se descontarán las unidades vendidas del stock y se registrará en movimientos de venta.'
                    : 'Al confirmar, se sumarán las unidades compradas al stock y se registrará en movimientos de abastecimiento.'}
                </p>

                <button
                  type="button"
                  onClick={handleApplyToInventory}
                  id="ocr-apply-to-inventory-btn"
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-extrabold text-sm tracking-wide uppercase transition-all shadow-xl flex items-center justify-center gap-2 text-[#13131b] ${
                    isSaleMode
                      ? 'bg-[#f2ca50] hover:bg-[#ffe088] shadow-[#f2ca50]/20'
                      : 'bg-[#4edea3] hover:bg-[#7fffc5] shadow-[#4edea3]/20'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    {isSaleMode ? 'Confirmar y Registrar Ventas' : 'Confirmar y Aplicar Abastecimiento'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
