import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { InventoryView } from './components/InventoryView';
import { DesktopShowroomView } from './components/DesktopShowroomView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AvailabilityInquiryModal } from './components/AvailabilityInquiryModal';
import { DeliveryPointModal } from './components/DeliveryPointModal';
import { FaqModal } from './components/FaqModal';
import { PhotoSyncModal } from './components/PhotoSyncModal';
import { PerfumeQuizModal } from './components/PerfumeQuizModal';
import { PerfumeComparisonModal } from './components/PerfumeComparisonModal';
import { PcModeWarningModal } from './components/PcModeWarningModal';
import { EasterEggModal } from './components/EasterEggModal';
import { PasswordModal } from './components/PasswordModal';
import { VideoLoopModal } from './components/VideoLoopModal';
import { BusinessMovementsView } from './components/BusinessMovementsView';
import { ShareCatalogModal } from './components/ShareCatalogModal';
import { ContactModal } from './components/ContactModal';
import { PerfumeProduct } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { Instagram, Pencil, X, ImageIcon, Search, ExternalLink, Share2, RefreshCw } from 'lucide-react';
import { 
  db, 
  ref, 
  onValue, 
  updateProductInFirebase,
  updateProductStockInFirebase,
  syncAllProductImagesToFirebase 
} from './services/firebase';
import { getOptimizedImageUrl, getPhotoCacheVersion, bumpPhotoCacheVersion } from './utils/imageUrl';
import { triggerAdminAccessHaptic, triggerAdminActionHaptic } from './utils/haptics';

const INSTAGRAM_URL = 'https://www.instagram.com/olorgardenia';

const POPULAR_BRANDS = [
  'Tom Ford',
  'Dior',
  'Chanel',
  'Creed',
  'Carolina Herrera',
  'Yves Saint Laurent',
  'Jean Paul Gaultier',
  'Paco Rabanne',
  'Versace',
  'Maison Francis Kurkdjian',
  'Valentino',
  'Armani',
  'Prada',
  'Givenchy',
  'Kilian',
  'Lattafa',
  'Parfums de Marly',
  'Bleu de Chanel',
  'Sauvage',
  'Baccarat Rouge 540'
];

export default function App() {
  // Persistence in localStorage
  const [products, setProducts] = useState<PerfumeProduct[]>(() => {
    const initialMap = new Map(INITIAL_PRODUCTS.map(p => [p.id, p]));
    const saved = localStorage.getItem('maria_maria_products_v15') || localStorage.getItem('maria_maria_products_v14') || localStorage.getItem('maria_maria_products_v13') || localStorage.getItem('maria_maria_products_v12') || localStorage.getItem('maria_maria_products_v11') || localStorage.getItem('maria_maria_products_v10');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const parsedIds = new Set(parsed.map((p: PerfumeProduct) => p.id));
          const merged = parsed.map((p: PerfumeProduct) => {
            const fresh = initialMap.get(p.id);
            const rawImg = fresh?.image || p.image || `https://res.cloudinary.com/ssqqbmum/image/upload/${p.id}.jpg`;
            const cloudinaryImg = getOptimizedImageUrl(rawImg);
            if (fresh) {
              return {
                ...fresh,
                image: cloudinaryImg,
                volume: '60ml',
                stock: p.stock !== undefined ? p.stock : 1,
                cost: p.cost !== undefined ? p.cost : (fresh.cost || 160.00),
                price: p.price !== undefined ? p.price : 270.00,
                estado: p.estado || fresh.estado,
                status: p.status || fresh.status,
              };
            }
            return { ...p, image: cloudinaryImg, volume: '60ml', stock: p.stock !== undefined ? p.stock : 1, price: p.price || 270.00 };
          });

          // Add any new initial products that weren't in saved storage
          INITIAL_PRODUCTS.forEach(ip => {
            if (!parsedIds.has(ip.id)) {
              merged.push({ ...ip, image: getOptimizedImageUrl(ip.image), volume: '60ml', stock: 1, price: 270.00 });
            }
          });

          return merged;
        }
      } catch (e) {}
    }
    return INITIAL_PRODUCTS.map(p => ({
      ...p,
      image: getOptimizedImageUrl(p.image),
      volume: '60ml',
      stock: 1,
      price: 270.00
    }));
  });

  // Escuchar en tiempo real la referencia ref(db, 'inventario') con onValue
  useEffect(() => {
    let isMounted = true;
    const inventarioRef = ref(db, 'inventario');

    const unsubscribe = onValue(
      inventarioRef,
      (snapshot) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val) {
            const itemsMap = new Map<string, any>();
            if (Array.isArray(val)) {
              val.forEach((item) => {
                if (item && item.id) {
                  itemsMap.set(String(item.id).trim().toLowerCase(), item);
                }
              });
            } else if (typeof val === 'object') {
              Object.entries(val).forEach(([key, item]: [string, any]) => {
                if (item && typeof item === 'object') {
                  const id = item.id ? String(item.id).trim().toLowerCase() : key.trim().toLowerCase();
                  itemsMap.set(id, item);
                }
              });
            }

            if (itemsMap.size > 0) {
              setProducts((prevProducts) => {
                const currentIds = new Set(prevProducts.map((p) => p.id.trim().toLowerCase()));
                let hasChanges = false;

                const updatedList = prevProducts.map((p) => {
                  const match = itemsMap.get(p.id.trim().toLowerCase());
                  if (match) {
                    const stockVal = typeof match.stock === 'number' ? match.stock : (parseInt(match.stock, 10) || 0);
                    const statusVal = match.status || match.estado || (stockVal > 0 ? 'Disponible' : 'Agotado');
                    const priceVal = typeof match.price === 'number' ? match.price : p.price;
                    const costVal = typeof match.cost === 'number' ? match.cost : p.cost;
                    const nameVal = match.name || p.name;
                    const brandVal = match.brand || p.brand;
                    const imageVal = getOptimizedImageUrl(match.image || p.image);
                    const notesVal = match.notes !== undefined ? match.notes : p.notes;
                    const descVal = match.description !== undefined ? match.description : p.description;

                    if (
                      p.stock !== stockVal || 
                      p.status !== statusVal || 
                      p.estado !== statusVal ||
                      p.price !== priceVal ||
                      p.cost !== costVal ||
                      p.name !== nameVal ||
                      p.brand !== brandVal ||
                      p.image !== imageVal ||
                      p.notes !== notesVal ||
                      p.description !== descVal
                    ) {
                      hasChanges = true;
                      return {
                        ...p,
                        ...match,
                        name: nameVal,
                        brand: brandVal,
                        image: imageVal,
                        notes: notesVal,
                        description: descVal,
                        price: priceVal,
                        cost: costVal,
                        stock: stockVal,
                        status: statusVal,
                        estado: statusVal,
                      };
                    }
                  }
                  return p;
                });

                // Incluir productos que estén en Firebase pero no en el catálogo local
                const newItems: PerfumeProduct[] = [];
                itemsMap.forEach((item, id) => {
                  if (!currentIds.has(id) && item && item.name) {
                    hasChanges = true;
                    const stockVal = typeof item.stock === 'number' ? item.stock : 1;
                    const statusVal = item.status || item.estado || (stockVal > 0 ? 'Disponible' : 'Agotado');
                    newItems.push({
                      id: item.id || id,
                      name: item.name,
                      brand: item.brand || 'Marca',
                      volume: item.volume || '60ml',
                      price: item.price ?? 270,
                      cost: item.cost ?? 160,
                      stock: stockVal,
                      minStockAlert: item.minStockAlert ?? 2,
                      category: item.category || 'Unisex',
                      image: getOptimizedImageUrl(item.image || ''),
                      description: item.description || '',
                      notes: item.notes || '',
                      sku: item.sku || item.id || id,
                      barcode: item.barcode || '',
                      status: statusVal,
                      estado: statusVal,
                    });
                  }
                });

                return hasChanges ? (newItems.length > 0 ? [...updatedList, ...newItems] : updatedList) : prevProducts;
              });
            }
          }
        }
      },
      (error) => {
        console.warn('[Firebase Realtime] Error escuchando inventario:', error);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Escuchar cuando se invalida la caché de fotos para forzar recarga inmediata de imágenes
  useEffect(() => {
    const handlePhotoCacheBump = (e: any) => {
      const newVersion = e.detail?.version || getPhotoCacheVersion();
      setProducts((prev) =>
        prev.map((p) => {
          const fresh = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
          const rawImg = fresh?.image || p.image;
          return {
            ...p,
            image: getOptimizedImageUrl(rawImg, newVersion),
          };
        })
      );
    };

    window.addEventListener('photo-cache-bumped', handlePhotoCacheBump);
    return () => {
      window.removeEventListener('photo-cache-bumped', handlePhotoCacheBump);
    };
  }, []);

  // Background listener and analyzer for best-selling perfumes from movements
  useEffect(() => {
    let isMounted = true;
    const movsRef = ref(db, 'movimientos');
    const unsubscribe = onValue(movsRef, (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.exists()) return;
      const val = snapshot.val();
      const movementsList: any[] = [];
      if (Array.isArray(val)) {
        movementsList.push(...val.filter(Boolean));
      } else if (typeof val === 'object') {
        Object.values(val).forEach((m: any) => {
          if (m) movementsList.push(m);
        });
      }

      // Count units sold per product ID from VENTA movements
      const salesCountMap: Record<string, number> = {};
      movementsList.forEach((mov) => {
        if (mov.type === 'VENTA' && mov.items && Array.isArray(mov.items)) {
          mov.items.forEach((item: any) => {
            if (item.productId) {
              salesCountMap[item.productId] = (salesCountMap[item.productId] || 0) + (item.quantity || 1);
            }
          });
        } else if (mov.type === 'VENTA' && mov.productId) {
          salesCountMap[mov.productId] = (salesCountMap[mov.productId] || 0) + (mov.quantity || 1);
        }
      });

      // Update products topSalesRank based on real sales within each category (Hombre, Mujer, Unisex)
      setProducts((prevProducts) => {
        const categories: ('Hombre' | 'Mujer' | 'Unisex')[] = ['Hombre', 'Mujer', 'Unisex'];
        const updated = [...prevProducts];

        categories.forEach((cat) => {
          const catProducts = updated.filter((p) => p.category === cat);
          catProducts.sort((a, b) => {
            const salesA = salesCountMap[a.id] || 0;
            const salesB = salesCountMap[b.id] || 0;
            if (salesA !== salesB) return salesB - salesA; // Highest sales first

            const popA = POPULAR_BRANDS.some(pb => pb.toLowerCase() === a.brand.trim().toLowerCase()) ? 0 : 1;
            const popB = POPULAR_BRANDS.some(pb => pb.toLowerCase() === b.brand.trim().toLowerCase()) ? 0 : 1;
            if (popA !== popB) return popA - popB;

            return (a.name || '').localeCompare(b.name || '');
          });

          // Assign topSalesRank: 1, 2, 3 for top 3 best-sellers in category
          catProducts.forEach((p, idx) => {
            const globalIdx = updated.findIndex((item) => item.id === p.id);
            if (globalIdx !== -1) {
              updated[globalIdx] = {
                ...updated[globalIdx],
                topSalesRank: idx + 1,
              };
            }
          });
        });

        return updated;
      });
    }, (error) => {
      console.warn('[Background Sales Analyzer] Error:', error);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleUpdateProductStock = (productId: string, stock: number, status?: string) => {
    const stockVal = Math.max(0, Math.floor(stock));
    const statusVal = status || (stockVal > 0 ? 'Disponible' : 'Agotado');

    // Optimistic local update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: stockVal, status: statusVal, estado: statusVal } : p))
    );

    // Escritura reactiva inmediata a Firebase en segundo plano
    updateProductStockInFirebase(productId, stockVal, statusVal);
  };

  useEffect(() => {
    try {
      localStorage.setItem('maria_maria_products_v15', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  // Register visitor IP on initial application access
  useEffect(() => {
    fetch('/api/visitors/ping', { method: 'POST' }).catch(() => {});
  }, []);

  // Modal state for viewing/inspecting fragrance details
  const [selectedProductDetail, setSelectedProductDetail] = useState<PerfumeProduct | null>(null);

  // Availability inquiry set state (Always starts empty by default)
  const [selectedInquiryIds, setSelectedInquiryIds] = useState<string[]>([]);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState<boolean>(false);

  // Delivery points screen modal state
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState<boolean>(false);

  // FAQs modal state
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);

  // Photo Sync modal state
  const [isPhotoSyncModalOpen, setIsPhotoSyncModalOpen] = useState<boolean>(false);

  // Quiz modal state ("Te ayudamos a elegir")
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);

  // Comparison modal state ("Vs.")
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  // Warning popup before entering PC Mode / Admin Panel
  const [isPcWarningOpen, setIsPcWarningOpen] = useState<boolean>(false);

  // Business Mode state (accessible from mobile or PC mode via secret admin flow)
  const [isBusinessModeOpen, setIsBusinessModeOpen] = useState<boolean>(false);
  const [authPendingMode, setAuthPendingMode] = useState<'business' | 'pc' | null>(null);

  const handleOpenBusinessMode = () => {
    setIsPcWarningOpen(false);
    const authUntil = localStorage.getItem('gardenia_business_auth_until');
    if (authUntil && Date.now() < parseInt(authUntil, 10)) {
      setIsBusinessModeOpen(true);
    } else {
      setAuthPendingMode('business');
      setIsPasswordModalOpen(true);
    }
  };

  const handleOpenPcMode = () => {
    setIsPcWarningOpen(false);
    const authUntil = localStorage.getItem('gardenia_business_auth_until');
    if (authUntil && Date.now() < parseInt(authUntil, 10)) {
      handleTogglePcMode(true);
    } else {
      setAuthPendingMode('pc');
      setIsPasswordModalOpen(true);
    }
  };

  // Password Modal and Video Loop Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isVideoLoopModalOpen, setIsVideoLoopModalOpen] = useState<boolean>(false);

  // Easter Egg modal state
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);

  // Share & Save Catalog Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareTargetProduct, setShareTargetProduct] = useState<PerfumeProduct | undefined>(undefined);

  // Contact Modal state (Instagram & WhatsApp)
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  const handleOpenShare = (product?: PerfumeProduct) => {
    setShareTargetProduct(product);
    setIsShareModalOpen(true);
  };

  // Quick Edit Modal state
  const [editingProduct, setEditingProduct] = useState<PerfumeProduct | null>(null);

  const handleToggleInquiryProduct = (productId: string) => {
    setSelectedInquiryIds((prev) => {
      return prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
    });
  };

  const handleClearInquiryProducts = () => {
    setSelectedInquiryIds([]);
  };

  // Hidden/Discreet PC Mode state
  const [isPcMode, setIsPcMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('maria_maria_pc_mode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleTogglePcMode = (enable: boolean) => {
    setIsPcMode(enable);
    try {
      localStorage.setItem('maria_maria_pc_mode', enable ? 'true' : 'false');
    } catch (e) {}
  };

  // Clausurado / No Me Han Pagado security feature
  const [isClausurado, setIsClausurado] = useState<boolean>(() => {
    try {
      localStorage.setItem('maria_maria_clausurado', 'false');
      return false;
    } catch (e) {
      return false;
    }
  });

  const [showClausuradoOverlay, setShowClausuradoOverlay] = useState<boolean>(false);

  useEffect(() => {
    (window as any).activaElNoMeHanPagado = () => {
      setIsClausurado(true);
      localStorage.setItem('maria_maria_clausurado', 'true');
    };
    (window as any).desactivaElNoMeHanPagado = () => {
      setIsClausurado(false);
      localStorage.setItem('maria_maria_clausurado', 'false');
      setShowClausuradoOverlay(false);
    };

    let typedBuffer = '';
    const handleGlobalKey = (e: KeyboardEvent) => {
      typedBuffer += e.key.toLowerCase();
      if (typedBuffer.includes('pagado')) {
        (window as any).activaElNoMeHanPagado();
        typedBuffer = '';
      }
      if (typedBuffer.length > 50) typedBuffer = typedBuffer.slice(-50);
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  useEffect(() => {
    if (isClausurado) {
      localStorage.setItem('maria_maria_clausurado', 'true');
      const timer = setTimeout(() => {
        setShowClausuradoOverlay(true);
      }, 1000); // 1 second delay as requested
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem('maria_maria_clausurado', 'false');
      setShowClausuradoOverlay(false);
    }
  }, [isClausurado]);

  // Keep reference for popstate handling
  const modalRef = useRef(selectedProductDetail);
  const inquiryModalRef = useRef(isAvailabilityModalOpen);
  const deliveryModalRef = useRef(isDeliveryModalOpen);
  const faqModalRef = useRef(isFaqModalOpen);

  useEffect(() => {
    modalRef.current = selectedProductDetail;
  }, [selectedProductDetail]);
  useEffect(() => {
    inquiryModalRef.current = isAvailabilityModalOpen;
  }, [isAvailabilityModalOpen]);
  useEffect(() => {
    deliveryModalRef.current = isDeliveryModalOpen;
  }, [isDeliveryModalOpen]);
  useEffect(() => {
    faqModalRef.current = isFaqModalOpen;
  }, [isFaqModalOpen]);

  // Mobile Back-Button handling to close modals
  useEffect(() => {
    try {
      window.history.replaceState({ isModal: false }, '', '');
    } catch (e) {}

    const handlePopState = () => {
      if (faqModalRef.current) {
        setIsFaqModalOpen(false);
      }
      if (deliveryModalRef.current) {
        setIsDeliveryModalOpen(false);
      }
      if (inquiryModalRef.current) {
        setIsAvailabilityModalOpen(false);
      }
      if (modalRef.current) {
        setSelectedProductDetail(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [activePcProductList, setActivePcProductList] = useState<PerfumeProduct[]>([]);

  const handleOpenDetail = (product: PerfumeProduct, currentList?: PerfumeProduct[]) => {
    setSelectedProductDetail(product);
    if (currentList && currentList.length > 0) {
      setActivePcProductList(currentList);
    } else {
      setActivePcProductList(products);
    }
    try {
      window.history.pushState({ isModal: true, modal: 'detail' }, '', '');
    } catch (e) {}
  };

  const pcNavigationList = activePcProductList.length > 0 ? activePcProductList : products;
  const currentPcIndex = selectedProductDetail 
    ? pcNavigationList.findIndex(p => p.id === selectedProductDetail.id) 
    : -1;

  const handleNavigatePrevious = () => {
    if (pcNavigationList.length === 0 || currentPcIndex === -1) return;
    const prevIndex = (currentPcIndex - 1 + pcNavigationList.length) % pcNavigationList.length;
    setSelectedProductDetail(pcNavigationList[prevIndex]);
  };

  const handleNavigateNext = () => {
    if (pcNavigationList.length === 0 || currentPcIndex === -1) return;
    const nextIndex = (currentPcIndex + 1) % pcNavigationList.length;
    setSelectedProductDetail(pcNavigationList[nextIndex]);
  };

  const previousProduct = currentPcIndex >= 0
    ? pcNavigationList[(currentPcIndex - 1 + pcNavigationList.length) % pcNavigationList.length]
    : null;

  const nextProduct = currentPcIndex >= 0
    ? pcNavigationList[(currentPcIndex + 1) % pcNavigationList.length]
    : null;

  const handleCloseDetail = () => {
    setSelectedProductDetail(null);
    if (window.history.state?.isModal) {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const handleOpenInquiry = () => {
    setIsAvailabilityModalOpen(true);
    try {
      window.history.pushState({ isModal: true, modal: 'inquiry' }, '', '');
    } catch (e) {}
  };

  const handleCloseInquiry = () => {
    setIsAvailabilityModalOpen(false);
    if (window.history.state?.isModal) {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const handleOpenDelivery = () => {
    setIsDeliveryModalOpen(true);
    try {
      window.history.pushState({ isModal: true, modal: 'delivery' }, '', '');
    } catch (e) {}
  };

  const handleCloseDelivery = () => {
    setIsDeliveryModalOpen(false);
    if (window.history.state?.isModal) {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const handleOpenFaq = () => {
    setIsFaqModalOpen(true);
    try {
      window.history.pushState({ isModal: true, modal: 'faq' }, '', '');
    } catch (e) {}
  };

  const handleCloseFaq = () => {
    setIsFaqModalOpen(false);
    if (window.history.state?.isModal) {
      try {
        window.history.back();
      } catch (e) {}
    }
  };

  const handleUpdateProduct = (updated: PerfumeProduct) => {
    setProducts(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      try {
        localStorage.setItem('maria_maria_products_v15', JSON.stringify(next));
        
        // Save to reference photos database
        let refPhotos: Record<string, string> = {};
        const savedRef = localStorage.getItem('maria_maria_reference_photos');
        if (savedRef) {
          refPhotos = JSON.parse(savedRef);
        }
        refPhotos[updated.id] = updated.image;
        localStorage.setItem('maria_maria_reference_photos', JSON.stringify(refPhotos));
      } catch (e) {}
      return next;
    });
    setSelectedProductDetail(updated);

    // Escritura reactiva inmediata a Firebase en segundo plano sin confirmación manual
    const stockVal = updated.stock !== undefined ? Math.max(0, Math.floor(updated.stock)) : 1;
    const statusVal = updated.status || updated.estado || (stockVal > 0 ? 'Disponible' : 'Agotado');
    
    updateProductInFirebase(updated.id, {
      ...updated,
      stock: stockVal,
      status: statusVal,
      estado: statusVal,
    });
  };

  const handleUpdateProductsWithPhotos = (newPhotoMap: Record<string, string>) => {
    setProducts(prev => {
      let refPhotos: Record<string, string> = {};
      try {
        const savedRef = localStorage.getItem('maria_maria_reference_photos');
        if (savedRef) {
          refPhotos = JSON.parse(savedRef);
        }
      } catch (e) {}

      const next = prev.map(p => {
        const normName = p.name.trim().toLowerCase();
        let newImg = p.image;

        if (newPhotoMap[p.id]) {
          newImg = newPhotoMap[p.id];
        } else {
          for (const [k, imgVal] of Object.entries(newPhotoMap)) {
            if (k === normName || normName.includes(k) || k.includes(normName)) {
              newImg = imgVal as string;
              break;
            }
          }
        }

        if (newImg && newImg !== p.image) {
          refPhotos[p.id] = newImg;
          // Reactively update photo in Firebase
          updateProductInFirebase(p.id, { image: newImg });
          return { ...p, image: newImg };
        }
        return p;
      });

      try {
        localStorage.setItem('maria_maria_products_v15', JSON.stringify(next));
        localStorage.setItem('maria_maria_reference_photos', JSON.stringify(refPhotos));
      } catch (e) {}

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#13131b] text-[#e4e1ed] flex flex-col selection:bg-[#f2ca50] selection:text-[#13131b]">
      {isPcMode ? (
        /* Modo UX adaptado 100% para PC y pantalla ancha */
        <DesktopShowroomView
          products={products}
          onOpenBusinessMode={handleOpenBusinessMode}
          onSelectProduct={handleOpenDetail}
          onExitPcMode={() => handleTogglePcMode(false)}
          onOpenDeliveryPoints={handleOpenDelivery}
          onOpenFaq={handleOpenFaq}
          onOpenPhotoSync={() => setIsPhotoSyncModalOpen(true)}
          onOpenComparison={() => setIsComparisonModalOpen(true)}
          onOpenQuiz={() => setIsQuizModalOpen(true)}
          onUpdateProduct={handleUpdateProduct}
          onUpdateProductStock={handleUpdateProductStock}
          inquiryIds={selectedInquiryIds}
          onToggleInquiryProduct={handleToggleInquiryProduct}
        />
      ) : (
        /* Modo Móvil / Estándar (Galería Limpia) */
        <>
          {/* Showroom Header */}
          <Navbar 
            totalCount={products.length} 
            inquiryCount={selectedInquiryIds.length}
            onOpenInquiry={handleOpenInquiry}
            onClearInquiry={handleClearInquiryProducts}
            onOpenDeliveryPoints={handleOpenDelivery}
            onOpenFaq={handleOpenFaq}
            onOpenPhotoSync={() => setIsPhotoSyncModalOpen(true)}
            onOpenComparison={() => setIsComparisonModalOpen(true)}
            onOpenQuiz={() => setIsQuizModalOpen(true)}
            onOpenShare={() => handleOpenShare(undefined)}
            onOpenContact={() => setIsContactModalOpen(true)}
            onEnterPcMode={() => setIsPcWarningOpen(true)}
          />

          {/* Main Fragrance Showroom */}
          <main className="flex-1 px-3 sm:px-6 pt-4 pb-20 sm:pb-12">
            <InventoryView 
              products={products} 
              onSelectProduct={handleOpenDetail}
              inquiryCount={selectedInquiryIds.length}
              onOpenInquiry={handleOpenInquiry}
              onOpenFaq={handleOpenFaq}
              onOpenQuiz={() => setIsQuizModalOpen(true)}
              inquiryIds={selectedInquiryIds}
              onToggleInquiryProduct={handleToggleInquiryProduct}
            />
          </main>

          {/* Clean Footer with Instagram Button & Share Button */}
          <footer className="w-full py-6 text-center border-t border-[#292932]/40 text-xs text-[#99907c] flex flex-col items-center justify-center gap-3 px-4 pb-24 sm:pb-6">
            {/* Social Link & Share */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-instagram-btn"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1b1b23] hover:bg-[#281b2b] border border-[#E1306C]/40 hover:border-[#E1306C]/80 text-[#ff80a6] hover:text-white transition-all text-xs font-semibold shadow-sm active:scale-95"
              >
                <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shrink-0">
                  <Instagram className="w-2.5 h-2.5 text-white" />
                </div>
                <span>Síguenos en Instagram @olorgardenia</span>
              </a>

              <button
                type="button"
                onClick={() => handleOpenShare(undefined)}
                id="footer-share-catalog-btn"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1b1b23] hover:bg-[#252530] border border-[#292932] hover:border-[#f2ca50]/50 text-[#d0c5af] hover:text-[#f2ca50] transition-all text-xs font-semibold shadow-sm active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-[#f2ca50]" />
                <span>Guardar / Compartir Catálogo</span>
              </button>
            </div>

            <p className="text-[11px] text-[#99907c]">
              © Olor Gardenia • Distribuidores de Perfumes Maria Maria
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenFaq}
                className="text-[11px] text-[#f2ca50] hover:underline py-1 px-2"
              >
                Preguntas Frecuentes (FAQs)
              </button>
              <span>•</span>
              <button
                onClick={handleOpenDelivery}
                className="text-[11px] text-[#99907c] hover:text-[#f2ca50] py-1 px-2"
              >
                Puntos de Entrega
              </button>
            </div>
          </footer>
        </>
      )}

      {/* Fragrance Detail Modal */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          allProducts={products}
          onSelectProduct={(p) => setSelectedProductDetail(p)}
          onClose={handleCloseDetail}
          onUpdateProduct={handleUpdateProduct}
          onEditProduct={(p) => {
            handleCloseDetail();
            setEditingProduct(p);
          }}
          isInWishlist={selectedInquiryIds.includes(selectedProductDetail.id)}
          onToggleWishlist={handleToggleInquiryProduct}
          isInInquirySet={selectedInquiryIds.includes(selectedProductDetail.id)}
          onToggleInquirySet={handleToggleInquiryProduct}
          onOpenInquiryModal={handleOpenInquiry}
          onOpenShareModal={handleOpenShare}
          isPcMode={isPcMode}
          onNavigatePrevious={isPcMode ? handleNavigatePrevious : undefined}
          onNavigateNext={isPcMode ? handleNavigateNext : undefined}
          currentIndex={isPcMode && currentPcIndex !== -1 ? currentPcIndex : undefined}
          totalProducts={isPcMode ? pcNavigationList.length : undefined}
          previousProduct={isPcMode ? previousProduct : undefined}
          nextProduct={isPcMode ? nextProduct : undefined}
        />
      )}

      {/* Quick Edit Modal (Admin) */}
      {editingProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingProduct(null); }}
        >
          <div className="w-full max-w-lg bg-[#161622] border border-[#292932] rounded-3xl p-6 shadow-2xl text-[#e4e1ed] space-y-4">
            <div className="flex items-center justify-between border-b border-[#292932] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#f2ca50]" />
                Edición Rápida de Inventario (Modo Admin)
              </h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl bg-[#1b1b23] hover:bg-[#292932] text-[#99907c] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Nombre del Perfume</label>
                <input 
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Marca / Diseñador</label>
                  <input 
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Categoría</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                  >
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Presentación / Volumen</label>
                  <input 
                    type="text"
                    value={editingProduct.volume || '60ml'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-2xl bg-[#13131b] border border-[#292932]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#f2ca50] flex items-center gap-1.5 uppercase">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Editor de Imagen (Inventario)</span>
                  </label>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${editingProduct.brand} ${editingProduct.name} ${editingProduct.category} perfume`)}&tbm=isch`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#252530] hover:bg-[#f2ca50] text-[#d0c5af] hover:text-[#13131b] text-[11px] font-bold flex items-center gap-1 transition-all border border-[#34343d]"
                    title="Buscar en Google Imágenes"
                  >
                    <Search className="w-3 h-3" />
                    <span>Google Imágenes</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#1b1b23] border border-[#292932] overflow-hidden flex items-center justify-center shrink-0 p-1">
                    {editingProduct.image ? (
                      <img 
                        src={editingProduct.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80'; }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#99907c]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#99907c] block">
                      URL de la foto
                    </label>
                    <input 
                      type="url"
                      value={editingProduct.image || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://... o link de imagen"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#1b1b23] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#99907c] uppercase mb-1">Notas Olfativas</label>
                <textarea 
                  rows={2}
                  value={editingProduct.notes || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#13131b] border border-[#292932] text-xs text-white focus:outline-none focus:border-[#f2ca50] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292932]">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-[#1b1b23] hover:bg-[#292932] text-xs font-semibold text-[#99907c] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (handleUpdateProduct) {
                    handleUpdateProduct(editingProduct);
                  }
                  setEditingProduct(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#13131b] text-xs font-bold shadow-md shadow-[#f2ca50]/20 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Inquiry / Set Builder Modal */}
      <AvailabilityInquiryModal
        isOpen={isAvailabilityModalOpen}
        onClose={handleCloseInquiry}
        products={products}
        selectedProductIds={selectedInquiryIds}
        onToggleProduct={handleToggleInquiryProduct}
        onClearSelected={handleClearInquiryProducts}
      />

      {/* Delivery Points Modal / Screen */}
      <DeliveryPointModal
        isOpen={isDeliveryModalOpen}
        onClose={handleCloseDelivery}
      />

      {/* FAQs Modal / Screen */}
      <FaqModal
        isOpen={isFaqModalOpen}
        onClose={handleCloseFaq}
        onOpenDeliveryPoints={handleOpenDelivery}
        onOpenEasterEgg={() => setIsEasterEggOpen(true)}
        isPcMode={isPcMode}
      />

      {/* PC / Admin Mode Confirmation & Options Modal (The 3 Options) */}
      <PcModeWarningModal
        isOpen={isPcWarningOpen}
        onClose={() => setIsPcWarningOpen(false)}
        onSelectPcMode={() => {
          handleOpenPcMode();
        }}
        onSelectBusinessMode={() => {
          handleOpenBusinessMode();
        }}
      />

      {/* Secret Easter Egg Modal */}
      <EasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => {
          setIsEasterEggOpen(false);
          setIsFaqModalOpen(false);
        }}
      />

      {/* Password Modal for Protected Modes */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setAuthPendingMode(null);
        }}
        onSuccess={() => {
          setIsPasswordModalOpen(false);
          if (authPendingMode === 'pc') {
            handleTogglePcMode(true);
          } else {
            setIsBusinessModeOpen(true);
          }
          setAuthPendingMode(null);
        }}
        onFailure={() => {
          setIsPasswordModalOpen(false);
          setAuthPendingMode(null);
          setIsVideoLoopModalOpen(true);
        }}
        title={authPendingMode === 'pc' ? 'Acceso Modo PC (Mostrador)' : 'Acceso Modo Negocio'}
        subtitle={authPendingMode === 'pc' 
          ? 'Introduce la contraseña para desbloquear el modo mostrador panorámico.' 
          : 'Introduce la contraseña para acceder a la gestión de ventas, stock y movimientos.'}
      />

      {/* Video Loop Modal on Password Failure with 'X' Close to Return to Normal Mode */}
      <VideoLoopModal
        isOpen={isVideoLoopModalOpen}
        onReturnHome={() => {
          setIsVideoLoopModalOpen(false);
          setIsBusinessModeOpen(false);
          setIsPcWarningOpen(false);
        }}
      />

      {/* Direct Business Movements View (accessible on mobile/desktop via Secret Admin Flow) */}
      {isBusinessModeOpen && (
        <div className="fixed inset-0 z-50 bg-[#12131A] overflow-y-auto">
          <BusinessMovementsView
            products={products}
            onExitBusinessMode={() => setIsBusinessModeOpen(false)}
            onUpdateProducts={setProducts}
          />
        </div>
      )}

      {/* Photo Sync Modal */}
      <PhotoSyncModal
        isOpen={isPhotoSyncModalOpen}
        onClose={() => setIsPhotoSyncModalOpen(false)}
        products={products}
        onUpdateProductsWithPhotos={handleUpdateProductsWithPhotos}
      />

      {/* Quiz Modal ("Te ayudamos a elegir") */}
      <PerfumeQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          setIsQuizModalOpen(false);
          handleOpenDetail(p);
        }}
      />

      {/* Comparison Modal ("Vs.") */}
      <PerfumeComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        products={products}
        inquiryIds={selectedInquiryIds}
        onSelectProduct={(p) => {
          setIsComparisonModalOpen(false);
          handleOpenDetail(p);
        }}
      />

      {/* Share & Save Catalog Modal */}
      <ShareCatalogModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productName={shareTargetProduct?.name}
        brandName={shareTargetProduct?.brand}
      />

      {/* Contact Modal (Instagram & WhatsApp) */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Clausurado / No Me Han Pagado Security Overlay */}
      {showClausuradoOverlay && (
        <>
          <audio 
            src="/el muchacho de los ojos tristes.mp3" 
            autoPlay 
            loop 
            playsInline 
          />
          <div className="fixed inset-0 z-[999999] bg-black/50 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 select-none pointer-events-auto animate-fade-in">
            <div className="relative w-full flex items-center justify-center px-2">
              <img 
                src="/Clausurado.png" 
                alt="Clausurado" 
                className="w-[92vw] sm:w-full max-w-[340px] sm:max-w-[500px] md:max-w-[620px] max-h-[80vh] object-contain mx-auto block drop-shadow-[0_25px_60px_rgba(255,0,0,0.4)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
