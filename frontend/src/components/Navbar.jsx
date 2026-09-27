import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Wallet, LogOut, User, Gamepad2, LayoutDashboard, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 py-3.5 px-4 sm:px-6 mb-8 flex items-center justify-between">
      <div className="flex items-center gap-6 sm:gap-8">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-xl tracking-tight transition-colors">
          <Gamepad2 className="w-8 h-8" />
          <span>{t.nav.brand}</span>
        </Link>

        {/* Quick Nav Links */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
          <a href="/#catalog-preview" className="hover:text-white transition-colors">{t.nav.browseGames}</a>
          <a href="/#tier-calculator" className="hover:text-white transition-colors">{t.nav.pricingTiers}</a>
          <a href="/#how-it-works" className="hover:text-white transition-colors">{t.nav.howItWorks}</a>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
          title={language === 'fa' ? 'تغییر زبان به انگلیسی' : 'Switch language to Persian'}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'fa' ? 'English' : 'فارسی'}</span>
        </button>

        {user ? (
          <>
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">{t.nav.dashboard}</span>
            </Link>

            <div className="flex items-center gap-3 bg-slate-900/60 rounded-full py-1.5 px-3.5 border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs sm:text-sm">
                <Wallet className="w-3.5 h-3.5" />
                <span>${user.profile?.wallet_balance || '0.00'}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-700"></div>
              <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium">{user.username}</span>
                <span className="uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 text-[10px]">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              title={t.nav.signOut}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1.5">
              {t.nav.signIn}
            </Link>
            <Link to="/register" className="glass-button text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 rounded-full">
              {t.nav.getStarted}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
