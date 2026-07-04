export type Product = {
  id: string;
  product_name: string;
  initial_stock: number;
  min_stock: number;
  unit: string;
  created_at: string;
};

export type StockAddition = {
  id: string;
  product_id: string;
  quantity_added: number;
  type: 'شحنة جديدة' | 'مرتجع';
  created_at: string;
  notes?: string;
  products?: { product_name: string }; // joined
};

export type StockLog = {
  id: string;
  product_id: string;
  quantity: number;
  log_type: 'مبيعات / شحن' | 'تالف / هالك' | 'عينة / فحص';
  created_at: string;
  notes?: string;
  products?: { product_name: string }; // joined
};

export type ProductStockMetrics = {
  id: string;
  product_name: string;
  initial_stock: number;
  min_stock: number;
  unit: string;
  created_at: string;
  total_added: number;
  total_consumed: number;
  current_stock: number;
  stock_status: '⚠️ Low Stock' | '🟢 OK';
};
