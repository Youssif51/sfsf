import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StockLog } from '../types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Edit2, Trash2 } from 'lucide-react';
import { EditActionModal } from './EditForms';
import { ConfirmModal } from './ui/ConfirmModal';
import { useToast } from './ui/Toast';

export function LogsTab({ refreshTrigger, filter = 'all' }: { refreshTrigger: number, filter?: 'all' | 'today' }) {
  const [data, setData] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [recordToEdit, setRecordToEdit] = useState<StockLog | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<StockLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock_log')
      .select('*, products(product_name)')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching logs:", error);
    else setData(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('stock_log').delete().eq('id', recordToDelete.id);
    setIsDeleting(false);
    
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Outflow record deleted successfully', 'success');
      setRecordToDelete(null);
      fetchData();
    }
  };

  const filteredData = filter === 'today'
    ? data.filter(log => new Date(log.created_at).toDateString() === new Date().toDateString())
    : data;

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
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-textMuted py-8">No records found.</TableCell>
                </TableRow>
              ) : filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <span className="text-textMuted">📄</span> {row.products?.product_name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-danger">-{row.quantity}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-surfaceHover text-textMain border border-border">
                      {row.log_type}
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
        type="outflow"
        onSuccess={fetchData} 
      />
      
      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Are you sure you want to delete this outflow record? This action will adjust the stock balance and cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
