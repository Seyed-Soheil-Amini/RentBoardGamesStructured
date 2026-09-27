import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Settings, Database, Store } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('METRICS');
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Onboarding state
  const [newCafe, setNewCafe] = useState({ user_id: '', name: '', city: '', address: '' });

  useEffect(() => {
    if (activeTab === 'METRICS') fetchMetrics();
    if (activeTab === 'GLOBAL_LEDGER') fetchTransactions();
  }, [activeTab]);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/admin/metrics/');
      setMetrics(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/admin/transactions/');
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOnboardCafe = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/cafes/', newCafe);
      alert(t.adminDashboard.onboardSuccess);
      setNewCafe({ user_id: '', name: '', city: '', address: '' });
      fetchMetrics();
    } catch (error) {
      alert(error.response?.data?.error || t.adminDashboard.onboardFailed);
    }
  };

  if (user?.role !== 'ADMIN') return <div className="text-center text-white py-12">{t.adminDashboard.unauthorized}</div>;

  const tabList = [
    { id: 'METRICS', label: t.adminDashboard.tabs.metrics },
    { id: 'CAFE_ONBOARDING', label: t.adminDashboard.tabs.cafeOnboarding },
    { id: 'GLOBAL_LEDGER', label: t.adminDashboard.tabs.globalLedger },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between bg-slate-900/80 border-rose-500/30">
        <div>
          <h2 className="text-xl font-semibold text-rose-400 flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5" /> {t.adminDashboard.adminPanel}
          </h2>
          <div className="text-3xl font-bold text-white">{t.adminDashboard.controlCenter}</div>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-slate-700 pb-2 overflow-x-auto">
        {tabList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        
        {activeTab === 'METRICS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl">
              <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{t.adminDashboard.activeRentals}</div>
              <div className="text-4xl font-bold text-white">{metrics?.active_rentals || 0}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{t.adminDashboard.escrowLocked}</div>
              <div className="text-4xl font-bold text-emerald-400">${metrics?.total_escrow_locked || '0.00'}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{t.adminDashboard.platformRevenue}</div>
              <div className="text-4xl font-bold text-indigo-400">${metrics?.total_revenue_generated || '0.00'}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{t.adminDashboard.partnerHubs}</div>
              <div className="text-4xl font-bold text-fuchsia-400">{metrics?.total_partner_hubs || 0}</div>
            </div>
          </div>
        )}

        {activeTab === 'CAFE_ONBOARDING' && (
          <div className="glass-panel p-8 rounded-2xl max-w-2xl">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Store className="w-6 h-6 text-rose-400" /> {t.adminDashboard.onboardTitle}
            </h3>
            <form onSubmit={handleOnboardCafe} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-300 mb-1">{t.adminDashboard.userId}</label>
                <input type="text" required value={newCafe.user_id} onChange={e => setNewCafe({...newCafe, user_id: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl" placeholder="e.g. 5" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">{t.adminDashboard.cafeName}</label>
                <input type="text" required value={newCafe.name} onChange={e => setNewCafe({...newCafe, name: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t.adminDashboard.city}</label>
                  <input type="text" required value={newCafe.city} onChange={e => setNewCafe({...newCafe, city: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t.adminDashboard.address}</label>
                  <input type="text" required value={newCafe.address} onChange={e => setNewCafe({...newCafe, address: e.target.value})} className="glass-input w-full px-4 py-3 rounded-xl" />
                </div>
              </div>
              <button type="submit" className="glass-button w-full py-3 rounded-xl bg-rose-600/80 hover:bg-rose-500/80 border-rose-500/50 mt-4">
                {t.adminDashboard.onboardBtn}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'GLOBAL_LEDGER' && (
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Database className="w-5 h-5 text-indigo-400" /> {t.adminDashboard.globalLedgerTitle}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm">TxID</th>
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm">{t.adminDashboard.typeCol}</th>
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm">{t.adminDashboard.amountCol}</th>
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm">{t.adminDashboard.userCol}</th>
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm">{t.adminDashboard.dateCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-4 px-4 text-slate-400 text-sm font-mono">{tx.id}</td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-300 uppercase">{tx.transaction_type}</td>
                      <td className={`py-4 px-4 font-bold ${parseFloat(tx.amount) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {parseFloat(tx.amount) > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="py-4 px-4 text-slate-200 text-sm">{tx.description}</td>
                      <td className="py-4 px-4 text-slate-400 text-sm whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-500">{t.adminDashboard.noTransactions}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
