import React, { useState } from 'react';
import { Page } from '../types';
import { ArrowDownRight, ChevronDown, ChevronUp, Mail, MapPin, Phone, Instagram, Facebook, Linkedin, ArrowUp, Lock } from 'lucide-react';
import { projectsData } from '../data/projectsData';
import { companyProfileData } from '../data/companyData';

interface FooterProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenEnquiry: (projectId?: string) => void;
  onSelectProject?: (projectId: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentPage,
  setCurrentPage,
  onOpenEnquiry,
  onSelectProject,
  onOpenAdmin,
}) => {
  const [projectsExpanded, setProjectsExpanded] = useState(false);

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProjectClick = (id: string) => {
    if (onSelectProject) {
      onSelectProject(id);
    }
    setCurrentPage('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#E6E1DC] text-[#2C2B29] pt-16 pb-8 border-t border-[#D9D3CD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-[#D6CFC8]">
          {/* Column 1: Brand & Nav Links */}
          <div className="space-y-6">
            <div className="flex flex-col items-start space-y-1">
              <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1D1B]">
                CITADEL GROUP
              </span>
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#8A563D]">
                Builders & Developers
              </span>
            </div>

            <nav className="space-y-3.5 pt-2">
              <div>
                <button
                  id="footer-nav-home"
                  onClick={() => handleNav('home')}
                  className={`text-xs sm:text-sm font-semibold tracking-wider transition-colors block text-left ${
                    currentPage === 'home'
                      ? 'text-[#A05C3B] font-bold underline underline-offset-4'
                      : 'text-[#3E3C38] hover:text-[#A05C3B]'
                  }`}
                >
                  HOME
                </button>
              </div>

              <div>
                <button
                  id="footer-nav-projects"
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className={`text-xs sm:text-sm font-semibold tracking-wider transition-colors flex items-center gap-1.5 text-left ${
                    currentPage === 'projects'
                      ? 'text-[#A05C3B] font-bold'
                      : 'text-[#3E3C38] hover:text-[#A05C3B]'
                  }`}
                >
                  <span>PROJECTS</span>
                  {projectsExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {projectsExpanded && (
                  <div className="pl-3 pt-2 space-y-1.5 border-l-2 border-[#D0C7BF] mt-1.5 animate-in fade-in duration-150">
                    <button
                      onClick={() => handleNav('projects')}
                      className="block text-xs font-semibold text-[#A05C3B] hover:underline"
                    >
                      All Projects Overview
                    </button>
                    {projectsData.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleProjectClick(p.id)}
                        className="block text-xs text-[#54514D] hover:text-[#A05C3B] text-left transition-colors"
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  id="footer-nav-about"
                  onClick={() => handleNav('about')}
                  className={`text-xs sm:text-sm font-semibold tracking-wider transition-colors block text-left ${
                    currentPage === 'about'
                      ? 'text-[#A05C3B] font-bold underline underline-offset-4'
                      : 'text-[#3E3C38] hover:text-[#A05C3B]'
                  }`}
                >
                  ABOUT US
                </button>
              </div>

              <div>
                <button
                  id="footer-nav-careers"
                  onClick={() => handleNav('careers')}
                  className={`text-xs sm:text-sm font-semibold tracking-wider transition-colors block text-left ${
                    currentPage === 'careers'
                      ? 'text-[#A05C3B] font-bold underline underline-offset-4'
                      : 'text-[#3E3C38] hover:text-[#A05C3B]'
                  }`}
                >
                  CAREERS
                </button>
              </div>

              <div>
                <button
                  id="footer-nav-contact"
                  onClick={() => handleNav('contact')}
                  className={`text-xs sm:text-sm font-semibold tracking-wider transition-colors block text-left ${
                    currentPage === 'contact'
                      ? 'text-[#A05C3B] font-bold underline underline-offset-4'
                      : 'text-[#3E3C38] hover:text-[#A05C3B]'
                  }`}
                >
                  CONTACT US
                </button>
              </div>

              <div>
                <button
                  id="footer-nav-calc"
                  onClick={() => handleNav('calculator')}
                  className={`text-xs sm:text-sm font-semibold tracking-wider transition-colors block text-left ${
                    currentPage === 'calculator'
                      ? 'text-[#A05C3B] font-bold underline underline-offset-4'
                      : 'text-[#3E3C38] hover:text-[#A05C3B]'
                  }`}
                >
                  TOOLS
                </button>
              </div>
            </nav>
          </div>

          {/* Column 2: Head Office */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E1D1B]">
              HEAD OFFICE
            </h4>
            <div className="text-xs sm:text-sm text-[#4E4B47] leading-relaxed space-y-2">
              <p>
                Swapnapurti Apartments, Apt 2,<br />
                35/13+14C, Opp Hotel President,<br />
                Prabhat Road, Lane 8, Erandwane.<br />
                Pune – 411 004
              </p>
              <div className="pt-2">
                <a
                  href="mailto:enquiry@thecitadelgroup.co"
                  className="text-xs sm:text-sm text-[#242321] font-medium hover:text-[#A05C3B] underline underline-offset-2 transition-colors block break-all"
                >
                  enquiry@thecitadelgroup.co
                </a>
                <a
                  href="tel:+918779975270"
                  className="text-xs text-[#6B6661] hover:text-[#A05C3B] mt-1 block"
                >
                  +91 8779975270
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Socials */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E1D1B]">
              SOCIALS
            </h4>
            <div className="space-y-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm text-[#3E3C38] hover:text-[#A05C3B] underline underline-offset-2 block transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://wa.me/918779975270?text=Hello%20Citadel%20Group,%20I%20would%20like%20to%20know%20more%20about%20your%20projects."
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm text-[#3E3C38] hover:text-[#A05C3B] underline underline-offset-2 block transition-colors"
              >
                WhatsApp Inquiry
              </a>
            </div>
          </div>

          {/* Column 4: Enquiries & Get a Quote */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E1D1B]">
              ENQUIRIES
            </h4>
            <p className="text-xs sm:text-sm text-[#4E4B47]">
              Looking for a quote or project brochure?
            </p>
            <div className="pt-1">
              <button
                id="footer-get-quote-btn"
                onClick={() => onOpenEnquiry()}
                className="inline-flex items-center justify-center gap-2 bg-[#E8C2AF] hover:bg-[#DFB29D] active:scale-[0.98] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-xs transition-all duration-200 cursor-pointer"
              >
                <span>GET A QUOTE</span>
                <ArrowDownRight className="w-4 h-4 text-[#1E1D1B]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Back to Top & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6661]">
          <div className="order-2 sm:order-1 flex items-center gap-1.5">
            <span>© 2026 by CITADEL Group. All rights reserved.</span>
            {onOpenAdmin && (
              <button
                id="admin-stealth-lock-trigger"
                onClick={onOpenAdmin}
                tabIndex={-1}
                aria-label="Site Console"
                title=""
                className="inline-flex items-center text-[#6B6661] opacity-25 hover:opacity-35 transition-opacity p-0.5 cursor-default focus:outline-hidden"
              >
                <Lock className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          <div className="order-1 sm:order-2">
            <button
              id="footer-back-to-top-btn"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-[#2C2B29] hover:text-[#A05C3B] transition-colors underline underline-offset-4 cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
