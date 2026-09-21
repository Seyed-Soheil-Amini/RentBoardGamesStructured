import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User, Gamepad2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 py-4 px-6 mb-8 flex items-center justify-between">
      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl tracking-tight">
        <Gamepad2 className="w-8 h-8" />
        <Link to="/">BoardGameX</Link>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <div className="flex items-center gap-4 bg-slate-900/60 rounded-full py-2 px-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Wallet className="w-4 h-4" />
                <span>${user.profile?.wallet_balance || '0.00'}</span>
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <User className="w-4 h-4" />
                <span>{user.username}</span>
                <span className="text-xs uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="glass-button px-5 py-2 rounded-full">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
