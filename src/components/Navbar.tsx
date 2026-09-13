import React, { useState, useEffect } from 'react';
import { Page, ProjectStage } from '../types';
import { Menu, X, ArrowDownRight, ChevronDown } from 'lucide-react';
import { CitadelLogo } from './CitadelLogo';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenEnquiry: (projectId?: string) => void;
  onSelectProject?: (projectId: string) => void;
  onSelectStage?: (stage: ProjectStage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  onOpenEnquiry,
  onSelectProject: _onSelectProject,
  onSelectStage,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; page: Page; hasDropdown?: boolean }[] = [
    { label: 'HOME', page: 'home' },
    { label: 'PROJECTS', page: 'projects', hasDropdown: true },
    { label: 'ABOUT US', page: 'about' },
    { label: 'CAREERS', page: 'careers' },
    { label: 'CONTACT US', page: 'contact' },
    { label: 'TOOLS', page: 'calculator' },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setProjectsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStageSelect = (stage: ProjectStage) => {
    if (onSelectStage) {
      onSelectStage(stage);
    }
    setProjectsDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#F8F6F3]/95 backdrop-blur-md shadow-xs py-2 sm:py-2.5 border-b border-[#E6E1DC]'
          : 'bg-[#F8F6F3]/90 backdrop-blur-xs py-2.5 sm:py-3 border-b border-[#E6E1DC]/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-hidden"
          >
            <CitadelLogo variant="color" size="md" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => {
              const isActive = currentPage === item.page;
              if (item.hasDropdown) {
                return (
                  <div
                    key={item.label}
                    className="relative group"
                    onMouseEnter={() => setProjectsDropdownOpen(true)}
                    onMouseLeave={() => setProjectsDropdownOpen(false)}
                  >
                    <button
                      id={`nav-link-${item.page}`}
                      onClick={() => handleNavClick(item.page)}
                      className={`flex items-center gap-1 text-xs font-semibold tracking-wider transition-colors py-1.5 ${
                        isActive
                          ? 'text-[#A05C3B] font-bold'
                          : 'text-[#2C2B29] hover:text-[#A05C3B]'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Projects Dropdown Menu */}
                    {projectsDropdownOpen && (
                      <div className="absolute top-full left-0 w-60 bg-[#FCFAF8] rounded-xl shadow-xl border border-[#E6E1DC] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* 1. UPCOMING */}
                        <button
                          id="dropdown-stage-upcoming"
                          onClick={() => handleStageSelect('Upcoming')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F2ECE6] transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#8A563D]" />
                            <span className="text-xs font-semibold text-[#1E1D1B] group-hover:text-[#8A563D] tracking-wide">
                              Upcoming
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8C8781] group-hover:text-[#8A563D] group-hover:translate-x-0.5 transition-all">
                            View →
                          </span>
                        </button>

                        <div className="border-t border-[#F0EBE6] mx-2" />

                        {/* 2. ONGOING */}
                        <button
                          id="dropdown-stage-ongoing"
                          onClick={() => handleStageSelect('Ongoing')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F2ECE6] transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#A05C3B]" />
                            <span className="text-xs font-semibold text-[#1E1D1B] group-hover:text-[#A05C3B] tracking-wide">
                              Ongoing
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8C8781] group-hover:text-[#A05C3B] group-hover:translate-x-0.5 transition-all">
                            View →
                          </span>
                        </button>

                        <div className="border-t border-[#F0EBE6] mx-2" />

                        {/* 3. COMPLETED */}
                        <button
                          id="dropdown-stage-completed"
                          onClick={() => handleStageSelect('Completed')}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F2ECE6] transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#5A5550]" />
                            <span className="text-xs font-semibold text-[#1E1D1B] group-hover:text-[#5A5550] tracking-wide">
                              Completed
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8C8781] group-hover:text-[#5A5550] group-hover:translate-x-0.5 transition-all">
                            View →
                          </span>
                        </button>

                        <div className="border-t border-[#F0EBE6] mx-2 my-1" />

                        {/* All Projects Overview Link */}
                        <button
                          id="dropdown-stage-all"
                          onClick={() => handleNavClick('projects')}
                          className="w-full text-left px-4 py-2 text-[11px] font-medium text-[#8C8781] hover:text-[#A05C3B] hover:bg-[#F2ECE6] transition-colors"
                        >
                          All Projects Overview →
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.label}
                  id={`nav-link-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`relative text-xs font-semibold tracking-wider transition-colors py-1.5 ${
                    isActive
                      ? 'text-[#A05C3B] font-bold'
                      : 'text-[#2C2B29] hover:text-[#A05C3B]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A05C3B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Button: ENQUIRY ↘ */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              id="nav-enquiry-btn"
              onClick={() => onOpenEnquiry()}
              className="inline-flex items-center justify-center gap-1.5 bg-[#E8C2AF] hover:bg-[#DFB29D] active:scale-[0.98] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-full shadow-xs transition-all duration-200 cursor-pointer"
            >
              <span>ENQUIRY</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-[#1E1D1B]" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="mobile-enquiry-mini-btn"
              onClick={() => onOpenEnquiry()}
              className="sm:hidden inline-flex items-center justify-center bg-[#E8C2AF] text-[#1E1D1B] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full"
            >
              <span>ENQUIRY</span>
              <ArrowDownRight className="w-3 h-3 ml-0.5" />
            </button>
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-1.5 rounded-lg text-[#1E1D1B] hover:bg-[#EAE3DC] transition-colors focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="lg:hidden bg-[#F8F6F3] border-b border-[#E6E1DC] px-4 pt-2.5 pb-5 space-y-2 animate-in slide-in-from-top duration-200 shadow-lg max-h-[85vh] overflow-y-auto"
        >
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <div key={item.label} className="border-b border-[#ECE7E2] pb-1">
                <button
                  id={`mobile-link-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`w-full text-left py-2 px-2 text-xs font-semibold tracking-wider flex items-center justify-between ${
                    isActive ? 'text-[#A05C3B] font-bold bg-[#EFE9E3] rounded-lg' : 'text-[#2C2B29]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#A05C3B]" />}
                </button>

                {item.hasDropdown && (
                  <div className="pl-3 pr-2 py-2 space-y-1 bg-[#F3EDE6]/60 rounded-xl my-1">
                    {/* Upcoming */}
                    <button
                      onClick={() => handleStageSelect('Upcoming')}
                      className="w-full text-left py-2 px-2 text-xs font-semibold text-[#2C2B29] hover:text-[#8A563D] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#8A563D]" />
                        <span>Upcoming</span>
                      </span>
                      <span className="text-[10px] text-[#8C8781]">→</span>
                    </button>

                    {/* Ongoing */}
                    <button
                      onClick={() => handleStageSelect('Ongoing')}
                      className="w-full text-left py-2 px-2 text-xs font-semibold text-[#2C2B29] hover:text-[#A05C3B] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#A05C3B]" />
                        <span>Ongoing</span>
                      </span>
                      <span className="text-[10px] text-[#8C8781]">→</span>
                    </button>

                    {/* Completed */}
                    <button
                      onClick={() => handleStageSelect('Completed')}
                      className="w-full text-left py-2 px-2 text-xs font-semibold text-[#2C2B29] hover:text-[#5A5550] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#5A5550]" />
                        <span>Completed</span>
                      </span>
                      <span className="text-[10px] text-[#8C8781]">→</span>
                    </button>

                    <div className="border-t border-[#EAE3DC] pt-1" />

                    <button
                      onClick={() => handleNavClick('projects')}
                      className="w-full text-left py-1.5 px-2 text-xs font-medium text-[#8C8781] hover:text-[#A05C3B]"
                    >
                      All Projects Overview →
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2">
            <button
              id="mobile-drawer-enquiry-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEnquiry();
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-[#E8C2AF] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider py-2.5 rounded-full shadow-xs"
            >
              <span>GET A QUOTE / ENQUIRY</span>
              <ArrowDownRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

