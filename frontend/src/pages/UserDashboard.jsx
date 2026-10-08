import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Wallet, Package, Clock, ShieldCheck, Gamepad2, MapPin, CheckCircle, AlertTriangle, Sparkles, Check, Crown, Zap } from 'lucide-react';

const UserDashboard = () => {
  const { user, refreshWallet } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [activeTab, setActiveTab] = useState('CATALOG');
  const [inventory, setInventory] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [topupAmount, setTopupAmount] = useState('');
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState('');

  // Plan Upgrade state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [upgradingTierId, setUpgradingTierId] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchRentals();
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await axios.get('/api/wallet/subscription-tiers/');
      if (response.data && response.data.length > 0) {
        setTiers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tiers', error);
    }
  };

  const handleUpgrade = async (tier) => {
    const tierPrice = parseFloat(tier.price) || 0;
    const currentBalance = parseFloat(user?.profile?.wallet_balance) || 0;

    if (tierPrice > currentBalance) {
      if (confirm(`${t.userDashboard.insufficientFunds}\n\n${t.userDashboard.topupModalTitle}?`)) {
        setIsUpgradeModalOpen(false);
        setIsTopupModalOpen(true);
      }
      return;
    }

    setUpgradingTierId(tier.id);
    try {
      await axios.post('/api/wallet/subscribe/', {
        tier_id: tier.id,
        tier_name: tier.name
      });
      alert(t.userDashboard.upgradeSuccess);
      await refreshWallet();
      setIsUpgradeModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || t.userDashboard.upgradeFailed);
    } finally {
      setUpgradingTierId(null);
    }
  };

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
      alert(t.userDashboard.topupSuccess);
    } catch (error) {
      alert(t.userDashboard.topupFailed);
    }
  };

  const handleBook = async (itemId) => {
    try {
      await axios.post('/api/rentals/book/', { inventory_item_id: itemId });
      alert(t.userDashboard.bookingSuccess);
      fetchInventory();
      fetchRentals();
      refreshWallet();
    } catch (error) {
      alert(error.response?.data?.error || t.userDashboard.bookingFailed);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.cafe.city.toLowerCase().includes(cityFilter.toLowerCase())
  );

  const activeRentals = rentals.filter(r => ['RESERVED', 'PICKED_UP'].includes(r.status));
  const historyRentals = rentals.filter(r => ['RETURNED_SAFE', 'RETURNED_DAMAGED'].includes(r.status));

  const tabList = [
    { id: 'CATALOG', label: t.userDashboard.tabs.catalog },
    { id: 'ACTIVE_RENTALS', label: t.userDashboard.tabs.activeRentals },
    { id: 'HISTORY', label: t.userDashboard.tabs.history },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Wallet & Plan Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> {t.userDashboard.walletBalance}
            </h2>
            <div className="text-4xl font-bold text-white">{formatCurrency(user?.profile?.wallet_balance || 0)}</div>
            <div className="text-sm text-slate-400 mt-1">
              {t.userDashboard.escrowHeld} {formatCurrency(user?.profile?.escrow_balance || 0)}
            </div>
          </div>
          <button 
            onClick={() => setIsTopupModalOpen(true)}
            className="glass-button px-6 py-3 rounded-xl flex items-center gap-2"
          >
            {t.userDashboard.addFunds}
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-fuchsia-400" /> {t.userDashboard.activePlan}
            </h2>
            <div className="text-2xl font-bold text-white uppercase tracking-wider">
              {user?.profile?.subscription_tier?.name || 'BASIC'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {user?.profile?.subscription_tier?.free_days || 3} {t.userDashboard.freeDaysIncluded}
            </div>
          </div>
          <button 
            onClick={() => {
              setIsUpgradeModalOpen(true);
              fetchTiers();
            }}
            className="glass-button bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 z-10 flex items-center gap-2 cursor-pointer font-medium"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.userDashboard.upgradePlan}</span>
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-700 pb-2">
        {tabList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        {/* Game Catalog */}
        {activeTab === 'CATALOG' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">{t.userDashboard.availableGames}</h3>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.userDashboard.filterByCity}
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
                        <span>{t.userDashboard.depositRequired}</span>
                        <span className="font-semibold text-emerald-400">{formatCurrency(depositRequired)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBook(item.id)}
                      className="glass-button w-full py-2.5 rounded-lg mt-auto"
                    >
                      {t.userDashboard.bookRental}
                    </button>
                  </div>
                );
              })}
              {filteredInventory.length === 0 && (
                <div className="col-span-3 text-center py-12 text-slate-400">
                  {t.userDashboard.noGamesInArea}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Rentals */}
        {activeTab === 'ACTIVE_RENTALS' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">{t.userDashboard.activeBookings}</h3>
            {activeRentals.map(rental => (
              <div key={rental.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-slate-800 rounded-xl">
                    <Package className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{rental.inventory_item.board_game.title}</h4>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {t.userDashboard.pickupAt} {rental.pickup_cafe.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t.userDashboard.status}</div>
                    <div className="font-semibold text-white bg-slate-800 px-3 py-1 rounded-full text-sm">
                      {rental.status}
                    </div>
                  </div>
                  
                  {rental.due_date && (
                    <div className="text-center">
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> {t.userDashboard.dueDate}
                      </div>
                      <div className="font-semibold text-rose-300">
                        {new Date(rental.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t.userDashboard.pickupCode}</div>
                    <div className="font-mono text-xl font-bold text-indigo-400 bg-indigo-500/10 px-4 py-1 rounded-lg border border-indigo-500/20">
                      #{rental.id.toString().padStart(4, '0')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activeRentals.length === 0 && (
              <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl border-dashed">
                {t.userDashboard.noActiveRentals}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6">{t.userDashboard.rentalHistory}</h3>
            {historyRentals.map(rental => (
              <div key={rental.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{rental.inventory_item.board_game.title}</h4>
                  <p className="text-sm text-slate-400">
                    {t.userDashboard.returnedOn} {new Date(rental.return_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-slate-300">{t.userDashboard.baseFee} {formatCurrency(rental.rent_fee_charged)}</div>
                    {parseFloat(rental.late_fee_charged) > 0 && (
                      <div className="text-sm text-rose-400">{t.userDashboard.lateFee} {formatCurrency(rental.late_fee_charged)}</div>
                    )}
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${rental.status === 'RETURNED_SAFE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {rental.status === 'RETURNED_SAFE' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span>{rental.status === 'RETURNED_SAFE' ? t.userDashboard.returnedSafe : t.userDashboard.returnedDamaged}</span>
                  </div>
                </div>
              </div>
            ))}
            {historyRentals.length === 0 && (
              <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl border-dashed">
                {t.userDashboard.noHistory}
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
            <h3 className="text-2xl font-bold text-white mb-2">{t.userDashboard.topupModalTitle}</h3>
            <p className="text-slate-400 text-sm mb-6">{t.userDashboard.topupModalDesc}</p>
            
            <form onSubmit={handleTopup}>
              <div className="relative mb-6">
                <input 
                  type="number" 
                  min="1000" 
                  step="1000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl"
                  placeholder={`100,000 ${t.currency}`}
                  required
                />
                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{t.currency}</span>
              </div>
              <button type="submit" className="glass-button w-full py-3 rounded-xl">
                {t.userDashboard.confirmTopup}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-4xl w-full relative my-8 border border-indigo-500/30 shadow-2xl">
            <button 
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-5 end-5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 p-2 rounded-full transition-colors"
            >
              ✕
            </button>

            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.userDashboard.upgradeModalTitle}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {t.userDashboard.upgradeModalTitle}
              </h3>
              <p className="text-slate-400 text-sm">
                {t.userDashboard.upgradeModalDesc}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800 text-slate-300">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>{t.userDashboard.walletBalance}:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(user?.profile?.wallet_balance || 0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(tiers.length > 0 ? tiers : [
                { id: 10, name: 'Basic', deposit_percent: '100.00', free_days: 3, fee_multiplier: '1.00', price: '0.00' },
                { id: 11, name: 'Gold', deposit_percent: '70.00', free_days: 7, fee_multiplier: '0.80', price: '149000.00' },
                { id: 12, name: 'Platinum', deposit_percent: '50.00', free_days: 10, fee_multiplier: '0.50', price: '299000.00' },
              ]).map((tier) => {
                const isCurrent = (user?.profile?.subscription_tier?.name || '').toUpperCase() === tier.name.toUpperCase();
                const price = parseFloat(tier.price) || 0;
                const depositPercent = parseFloat(tier.deposit_percent) || 100;
                const depositDiscount = 100 - depositPercent;
                const isGold = tier.name.toUpperCase() === 'GOLD';
                const isPlatinum = tier.name.toUpperCase() === 'PLATINUM';
                const isUpgradingThis = upgradingTierId === tier.id;

                return (
                  <div 
                    key={tier.id}
                    className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                      isCurrent
                        ? 'bg-slate-900/90 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : isGold
                        ? 'bg-slate-900/60 border-2 border-amber-500/40 hover:border-amber-400 shadow-xl'
                        : isPlatinum
                        ? 'bg-slate-900/60 border-2 border-fuchsia-500/40 hover:border-fuchsia-400 shadow-xl'
                        : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isGold && !isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider">
                        {t.tiers?.goldBadge || 'محبوب‌ترین'}
                      </span>
                    )}

                    {isPlatinum && !isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider">
                        {t.tiers?.platinumBadge || 'ویژه حرفه‌ای‌ها'}
                      </span>
                    )}

                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        {t.userDashboard.currentPlanBadge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xl font-bold text-white uppercase tracking-wider">{tier.name}</h4>
                        {isPlatinum ? (
                          <Crown className="w-5 h-5 text-fuchsia-400" />
                        ) : isGold ? (
                          <Zap className="w-5 h-5 text-amber-400" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="mb-6">
                        {price === 0 ? (
                          <div className="text-2xl font-black text-white">{t.userDashboard.freePlan}</div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">{formatCurrency(price)}</span>
                            <span className="text-xs text-slate-400">/ {t.userDashboard.monthly}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>
                            {depositDiscount > 0
                              ? `${depositDiscount}% تخفیف ودیعه (${depositPercent}% ودیعه)`
                              : `${depositPercent}% ودیعه امانی`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{tier.free_days} {t.userDashboard.freeRentalDays}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{tier.fee_multiplier}x {t.userDashboard.feeRate}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={isCurrent || isUpgradingThis}
                      onClick={() => handleUpgrade(tier)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : isGold
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer'
                          : isPlatinum
                          ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/20 cursor-pointer'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer'
                      }`}
                    >
                      {isUpgradingThis ? (
                        <span>...</span>
                      ) : isCurrent ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{t.userDashboard.currentPlanBadge}</span>
                        </>
                      ) : (
                        <span>{t.userDashboard.upgradeTo} {tier.name}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>مبلغ اشتراک مستقیماً از موجودی کیف پول شما کسر شده و مزایای طرح بلافاصله فعال می‌گردد.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
