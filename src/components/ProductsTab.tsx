import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProductStockMetrics } from '../types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { EditProductModal } from './EditForms';
import { ConfirmModal } from './ui/ConfirmModal';
import { useToast } from './ui/Toast';

export function ProductsTab({ refreshTrigger, filter = 'all' }: { refreshTrigger: number, filter?: 'all' | 'low_stock' }) {
  const [data, setData] = useState<ProductStockMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [productToEdit, setProductToEdit] = useState<ProductStockMetrics | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductStockMetrics | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: metrics, error } = await supabase
      .from('product_stock_metrics')
      .select('*')
      .order('product_name');
    
    if (error) console.error("Error fetching products:", error);
    else setData(metrics || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    setIsDeleting(false);
    
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Product deleted successfully', 'success');
      setProductToDelete(null);
      fetchData();
    }
  };

  const filteredData = data
    .filter(p => filter === 'all' || p.stock_status.includes('Low'))
    .filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-textMuted" />
          <input
            placeholder="Search products..."
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accentBlue"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10 text-textMuted animate-pulse">Loading...</div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Initial</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Min Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Unit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-textMuted py-8">No products found.</TableCell>
                </TableRow>
              ) : filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <span className="text-textMuted">📄</span> {row.product_name}
                  </TableCell>
                  <TableCell className="text-right font-mono text-lg">{row.current_stock}</TableCell>
                  <TableCell className="text-right font-mono text-textMuted hidden sm:table-cell">{row.initial_stock}</TableCell>
                  <TableCell className="text-right font-mono text-textMuted hidden sm:table-cell">{row.min_stock}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${row.stock_status.includes('Low') ? 'bg-dangerBg text-danger' : 'bg-successBg text-success'}`}>
                      {row.stock_status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="bg-surfaceHover text-textMuted px-2 py-1 rounded text-xs">
                      {row.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setProductToEdit(row)} className="p-1 text-textMuted hover:text-accentBlue transition-colors" title="Edit Product">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setProductToDelete(row)} className="p-1 text-textMuted hover:text-danger transition-colors" title="Delete Product">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EditProductModal 
        isOpen={!!productToEdit} 
        onClose={() => setProductToEdit(null)} 
        product={productToEdit}
        onSuccess={fetchData} 
      />
      
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.product_name}"? This will also delete all its associated Stock In/Out history forever. This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
