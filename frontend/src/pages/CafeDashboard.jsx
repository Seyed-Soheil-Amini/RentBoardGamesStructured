import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Store, PackageCheck, ClipboardCheck, ArrowLeftRight, Gamepad2, Plus } from 'lucide-react';

const CafeDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('OPERATIONS');
  const [rentals, setRentals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [ledger, setLedger] = useState([]);
  
  // Handover state
  const [handoverCode, setHandoverCode] = useState('');
  
  // Add Inventory State
  const [newGame, setNewGame] = useState({ title: '', publisher: '', retail_price: '' });

  useEffect(() => {
    fetchRentals();
    fetchInventory();
    fetchLedger();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await axios.get('/api/rentals/cafe-rentals/');
      setRentals(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory/cafe/');
      setInventory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLedger = async () => {
    try {
      const response = await axios.get('/api/wallet/transactions/');
      setLedger(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleHandover = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/rentals/${handoverCode}/handover/`);
      alert('Handover successful! Game is now picked up.');
      setHandoverCode('');
      fetchRentals();
    } catch (error) {
      alert(error.response?.data?.error || 'Handover failed.');
    }
  };

  const handleReturn = async (id, condition) => {
    try {
      await axios.post(`/api/rentals/${id}/return/`, { condition });
      alert(`Game successfully processed as ${condition}.`);
      fetchRentals();
      fetchLedger();
    } catch (error) {
      alert(error.response?.data?.error || 'Return failed.');
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/inventory/add/', newGame);
      alert('Game added successfully!');
      setNewGame({ title: '', publisher: '', retail_price: '' });
      fetchInventory();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add game.');
    }
  };

  const pendingPickups = rentals.filter(r => r.status === 'RESERVED');
  const pendingReturns = rentals.filter(r => r.status === 'PICKED_UP');
  const revenueShares = ledger.filter(tx => tx.transaction_type === 'REVENUE_SHARE');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-fuchsia-400 flex items-center gap-2 mb-1">
            <Store className="w-5 h-5" /> Partner Cafe Hub
          </h2>
          <div className="text-3xl font-bold text-white">{user?.username}'s Location</div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-sm">Hub Balance</div>
          <div className="text-3xl font-bold text-emerald-400">${user?.profile?.wallet_balance || '0.00'}</div>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-slate-700 pb-2 overflow-x-auto">
        {['OPERATIONS', 'INVENTORY_MANAGER', 'EARNINGS_LEDGER'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'OPERATIONS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Handover Terminal */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <PackageCheck className="w-6 h-6 text-fuchsia-400" /> Handover Terminal
              </h3>
              <form onSubmit={handleHandover} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Enter Booking Code (Rental ID)</label>
                  <input 
                    type="text" 
                    value={handoverCode}
                    onChange={(e) => setHandoverCode(e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-xl font-mono text-lg"
                    placeholder="#1234"
                    required
                  />
                </div>
                <button type="submit" className="glass-button w-full py-3 rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-500/80 border-fuchsia-500/50">
                  Confirm Pickup
                </button>
              </form>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Pending Pickups Today</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {pendingPickups.map(r => (
                    <div key={r.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex justify-between items-center">
                      <span className="text-slate-300">{r.inventory_item.board_game.title}</span>
                      <span className="font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded">#{r.id}</span>
                    </div>
                  ))}
                  {pendingPickups.length === 0 && <div className="text-slate-500 text-sm">No pending pickups.</div>}
                </div>
              </div>
            </div>

            {/* Return Terminal */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <ClipboardCheck className="w-6 h-6 text-emerald-400" /> Return & Inspection
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {pendingReturns.map(r => (
                  <div key={r.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white">{r.inventory_item.board_game.title}</h4>
                        <p className="text-sm text-slate-400 font-mono">Code: #{r.id} | Renter: User {r.renter}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleReturn(r.id, 'SAFE')}
                        className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        Intact (Safe)
                      </button>
                      <button 
                        onClick={() => handleReturn(r.id, 'DAMAGED')}
                        className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        Damaged / Ruined
                      </button>
                    </div>
                  </div>
                ))}
                {pendingReturns.length === 0 && (
                  <div className="text-slate-500 text-center py-10">No games currently checked out from this hub.</div>
                )}
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'INVENTORY_MANAGER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-indigo-400" /> Crowdsource Game
              </h3>
              <form onSubmit={handleAddInventory} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Title</label>
                  <input type="text" required value={newGame.title} onChange={e => setNewGame({...newGame, title: e.target.value})} className="glass-input w-full px-4 py-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Publisher</label>
                  <input type="text" value={newGame.publisher} onChange={e => setNewGame({...newGame, publisher: e.target.value})} className="glass-input w-full px-4 py-2 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Retail Price ($)</label>
                  <input type="number" step="0.01" required value={newGame.retail_price} onChange={e => setNewGame({...newGame, retail_price: e.target.value})} className="glass-input w-full px-4 py-2 rounded-lg" />
                </div>
                <button type="submit" className="glass-button w-full py-2.5 rounded-lg">Add to Hub</button>
              </form>
            </div>
            
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Hub Inventory</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inventory.map(item => (
                  <div key={item.id} className="glass-panel p-4 rounded-xl flex items-center gap-4 border-l-4 border-indigo-500">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <Gamepad2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.board_game.title}</h4>
                      <p className="text-sm text-slate-400">${item.board_game.retail_price} | {item.is_damaged ? <span className="text-rose-400">Damaged</span> : <span className="text-emerald-400">Available</span>}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'EARNINGS_LEDGER' && (
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ArrowLeftRight className="w-5 h-5 text-emerald-400" /> 20% Revenue Share Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm">Date</th>
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm">Description</th>
                    <th className="py-3 px-4 text-slate-400 font-medium text-sm text-right">Amount Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueShares.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-4 px-4 text-slate-300 text-sm whitespace-nowrap">{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-slate-200">{tx.description}</td>
                      <td className="py-4 px-4 font-bold text-emerald-400 text-right">+${tx.amount}</td>
                    </tr>
                  ))}
                  {revenueShares.length === 0 && (
                    <tr><td colSpan="3" className="py-8 text-center text-slate-500">No revenue shares accrued yet.</td></tr>
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

export default CafeDashboard;
