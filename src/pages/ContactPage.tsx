import React, { useState } from 'react';
import { Page } from '../types';
import { projectsData } from '../data/projectsData';
import { sheetsWebhookService } from '../services/sheetsWebhookService';
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Building,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ContactPageProps {
  setCurrentPage: (page: Page) => void;
  onOpenEnquiry: (projectId?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  setCurrentPage,
  onOpenEnquiry,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lookingFor: 'Self (Customer)',
    inquiryType: 'Home Purchase',
    project: 'Janki Shreyas CHS',
    preferredDate: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const details = `Looking For: ${formData.lookingFor}${formData.preferredDate ? ` | Preferred Date: ${formData.preferredDate}` : ''}`;

    await sheetsWebhookService.submitLead({
      formType: `Contact Page - ${formData.inquiryType || 'General Inquiry'}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      projectOrRole: formData.project || 'General Inquiry',
      details,
      message: formData.message || '',
    });

    setLoading(false);
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'Where is Citadel Group’s Corporate Head Office located?',
      a: 'Our Head Office is situated at Swapnapurti Apartments, Apt 2, 35/13+14C, Opp Hotel President, Prabhat Road, Lane 8, Erandwane, Pune – 411 004. You are welcome to visit Monday through Saturday between 9:30 AM and 7:00 PM.',
    },
    {
      q: 'How do I schedule a site walkthrough for Janki Shreyas CHS?',
      a: 'You can book a private walkthrough directly through our contact form above, or by calling our sales desk at +91 8779975270. Site visits are arranged 7 days a week with prior slot confirmation.',
    },
    {
      q: 'What is the redevelopment procedure for housing societies in Pune?',
      a: 'We begin with a complimentary feasibility report including FSI calculations, draft architectural concept, financial corpus estimation, and rent compensation proposals. Our directors present these directly to your society’s Managing Committee and Special General Body (SGM).',
    },
    {
      q: 'Are Citadel Group projects approved by major nationalized banks for home loans?',
      a: 'Yes, all our projects are fully approved by Pune Municipal authorities and statutory bodies, and are pre-approved for up to 80-90% home loan funding by HDFC Bank, SBI, ICICI Bank, Axis Bank, and Bank of Baroda.',
    },
  ];

  return (
    <div id="contact-page-container" className="pt-16 sm:pt-20 bg-[#F8F6F3]">
      {/* 1. HERO HEADER */}
      <section className="py-16 sm:py-20 bg-[#1E1D1B] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block mb-3">
            GET IN TOUCH
          </span>
          <h1 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-white mb-4">
            Connect with Citadel Group
          </h1>
          <p className="text-sm sm:text-base text-[#D4CFC9] max-w-xl mx-auto font-light">
            We are here to assist with project inquiries, site visit bookings, custom quotes, and cooperative housing society redevelopment consultations.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTACT GRID */}
      <section className="py-16 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Head Office Details & Interactive Map Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact Cards */}
              <div className="bg-white rounded-3xl p-7 border border-[#E6E1DC] shadow-xs space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A563D] block mb-1">
                    REGISTERED OFFICE
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-[#1E1D1B]">
                    Pune Headquarters
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#4E4B47]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8C2AF]/30 text-[#8A563D] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-[#1E1D1B] block">Address:</strong>
                      <span>
                        Swapnapurti Apartments, Apt 2,<br />
                        35/13+14C, Opp Hotel President,<br />
                        Prabhat Road, Lane 8, Erandwane.<br />
                        Pune – 411 004, Maharashtra, India.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8C2AF]/30 text-[#8A563D] flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-[#1E1D1B] block">Email Desk:</strong>
                      <a
                        href="mailto:enquiry@thecitadelgroup.co"
                        className="text-[#8A563D] hover:underline font-medium break-all block"
                      >
                        enquiry@thecitadelgroup.co
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8C2AF]/30 text-[#8A563D] flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-[#1E1D1B] block">Telephones:</strong>
                      <a href="tel:+918779975270" className="hover:text-[#8A563D] block font-medium text-[#1E1D1B]">
                        +91 8779975270 (Direct / Sales)
                      </a>
                      <a href="tel:+912025440000" className="hover:text-[#8A563D] block text-xs text-[#7A7570]">
                        +91 (020) 2544-0000 (Board Desk)
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E8C2AF]/30 text-[#8A563D] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-[#1E1D1B] block">Business Hours:</strong>
                      <span>Monday – Saturday: 9:30 AM – 7:00 PM</span>
                      <span className="block text-[11px] text-[#7A7570]">
                        Sunday: Site visits open by appointment.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive OpenStreetMap Embed Card */}
              <div className="bg-[#242321] rounded-3xl p-5 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#E8C2AF] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E8C2AF]" />
                    <span>Head Office Location Map</span>
                  </span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Swapnapurti+Apartments+Apt+2+35%2F13%2B14C+Opp+Hotel+President+Prabhat+Road+Lane+8+Erandwane+Pune+411004"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#E8C2AF] hover:underline flex items-center gap-1"
                  >
                    <span>Open in Google Maps</span>
                    <span>↗</span>
                  </a>
                </div>

                <div className="relative h-60 rounded-2xl overflow-hidden border border-[#3E3C38]">
                  <iframe
                    title="Citadel Head Office Location"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=73.8300%2C18.5080%2C73.8450%2C18.5200&amp;layer=mapnik&amp;marker=18.5140%2C73.8375"
                    className="w-full h-full border-0 filter invert-[0.88] hue-rotate-180 contrast-125"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 right-3 bg-[#1E1D1B]/95 backdrop-blur-md p-2.5 rounded-xl text-white border border-white/20 shadow-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#E8C2AF] shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-snug">
                        <span className="font-bold text-[#E8C2AF] block">Swapnapurti Apartments, Apt 2,</span>
                        <span className="text-[#DDD6CE] block">35/13+14C, Opp Hotel President,</span>
                        <span className="text-[#DDD6CE] block">Prabhat Road, Lane 8, Erandwane.</span>
                        <span className="text-[#DDD6CE] font-semibold block">Pune – 411 004</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1918] p-3 rounded-xl border border-[#3E3C38] flex items-start gap-2 text-xs text-[#DDD6CE]">
                  <MapPin className="w-4 h-4 text-[#E8C2AF] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-white block font-medium">Head Office Address:</strong>
                    Swapnapurti Apartments, Apt 2, 35/13+14C, Opp Hotel President, Prabhat Road, Lane 8, Erandwane. Pune – 411 004
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Contact / Booking Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E6E1DC] shadow-md">
                {submitted ? (
                  <div className="text-center py-12 space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-[#E8C2AF]/30 text-[#8A563D] rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-[#8A563D]" />
                    </div>
                    <h3 className="font-editorial text-3xl font-bold text-[#1E1D1B]">
                      Message Dispatched!
                    </h3>
                    <p className="text-sm text-[#5C5752] max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{formData.name}</strong>. We have registered your inquiry as{' '}
                      <span className="font-semibold text-[#1E1D1B]">{formData.lookingFor}</span> for{' '}
                      <span className="font-semibold text-[#1E1D1B]">{formData.inquiryType}</span> regarding{' '}
                      <span className="font-semibold text-[#1E1D1B]">{formData.project}</span>.
                    </p>
                    <p className="text-xs text-[#7A7570]">
                      Our sales advisor will call you shortly at <span className="font-bold text-[#1E1D1B]">{formData.phone}</span>.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-full transition-colors cursor-pointer"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8A563D] block mb-1">
                        DIRECT INQUIRY DESK
                      </span>
                      <h3 className="font-editorial text-3xl font-bold text-[#1E1D1B]">
                        Send Us a Message or Schedule a Visit
                      </h3>
                      <p className="text-xs text-[#6E6A65] mt-1">
                        Fill out the form below, and our relationship managers will respond within 2 business hours.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                            Your Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Anand Joshi"
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                            Contact Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 87799 75270"
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                          />
                        </div>
                      </div>

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
                            placeholder="anand@example.com"
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                            Looking For *
                          </label>
                          <select
                            value={formData.lookingFor}
                            onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                          >
                            <option value="Self (Customer)">Self (Customer)</option>
                            <option value="Agent">Agent</option>
                            <option value="Channel Partner">Channel Partner</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                            Inquiry Category
                          </label>
                          <select
                            value={formData.inquiryType}
                            onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                          >
                            <option value="Home Purchase">Home Purchase / Investment</option>
                            <option value="Commercial Suite">Commercial Office Suite</option>
                            <option value="Society Redevelopment">Housing Society Redevelopment</option>
                            <option value="Site Visit Booking">Schedule In-Person Site Visit</option>
                            <option value="Vendor / Partner">Vendor / Contractor Partnership</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                            Project of Interest
                          </label>
                          <select
                            value={formData.project}
                            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                          >
                            <optgroup label="Ongoing Projects">
                              {projectsData
                                .filter((p) => p.status === 'Ongoing')
                                .map((p) => (
                                  <option key={p.id} value={p.title}>
                                    {p.title} ({p.location})
                                  </option>
                                ))}
                            </optgroup>
                            <optgroup label="Upcoming Projects">
                              {projectsData
                                .filter((p) => p.status === 'Upcoming')
                                .map((p) => (
                                  <option key={p.id} value={p.title}>
                                    {p.title} ({p.location})
                                  </option>
                                ))}
                            </optgroup>
                            <option value="General Consultation">General Consultation</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                          Preferred Site Visit Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                          Your Message / Specific Requirements
                        </label>
                        <textarea
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us what configuration, budget range, or specific query you have..."
                          className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          id="submit-contact-page-btn"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider py-4 rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {loading ? (
                            <span>TRANSMITTING MESSAGE...</span>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>SEND MESSAGE & REQUEST CALLBACK</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
