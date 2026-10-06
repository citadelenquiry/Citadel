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
            '96 Prabhat (3 & 4.5 BHK)',
            'Switch to Law College Road',
            'Switch to Walvekar Nagar',
            'Connect with us on WhatsApp',
          ];
        }
        if (currentLocation === 'law-college') {
          return [
            'Janki Shreyas CHS (2, 3 & 4 BHK)',
            'Switch to Prabhat Road',
            'Switch to Walvekar Nagar',
            'Connect with us on WhatsApp',
          ];
        }
        if (currentLocation === 'walvekar') {
          return [
            'Friends CHS (2 & 3 BHK)',
            'Manisha CHS (5 BHK Sky Villa)',
            'Walvekar Commercials (Offices & Retail)',
            'Anandshree CHS (2 & 3 BHK Completed)',
            'Connect with us on WhatsApp',
          ];
        }
        return [
          '96 Prabhat (Prabhat Road)',
          'Janki Shreyas CHS (Law College Road)',
          'Friends CHS (Walvekar Nagar)',
          'Walvekar Commercials (Walvekar Nagar)',
          'Anandshree CHS (Walvekar Nagar)',
        ];

      case 'details':
        return [
          'Floor Plans & Carpet Area',
          'Possession & OC Status',
          'Key Amenities & Specifications',
          'Connect with us on WhatsApp',
        ];

      case 'connect':
      default:
        return [
          'Connect on WhatsApp (+91 87799 75270)',
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
    if (q.includes('another location') || q.includes('other location') || q.includes('switch location') || (q.includes('switch') && q.includes('location'))) {
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
          'I would be happy to connect you directly with our senior relationship manager at Citadel Group. You can chat one-on-one with our advisory desk on WhatsApp at +91 87799 75270, or share your contact number below.',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    // Site visit
    if (q.includes('site visit') || q.includes('visit') || q.includes('schedule')) {
      return {
        replyText:
          'Citadel Group Corporate Office & Experience Center:\nSwapnapurti Apts, Prabhat Road, Lane 8, Erandwane, Pune – 411 004.\n\nWe organize private in-person site visits Monday through Saturday (9:30 AM to 6:30 PM). Would you like to connect with our desk to confirm a suitable time?',
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
      const proj = projectsData.find((p) => p.id === '96-prabhat');
      return {
        replyText:
          'Prabhat Road, Lane 2 (Erandwane, Pune):\nAn ultra-exclusive heritage residential enclave with excellent connectivity to Nal Stop Metro.\n\nProject in this location:\n• 96 Prabhat — Ultra-luxury 3 & 4.5 BHK Master Suites (60,000 sq. ft., P + 11 floors).\n\nWould you like to explore 96 Prabhat or connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'projects',
        nextLocation: 'prabhat',
        nextProject: proj,
      };
    }

    if (q.includes('law college')) {
      const proj = projectsData.find((p) => p.id === 'janki-shreyas-chs');
      return {
        replyText:
          'Law College Road, Pune:\nA prestigious Deccan neighborhood near Abhinav School and Nal Stop Metro.\n\nProject in this location:\n• Janki Shreyas CHS — Premium 2, 3 & 4 BHK Luxury Residences (881 to 1530 sq. ft. carpet, RERA: PR1260002601082).\n\nWould you like to review floor plans for Janki Shreyas CHS or connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
        nextLocation: 'law-college',
      };
    }

    if (q.includes('walvekar') || q.includes('parvati')) {
      if (q.includes('commercial')) {
        const proj = projectsData.find((p) => p.id === 'walvekar-commercial');
        return {
          replyText:
            'Walvekar Commercials (Walvekar Nagar, Parvati Paytha, Pune 411009):\n\n• Status: Completed & operational boutique commercial complex (20,000 sq. ft., P + 5 floors).\n• 1st Floor Retail: 1,905.22 Sq. Ft. RERA Carpet (Single grand anchor showroom with road frontage)\n• 2nd Floor Executive Office: 1,905.22 Sq. Ft. RERA Carpet (Full corporate floor plate)\n• 3rd to 5th Floors: 2 Corporate Offices per floor (Office 1: 913.86 & Office 2: 980.60 Sq. Ft. RERA Carpet)\n• Highlights: High footfall corridor, perimeter glass glazing, dedicated elevator, and ample parking.\n\nWould you like floor plans, or to connect on WhatsApp?',
          projectId: proj?.id,
          nextStep: 'details',
          nextProject: proj,
        };
      }

      if (q.includes('anandshree') || q.includes('anand')) {
        const proj = projectsData.find((p) => p.id === 'anandshree-chs');
        return {
          replyText:
            'Anandshree CHS (Plot no 40, Sri Ashok Pawar Path, Walvekar Nagar, Parvati Paytha, Pune 411009):\n\n• Configuration: 15 completed 2 & 3 BHK family residences (906 & 1225 sq. ft. RERA carpet).\n• Status: Completed & delivered residential project (100% Occupancy Certificate granted).\n• Total Area: 20,000 sq. ft. across P + 5 floors.\n• Key Highlights: High structural quality, modern fixtures, and successful society conveyance.\n\nWould you like floor plans or to connect on WhatsApp?',
          projectId: proj?.id,
          nextStep: 'details',
          nextProject: proj,
        };
      }

      return {
        replyText:
          'Walvekar Nagar / Parvati, Pune:\nA thriving central zone where Citadel Group has delivered and is currently developing landmark residential and commercial schemes.\n\nProjects in this location:\n1. Friends CHS — Ongoing 2 & 3 BHK residential redevelopment (Walvekar Path, RERA: P52100078109)\n2. Manisha CHS — Ongoing palatial 5 BHK single-floor sky residences (Parvati Paytha)\n3. Walvekar Commercials — Completed commercial centre (High-street retail & corporate offices)\n4. Anandshree CHS — Completed 2 & 3 BHK residences (100% OC issued, Sri Ashok Pawar Path)\n5. Jai Rajkiran CHS — Delivered P+14 storey landmark tower (100% OC issued)\n\nWhich project would you like to explore?',
        nextStep: 'projects',
        nextLocation: 'walvekar',
      };
    }

    if (q.includes('all pune') || (q.includes('all') && q.includes('location'))) {
      return {
        replyText:
          'Citadel Group has prestigious developments across prime Pune locations:\n\n• Prabhat Road: 96 Prabhat (3 & 4.5 BHK Luxury Residences)\n• Law College Road: Janki Shreyas CHS (2, 3 & 4 BHK Luxury Residences)\n• Walvekar Nagar / Parvati:\n  - Friends CHS (2 & 3 BHK Ongoing Redevelopment)\n  - Manisha CHS (5 BHK Sky Residences in Parvati)\n  - Walvekar Commercials (Completed Retail & Corporate Offices)\n  - Anandshree CHS (Completed 2 & 3 BHK, 100% OC)\n  - Jai Rajkiran CHS (Completed P+14 Tower, 100% OC)\n\nWhich location or project would you like to explore?',
        nextStep: 'projects',
        nextLocation: 'all',
      };
    }

    // Step 2: Specific Project detections -> advance to details
    if (q.includes('96 prabhat') || q.includes('prabhat 96') || q.includes('96')) {
      const proj = projectsData.find((p) => p.id === '96-prabhat');
      return {
        replyText:
          '96 Prabhat (Lane 2, Prabhat Road, Erandwane, Pune 411004):\n\n• Configurations: Ultra-luxury 3 & 4.5 BHK Master Suites (up to 2,080 sq. ft. RERA carpet).\n• Total Development: 60,000 sq. ft. across P + 11 floors.\n• Status: Upcoming luxury residential address.\n• Key Highlights: Heritage lane, Nal Stop Metro access, 14th-floor recreational area with gym/yoga/hall, Italian marble finishes, automated elevators, acoustic glazing, and only 2 residences per floor.\n\nWould you like floor plans, amenities, or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('janki') || q.includes('shreyas')) {
      const proj = projectsData.find((p) => p.id === 'janki-shreyas-chs');
      return {
        replyText:
          'Janki Shreyas CHS (Law College Road, Near Abhinav School, Pune 411038):\n\n• Configurations: Contemporary 2, 3 & 4 BHK luxury residences (881 to 1530 sq. ft. RERA carpet).\n• Status: Ongoing landmark residential project (RERA: PR1260002601082).\n• Key Highlights: Vaastu-compliant layouts, earthquake-resistant RCC frame, high-speed elevators, rooftop lifestyle spaces, and Nal Stop Metro within 100m.\n\nWould you like floor plans, possession status, or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('friends')) {
      const proj = projectsData.find((p) => p.id === 'friends-chs');
      return {
        replyText:
          'Friends CHS (25, Late Vishwas Balaji Walvekar Path, Walvekar Nagar, Pune 411009):\n\n• Configurations: 35 premium 2 & 3 BHK residences (932 & 1270 sq. ft. RERA carpet).\n• Total Development: 60,000 sq. ft. across Ground + 7 floors.\n• Status: Ongoing redevelopment project (RERA: P52100078109).\n• Key Highlights: 8th floor slab casted, brickwork & plaster done till 6th slab, pit puzzle parking, KONE/OTIS lifts, Jaquar/Kerovit fittings, 1 sit-out for 2 & 3 BHK, and 100% Vaastu-compliant design.\n\nWould you like floor plans or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('manisha')) {
      const proj = projectsData.find((p) => p.id === 'manisha-chs');
      return {
        replyText:
          'Manisha CHS (16, Shiv Darshan Rd, Sant Nagar, Parvati Paytha, Pune 411009):\n\n• Configurations: Sprawling 5 BHK single-floor residences (2,344.40 sq. ft. RERA carpet area).\n• Status: Ongoing redevelopment (P + 7 floors).\n• Key Highlights: Single residence per floor with private elevator lobby, 2 open-air sit-out balconies, family lounge, pooja room, and 100% Vaastu-compliant architecture.\n\nWould you like floor plans, amenities, or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('walvekar commercial') || q.includes('commercial')) {
      const proj = projectsData.find((p) => p.id === 'walvekar-commercial');
      return {
        replyText:
          'Walvekar Commercials (Walvekar Nagar, Parvati Paytha, Pune 411009):\n\n• Status: Completed & operational commercial centre (20,000 sq. ft., P + 5 floors).\n• 1st Floor Retail: 1,905.22 Sq. Ft. RERA Carpet (Single grand anchor showroom with road-facing glass facade)\n• 2nd Floor Corporate Office: 1,905.22 Sq. Ft. RERA Carpet (Full continuous floor plate)\n• 3rd to 5th Floors: 2 Offices per floor (Office 1: 913.86 & Office 2: 980.60 Sq. Ft. RERA Carpet each)\n• Key Highlights: High street retail visibility, dedicated commercial elevators, and ample parking.\n\nWould you like layout plans or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('anandshree') || q.includes('anand')) {
      const proj = projectsData.find((p) => p.id === 'anandshree-chs');
      return {
        replyText:
          'Anandshree CHS (Plot no 40, Sri Ashok Pawar Path, Walvekar Nagar, Parvati Paytha, Pune 411009):\n\n• Configurations: 15 completed 2 & 3 BHK family residences (906 & 1225 sq. ft. RERA carpet).\n• Status: Completed & delivered project (100% Occupancy Certificate granted).\n• Total Development: 20,000 sq. ft. across P + 5 floors.\n• Key Highlights: Earthquake-resistant RCC design, modern CP fittings, and completed society handover.\n\nWould you like floor plans or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    if (q.includes('rajkiran') || q.includes('jai rajkiran')) {
      const proj = projectsData.find((p) => p.id === 'jai-rajkiran-chs');
      return {
        replyText:
          'Jai Rajkiran CHS (43, Sri Ashok Pawar Path, Walvekar Nagar, Parvati Paytha, Pune 411009):\n\n• Configurations: 43 delivered luxury residences in 3 & 4 BHK layouts (906 to 1520 sq. ft. RERA carpet).\n• Status: Completed & delivered landmark (100% Occupancy Certificate granted).\n• Total Development: 70,000 sq. ft. across P + 14 floors.\n• Key Highlights: Automated pit car parking system, solar water heating, and 100% occupied.\n\nWould you like floor plans or to connect on WhatsApp?',
        projectId: proj?.id,
        nextStep: 'details',
        nextProject: proj,
      };
    }

    // Step 3: Project Details (Floor plans, amenities, possession) -> advance to connect
    if (q.includes('floor plan') || q.includes('carpet') || q.includes('area') || q.includes('layout')) {
      if (currentSelectedProject?.id === 'walvekar-commercial' || q.includes('commercial')) {
        return {
          replyText:
            'Walvekar Commercials (Walvekar Nagar) Floor Layouts:\n• 1st Floor: 1 Retail Shop with 1905.22 Sq. Ft. RERA Carpet Area\n• 2nd Floor: 1 Corporate Office with 1905.22 Sq. Ft. RERA Carpet Area\n• 3rd to 5th Floors: 2 Offices per floor (Office 1: 913.86 Sq. Ft. & Office 2: 980.60 Sq. Ft. RERA Carpet)\n\nFull architectural drawings are available. Would you like to connect on WhatsApp to receive the complete floor plate PDF dossier?',
          showConnectCard: true,
          nextStep: 'connect',
        };
      }
      if (currentSelectedProject?.id === 'janki-shreyas-chs' || q.includes('janki') || q.includes('shreyas')) {
        return {
          replyText:
            'Janki Shreyas CHS (Law College Road) Floor Plans:\n• 2 BHK Premium: 881.36 Sq. Ft. RERA Carpet (Living lounge with balcony, master suite, utility kitchen)\n• 3 BHK Luxury: 1149.60 Sq. Ft. RERA Carpet (Passage, 3 full bedrooms, dual balconies)\n• 4 BHK Ultra Luxury: 1530.00 Sq. Ft. RERA Carpet (Palatial living-dining hall, 4 ensuite bedrooms, 3-side open ventilation)\n\nAll layouts are 100% Vaastu-compliant with zero dead space.',
          showConnectCard: true,
          nextStep: 'connect',
        };
      }
      if (currentSelectedProject?.id === 'friends-chs' || q.includes('friends')) {
        return {
          replyText:
            'Friends CHS (Walvekar Nagar) Floor Plans:\n• 2 BHK Elegance: 932 Sq. Ft. RERA Carpet (Living lounge, sit-out balcony, master suite)\n• 3 BHK Comfort: 1270 Sq. Ft. RERA Carpet (Expansive living suite, 3 bedrooms, sit-out balcony)\n\n100% Vaastu-compliant layouts designed with optimal cross-ventilation and zero space wastage.',
          showConnectCard: true,
          nextStep: 'connect',
        };
      }
      if (currentSelectedProject?.id === 'manisha-chs' || q.includes('manisha')) {
        return {
          replyText:
            'Manisha CHS (Parvati Paytha) Floor Plans:\n• 5 BHK Residence: 2,344.40 Sq. Ft. RERA Carpet (Private elevator lobby, 2 sit-out balconies, family lounge, pooja room)\n\nSingle residence per floor for supreme privacy and 100% Vaastu compliance.',
          showConnectCard: true,
          nextStep: 'connect',
        };
      }
      if (currentSelectedProject?.id === 'anandshree-chs' || q.includes('anandshree') || q.includes('anand')) {
        return {
          replyText:
            'Anandshree CHS (Walvekar Nagar) Floor Plans:\n• 2 BHK Smart: 906 Sq. Ft. RERA Carpet (Spacious living lounge, master bedroom suite, utility kitchen)\n• 3 BHK Luxury: 1225 Sq. Ft. RERA Carpet (Expansive living/dining hall, sit-out balcony, designer bathrooms)\n\n100% Vaastu-compliant completed residences with full OC.',
          showConnectCard: true,
          nextStep: 'connect',
        };
      }
      if (currentSelectedProject?.id === '96-prabhat' || q.includes('prabhat') || q.includes('96')) {
        return {
          replyText:
            '96 Prabhat (Prabhat Road, Lane 2) Floor Plans:\n• 3 & 4.5 BHK Master Suites: Up to 2080 Sq. Ft. RERA Carpet\n• Only two residences per floor with private elevator foyer, grand living salon, and open sit-out balconies overlooking tree-lined Prabhat Road.',
          showConnectCard: true,
          nextStep: 'connect',
        };
      }
      return {
        replyText:
          'Citadel Group floor plans are engineered with zero dead circulation space:\n• Law College Road: 2, 3 & 4 BHK at Janki Shreyas CHS (881 to 1530 Sq. Ft. RERA Carpet)\n• Prabhat Road (Lane 2): 3 & 4.5 BHK at 96 Prabhat (Up to 2080 Sq. Ft. RERA Carpet)\n• Walvekar Nagar / Parvati: 2 & 3 BHK at Friends CHS (932 & 1270 Sq. Ft. RERA Carpet), 5 BHK at Manisha CHS (2344.4 Sq. Ft. RERA Carpet), 2 & 3 BHK at Anandshree CHS (906 & 1225 Sq. Ft. RERA Carpet), and Grade-A Retail/Offices at Walvekar Commercials.\n\nShall I connect you with our advisory desk on WhatsApp to receive the complete CAD drawings dossier?',
        showConnectCard: true,
        nextStep: 'connect',
      };
    }

    if (q.includes('possession') || q.includes('timeline') || q.includes('status') || q.includes('oc')) {
      return {
        replyText:
          'Citadel Group Project Status & Timelines:\n\n• Ongoing Developments:\n  - Janki Shreyas CHS (Law College Road): Active construction (RERA: PR1260002601082)\n  - Friends CHS (Walvekar Nagar): Superstructure underway (RERA: P52100078109)\n  - Manisha CHS (Parvati Paytha): P+7 RCC framework in progress\n\n• Upcoming Projects:\n  - 96 Prabhat (Prabhat Road, Lane 2): Upcoming luxury landmark (60,000 sq. ft.)\n\n• Completed Landmarks (100% OC Delivered):\n  - Walvekar Commercials (Walvekar Nagar): Fully operational commercial complex\n  - Anandshree CHS (Walvekar Nagar): Successfully handed over with complete OC\n  - Jai Rajkiran CHS (Walvekar Nagar): Delivered 14-storey tower with complete OC (43 residences)\n\nWould you like to connect on WhatsApp for latest progress photos, cost sheets, or site visits?',
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
        `Thank you for asking about "${userQuery}". Citadel Group develops landmark luxury residences and commercial spaces in Pune across Prabhat Road, Law College Road, and Walvekar Nagar / Parvati.\n\nWould you like to connect with our advisory desk on WhatsApp (+91 87799 75270) for detailed information?`,
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
      `INQUIRY VIA WEBSITE CHATBOT - CITADEL GROUP`,
      `----------------------------------------`,
      `Name: ${userName.trim() || 'Website Visitor'}`,
      userPhone.trim() ? `Phone: ${userPhone.trim()}` : null,
      `Inquiry Focus: ${projectSummary}`,
      userQuestions.length > 0 ? `Topics Discussed:\n${userQuestions.map((q) => `- "${q}"`).join('\n')}` : null,
      `----------------------------------------`,
      `Connected via Citadel Web Concierge to +91 87799 75270`,
    ]
      .filter(Boolean)
      .join('\n');

    // Asynchronously log to Google Sheets webhook & notify dual inboxes
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
            title="Chat with Citadel Group on WhatsApp (+91 87799 75270)"
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
                        Send this conversation directly to our senior advisory desk (+91 87799 75270):
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
