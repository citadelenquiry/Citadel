import React from 'react';
import { Page } from '../types';
import {
  Building2,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Compass,
} from 'lucide-react';
import { companyProfileData } from '../data/companyData';
import { getAssetUrl } from '../utils/assets';

interface AboutPageProps {
  setCurrentPage: (page: Page) => void;
  onOpenEnquiry: (projectTitle?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  setCurrentPage,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1D1B]">
      {/* 1. HERO HEADER */}
      <section className="relative bg-[#141312] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"
            alt="Citadel Architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block">
            ABOUT CITADEL GROUP
          </span>
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08]">
            Excellence in Development & Redevelopment
          </h1>
          <p className="text-base sm:text-lg text-[#D9D3CD] max-w-2xl mx-auto font-light leading-relaxed">
            With over 10 years of specialized experience, Citadel Group maintains a strong presence in Pune and Mumbai, transforming urban landscapes through civil engineering mastery, diligence, and integrity.
          </p>
        </div>
      </section>

      {/* 2. OUR EXPERIENCE & NUMBERS */}
      <section className="py-20 border-b border-[#EAE4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A563D] block">
              OUR PROVEN TRACK RECORD
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#1E1D1B]">
              Scale & Delivery Across Pune & Mumbai
            </h2>
            <p className="text-sm sm:text-base text-[#6E6A65] leading-relaxed">
              We have successfully developed more than 1,65,000 sq. ft. in prestigious areas of Pune, with 3,00,000 sq. ft. currently under active development and over 5,00,000 sq. ft. in upcoming prime masterplans.
            </p>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-[#E6E1DC] shadow-xs text-center">
              <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#8A563D]">
                {companyProfileData.stats.puneDevelopedSqFt}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1E1D1B] mt-2">
                Developed in Pune
              </div>
              <p className="text-[11px] text-[#7A7570] mt-1">Residential & Commercial space delivered</p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#E6E1DC] shadow-xs text-center">
              <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#8A563D]">
                {companyProfileData.stats.puneOngoingSqFt}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1E1D1B] mt-2">
                Ongoing in Pune
              </div>
              <p className="text-[11px] text-[#7A7570] mt-1">Under active construction in prime nodes</p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#E6E1DC] shadow-xs text-center">
              <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#8A563D]">
                {companyProfileData.stats.upcomingSqFt}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1E1D1B] mt-2">
                Upcoming Masterplans
              </div>
              <p className="text-[11px] text-[#7A7570] mt-1">In prime urban locations</p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#E6E1DC] shadow-xs text-center">
              <div className="font-editorial text-3xl sm:text-4xl font-bold text-[#8A563D]">
                {companyProfileData.stats.yearsExperience}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1E1D1B] mt-2">
                Years Experience
              </div>
              <p className="text-[11px] text-[#7A7570] mt-1">Specialized redevelopment expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR MISSION & PRINCIPLES */}
      <section className="py-20 bg-[#EFEAE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A563D] block">
              OUR MISSION & PRINCIPLES
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1E1D1B]">
              Committed to Diligence, Integrity & Efficiency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companyProfileData.missionStatements.map((m, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-[#E6E1DC] shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF1EC] text-[#8A563D] flex items-center justify-center font-editorial text-xl font-bold">
                    0{idx + 1}
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-[#1E1D1B]">{m.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6B6661] leading-relaxed">{m.description}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#F2ECE6] flex items-center gap-2 text-xs text-[#8A563D] font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Citadel Core Value</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LEADERSHIP & PARTNERS */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A563D] block">
              OUR LEADERSHIP
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#1E1D1B]">
              Experience of Partners
            </h2>
            <p className="text-sm text-[#6E6A65]">
              Led by young, dynamic, and motivated professionals supported by highly qualified partners and seasoned mentors.
            </p>
          </div>

          {/* Key Partners & Associate Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            {companyProfileData.partners.map((partner) => (
              <div
                key={partner.name}
                className="bg-white rounded-3xl p-8 border border-[#E6E1DC] shadow-xs flex flex-col justify-between space-y-6"
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-18 h-22 sm:w-20 sm:h-24 rounded-2xl overflow-hidden bg-[#FAF1EC] border-2 border-[#E8C2AF] text-[#8A563D] shrink-0 shadow-xs flex items-center justify-center">
                      <span className="font-editorial text-2xl font-bold select-none">
                        {partner.initials}
                      </span>
                      {partner.photo && (
                        <img
                          src={getAssetUrl(partner.photo)}
                          alt={partner.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-editorial text-2xl font-bold text-[#1E1D1B]">
                        {partner.name}
                      </h3>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8A563D] block">
                        {partner.role}
                      </span>
                      <span className="text-[11px] text-[#7A7570] block mt-0.5 font-medium">
                        {partner.qualifications} &bull; {partner.experienceYears} Years Experience
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E1D1B] block border-b border-[#F0EBE5] pb-2">
                      Key Responsibilities:
                    </span>
                    <ul className="space-y-2">
                      {partner.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-[#5C5752] leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-[#8A563D] shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Associates & Consultants */}
          <div className="bg-[#1E1D1B] text-white rounded-3xl p-8 sm:p-12 border border-[#3A3835] max-w-5xl mx-auto">
            <div className="max-w-3xl mb-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block">
                EXPERIENCE OF ASSOCIATES
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-white">
                Backed by Decades of Architectural & Engineering Mastery
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {companyProfileData.associates.map((assoc) => (
                <div
                  key={assoc.name}
                  className="bg-[#292724] rounded-2xl p-6 border border-[#44403A] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8C2AF] bg-[#141312] px-3 py-1 rounded-full border border-white/10">
                      {assoc.domain}
                    </span>
                    <span className="text-xs font-bold text-[#DDD6CE]">
                      {assoc.experienceYears}+ Yrs Exp
                    </span>
                  </div>

                  <h4 className="font-editorial text-xl font-bold text-white pt-1">
                    {assoc.name}
                  </h4>
                  <div className="text-xs font-semibold text-[#E8C2AF]">
                    {assoc.trackRecord}
                  </div>
                  <p className="text-xs text-[#B5AFA8] leading-relaxed">
                    {assoc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONTACT US BANNER */}
      <section className="py-16 bg-[#1E1D1B] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block">
            PUNE HEAD OFFICE
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white">
            Visit Our Prabhat Road Office
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-[#DDD6CE] max-w-xl mx-auto">
            <MapPin className="w-4 h-4 text-[#E8C2AF] shrink-0" />
            <span>{companyProfileData.headOffice.address}</span>
          </div>

          <div className="pt-4 flex justify-center items-center">
            <button
              onClick={() => {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#E8C2AF] hover:bg-[#DFB29D] text-[#1E1D1B] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors cursor-pointer shadow-lg inline-flex items-center gap-2"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
