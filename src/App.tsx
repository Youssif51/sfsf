import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ProductsTab } from './components/ProductsTab';
import { AdditionsTab } from './components/AdditionsTab';
import { LogsTab } from './components/LogsTab';
import { ToastProvider } from './components/ui/Toast';
import { Button } from './components/ui/Button';
import { AddProductModal, QuickActionModal } from './components/Forms';
import { Plus } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'products' | 'additions' | 'logs'>('products');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modal states
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [isQuickInflowOpen, setQuickInflowOpen] = useState(false);
  const [isQuickOutflowOpen, setQuickOutflowOpen] = useState(false);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="flex justify-end gap-2 mb-6">
        <Button onClick={() => setAddProductOpen(true)} className="gap-2">
          <Plus size={18} /> New Product
        </Button>
        <Button onClick={() => setQuickInflowOpen(true)} variant="secondary">
          Quick Inflow
        </Button>
        <Button onClick={() => setQuickOutflowOpen(true)} variant="secondary">
          Quick Outflow
        </Button>
      </div>

      {activeTab === 'products' && <ProductsTab refreshTrigger={refreshTrigger} />}
      {activeTab === 'additions' && <AdditionsTab refreshTrigger={refreshTrigger} />}
      {activeTab === 'logs' && <LogsTab refreshTrigger={refreshTrigger} />}

      <AddProductModal 
        isOpen={isAddProductOpen} 
        onClose={() => setAddProductOpen(false)} 
        onSuccess={handleSuccess} 
      />
      
      <QuickActionModal 
        type="inflow"
        isOpen={isQuickInflowOpen} 
        onClose={() => setQuickInflowOpen(false)} 
        onSuccess={handleSuccess} 
      />

      <QuickActionModal 
        type="outflow"
        isOpen={isQuickOutflowOpen} 
        onClose={() => setQuickOutflowOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
