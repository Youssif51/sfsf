import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StockAddition } from '../types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

export function AdditionsTab({ refreshTrigger }: { refreshTrigger: number }) {
  const [data, setData] = useState<StockAddition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: additions, error } = await supabase
        .from('stock_additions')
        .select(`
          id, product_id, quantity_added, type, created_at, notes,
          products ( product_name )
        `)
        .order('created_at', { ascending: false });
      
      if (!error && additions) {
        setData(additions as any);
      }
      setLoading(false);
    };

    fetchData();
  }, [refreshTrigger]);

  return (
    <div className="p-4">
      
      {loading ? (
        <div className="text-center py-10 text-textMuted animate-pulse">Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity Added</TableHead>
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
                <TableCell className="text-right font-mono">{row.quantity_added}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${row.type === 'مرتجع' ? 'bg-accentOrange/20 text-accentOrange' : 'bg-surfaceHover text-textMuted'}`}>
                    {row.type}
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
