import { useState } from 'react';
import { Layout } from './components/Layout';
import { ProductsTab } from './components/ProductsTab';
import { AdditionsTab } from './components/AdditionsTab';
import { LogsTab } from './components/LogsTab';
import { ToastProvider } from './components/ui/Toast';
import { Button } from './components/ui/Button';
import { AddProductModal, QuickActionModal } from './components/Forms';
import { Plus, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

function AppContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modal states
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [isQuickInflowOpen, setQuickInflowOpen] = useState(false);
  const [isQuickOutflowOpen, setQuickOutflowOpen] = useState(false);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold text-textMain tracking-tight">Inventory Dashboard</h1>
        <p className="text-textMuted mt-2 text-sm">
         اهلاً بالمعلم صفصف وأعوانة 
        </p>
      </div>

      <div className="space-y-16">
        
        {/* Section 1: Stock Alerts */}
        <section className="bg-dangerBg/5 border border-danger/10 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-danger"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-danger/20 p-2 rounded-lg text-danger">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain">Stock Alerts</h2>
              <p className="text-sm text-textMuted">Products that have fallen below their minimum required stock level.</p>
            </div>
          </div>
          <div className="bg-surface rounded-xl border border-border shadow-sm">
            <ProductsTab refreshTrigger={refreshTrigger} filter="low_stock" onMutation={handleSuccess} />
          </div>
        </section>

        <div className="space-y-8">
          {/* Section 2: Add Stock (Inflow) */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                  <span className="text-xl">📥</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-textMain">Incoming Stock</h2>
                  <p className="text-xs sm:text-sm text-textMuted">New shipments & returns.</p>
                </div>
              </div>
              <Button onClick={() => setQuickInflowOpen(true)} className="w-full sm:w-auto gap-2 bg-emerald-600 text-white hover:bg-emerald-500" size="sm">
                <ArrowDownToLine size={16} /> + Stock In
              </Button>
            </div>
            <div className="bg-surface rounded-xl border border-border shadow-sm p-1">
              <AdditionsTab refreshTrigger={refreshTrigger} onMutation={handleSuccess} />
            </div>
          </section>

          {/* Section 3: Today's Activity (Outflow) */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-rose-500/10 p-2 rounded-lg text-rose-500">
                  <span className="text-xl">📤</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-textMain">Outgoing Stock</h2>
                  <p className="text-xs sm:text-sm text-textMuted">Today's sales & consumption.</p>
                </div>
              </div>
              <Button onClick={() => setQuickOutflowOpen(true)} className="w-full sm:w-auto gap-2 bg-rose-600 text-white hover:bg-rose-500" size="sm">
                <ArrowUpFromLine size={16} /> - Stock Out
              </Button>
            </div>
            <div className="bg-surface rounded-xl border border-border shadow-sm p-1">
              <LogsTab refreshTrigger={refreshTrigger} filter="today" onMutation={handleSuccess} />
            </div>
          </section>
        </div>

        {/* Section 4: All Products */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-surfaceHover p-2 rounded-lg text-accentBlue">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-textMain">Products Master Database</h2>
                <p className="text-xs sm:text-sm text-textMuted">Overview of all inventory items and their current balances.</p>
              </div>
            </div>
            <Button onClick={() => setAddProductOpen(true)} className="w-full sm:w-auto gap-2 shadow-sm bg-accentBlue text-white hover:bg-blue-600">
              <Plus size={18} /> Add New Product
            </Button>
          </div>
          <div className="bg-surface rounded-xl border border-border shadow-sm">
            <ProductsTab refreshTrigger={refreshTrigger} filter="all" onMutation={handleSuccess} />
          </div>
        </section>

      </div>

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
