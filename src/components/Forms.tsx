import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { supabase } from '../lib/supabase';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    initial_stock: 0,
    min_stock: 1,
    unit: 'Piece'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('products')
      .insert([formData]);

    setLoading(false);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Product added successfully', 'success');
      onSuccess();
      onClose();
      setFormData({ product_name: '', initial_stock: 0, min_stock: 1, unit: 'Piece' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Product Name" 
          required 
          value={formData.product_name}
          onChange={(e) => setFormData({...formData, product_name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Initial Stock" 
            type="number" 
            min="0"
            required 
            value={formData.initial_stock}
            onChange={(e) => setFormData({...formData, initial_stock: parseInt(e.target.value)})}
          />
          <Input 
            label="Min Stock" 
            type="number" 
            min="0"
            required 
            value={formData.min_stock}
            onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value)})}
          />
        </div>
        <Select 
          label="Unit"
          options={[
            { value: 'Piece', label: 'Piece' },
            { value: 'Box', label: 'Box' },
            { value: 'Kg', label: 'Kg' },
          ]}
          value={formData.unit}
          onChange={(e) => setFormData({...formData, unit: e.target.value})}
        />
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</Button>
        </div>
      </form>
    </Modal>
  );
}

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'inflow' | 'outflow';
}

export function QuickActionModal({ isOpen, onClose, onSuccess, type }: QuickActionModalProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{id: string, product_name: string}[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    action_type: type === 'inflow' ? 'شحنة جديدة' : 'مبيعات / شحن',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      supabase.from('products').select('id, product_name').order('product_name')
        .then(({ data }) => setProducts(data || []));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    if (type === 'inflow') {
      const { error: err } = await supabase.from('stock_additions').insert([{
        product_id: formData.product_id,
        quantity_added: formData.quantity,
        type: formData.action_type,
        notes: formData.notes
      }]);
      error = err;
    } else {
      const { error: err } = await supabase.from('stock_log').insert([{
        product_id: formData.product_id,
        quantity: formData.quantity,
        log_type: formData.action_type,
        notes: formData.notes
      }]);
      error = err;
    }

    setLoading(false);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast(`Stock ${type} recorded successfully`, 'success');
      onSuccess();
      onClose();
      setFormData({ ...formData, quantity: 1, notes: '' });
    }
  };

  const inflowOptions = [
    { value: 'شحنة جديدة', label: 'شحنة جديدة (New Shipment)' },
    { value: 'مرتجع', label: 'مرتجع (Return)' },
  ];

  const outflowOptions = [
    { value: 'مبيعات / شحن', label: 'مبيعات / شحن (Sales/Shipping)' },
    { value: 'تالف / هالك', label: 'تالف / هالك (Damaged/Waste)' },
    { value: 'عينة / فحص', label: 'عينة / فحص (Sample/Inspection)' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={type === 'inflow' ? 'Quick Inflow' : 'Quick Outflow'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select 
          label="Select Product"
          required
          options={[ { value: '', label: 'Select a product...' }, ...products.map(p => ({ value: p.id, label: p.product_name })) ]}
          value={formData.product_id}
          onChange={(e) => setFormData({...formData, product_id: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Quantity" 
            type="number" 
            min="1"
            required 
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
          />
          <Select 
            label="Type"
            options={type === 'inflow' ? inflowOptions : outflowOptions}
            value={formData.action_type}
            onChange={(e) => setFormData({...formData, action_type: e.target.value})}
          />
        </div>
        <Input 
          label="Notes (Optional)" 
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading} variant={type === 'inflow' ? 'primary' : 'danger'}>
            {loading ? 'Saving...' : (type === 'inflow' ? 'Add Stock' : 'Deduct Stock')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
