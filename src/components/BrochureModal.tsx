import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle, Mail, Phone, User, MessageSquare, Eye, MessageCircle } from 'lucide-react';
import { Project } from '../types';
import { sheetsWebhookService } from '../services/sheetsWebhookService';
import { CITADEL_WHATSAPP_CONFIG } from '../utils/whatsapp';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  mode?: 'brochure' | 'floorplans';
  onUnlock?: () => void;
}

export const BrochureModal: React.FC<BrochureModalProps> = ({
  isOpen,
  onClose,
  project,
  mode = 'brochure',
  onUnlock,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDownloading(true);

    if (onUnlock) {
      onUnlock();
    }

    // Submit lead to Google Sheets Webhook
    await sheetsWebhookService.submitLead({
      formType: mode === 'floorplans' ? 'Architectural Plans Unlock' : 'Brochure Download',
      name: `${firstName} ${lastName}`.trim(),
      phone: phone,
      email: email,
      projectOrRole: project.title,
      details: `Project Location: ${project.location} | Category: ${project.category} (${project.status})`,
      message: message || (mode === 'floorplans' ? 'Requested floor plans and layout access' : 'Downloaded project architectural elevation and brochure'),
      notificationEmail: CITADEL_WHATSAPP_CONFIG.notificationEmail,
      whatsappNumber: CITADEL_WHATSAPP_CONFIG.rawNumber,
    });

    // Trigger instant client-side download of the official architectural elevation image
    try {
      const elevationUrl = project.heroImage || project.gallery[0];
      const resp = await fetch(elevationUrl);
      if (resp.ok) {
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const ext = elevationUrl.toLowerCase().includes('.png') ? 'png' : 'jpeg';
        link.download = `${project.slug}-elevation.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        const link = document.createElement('a');
        link.href = elevationUrl;
        link.download = `${project.slug}-elevation.jpeg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      const link = document.createElement('a');
      link.href = project.heroImage || project.gallery[0];
      link.download = `${project.slug}-elevation.jpeg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => {
      setIsDownloading(false);
      setDownloaded(true);
    }, 600);
  };

  const handleReset = () => {
    setDownloaded(false);
    onClose();
  };

  return (
    <div
      id="brochure-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReset();
      }}
    >
      <div className="bg-[#FAF8F5] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E6E1DC] relative max-h-[90vh] overflow-y-auto">
        <button
          id="close-brochure-modal-btn"
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6E6A65] hover:text-[#1E1D1B] hover:bg-[#EDE7E1] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {downloaded ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-[#E8C2AF]/30 text-[#A05C3B] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#A05C3B]" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#1E1D1B]">
              {mode === 'floorplans' ? 'Floor Plans Unlocked!' : 'Elevation Image & Dossier Downloaded!'}
            </h3>
            <p className="text-xs text-[#5C5752] leading-relaxed">
              Thank you, <strong className="text-[#1E1D1B]">{firstName}</strong>! The official architectural elevation render for <strong>{project.title}</strong> has been downloaded to your device, and floor plans are now unlocked.
            </p>
            <div className="bg-[#EFE9E2] p-4 rounded-xl text-left text-xs space-y-2 border border-[#E2DBD3]">
              <div className="flex items-center gap-2 text-[#1E1D1B] font-semibold">
                <FileText className="w-4 h-4 text-[#A05C3B]" />
                <span>{project.title} - Architectural Elevation & Plans</span>
              </div>
              <p className="text-[11px] text-[#6B6661]">
                All floor plans, unit measurements, and layout views are now unblurred for your active viewing session.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DDD6CE] text-left text-[11px] text-[#5C5752] space-y-1">
              <div><strong>Status:</strong> Logged in Google Sheets &amp; Database</div>
              <div><strong>Email Dispatch:</strong> {CITADEL_WHATSAPP_CONFIG.notificationEmail}</div>
              <div><strong>Advisory Desk WhatsApp:</strong> {CITADEL_WHATSAPP_CONFIG.displayNumber}</div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={sheetsWebhookService.getWhatsAppUrlForLead({
                  formType: mode === 'floorplans' ? 'Architectural Plans Unlock' : 'Brochure Download',
                  name: `${firstName} ${lastName}`.trim(),
                  phone: phone,
                  email: email,
                  projectOrRole: project.title,
                  details: `Project Location: ${project.location} | Category: ${project.category} (${project.status})`,
                  message: message || (mode === 'floorplans' ? 'Requested floor plans and layout access' : 'Downloaded project dossier'),
                  whatsappNumber: CITADEL_WHATSAPP_CONFIG.rawNumber,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full transition-colors cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send Copy on WhatsApp ({CITADEL_WHATSAPP_CONFIG.displayNumber})</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1E1D1B] hover:bg-[#33312E] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Continue Exploring Floor Plans</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8C2AF]/40 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-5 h-5 text-[#8A563D]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A563D] block">
                  {mode === 'floorplans' ? 'UNLOCK ARCHITECTURAL PLANS' : 'OFFICIAL PROJECT DOSSIER'}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#1E1D1B]">
                  {project.title}
                </h3>
                <p className="text-[11px] text-[#6B6661]">
                  Fill details once to instantly view full-resolution floor plans and download the official project brochure.
                </p>
              </div>
            </div>

            <form onSubmit={handleDownload} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C8781] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C8781] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8781] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                  Phone Number (For WhatsApp Copy) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C8781] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 87799 75270"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                  Message / Preference (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-[#8C8781] absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Interested in 3 BHK Grande / schedule site visit..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="download-brochure-submit-btn"
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider py-3.5 rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isDownloading ? (
                    <span>PROCESSING & UNLOCKING...</span>
                  ) : (
                    <>
                      {mode === 'floorplans' ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>UNLOCK FLOOR PLANS & DOSSIER</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>DOWNLOAD BROCHURE & UNLOCK PLANS</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-[#8C8781]">
                Complete confidentiality & zero spam guaranteed.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
