import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Gamepad2,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Coffee,
  Coins,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Award,
  RotateCcw
} from 'lucide-react';

const FALLBACK_GAMES = [
  {
    id: 'sample-1',
    board_game: {
      title: 'Dune: Imperium',
      publisher: 'Dire Wolf',
      retail_price: '2800000',
      category: 'Strategy',
      players: '1-4 Players',
      playtime: '60-120 min',
      rating: '8.4',
    },
    cafe: {
      name: 'The Meeple Lounge',
      city: 'Downtown Hub',
      address: '104 Main St'
    }
  },
  {
    id: 'sample-2',
    board_game: {
      title: 'Wingspan',
      publisher: 'Stonemaier Games',
      retail_price: '2200000',
      category: 'Family',
      players: '1-5 Players',
      playtime: '40-70 min',
      rating: '8.1',
    },
    cafe: {
      name: 'Dice & Brews Cafe',
      city: 'Westside Arts',
      address: '22 Elm Street'
    }
  },
  {
    id: 'sample-3',
    board_game: {
      title: 'Terraforming Mars',
      publisher: 'FryxGames',
      retail_price: '2500000',
      category: 'Sci-Fi',
      players: '1-5 Players',
      playtime: '120 min',
      rating: '8.4',
    },
    cafe: {
      name: 'Corner Pawn Boardgames',
      city: 'North Quarter',
      address: '88 King Ave'
    }
  },
  {
    id: 'sample-4',
    board_game: {
      title: 'Brass: Birmingham',
      publisher: 'Roxley Games',
      retail_price: '3500000',
      category: 'Strategy',
      players: '2-4 Players',
      playtime: '90-120 min',
      rating: '8.6',
    },
    cafe: {
      name: 'The Meeple Lounge',
      city: 'Downtown Hub',
      address: '104 Main St'
    }
  },
  {
    id: 'sample-5',
    board_game: {
      title: 'Azul',
      publisher: 'Next Move Games',
      retail_price: '1400000',
      category: 'Family',
      players: '2-4 Players',
      playtime: '30-45 min',
      rating: '7.8',
    },
    cafe: {
      name: 'Hexagon Cafe & Tavern',
      city: 'South Market',
      address: '12 Harbor Blvd'
    }
  },
  {
    id: 'sample-6',
    board_game: {
      title: 'Root: A Game of Woodland Might',
      publisher: 'Leder Games',
      retail_price: '2600000',
      category: 'Strategy',
      players: '2-4 Players',
      playtime: '60-90 min',
      rating: '8.1',
    },
    cafe: {
      name: 'Dice & Brews Cafe',
      city: 'Westside Arts',
      address: '22 Elm Street'
    }
  }
];

const LandingPage = () => {
  const { user } = useAuth();
  const { t, isRTL, formatCurrency, formatPrice } = useLanguage();
  const navigate = useNavigate();

  // Catalog state
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Interactive Tier Simulator
  const [simGamePrice, setSimGamePrice] = useState(1500000);
  const [simSelectedTier, setSimSelectedTier] = useState('GOLD');

  // FAQ open toggles
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get('/api/inventory/');
        if (res.data && res.data.length > 0) {
          setGames(res.data);
        } else {
          setGames(FALLBACK_GAMES);
        }
      } catch (err) {
        setGames(FALLBACK_GAMES);
      }
    };
    fetchCatalog();
  }, []);

  // Filtered games
  const filteredGames = games.filter((item) => {
    const titleMatch = item.board_game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const publisherMatch = item.board_game.publisher?.toLowerCase().includes(searchQuery.toLowerCase());
    const cafeMatch = item.cafe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || publisherMatch || cafeMatch;

    if (selectedCategory === 'ALL') return matchesSearch;
    const cat = item.board_game.category || '';
    return matchesSearch && cat.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Simulator computations
  const tierConfig = {
    BASIC: {
      name: t.tiers.basicName,
      depositRate: 1.0,
      freeDays: 3,
      feeMultiplier: 1.0,
      badge: t.tiers.basicBadge
    },
    GOLD: {
      name: t.tiers.goldName,
      depositRate: 0.7,
      freeDays: 7,
      feeMultiplier: 0.8,
      badge: t.tiers.goldBadge
    },
    PLATINUM: {
      name: t.tiers.platinumName,
      depositRate: 0.5,
      freeDays: 10,
      feeMultiplier: 0.5,
      badge: t.tiers.platinumBadge
    },
  };

  const currentTier = tierConfig[simSelectedTier];
  const requiredDeposit = Math.round(simGamePrice * currentTier.depositRate);
  const baseRentalFee = Math.round(simGamePrice * 0.10 * currentTier.feeMultiplier);
  const savingsAmount = Math.round(simGamePrice * (1.0 - currentTier.depositRate));

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
  ];

  const ActionArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-24">
      {/* Logged in Quick Nav Banner */}
      {user && (
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-300">
                {t.welcomeBanner.welcome} <span className="font-semibold text-white">{user.username}</span>!{' '}
                {t.welcomeBanner.walletBalance}{' '}
                <span className="text-emerald-400 font-bold">{formatCurrency(user.profile?.wallet_balance || 0)}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="glass-button px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <span>{t.welcomeBanner.goToDashboard}</span>
            <ActionArrow className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {t.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.25]">
            {t.hero.titleStart}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              {t.hero.titleHighlight}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#catalog-preview"
              className="glass-button px-8 py-3.5 rounded-xl font-semibold text-base shadow-indigo-500/25 flex items-center gap-2 group"
            >
              <span>{t.hero.browseBtn}</span>
              <ActionArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#tier-calculator"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium text-base transition-colors flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>{t.hero.calcBtn}</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="glass-panel p-4 rounded-xl border-slate-700/40">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">{t.hero.stats.depositReduction}</span>
              </div>
              <div className="text-2xl font-bold text-white">{t.hero.stats.depositReductionValue}</div>
              <div className="text-xs text-slate-400">{t.hero.stats.depositReductionDesc}</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-slate-700/40">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">{t.hero.stats.freeDays}</span>
              </div>
              <div className="text-2xl font-bold text-white">{t.hero.stats.freeDaysValue}</div>
              <div className="text-xs text-slate-400">{t.hero.stats.freeDaysDesc}</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-slate-700/40">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Coffee className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">{t.hero.stats.partnerCafes}</span>
              </div>
              <div className="text-2xl font-bold text-white">{t.hero.stats.partnerCafesValue}</div>
              <div className="text-xs text-slate-400">{t.hero.stats.partnerCafesDesc}</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border-slate-700/40">
              <div className="flex items-center gap-2 text-fuchsia-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">{t.hero.stats.safeEscrow}</span>
              </div>
              <div className="text-2xl font-bold text-white">{t.hero.stats.safeEscrowValue}</div>
              <div className="text-xs text-slate-400">{t.hero.stats.safeEscrowDesc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{t.howItWorks.badge}</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{t.howItWorks.title}</h3>
          <p className="text-slate-400 text-sm sm:text-base">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl relative flex flex-col justify-between group hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-500/30">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t.howItWorks.step1Title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-indigo-300 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {t.howItWorks.step1Badge}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative flex flex-col justify-between group hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 border border-emerald-500/30">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t.howItWorks.step2Title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-emerald-300 font-medium flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5" /> {t.howItWorks.step2Badge}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative flex flex-col justify-between group hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-4 border border-purple-500/30">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t.howItWorks.step3Title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-purple-300 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {t.howItWorks.step3Badge}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative flex flex-col justify-between group hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg mb-4 border border-pink-500/30">
                4
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t.howItWorks.step4Title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.howItWorks.step4Desc}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-pink-300 font-medium flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> {t.howItWorks.step4Badge}
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE TIER & SAVINGS CALCULATOR */}
      <section id="tier-calculator" className="glass-panel p-8 sm:p-10 rounded-3xl border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                <Coins className="w-4 h-4" /> {t.calculator.badge}
              </span>
              <h3 className="text-3xl font-extrabold text-white">{t.calculator.title}</h3>
              <p className="text-slate-400 text-sm mt-2">
                {t.calculator.subtitle}
              </p>
            </div>

            {/* Price Slider */}
            <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <label className="text-slate-300 font-medium">{t.calculator.retailPriceLabel}</label>
                <span className="text-lg font-bold text-indigo-400">{formatCurrency(simGamePrice)}</span>
              </div>
              <input
                type="range"
                min="500000"
                max="4000000"
                step="50000"
                value={simGamePrice}
                onChange={(e) => setSimGamePrice(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>{formatPrice(500000)}</span>
                <span>{formatPrice(2000000)}</span>
                <span>{formatCurrency(4000000)}</span>
              </div>
            </div>

            {/* Tier Select Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                {t.calculator.selectTierLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BASIC', 'GOLD', 'PLATINUM']).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSimSelectedTier(tier)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      simSelectedTier === tier
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {tierConfig[tier].name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculator Output Display Card */}
          <div className="lg:col-span-7 bg-slate-950/70 rounded-2xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl relative space-y-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-400">{currentTier.badge}</span>
                <h4 className="text-2xl font-black text-white">{currentTier.name}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">{t.calculator.depositRequirement}</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {(currentTier.depositRate * 100).toFixed(0)}% {t.calculator.msrpOf}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">{t.calculator.escrowHold}</span>
                <span className="text-2xl font-extrabold text-white">{formatCurrency(requiredDeposit)}</span>
                <span className="text-xs text-emerald-400 block mt-1">
                  {simSelectedTier !== 'BASIC' ? `${t.calculator.saveInWallet}: ${formatCurrency(savingsAmount)}` : t.calculator.fullHold}
                </span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">{t.calculator.freeDaysIncluded}</span>
                <span className="text-2xl font-extrabold text-indigo-400">{currentTier.freeDays} {t.catalog.players === 'نفر' ? 'روز' : 'Days'}</span>
                <span className="text-xs text-slate-400 block mt-1">{t.calculator.noDailyFee}</span>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">{t.calculator.baseRentalFee}</span>
                <span className="text-2xl font-extrabold text-fuchsia-400">{formatCurrency(baseRentalFee)}</span>
                <span className="text-xs text-slate-400 block mt-1">{currentTier.feeMultiplier}x {t.calculator.feeMultiplier}</span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t.calculator.safeNote}</span>
              </div>
              <Link
                to={user ? '/dashboard' : '/register'}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 whitespace-nowrap"
              >
                <span>{t.calculator.joinWith} {currentTier.name}</span>
                <ActionArrow className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG PREVIEW SECTION */}
      <section id="catalog-preview" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{t.catalog.badge}</h2>
            <h3 className="text-3xl font-extrabold text-white">{t.catalog.title}</h3>
            <p className="text-slate-400 text-sm">
              {t.catalog.subtitle}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t.catalog.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-9 pr-4 py-2 rounded-xl text-sm w-full sm:w-60"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Strategy', 'Family', 'Sci-Fi'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.catalog.categories[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((item) => {
            const retail = parseFloat(item.board_game.retail_price) || 1500000;
            const goldDeposit = Math.round(retail * 0.7);

            return (
              <div
                key={item.id}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between group hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="h-44 bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl p-4 mb-4 flex flex-col justify-between border border-slate-800 relative overflow-hidden group-hover:border-indigo-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-900/80 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700">
                        {t.catalog.categories[item.board_game.category] || item.board_game.category || 'Board Game'}
                      </span>
                      <span className="text-xs font-bold text-amber-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                        ★ {item.board_game.rating || '8.2'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center my-auto">
                      <Gamepad2 className="w-16 h-16 text-indigo-400/40 group-hover:text-indigo-400 transition-colors group-hover:scale-110 duration-300" />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>{item.board_game.players || `2-4 ${t.catalog.players}`}</span>
                      <span>{item.board_game.playtime || `60 ${t.catalog.minutes}`}</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {item.board_game.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">{item.board_game.publisher}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-4 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/80">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">
                      {item.cafe.name} • <span className="text-slate-400">{item.cafe.city}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">{t.catalog.depositFrom}</div>
                    <div className="text-base font-bold text-emerald-400">{formatCurrency(goldDeposit)}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (user) {
                        navigate('/dashboard');
                      } else {
                        navigate('/register');
                      }
                    }}
                    className="glass-button px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>{user ? t.catalog.rentNow : t.catalog.signUpToRent}</span>
                    <ActionArrow className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="glass-panel text-center py-12 rounded-2xl text-slate-400">
            {t.catalog.noResults}
          </div>
        )}
      </section>

      {/* THREE PILLARS (PLAYERS, CAFES, COLLECTORS) */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{t.pillars.badge}</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{t.pillars.title}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 rounded-2xl space-y-4 border-slate-700/50 hover:border-indigo-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">{t.pillars.playerTitle}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.pillars.playerDesc}
            </p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.playerB1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.playerB2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.playerB3}</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4 border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Coffee className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">{t.pillars.cafeTitle}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.pillars.cafeDesc}
            </p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.cafeB1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.cafeB2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.cafeB3}</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4 border-slate-700/50 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">{t.pillars.collectorTitle}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.pillars.collectorDesc}
            </p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.collectorB1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.collectorB2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{t.pillars.collectorB3}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION TIERS MATRIX */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{t.tiers.badge}</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{t.tiers.title}</h3>
          <p className="text-slate-400 text-sm">
            {t.tiers.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Basic */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-slate-700">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.tiers.basicBadge}</span>
              <h4 className="text-2xl font-black text-white mt-1">{t.tiers.basicName}</h4>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-white">{t.tiers.basicPrice}</span>
                <span className="text-xs text-slate-400">{t.tiers.basicPeriod}</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                {t.tiers.basicDesc}
              </p>

              <div className="space-y-3 border-t border-slate-800 pt-6 text-sm">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.basicB1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.basicB2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.basicB3}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.basicB4}</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="mt-8 block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
            >
              {t.tiers.basicBtn}
            </Link>
          </div>

          {/* Gold */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-indigo-500/60 relative shadow-2xl shadow-indigo-500/10 scale-105 z-10 bg-slate-800/80">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
              {t.tiers.goldBadge}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{t.tiers.goldBadge}</span>
              <h4 className="text-2xl font-black text-white mt-1">{t.tiers.goldName}</h4>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-white">{t.tiers.goldPrice}</span>
                <span className="text-xs text-slate-400">{t.tiers.goldPeriod}</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                {t.tiers.goldDesc}
              </p>

              <div className="space-y-3 border-t border-slate-800 pt-6 text-sm">
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.goldB1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.goldB2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-white font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.goldB3}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.goldB4}</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="mt-8 block text-center py-3 rounded-xl glass-button font-bold text-sm"
            >
              {t.tiers.goldBtn}
            </Link>
          </div>

          {/* Platinum */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-slate-700">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">{t.tiers.platinumBadge}</span>
              <h4 className="text-2xl font-black text-white mt-1">{t.tiers.platinumName}</h4>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-white">{t.tiers.platinumPrice}</span>
                <span className="text-xs text-slate-400">{t.tiers.platinumPeriod}</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                {t.tiers.platinumDesc}
              </p>

              <div className="space-y-3 border-t border-slate-800 pt-6 text-sm">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.platinumB1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.platinumB2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.platinumB3}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{t.tiers.platinumB4}</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="mt-8 block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
            >
              {t.tiers.platinumBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{t.faq.badge}</h2>
          <h3 className="text-3xl font-extrabold text-white">{t.faq.title}</h3>
          <p className="text-slate-400 text-sm">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="glass-panel rounded-2xl border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-start flex justify-between items-center gap-4 text-white font-semibold hover:text-indigo-300 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION BOTTOM BANNER */}
      <section className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.cta.title}
        </h3>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          {t.cta.subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="glass-button px-8 py-3.5 rounded-xl font-bold text-base shadow-xl flex items-center gap-2"
          >
            <span>{t.cta.createAccount}</span>
            <ActionArrow className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base transition-colors"
          >
            {t.cta.cafeLogin}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 pt-8 pb-12 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
          <Gamepad2 className="w-5 h-5" />
          <span>{t.nav.brand}</span>
          <span className="text-xs text-slate-400 font-normal">{t.footer.rights}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="hover:text-slate-200 transition-colors">{t.footer.howItWorks}</a>
          <a href="#tier-calculator" className="hover:text-slate-200 transition-colors">{t.footer.tiers}</a>
          <a href="#catalog-preview" className="hover:text-slate-200 transition-colors">{t.footer.catalog}</a>
          <Link to="/login" className="hover:text-slate-200 transition-colors">{t.footer.signIn}</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
