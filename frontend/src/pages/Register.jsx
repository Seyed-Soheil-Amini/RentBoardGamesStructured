import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, ArrowRight, Store, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'RENTER'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Registration failed. Username might be taken.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10">
      <div className="glass-panel p-8 sm:p-10 rounded-2xl w-full max-w-lg relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-slate-900/50 rounded-full border border-slate-700/50 shadow-inner">
              <Gamepad2 className="w-8 h-8 text-fuchsia-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">Join the Network</h2>
          <p className="text-slate-400 text-center mb-8">Choose your path and start sharing.</p>
          
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                onClick={() => handleRoleSelect('RENTER')}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 ${formData.role === 'RENTER' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <User className="w-6 h-6" />
                <span className="font-medium">Renter</span>
              </div>
              <div 
                onClick={() => handleRoleSelect('CAFE_PARTNER')}
                className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 ${formData.role === 'CAFE_PARTNER' ? 'bg-fuchsia-600/20 border-fuchsia-500 text-white' : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                <Store className="w-6 h-6" />
                <span className="font-medium">Cafe Partner</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                placeholder="Choose a username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                placeholder="Create a strong password"
                required
              />
            </div>
            
            <button type="submit" className="glass-button w-full py-3 rounded-xl flex items-center justify-center gap-2 mt-6 group">
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-400">
            Already a member? <Link to="/login" className="text-fuchsia-400 hover:text-fuchsia-300 font-medium ml-1">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
