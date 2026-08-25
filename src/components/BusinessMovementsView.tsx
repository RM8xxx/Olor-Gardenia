import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Banknote, 
  Boxes,
  Calendar, 
  Camera,
  Check, 
  CheckCircle2, 
  ChevronDown, 
  Clock, 
  CreditCard, 
  DollarSign, 
  FileDown, 
  Filter, 
  Layers, 
  LayoutList,
  Minus, 
  Package, 
  PackageCheck, 
  PackagePlus, 
  Pencil,
  Plus, 
  Printer, 
  Receipt, 
  RefreshCw, 
  ScanLine,
  Search, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  Table,
  Tag, 
  Trash2, 
  TrendingUp, 
  Upload, 
  X 
} from 'lucide-react';
import { CartItem, InventoryMovement, MovementItem, PerfumeProduct, ProductCategory, OcrBatchResult } from '../types';
import { recordSaleInFirebase, recordRestockInFirebase, db, ref, onValue, set } from '../services/firebase';
import { SaleReceiptModal } from './SaleReceiptModal';
import { OcrScannerModal } from './OcrScannerModal';
import { BusinessStockView } from './BusinessStockView';
import { GardeniaIcon } from './LotusIcon';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { triggerAdminActionHaptic } from '../utils/haptics';

interface BusinessMovementsViewProps {
  products: PerfumeProduct[];
  onExitBusinessMode?: () => void;
  onSelectProductDetail?: (product: PerfumeProduct) => void;
  onUpdateProducts?: (products: PerfumeProduct[]) => void;
}

export const BusinessMovementsView: React.FC<BusinessMovementsViewProps> = ({
  products,
  onExitBusinessMode,
  onSelectProductDetail,
}) => {
  // Top level tab: 'nuevo' (Nuevo Movimiento) vs 'movimientos' (Historial) vs 'stock' (Stock y Piezas)
  const [activeTab, setActiveTab] = useState<'nuevo' | 'movimientos' | 'stock'>('stock');

  const handleQuickSaleFromStock = (prod: PerfumeProduct) => {
    handleAddSaleProduct(prod);
    setMovementAction('VENTA');
    setActiveTab('nuevo');
    showNotification(`Agregado a Venta: ${prod.name}`);
  };

  const handleQuickRestockFromStock = (prod: PerfumeProduct) => {
    setRestockCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, addQuantity: item.addQuantity + 1 } : item
        );
      }
      return [...prev, { product: prod, addQuantity: 1, cost: prod.cost || 160 }];
    });
    setMovementAction('ABASTECIMIENTO');
    setActiveTab('nuevo');
    showNotification(`Agregado a Abastecimiento: ${prod.name}`);
  };

  // Submódulo dentro de 'Nuevo Movimiento': 'VENTA' vs 'ABASTECIMIENTO'
  const [movementAction, setMovementAction] = useState<'VENTA' | 'ABASTECIMIENTO'>('VENTA');

  // Realtime movements from Firebase
  const [firebaseMovements, setFirebaseMovements] = useState<InventoryMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState<boolean>(true);
  const [movementsViewMode, setMovementsViewMode] = useState<'feed' | 'table'>('feed');

  // Receipt Modal state
  const [selectedReceiptMovement, setSelectedReceiptMovement] = useState<InventoryMovement | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // OCR Modal state
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [ocrModalMode, setOcrModalMode] = useState<'SALE' | 'RESTOCK'>('SALE');

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Listen to Firebase movimientos/ in real time
  useEffect(() => {
    let isMounted = true;
    const movsRef = ref(db, 'movimientos');

    const unsubscribe = onValue(
      movsRef,
      (snapshot) => {
        if (!isMounted) return;
        setIsLoadingMovements(false);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: InventoryMovement[] = [];
          if (Array.isArray(data)) {
            data.forEach((item) => {
              if (item && item.id) list.push(item);
            });
          } else if (typeof data === 'object') {
            Object.entries(data).forEach(([key, item]: [string, any]) => {
              if (item && typeof item === 'object') {
                list.push({
                  ...item,
                  id: item.id || key,
                });
              }
            });
          }
          // Sort newest first by date and time/timestamp
          list.sort((a, b) => {
            const timeA = new Date(`${a.date} ${a.time || '00:00'}`).getTime() || 0;
            const timeB = new Date(`${b.date} ${b.time || '00:00'}`).getTime() || 0;
            return timeB - timeA;
          });
          setFirebaseMovements(list);
        } else {
          setFirebaseMovements([]);
        }
      },
      (error) => {
        console.warn('Error escuchando movimientos de Firebase:', error);
        setIsLoadingMovements(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Handler for Applying OCR Detection Batch to Venta or Abastecimiento
  const handleApplyOcrBatch = (batchResult: OcrBatchResult) => {
    const isSale = ocrModalMode === 'SALE' || batchResult.items.some(i => i.movementType === 'SALE');
    let totalUnits = 0;

    const normalizeText = (s: string) => 
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ").trim();

    if (isSale) {
      setMovementAction('VENTA');
      setActiveTab('nuevo');

      setSaleCart((prev) => {
        const newCart = [...prev];
        batchResult.items.forEach((item) => {
          const rawNorm = normalizeText(item.matchedProductName || item.rawText || '');
          
          let prod = item.matchedProduct || products.find(p => p.id === item.matchedProductId);
          if (!prod) {
            prod = products.find(p => {
              const pNameNorm = normalizeText(p.name);
              const pBrandNorm = normalizeText(p.brand || '');
              return (
                pNameNorm === rawNorm ||
                pNameNorm.includes(rawNorm) ||
                rawNorm.includes(pNameNorm) ||
                `${pBrandNorm} ${pNameNorm}`.includes(rawNorm)
              );
            });
          }

          if (!prod && products.length > 0) {
            const rawTokens = rawNorm.split(/\s+/).filter(t => t.length > 2);
            prod = products.find(p => {
              const pTokens = normalizeText(p.name).split(/\s+/);
              return rawTokens.some(rt => pTokens.includes(rt));
            });
          }

          if (prod) {
            const qty = Math.max(1, item.quantity || 1);
            totalUnits += qty;
            const existingIdx = newCart.findIndex(it => it.product.id === prod!.id);
            if (existingIdx >= 0) {
              newCart[existingIdx] = {
                ...newCart[existingIdx],
                quantity: newCart[existingIdx].quantity + qty,
              };
            } else {
              newCart.push({
                product: prod,
                quantity: qty,
                unitPrice: item.unitPriceDetected || prod.price || 270,
              });
            }
          }
        });
        return newCart;
      });

      showNotification(`✅ OCR: Se cargaron ${totalUnits} piezas vendidas al carrito de venta.`);
    } else {
      setMovementAction('ABASTECIMIENTO');
      setActiveTab('nuevo');

      setRestockCart((prev) => {
        const newCart = [...prev];
        batchResult.items.forEach((item) => {
          const rawNorm = normalizeText(item.matchedProductName || item.rawText || '');
          
          let prod = item.matchedProduct || products.find(p => p.id === item.matchedProductId);
          if (!prod) {
            prod = products.find(p => {
              const pNameNorm = normalizeText(p.name);
              const pBrandNorm = normalizeText(p.brand || '');
              return (
                pNameNorm === rawNorm ||
                pNameNorm.includes(rawNorm) ||
                rawNorm.includes(pNameNorm) ||
                `${pBrandNorm} ${pNameNorm}`.includes(rawNorm)
              );
            });
          }

          if (!prod && products.length > 0) {
            const rawTokens = rawNorm.split(/\s+/).filter(t => t.length > 2);
            prod = products.find(p => {
              const pTokens = normalizeText(p.name).split(/\s+/);
              return rawTokens.some(rt => pTokens.includes(rt));
            });
          }

          if (prod) {
            const qty = Math.max(1, item.quantity || 1);
            totalUnits += qty;
            const existingIdx = newCart.findIndex(it => it.product.id === prod!.id);
            if (existingIdx >= 0) {
              newCart[existingIdx] = {
                ...newCart[existingIdx],
                addQuantity: newCart[existingIdx].addQuantity + qty,
              };
            } else {
              newCart.push({
                product: prod,
                addQuantity: qty,
                cost: item.unitPriceDetected || prod.cost || 160,
              });
            }
          }
        });
        return newCart;
      });

      showNotification(`✅ OCR: Se cargaron ${totalUnits} piezas al lote de abastecimiento.`);
    }
  };

  // Helper date/time functions
  const getCurrentDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // ==========================================
  // ESTADO SUBMÓDULO: VENTA
  // ==========================================
  const [saleDate, setSaleDate] = useState<string>(getCurrentDate());
  const [saleTime, setSaleTime] = useState<string>(getCurrentTime());
  const [saleSearchTerm, setSaleSearchTerm] = useState<string>('');
  const [saleSearchDropdownOpen, setSaleSearchDropdownOpen] = useState<boolean>(false);
  const [saleCart, setSaleCart] = useState<Array<{ product: PerfumeProduct; quantity: number; unitPrice: number }>>([]);
  const [salePaymentMethod, setSalePaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [saleDiscountType, setSaleDiscountType] = useState<'none' | '10' | '15' | '20' | 'custom'>('none');
  const [saleCustomDiscountAmount, setSaleCustomDiscountAmount] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [lastAddedSaleId, setLastAddedSaleId] = useState<string | null>(null);
  const saleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saleDropdownRef.current && !saleDropdownRef.current.contains(e.target as Node)) {
        setSaleSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for sale selector
  const filteredSaleProducts = useMemo(() => {
    if (!saleSearchTerm.trim()) return products.slice(0, 15);
    const q = saleSearchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q))
    ).slice(0, 25);
  }, [products, saleSearchTerm]);

  const handleAddSaleProduct = (prod: PerfumeProduct) => {
    setSaleCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product: prod, quantity: 1, unitPrice: prod.price || 270 }];
    });
    setLastAddedSaleId(prod.id);
    setTimeout(() => {
      setLastAddedSaleId((curr) => (curr === prod.id ? null : curr));
    }, 1200);
  };

  const handleUpdateSaleCartQuantity = (prodId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveSaleCartItem(prodId);
      return;
    }
    setSaleCart((prev) =>
      prev.map((item) => (item.product.id === prodId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveSaleCartItem = (prodId: string) => {
    setSaleCart((prev) => prev.filter((item) => item.product.id !== prodId));
  };

  // Calculations for Sale
  const saleSubtotal = useMemo(() => {
    return saleCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [saleCart]);

  const { saleDiscountPercent, saleDiscountAmount, saleTotalEstimated } = useMemo(() => {
    let percent = 0;
    let amount = 0;
    if (saleDiscountType === '10') {
      percent = 10;
      amount = saleSubtotal * 0.10;
    } else if (saleDiscountType === '15') {
      percent = 15;
      amount = saleSubtotal * 0.15;
    } else if (saleDiscountType === '20') {
      percent = 20;
      amount = saleSubtotal * 0.20;
    } else if (saleDiscountType === 'custom') {
      amount = Math.min(saleSubtotal, Math.max(0, saleCustomDiscountAmount));
      percent = saleSubtotal > 0 ? (amount / saleSubtotal) * 100 : 0;
    }
    const total = Math.max(0, saleSubtotal - amount);
    return {
      saleDiscountPercent: percent,
      saleDiscountAmount: amount,
      saleTotalEstimated: total,
    };
  }, [saleSubtotal, saleDiscountType, saleCustomDiscountAmount]);

  const handleRegisterSale = async () => {
    if (saleCart.length === 0) {
      showNotification('Agrega al menos un perfume al carrito de venta.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload: MovementItem[] = saleCart.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        brand: it.product.brand,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.unitPrice * it.quantity,
        image: it.product.image,
        volume: it.product.volume,
      }));

      const res = await recordSaleInFirebase({
        date: saleDate,
        time: saleTime,
        paymentMethod: salePaymentMethod,
        discountPercent: Math.round(saleDiscountPercent),
        discountAmount: saleDiscountAmount,
        subtotal: saleSubtotal,
        total: saleTotalEstimated,
        items: itemsPayload,
        notes: saleNotes.trim() || undefined,
      });

      if (res.success) {
        showNotification(`✅ Venta registrada con éxito ($${saleTotalEstimated.toFixed(2)})`);
        // Prepare movement for modal review
        const createdMov: InventoryMovement = {
          id: res.movementId || `mov-${Date.now()}`,
          type: 'VENTA',
          date: saleDate,
          time: saleTime,
          quantity: -saleCart.reduce((sum, it) => sum + it.quantity, 0),
          subtotal: saleSubtotal,
          discountPercent: saleDiscountPercent,
          discountAmount: saleDiscountAmount,
          discountApplied: saleDiscountAmount > 0,
          totalPrice: saleTotalEstimated,
          paymentMethod: salePaymentMethod,
          items: itemsPayload,
          notes: saleNotes,
        };
        setSelectedReceiptMovement(createdMov);
        setIsReceiptOpen(true);

        // Reset Sale Form
        setSaleCart([]);
        setSaleDiscountType('none');
        setSaleCustomDiscountAmount(0);
        setSaleNotes('');
      } else {
        showNotification(`❌ Error al registrar venta: ${res.error}`, 'error');
      }
    } catch (err: any) {
      showNotification(`Error: ${err?.message || 'Error desconocido'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ESTADO SUBMÓDULO: ABASTECIMIENTO
  // ==========================================
  const [restockDate, setRestockDate] = useState<string>(getCurrentDate());
  const [restockTime, setRestockTime] = useState<string>(getCurrentTime());
  const [restockNotes, setRestockNotes] = useState<string>('');

  // Mode: REPONER STOCK
  const [restockSearchTerm, setRestockSearchTerm] = useState<string>('');
  const [restockDropdownOpen, setRestockDropdownOpen] = useState<boolean>(false);
  const [restockCart, setRestockCart] = useState<Array<{ product: PerfumeProduct; addQuantity: number; cost: number }>>([]);
  const [lastAddedRestockId, setLastAddedRestockId] = useState<string | null>(null);
  const restockDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (restockDropdownRef.current && !restockDropdownRef.current.contains(e.target as Node)) {
        setRestockDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRestockProducts = useMemo(() => {
    if (!restockSearchTerm.trim()) return products.slice(0, 15);
    const q = restockSearchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q))
    ).slice(0, 25);
  }, [products, restockSearchTerm]);

  const handleAddRestockProduct = (prod: PerfumeProduct) => {
    setRestockCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, addQuantity: item.addQuantity + 1 } : item
        );
      }
      return [...prev, { product: prod, addQuantity: 1, cost: prod.cost || 160 }];
    });
    setLastAddedRestockId(prod.id);
    setTimeout(() => {
      setLastAddedRestockId((curr) => (curr === prod.id ? null : curr));
    }, 1200);
  };

  const handleUpdateRestockQuantity = (prodId: string, newQty: number) => {
    if (newQty <= 0) {
      setRestockCart((prev) => prev.filter((item) => item.product.id !== prodId));
      return;
    }
    setRestockCart((prev) =>
      prev.map((item) => (item.product.id === prodId ? { ...item, addQuantity: newQty } : item))
    );
  };

  const handleRemoveRestockItem = (prodId: string) => {
    setRestockCart((prev) => prev.filter((item) => item.product.id !== prodId));
  };

  const totalRestockUnits = useMemo(() => {
    return restockCart.reduce((sum, item) => sum + item.addQuantity, 0);
  }, [restockCart]);

  const totalRestockCost = useMemo(() => {
    return restockCart.reduce((sum, item) => sum + item.cost * item.addQuantity, 0);
  }, [restockCart]);

  const handleRegisterRestock = async () => {
    if (restockCart.length === 0) {
      showNotification('Selecciona al menos un perfume para reponer stock.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload: MovementItem[] = restockCart.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        brand: it.product.brand,
        quantity: it.addQuantity,
        unitPrice: it.cost,
        totalPrice: it.cost * it.addQuantity,
        image: it.product.image,
        volume: it.product.volume,
      }));

      const res = await recordRestockInFirebase({
        date: restockDate,
        time: restockTime,
        items: itemsPayload,
        notes: restockNotes.trim() || undefined,
      });

      if (res.success) {
        showNotification(`✅ Abastecimiento registrado (${totalRestockUnits} unidades añadidas al inventario).`);
        setRestockCart([]);
        setRestockNotes('');
      } else {
        showNotification(`❌ Error al registrar abastecimiento: ${res.error}`, 'error');
      }
    } catch (err: any) {
      showNotification(`Error: ${err?.message || 'Error desconocido'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ESTADÍSTICAS Y FEED DE MOVIMIENTOS
  // ==========================================
  const todayStr = getCurrentDate();
  const [feedFilterType, setFeedFilterType] = useState<'TODOS' | 'VENTA' | 'ABASTECIMIENTO'>('TODOS');
  const [feedSearchTerm, setFeedSearchTerm] = useState<string>('');

  const todaySalesMovements = useMemo(() => {
    return firebaseMovements.filter(
      (m) => (m.date === todayStr || m.date === '2026-08-24') && m.type === 'VENTA'
    );
  }, [firebaseMovements, todayStr]);

  const todaySalesTotal = useMemo(() => {
    return todaySalesMovements.reduce((sum, m) => sum + Math.abs(m.totalPrice || 0), 0);
  }, [todaySalesMovements]);

  const todayPerfumesSold = useMemo(() => {
    return todaySalesMovements.reduce((sum, m) => {
      if (m.items && m.items.length > 0) {
        return sum + m.items.reduce((iSum, i) => iSum + i.quantity, 0);
      }
      return sum + Math.abs(m.quantity || 0);
    }, 0);
  }, [todaySalesMovements]);

  // Group filtered movements by date
  const filteredFeedMovements = useMemo(() => {
    return firebaseMovements.filter((m) => {
      if (feedFilterType === 'VENTA' && m.type !== 'VENTA') return false;
      if (feedFilterType === 'ABASTECIMIENTO' && m.type !== 'ABASTECER' && (m.type as any) !== 'ABASTECIMIENTO') return false;
      if (feedSearchTerm.trim()) {
        const q = feedSearchTerm.toLowerCase();
        const matchesNote = m.notes && m.notes.toLowerCase().includes(q);
        const matchesPay = m.paymentMethod && m.paymentMethod.toLowerCase().includes(q);
        const matchesItem = m.items?.some(
          (it) => it.productName.toLowerCase().includes(q) || it.brand.toLowerCase().includes(q)
        );
        if (!matchesNote && !matchesPay && !matchesItem) return false;
      }
      return true;
    });
  }, [firebaseMovements, feedFilterType, feedSearchTerm]);

  const groupedFeedMovements = useMemo<Record<string, InventoryMovement[]>>(() => {
    const groups: Record<string, InventoryMovement[]> = {};
    filteredFeedMovements.forEach((mov) => {
      const d = mov.date || 'Sin Fecha';
      if (!groups[d]) groups[d] = [];
      groups[d].push(mov);
    });
    return groups;
  }, [filteredFeedMovements]);

  // Excel Table Sorting and Filtering State
  const [tableSortColumn, setTableSortColumn] = useState<string>('date');
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleTableSort = (column: string) => {
    if (tableSortColumn === column) {
      setTableSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortColumn(column);
      setTableSortDirection('asc');
    }
  };

  const sortedTableMovements = useMemo(() => {
    const list = [...filteredFeedMovements];
    return list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (tableSortColumn === 'date') {
        valA = `${a.date || ''} ${a.time || ''}`;
        valB = `${b.date || ''} ${b.time || ''}`;
      } else if (tableSortColumn === 'type') {
        valA = a.type || '';
        valB = b.type || '';
      } else if (tableSortColumn === 'items') {
        valA = a.items?.map(i => i.productName).join(', ') || '';
        valB = b.items?.map(i => i.productName).join(', ') || '';
      } else if (tableSortColumn === 'pzs') {
        valA = a.items?.reduce((s, i) => s + i.quantity, 0) || Math.abs(a.quantity || 0);
        valB = b.items?.reduce((s, i) => s + i.quantity, 0) || Math.abs(b.quantity || 0);
      } else if (tableSortColumn === 'paymentMethod') {
        valA = a.paymentMethod || '';
        valB = b.paymentMethod || '';
      } else if (tableSortColumn === 'discount') {
        valA = a.discountAmount || 0;
        valB = b.discountAmount || 0;
      } else if (tableSortColumn === 'total') {
        valA = Math.abs(a.totalPrice || 0);
        valB = Math.abs(b.totalPrice || 0);
      } else if (tableSortColumn === 'notes') {
        valA = a.notes || '';
        valB = b.notes || '';
      }

      if (valA < valB) return tableSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return tableSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredFeedMovements, tableSortColumn, tableSortDirection]);

  const handleExportCsv = () => {
    const headers = ['Fecha', 'Hora', 'Tipo', 'Articulos', 'Piezas', 'Metodo Pago', 'Descuento', 'Total', 'Notas'];
    const rows = filteredFeedMovements.map(m => {
      const itemsStr = m.items?.map(i => `${i.quantity}x ${i.productName}`).join(' | ') || `${Math.abs(m.quantity || 0)} perfumes`;
      const pzs = m.items?.reduce((s, i) => s + i.quantity, 0) || Math.abs(m.quantity || 0);
      return [
        `"${m.date || ''}"`,
        `"${m.time || ''}"`,
        `"${m.type || ''}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        pzs,
        `"${m.paymentMethod || ''}"`,
        m.discountAmount || 0,
        Math.abs(m.totalPrice || 0),
        `"${(m.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `movimientos_olor_gardenia_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("¡Archivo Excel/CSV exportado con éxito!");
  };

  // Editing movement state
  const [editingMovement, setEditingMovement] = useState<InventoryMovement | null>(null);
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('Efectivo');
  const [editDiscountAmount, setEditDiscountAmount] = useState<number>(0);
  const [editTotalPrice, setEditTotalPrice] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editItems, setEditItems] = useState<MovementItem[]>([]);

  const handleOpenEdit = (mov: InventoryMovement) => {
    setEditingMovement(mov);
    setEditPaymentMethod(mov.paymentMethod || 'Efectivo');
    setEditDiscountAmount(mov.discountAmount || 0);
    setEditTotalPrice(Math.abs(mov.totalPrice || 0));
    setEditNotes(mov.notes || '');
    setEditItems(
      mov.items && mov.items.length > 0
        ? JSON.parse(JSON.stringify(mov.items))
        : mov.productName
        ? [{
            productId: mov.perfumeId || '',
            productName: mov.productName,
            brand: mov.brand || '',
            quantity: Math.abs(mov.quantity),
            unitPrice: mov.unitPrice || (Math.abs(mov.totalPrice) / Math.max(1, Math.abs(mov.quantity))),
            totalPrice: Math.abs(mov.totalPrice || 0),
            image: '',
            volume: ''
          }]
        : []
    );
  };

  const handleSaveEditMovement = async () => {
    if (!editingMovement || !editingMovement.id) return;
    try {
      const itemsSum = editItems.reduce((acc, it) => acc + (it.totalPrice || (it.unitPrice * it.quantity)), 0);
      const calculatedTotal = Math.max(0, itemsSum - editDiscountAmount);
      const finalTotal = editTotalPrice > 0 ? editTotalPrice : calculatedTotal;
      const totalQty = editItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0);

      const updated: InventoryMovement = {
        ...editingMovement,
        items: editItems,
        quantity: editingMovement.type === 'VENTA' ? -Math.abs(totalQty) : Math.abs(totalQty),
        paymentMethod: editPaymentMethod,
        discountAmount: editDiscountAmount > 0 ? editDiscountAmount : undefined,
        totalPrice: editingMovement.type === 'VENTA' ? -Math.abs(finalTotal) : Math.abs(finalTotal),
        notes: editNotes.trim() || undefined,
      };
      await set(ref(db, `movimientos/${editingMovement.id}`), updated);
      showNotification("¡Movimiento actualizado correctamente!");
      setEditingMovement(null);
    } catch (err: any) {
      showNotification(`Error al actualizar: ${err?.message || 'Error'}`, 'error');
    }
  };

  const handleDeleteMovement = async () => {
    if (!editingMovement || !editingMovement.id) return;
    if (!window.confirm("¿Estás seguro de eliminar este movimiento del historial?")) return;
    try {
      await set(ref(db, `movimientos/${editingMovement.id}`), null);
      showNotification("Movimiento eliminado correctamente.");
      setEditingMovement(null);
    } catch (err: any) {
      showNotification(`Error al eliminar: ${err?.message || 'Error'}`, 'error');
    }
  };

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === todayStr) return 'HOY • ' + dateStr;
    return dateStr;
  };

  return (
    <div className="w-full min-h-screen bg-[#12131A] text-[#e4e1ed] flex flex-col selection:bg-[#EAB308] selection:text-[#12131A]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#1A1C24]/95 backdrop-blur-xl border-b border-[#2A2C38] px-3 sm:px-6 py-2.5 sm:py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo / Title */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#EAB308] to-[#CA8A04] p-0.5 shadow-lg shadow-[#EAB308]/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#12131A] rounded-[14px] flex items-center justify-center p-1">
                  <GardeniaIcon className="w-full h-full text-[#EAB308]" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight truncate">
                    Gestión de Movimientos
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-[#EAB308]/15 border border-[#EAB308]/30 text-[9px] sm:text-[10px] font-extrabold text-[#EAB308] uppercase tracking-wider shrink-0">
                    Modo Negocio
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#9093A3] font-medium truncate">
                  Ventas, Abastecimiento y Control en Tiempo Real
                </p>
              </div>
            </div>

            {/* Mobile Exit Button */}
            {onExitBusinessMode && (
              <button
                type="button"
                onClick={onExitBusinessMode}
                id="biz-exit-mobile-btn"
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1A1C24] hover:bg-[#252834] text-[#e4e1ed] border border-[#2A2C38] text-[11px] font-bold transition-all active:scale-95 shrink-0"
                title="Cerrar Modo Negocio"
              >
                <X className="w-4 h-4 text-[#EAB308]" />
                <span>Salir</span>
              </button>
            )}
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
            {/* Primary Tab Switcher: 'Nuevo Movimiento' vs 'Movimientos' */}
            <div className="flex items-center bg-[#12131A] p-1 rounded-xl border border-[#2A2C38] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('nuevo')}
                id="biz-tab-nuevo-btn"
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'nuevo'
                    ? 'bg-[#EAB308] text-[#12131A] shadow-md shadow-[#EAB308]/20'
                    : 'text-[#9093A3] hover:text-[#e4e1ed]'
                }`}
                title="Nuevo Movimiento"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Nuevo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stock')}
                id="biz-tab-stock-btn"
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'stock'
                    ? 'bg-[#EAB308] text-[#12131A] shadow-md shadow-[#EAB308]/20'
                    : 'text-[#9093A3] hover:text-[#e4e1ed]'
                }`}
                title="Stock y Piezas"
              >
                <Boxes className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('movimientos')}
                id="biz-tab-movimientos-btn"
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'movimientos'
                    ? 'bg-[#EAB308] text-[#12131A] shadow-md shadow-[#EAB308]/20'
                    : 'text-[#9093A3] hover:text-[#e4e1ed]'
                }`}
                title="Historial"
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Historial</span>
                {firebaseMovements.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold shrink-0 ${
                    activeTab === 'movimientos' ? 'bg-[#12131A] text-[#EAB308]' : 'bg-[#2A2C38] text-[#9093A3]'
                  }`}>
                    {firebaseMovements.length}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Exit to Showroom button */}
            {onExitBusinessMode && (
              <button
                type="button"
                onClick={onExitBusinessMode}
                id="biz-exit-btn"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1C24] hover:bg-[#252834] text-[#e4e1ed] hover:text-[#EAB308] border border-[#2A2C38] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                title="Cerrar Modo Negocio"
              >
                <X className="w-4 h-4 text-[#EAB308]" />
                <span>Salir de Modo Negocio</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global Feedback Toast */}
      {feedback && (
        <div className="fixed top-16 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md ${
              feedback.type === 'success'
                ? 'bg-[#132217]/95 border-[#22c55e]/60 text-[#4ade80]'
                : 'bg-[#2b1616]/95 border-[#ef4444]/60 text-[#f87171]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
            ) : (
              <X className="w-4 h-4 text-[#f87171]" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-3 sm:p-6 flex-1 flex flex-col gap-4 sm:gap-6">
        {/* ==================================================================== */}
        {/* PESTAÑA: STOCK Y PIEZAS */}
        {/* ==================================================================== */}
        {activeTab === 'stock' && (
          <BusinessStockView
            products={products}
            onQuickSale={handleQuickSaleFromStock}
            onQuickRestock={handleQuickRestockFromStock}
            onSelectProductDetail={onSelectProductDetail}
          />
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 1: NUEVO MOVIMIENTO (VENTA / ABASTECIMIENTO) */}
        {/* ==================================================================== */}
        {activeTab === 'nuevo' && (
          <div className="w-full flex flex-col gap-4 sm:gap-6">
            {/* Top Switcher: VENTA vs ABASTECIMIENTO */}
            <div className="flex items-center justify-center">
              <div className="inline-flex w-full sm:w-auto p-1 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] shadow-lg">
                <button
                  type="button"
                  onClick={() => setMovementAction('VENTA')}
                  id="biz-switch-venta-btn"
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                    movementAction === 'VENTA'
                      ? 'bg-gradient-to-r from-[#EAB308] to-[#CA8A04] text-[#12131A] shadow-md shadow-[#EAB308]/25'
                      : 'text-[#9093A3] hover:text-white'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>VENTA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementAction('ABASTECIMIENTO')}
                  id="biz-switch-abastecimiento-btn"
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                    movementAction === 'ABASTECIMIENTO'
                      ? 'bg-gradient-to-r from-[#EAB308] to-[#CA8A04] text-[#12131A] shadow-md shadow-[#EAB308]/25'
                      : 'text-[#9093A3] hover:text-white'
                  }`}
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>ABASTECIMIENTO</span>
                </button>
              </div>
            </div>

            {/* SUBMÓDULO: VENTA */}
            {movementAction === 'VENTA' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                {/* Left Column: Selector de productos, Fecha/Hora & Catálogo */}
                <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5">
                  {/* Card: Configuración de Fecha, Hora y Búsqueda */}
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] shadow-xl flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center justify-between border-b border-[#2A2C38] pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#EAB308]" />
                        <h2 className="text-sm sm:text-base font-black text-white">Registro de Venta</h2>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOcrModalMode('SALE');
                            setIsOcrModalOpen(true);
                          }}
                          id="biz-btn-ocr-venta"
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#EAB308]/15 hover:bg-[#EAB308]/25 text-[#EAB308] border border-[#EAB308]/30 hover:border-[#EAB308] text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer"
                          title="Escanear libreta de ventas o foto con OCR inteligente"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Modo OCR</span>
                        </button>

                        <span className="hidden md:inline text-xs text-[#9093A3] font-medium">
                          Resta stock en tiempo real
                        </span>
                      </div>
                    </div>

                    {/* Fecha y Hora actuales editables */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#EAB308]" />
                          <span>Fecha</span>
                        </label>
                        <input
                          type="date"
                          value={saleDate}
                          onChange={(e) => setSaleDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
                          <span>Hora</span>
                        </label>
                        <input
                          type="time"
                          value={saleTime}
                          onChange={(e) => setSaleTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-white focus:outline-none focus:border-[#EAB308] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Selector / Buscador reactivo de perfumes de Firebase */}
                    <div className="relative" ref={saleDropdownRef}>
                      <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-[#EAB308]" />
                          <span>Buscar Perfume en Catálogo</span>
                        </span>
                        <span className="text-[10px] text-[#EAB308]">
                          {products.length} fragancias disponibles
                        </span>
                      </label>

                      <div className="relative">
                        <Search className="w-4 h-4 text-[#9093A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={saleSearchTerm}
                          onChange={(e) => {
                            setSaleSearchTerm(e.target.value);
                            setSaleSearchDropdownOpen(true);
                          }}
                          onFocus={() => setSaleSearchDropdownOpen(true)}
                          placeholder="Escribe el nombre del perfume o marca (ej. Sauvage, Creed, Jean Paul)..."
                          className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-semibold text-white placeholder-[#9093A3] focus:outline-none focus:border-[#EAB308] transition-colors"
                        />
                        {saleSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setSaleSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9093A3] hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown de sugerencias */}
                      {saleSearchDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-[#1A1C24] border border-[#2A2C38] rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-30 custom-scrollbar p-1.5 flex flex-col divide-y divide-[#2A2C38]/40">
                          <div className="p-2 text-[10px] uppercase tracking-wider font-bold text-[#EAB308] bg-[#12131A]/80 rounded-xl mb-1 flex items-center justify-between">
                            <span>Selecciona uno o varios perfumes:</span>
                            <span className="text-[#9093A3] normal-case">El buscador permanecerá abierto</span>
                          </div>

                          {filteredSaleProducts.length === 0 ? (
                            <div className="p-4 text-center text-xs text-[#9093A3]">
                              No se encontraron fragancias que coincidan con '{saleSearchTerm}'
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {filteredSaleProducts.map((p) => {
                                const isOutOfStock = (p.stock || 0) <= 0;
                                const inCartItem = saleCart.find((it) => it.product.id === p.id);
                                const isJustAdded = lastAddedSaleId === p.id;

                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleAddSaleProduct(p)}
                                    className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all group ${
                                      isJustAdded
                                        ? 'bg-[#EAB308]/20 border border-[#EAB308]'
                                        : inCartItem
                                        ? 'bg-[#12131A] border border-[#EAB308]/30'
                                        : 'hover:bg-[#12131A] border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-lg bg-[#12131A] border border-[#2A2C38] overflow-hidden shrink-0 flex items-center justify-center relative">
                                        {p.image ? (
                                          <img src={getOptimizedImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Sparkles className="w-4 h-4 text-[#EAB308]" />
                                        )}
                                        {inCartItem && (
                                          <div className="absolute top-0 right-0 bg-[#EAB308] text-[#12131A] text-[9px] font-black rounded-bl px-1">
                                            {inCartItem.quantity}
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-white group-hover:text-[#EAB308] transition-colors truncate">
                                          {p.name}
                                        </p>
                                        <p className="text-[10px] text-[#9093A3] truncate">
                                          {p.brand} • {p.volume || '60ml'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {isJustAdded && (
                                        <span className="px-2 py-0.5 rounded-full bg-[#EAB308] text-[#12131A] text-[10px] font-black animate-pulse">
                                          +1 Añadido
                                        </span>
                                      )}

                                      {inCartItem && !isJustAdded && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-[#EAB308]/15 text-[#EAB308] text-[10px] font-bold border border-[#EAB308]/30">
                                          {inCartItem.quantity} en venta
                                        </span>
                                      )}

                                      <div className="text-right">
                                        <p className="text-xs font-extrabold text-[#EAB308]">
                                          ${(p.price || 270).toFixed(2)}
                                        </p>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                            isOutOfStock
                                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                              : 'bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30'
                                          }`}
                                        >
                                          {isOutOfStock ? 'Agotado' : `Stock: ${p.stock}`}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Sticky Footer in Dropdown to Close */}
                          <div className="p-2 border-t border-[#2A2C38] bg-[#12131A] flex items-center justify-between sticky bottom-0 rounded-b-xl mt-1">
                            <span className="text-[11px] text-[#9093A3]">
                              {saleCart.length} perfumes en carrito ({saleCart.reduce((a, b) => a + b.quantity, 0)} uds)
                            </span>
                            <button
                              type="button"
                              onClick={() => setSaleSearchDropdownOpen(false)}
                              className="px-3 py-1 bg-[#EAB308] hover:bg-[#FACC15] text-[#12131A] rounded-lg text-xs font-black transition-colors shadow-sm cursor-pointer"
                            >
                              Listo / Cerrar lista
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de Productos Seleccionados en Venta */}
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] shadow-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#2A2C38] pb-2.5">
                      <h3 className="text-xs font-bold text-[#9093A3] uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#EAB308]" />
                        <span>Perfumes Seleccionados ({saleCart.length})</span>
                      </h3>
                      {saleCart.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSaleCart([])}
                          className="text-[11px] text-[#9093A3] hover:text-red-400 font-semibold cursor-pointer"
                        >
                          Limpiar lista
                        </button>
                      )}
                    </div>

                    {saleCart.length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-[#9093A3]">
                        <Package className="w-8 h-8 opacity-30 text-[#EAB308]" />
                        <p className="text-xs font-medium">No hay perfumes seleccionados para esta venta.</p>
                        <p className="text-[11px] opacity-70">Usa el buscador superior para agregar fragancias.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 divide-y divide-[#2A2C38]/40">
                        {saleCart.map((item) => {
                          const itemTotal = item.unitPrice * item.quantity;
                          return (
                            <div
                              key={item.product.id}
                              className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#12131A] border border-[#2A2C38] overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.product.image ? (
                                    <img
                                      src={getOptimizedImageUrl(item.product.image)}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-[#EAB308]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">
                                    {item.product.name}
                                  </p>
                                  <p className="text-[10px] text-[#9093A3] truncate">
                                    {item.product.brand} • ${item.unitPrice.toFixed(2)} c/u
                                  </p>
                                </div>
                              </div>

                              {/* Unit quantity selector and remove */}
                              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-11 sm:pl-0">
                                <div className="flex items-center bg-[#12131A] rounded-xl border border-[#2A2C38] p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSaleCartQuantity(item.product.id, item.quantity - 1)}
                                    className="w-6 h-6 rounded-lg bg-[#1A1C24] hover:bg-[#252834] flex items-center justify-center text-white text-xs font-bold active:scale-95 cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleUpdateSaleCartQuantity(
                                        item.product.id,
                                        parseInt(e.target.value, 10) || 1
                                      )
                                    }
                                    className="w-9 text-center bg-transparent text-xs font-bold text-[#EAB308] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSaleCartQuantity(item.product.id, item.quantity + 1)}
                                    className="w-6 h-6 rounded-lg bg-[#1A1C24] hover:bg-[#252834] flex items-center justify-center text-white text-xs font-bold active:scale-95 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-xs font-black text-white w-14 text-right">
                                  ${itemTotal.toFixed(2)}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveSaleCartItem(item.product.id)}
                                  className="w-7 h-7 rounded-lg bg-[#12131A] hover:bg-red-500/20 text-[#9093A3] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Remover perfume"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Métodos de Pago, Descuentos & Botón Registrar Venta */}
                <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] shadow-xl flex flex-col gap-3.5 sm:gap-4 lg:sticky lg:top-20">
                    <h3 className="text-sm font-black text-white border-b border-[#2A2C38] pb-2 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#EAB308]" />
                      <span>Resumen de Cobro</span>
                    </h3>

                    {/* Métodos de Pago */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1.5">
                        Método de Pago
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => setSalePaymentMethod('Efectivo')}
                          className={`flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            salePaymentMethod === 'Efectivo'
                              ? 'bg-[#EAB308]/15 border-[#EAB308] text-[#EAB308] shadow-md shadow-[#EAB308]/10'
                              : 'bg-[#12131A] border-[#2A2C38] text-[#9093A3] hover:text-white'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                          <span>Efectivo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSalePaymentMethod('Tarjeta')}
                          className={`flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            salePaymentMethod === 'Tarjeta'
                              ? 'bg-[#EAB308]/15 border-[#EAB308] text-[#EAB308] shadow-md shadow-[#EAB308]/10'
                              : 'bg-[#12131A] border-[#2A2C38] text-[#9093A3] hover:text-white'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Tarjeta</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSalePaymentMethod('Transferencia')}
                          className={`flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                            salePaymentMethod === 'Transferencia'
                              ? 'bg-[#EAB308]/15 border-[#EAB308] text-[#EAB308] shadow-md shadow-[#EAB308]/10'
                              : 'bg-[#12131A] border-[#2A2C38] text-[#9093A3] hover:text-white'
                          }`}
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                          <span>Transfer</span>
                        </button>
                      </div>
                    </div>

                    {/* Opciones de Descuento */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-[#EAB308]" />
                          <span>Descuento</span>
                        </span>
                        {saleDiscountAmount > 0 && (
                          <span className="text-[#EAB308] font-black">
                            -${saleDiscountAmount.toFixed(2)}
                          </span>
                        )}
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSaleDiscountType('none')}
                          className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            saleDiscountType === 'none'
                              ? 'bg-[#EAB308] text-[#12131A] border-[#EAB308]'
                              : 'bg-[#12131A] border-[#2A2C38] text-[#9093A3]'
                          }`}
                        >
                          Sin desc.
                        </button>

                        <button
                          type="button"
                          onClick={() => setSaleDiscountType('10')}
                          className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            saleDiscountType === '10'
                              ? 'bg-[#EAB308] text-[#12131A] border-[#EAB308]'
                              : 'bg-[#12131A] border-[#2A2C38] text-[#9093A3]'
                          }`}
                        >
                          Amigo 10%
                        </button>

                        <button
                          type="button"
                          onClick={() => setSaleDiscountType('15')}
                          className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            saleDiscountType === '15'
                              ? 'bg-[#EAB308] text-[#12131A] border-[#EAB308]'
                              : 'bg-[#12131A] border-[#2A2C38] text-[#9093A3]'
                          }`}
                        >
                          15%
                        </button>

                        <button
                          type="button"
                          onClick={() => setSaleDiscountType('custom')}
                          className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            saleDiscountType === 'custom'
                              ? 'bg-[#EAB308] text-[#12131A] border-[#EAB308]'
                              : 'bg-[#12131A] border-[#2A2C38] text-[#9093A3]'
                          }`}
                        >
                          Monto $
                        </button>
                      </div>

                      {saleDiscountType === 'custom' && (
                        <div className="mt-1.5">
                          <input
                            type="number"
                            min="0"
                            placeholder="Monto de descuento en $"
                            value={saleCustomDiscountAmount || ''}
                            onChange={(e) => setSaleCustomDiscountAmount(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-white focus:outline-none focus:border-[#EAB308]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Notas Opcionales */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1">
                        Nota de la Venta (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Cliente frecuente, entregado en plaza..."
                        value={saleNotes}
                        onChange={(e) => setSaleNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs text-white focus:outline-none focus:border-[#EAB308]"
                      />
                    </div>

                    {/* Totales y Cálculo en vivo */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-[#12131A] border border-[#2A2C38] space-y-1.5 sm:space-y-2 mt-1">
                      <div className="flex items-center justify-between text-xs text-[#9093A3]">
                        <span>Subtotal ({saleCart.reduce((acc, it) => acc + it.quantity, 0)} perfumes)</span>
                        <span className="font-bold text-white">${saleSubtotal.toFixed(2)}</span>
                      </div>

                      {saleDiscountAmount > 0 && (
                        <div className="flex items-center justify-between text-xs text-[#EAB308]">
                          <span>Descuento aplicado</span>
                          <span className="font-bold">-${saleDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="border-t border-[#2A2C38] pt-2 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#9093A3]">
                            Total Estimado
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-[#EAB308]">
                            ${saleTotalEstimated.toFixed(2)}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30 text-xs font-extrabold">
                          {salePaymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Botón de Acción 'Registrar Venta' */}
                    <button
                      type="button"
                      onClick={handleRegisterSale}
                      disabled={isSubmitting || saleCart.length === 0}
                      id="biz-btn-registrar-venta"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#EAB308] to-[#CA8A04] hover:from-[#FACC15] hover:to-[#EAB308] text-[#12131A] font-black text-sm transition-all shadow-lg shadow-[#EAB308]/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Registrando Venta en Firebase...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Registrar Venta</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMÓDULO: ABASTECIMIENTO */}
            {movementAction === 'ABASTECIMIENTO' && (
              <div className="flex flex-col gap-6">
                {/* Fecha y Hora de Ingreso */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-[#EAB308] shrink-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white">Abastecimiento de Inventario</h3>
                      <p className="text-[10px] sm:text-[11px] text-[#9093A3]">
                        Suma stock en Firebase y actualiza status a 'Disponible'
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Botón Modo OCR Abastecimiento */}
                    <button
                      type="button"
                      onClick={() => {
                        setOcrModalMode('RESTOCK');
                        setIsOcrModalOpen(true);
                      }}
                      id="biz-btn-ocr-abastecimiento"
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#4ade80]/15 hover:bg-[#4ade80]/25 text-[#4ade80] border border-[#4ade80]/30 hover:border-[#4ade80] text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      title="Escanear factura de proveedor o lista de reabastecimiento con OCR"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Modo OCR</span>
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#12131A] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#2A2C38]">
                      <Calendar className="w-3.5 h-3.5 text-[#EAB308]" />
                      <input
                        type="date"
                        value={restockDate}
                        onChange={(e) => setRestockDate(e.target.value)}
                        className="bg-transparent text-xs font-bold text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#12131A] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#2A2C38]">
                      <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
                      <input
                        type="time"
                        value={restockTime}
                        onChange={(e) => setRestockTime(e.target.value)}
                        className="bg-transparent text-xs font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Buscador & Lista de Reabastecimiento */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                  {/* Left: Buscador & Lista de perfumes a sumar */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <div className="p-3.5 sm:p-5 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] shadow-xl relative" ref={restockDropdownRef}>
                      <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-[#EAB308]" />
                          <span>Buscar Perfume a Abastecer</span>
                        </span>
                        <span className="text-[10px] text-[#EAB308]">
                          Catálogo: {products.length} perfumes
                        </span>
                      </label>

                      <div className="relative">
                        <Search className="w-4 h-4 text-[#9093A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={restockSearchTerm}
                          onChange={(e) => {
                            setRestockSearchTerm(e.target.value);
                            setRestockDropdownOpen(true);
                          }}
                          onFocus={() => setRestockDropdownOpen(true)}
                          placeholder="Buscar perfume a ingresar (ej. Sauvage, Invictus)..."
                          className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-semibold text-white placeholder-[#9093A3] focus:outline-none focus:border-[#EAB308] transition-colors"
                        />
                        {restockSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setRestockSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9093A3] hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown con selección múltiple */}
                      {restockDropdownOpen && (
                        <div className="absolute left-5 right-5 top-full mt-2 bg-[#1A1C24] border border-[#2A2C38] rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-30 custom-scrollbar p-1.5 flex flex-col divide-y divide-[#2A2C38]/40">
                          <div className="p-2 text-[10px] uppercase tracking-wider font-bold text-[#EAB308] bg-[#12131A]/80 rounded-xl mb-1 flex items-center justify-between">
                            <span>Selecciona los perfumes que llegaron:</span>
                            <span className="text-[#9093A3] normal-case">El buscador permanecerá abierto</span>
                          </div>

                          {filteredRestockProducts.length === 0 ? (
                            <div className="p-4 text-center text-xs text-[#9093A3]">
                              No se encontraron perfumes que coincidan con '{restockSearchTerm}'
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {filteredRestockProducts.map((p) => {
                                const inCartItem = restockCart.find((it) => it.product.id === p.id);
                                const isJustAdded = lastAddedRestockId === p.id;

                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleAddRestockProduct(p)}
                                    className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all group ${
                                      isJustAdded
                                        ? 'bg-[#EAB308]/20 border border-[#EAB308]'
                                        : inCartItem
                                        ? 'bg-[#12131A] border border-[#EAB308]/30'
                                        : 'hover:bg-[#12131A] border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-lg bg-[#12131A] border border-[#2A2C38] overflow-hidden shrink-0 flex items-center justify-center relative">
                                        {p.image ? (
                                          <img src={getOptimizedImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                                        )}
                                        {inCartItem && (
                                          <div className="absolute top-0 right-0 bg-[#EAB308] text-[#12131A] text-[9px] font-black rounded-bl px-1">
                                            +{inCartItem.addQuantity}
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-white group-hover:text-[#EAB308] transition-colors truncate">
                                          {p.name}
                                        </p>
                                        <p className="text-[10px] text-[#9093A3] truncate">
                                          {p.brand} • Stock actual: <span className="text-white font-bold">{p.stock}</span>
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {isJustAdded && (
                                        <span className="px-2 py-0.5 rounded-full bg-[#EAB308] text-[#12131A] text-[10px] font-black animate-pulse">
                                          +1 Añadido
                                        </span>
                                      )}

                                      {inCartItem && !isJustAdded && (
                                        <span className="px-2 py-1 rounded-lg bg-[#EAB308]/15 text-[#EAB308] text-xs font-bold border border-[#EAB308]/30">
                                          +{inCartItem.addQuantity} unidades
                                        </span>
                                      )}

                                      {!inCartItem && (
                                        <span className="px-2 py-1 rounded-lg bg-[#12131A] group-hover:bg-[#EAB308] group-hover:text-[#12131A] text-[#EAB308] text-xs font-bold transition-colors">
                                          + Sumar Stock
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Sticky Footer in Dropdown to Close */}
                          <div className="p-2 border-t border-[#2A2C38] bg-[#12131A] flex items-center justify-between sticky bottom-0 rounded-b-xl mt-1">
                            <span className="text-[11px] text-[#9093A3]">
                              {restockCart.length} modelos listos para abastecer ({totalRestockUnits} uds)
                            </span>
                            <button
                              type="button"
                              onClick={() => setRestockDropdownOpen(false)}
                              className="px-3 py-1 bg-[#EAB308] hover:bg-[#FACC15] text-[#12131A] rounded-lg text-xs font-black transition-colors shadow-sm cursor-pointer"
                            >
                              Listo / Cerrar lista
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista Acumulada de Reabastecimiento */}
                    <div className="p-5 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] shadow-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-[#2A2C38] pb-2.5">
                        <h3 className="text-xs font-bold text-[#9093A3] uppercase tracking-wider flex items-center gap-1.5">
                          <PackagePlus className="w-3.5 h-3.5 text-[#EAB308]" />
                          <span>Productos a Ingresar ({restockCart.length})</span>
                        </h3>
                        {restockCart.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setRestockCart([])}
                            className="text-[11px] text-[#9093A3] hover:text-red-400 font-semibold cursor-pointer"
                          >
                            Limpiar lista
                          </button>
                        )}
                      </div>

                      {restockCart.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-[#9093A3]">
                          <PackagePlus className="w-8 h-8 opacity-30 text-[#EAB308]" />
                          <p className="text-xs font-medium">No hay productos añadidos para reponer.</p>
                          <p className="text-[11px] opacity-70">Busca en el catálogo los perfumes que llegaron del proveedor.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5 divide-y divide-[#2A2C38]/40">
                          {restockCart.map((item) => {
                            const newEstimatedStock = (item.product.stock || 0) + item.addQuantity;
                            return (
                              <div
                                key={item.product.id}
                                className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#12131A] border border-[#2A2C38] overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.product.image ? (
                                      <img
                                        src={getOptimizedImageUrl(item.product.image)}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Sparkles className="w-4 h-4 text-[#EAB308]" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">
                                      {item.product.name}
                                    </p>
                                    <p className="text-[10px] text-[#9093A3] truncate">
                                      {item.product.brand} • Stock: {item.product.stock} ➜ <span className="text-[#4ade80] font-bold">Nuevo: {newEstimatedStock}</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Cantidad a sumar */}
                                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-11 sm:pl-0">
                                  <div className="flex items-center bg-[#12131A] rounded-xl border border-[#2A2C38] p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateRestockQuantity(item.product.id, item.addQuantity - 1)}
                                      className="w-6 h-6 rounded-lg bg-[#1A1C24] hover:bg-[#252834] flex items-center justify-center text-white text-xs font-bold active:scale-95 cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.addQuantity}
                                      onChange={(e) =>
                                        handleUpdateRestockQuantity(
                                          item.product.id,
                                          parseInt(e.target.value, 10) || 1
                                        )
                                      }
                                      className="w-10 text-center bg-transparent text-xs font-bold text-[#EAB308] focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateRestockQuantity(item.product.id, item.addQuantity + 1)}
                                      className="w-6 h-6 rounded-lg bg-[#1A1C24] hover:bg-[#252834] flex items-center justify-center text-white text-xs font-bold active:scale-95 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRestockItem(item.product.id)}
                                    className="w-7 h-7 rounded-lg bg-[#12131A] hover:bg-red-500/20 text-[#9093A3] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Resumen de Abastecimiento & Botón */}
                  <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-20">
                    <div className="p-3.5 sm:p-5 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] shadow-xl flex flex-col gap-3.5 sm:gap-4">
                      <h3 className="text-sm font-black text-white border-b border-[#2A2C38] pb-2 flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-[#EAB308]" />
                        <span>Resumen de Ingreso</span>
                      </h3>

                      <div className="p-3.5 sm:p-4 rounded-xl bg-[#12131A] border border-[#2A2C38] space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#9093A3]">
                          <span>Modelos a reponer</span>
                          <span className="font-bold text-white">{restockCart.length}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#9093A3]">Total Unidades a Sumar</span>
                          <span className="text-base sm:text-lg font-black text-[#EAB308]">{totalRestockUnits} uds.</span>
                        </div>

                        {totalRestockCost > 0 && (
                          <div className="flex items-center justify-between text-xs text-[#9093A3] border-t border-[#2A2C38] pt-2">
                            <span>Costo total estimado</span>
                            <span className="font-bold text-white">${totalRestockCost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1">
                          Notas del Lote (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Factura proveedor #4892, lote nuevo..."
                          value={restockNotes}
                          onChange={(e) => setRestockNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs text-white focus:outline-none focus:border-[#EAB308]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleRegisterRestock}
                        disabled={isSubmitting || restockCart.length === 0}
                        id="biz-btn-registrar-abastecimiento"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#EAB308] to-[#CA8A04] hover:from-[#FACC15] hover:to-[#EAB308] text-[#12131A] font-black text-sm transition-all shadow-lg shadow-[#EAB308]/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Sincronizando a Firebase...</span>
                          </>
                        ) : (
                          <>
                            <PackageCheck className="w-4 h-4" />
                            <span>Registrar Abastecimiento</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 2: MOVIMIENTOS (HISTORIAL Y FEED EN TIEMPO REAL) */}
        {/* ==================================================================== */}
        {activeTab === 'movimientos' && (
          <div className="flex flex-col gap-6">
            {/* Tarjeta Superior con Total Acumulado de VENTAS DE HOY */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1A1C24] via-[#20222D] to-[#1A1C24] border border-[#EAB308]/30 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-[#EAB308]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                    <p className="text-xs font-black tracking-widest uppercase text-[#9093A3]">
                      Ventas de Hoy • {todayStr}
                    </p>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-[#EAB308] mt-1 tracking-tight">
                    ${todaySalesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-[#12131A]/80 border border-[#2A2C38] text-right">
                    <p className="text-xs font-black text-white">{todaySalesMovements.length} transacciones</p>
                    <p className="text-[11px] text-[#EAB308] font-bold mt-0.5">{todayPerfumesSold} perfumes vendidos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de Filtro de Feed */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFeedFilterType('TODOS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    feedFilterType === 'TODOS'
                      ? 'bg-[#EAB308] text-[#12131A] border-[#EAB308]'
                      : 'bg-[#1A1C24] text-[#9093A3] border-[#2A2C38] hover:text-white'
                  }`}
                >
                  Todos ({firebaseMovements.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFeedFilterType('VENTA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    feedFilterType === 'VENTA'
                      ? 'bg-[#EAB308] text-[#12131A] border-[#EAB308]'
                      : 'bg-[#1A1C24] text-[#9093A3] border-[#2A2C38] hover:text-white'
                  }`}
                >
                  Ventas
                </button>

                <button
                  type="button"
                  onClick={() => setFeedFilterType('ABASTECIMIENTO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    feedFilterType === 'ABASTECIMIENTO'
                      ? 'bg-[#EAB308] text-[#12131A] border-[#EAB308]'
                      : 'bg-[#1A1C24] text-[#9093A3] border-[#2A2C38] hover:text-white'
                  }`}
                >
                  Abastecimientos
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#9093A3] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en movimientos..."
                  value={feedSearchTerm}
                  onChange={(e) => setFeedSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1A1C24] border border-[#2A2C38] text-xs text-white placeholder-[#9093A3] focus:outline-none focus:border-[#EAB308]"
                />
              </div>
            </div>

            {/* View Mode Toggle: Tarjetas vs Tabla Excel */}
            <div className="flex items-center justify-between bg-[#1A1C24] border border-[#2A2C38] px-4 py-2.5 rounded-2xl">
              <span className="text-xs font-bold text-[#9093A3]">Visualización de Movimientos:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMovementsViewMode('feed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    movementsViewMode === 'feed'
                      ? 'bg-[#EAB308] text-[#12131A] shadow-md shadow-[#EAB308]/25'
                      : 'bg-[#12131A] text-[#9093A3] hover:text-white border border-[#2A2C38]'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Tarjetas</span>
                </button>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => setMovementsViewMode('table')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      movementsViewMode === 'table'
                        ? 'bg-[#EAB308] text-[#12131A] shadow-md shadow-[#EAB308]/25'
                        : 'bg-[#12131A] text-[#9093A3] hover:text-white border border-[#2A2C38]'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>📊 Tabla Excel</span>
                  </button>
                  <span className="text-[10px] text-[#9093A3] italic">💡 Recomendado verlo en PC</span>
                </div>
              </div>
            </div>

            {/* Feed Agrupado por Fecha o Tabla Excel */}
            {isLoadingMovements ? (
              <div className="py-16 text-center text-[#9093A3] flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#EAB308]" />
                <p className="text-xs font-bold">Cargando movimientos de Firebase en tiempo real...</p>
              </div>
            ) : Object.keys(groupedFeedMovements).length === 0 ? (
              <div className="py-16 text-center bg-[#1A1C24] border border-[#2A2C38] rounded-3xl p-8 flex flex-col items-center justify-center gap-2 text-[#9093A3]">
                <Receipt className="w-10 h-10 opacity-30 text-[#EAB308]" />
                <p className="text-sm font-bold text-white">No hay movimientos registrados.</p>
                <p className="text-xs">Registra tu primera venta o abastecimiento en la pestaña 'Nuevo Movimiento'.</p>
              </div>
            ) : movementsViewMode === 'table' ? (
              <div className="flex flex-col gap-4">
                {/* Excel Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1A1C24] border border-[#2A2C38] p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-[#EAB308]" />
                      <span>Tabla Excel Interactiva</span>
                    </span>
                    <span className="text-[11px] text-[#9093A3]">
                      (Haz clic en cualquier cabecera para ordenar/filtrar)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="px-3.5 py-2 rounded-xl bg-[#2A2C38] hover:bg-[#323546] text-[#EAB308] border border-[#EAB308]/30 font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <FileDown className="w-4 h-4 text-[#EAB308]" />
                      <span>Descargar a Excel (CSV)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-[#2A2C38] bg-[#12131A] shadow-2xl">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#1A1C24] text-[#9093A3] font-black uppercase tracking-wider border-b border-[#2A2C38]">
                        <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('date')}>
                          <div className="flex items-center gap-1.5">
                            <span>Fecha / Hora</span>
                            {tableSortColumn === 'date' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('type')}>
                          <div className="flex items-center gap-1.5">
                            <span>Tipo</span>
                            {tableSortColumn === 'type' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('items')}>
                          <div className="flex items-center gap-1.5">
                            <span>Artículos / Detalle</span>
                            {tableSortColumn === 'items' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('pzs')}>
                          <div className="flex items-center justify-center gap-1.5">
                            <span>Pzs</span>
                            {tableSortColumn === 'pzs' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('paymentMethod')}>
                          <div className="flex items-center gap-1.5">
                            <span>Método Pago</span>
                            {tableSortColumn === 'paymentMethod' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('discount')}>
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Descuento</span>
                            {tableSortColumn === 'discount' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('total')}>
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Total ($)</span>
                            {tableSortColumn === 'total' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleTableSort('notes')}>
                          <div className="flex items-center gap-1.5">
                            <span>Notas</span>
                            {tableSortColumn === 'notes' && <span className="text-[#EAB308]">{tableSortDirection === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2C38]">
                      {sortedTableMovements.map((mov, idx) => {
                      const isSale = mov.type === 'VENTA';
                      const items = mov.items || [];
                      const unitsCount = items.length > 0
                        ? items.reduce((sum, it) => sum + it.quantity, 0)
                        : Math.abs(mov.quantity || 0);

                      return (
                        <tr 
                          key={mov.id || idx}
                          className="odd:bg-[#12131A] even:bg-[#161821] hover:bg-[#1F212E] transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedReceiptMovement(mov);
                            setIsReceiptOpen(true);
                          }}
                        >
                          <td className="py-3 px-4 text-[#9093A3] font-medium">
                            {mov.date || '—'} <span className="text-[10px] text-[#9093A3]/70 ml-1">{mov.time || ''}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              isSale ? 'bg-[#EAB308]/20 text-[#EAB308]' : 'bg-[#3b82f6]/20 text-[#60a5fa]'
                            }`}>
                              {isSale ? 'VENTA' : 'ABASTECIMIENTO'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white font-bold max-w-xs truncate" title={items.length > 0 ? items.map((it) => `${it.quantity}x ${it.productName}`).join(', ') : `${unitsCount} perfumes`}>
                            {items.length > 0 
                              ? items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')
                              : `${unitsCount} perfumes`}
                          </td>
                          <td className="py-3 px-4 text-center text-white font-mono-numbers font-bold">
                            {unitsCount}
                          </td>
                          <td className="py-3 px-4 text-[#9093A3]">
                            {mov.paymentMethod || '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-[#EAB308] font-mono-numbers">
                            {mov.discountAmount && mov.discountAmount > 0 ? `$${mov.discountAmount.toFixed(2)}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-[#EAB308] font-black font-mono-numbers text-sm">
                            ${Math.abs(mov.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-[#9093A3] italic max-w-xs truncate" title={mov.notes || ''}>
                            {mov.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-center flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceiptMovement(mov);
                                setIsReceiptOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-[#1A1C24] hover:bg-[#252834] border border-[#2A2C38] text-[#EAB308] font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Ver</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(mov)}
                              className="px-2.5 py-1 rounded-xl bg-[#1A1C24] hover:bg-[#252834] border border-[#2A2C38] text-[#60a5fa] font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            ) : (
              <div className="flex flex-col gap-6">
                {(Object.entries(groupedFeedMovements) as [string, InventoryMovement[]][]).map(([dateStr, movs]) => (
                  <div key={dateStr} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-2">
                      <Calendar className="w-3.5 h-3.5 text-[#EAB308]" />
                      <h3 className="text-xs font-black text-[#9093A3] uppercase tracking-wider">
                        {formatDateHeader(dateStr)}
                      </h3>
                      <span className="text-[10px] text-[#9093A3]">({movs.length})</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {movs.map((mov) => {
                        const isSale = mov.type === 'VENTA';
                        const items = mov.items || [];
                        const unitsCount = items.length > 0
                          ? items.reduce((sum, it) => sum + it.quantity, 0)
                          : Math.abs(mov.quantity || 0);

                        return (
                          <div
                            key={mov.id}
                            onClick={() => {
                              setSelectedReceiptMovement(mov);
                              setIsReceiptOpen(true);
                            }}
                            className="p-4 rounded-2xl bg-[#1A1C24] border border-[#2A2C38] hover:border-[#EAB308]/60 hover:bg-[#20222D] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                          >
                            {/* Left: Info & Items */}
                            <div className="flex items-start gap-3.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  isSale
                                    ? 'bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30'
                                    : 'bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30'
                                }`}
                              >
                                {isSale ? (
                                  <DollarSign className="w-5 h-5" />
                                ) : (
                                  <PackagePlus className="w-5 h-5" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                      isSale
                                        ? 'bg-[#EAB308]/20 text-[#EAB308]'
                                        : 'bg-[#3b82f6]/20 text-[#60a5fa]'
                                    }`}
                                  >
                                    {isSale ? 'VENTA' : 'ABASTECIMIENTO'}
                                  </span>

                                  <span className="text-xs text-[#9093A3] font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#9093A3]" />
                                    <span>{mov.time || '00:00'}</span>
                                  </span>

                                  {isSale && mov.paymentMethod && (
                                    <span className="text-[10px] text-[#9093A3] px-2 py-0.5 rounded-md bg-[#12131A] border border-[#2A2C38]">
                                      {mov.paymentMethod}
                                    </span>
                                  )}

                                  {mov.discountAmount && mov.discountAmount > 0 ? (
                                    <span className="text-[10px] text-[#EAB308] font-bold">
                                      Desc. -${mov.discountAmount.toFixed(2)}
                                    </span>
                                  ) : null}
                                </div>

                                {/* Items Breakdown */}
                                <div className="mt-1.5">
                                  {items.length > 0 ? (
                                    <p className="text-xs font-bold text-white">
                                      {items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                                    </p>
                                  ) : (
                                    <p className="text-xs font-bold text-white">
                                      {unitsCount} perfumes {isSale ? 'vendidos' : 'ingresados'}
                                    </p>
                                  )}
                                  {mov.notes && (
                                    <p className="text-[11px] text-[#9093A3] italic mt-0.5">
                                      "{mov.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: Total & Action Icons */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-[#2A2C38] pt-2 sm:pt-0">
                              <div className="text-left sm:text-right">
                                <p className="text-base font-black text-[#EAB308]">
                                  ${Math.abs(mov.totalPrice || 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p className="text-[10px] text-[#9093A3]">{unitsCount} perfumes</p>
                              </div>

                              {/* Action Buttons: Ver Nota / Ticket / Compartir */}
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedReceiptMovement(mov);
                                    setIsReceiptOpen(true);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#12131A] hover:bg-[#252834] border border-[#2A2C38] hover:border-[#EAB308] text-xs font-bold text-[#EAB308] transition-all active:scale-95 cursor-pointer"
                                  title="Ver nota, ticket y opciones de impresión"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Ver Nota</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(mov)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#12131A] hover:bg-[#252834] border border-[#2A2C38] hover:border-[#60a5fa] text-xs font-bold text-[#60a5fa] transition-all active:scale-95 cursor-pointer"
                                  title="Editar movimiento"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Movement Modal */}
      {editingMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#161821] border border-[#2A2C38] rounded-3xl p-6 shadow-2xl text-[#e4e1ed] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#2A2C38] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAB308]/20 flex items-center justify-center text-[#EAB308]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Editar Movimiento ({editingMovement.type})</h3>
                  <p className="text-[11px] text-[#9093A3]">ID: {editingMovement.id} • {editingMovement.date} {editingMovement.time}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMovement(null)}
                className="p-1.5 rounded-xl bg-[#12131A] hover:bg-[#252834] text-[#9093A3] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {editingMovement.type === 'VENTA' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-white focus:outline-none focus:border-[#EAB308]"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1">
                        Descuento ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editDiscountAmount}
                        onChange={(e) => setEditDiscountAmount(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-white focus:outline-none focus:border-[#EAB308]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1">
                        Total Final ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editTotalPrice}
                        onChange={(e) => setEditTotalPrice(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs font-black text-[#EAB308] focus:outline-none focus:border-[#EAB308]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#9093A3] uppercase tracking-wider mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Detalles o correcciones del movimiento..."
                  className="w-full px-3 py-2 rounded-xl bg-[#12131A] border border-[#2A2C38] text-xs text-white focus:outline-none focus:border-[#EAB308] resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12131A] border border-[#2A2C38] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase font-bold text-[#9093A3]">Artículos / Fragancias en este movimiento:</p>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultProd = products[0];
                      if (!defaultProd) return;
                      setEditItems(prev => [
                        ...prev,
                        {
                          productId: defaultProd.id,
                          productName: defaultProd.name,
                          brand: defaultProd.brand,
                          quantity: 1,
                          unitPrice: defaultProd.price || 160,
                          totalPrice: defaultProd.price || 160,
                          image: defaultProd.image,
                          volume: defaultProd.volume || '100ml'
                        }
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#EAB308]/20 hover:bg-[#EAB308]/30 text-[#EAB308] text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Agregar Artículo
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {editItems.map((it, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#1a1c24] border border-[#2a2c38] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-[#9093A3] mb-1">Fragancia / Producto</label>
                          <select
                            value={it.productId}
                            onChange={(e) => {
                              const selectedProd = products.find(p => p.id === e.target.value);
                              if (!selectedProd) return;
                              setEditItems(prev => prev.map((item, i) => i === idx ? {
                                ...item,
                                productId: selectedProd.id,
                                productName: selectedProd.name,
                                brand: selectedProd.brand,
                                unitPrice: selectedProd.price || item.unitPrice,
                                totalPrice: (selectedProd.price || item.unitPrice) * item.quantity,
                                image: selectedProd.image,
                                volume: selectedProd.volume || item.volume
                              } : item));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-white focus:outline-none focus:border-[#EAB308]"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.brand}) - ${p.price}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditItems(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 self-end mb-0.5 transition-colors"
                          title="Eliminar artículo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#9093A3] mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => {
                              const qty = Math.max(1, Number(e.target.value) || 1);
                              setEditItems(prev => prev.map((item, i) => i === idx ? {
                                ...item,
                                quantity: qty,
                                totalPrice: qty * item.unitPrice
                              } : item));
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-white focus:outline-none focus:border-[#EAB308]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#9093A3] mb-1">Precio Unitario ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={it.unitPrice}
                            onChange={(e) => {
                              const up = Number(e.target.value) || 0;
                              setEditItems(prev => prev.map((item, i) => i === idx ? {
                                ...item,
                                unitPrice: up,
                                totalPrice: item.quantity * up
                              } : item));
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-[#12131A] border border-[#2A2C38] text-xs font-bold text-[#EAB308] focus:outline-none focus:border-[#EAB308]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {editItems.length === 0 && (
                    <p className="text-xs text-red-400 italic text-center py-2">No hay artículos en este movimiento.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2A2C38]">
              <button
                type="button"
                onClick={handleDeleteMovement}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Movimiento</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMovement(null)}
                  className="px-4 py-2 rounded-xl bg-[#12131A] hover:bg-[#252834] text-xs font-bold text-[#9093A3] hover:text-white border border-[#2A2C38]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditMovement}
                  className="px-4 py-2 rounded-xl bg-[#EAB308] hover:bg-[#d9a206] text-[#12131A] text-xs font-black shadow-md shadow-[#EAB308]/20 transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Receipt & Ticket Modal */}
      {selectedReceiptMovement && (
        <SaleReceiptModal
          isOpen={isReceiptOpen}
          movement={selectedReceiptMovement}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedReceiptMovement(null);
          }}
        />
      )}

      {/* OCR Scanner Modal (Venta & Abastecimiento) */}
      <OcrScannerModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        products={products}
        mode={ocrModalMode}
        onApplyBatchToInventory={handleApplyOcrBatch}
      />
    </div>
  );
};
