export interface TeamMember {
  name: string;
  role: string;
  category: 'partner' | 'associate';
  experienceYears: number;
  qualifications: string;
  initials: string;
  responsibilities: string[];
  photo?: string;
}

export interface AssociatePartner {
  name: string;
  domain: string;
  experienceYears: number;
  trackRecord: string;
  description: string;
}

export const companyProfileData = {
  name: 'Citadel Group',
  tagline: 'Development & Redevelopment Specialists',
  establishedExperience: 'Over 10+ Years of Specialized Experience',
  locations: ['Pune'],
  headOffice: {
    title: 'Pune Office',
    address: 'Swapnapurti Apartments, Apt 2, 35/13+14C, Opp Hotel President, Prabhat Road, Lane 8, Erandwane, Pune – 411 004',
    phone: '+91 8779975270',
    whatsappPhone: '+91 87799 75270',
    email: 'enquiry@thecitadelgroup.co',
    corporateEmail: 'enquiry@thecitadelgroup.co',
    salesEmail: 'enquiry@thecitadelgroup.co',
    timings: 'Monday - Saturday: 9:30 AM - 6:30 PM',
  },
  stats: {
    puneDevelopedSqFt: '1,65,000+',
    puneOngoingSqFt: '2,10,000+',
    upcomingSqFt: '4,00,000+',
    yearsExperience: '10+',
    onTimeDelivery: '100%',
  },
  missionStatements: [
    {
      title: 'Highest Standards of Excellence',
      description: 'To offer exceptional spaces that meet the highest standards to our clients.',
    },
    {
      title: 'Outstanding Creations',
      description: 'To support our customers in achieving their dreams by providing them with outstanding creations in construction and civil engineering.',
    },
    {
      title: 'Diligence, Integrity & Efficiency',
      description: 'To ensure customer satisfaction by committing to diligence, integrity, and efficiency in all our endeavours.',
    },
  ],
  partners: [
    {
      name: 'Nikhil Mahajani',
      role: 'Partner',
      category: 'partner' as const,
      experienceYears: 22,
      qualifications: 'Bachelor of Engineering (B.E.)',
      initials: 'NM',
      photo: '/partners/nikhil-mahajani.jpeg',
      responsibilities: [
        'Technical guidance and overall project management',
        'Construction & time management',
        'Review design, drawings and specifications',
        'Ensure projects meet budget and schedule requirements',
        'Liaise with local authorities, architects, structural engineers, and site supervisors',
        'Provide technical support and resolve on-site issues',
      ],
    },
    {
      name: 'Suvarna Mahajani',
      role: 'Partner',
      category: 'partner' as const,
      experienceYears: 11,
      qualifications: 'Partner',
      initials: 'SM',
      photo: '/partners/suvarna-mahajani.jpeg',
      responsibilities: [
        'Understand design requirements from flat holders',
        'Suggest changes, additions, and alterations',
        'Ensure proper functioning of facilities & office operations',
        'Maintain and manage project documentation and records',
        'Act as a point of contact between clients, vendors, and team members',
      ],
    },
    {
      name: 'Rahul Shah',
      role: 'Associate Partner',
      category: 'associate' as const,
      experienceYears: 30,
      qualifications: 'Bachelor of Engineering (B.E.)',
      initials: 'RS',
      photo: '/partners/rahul-shah.jpeg',
      responsibilities: [
        'Project development with a focus on quality',
        'Manage public relations and stakeholder relationships',
        'Lead procurement and vendor management',
        'Ensuring efficient management for timely delivery of projects',
        'Contributing to business development and Market Expansion',
      ],
    },
    {
      name: 'Chintan Chheda',
      role: 'Associate Partner',
      category: 'associate' as const,
      experienceYears: 12,
      qualifications: 'B.Com, MBA (Marketing)',
      initials: 'CC',
      photo: '/partners/chintan-chheda.png',
      responsibilities: [
        'Sales and Business Development',
        'Understanding Client Budgets, Expectations and Project Objectives',
        'Assessing the commercial and practical feasibility of potential projects',
        'Contributing to project concepts, positioning, planning, and development strategy',
        'Evaluating location, demand, competition, pricing, project marketing & branding and overall market potential',
      ],
    },
    {
      name: 'Rohan Sathe',
      role: 'Associate Partner',
      category: 'associate' as const,
      experienceYears: 20,
      qualifications: 'B.E. Mechanical Engineering, Class I Marine Engineer',
      initials: 'RS',
      photo: '/partners/rohan-sathe.jpeg',
      responsibilities: [
        'End-to-end project execution and timely delivery of the entire project as per agreed specifications',
        'Vendor and contractor evaluation, techno-commercial bid analysis and shortlisting',
        'Project budgeting, procurement and cost control',
        'Liaison with flat owners to understand requirements and coordinate feasible customisations',
        'Coordination with structural, MEP, architectural and other consultants on design, technical and execution matters',
        'Monitoring of construction progress and quality, and coordination among contractors, vendors, consultants and site teams',
      ],
    },
    {
      name: 'CA Shyam Davawala',
      role: 'Associate Partner',
      category: 'associate' as const,
      experienceYears: 28,
      qualifications: 'Chartered Accountant',
      initials: 'SD',
      photo: '/partners/shyam-davawala.jpeg',
      responsibilities: [
        "Leadership of the firm's Finance, Accounts and Management Consultancy functions",
        'Corporate finance, taxation and strategic business advisory across the group',
        'Oversight of accounting, audit, taxation and financial reporting functions',
        'Advisory on FEMA, cross-border transactions and regulatory matters',
        'Strategic financial planning, business analysis and management consultancy',
        'Technology and ERP advisory for improving financial and business processes',
        "Active involvement in the firm's construction and allied activities, including financial, commercial and management coordination",
      ],
    },
  ] as TeamMember[],
  associates: [
    {
      name: 'Masterstroke Architects',
      domain: 'Consulting Architect',
      experienceYears: 40,
      trackRecord: '25,00,000+ sq. ft. completed',
      description: '40 years of architectural practice with over 25 lakh sq. ft. developed.',
    },
    {
      name: 'Joshi-Watve Structural Consultants',
      domain: 'Structural Consultant',
      experienceYears: 50,
      trackRecord: '1,00,00,000+ sq. ft. completed',
      description: '50 years of structural engineering practice with over 1 crore sq. ft. developed.',
    },
  ] as AssociatePartner[],
};
