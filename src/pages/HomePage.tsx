import React, { useRef, useEffect } from 'react';
import { Page, ProjectStage } from '../types';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { companyProfileData } from '../data/companyData';
import { getAssetUrl } from '../utils/assets';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  onOpenEnquiry: (projectId?: string) => void;
  onSelectProject: (projectId: string) => void;
  onSelectStage?: (stage: ProjectStage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentPage,
  onOpenEnquiry,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback to ensure muted autoplay is allowed across all browsers
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  return (
    <div id="home-page-container" className="pt-14 sm:pt-16">
      {/* 1. HERO SECTION (Direct Video Background) */}
      <section
        id="hero-section"
        className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-[#141312] text-white overflow-hidden"
      >
        {/* Background Visual Layer: Direct Video Stream */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-75 scale-100 transition-opacity duration-700"
          >
            <source src={getAssetUrl('citadel-hero-video.mp4')} type="video/mp4" />
            <source src={getAssetUrl('jay-rajkiran-walkthrough.mp4')} type="video/mp4" />
            <source src={getAssetUrl('hero-video.mp4')} type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-architecture-41544-large.mp4" type="video/mp4" />
          </video>

          {/* Clean dark gradient overlay to ensure high contrast and text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/45 to-[#141312]/25 pointer-events-none" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20 space-y-6">
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08]">
            Building The Future
          </h1>

          <p className="text-base sm:text-xl font-light text-[#E6E1DC] max-w-2xl mx-auto leading-relaxed">
            Trusted & Reliable Builders, transforming metropolitan living across Pune and Mumbai.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              id="hero-explore-projects-btn"
              onClick={() => {
                setCurrentPage('projects');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <span>EXPLORE PROJECTS</span>
              <ArrowRight className="w-4 h-4 text-[#1E1D1B] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              id="hero-enquire-btn"
              onClick={() => onOpenEnquiry()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-[#E6E1DC]/50 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#E8C2AF]" />
              <span>ENQUIRE NOW</span>
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 mt-6 border-t border-white/15 max-w-3xl mx-auto text-center sm:text-left">
            <div>
              <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#E8C2AF]">
                {companyProfileData.stats.yearsExperience}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#B8B2AA] mt-0.5">
                Years of Expertise
              </div>
            </div>
            <div>
              <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#E8C2AF]">
                {companyProfileData.stats.puneOngoingSqFt}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#B8B2AA] mt-0.5">
                Sq. Ft. Ongoing (Pune)
              </div>
            </div>
            <div>
              <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#E8C2AF]">
                {companyProfileData.stats.puneDevelopedSqFt}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#B8B2AA] mt-0.5">
                Sq. Ft. Developed (Pune)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT OUR COMPANY SECTION (Frosted Glass Card with San Francisco Red Bridge background) */}
      <section
        id="about-company-hero-section"
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-cover bg-center flex items-center justify-center min-h-[70vh]"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 19, 18, 0.40), rgba(20, 19, 18, 0.60)), url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=2000&q=85')`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-4xl w-full mx-auto">
          {/* Frosted Glass Floating Card */}
          <div className="bg-[#1E1D1B]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center border border-white/20 shadow-2xl text-white space-y-6">
            <h2 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-white">
              About Our Company
            </h2>

            <p className="text-lg sm:text-2xl font-medium text-[#F4EFEA] leading-snug max-w-2xl mx-auto">
              We offer exceptional residential and commercial spaces that meet the highest standards to our clients.
            </p>

            <p className="text-sm sm:text-base text-[#D4CFC9] leading-relaxed max-w-2xl mx-auto font-light">
              Citadel Group maintains a strong presence in Pune. With over 10 years of experience, we specialise in development and redevelopment projects across metropolitan cities. Our team is composed of young, dynamic, and motivated professionals, supported by highly qualified partners and guided by industry experts serving as mentors and consultants.
            </p>

            <div className="pt-4 flex items-center justify-center">
              <button
                id="about-company-read-more-btn"
                onClick={() => {
                  setCurrentPage('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md transition-colors cursor-pointer"
              >
                <span>DISCOVER OUR STORY</span>
                <ArrowRight className="w-4 h-4 text-[#1E1D1B]" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
