import React, { useState, useEffect } from 'react';
import { Page, ProjectStage } from '../types';
import { Menu, X, ArrowDownRight, ChevronDown } from 'lucide-react';
import { projectsData } from '../data/projectsData';
import { CitadelLogo } from './CitadelLogo';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenEnquiry: (projectId?: string) => void;
  onSelectProject?: (projectId: string) => void;
  onSelectStage?: (stage: ProjectStage) => void;
}

const formatNavbarLocation = (locationStr: string): string => {
  const parts = locationStr.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const area = parts[0];
    const city = parts[parts.length - 1];
    return `${area}, ${city}`;
  }
  return locationStr;
};

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  onOpenEnquiry,
  onSelectProject,
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
    { label: 'CONTACT US', page: 'contact' },
    { label: 'HOME LOAN CALCULATOR', page: 'calculator' },
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

  const handleProjectSelect = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
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
                      <div className="absolute top-full left-0 w-80 bg-[#FCFAF8] rounded-xl shadow-xl border border-[#E6E1DC] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* 1. UPCOMING */}
                        <div className="px-3 pt-1 pb-1">
                          <button
                            onClick={() => handleStageSelect('Upcoming')}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] flex items-center justify-between w-full hover:underline"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8A563D]" />
                              <span>UPCOMING PROJECTS</span>
                            </span>
                            <span className="text-[9px] text-[#8C8781]">View All →</span>
                          </button>
                          <div className="mt-1 space-y-0.5">
                            {projectsData.filter(p => p.status === 'Upcoming').map((project) => (
                              <button
                                key={project.id}
                                id={`dropdown-proj-${project.id}`}
                                onClick={() => handleProjectSelect(project.id)}
                                className="w-full text-left px-2 py-1 rounded-md hover:bg-[#F2ECE6] transition-colors flex items-center justify-between group/item"
                              >
                                <span className="text-xs font-semibold text-[#1E1D1B] group-hover/item:text-[#A05C3B] truncate">
                                  {project.title}
                                </span>
                                <span className="text-[10px] text-[#8C8781] shrink-0 ml-2">{formatNavbarLocation(project.location)}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-[#F0EBE6] my-1" />

                        {/* 2. ONGOING */}
                        <div className="px-3 pt-1 pb-1">
                          <button
                            onClick={() => handleStageSelect('Ongoing')}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#A05C3B] flex items-center justify-between w-full hover:underline"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A05C3B]" />
                              <span>ONGOING PROJECTS</span>
                            </span>
                            <span className="text-[9px] text-[#8C8781]">View All →</span>
                          </button>
                          <div className="mt-1 space-y-0.5">
                            {projectsData.filter(p => p.status === 'Ongoing').map((project) => (
                              <button
                                key={project.id}
                                id={`dropdown-proj-${project.id}`}
                                onClick={() => handleProjectSelect(project.id)}
                                className="w-full text-left px-2 py-1 rounded-md hover:bg-[#F2ECE6] transition-colors flex items-center justify-between group/item"
                              >
                                <span className="text-xs font-semibold text-[#1E1D1B] group-hover/item:text-[#A05C3B] truncate">
                                  {project.title}
                                </span>
                                <span className="text-[10px] text-[#8C8781] shrink-0 ml-2">{formatNavbarLocation(project.location)}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-[#F0EBE6] my-1" />

                        {/* 3. COMPLETED */}
                        <div className="px-3 pt-1 pb-1">
                          <button
                            onClick={() => handleStageSelect('Completed')}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#5A5550] flex items-center justify-between w-full hover:underline"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5A5550]" />
                              <span>COMPLETED PROJECTS</span>
                            </span>
                            <span className="text-[9px] text-[#8C8781]">View All →</span>
                          </button>
                          <div className="mt-1 space-y-0.5">
                            {projectsData.filter(p => p.status === 'Completed').map((project) => (
                              <button
                                key={project.id}
                                id={`dropdown-proj-${project.id}`}
                                onClick={() => handleProjectSelect(project.id)}
                                className="w-full text-left px-2 py-1 rounded-md hover:bg-[#F2ECE6] transition-colors flex items-center justify-between group/item"
                              >
                                <span className="text-xs font-semibold text-[#1E1D1B] group-hover/item:text-[#A05C3B] truncate">
                                  {project.title}
                                </span>
                                <span className="text-[10px] text-[#8C8781] shrink-0 ml-2">{formatNavbarLocation(project.location)}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-[#F0EBE6] px-3 pt-1.5 pb-1">
                          <button
                            onClick={() => handleNavClick('projects')}
                            className="w-full text-center text-xs font-semibold text-[#A05C3B] hover:underline py-0.5"
                          >
                            Explore Projects Overview →
                          </button>
                        </div>
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
                  <div className="pl-3 pr-2 py-2 space-y-2.5 bg-[#F3EDE6]/60 rounded-xl my-1">
                    {/* Upcoming */}
                    <div>
                      <button
                        onClick={() => handleStageSelect('Upcoming')}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] flex items-center justify-between w-full mb-1"
                      >
                        <span>Upcoming</span>
                        <span className="text-[9px] text-[#8C8781]">View All →</span>
                      </button>
                      {projectsData.filter(p => p.status === 'Upcoming').map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleProjectSelect(p.id)}
                          className="w-full text-left py-0.5 text-xs text-[#3E3B37] hover:text-[#A05C3B] flex items-center justify-between"
                        >
                          <span className="truncate">• {p.title}</span>
                          <span className="text-[10px] text-[#8C8781] shrink-0 ml-1">{formatNavbarLocation(p.location)}</span>
                        </button>
                      ))}
                    </div>

                    {/* Ongoing */}
                    <div>
                      <button
                        onClick={() => handleStageSelect('Ongoing')}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#A05C3B] flex items-center justify-between w-full mb-1"
                      >
                        <span>Ongoing</span>
                        <span className="text-[9px] text-[#8C8781]">View All →</span>
                      </button>
                      {projectsData.filter(p => p.status === 'Ongoing').map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleProjectSelect(p.id)}
                          className="w-full text-left py-0.5 text-xs text-[#3E3B37] hover:text-[#A05C3B] flex items-center justify-between"
                        >
                          <span className="truncate">• {p.title}</span>
                          <span className="text-[10px] text-[#8C8781] shrink-0 ml-1">{formatNavbarLocation(p.location)}</span>
                        </button>
                      ))}
                    </div>

                    {/* Completed */}
                    <div>
                      <button
                        onClick={() => handleStageSelect('Completed')}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#5A5550] flex items-center justify-between w-full mb-1"
                      >
                        <span>Completed</span>
                        <span className="text-[9px] text-[#8C8781]">View All →</span>
                      </button>
                      {projectsData.filter(p => p.status === 'Completed').map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleProjectSelect(p.id)}
                          className="w-full text-left py-0.5 text-xs text-[#3E3B37] hover:text-[#A05C3B] flex items-center justify-between"
                        >
                          <span className="truncate">• {p.title}</span>
                          <span className="text-[10px] text-[#8C8781] shrink-0 ml-1">{formatNavbarLocation(p.location)}</span>
                        </button>
                      ))}
                    </div>
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

