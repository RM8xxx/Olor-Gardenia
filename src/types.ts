export type ProductCategory = 'Todos' | 'Mujer' | 'Hombre' | 'Unisex';

export type MovementType = 'VENTA' | 'ABASTECER' | 'AJUSTE';

export interface PerfumeProduct {
  id: string;
  name: string;
  brand: string;
  volume: string; // e.g. '60ml'
  price: number; // in USD or MXN (formatted with currency)
  originalRetailPrice?: number; // Estimated retail price of the authentic original perfume in MXN
  cost?: number;
  stock: number;
  minStockAlert: number;
  category: 'Mujer' | 'Hombre' | 'Unisex';
  image: string;
  description: string;
  notes: string; // e.g. "Cítricos, lavanda, sándalo, ámbar, notas acuáticas"
  topSalesRank?: number;
  sku: string;
  barcode?: string;
  status?: string; // 'Disponible' | 'Agotado' | 'Bajo Pedido' | etc.
  estado?: string;
}

export interface MovementItem {
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  volume?: string;
}

export interface InventoryMovement {
  id: string;
  perfumeId?: string;
  productName?: string;
  brand?: string;
  type: MovementType;
  quantity: number; // positive or negative total count
  unitPrice?: number;
  totalPrice: number; // Grand total amount for the transaction
  subtotal?: number;
  date: string; // e.g. "2026-08-19"
  time: string; // e.g. "10:42 AM" or "18:15"
  discountApplied?: boolean;
  discountPercent?: number;
  discountAmount?: number;
  paymentMethod?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  notes?: string;
  batchId?: string;
  verifiedByAi?: boolean;
  items?: MovementItem[];
}

export interface CartItem {
  product: PerfumeProduct;
  quantity: number;
  customUnitPrice?: number;
}

export interface OcrBatchItem {
  id: string;
  rawText: string;
  matchedProductName: string;
  matchedProductId?: string;
  quantity: number;
  movementType: 'SALE' | 'RESTOCK';
  unitPriceDetected: number | null;
  requiresHumanReview: boolean;
  isConfirmed?: boolean;
  brand?: string;
  matchedProduct?: PerfumeProduct;
}

export interface OcrBatchResult {
  batchId: string;
  extractionConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  totalItemsDetected: number;
  items: OcrBatchItem[];
  imageUrl?: string;
  timestamp?: string;
  source?: string;
}

export type NavigationTab = 
  | 'inicio'
  | 'inventario'
  | 'catalogo'
  | 'escanear'
  | 'movimientos'
  | 'estadisticas'
  | 'pos'
  | 'abastecer'
  | 'nuevo-producto';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'success' | 'info';
  timestamp: string;
  read: boolean;
}

export interface InterestPlace {
  id: string;
  name: string;
  address: string;
  notes?: string;
}
