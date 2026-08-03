import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F6F7] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      
      {/* Soft Ambient Corner Background Gradients */}
      <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-[#6D1F3B]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-[#7A2848]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#A64D79]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-5xl bg-white rounded-[28px] shadow-[0_20px_50px_rgba(109,31,59,0.08)] border border-[rgba(109,31,59,0.10)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Sophisticated Burgundy Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#4B1028] via-[#7A2848] to-[#6D1F3B] p-8 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Muted Abstract Watermark Illustration */}
          <div className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none">
            <img src={LOGO_URL} alt="UK Chef Watermark" className="w-[30rem] h-[30rem] object-cover rounded-full" />
          </div>
          
          {/* Geometric Accent Line */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Logo in Frosted Circular Container */}
            <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-12 shadow-lg">
              <div className="w-11 h-11 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <img src={LOGO_URL} alt="UK Chef Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <h2 className="font-extrabold text-base tracking-tight text-white leading-none">UK CHEF</h2>
                <span className="text-[10px] font-bold text-rose-200/90 tracking-widest uppercase mt-0.5 block">London Foods</span>
              </div>
            </div>

            {/* Headline & Description */}
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Enterprise Operations & Invoicing
            </h1>
            <p className="text-sm text-rose-100/85 leading-relaxed font-normal max-w-sm">
              Secure, authorized access for managing wholesale food invoices, commercial ledgers, and inventory distribution.
            </p>
          </div>

          {/* Left Panel Footer */}
          <div className="relative z-10 mt-12 text-[11px] text-rose-200/70 font-medium">
            © 2026 UK Chef London Foods Ltd. All rights reserved.
          </div>
        </div>

        {/* Right Side: Clean White Login Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white text-[#1F2937]">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="mb-8">
              <span className="text-xs font-bold text-[#6D1F3B] uppercase tracking-widest mb-1.5 block">
                Enterprise Admin Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
                Sign In to Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] font-medium mt-1">
                Enter your admin credentials to access your system.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-[16px] bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-medium flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900">Authentication Failed</p>
                  <p className="mt-0.5 text-rose-700">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6D1F3B]/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ukchef.com"
                    className="w-full h-[56px] pl-11 pr-4 bg-[#F8F6F7] border border-transparent rounded-[16px] text-sm text-[#1F2937] placeholder-[#9CA3AF] font-medium focus:bg-white focus:border-[#6D1F3B] focus:ring-4 focus:ring-[#6D1F3B]/15 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6D1F3B]/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[56px] pl-11 pr-12 bg-[#F8F6F7] border border-transparent rounded-[16px] text-sm text-[#1F2937] placeholder-[#9CA3AF] font-medium focus:bg-white focus:border-[#6D1F3B] focus:ring-4 focus:ring-[#6D1F3B]/15 focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#6B7280] hover:text-[#1F2937]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#6D1F3B] text-[#6D1F3B] focus:ring-[#6D1F3B]/20"
                  />
                  <span>Keep me signed in</span>
                </label>

                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="font-bold text-[#6D1F3B] hover:text-[#4B1028] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Burgundy Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[56px] rounded-[16px] bg-[#6D1F3B] hover:bg-[#7A2848] text-white font-semibold text-sm sm:text-base tracking-wide shadow-md shadow-[#6D1F3B]/20 flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-70 mt-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Bottom Security Badge */}
            <div className="mt-8 pt-6 border-t border-[rgba(109,31,59,0.10)] flex items-center justify-between text-[11px] text-[#6B7280]">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                Protected Supabase SSL 256-bit Encryption
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal Prompt */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[rgba(109,31,59,0.15)] rounded-[24px] p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#F8F6F7] text-[#6D1F3B] flex items-center justify-center mx-auto border border-[#6D1F3B]/10">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1F2937]">System Access Credentials</h3>
            <p className="text-xs text-[#6B7280] font-medium">
              Authorized admin account details for UKCHEF London Foods:
            </p>
            <div className="text-xs text-[#1F2937] space-y-1 bg-[#F8F6F7] p-3 rounded-[14px] border border-[rgba(109,31,59,0.10)] font-mono text-left">
              <p>Email: <strong className="text-[#6D1F3B]">admin@ukchef.com</strong></p>
              <p>Password: <strong className="text-[#6D1F3B]">ukchef123</strong></p>
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full h-[46px] rounded-[14px] bg-[#6D1F3B] hover:bg-[#7A2848] text-white font-bold text-xs transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
