import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Building2,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { projectsData } from '../data/projectsData';
import { Project } from '../types';
import {
  CITADEL_WHATSAPP_CONFIG,
  triggerWhatsAppChat,
} from '../utils/whatsapp';
import { sheetsWebhookService } from '../services/sheetsWebhookService';

interface WhatsAppChatWidgetProps {
  onSelectProject: (projectId: string) => void;
  onOpenEnquiry?: (projectId?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  projectId?: string;
  showConnectCard?: boolean;
}

type FlowStep = 'location' | 'projects' | 'details' | 'connect';

export const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({
  onSelectProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasSentEnquiry, setHasSentEnquiry] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('location');
  const [currentLocation, setCurrentLocation] = useState<string>('all');
  const [currentSelectedProject, setCurrentSelectedProject] = useState<Project | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simple opening message cut short till "spaces in Pune."
  const initialBotMessage: ChatMessage = {
    id: 'msg-init',
    sender: 'bot',
    text: 'Namaste & Welcome to Citadel Group! 🏛️\nHow can I help you explore our luxury residences and commercial spaces in Pune?',
    time: getCurTime(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialBotMessage]);

  function getCurTime(): string {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Suggested messages strictly adhering to the flow:
  // Location -> Projects -> Details -> Connect with us
  const suggestedMessages = useMemo(() => {
    switch (flowStep) {
      case 'location':
        return [
          'Prabhat Road, Pune',
          'Law College Road, Pune',
          'Walvekar Nagar / Parvati',
          'All Pune Locations',
        ];

      case 'projects':
        if (currentLocation === 'prabhat') {
          return [
            'Prabhat 96 (3 & 4 BHK)',
            'Switch to Law College Road',
            'Connect with us on WhatsApp',
          ];
        }
        if (currentLocation === 'law-college') {
          return [
            'Anandshree (3 & 4 BHK)',
            'Stellar Residences',
            'Connect with us on WhatsApp',
          ];
        }
        if (currentLocation === 'walvekar') {
          return [
            'Walvekar Commercials (Offices & Retail)',
            'Janki Shreyas CHS (2 & 3 BHK)',
            'Friends CHS',
            'Connect with us on WhatsApp',
          ];
        }
        return [
          'Prabhat 96 (Prabhat Road)',
          'Walvekar Commercials (Retail & Office)',
          'Anandshree (Law College Road)',
          'Janki Shreyas CHS (Parvati)',
        ];

      case 'details':
        return [
          'Floor Plans & Carpet Area',
          'Possession Date & Timeline',
          'Key Amenities & Specifications',
          'Connect with us on WhatsApp',
        ];

      case 'connect':
      default:
        return [
          'Connect on WhatsApp (+91 70308 18966)',
          'Schedule an In-Person Site Visit',
          'Request Cost Sheet & Pricing',
          'Explore Another Location',
        ];
    }
  }, [flowStep, currentLocation]);

  // Conversational response engine formatted in clean plain text (no asterisks / markdown decor)
  const generateBotReply = (
    userQuery: string
  ): { replyText: string; projectId?: string; showConnectCard?: boolean; nextStep?: FlowStep; nextLocation?: string; nextProject?: Project | null } => {
    const q = userQuery.toLowerCase().trim();

    // Reset to location flow
    if (q.includes('another location') || q.includes('other location') || q.includes('switch location') || q.includes('all location')) {
      return {
        replyText:
          'Citadel Group has landmark projects in Pune across Prabhat Road, Law College Road, and Walvekar Nagar / Parvati. Which location would you like to explore?',
        nextStep: 'location',
        nextLocation: 'all',
      };
    }

    // Connect with us
    if (
      q.includes('connect') ||
      q.includes('whatsapp') ||
      q.includes('call') ||
      q.includes('speak') ||
      q.includes('desk') ||
      q.includes('advisory') ||
      q.includes('human') ||
      q.includes('agent') ||
      q.includes('contact')
    ) {
      return {
        replyText:
          'I would be happy to connect you directly with our senior relationship manager at Citadel Group. You can chat one-on-one with our advisory desk on WhatsApp at +91 70308 18966, or share your contact number below.',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    // Site visit
    if (q.includes('site visit') || q.includes('visit') || q.includes('schedule')) {
      return {
        replyText:
          'Citadel Group Corporate Office & Experience Center:\nSwapnapurti Apts, Prabhat Road, Lane 8, Erandwane, Pune – 411 004.\n\nWe organize private in-person site visits Monday through Saturday (9:30 AM to 7:00 PM). Would you like to connect with our desk to confirm a suitable time?',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    // Pricing / Cost
    if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('budget') || q.includes('payment')) {
      return {
        replyText:
          'Our pricing and payment schedules are customized based on unit configuration, floor selection, and stage of construction. Our senior advisory desk will provide the exact cost sheet directly on WhatsApp.',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    // Step 1: Location detections -> advance to projects
    if (q.includes('prabhat road') || (q.includes('prabhat') && !q.includes('96'))) {
      return {
        replyText:
          'Prabhat Road, Lane 8 (Erandwane, Pune):\nThis is an ultra-exclusive heritage residential enclave with excellent connectivity to Nal Stop Metro.\n\nIn this location, we have Prabhat 96, featuring ultra-luxury 3 & 4 BHK residences.\n\nWould you like to explore Prabhat 96?',
        nextStep: 'projects',
        nextLocation: 'prabhat',
      };
    }

    if (q.includes('law college')) {
      return {
        replyText:
          'Law College Road, Pune:\nA prestigious Deccan neighborhood near Abhinav School and Nal Stop Metro.\n\nIn this location, our featured projects include Anandshree (3 & 4 BHK residences) and Stellar Residences.\n\nWhich project would you like to review?',
        nextStep: 'projects',
        nextLocation: 'law-college',
      };
    }

    if (q.includes('walvekar') || q.includes('parvati')) {
      if (q.includes('commercial')) {
        const proj = projectsData.find((p) => p.id === 'walvekar-commercial');
        return {
          replyText:
            'Walvekar Commercials (Walvekar Nagar / Parvati, Pune):\n\n• 1st Floor Retail: 1905.22 Sq. Ft. Carpet (Single grand anchor showroom)\n• 2nd Floor Executive Office: 1905.22 Sq. Ft. Carpet (Full corporate floor plate)\n• 3rd to 5th Floors: 2 Offices per floor (913.86 & 980.60 Sq. Ft. Carpet)\n• Highlights: High footfall corridor, perimeter glass glazing, dual high-speed elevators, and ample basement parking.\n\nWould you like floor plans, possession status, or to connect on WhatsApp?',
          projectId: proj?.id,
          nextStep: 'details',
          nextProject: proj,
        };
      }
      return {
        replyText:
          'Walvekar Nagar / Parvati, Pune:\nA thriving central zone with prime residential redevelopment and commercial centres.\n\nIn this location, we offer:\n1. Walvekar Commercials (Retail Showroom & Corporate Offices)\n2. Janki Shreyas CHS (Modern 2 & 3 BHK Residences)\n3. Friends CHS (Upcoming Redevelopment)\n\nWhich project would you like to explore?',
        nextStep: 'projects',
        nextLocation: 'walvekar',
      };
    }

    // Step 2: Specific Project detections -> advance to details
    if (q.includes('prabhat 96') || q.includes('96')) {
      const proj = projectsData.find((p) => p.id === 'prabhat96');
      return {
        replyText:
          'Prabhat 96 (Lane 8, Prabhat Road, Erandwane, Pune):\n\n• Configurations: Ultra-luxury 3 & 4 BHK residences with private vestibules and servant quarters.\n• Total Development: ~21,000 sq. ft.\n• Status: Ongoing project (Possession: Dec 2026).\n• Key Highlights: Heritage lane, Nal Stop Metro access, Italian marble finishes, automated elevators, and acoustic glazing.\n\nWould you like floor plans & carpet areas, possession timeline, or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('anandshree')) {
      const proj = projectsData.find((p) => p.id === 'anandshree');
      return {
        replyText:
          'Anandshree (Law College Road, Pune):\n\n• Configurations: Premium 3 & 4 BHK residences (~21,500 sq. ft. development).\n• Status: Ongoing landmark project near Nal Stop Metro Station.\n• Key Highlights: Unobstructed green canopy views, multi-tier security, and Vastu-compliant layouts.\n\nWould you like floor plans, possession status, or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('janki') || q.includes('shreyas')) {
      const proj = projectsData.find((p) => p.id === 'janki-shreyas-chs');
      return {
        replyText:
          'Janki Shreyas CHS (Walvekar Nagar / Parvati, Pune):\n\n• Configurations: Contemporary 2 & 3 BHK residences across 11 floors (~35,000 sq. ft. development).\n• Status: Ongoing redevelopment (Possession: March 2027).\n• Key Highlights: Vastu-compliant layouts, earthquake-resistant RCC frame, high-speed elevators, and rainwater harvesting.\n\nWould you like floor plans, possession status, or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('stellar')) {
      const proj = projectsData.find((p) => p.id === 'stellar');
      return {
        replyText:
          'Stellar (Law College Road, Pune):\nBoutique residential development (~18,500 sq. ft.) offering modern urban homes with dedicated parking and lush surroundings.\n\nWould you like further specifications or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    // Step 3: Project Details (Floor plans, amenities, possession) -> advance to connect
    if (q.includes('floor plan') || q.includes('carpet') || q.includes('area') || q.includes('layout')) {
      if (currentSelectedProject?.id === 'walvekar-commercial' || q.includes('walvekar')) {
        return {
          replyText:
            'Walvekar Commercials Floor Layouts:\n• 1st Floor: 1 Retail Shop with 1905.22 Sq. Ft. Carpet Area\n• 2nd Floor: 1 Corporate Office with 1905.22 Sq. Ft. Carpet Area\n• 3rd to 5th Floors: 2 Offices per floor (Suite 1: 913.86 Sq. Ft. & Suite 2: 980.60 Sq. Ft. Carpet)\n\nFull architectural drawings are available. Would you like to connect on WhatsApp to receive the complete floor plate PDF dossier?',
          showConnectCard: true,
          nextStep: 'connect',
        };
      }
      return {
        replyText:
          'Our residential floor plans feature spacious living-dining zones, wide balconies, dedicated master suites, and zero-dead-space design. Detailed carpet areas range from 881 sq. ft. (2 BHK) up to 2,100+ sq. ft. (4 BHK).\n\nShall I connect you with our advisory desk on WhatsApp to receive the floor plan dossier?',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    if (q.includes('possession') || q.includes('timeline') || q.includes('status')) {
      return {
        replyText:
          'Possession Timelines for Ongoing Projects:\n• Prabhat 96 (Prabhat Road): December 2026\n• Anandshree (Law College Road): June 2026\n• Janki Shreyas CHS (Parvati): March 2027\n• Walvekar Commercials: Ongoing construction with structural work progressing on schedule.\n\nWould you like to connect on WhatsApp for latest progress photos and milestone updates?',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    if (q.includes('amenities') || q.includes('specification') || q.includes('features')) {
      return {
        replyText:
          'Citadel Quality Standards & Amenities:\n• Structural: Earthquake-resistant RCC frame with high-grade steel\n• Finishes: Italian marble in living areas, vitrified tiles in bedrooms\n• Elevators: High-speed automated elevators with power backup\n• Eco Features: Rainwater harvesting, solar water heating, and solar common lighting\n• Security: 24/7 CCTV surveillance, video door phones, and intercom connectivity.\n\nWould you like to connect with our desk for a personalized consultation?',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    // Default polite response
    return {
      replyText:
        `Thank you for asking about "${userQuery}". Citadel Group develops landmark luxury residences and commercial spaces in Pune across Prabhat Road, Law College Road, and Walvekar Nagar / Parvati.\n\nWould you like to connect with our advisory desk on WhatsApp (+91 70308 18966) for detailed information?`,
      showConnectCard: true,
      nextStep: 'connect',
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: getCurTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Natural conversation pause
    setTimeout(() => {
      const { replyText, projectId, showConnectCard, nextStep, nextLocation, nextProject } =
        generateBotReply(text);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        time: getCurTime(),
        projectId,
        showConnectCard,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (nextStep) setFlowStep(nextStep);
      if (nextLocation) setCurrentLocation(nextLocation);
      if (nextProject !== undefined) setCurrentSelectedProject(nextProject);
    }, 500);
  };

  // Compile conversation summary and launch WhatsApp
  const handleConnectWhatsApp = async () => {
    const userQuestions = messages
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .slice(-4);

    const interestedProjects = messages
      .filter((m) => m.projectId)
      .map((m) => {
        const p = projectsData.find((proj) => proj.id === m.projectId);
        return p ? p.title : null;
      })
      .filter(Boolean);

    const projectSummary = interestedProjects.length > 0 ? interestedProjects.join(', ') : 'Citadel Developments';

    const conversationText = [
      `🏛️ INQUIRY VIA WEBSITE CHATBOT — CITADEL GROUP`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Name: ${userName.trim() || 'Website Visitor'}`,
      userPhone.trim() ? `Phone: ${userPhone.trim()}` : null,
      `Inquiry Focus: ${projectSummary}`,
      userQuestions.length > 0 ? `Topics Discussed:\n${userQuestions.map((q) => `• "${q}"`).join('\n')}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Connected via Citadel Web Concierge to +91 70308 18966`,
    ]
      .filter(Boolean)
      .join('\n');

    // Asynchronously log to Google Sheets webhook & notify citadelenquiry@gmail.com
    sheetsWebhookService
      .submitLead({
        formType: 'Website Interactive Chatbot',
        name: userName.trim() || 'Website Visitor',
        phone: userPhone.trim() || 'Connected via WhatsApp',
        email: 'citadelenquiry@gmail.com',
        projectOrRole: projectSummary,
        details: `Chat summary: ${userQuestions.join('; ')}`,
        message: conversationText,
        notificationEmail: CITADEL_WHATSAPP_CONFIG.notificationEmail,
        whatsappNumber: CITADEL_WHATSAPP_CONFIG.rawNumber,
      })
      .catch(() => {});

    setHasSentEnquiry(true);

    // Launch WhatsApp
    triggerWhatsAppChat(conversationText);
  };

  const handleResetChat = () => {
    setMessages([initialBotMessage]);
    setHasSentEnquiry(false);
    setFlowStep('location');
    setCurrentLocation('all');
    setCurrentSelectedProject(null);
  };

  return (
    <div id="citadel-whatsapp-widget" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none">
      {/* 1. Small Sleek Floating WhatsApp Trigger Button */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Chat on WhatsApp"
            title="Chat with Citadel Group on WhatsApp (+91 70308 18966)"
            className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border border-white/80 relative"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </span>
          </button>

          {/* Discreet Hover Tooltip */}
          <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none hidden sm:block whitespace-nowrap">
            <div className="bg-[#1E1D1B] text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-md border border-[#3E3C38] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              <span>Chat with Citadel Assistant</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sleek WhatsApp Conversational Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Citadel Chatbot"
          className="w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[84vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E6E1DC] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-[#141312] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#2C2A28]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5 fill-current" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#141312]" />
              </div>
              <div>
                <h3 className="font-editorial text-base font-bold text-white leading-tight">
                  Citadel Concierge
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-[#A69F97]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>WhatsApp Desk: {CITADEL_WHATSAPP_CONFIG.displayNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#D4CFC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#D4CFC9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6F3EE]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-[#8A563D] text-white rounded-tr-xs'
                      : 'bg-white text-[#1E1D1B] border border-[#E8E2D9] rounded-tl-xs'
                  }`}
                >
                  {m.text}

                  {/* Optional Project Deep Link Button */}
                  {m.projectId && (
                    <div className="mt-2.5 pt-2 border-t border-[#EDE7DF] flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onSelectProject(m.projectId!);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A563D] hover:underline cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>View Project Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Connect with Us on WhatsApp Interactive Card */}
                  {m.showConnectCard && (
                    <div className="mt-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD6CE] space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E1D1B]">
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                        <span>Connect on WhatsApp</span>
                      </div>
                      <p className="text-[10px] text-[#6E6A65] leading-tight">
                        Send this conversation directly to our senior advisory desk (+91 70308 18966):
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <input
                          type="text"
                          placeholder="Your Name (Optional)"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="px-2 py-1 bg-white border border-[#DDD6CE] rounded-lg text-[11px] text-[#1E1D1B] focus:border-[#8A563D] focus:outline-hidden"
                        />
                        <input
                          type="tel"
                          placeholder="Phone (Optional)"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          className="px-2 py-1 bg-white border border-[#DDD6CE] rounded-lg text-[11px] text-[#1E1D1B] focus:border-[#8A563D] focus:outline-hidden"
                        />
                      </div>

                      <button
                        onClick={handleConnectWhatsApp}
                        className="w-full mt-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Open WhatsApp ({CITADEL_WHATSAPP_CONFIG.displayNumber})</span>
                      </button>

                      {hasSentEnquiry && (
                        <div className="text-[10px] text-[#1E7E34] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Logged to Citadel CRM & Google Sheets</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#8C857E] mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1 text-[#8A563D] text-[11px] bg-white border border-[#E8E2D9] px-3 py-1.5 rounded-full w-fit shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A563D] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A563D] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A563D] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[10px] text-[#6E6A65]">Citadel Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Recommended Questions Flow Bar (Location -> Projects -> Details -> Connect) */}
          <div className="bg-[#FAF8F5] px-3 py-2 border-t border-[#E6E1DC]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-[#8A563D] uppercase tracking-wider">
                {flowStep === 'location'
                  ? 'Step 1: Select Location'
                  : flowStep === 'projects'
                  ? 'Step 2: Choose Project'
                  : flowStep === 'details'
                  ? 'Step 3: Inquire Details'
                  : 'Step 4: Connect With Us'}
              </span>
              <span className="text-[9px] text-[#8C857E]">
                {flowStep === 'location' ? '1/4' : flowStep === 'projects' ? '2/4' : flowStep === 'details' ? '3/4' : '4/4'}
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestedMessages.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 bg-white hover:bg-[#EFEAE4] text-[#3C3A36] hover:text-[#1E1D1B] border border-[#DDD6CE] hover:border-[#8A563D] text-[11px] px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="bg-white p-3 border-t border-[#E6E1DC] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything or choose a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-xs text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="w-8 h-8 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
