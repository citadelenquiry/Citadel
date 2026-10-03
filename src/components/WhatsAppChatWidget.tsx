import React, { useState, useMemo } from 'react';
import {
  MessageCircle,
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Building2,
  ExternalLink,
  Phone,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { projectsData } from '../data/projectsData';
import { Project } from '../types';
import {
  CITADEL_WHATSAPP_CONFIG,
  createWhatsAppUrl,
  triggerWhatsAppChat,
} from '../utils/whatsapp';
import { sheetsWebhookService } from '../services/sheetsWebhookService';

interface WhatsAppChatWidgetProps {
  onSelectProject: (projectId: string) => void;
  onOpenEnquiry?: (projectId?: string) => void;
}

type ChatStep = 'greetings' | 'location' | 'projects' | 'contact';

interface LocationOption {
  id: string;
  name: string;
  shortDesc: string;
  filterFn: (p: Project) => boolean;
}

const LOCATION_OPTIONS: LocationOption[] = [
  {
    id: 'law-college-road',
    name: 'Law College Road, Pune',
    shortDesc: 'Prime residential enclave near Nal Stop Metro',
    filterFn: (p) =>
      p.location.toLowerCase().includes('law college') ||
      p.fullAddress.toLowerCase().includes('law college'),
  },
  {
    id: 'walvekar-nagar',
    name: 'Walvekar Nagar / Parvati, Pune',
    shortDesc: 'Residential redevelopment & commercial centres',
    filterFn: (p) =>
      p.location.toLowerCase().includes('walvekar') ||
      p.location.toLowerCase().includes('parvati') ||
      p.fullAddress.toLowerCase().includes('walvekar') ||
      p.fullAddress.toLowerCase().includes('parvati'),
  },
  {
    id: 'prabhat-road',
    name: 'Prabhat Road, Pune',
    shortDesc: 'Ultra-exclusive heritage residences, Lane 8',
    filterFn: (p) =>
      p.location.toLowerCase().includes('prabhat') ||
      p.fullAddress.toLowerCase().includes('prabhat'),
  },
  {
    id: 'all-locations',
    name: 'All Locations in Pune',
    shortDesc: 'Explore complete residential & commercial portfolio',
    filterFn: () => true,
  },
];

const QUERY_INTENTS = [
  'Request Pricing & Payment Schedule',
  'Schedule an In-Person Site Visit',
  'Receive Brochure & Floor Plans',
  'Society Redevelopment Consultation',
  'Commercial Space / Office Inquiry',
  'General Project Consultation',
];

export const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({
  onSelectProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>('greetings');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string>(QUERY_INTENTS[0]);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userNote, setUserNote] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // Filter projects matching location
  const matchingProjects = useMemo(() => {
    if (!selectedLocation) return projectsData.filter((p) => !p.hidden);
    return projectsData.filter((p) => !p.hidden && selectedLocation.filterFn(p));
  }, [selectedLocation]);

  const handleOpenWidget = () => {
    setIsOpen(true);
    setHasStartedChat(true);
  };

  const handleCloseWidget = () => {
    setIsOpen(false);
  };

  const handleLocationSelect = (loc: LocationOption) => {
    setSelectedLocation(loc);
    setStep('projects');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setStep('contact');
  };

  const handleViewProjectOnSite = (projectId: string) => {
    onSelectProject(projectId);
    setIsOpen(false);
  };

  const handleLaunchWhatsApp = () => {
    const lines = [
      `*🏛️ Hi Citadel Group!*`,
      `I am visiting your website and would like to connect:`,
      ``,
    ];

    if (userName.trim()) {
      lines.push(`👤 *My Name:* ${userName.trim()}`);
    }
    if (userPhone.trim()) {
      lines.push(`📞 *My Phone:* ${userPhone.trim()}`);
    }

    if (selectedLocation) {
      lines.push(`📍 *Location Interested In:* ${selectedLocation.name}`);
    }

    if (selectedProject) {
      lines.push(`🏢 *Project:* ${selectedProject.title} (${selectedProject.status})`);
      lines.push(`📐 *Project Type:* ${selectedProject.areaSqFt} | ${selectedProject.unitsCount}`);
    }

    if (selectedIntent) {
      lines.push(`ℹ️ *Inquiry Purpose:* ${selectedIntent}`);
    }

    if (userNote.trim()) {
      lines.push(`💬 *Note:* "${userNote.trim()}"`);
    }

    lines.push(``);
    lines.push(`_Sent via Citadel Website WhatsApp Assistant_`);

    const finalMessage = lines.join('\n');

    // Also record lead in Google Sheets for backup audit
    if (userName.trim() || userPhone.trim() || selectedProject) {
      sheetsWebhookService.submitLead({
        formType: 'WhatsApp Chat Flow Enquiry',
        name: userName.trim() || 'WhatsApp Visitor',
        phone: userPhone.trim() || 'Via WhatsApp Chat',
        email: 'citadelenquiry@gmail.com',
        projectOrRole: selectedProject ? selectedProject.title : (selectedLocation?.name || 'General Query'),
        details: `Intent: ${selectedIntent}${selectedLocation ? ` | Location: ${selectedLocation.name}` : ''}`,
        message: userNote.trim() || `Inquired via WhatsApp for ${selectedProject?.title || 'Citadel Projects'}`,
      }).catch(() => {});
    }

    triggerWhatsAppChat(finalMessage);
  };

  const handleDirectWhatsAppChat = () => {
    const directMessage = `Hello Citadel Group, I am on your website and would like to inquire about your residential and commercial projects in Pune.`;
    triggerWhatsAppChat(directMessage);
  };

  return (
    <div id="citadel-whatsapp-widget" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none">
      {/* Floating Small WhatsApp Action Button */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={handleOpenWidget}
            aria-label="Chat on WhatsApp"
            title="Chat with Citadel Group on WhatsApp (+91 70308 18966)"
            className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border border-white/80 relative"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            </span>
          </button>

          {/* Discreet Hover Tooltip */}
          <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none hidden sm:block whitespace-nowrap">
            <div className="bg-[#1E1D1B] text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-md border border-[#3E3C38] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              <span>WhatsApp Chat</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Modal / Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="WhatsApp Assistant"
          className="w-[calc(100vw-2.5rem)] sm:w-[400px] max-h-[85vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E6E1DC] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-[#141312] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#2C2A28] relative">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm">
                <MessageCircle className="w-5 h-5 fill-current" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#141312]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-lg font-bold text-white leading-tight">
                    Citadel Advisory Desk
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#A69F97]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online &bull; Number: {CITADEL_WHATSAPP_CONFIG.displayNumber}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseWidget}
              aria-label="Close WhatsApp chat"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#D4CFC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress Pill */}
          <div className="bg-[#EFEAE6] px-4 py-2 flex items-center justify-between text-[11px] text-[#78736E] border-b border-[#E6E1DC]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                step === 'greetings' ? 'bg-[#8A563D] text-white' : 'bg-white text-[#8A563D]'
              }`}>
                Step {step === 'greetings' ? '1' : step === 'location' ? '2' : step === 'projects' ? '3' : '4'} of 4
              </span>
              <span className="font-semibold text-[#1E1D1B]">
                {step === 'greetings' && 'Greetings'}
                {step === 'location' && 'Select Location'}
                {step === 'projects' && 'Choose Project'}
                {step === 'contact' && 'Contact on WhatsApp'}
              </span>
            </div>

            {step !== 'greetings' && (
              <button
                onClick={() => {
                  if (step === 'contact') setStep('projects');
                  else if (step === 'projects') setStep('location');
                  else if (step === 'location') setStep('greetings');
                }}
                className="text-[11px] font-semibold text-[#8A563D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Interactive Chat Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* STEP 1: GREETINGS */}
            {step === 'greetings' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Greeting Speech Bubble */}
                <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-[#E6E1DC] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8A563D] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Welcome to Citadel Group</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3E3C38] leading-relaxed">
                    👋 <strong>Hi and warm greetings!</strong> Citadel Group is Pune&apos;s leading redevelopment and real estate specialist with delivered landmarks and active developments across the city.
                  </p>
                  <p className="text-xs text-[#6E6A65] leading-relaxed">
                    Let&apos;s find the right project for you in just two quick steps, or connect directly with our advisory desk on WhatsApp.
                  </p>
                </div>

                {/* Primary CTA: Choose Location */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setStep('location')}
                    className="w-full bg-[#1E1D1B] hover:bg-[#2C2A28] text-white p-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-between transition-colors shadow-sm cursor-pointer group"
                  >
                    <span>1. Location you are looking for</span>
                    <ArrowRight className="w-4 h-4 text-[#E8C2AF] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={handleDirectWhatsAppChat}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Direct Chat on WhatsApp (+91 70308 18966)</span>
                  </button>
                </div>

                <div className="bg-[#FAF1EC] p-3 rounded-xl border border-[#E8C2AF]/40 text-[11px] text-[#6E6A65] space-y-1">
                  <p className="font-semibold text-[#8A563D]">⚡ Quick Response Guarantee:</p>
                  <p>Our sales team is available on WhatsApp daily for inquiries, brochures &amp; site visit appointments.</p>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION YOU ARE LOOKING FOR */}
            {step === 'location' && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] block">
                    LOCATION SELECTION
                  </span>
                  <h4 className="font-editorial text-lg font-bold text-[#1E1D1B]">
                    Which location are you looking for?
                  </h4>
                  <p className="text-xs text-[#6E6A65]">
                    Select a prime node to view Citadel developments with floor details.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {LOCATION_OPTIONS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full p-3.5 bg-white hover:bg-[#FAF1EC] border border-[#DDD6CE] hover:border-[#8A563D] rounded-xl text-left transition-all cursor-pointer group shadow-xs flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#FAF1EC] group-hover:bg-[#8A563D] text-[#8A563D] group-hover:text-white flex items-center justify-center shrink-0 transition-colors mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-editorial text-base font-bold text-[#1E1D1B] group-hover:text-[#8A563D] leading-tight">
                          {loc.name}
                        </div>
                        <p className="text-[11px] text-[#6E6A65] mt-0.5">
                          {loc.shortDesc}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A563D] self-center shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: PROJECTS WITH LOCATION AND DETAILS + DIRECT LINK */}
            {step === 'projects' && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] block">
                      {selectedLocation?.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#78736E] bg-white px-2 py-0.5 rounded-full border border-[#DDD6CE]">
                      {matchingProjects.length} Projects Available
                    </span>
                  </div>
                  <h4 className="font-editorial text-lg font-bold text-[#1E1D1B]">
                    Projects in this Location
                  </h4>
                  <p className="text-xs text-[#6E6A65]">
                    Select a project to chat on WhatsApp or view full details on our website:
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {matchingProjects.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-3.5 rounded-xl border border-[#DDD6CE] hover:border-[#8A563D] shadow-xs space-y-2.5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="font-editorial text-base font-bold text-[#1E1D1B]">
                              {p.title}
                            </h5>
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF1EC] text-[#8A563D] border border-[#E8C2AF]/50">
                              {p.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6E6A65] mt-0.5 font-medium">
                            {p.location}
                          </p>
                        </div>
                      </div>

                      {/* Key details snippet */}
                      <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#EDE7E1] text-[11px] text-[#55504A] space-y-0.5">
                        <div><strong>Typology:</strong> {p.unitsCount}</div>
                        <div><strong>Floors / Scale:</strong> {p.floors} &bull; {p.areaSqFt}</div>
                        {p.reraNumber && (
                          <div className="text-[10px] text-[#8A563D]"><strong>MahaRERA:</strong> {p.reraNumber}</div>
                        )}
                      </div>

                      {/* Dual Action: View on Web vs WhatsApp */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleViewProjectOnSite(p.id)}
                          className="flex-1 bg-white hover:bg-[#FAF8F5] text-[#1E1D1B] border border-[#DDD6CE] py-1.5 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Open project page on Citadel website"
                        >
                          <span>View on Site</span>
                          <ExternalLink className="w-3 h-3 text-[#8A563D]" />
                        </button>

                        <button
                          onClick={() => handleProjectSelect(p)}
                          className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-1.5 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title="Select to inquire on WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 fill-current" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: CONTACT FOR MORE & SUBMIT TO WHATSAPP */}
            {step === 'contact' && selectedProject && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="bg-white p-3 rounded-xl border border-[#E6E1DC] shadow-xs flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] block">
                      SELECTED PROJECT
                    </span>
                    <h5 className="font-editorial text-base font-bold text-[#1E1D1B] truncate">
                      {selectedProject.title}
                    </h5>
                    <p className="text-[11px] text-[#6E6A65] truncate">
                      {selectedProject.location} &bull; {selectedProject.status}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('projects')}
                    className="text-[11px] text-[#8A563D] hover:underline font-semibold shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Query Intent */}
                <div>
                  <label className="block text-xs font-semibold text-[#1E1D1B] mb-1.5">
                    What would you like to enquire about?
                  </label>
                  <select
                    value={selectedIntent}
                    onChange={(e) => setSelectedIntent(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#8A563D] focus:outline-hidden"
                  >
                    {QUERY_INTENTS.map((intent) => (
                      <option key={intent} value={intent}>
                        {intent}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personal Information (Optional) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#55504A] mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#8A563D] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#55504A] mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91..."
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#8A563D] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Additional Note */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#55504A] mb-1">
                    Specific requirements / questions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Inquiring about carpet area, floor availability, booking site visit..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DDD6CE] rounded-lg text-xs text-[#1E1D1B] focus:border-[#8A563D] focus:outline-hidden resize-none"
                  />
                </div>

                {/* Main WhatsApp Launch Button */}
                <div className="pt-1 space-y-2">
                  <button
                    onClick={handleLaunchWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send on WhatsApp ({CITADEL_WHATSAPP_CONFIG.displayNumber})</span>
                  </button>

                  <p className="text-[10px] text-center text-[#78736E] leading-relaxed">
                    Clicking will open WhatsApp directly with your pre-formatted enquiry ready to send.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar with Office Info */}
          <div className="bg-[#FAF8F5] p-3 border-t border-[#E6E1DC] flex items-center justify-between text-[11px] text-[#78736E]">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-[#8A563D] shrink-0" />
              <span className="truncate">Desk Active: Mon &ndash; Sat: 9:30 AM &ndash; 7:00 PM</span>
            </div>
            <button
              onClick={handleDirectWhatsAppChat}
              className="text-[#25D366] hover:underline font-bold text-[11px] shrink-0 ml-2 cursor-pointer flex items-center gap-1"
            >
              <span>Quick WhatsApp</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
