import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { loginAdmin } from '../services/authService';

const LOGO_URL = "https://res.cloudinary.com/dwgwwlbrg/image/upload/v1784386120/PHOTO-2026-07-16-15-43-03_y1kevv.jpg";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@ukchef.com');
  const [password, setPassword] = useState('ukchef123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const { session, error } = await loginAdmin(email, password);

      if (error) {
        if (error.includes('Invalid login credentials')) {
          setErrorMsg('Invalid email or password! Please check your admin credentials.');
        } else if (error.includes('Email not confirmed')) {
          setErrorMsg('Email address not confirmed. Please check your inbox or try signing in.');
        } else {
          setErrorMsg(error);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(session, rememberMe);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Abstract Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-modal overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl relative z-10">
        
        {/* Left Side: Branding Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-900 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <img src={LOGO_URL} alt="UK Chef Watermark" className="w-96 h-96 object-cover rounded-full" />
          </div>

          <div>
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <img src={LOGO_URL} alt="UK Chef Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-white">UK CHEF</h2>
                <span className="text-[10px] font-bold text-brand-200 tracking-wider uppercase">Invoice System</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Protected Admin Portal
            </h1>
            <p className="text-sm text-brand-100 leading-relaxed font-medium">
              Authorized admin access for managing wholesale food invoices and inventory.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-brand-100 font-medium">
            <span className="font-bold text-white block mb-1">🔐 Admin Credentials:</span>
            <p>Email: <strong className="text-white font-mono">admin@ukchef.com</strong></p>
            <p>Password: <strong className="text-white font-mono">ukchef123</strong></p>
          </div>

          <div className="mt-6 text-[11px] text-brand-200/80 font-medium">
            © 2026 UK Chef. All rights reserved.
          </div>
        </div>

        {/* Right Side: Admin Sign In Form */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-slate-900 text-white">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950 text-brand-400 text-xs font-semibold mb-3 border border-brand-800/60">
                <Sparkles className="w-3.5 h-3.5" /> Supabase Authentication
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Sign In to Dashboard</h2>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Enter your administrative credentials to continue.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Authentication Failed</p>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ukchef.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Keep me signed in</span>
                </label>

                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="font-bold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Protected Supabase Authentication</span>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal Prompt */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-950 text-brand-400 flex items-center justify-center mx-auto border border-brand-800">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Login Credentials</h3>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-800 p-3 rounded-xl border border-slate-700 font-mono">
              <p>Email: <strong>admin@ukchef.com</strong></p>
              <p>Password: <strong>ukchef123</strong></p>
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
