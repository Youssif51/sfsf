import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StockAddition } from '../types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Edit2, Trash2 } from 'lucide-react';
import { EditActionModal } from './EditForms';
import { ConfirmModal } from './ui/ConfirmModal';
import { useToast } from './ui/Toast';

export function AdditionsTab({ refreshTrigger }: { refreshTrigger: number }) {
  const [data, setData] = useState<StockAddition[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [recordToEdit, setRecordToEdit] = useState<StockAddition | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<StockAddition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock_additions')
      .select('*, products(product_name)')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching additions:", error);
    else setData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('stock_additions').delete().eq('id', recordToDelete.id);
    setIsDeleting(false);
    
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Inflow record deleted successfully', 'success');
      setRecordToDelete(null);
      fetchData();
    }
  };

  return (
    <div className="p-4">
      
      {loading && data.length === 0 ? (
        <div className="text-center py-10 text-textMuted animate-pulse">Loading...</div>
      ) : (
        <div className={`rounded-md border border-border overflow-x-auto transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-textMuted py-8">No records found.</TableCell>
                </TableRow>
              ) : data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <span className="text-textMuted">📄</span> {row.products?.product_name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-success">+{row.quantity_added}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-surfaceHover text-textMain border border-border">
                      {row.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-textMuted text-sm">
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setRecordToEdit(row)} className="p-1 text-textMuted hover:text-accentBlue transition-colors" title="Edit Record">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setRecordToDelete(row)} className="p-1 text-textMuted hover:text-danger transition-colors" title="Delete Record">
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
      
      <EditActionModal 
        isOpen={!!recordToEdit} 
        onClose={() => setRecordToEdit(null)} 
        record={recordToEdit}
        type="inflow"
        onSuccess={fetchData} 
      />
      
      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Are you sure you want to delete this inflow record? This action will adjust the stock balance and cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
