import { useEffect, useState, Fragment } from 'react';
import { supabase } from '../lib/supabase';
import type { StockLog } from '../types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Edit2, Trash2, Search } from 'lucide-react';
import { EditActionModal } from './EditForms';
import { ConfirmModal } from './ui/ConfirmModal';
import { useToast } from './ui/Toast';

export function LogsTab({ refreshTrigger, filter = 'all', onMutation }: { refreshTrigger: number, filter?: 'all' | 'today', onMutation?: () => void }) {
  const [data, setData] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>(filter === 'today' ? 'today' : 'all');
  
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
      if (onMutation) onMutation();
      else fetchData();
    }
  };

  const now = new Date();
  const todayString = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const filteredData = data.filter(log => {
    const logDate = new Date(log.created_at);
    if (timeFilter === 'today' && logDate.toDateString() !== todayString) return false;
    if (timeFilter === 'yesterday' && logDate.toDateString() !== yesterdayString) return false;
    if (timeFilter === 'week' && logDate < sevenDaysAgo) return false;
    return true;
  }).filter(row => row.products?.product_name.toLowerCase().includes(search.toLowerCase()));

  const visibleRows = filteredData.slice(0, visibleCount);
  
  // Group by exact created_at timestamp
  const groupedData = visibleRows.reduce((acc, row) => {
    if (!acc[row.created_at]) acc[row.created_at] = [];
    acc[row.created_at].push(row);
    return acc;
  }, {} as Record<string, typeof visibleRows>);

  const sortedGroups = Object.entries(groupedData).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value as any)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accentBlue"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Last 7 Days</option>
          <option value="all">All Time</option>
        </select>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-textMuted" />
          <input
            placeholder="Search by product name..."
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accentBlue"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
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
              ) : sortedGroups.map(([date, rows]) => (
                <Fragment key={date}>
                  {rows.map((row, index) => (
                    <TableRow key={row.id} className={rows.length > 1 ? 'bg-dangerBg/10' : ''}>
                      <TableCell className="font-medium flex items-center gap-2 relative pl-10">
                        {rows.length > 1 ? (
                          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center">
                            <div className={`w-[2px] bg-danger/30 ${index === 0 ? 'h-1/2 mt-auto' : index === rows.length - 1 ? 'h-1/2 mb-auto' : 'h-full'}`}></div>
                            <div className="w-2 h-2 rounded-full bg-danger absolute top-1/2 -translate-y-1/2 ring-4 ring-surface"></div>
                          </div>
                        ) : (
                          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                          </div>
                        )}
                        <span className="text-textMuted">📄</span> {row.products?.product_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-danger">-{row.quantity}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-surfaceHover text-textMain border border-border">
                          {row.log_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-textMuted text-sm">
                        {new Date(row.created_at).toLocaleString('en-GB', { 
                          day: '2-digit', month: '2-digit', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit', hour12: true 
                        })}
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
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && (filteredData.length > visibleCount || visibleCount > 10) && (
        <div className="mt-4 flex justify-center gap-2">
          {filteredData.length > visibleCount && (
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="text-sm font-medium text-accentBlue hover:text-blue-600 bg-accentBlue/10 hover:bg-accentBlue/20 px-4 py-2 rounded-full transition-colors"
            >
              See More ({filteredData.length - visibleCount} remaining)
            </button>
          )}
          {visibleCount > 10 && (
            <button 
              onClick={() => setVisibleCount(10)}
              className="text-sm font-medium text-textMuted hover:text-textMain bg-surfaceHover px-4 py-2 rounded-full transition-colors"
            >
              See Less
            </button>
          )}
        </div>
      )}
      
      <EditActionModal 
        isOpen={!!recordToEdit} 
        onClose={() => setRecordToEdit(null)} 
        record={recordToEdit}
        type="outflow"
        onSuccess={() => { if(onMutation) onMutation(); else fetchData(); }} 
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
