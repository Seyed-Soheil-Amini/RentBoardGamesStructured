import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Gamepad2, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(t.auth.invalidCredentials);
    }
  };

  const ActionArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-panel p-8 sm:p-10 rounded-2xl w-full max-w-md relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-500/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-900/50 rounded-full border border-slate-700/50 shadow-inner">
              <Gamepad2 className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">{t.auth.loginTitle}</h2>
          <p className="text-slate-400 text-center mb-8">{t.auth.loginSubtitle}</p>
          
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t.auth.username}</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                placeholder={t.auth.usernamePlaceholder}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t.auth.password}</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                placeholder={t.auth.passwordPlaceholder}
                required
              />
            </div>
            
            <button type="submit" className="glass-button w-full py-3 rounded-xl flex items-center justify-center gap-2 mt-4 group">
              <span>{t.auth.signInBtn}</span>
              <ActionArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-400">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium ml-1">
              {t.auth.createOne}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
