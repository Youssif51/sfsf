import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StockLog } from '../types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

export function LogsTab({ refreshTrigger }: { refreshTrigger: number }) {
  const [data, setData] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: logs, error } = await supabase
        .from('stock_log')
        .select(`
          id, product_id, quantity, log_type, created_at, notes,
          products ( product_name )
        `)
        .order('created_at', { ascending: false });
      
      if (!error && logs) {
        setData(logs as any);
      }
      setLoading(false);
    };

    fetchData();
  }, [refreshTrigger]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Stock Log (Outflow)</h2>
      
      {loading ? (
        <div className="text-center py-10 text-textMuted animate-pulse">Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity Deducted</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
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
                <TableCell className="text-right font-mono text-danger">-{row.quantity}</TableCell>
                <TableCell>
                  <span className="bg-surfaceHover text-textMuted px-2 py-1 rounded text-xs font-medium">
                    {row.log_type}
                  </span>
                </TableCell>
                <TableCell className="text-textMuted">{new Date(row.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-textMuted">{row.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
