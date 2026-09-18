import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ArrowRight, Phone, Mail, User } from 'lucide-react';
import { projectsData } from '../data/projectsData';
import { sheetsWebhookService } from '../services/sheetsWebhookService';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const getInitialProjectId = (id?: string) => {
    if (!id) return '';
    const exists = projectsData.some(
      (p) => p.id === id && (p.status === 'Ongoing' || p.status === 'Upcoming')
    );
    return exists ? id : '';
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    lookingFor: 'Self (Customer)',
    projectId: getInitialProjectId(defaultProjectId),
    unitType: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        lookingFor: 'Self (Customer)',
        projectId: getInitialProjectId(defaultProjectId),
        unitType: '',
        message: '',
      });
      setSubmitted(false);
    }
  }, [defaultProjectId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const matched = projectsData.find((p) => p.id === formData.projectId);
    const projectOrRole = matched ? matched.title : (formData.projectId || 'All Citadel Projects');
    const details = `Looking For: ${formData.lookingFor}${formData.unitType ? ` | Unit: ${formData.unitType}` : ''}`;

    await sheetsWebhookService.submitLead({
      formType: 'Get a Quote / Project Consultation',
      name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      projectOrRole,
      details,
      message: formData.message || '',
    });

    setLoading(false);
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  const matchedProject = projectsData.find((p) => p.id === formData.projectId);

  return (
    <div
      id="enquiry-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="bg-[#FAF8F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E6E1DC] relative max-h-[92vh] overflow-y-auto">
        <button
          id="close-enquiry-modal-btn"
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6E6A65] hover:text-[#1E1D1B] hover:bg-[#EDE7E1] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#E8C2AF]/30 text-[#A05C3B] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-[#A05C3B]" />
            </div>
            <h3 className="font-editorial text-3xl font-bold text-[#1E1D1B]">
              Thank You, {formData.fullName.split(' ')[0] || 'Sir/Madam'}!
            </h3>
            <p className="text-sm text-[#5C5752] max-w-sm mx-auto leading-relaxed">
              Your quote request as <strong className="text-[#1E1D1B]">{formData.lookingFor}</strong> {matchedProject ? (
                <>for <strong className="text-[#1E1D1B]">{matchedProject.title}</strong></>
              ) : (
                <>for <strong className="text-[#1E1D1B]">Citadel Group Projects</strong></>
              )} has been received. Our relationship team will connect with you shortly via{' '}
              <span className="font-medium text-[#1E1D1B]">{formData.phone}</span>.
            </p>
            <div className="bg-[#EFE9E2] rounded-xl p-4 text-xs text-[#5C5752] text-left space-y-1">
              <div><strong>Reference ID:</strong> CTD-{Math.floor(100000 + Math.random() * 900000)}</div>
              <div><strong>Direct Desk:</strong> enquiry@thecitadelgroup.co</div>
              <div><strong>Office:</strong> Swapnapurti Apts, Prabhat Road Lane 8, Erandwane, Pune</div>
            </div>
            <div className="pt-3">
              <button
                id="finish-enquiry-btn"
                onClick={resetAndClose}
                className="w-full bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider py-3 rounded-full transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A563D] block mb-1">
                CITADEL GROUP • GET A QUOTE
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1D1B]">
                Get a Quote & Project Consultation
              </h3>
              <p className="text-xs text-[#6B6661] mt-1">
                Connect directly with our advisory desk for price quotes, unit availability, floor plans, and technical specifications.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C8781] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Deshmukh"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-sm text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                    Looking For *
                  </label>
                  <select
                    id="enquiry-looking-for-select"
                    required
                    value={formData.lookingFor}
                    onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-sm text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                  >
                    <option value="Self (Customer)">Self (Customer)</option>
                    <option value="Agent">Agent</option>
                    <option value="Channel Partner">Channel Partner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C8781] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 87799 75270"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-sm text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden transition-colors"
                    />
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-sm text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                    Interested Project
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-sm text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                  >
                    <option value="">Select Project (Optional)</option>
                    <optgroup label="Ongoing Projects">
                      {projectsData
                        .filter((p) => p.status === 'Ongoing')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.location})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Upcoming Projects">
                      {projectsData
                        .filter((p) => p.status === 'Upcoming')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.location})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                    Configuration
                  </label>
                  <select
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD6CE] rounded-lg text-sm text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                  >
                    <option value="">Select Configuration (Optional)</option>
                    <option value="2 BHK Residence">2 BHK Residence</option>
                    <option value="3 BHK Residence">3 BHK Residence</option>
                    <option value="4 BHK Penthouse">4 BHK Penthouse</option>
                    <option value="5 BHK Sky Mansion">5 BHK Sky Mansion</option>
                    <option value="Commercial Office Space">Commercial Office Space</option>
                    <option value="Society Redevelopment Proposal">Society Redevelopment Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                  Specific Requirements or Questions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Ask about pricing quote, floor availability, payment plans, brochure..."
                  className="w-full px-3 py-2 bg-white border border-[#DDD6CE] rounded-lg text-sm text-[#1E1D1B] focus:border-[#A05C3B] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                id="submit-enquiry-form-btn"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider py-3 rounded-full shadow-xs transition-colors cursor-pointer mt-2 disabled:opacity-70"
              >
                {loading ? (
                  <span>SUBMITTING QUOTE REQUEST...</span>
                ) : (
                  <>
                    <span>GET A QUOTE / SUBMIT INQUIRY</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
