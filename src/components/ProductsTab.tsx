import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProductStockMetrics } from '../types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Search } from 'lucide-react';

export function ProductsTab({ refreshTrigger }: { refreshTrigger: number }) {
  const [data, setData] = useState<ProductStockMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: metrics, error } = await supabase
        .from('product_stock_metrics')
        .select('*')
        .order('product_name');
      
      if (!error && metrics) {
        setData(metrics);
      }
      setLoading(false);
    };

    fetchData();
  }, [refreshTrigger]);

  const filteredData = data.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">All Products</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-textMuted" />
          <input
            placeholder="Search products..."
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accentBlue"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-textMuted animate-pulse">Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Initial</TableHead>
              <TableHead className="text-right">Min Stock</TableHead>
              <TableHead className="text-right">Total Added</TableHead>
              <TableHead className="text-right">Total Consumed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-textMuted py-8">No products found.</TableCell>
              </TableRow>
            ) : filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <span className="text-textMuted">📄</span> {row.product_name}
                </TableCell>
                <TableCell className="text-right font-mono">{row.current_stock}</TableCell>
                <TableCell className="text-right font-mono text-textMuted">{row.initial_stock}</TableCell>
                <TableCell className="text-right font-mono text-textMuted">{row.min_stock}</TableCell>
                <TableCell className="text-right font-mono text-textMuted">{row.total_added}</TableCell>
                <TableCell className="text-right font-mono text-textMuted">{row.total_consumed}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${row.stock_status.includes('Low') ? 'bg-dangerBg text-danger' : 'bg-successBg text-success'}`}>
                    {row.stock_status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="bg-surfaceHover text-textMuted px-2 py-1 rounded text-xs">
                    {row.unit}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
