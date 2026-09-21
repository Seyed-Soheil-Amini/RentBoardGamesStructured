import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Wallet, Package, Clock, ShieldCheck, Gamepad2, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

const UserDashboard = () => {
  const { user, refreshWallet } = useAuth();
  const [activeTab, setActiveTab] = useState('CATALOG');
  const [inventory, setInventory] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [topupAmount, setTopupAmount] = useState('');
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchRentals();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory/');
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await axios.get('/api/rentals/my-rentals/');
      setRentals(response.data);
    } catch (error) {
      console.error('Failed to fetch rentals', error);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/wallet/topup/', { amount: topupAmount });
      setIsTopupModalOpen(false);
      setTopupAmount('');
      refreshWallet();
    } catch (error) {
      alert('Topup failed. Please enter a valid amount.');
    }
  };

  const handleBook = async (itemId) => {
    try {
      await axios.post('/api/rentals/book/', { inventory_item_id: itemId });
      alert('Rental booked successfully!');
      fetchInventory();
      fetchRentals();
      refreshWallet();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to book rental.');
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.cafe.city.toLowerCase().includes(cityFilter.toLowerCase())
  );

  const activeRentals = rentals.filter(r => ['RESERVED', 'PICKED_UP'].includes(r.status));
  const historyRentals = rentals.filter(r => ['RETURNED_SAFE', 'RETURNED_DAMAGED'].includes(r.status));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Wallet & Plan Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> Wallet Balance
            </h2>
            <div className="text-4xl font-bold text-white">${user?.profile?.wallet_balance || '0.00'}</div>
            <div className="text-sm text-slate-400 mt-1">
              Escrow Held: ${user?.profile?.escrow_balance || '0.00'}
            </div>
          </div>
          <button 
            onClick={() => setIsTopupModalOpen(true)}
            className="glass-button px-6 py-3 rounded-xl flex items-center gap-2"
          >
            Add Funds
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-fuchsia-400" /> Active Plan
            </h2>
            <div className="text-2xl font-bold text-white uppercase tracking-wider">
              {user?.profile?.subscription_tier?.name || 'BASIC'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {user?.profile?.subscription_tier?.free_days || 3} Free Days included
            </div>
          </div>
          <button className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600 px-6 py-3 rounded-xl transition-colors z-10">
            Upgrade Plan
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-700 pb-2">
        {['CATALOG', 'ACTIVE_RENTALS', 'HISTORY'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        {/* Game Catalog */}
        {activeTab === 'CATALOG' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Available Games</h3>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter by City..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="glass-input pl-10 pr-4 py-2 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredInventory.map(item => {
                const depositPercent = user?.profile?.subscription_tier?.deposit_percent || 100;
                const depositRequired = (item.board_game.retail_price * depositPercent) / 100;
                
                return (
                  <div key={item.id} className="glass-panel p-5 rounded-2xl flex flex-col h-full group hover:border-indigo-500/50 transition-colors">
                    <div className="bg-slate-900 rounded-xl p-6 mb-4 flex items-center justify-center border border-slate-800">
                      <Gamepad2 className="w-16 h-16 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-bold text-white mb-1">{item.board_game.title}</h4>
                      <p className="text-sm text-slate-400 mb-3">{item.board_game.publisher}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                        <MapPin className="w-4 h-4 text-emerald-400" /> {item.cafe.name}, {item.cafe.city}
                      </div>
                      <div className="flex justify-between text-sm text-slate-300 mb-4 bg-slate-800/50 p-3 rounded-lg">
                        <span>Deposit Required:</span>
                        <span className="font-semibold text-emerald-400">${depositRequired.toFixed(2)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBook(item.id)}
                      className="glass-button w-full py-2.5 rounded-lg mt-auto"
                    >
                      Book Rental
                    </button>
                  </div>
                );
              })}
              {filteredInventory.length === 0 && (
                <div className="col-span-3 text-center py-12 text-slate-400">
                  No games found in this area.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Rentals */}
        {activeTab === 'ACTIVE_RENTALS' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">Active Bookings</h3>
            {activeRentals.map(rental => (
              <div key={rental.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-slate-800 rounded-xl">
                    <Package className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{rental.inventory_item.board_game.title}</h4>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Pickup at {rental.pickup_cafe.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</div>
                    <div className="font-semibold text-white bg-slate-800 px-3 py-1 rounded-full text-sm">
                      {rental.status}
                    </div>
                  </div>
                  
                  {rental.due_date && (
                    <div className="text-center">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Due Date
                      </div>
                      <div className="font-semibold text-rose-300">
                        {new Date(rental.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pickup Code</div>
                    <div className="font-mono text-xl font-bold text-indigo-400 bg-indigo-500/10 px-4 py-1 rounded-lg border border-indigo-500/20">
                      #{rental.id.toString().padStart(4, '0')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activeRentals.length === 0 && (
              <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl border-dashed">
                You have no active rentals. Head to the catalog to book a game!
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">Rental History</h3>
            {historyRentals.map(rental => (
              <div key={rental.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{rental.inventory_item.board_game.title}</h4>
                  <p className="text-sm text-slate-400">Returned on {new Date(rental.return_date).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-slate-300">Base Fee: ${rental.rent_fee_charged}</div>
                    {parseFloat(rental.late_fee_charged) > 0 && (
                      <div className="text-sm text-rose-400">Late Fee: ${rental.late_fee_charged}</div>
                    )}
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${rental.status === 'RETURNED_SAFE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {rental.status === 'RETURNED_SAFE' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {rental.status.split('_')[1]}
                  </div>
                </div>
              </div>
            ))}
            {historyRentals.length === 0 && (
              <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl border-dashed">
                Your past rentals will appear here.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Topup Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-sm w-full relative">
            <button 
              onClick={() => setIsTopupModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">Add Funds</h3>
            <p className="text-slate-400 text-sm mb-6">Enter amount to top up your wallet.</p>
            
            <form onSubmit={handleTopup}>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number"
                  min="1"
                  step="0.01"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="glass-input w-full pl-8 pr-4 py-3 rounded-xl"
                  placeholder="0.00"
                  required
                />
              </div>
              <button type="submit" className="glass-button w-full py-3 rounded-xl">
                Confirm Top Up
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
