import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { NumberSpinner } from './ui/NumberSpinner';
import { Select } from './ui/Select';
import { SearchableSelect } from './ui/SearchableSelect';
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
  
  const [actionType, setActionType] = useState(type === 'inflow' ? 'شحنة جديدة' : 'مبيعات / شحن');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  // Reset state when type changes or modal opens
  useEffect(() => {
    setActionType(type === 'inflow' ? 'شحنة جديدة' : 'مبيعات / شحن');
    setNotes('');
    setItems([{ product_id: '', quantity: 1 }]);
  }, [type, isOpen]);

  useEffect(() => {
    if (isOpen) {
      supabase.from('products').select('id, product_name').order('product_name')
        .then(({ data }) => setProducts(data || []));
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all items have a product selected
    if (items.some(item => !item.product_id)) {
      addToast('Please select a product for all rows', 'error');
      return;
    }

    setLoading(true);
    
    let error;
    if (type === 'inflow') {
      const payload = items.map(item => ({
        product_id: item.product_id,
        quantity_added: item.quantity,
        type: actionType,
        notes: notes
      }));
      const { error: err } = await supabase.from('stock_additions').insert(payload);
      error = err;
    } else {
      const payload = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        log_type: actionType,
        notes: notes
      }));
      const { error: err } = await supabase.from('stock_log').insert(payload);
      error = err;
    }

    setLoading(false);
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast(`Stock ${type} recorded successfully`, 'success');
      onSuccess();
      onClose();
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
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <h3 className="text-sm font-semibold text-textMuted">Items</h3>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="text-xs font-medium text-accentBlue hover:text-blue-400 bg-accentBlue/10 px-2 py-1 rounded"
            >
              + Add Another Product
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-start bg-surfaceHover/30 p-3 rounded-lg border border-border/50">
                <div className="flex-1 min-w-0">
                  <SearchableSelect 
                    label={`Product ${index + 1}`}
                    required
                    options={products.map(p => ({ value: p.id, label: p.product_name }))}
                    value={item.product_id}
                    onChange={(value) => handleItemChange(index, 'product_id', value)}
                  />
                </div>
                <div className="w-28 shrink-0">
                  <NumberSpinner 
                    label="Qty" 
                    min={1}
                    required 
                    value={item.quantity}
                    onChange={(val) => handleItemChange(index, 'quantity', val)}
                  />
                </div>
                {items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(index)}
                    className="mt-7 p-2 text-textMuted hover:text-danger hover:bg-dangerBg rounded-md transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 bg-surfaceHover/20 p-4 rounded-lg border border-border/30">
          <Select 
            label="Transaction Type"
            options={type === 'inflow' ? inflowOptions : outflowOptions}
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
          />
          <Input 
            label="Notes (Optional)" 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g. Invoice #12345"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading} variant={type === 'inflow' ? 'primary' : 'danger'}>
            {loading ? 'Saving...' : (type === 'inflow' ? 'Add Stock' : 'Deduct Stock')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
