import React, { useState } from 'react';
import { Page } from '../types';
import { Briefcase, Send, CheckCircle2, Mail, MapPin } from 'lucide-react';

interface CareersPageProps {
  setCurrentPage?: (page: Page) => void;
  onOpenEnquiry?: () => void;
}

export const CareersPage: React.FC<CareersPageProps> = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Civil Site Engineer',
    experience: '1-3 Years',
    portfolioUrl: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Civil Site Engineer',
      experience: '1-3 Years',
      portfolioUrl: '',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <div className="pt-20 pb-20 bg-[#F8F6F3]">
      {/* 1. STARTING HERO IMAGE */}
      <section className="relative h-[320px] sm:h-[400px] w-full overflow-hidden bg-[#1E1D1B]">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=80"
          alt="Careers at Citadel Group"
          className="w-full h-full object-cover object-center opacity-40 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1D1B] via-[#1E1D1B]/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 w-full">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block mb-2">
              JOIN OUR TEAM
            </span>
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Careers at Citadel Group
            </h1>
            <p className="text-sm sm:text-base text-[#D4CFC9] mt-2 max-w-2xl font-light">
              Building lasting landmarks in Pune through engineering precision, transparent ethics, and collaborative talent.
            </p>
          </div>
        </div>
      </section>

      {/* 2. INTRODUCTORY TEXT & CULTURE */}
      <section className="py-12 sm:py-16 border-b border-[#E6E1DC] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A563D] block">
            WORK WITH US
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#1E1D1B]">
            Craft Exceptional Spaces with Passion
          </h2>
          <p className="text-sm sm:text-base text-[#5C5752] leading-relaxed max-w-3xl mx-auto">
            At Citadel Group, every project is a synthesis of architectural vision and uncompromising structural integrity. 
            We are always on the lookout for motivated civil engineers, site supervisors, architects, project managers, and sales specialists who take pride in meticulous craftsmanship and on-time project execution.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#7A7570]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8A563D]" />
              <span>Pune, Maharashtra</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#8A563D]" />
              <span>Full-time & On-Site Roles</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8A563D]" />
              <a href="mailto:careers@thecitadelgroup.co" className="hover:text-[#8A563D] underline">
                careers@thecitadelgroup.co
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. APPLICATION FORM */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E6E1DC] shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-[#F0FDF4] border-2 border-[#86EFAC] text-[#16A34A] rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1D1B]">
                    Application Submitted
                  </h3>
                  <p className="text-sm text-[#5C5752] leading-relaxed">
                    Thank you for your interest in joining Citadel Group! We have received your application details. 
                    Our talent acquisition team will review your profile and reach out if your qualifications align with our current openings.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-[#8A563D] text-white text-xs font-semibold rounded-full hover:bg-[#734732] transition-colors"
                  >
                    Submit Another Application
                  </button>
                  {setCurrentPage && (
                    <button
                      onClick={() => {
                        setCurrentPage('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-2.5 bg-[#FAF8F5] text-[#3C3A36] text-xs font-semibold rounded-full border border-[#DDD6CE] hover:bg-[#F0EBE5] transition-colors"
                    >
                      Back to Home
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-8 border-b border-[#F0EBE6] pb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A563D] block mb-1">
                    APPLY NOW
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1D1B]">
                    Submit Your Application
                  </h3>
                  <p className="text-xs text-[#6E6A65] mt-1">
                    Fill in your details below. You can also directly email your CV to{' '}
                    <a href="mailto:careers@thecitadelgroup.co" className="text-[#8A563D] font-medium underline">
                      careers@thecitadelgroup.co
                    </a>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Patil"
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rahul.patil@example.com"
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                        Role / Department of Interest *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                      >
                        <option value="Civil Site Engineer">Civil Site Engineer</option>
                        <option value="Site Supervisor">Site Supervisor</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Architect & CAD Designer">Architect & CAD Designer</option>
                        <option value="Sales & Business Development">Sales & Business Development</option>
                        <option value="Procurement & Vendor Management">Procurement & Vendor Management</option>
                        <option value="Accounts & Administration">Accounts & Administration</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Experience & Portfolio / LinkedIn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                        Total Experience
                      </label>
                      <select
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                      >
                        <option value="Fresher / Graduate">Fresher / Graduate</option>
                        <option value="1-3 Years">1–3 Years</option>
                        <option value="3-5 Years">3–5 Years</option>
                        <option value="5-10 Years">5–10 Years</option>
                        <option value="10+ Years">10+ Years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                        LinkedIn / Portfolio Profile URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                      />
                    </div>
                  </div>

                  {/* Short Message */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                      Brief Introduction / Note (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us briefly about your background, key projects handled, or why you'd like to work with Citadel Group..."
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-[#8A563D] hover:bg-[#734732] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
