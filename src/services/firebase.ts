import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";
import { INITIAL_PRODUCTS } from "../data/initialProducts";
import { InventoryMovement, MovementItem, PerfumeProduct } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyAp8rEKv_3LVfj7813M269_iyCYVVM5_V8",
  authDomain: "perfumes-maria-maria.firebaseapp.com",
  databaseURL: "https://perfumes-maria-maria-default-rtdb.firebaseio.com",
  projectId: "perfumes-maria-maria",
  storageBucket: "perfumes-maria-maria.firebasestorage.app",
  messagingSenderId: "555177812640",
  appId: "1:555177812640:web:53bf7d5265ffed6b7c5fc5"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, onValue, set, update, get };

/**
 * Poblar catálogo a Firebase:
 * Ordena alfabéticamente por marca los productos de initialProducts.ts y los sube con set(ref(db, 'inventario'), data)
 */
export const populateCatalogToFirebase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const sortedProducts = [...INITIAL_PRODUCTS].sort((a, b) => {
      const brandComp = a.brand.trim().localeCompare(b.brand.trim(), 'es', { sensitivity: 'base' });
      if (brandComp !== 0) return brandComp;
      return a.name.trim().localeCompare(b.name.trim(), 'es', { sensitivity: 'base' });
    });

    const data: Record<string, any> = {};
    sortedProducts.forEach((p) => {
      const stockVal = typeof p.stock === 'number' ? p.stock : 1;
      const statusVal = p.status || p.estado || (stockVal > 0 ? 'Disponible' : 'Agotado');
      data[p.id] = {
        id: p.id,
        name: p.name,
        brand: p.brand,
        volume: p.volume || '60ml',
        price: p.price ?? 270,
        cost: p.cost ?? 160,
        stock: stockVal,
        minStockAlert: p.minStockAlert ?? 2,
        category: p.category || 'Unisex',
        image: p.image,
        description: p.description || '',
        notes: p.notes || '',
        sku: p.sku || p.id,
        barcode: p.barcode || '',
        status: statusVal,
        estado: statusVal,
        ...(p.originalRetailPrice ? { originalRetailPrice: p.originalRetailPrice } : {}),
      };
    });

    await set(ref(db, 'inventario'), data);
    return { success: true, count: sortedProducts.length };
  } catch (error: any) {
    console.error('Error poblando catálogo a Firebase:', error);
    return { success: false, count: 0, error: error?.message || 'Error al conectar con Firebase' };
  }
};

/**
 * Sincroniza inmediatamente el stock y estado de un producto en Firebase
 * Usa update(ref(db, `inventario/${productId}`), { stock, status })
 */
export const updateProductStockInFirebase = async (
  productId: string,
  stock: number,
  customStatus?: string
): Promise<boolean> => {
  try {
    const stockVal = Math.max(0, Math.floor(stock));
    const statusVal = customStatus || (stockVal > 0 ? 'Disponible' : 'Agotado');
    await update(ref(db, `inventario/${productId}`), {
      stock: stockVal,
      status: statusVal,
      estado: statusVal,
    });
    return true;
  } catch (error) {
    console.error(`[Firebase] Error al actualizar stock de producto ${productId}:`, error);
    return false;
  }
};

/**
 * Escritura reactiva inmediata: Actualiza cualquier campo modificado (stock, precio, costo, etc.)
 * en Firebase Realtime Database usando update(ref(db, `inventario/${productId}`), changes)
 */
export const updateProductInFirebase = async (
  productId: string,
  changes: Partial<PerfumeProduct>
): Promise<boolean> => {
  try {
    const cleanId = productId.trim();
    const payload: Record<string, any> = {};

    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.brand !== undefined) payload.brand = changes.brand;
    if (changes.price !== undefined) payload.price = Number(changes.price);
    if (changes.cost !== undefined) payload.cost = Number(changes.cost);
    if (changes.volume !== undefined) payload.volume = changes.volume;
    if (changes.category !== undefined) payload.category = changes.category;
    if (changes.image !== undefined) payload.image = changes.image;
    if (changes.notes !== undefined) payload.notes = changes.notes;
    if (changes.description !== undefined) payload.description = changes.description;

    if (changes.stock !== undefined) {
      const stockNum = Math.max(0, Math.floor(Number(changes.stock)));
      payload.stock = stockNum;
      const statusVal = changes.status || changes.estado || (stockNum > 0 ? 'Disponible' : 'Agotado');
      payload.status = statusVal;
      payload.estado = statusVal;
    } else if (changes.status !== undefined || changes.estado !== undefined) {
      const st = changes.status || changes.estado;
      payload.status = st;
      payload.estado = st;
    }

    await update(ref(db, `inventario/${cleanId}`), payload);
    return true;
  } catch (error) {
    console.error(`[Firebase Realtime] Error actualizando producto ${productId}:`, error);
    return false;
  }
};

/**
 * Registra una VENTA en Firebase:
 * 1. Resta el stock en inventario/{id}/stock y actualiza status ('Disponible'/'Agotado')
 * 2. Guarda el movimiento en movimientos/{movementId} con tipo 'VENTA'
 */
export const recordSaleInFirebase = async (sale: {
  date: string;
  time: string;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  items: MovementItem[];
  notes?: string;
}): Promise<{ success: boolean; movementId?: string; error?: string }> => {
  try {
    const movementId = `mov-v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const totalUnits = sale.items.reduce((sum, item) => sum + item.quantity, 0);

    const movementData: InventoryMovement = {
      id: movementId,
      type: 'VENTA',
      date: sale.date,
      time: sale.time,
      quantity: -totalUnits,
      subtotal: sale.subtotal,
      discountPercent: sale.discountPercent,
      discountAmount: sale.discountAmount,
      discountApplied: sale.discountAmount > 0,
      totalPrice: sale.total,
      paymentMethod: sale.paymentMethod,
      items: sale.items,
      notes: sale.notes || '',
    };

    // 1. Guardar movimiento en nodo movimientos/
    await set(ref(db, `movimientos/${movementId}`), movementData);

    // 2. Restar stock de cada ítem vendido en Firebase
    for (const item of sale.items) {
      try {
        const itemSnap = await get(ref(db, `inventario/${item.productId}`));
        let currentStock = 1;
        if (itemSnap.exists()) {
          const val = itemSnap.val();
          if (typeof val.stock === 'number') {
            currentStock = val.stock;
          }
        }
        const newStock = Math.max(0, currentStock - item.quantity);
        const newStatus = newStock > 0 ? 'Disponible' : 'Agotado';

        await update(ref(db, `inventario/${item.productId}`), {
          stock: newStock,
          status: newStatus,
          estado: newStatus,
        });
      } catch (err) {
        console.warn(`Error actualizando stock de ${item.productId} en Firebase:`, err);
      }
    }

    return { success: true, movementId };
  } catch (error: any) {
    console.error('[Firebase] Error registrando venta:', error);
    return { success: false, error: error?.message || 'Error al registrar venta' };
  }
};

/**
 * Sincroniza todas las URLs de imágenes desde INITIAL_PRODUCTS o una lista personalizada a Firebase.
 * Permite que cualquier cambio en fotos de Cloudinary se actualice inmediatamente en la base de datos pública.
 */
export const syncAllProductImagesToFirebase = async (
  customProducts?: PerfumeProduct[]
): Promise<{ success: boolean; updatedCount: number; error?: string }> => {
  try {
    const list = customProducts || INITIAL_PRODUCTS;
    const updates: Record<string, any> = {};
    let count = 0;
    
    list.forEach((p) => {
      if (p.id && p.image) {
        updates[`inventario/${p.id}/image`] = p.image;
        count++;
      }
    });

    if (count > 0) {
      await update(ref(db), updates);
    }
    return { success: true, updatedCount: count };
  } catch (error: any) {
    console.error('[Firebase] Error sincronizando fotos en Firebase:', error);
    return { success: false, updatedCount: 0, error: error?.message || 'Error al actualizar imágenes' };
  }
};

export const recordRestockInFirebase = async (restock: {
  date: string;
  time: string;
  items: MovementItem[];
  newProducts?: PerfumeProduct[];
  notes?: string;
}): Promise<{ success: boolean; movementId?: string; error?: string }> => {
  try {
    const movementId = `mov-a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const totalUnits = restock.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = restock.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    const movementData: InventoryMovement = {
      id: movementId,
      type: 'ABASTECER',
      date: restock.date,
      time: restock.time,
      quantity: totalUnits,
      totalPrice: totalCost,
      subtotal: totalCost,
      items: restock.items,
      notes: restock.notes || '',
    };

    // 1. Guardar movimiento en nodo movimientos/
    await set(ref(db, `movimientos/${movementId}`), movementData);

    // 2. Si hay productos nuevos que dar de alta
    if (restock.newProducts && restock.newProducts.length > 0) {
      for (const newProd of restock.newProducts) {
        const stockVal = Math.max(1, newProd.stock || 1);
        await set(ref(db, `inventario/${newProd.id}`), {
          ...newProd,
          stock: stockVal,
          status: 'Disponible',
          estado: 'Disponible',
        });
      }
    }

    // 3. Sumar unidades a productos existentes
    for (const item of restock.items) {
      try {
        const itemSnap = await get(ref(db, `inventario/${item.productId}`));
        let currentStock = 0;
        if (itemSnap.exists()) {
          const val = itemSnap.val();
          if (typeof val.stock === 'number') {
            currentStock = val.stock;
          }
        }
        const newStock = currentStock + item.quantity;
        await update(ref(db, `inventario/${item.productId}`), {
          stock: newStock,
          status: 'Disponible',
          estado: 'Disponible',
        });
      } catch (err) {
        console.warn(`Error actualizando stock abastecido de ${item.productId}:`, err);
      }
    }

    return { success: true, movementId };
  } catch (error: any) {
    console.error('[Firebase] Error registrando abastecimiento:', error);
    return { success: false, error: error?.message || 'Error al registrar abastecimiento' };
  }
};

