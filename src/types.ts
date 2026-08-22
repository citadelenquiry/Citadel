export type Page = 'home' | 'projects' | 'about' | 'contact' | 'calculator';
export type ProjectStage = 'Ongoing' | 'Completed' | 'Upcoming';
export type ProjectsViewMode = 'hub' | 'stage' | 'detail';

export interface ProjectLiveUpdate {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  stage: string;
}

export interface FloorPlanImage {
  url: string;
  title: string;
  badge?: string;
  description?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  type: string;
  areaSqFt: number;
  carpetAreaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  image: string;
  images?: FloorPlanImage[];
  highlights: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: 'Residential' | 'Commercial' | 'Redevelopment';
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  location: string;
  fullAddress: string;
  areaSqFt: string;
  floors: string;
  unitsCount: string;
  reraNumber: string;
  heroImage: string;
  gallery: string[];
  overviewText: string;
  detailedDescription: string;
  mapEmbedQuery: string;
  mapAddressDisplay: string;
  liveUpdates: ProjectLiveUpdate[];
  floorPlans: FloorPlan[];
  amenities: {
    icon: string;
    title: string;
    description: string;
  }[];
  specifications: {
    category: string;
    items: string[];
  }[];
}

export interface EnquiryFormData {
  fullName: string;
  email: string;
  phone: string;
  projectId?: string;
  unitType?: string;
  budget?: string;
  message?: string;
  preferredContactMethod?: 'call' | 'whatsapp' | 'email';
  isRedevelopmentEnquiry?: boolean;
}
