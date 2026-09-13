import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await adminAuthService.login(password);
    setIsLoading(false);

    if (res.success) {
      setPassword('');
      onAuthenticated();
    } else {
      setError(res.message || 'Incorrect Admin Password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FCFAF8] rounded-2xl border border-[#E6E1DC] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8781] hover:text-[#1E1D1B] p-1.5 rounded-full hover:bg-[#EFEAE6] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-11 h-11 bg-[#F2ECE6] text-[#8A563D] rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A563D] block">
            CITADEL MANAGEMENT CONSOLE
          </span>
          <h3 className="font-editorial text-2xl font-bold text-[#1E1D1B]">
            Admin Verification
          </h3>
          <p className="text-xs text-[#6B6661] max-w-xs mx-auto">
            Enter the authorized master administrative password to manage on-site live construction milestones.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3C3A36] mb-1.5">
              Master Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-10 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8781] hover:text-[#1E1D1B] p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 font-medium mt-2 animate-in fade-in">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-5 bg-[#8A563D] hover:bg-[#734732] active:scale-[0.99] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Unlock Construction Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C8781] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8A563D]" />
          <span>Restricted to authorized Citadel Site Engineers & Managers</span>
        </div>
      </div>
    </div>
  );
};
