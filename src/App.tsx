/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Page, ProjectStage, ProjectsViewMode } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { CareersPage } from './pages/CareersPage';
import { EnquiryModal } from './components/EnquiryModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { adminAuthService } from './services/adminAuthService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('janki-shreyas-chs');
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null);
  const [projectsViewMode, setProjectsViewMode] = useState<ProjectsViewMode>('hub');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState<boolean>(false);
  const [enquiryProjectId, setEnquiryProjectId] = useState<string>('');
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);

  const handleOpenAdmin = () => {
    if (adminAuthService.isAuthenticated()) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleOpenEnquiry = (projectId?: string) => {
    setEnquiryProjectId(projectId || '');
    setIsEnquiryOpen(true);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setProjectsViewMode('detail');
    setCurrentPage('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStage = (stage: ProjectStage) => {
    setSelectedStage(stage);
    setProjectsViewMode('stage');
    setCurrentPage('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavChange = (page: Page) => {
    if (page === 'projects') {
      setProjectsViewMode('hub');
      setSelectedStage(null);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F3] text-[#1E1D1B]">
      {/* Top Main Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleNavChange}
        onOpenEnquiry={handleOpenEnquiry}
        onSelectProject={handleSelectProject}
        onSelectStage={handleSelectStage}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            setCurrentPage={handleNavChange}
            onOpenEnquiry={handleOpenEnquiry}
            onSelectProject={handleSelectProject}
            onSelectStage={handleSelectStage}
          />
        )}

        {currentPage === 'projects' && (
          <ProjectsPage
            selectedProjectId={selectedProjectId}
            selectedStage={selectedStage}
            viewMode={projectsViewMode}
            onSelectProject={handleSelectProject}
            onSelectStage={handleSelectStage}
            setViewMode={setProjectsViewMode}
            onOpenEnquiry={handleOpenEnquiry}
            setCurrentPage={handleNavChange}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            setCurrentPage={handleNavChange}
            onOpenEnquiry={handleOpenEnquiry}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            setCurrentPage={handleNavChange}
            onOpenEnquiry={handleOpenEnquiry}
          />
        )}

        {currentPage === 'calculator' && (
          <CalculatorPage
            setCurrentPage={handleNavChange}
            onOpenEnquiry={handleOpenEnquiry}
          />
        )}

        {currentPage === 'careers' && (
          <CareersPage
            setCurrentPage={handleNavChange}
            onOpenEnquiry={handleOpenEnquiry}
          />
        )}
      </main>

      {/* Main Global Footer */}
      <Footer
        currentPage={currentPage}
        setCurrentPage={handleNavChange}
        onOpenEnquiry={handleOpenEnquiry}
        onSelectProject={handleSelectProject}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Global Quick Enquiry / Quote Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultProjectId={enquiryProjectId}
      />

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Admin On-Site Live Progress & Milestones Manager */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onSelectProjectOnSite={handleSelectProject}
      />
    </div>
  );
}


