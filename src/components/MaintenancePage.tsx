/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Lock,
  CheckCircle2,
  Sparkles,
  Building2,
} from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';
import { maintenanceService } from '../services/maintenanceService';

interface MaintenancePageProps {
  onUnlockSuccess?: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onUnlockSuccess }) => {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMsg('Please enter the access passkey.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await adminAuthService.login(passwordInput.trim());
      if (res.success) {
        maintenanceService.grantPreviewAccess();
        if (onUnlockSuccess) {
          onUnlockSuccess();
        }
      } else {
        setErrorMsg('Invalid passkey. Access restricted to authorized team members.');
      }
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      'Hello Citadel Landmarks, I am visiting your website during maintenance and would like to enquire about your luxury projects.'
    );
    window.open(`https://wa.me/917030818966?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0F1E36] text-white flex flex-col justify-between selection:bg-[#C5A880] selection:text-[#0F1E36]">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C5A880] blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#1E3A8A] blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/10 px-6 py-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/50 flex items-center justify-center text-[#C5A880] font-serif font-bold text-xl tracking-wider">
            C
          </div>
          <div>
            <span className="block text-sm font-semibold tracking-[0.2em] text-[#C5A880] uppercase">
              Citadel Landmarks
            </span>
            <span className="text-[10px] tracking-widest text-white/50 uppercase">
              Pune Luxury Redevelopment
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setShowPasswordPrompt(true);
            setErrorMsg('');
          }}
          className="text-xs uppercase tracking-widest font-semibold px-4 py-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#C5A880] hover:bg-white/5 transition flex items-center gap-2"
        >
          <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Team Preview Access</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] text-xs font-semibold tracking-wider uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Platform Upgrade & Testing</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight mb-6">
            We Are Upgrading Our Digital Experience.
          </h1>

          <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-xl mx-auto mb-10">
            Citadel Landmarks is currently performing scheduled system updates and final milestone
            verifications. Our flagship developments in Parvati, Walvekar Nagar, and Prabhat Road
            remain actively supported.
          </p>

          {/* Direct Concierge Contact Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
            <button
              onClick={handleWhatsAppClick}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-[#25D366]/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">WhatsApp Concierge</span>
            </button>

            <a
              href="tel:+917030818966"
              className="bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition border border-white/10 text-sm"
            >
              <Phone className="w-4 h-4 text-[#C5A880]" />
              <span>+91 70308 18966</span>
            </a>

            <a
              href="mailto:citadelgroupenquiry@gmail.com"
              className="bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition border border-white/10 text-sm"
            >
              <Mail className="w-4 h-4 text-[#C5A880]" />
              <span>Email Desk</span>
            </a>
          </div>

          {/* Quick Unlock Trigger */}
          {!showPasswordPrompt ? (
            <div className="pt-6 border-t border-white/10 flex flex-col items-center">
              <p className="text-xs text-white/50 mb-3">
                Citadel internal team member or stakeholder?
              </p>
              <button
                onClick={() => setShowPasswordPrompt(true)}
                className="text-xs text-[#C5A880] hover:text-[#e4caa5] underline underline-offset-4 flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Enter Passkey to View Live Site</span>
              </button>
            </div>
          ) : (
            /* Passkey form */
            <div className="pt-6 border-t border-white/10 max-w-md mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#C5A880]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Enter Team Passkey
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPasswordPrompt(false)}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleUnlock} className="space-y-3">
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter passkey (e.g. #site@Admin)"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#C5A880] transition"
                      autoFocus
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-[#C5A880] hover:bg-[#d6b991] text-[#0F1E36] font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isVerifying ? 'Verifying...' : 'Unlock & Preview Site'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-6 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} Citadel Landmarks. All Rights Reserved. Pune, Maharashtra, India.</p>
      </footer>
    </div>
  );
};
