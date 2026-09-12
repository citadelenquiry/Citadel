import React, { useState, useEffect, useMemo } from 'react';
import { Project, Page, ProjectStage, ProjectsViewMode } from '../types';
import { projectsData } from '../data/projectsData';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  Calendar,
  Layers,
  Building,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDownRight,
  ArrowRight,
  FileCheck,
  Lock,
  Eye,
  ShieldCheck,
  Award,
  PhoneCall,
  HardHat,
  Maximize2,
  ZoomIn,
  X,
} from 'lucide-react';
import { BrochureModal } from '../components/BrochureModal';

interface ProjectsPageProps {
  selectedProjectId: string;
  selectedStage: ProjectStage | null;
  viewMode: ProjectsViewMode;
  onSelectProject: (id: string) => void;
  onSelectStage: (stage: ProjectStage) => void;
  setViewMode: (mode: ProjectsViewMode) => void;
  onOpenEnquiry: (projectId?: string) => void;
  setCurrentPage: (page: Page) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  selectedProjectId,
  selectedStage,
  viewMode,
  onSelectProject,
  onSelectStage,
  setViewMode,
  onOpenEnquiry,
  setCurrentPage,
}) => {
  // Current active project
  const currentProject =
    projectsData.find((p) => p.id === selectedProjectId) || projectsData[0];

  // Slideshow state for the Hub view
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Detail view states
  const [activeFloorPlanIndex, setActiveFloorPlanIndex] = useState(0);
  const [activeFloorPlanImageIndex, setActiveFloorPlanImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; badge?: string } | null>(null);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);

  // Active floor plan & multi-view image gallery
  const activeFloorPlan = currentProject.floorPlans[activeFloorPlanIndex] || currentProject.floorPlans[0];
  const activeFloorPlanImages = useMemo(() => {
    if (!activeFloorPlan) return [];
    if (activeFloorPlan.images && activeFloorPlan.images.length > 0) {
      return activeFloorPlan.images;
    }
    return [
      {
        url: activeFloorPlan.image,
        title: activeFloorPlan.name,
        badge: '2D Architectural Blueprint',
        description: 'Detailed floor plate & dimension layout',
      },
    ];
  }, [activeFloorPlan]);

  const currentActiveImage =
    activeFloorPlanImages[activeFloorPlanImageIndex] ||
    activeFloorPlanImages[0] || {
      url: activeFloorPlan?.image || '',
      title: activeFloorPlan?.name || '',
      badge: '2D Architectural Blueprint',
    };

  const handleSelectFloorPlan = (idx: number) => {
    setActiveFloorPlanIndex(idx);
    setActiveFloorPlanImageIndex(0);
  };
  const [brochureModalMode, setBrochureModalMode] = useState<'brochure' | 'floorplans'>('brochure');
  const [liveUpdateSlideIndex, setLiveUpdateSlideIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(true);

  // Check lead unlock state
  useEffect(() => {
    try {
      const unlocked = sessionStorage.getItem('citadel_lead_unlocked') === 'true';
      if (unlocked) {
        setIsUnlocked(true);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Auto-advance slideshow on Hub view
  useEffect(() => {
    if (viewMode !== 'hub' || !isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % projectsData.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [viewMode, isAutoPlay]);

  const handleUnlockSession = () => {
    setIsUnlocked(true);
    try {
      sessionStorage.setItem('citadel_lead_unlocked', 'true');
    } catch {
      // ignore
    }
  };

  const handleBrochureClick = (projectToDownload: Project = currentProject) => {
    if (isUnlocked) {
      try {
        const brochureContent = `=====================================================
CITADEL REAL ESTATE & REDEVELOPMENT
Official Project Dossier & Floor Plans
=====================================================

Project Name: ${projectToDownload.title}
Tagline: ${projectToDownload.tagline}
Category: ${projectToDownload.category} (${projectToDownload.status})
Location: ${projectToDownload.location}
Address: ${projectToDownload.fullAddress}
Total Area: ${projectToDownload.areaSqFt} | Structure: ${projectToDownload.floors}

-----------------------------------------------------
ARCHITECTURAL OVERVIEW
-----------------------------------------------------
${projectToDownload.overviewText}

${projectToDownload.detailedDescription}

-----------------------------------------------------
FLOOR PLANS & CONFIGURATIONS
-----------------------------------------------------
${projectToDownload.floorPlans.map((fp, i) => `
[Layout ${i + 1}] ${fp.name} (${fp.type})
${[2, 3, 4].includes(fp.bedrooms) ? '• Carpet & Built-Up Area: Available on Request' : `• Built-Up Area: ${fp.areaSqFt} sq. ft.\n• Carpet Area: ${fp.carpetAreaSqFt} sq. ft.`}
• Configuration: ${fp.bedrooms} BHK | ${fp.bathrooms} Baths | ${fp.balconies} Balconies
• Highlights:
${fp.highlights.map(h => `  - ${h}`).join('\n')}
`).join('\n')}

-----------------------------------------------------
KEY AMENITIES
-----------------------------------------------------
${projectToDownload.amenities.map(a => `• ${a.title}: ${a.description}`).join('\n')}

${projectToDownload.specifications && projectToDownload.specifications.length > 0 ? `
-----------------------------------------------------
QUALITY STANDARDS & SPECIFICATIONS
-----------------------------------------------------
${projectToDownload.specifications.map(s => `[${s.category}]\n${s.items.map(it => `  • ${it}`).join('\n')}`).join('\n\n')}
` : ''}
-----------------------------------------------------
ENQUIRY & SALES DESK
-----------------------------------------------------
Citadel Group, Erandwane, Near Nal Stop Metro Station, Pune
Phone: +91 8779975270
Email: enquiry@thecitadelgroup.co
Website: https://thecitadelgroup.co
=====================================================`;

        const blob = new Blob([brochureContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectToDownload.slug}-official-dossier.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        // fallback
      }
    }
    setBrochureModalMode('brochure');
    setIsBrochureOpen(true);
  };

  const handleOpenFloorPlanUnlock = () => {
    setBrochureModalMode('floorplans');
    setIsBrochureOpen(true);
  };

  // Filter projects by stage
  const ongoingProjects = useMemo(() => projectsData.filter((p) => p.status === 'Ongoing'), []);
  const completedProjects = useMemo(() => projectsData.filter((p) => p.status === 'Completed'), []);
  const upcomingProjects = useMemo(() => projectsData.filter((p) => p.status === 'Upcoming'), []);

  const stageFilteredProjects = useMemo(() => {
    if (!selectedStage) return projectsData;
    return projectsData.filter((p) => p.status === selectedStage);
  }, [selectedStage]);

  // Active slideshow project
  const slideProject = projectsData[currentSlideIndex] || projectsData[0];

  // Live updates sliding pagination
  const totalUpdates = currentProject.liveUpdates.length;
  const maxSlideIndex = Math.max(0, totalUpdates - 4);

  const nextLiveUpdateSlide = () => {
    setLiveUpdateSlideIndex((prev) => Math.min(maxSlideIndex, prev + 1));
  };

  const prevLiveUpdateSlide = () => {
    setLiveUpdateSlideIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div id="projects-page-container" className="pt-14 sm:pt-16 bg-[#F8F6F3]">
      {/* =========================================================================
          VIEW 1: PROJECTS HUB (Slideshow of all projects on top + Explore Developments)
          ========================================================================= */}
      {viewMode === 'hub' && (
        <div id="projects-hub-view" className="animate-in fade-in duration-300">
          {/* 1. TOP CINEMATIC SLIDESHOW OF ALL PROJECTS */}
          <section
            id="projects-slideshow-section"
            className="relative bg-[#1E1D1B] text-white overflow-hidden min-h-[70vh] sm:min-h-[78vh] flex items-end"
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          >
            {/* Background Slides */}
            {projectsData.map((project, idx) => (
              <div
                key={project.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={project.heroImage}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-7000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/45 to-[#141312]/20" />
              </div>
            ))}

            {/* Slide Content Box */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                {/* Left Slide Info */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="bg-[#E8C2AF] text-[#1E1D1B] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                      {slideProject.status} Project
                    </span>
                    <span className="bg-white/15 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/20">
                      {slideProject.category}
                    </span>
                  </div>

                  <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.06]">
                    {slideProject.title}
                  </h1>

                  <p className="text-sm sm:text-lg text-[#E6E1DC] font-light max-w-2xl leading-relaxed">
                    {slideProject.tagline} • <span className="text-[#E8C2AF]">{slideProject.location}</span>
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-white border border-white/15">
                      <Building className="w-3.5 h-3.5 text-[#E8C2AF]" />
                      <span>{slideProject.floors}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-white border border-white/15">
                      <Layers className="w-3.5 h-3.5 text-[#E8C2AF]" />
                      <span>{slideProject.areaSqFt}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-white border border-white/15">
                      <MapPin className="w-3.5 h-3.5 text-[#E8C2AF]" />
                      <span>{slideProject.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-wrap items-center gap-3.5">
                    <button
                      id={`slide-view-details-${slideProject.id}`}
                      onClick={() => {
                        onSelectProject(slideProject.id);
                        setViewMode('detail');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-lg transition-colors cursor-pointer"
                    >
                      <span>VIEW PROJECT DETAILS</span>
                      <ArrowRight className="w-4 h-4 text-[#1E1D1B]" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectStage(slideProject.status);
                        setViewMode('stage');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full border border-white/25 transition-colors cursor-pointer backdrop-blur-xs"
                    >
                      <span>EXPLORE {slideProject.status.toUpperCase()} PROJECTS</span>
                      <ArrowDownRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Right Slide Controls & Thumbnails */}
                <div className="lg:col-span-4 flex flex-col lg:items-end justify-between space-y-6">
                  {/* Slide Counter & Arrow Controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tracking-widest text-[#B8B2AA]">
                      0{currentSlideIndex + 1} / 0{projectsData.length}
                    </span>
                    <button
                      aria-label="Previous Project Slide"
                      onClick={() =>
                        setCurrentSlideIndex((prev) =>
                          prev === 0 ? projectsData.length - 1 : prev - 1
                        )
                      }
                      className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Next Project Slide"
                      onClick={() =>
                        setCurrentSlideIndex((prev) => (prev + 1) % projectsData.length)
                      }
                      className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
                    {projectsData.map((project, idx) => (
                      <button
                        key={project.id}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`group relative rounded-lg overflow-hidden h-14 border transition-all cursor-pointer ${
                          idx === currentSlideIndex
                            ? 'border-[#E8C2AF] ring-2 ring-[#E8C2AF]/40'
                            : 'border-white/20 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={project.heroImage}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                        <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white truncate max-w-[90%] block">
                          0{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. EXPLORE DEVELOPMENTS / BROWSE BY CONSTRUCTION STAGE */}
          <section id="explore-developments-section" className="py-20 sm:py-24 bg-[#F8F6F3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A563D] block">
                  EXPLORE DEVELOPMENTS
                </span>
                <h2 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1E1D1B]">
                  Browse By Construction Stage
                </h2>
                <p className="text-sm sm:text-base text-[#6E6A65] leading-relaxed">
                  Select a stage to view dedicated developments, live site updates, and architectural floor plans.
                </p>
              </div>

              {/* 3 Stage Discovery Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1. Ongoing Projects */}
                <div
                  id="stage-card-ongoing"
                  onClick={() => {
                    onSelectStage('Ongoing');
                    setViewMode('stage');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-3xl p-8 border border-[#E6E1DC] shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF1EC] text-[#A05C3B] flex items-center justify-center shadow-xs">
                        <HardHat className="w-6 h-6" />
                      </div>
                      <span className="bg-[#FAF1EC] text-[#A05C3B] text-xs font-bold uppercase px-3.5 py-1 rounded-full border border-[#F3DFD5]">
                        {ongoingProjects.length} Active
                      </span>
                    </div>

                    <div>
                      <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1D1B] group-hover:text-[#A05C3B] transition-colors">
                        Ongoing Projects
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B6661] mt-2.5 leading-relaxed">
                        Prime luxury residences and Grade-A workspaces currently under active execution across Pune.
                      </p>
                    </div>

                    <div className="pt-2 space-y-2 border-t border-[#F2ECE6]">
                      <div className="flex items-center gap-2 text-xs text-[#5C5752]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A05C3B] shrink-0" />
                        <span>Live on-site construction milestone tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5C5752]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A05C3B] shrink-0" />
                        <span>Sample flat walkthroughs & floor layout options</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#F0EBE6] flex items-center justify-between text-xs font-bold text-[#A05C3B]">
                    <span>Explore Ongoing Projects</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

                {/* 2. Completed Projects */}
                <div
                  id="stage-card-completed"
                  onClick={() => {
                    onSelectStage('Completed');
                    setViewMode('stage');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-3xl p-8 border border-[#E6E1DC] shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0EFEA] text-[#5A5550] flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <span className="bg-[#F0EFEA] text-[#5A5550] text-xs font-bold uppercase px-3.5 py-1 rounded-full border border-[#E2DFD8]">
                        {completedProjects.length} Delivered
                      </span>
                    </div>

                    <div>
                      <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1D1B] group-hover:text-[#8A563D] transition-colors">
                        Completed Projects
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B6661] mt-2.5 leading-relaxed">
                        Iconic finished residential towers delivered with 100% Occupancy Certificates and complete society handover.
                      </p>
                    </div>

                    <div className="pt-2 space-y-2 border-t border-[#F2ECE6]">
                      <div className="flex items-center gap-2 text-xs text-[#5C5752]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8A563D] shrink-0" />
                        <span>Ready-to-move luxury apartments</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5C5752]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8A563D] shrink-0" />
                        <span>100% OC issued & society handover complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#F0EBE6] flex items-center justify-between text-xs font-bold text-[#8A563D]">
                    <span>Explore Completed Projects</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

                {/* 3. Upcoming Projects */}
                <div
                  id="stage-card-upcoming"
                  onClick={() => {
                    onSelectStage('Upcoming');
                    setViewMode('stage');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-3xl p-8 border border-[#E6E1DC] shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF4EE] text-[#8A563D] flex items-center justify-center shadow-xs">
                        <Clock className="w-6 h-6" />
                      </div>
                      <span className="bg-[#FAF4EE] text-[#8A563D] text-xs font-bold uppercase px-3.5 py-1 rounded-full border border-[#F0E3D8]">
                        {upcomingProjects.length} Planned
                      </span>
                    </div>

                    <div>
                      <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1D1B] group-hover:text-[#8A563D] transition-colors">
                        Upcoming Projects
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B6661] mt-2.5 leading-relaxed">
                        Next-generation architectural masterplans, society redevelopments, and future commercial landmarks.
                      </p>
                    </div>

                    <div className="pt-2 space-y-2 border-t border-[#F2ECE6]">
                      <div className="flex items-center gap-2 text-xs text-[#5C5752]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8A563D] shrink-0" />
                        <span>Pre-launch priority booking & bespoke layouts</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5C5752]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8A563D] shrink-0" />
                        <span>Prime central Pune pin-code addresses</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#F0EBE6] flex items-center justify-between text-xs font-bold text-[#8A563D]">
                    <span>Explore Upcoming Projects</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: STAGE PORTFOLIO VIEW (Portfolio of Excellence for selected stage)
          ========================================================================= */}
      {viewMode === 'stage' && (
        <div id="stage-portfolio-view" className="animate-in fade-in duration-300">
          {/* Header & Stage Switcher */}
          <section className="py-12 sm:py-16 bg-[#1E1D1B] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back to Hub Breadcrumb */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setViewMode('hub');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#E8C2AF] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Explore Developments</span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block">
                    PORTFOLIO OF EXCELLENCE
                  </span>
                  <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
                    {selectedStage ? `${selectedStage} Projects` : 'All Developments'}
                  </h1>
                  <p className="text-sm text-[#DDD6CE] max-w-xl">
                    {selectedStage === 'Ongoing' &&
                      'Explore our active residential and commercial developments under execution across Pune.'}
                    {selectedStage === 'Completed' &&
                      'Explore our delivered landmark residential towers with 100% Occupancy Certificates.'}
                    {selectedStage === 'Upcoming' &&
                      'Explore upcoming architectural masterplans and pre-launch luxury redevelopments.'}
                    {!selectedStage && 'Explore all signature developments across Pune.'}
                  </p>
                </div>

                {/* Stage Filter Switcher Tabs */}
                <div className="flex flex-wrap items-center gap-2 bg-white/10 p-1.5 rounded-full border border-white/15">
                  {(['Ongoing', 'Completed', 'Upcoming'] as const).map((stg) => (
                    <button
                      key={stg}
                      onClick={() => onSelectStage(stg)}
                      className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
                        selectedStage === stg
                          ? 'bg-[#E8C2AF] text-[#1E1D1B] shadow-xs'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {stg} Projects
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Project Grid for this stage */}
          <section className="py-16 sm:py-20 bg-[#F8F6F3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stageFilteredProjects.map((project) => (
                  <div
                    key={project.id}
                    id={`stage-project-card-${project.id}`}
                    onClick={() => {
                      onSelectProject(project.id);
                      setViewMode('detail');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white rounded-3xl overflow-hidden border border-[#E6E1DC] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {/* Image Box */}
                    <div className="relative h-64 overflow-hidden bg-[#E2DBD3]">
                      <img
                        src={project.heroImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5 bg-[#1E1D1B]/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                        {project.category}
                      </div>
                      <div className="absolute top-3.5 right-3.5 bg-[#E8C2AF] text-[#1E1D1B] text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-xs">
                        {project.status}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#8A563D] font-semibold mb-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{project.location}</span>
                        </div>
                        <h3 className="font-editorial text-2xl font-bold text-[#1E1D1B] group-hover:text-[#8A563D] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[#6B6661] mt-2 line-clamp-2 leading-relaxed">
                          {project.overviewText}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#F0EBE6]">
                        <div className="flex items-center justify-between text-xs text-[#5C5752]">
                          <span className="text-[11px] font-medium text-[#8C8781]">Structure</span>
                          <span className="font-semibold text-[#1E1D1B]">{project.floors}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#5C5752]">
                          <span className="text-[11px] font-medium text-[#8C8781]">Units / Layout</span>
                          <span className="font-semibold text-[#1E1D1B]">{project.unitsCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#5C5752]">
                          <span className="text-[11px] font-medium text-[#8C8781]">Total Area</span>
                          <span className="font-bold text-[#8A563D]">{project.areaSqFt}</span>
                        </div>

                        <div className="pt-3 flex items-center justify-between text-xs font-bold text-[#8A563D]">
                          <span>View Project Details</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: PROJECT DETAIL VIEW (Full details without secondary navbar)
          ========================================================================= */}
      {viewMode === 'detail' && (
        <div id="project-detail-view" className="animate-in fade-in duration-300">
          {/* Top Clean Breadcrumb Navigation Bar (Replacing Secondary Navbar) */}
          <div className="bg-[#EFEAE6] border-b border-[#E0D9D1] px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setViewMode('stage');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E1D1B] hover:text-[#8A563D] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to {currentProject.status} Projects</span>
                </button>
                <span className="text-[#C5BEB5] hidden sm:inline">|</span>
                <button
                  onClick={() => {
                    setViewMode('hub');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs text-[#7A7570] hover:text-[#1E1D1B] hidden sm:inline transition-colors cursor-pointer"
                >
                  Explore Developments
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] bg-[#E8C2AF]/40 px-3 py-1 rounded-full">
                  {currentProject.category}
                </span>
              </div>
            </div>
          </div>

          {/* 1. PROJECT HERO BANNER */}
          <section id="project-hero" className="relative h-[60vh] sm:h-[72vh] bg-[#1E1D1B] text-white overflow-hidden flex items-end pb-12 sm:pb-16">
            <div className="absolute inset-0 z-0">
              <img
                src={currentProject.heroImage}
                alt={currentProject.title}
                className="w-full h-full object-cover opacity-60 scale-100 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/40 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#E8C2AF] text-[#1E1D1B] text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full">
                    {currentProject.status}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8C2AF]">
                    {currentProject.category} DEVELOPMENT
                  </span>
                </div>

                <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.05]">
                  {currentProject.title}
                </h1>
                <p className="text-sm sm:text-lg text-[#E6E1DC] font-light max-w-xl">
                  {currentProject.tagline} • {currentProject.location}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
                    <Building className="w-3.5 h-3.5 text-[#E8C2AF]" />
                    <span>{currentProject.floors}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
                    <Layers className="w-3.5 h-3.5 text-[#E8C2AF]" />
                    <span>{currentProject.areaSqFt}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#E8C2AF]" />
                    <span>{currentProject.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. PROJECT OVERVIEW & INTERACTIVE MAP */}
          <section id="project-overview-section" className="py-16 sm:py-20 bg-[#EFEAE6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1E1D1B]">
                  Project Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Map Card + Description */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                  {/* Stylized Interactive Map Card */}
                  <div className="bg-[#242321] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#C9C4BE]">
                          Location Pin
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          currentProject.mapEmbedQuery
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#E8C2AF] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Google Maps Directions</span>
                        <ArrowDownRight className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Dark Cartographic Style Simulation / Preview */}
                    <div className="relative h-44 sm:h-52 bg-[#1A1918] rounded-xl overflow-hidden border border-[#3E3C38] flex items-center justify-center">
                      <div
                        className="absolute inset-0 opacity-40 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80')`,
                        }}
                      />
                      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="40" x2="100%" y2="80" stroke="#FFF" strokeWidth="2" />
                        <line x1="0" y1="120" x2="100%" y2="100" stroke="#FFF" strokeWidth="1.5" />
                        <line x1="80" y1="0" x2="120" y2="100%" stroke="#FFF" strokeWidth="1" />
                        <line x1="220" y1="0" x2="200" y2="100%" stroke="#FFF" strokeWidth="2" />
                      </svg>

                      <div className="relative z-10 bg-white text-[#1E1D1B] rounded-lg shadow-xl px-4 py-2 text-center max-w-[200px] border border-[#CCC]">
                        <div className="text-[11px] font-bold truncate">
                          {currentProject.title}
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            currentProject.mapEmbedQuery
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#8A563D] hover:underline font-semibold flex items-center justify-center gap-1 mt-0.5"
                        >
                          <span>Open in Maps</span>
                          <ArrowDownRight className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start gap-2 text-xs text-[#DDD6CE]">
                      <MapPin className="w-3.5 h-3.5 text-[#E8C2AF] shrink-0 mt-0.5" />
                      <span>{currentProject.fullAddress}</span>
                    </div>
                  </div>

                  {/* Text Overview */}
                  <div className="space-y-4">
                    <p className="text-sm sm:text-base text-[#4E4B47] leading-relaxed">
                      {currentProject.overviewText}
                    </p>
                    <p className="text-sm text-[#6B6661] leading-relaxed">
                      {currentProject.detailedDescription}
                    </p>
                  </div>
                </div>

                {/* Right Column: Hero Architecture Photo */}
                <div className="lg:col-span-6 flex flex-col">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E0D9D1] h-full min-h-[340px]">
                    <img
                      src={currentProject.heroImage}
                      alt={currentProject.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8C2AF] block">
                        SIGNATURE ELEVATION
                      </span>
                      <h3 className="font-editorial text-2xl font-bold">{currentProject.title}</h3>
                      <p className="text-xs text-[#E6E1DC] mt-1">{currentProject.unitsCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. ON-SITE LIVE CONSTRUCTION PROGRESS CAROUSEL (4 cards on desktop) */}
          {currentProject.liveUpdates && currentProject.liveUpdates.length > 0 && (
            <section id="live-updates-section" className="py-16 sm:py-20 bg-[#FAF8F5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8A563D] mb-1">
                      <HardHat className="w-4 h-4" />
                      <span>ON-SITE LIVE CONSTRUCTION PROGRESS</span>
                    </div>
                    <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1E1D1B]">
                      Project Updates & Milestones
                    </h2>
                  </div>

                  {/* Prev / Next Slider Arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Previous update"
                      onClick={prevLiveUpdateSlide}
                      disabled={liveUpdateSlideIndex === 0}
                      className="w-9 h-9 rounded-full bg-white border border-[#DDD6CE] hover:bg-[#EAE3DC] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#1E1D1B] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      aria-label="Next update"
                      onClick={nextLiveUpdateSlide}
                      disabled={liveUpdateSlideIndex >= maxSlideIndex}
                      className="w-9 h-9 rounded-full bg-white border border-[#DDD6CE] hover:bg-[#EAE3DC] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#1E1D1B] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4 Cards Grid Carousel */}
                <div className="overflow-hidden">
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${liveUpdateSlideIndex * (100 / 4)}%)`,
                    }}
                  >
                    {currentProject.liveUpdates.map((update) => (
                      <div
                        key={update.id}
                        className="bg-white rounded-2xl overflow-hidden border border-[#E6E1DC] shadow-xs flex flex-col h-full hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-48 bg-[#E2DBD3] overflow-hidden">
                          <img
                            src={update.image}
                            alt={update.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-[#1E1D1B]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {update.stage}
                          </div>
                          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-[#E8C2AF] text-[10px] font-medium px-2 py-0.5 rounded">
                            {update.date}
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="font-editorial text-lg font-bold text-[#1E1D1B] leading-snug">
                              {update.title}
                            </h3>
                            <p className="text-xs text-[#6B6661] mt-1.5 leading-relaxed">
                              {update.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[#F2ECE6] flex items-center gap-1.5 text-[11px] text-[#8A563D] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Quality Certified by Site Engineers</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 4. ARCHITECTURAL LAYOUTS & FLOOR PLANS WITH GATING */}
          <section id="floor-plans-section" className="py-16 sm:py-20 bg-[#F8F6F3] border-t border-[#EAE4DC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A563D] block mb-1">
                  ARCHITECTURAL BLUEPRINTS
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1E1D1B]">
                  Floor Plans & Layout Options
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6A65] mt-2">
                  Explore master layouts designed with zero dead space and optimal cross-ventilation.
                </p>
              </div>

              {/* Layout Switcher Tabs */}
              <div className="flex justify-center mb-8">
                <div className="bg-[#EFEAE6] p-1.5 rounded-full flex gap-1 sm:gap-2 overflow-x-auto max-w-full no-scrollbar shadow-inner">
                  {currentProject.floorPlans.map((fp, idx) => (
                    <button
                      key={fp.id}
                      onClick={() => handleSelectFloorPlan(idx)}
                      className={`text-xs font-semibold px-4 sm:px-6 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        activeFloorPlanIndex === idx
                          ? 'bg-[#1E1D1B] text-white shadow-xs'
                          : 'text-[#4D4A46] hover:bg-[#E2DBD3]'
                      }`}
                    >
                      {fp.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cutaway Showcase Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E6E1DC] shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Visual Showcase with Gating, Carousel & Best Fit Container */}
                <div className="lg:col-span-7 bg-[#F4EFEA] rounded-2xl p-4 sm:p-5 border border-[#EAE3DC] space-y-4">
                  {/* View Type Toggle (2D Blueprint vs 3D Cut Section) */}
                  {activeFloorPlanImages.length > 1 && (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E0D9D1] shadow-xs">
                        {activeFloorPlanImages.map((imgItem, imgIdx) => (
                          <button
                            key={imgIdx}
                            onClick={() => setActiveFloorPlanImageIndex(imgIdx)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeFloorPlanImageIndex === imgIdx
                                ? 'bg-[#8A563D] text-white shadow-xs'
                                : 'text-[#6E6A65] hover:bg-[#F4EFEA] hover:text-[#1E1D1B]'
                            }`}
                          >
                            <span>{imgItem.badge || `View ${imgIdx + 1}`}</span>
                          </button>
                        ))}
                      </div>

                      {isUnlocked && (
                        <button
                          onClick={() => setLightboxImage(currentActiveImage)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8A563D] bg-white hover:bg-[#EFEAE6] px-3 py-1.5 rounded-lg border border-[#E0D9D1] transition-colors cursor-pointer"
                          title="Open Fullscreen Lightbox"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Zoom Fullscreen</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Main Image Carousel Stage with Best-Fit Containment */}
                  <div className="relative rounded-xl overflow-hidden bg-white shadow-xs border border-[#E8E2DA] h-[340px] sm:h-[420px] lg:h-[460px] flex items-center justify-center group">
                    <img
                      src={currentActiveImage.url}
                      alt={currentActiveImage.title || activeFloorPlan.name}
                      className={`w-full h-full object-contain p-2 sm:p-4 transition-all duration-500 ${
                        !isUnlocked ? 'filter blur-md scale-105 select-none' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Carousel Left / Right Arrows */}
                    {activeFloorPlanImages.length > 1 && isUnlocked && (
                      <>
                        <button
                          onClick={() =>
                            setActiveFloorPlanImageIndex((prev) =>
                              prev === 0 ? activeFloorPlanImages.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1E1D1B] shadow-md border border-[#E0D9D1] flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer hover:scale-105"
                          aria-label="Previous floor plan view"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveFloorPlanImageIndex((prev) =>
                              (prev + 1) % activeFloorPlanImages.length
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1E1D1B] shadow-md border border-[#E0D9D1] flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer hover:scale-105"
                          aria-label="Next floor plan view"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Active image badge & title tag */}
                    {isUnlocked && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="bg-[#1E1D1B]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                          {currentActiveImage.badge || activeFloorPlan.type}
                        </span>
                      </div>
                    )}

                    {/* Carousel Dots / Index Counter */}
                    {activeFloorPlanImages.length > 1 && isUnlocked && (
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5">
                        {activeFloorPlanImages.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={() => setActiveFloorPlanImageIndex(dotIdx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              activeFloorPlanImageIndex === dotIdx
                                ? 'w-6 bg-[#8A563D]'
                                : 'w-2 bg-black/25 hover:bg-black/40'
                            }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Gated Message Overlay if not unlocked */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in duration-300 z-10">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                          <Lock className="w-6 h-6 text-[#E8C2AF]" />
                        </div>
                        <div className="space-y-1 max-w-xs">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8C2AF] block">
                            CONFIDENTIAL ARCHITECTURAL DRAWINGS
                          </span>
                          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                            View full floor plans
                          </h3>
                          <p className="text-xs text-[#DDD6CE]">
                            Enter your contact details to instantly unlock full high-resolution floor layouts, 3D cutaways and dimension sheets.
                          </p>
                        </div>

                        <button
                          id="view-full-floor-plans-btn"
                          onClick={handleOpenFloorPlanUnlock}
                          className="inline-flex items-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>VIEW NOW</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {activeFloorPlanImages.length > 1 && isUnlocked && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {activeFloorPlanImages.map((thumb, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => setActiveFloorPlanImageIndex(tIdx)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer bg-white ${
                            activeFloorPlanImageIndex === tIdx
                              ? 'border-[#8A563D] ring-2 ring-[#8A563D]/20 shadow-xs'
                              : 'border-[#E0D9D1] hover:border-[#8A563D]/50'
                          }`}
                        >
                          <img
                            src={thumb.url}
                            alt={thumb.title}
                            className="w-12 h-10 object-contain rounded-lg border border-[#EAE3DC] bg-[#FAF8F5] shrink-0 p-0.5"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-[#8A563D] uppercase block truncate">
                              {thumb.badge || `View ${tIdx + 1}`}
                            </span>
                            <span className="text-xs font-semibold text-[#1E1D1B] block truncate">
                              {thumb.title}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plan Details & Dimensions */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] bg-[#E8C2AF]/40 px-2.5 py-1 rounded-md">
                      {activeFloorPlan.type}
                    </span>
                    <h3 className="font-editorial text-3xl font-bold text-[#1E1D1B] mt-2">
                      {activeFloorPlan.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-[#F8F6F3] p-4 rounded-xl border border-[#EBE5DE]">
                    {[2, 3, 4].includes(activeFloorPlan.bedrooms) ? (
                      <>
                        <div>
                          <span className="text-[11px] text-[#7A7570] block">Configuration</span>
                          <span className="text-base sm:text-lg font-bold text-[#1E1D1B]">{activeFloorPlan.type}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#7A7570] block">Carpet & Built-Up</span>
                          <span className="text-xs sm:text-sm font-bold text-[#8A563D] mt-1 block">Available on Request</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-[11px] text-[#7A7570] block">Super Built-up Area</span>
                          <span className="text-lg font-bold text-[#1E1D1B]">{activeFloorPlan.areaSqFt} sq. ft.</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#7A7570] block">Carpet Area</span>
                          <span className="text-lg font-bold text-[#1E1D1B]">{activeFloorPlan.carpetAreaSqFt} sq. ft.</span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-[11px] text-[#7A7570] block">Bedrooms / Baths</span>
                      <span className="text-sm font-semibold text-[#1E1D1B]">{activeFloorPlan.bedrooms} Bed / {activeFloorPlan.bathrooms} Bath</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#7A7570] block">Balconies</span>
                      <span className="text-sm font-semibold text-[#1E1D1B]">{activeFloorPlan.balconies} Private Sit-outs</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E3C38]">
                      Key Layout Highlights:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#5C5752]">
                      {activeFloorPlan.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8A563D] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Download Brochure Button */}
                  <div className="pt-2">
                    <button
                      id="download-brochure-floorplan-btn"
                      onClick={() => handleBrochureClick(currentProject)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#1E1D1B]" />
                      <span>{isUnlocked ? 'Download Project Brochure (Unlocked)' : 'Download Brochure'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. AMENITIES GRID */}
          <section id="amenities-section" className="py-16 bg-[#EFEAE6] border-t border-[#E2DBD3]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A563D] block mb-1">
                    LIFESTYLE & RECREATION
                  </span>
                  <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1E1D1B]">
                    Project Amenities
                  </h2>
                </div>
                <button
                  onClick={() => onOpenEnquiry(currentProject.id)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#8A563D] hover:underline cursor-pointer"
                >
                  <span>Book Site Walkthrough</span>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProject.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-[#E6E1DC] shadow-xs space-y-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E8C2AF]/30 text-[#8A563D] flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#1E1D1B]">{amenity.title}</h3>
                    <p className="text-xs text-[#6B6661] leading-relaxed">
                      {amenity.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. SPECIFICATIONS & QUALITY STANDARDS */}
          {currentProject.specifications && currentProject.specifications.length > 0 && (
            <section id="specifications-section" className="py-16 bg-[#F8F6F3] border-t border-[#E2DBD3]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A563D] block mb-1">
                    BUILT TO LAST WITH INTEGRITY
                  </span>
                  <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1E1D1B]">
                    Quality, Safety & Features
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProject.specifications.map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-white rounded-2xl p-6 border border-[#E6E1DC] shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 pb-3 border-b border-[#F2ECE6] mb-4">
                          <CheckCircle2 className="w-4 h-4 text-[#8A563D]" />
                          <h3 className="font-editorial text-lg font-bold text-[#1E1D1B]">
                            {spec.category}
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {spec.items.map((item, iIdx) => (
                            <li key={iIdx} className="flex items-start gap-2 text-xs text-[#5C5752] leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8A563D] shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 7. CALL TO ACTION BAR */}
          <section className="py-14 bg-[#1E1D1B] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#E8C2AF] block">
                  EXPERIENCE {currentProject.title}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold mt-1">
                  Schedule a Private On-Site Site Tour
                </h3>
                <p className="text-xs sm:text-sm text-[#B8B2AA] mt-1">
                  Speak with our development architects and view sample unit configurations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => onOpenEnquiry(currentProject.id)}
                  className="inline-flex items-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-[#1E1D1B]" />
                  <span>SCHEDULE A SITE VISIT</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Brochure / Floor Plan Unlock Modal */}
      <BrochureModal
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        project={currentProject}
        mode={brochureModalMode}
        onUnlock={handleUnlockSession}
      />

      {/* High-Resolution Architectural Blueprint Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-[#444]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="px-5 py-3.5 bg-[#1E1D1B] text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8C2AF] block">
                  {lightboxImage.badge || 'Architectural Drawing'}
                </span>
                <h4 className="font-editorial text-base sm:text-lg font-bold text-white truncate max-w-xl">
                  {lightboxImage.title}
                </h4>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer ml-3 shrink-0"
                aria-label="Close Lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lightbox Canvas with Crisp Best-Fit Containment */}
            <div className="flex-1 overflow-auto bg-[#F9F7F4] p-3 sm:p-6 flex items-center justify-center min-h-[300px]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[75vh] object-contain shadow-sm rounded-lg bg-white p-2 border border-[#E0D9D1]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
