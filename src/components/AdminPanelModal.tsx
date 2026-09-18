import React, { useState, useEffect } from 'react';
import {
  X,
  HardHat,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Upload,
  LogOut,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Send,
  Download,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { Project, ProjectLiveUpdate } from '../types';
import { projectsData } from '../data/projectsData';
import { projectUpdatesService } from '../services/projectUpdatesService';
import { adminAuthService } from '../services/adminAuthService';
import {
  sheetsWebhookService,
  StoredLeadRecord,
  WebhookTestResult,
} from '../services/sheetsWebhookService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProjectOnSite?: (projectId: string) => void;
}

const APPS_SCRIPT_TEMPLATE = `// Google Apps Script (Code.gs) for Citadel Group Leads Integration
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Auto-create and style headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Form Type",
        "Name",
        "Phone",
        "Email",
        "Project / Role",
        "Details",
        "Message"
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#E8C2AF");
    }
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    sheet.appendRow([
      timestamp,
      data.formType || "Website Inquiry",
      data.name || "",
      data.phone || "",
      data.email || "",
      data.projectOrRole || "",
      data.details || "",
      data.message || ""
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Lead row added successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "active", message: "Citadel Webhook Endpoint is Running" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

const COMMON_STAGES = [
  'Demolition & Site Clearance',
  'Excavation & Shoring',
  'Piling & Foundation',
  'Plinth & Substructure',
  'RCC Slab Concreting',
  'Brickwork & Masonry',
  'Internal & External Plastering',
  'Electrical & Plumbing',
  'Flooring & Tiling',
  'Elevations & Painting',
  'Terrace & Waterproofing',
  'Finishing & Snagging',
  'OC Granted & Handover',
];

const SAMPLE_SITE_PHOTOS = [
  {
    label: 'RCC Slab Concreting',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Foundation & Steel Work',
    url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Exterior Elevation Framing',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Interior Finishing & Plaster',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onSelectProjectOnSite,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectsData[0]?.id || '');
  const [updates, setUpdates] = useState<ProjectLiveUpdate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'manager' | 'code' | 'leads'>('manager');
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Leads & Google Sheet Webhook State
  const [storedLeads, setStoredLeads] = useState<StoredLeadRecord[]>([]);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [isEditingWebhookUrl, setIsEditingWebhookUrl] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<WebhookTestResult | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptDetails, setShowScriptDetails] = useState(false);
  const [isRetryingId, setIsRetryingId] = useState<string | null>(null);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [leadsFilter, setLeadsFilter] = useState('all');

  // Form State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formStage, setFormStage] = useState('RCC Slab Concreting');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  // Reload updates when project changes
  const loadUpdates = (pId: string) => {
    const list = projectUpdatesService.getLiveUpdates(pId);
    setUpdates(list);
  };

  useEffect(() => {
    if (isOpen && selectedProjectId) {
      loadUpdates(selectedProjectId);
    }
  }, [isOpen, selectedProjectId]);

  // Subscribe to updates service
  useEffect(() => {
    const unsub = projectUpdatesService.subscribe(() => {
      if (selectedProjectId) {
        loadUpdates(selectedProjectId);
      }
    });
    return unsub;
  }, [selectedProjectId]);

  // Load and subscribe to stored leads
  useEffect(() => {
    if (isOpen) {
      setStoredLeads(sheetsWebhookService.getStoredLeads());
      setWebhookUrlInput(sheetsWebhookService.getWebhookUrl());
      const unsub = sheetsWebhookService.subscribe(() => {
        setStoredLeads(sheetsWebhookService.getStoredLeads());
        setWebhookUrlInput(sheetsWebhookService.getWebhookUrl());
      });
      return unsub;
    }
  }, [isOpen]);

  const handleSendTestLead = async () => {
    setIsTestingWebhook(true);
    setFeedbackMsg('Dispatching test row to Google Sheet...');
    const result = await sheetsWebhookService.submitLead({
      formType: 'Admin Verification Test',
      name: 'Citadel Operations Desk',
      phone: '+91 87799 75270',
      email: 'enquiry@thecitadelgroup.co',
      projectOrRole: currentProject.title,
      details: 'Automated connectivity test from Admin Panel',
      message: 'Testing live row append to Google Sheet at ' + new Date().toLocaleTimeString(),
    });
    setIsTestingWebhook(false);
    if (result.success) {
      setFeedbackMsg('Test lead dispatched! Row appended to Google Sheet.');
    } else {
      setFeedbackMsg('Submission notice: ' + (result.error || 'Check access settings'));
    }
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const handleDiagnoseConnection = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    const res = await sheetsWebhookService.testWebhookConnection(webhookUrlInput);
    setDiagnosticResult(res);
    setIsDiagnosing(false);
  };

  const handleRetryLead = async (leadId: string) => {
    setIsRetryingId(leadId);
    const res = await sheetsWebhookService.retryLead(leadId);
    setIsRetryingId(null);
    if (res.success) {
      setFeedbackMsg('Lead synced successfully to Google Sheet!');
    } else {
      setFeedbackMsg('Sync failed: ' + (res.error || 'Check webhook access'));
    }
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const handleRetryAllPending = async () => {
    setIsRetryingAll(true);
    const { count, failed } = await sheetsWebhookService.retryAllPending();
    setIsRetryingAll(false);
    if (failed === 0 && count > 0) {
      setFeedbackMsg(`Successfully synced all ${count} pending lead(s) to Google Sheet!`);
    } else if (count > 0) {
      setFeedbackMsg(`Synced ${count} lead(s), ${failed} still failing.`);
    } else {
      setFeedbackMsg('Sync attempt failed. Please check Apps Script deployment access.');
    }
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSaveWebhookUrl = () => {
    sheetsWebhookService.setCustomWebhookUrl(webhookUrlInput);
    setIsEditingWebhookUrl(false);
    setFeedbackMsg('Google Sheet Webhook URL saved successfully.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleResetWebhookUrl = () => {
    sheetsWebhookService.resetWebhookUrl();
    setWebhookUrlInput(sheetsWebhookService.getWebhookUrl());
    setIsEditingWebhookUrl(false);
    setFeedbackMsg('Webhook URL reset to primary deployment default.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleExportLeadsCsv = () => {
    if (storedLeads.length === 0) {
      alert('No leads recorded in local log yet.');
      return;
    }
    const headers = ['Date & Time', 'Type', 'Name', 'Phone', 'Email', 'Project / Role', 'Details / Budget', 'Message'];
    const rows = storedLeads.map((l) => [
      `"${l.timestamp.replace(/"/g, '""')}"`,
      `"${l.formType.replace(/"/g, '""')}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.projectOrRole || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citadel-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const currentProject = projectsData.find((p) => p.id === selectedProjectId) || projectsData[0];

  const handleOpenAdd = () => {
    setEditingCardId(null);
    setFormTitle('');
    setFormStage('RCC Slab Concreting');
    const now = new Date();
    const monthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    setFormDate(monthYear);
    setFormDescription('');
    setFormImage(SAMPLE_SITE_PHOTOS[0].url);
    setIsEditing(true);
  };

  const handleOpenEdit = (card: ProjectLiveUpdate) => {
    setEditingCardId(card.id);
    setFormTitle(card.title);
    setFormStage(card.stage);
    setFormDate(card.date);
    setFormDescription(card.description);
    setFormImage(card.image);
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingCardId) {
      // Edit existing
      projectUpdatesService.editUpdate(selectedProjectId, {
        id: editingCardId,
        title: formTitle.trim(),
        stage: formStage,
        date: formDate.trim(),
        description: formDescription.trim(),
        image: formImage.trim() || SAMPLE_SITE_PHOTOS[0].url,
      });
      showFeedback('Milestone card updated successfully!');
    } else {
      // Add new
      projectUpdatesService.addUpdate(selectedProjectId, {
        title: formTitle.trim(),
        stage: formStage,
        date: formDate.trim(),
        description: formDescription.trim(),
        image: formImage.trim() || SAMPLE_SITE_PHOTOS[0].url,
      });
      showFeedback('New milestone card added to project!');
    }

    setIsEditing(false);
  };

  const handleDelete = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this construction milestone card?')) {
      projectUpdatesService.deleteUpdate(selectedProjectId, cardId);
      showFeedback('Milestone card removed.');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm(`Reset "${currentProject.title}" live updates back to code factory defaults?`)) {
      projectUpdatesService.resetToDefault(selectedProjectId);
      showFeedback('Reset to default code data.');
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleCopyCode = () => {
    const code = projectUpdatesService.generateCodeSnippet(selectedProjectId);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    adminAuthService.logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#FCFAF8] rounded-3xl border border-[#E6E1DC] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* 1. TOP HEADER */}
        <div className="px-6 py-4 border-b border-[#E8E2DA] bg-[#F4EFEA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8A563D] text-white flex items-center justify-center shadow-xs">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A563D]">
                  CITADEL SITE ADMIN
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#E5F7EB] text-[#1E7E34] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E7E34] animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1E1D1B] leading-tight">
                On-Site Live Construction Progress Manager
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-[#6E6A65] hover:text-[#1E1D1B] px-3 py-1.5 rounded-lg hover:bg-white/80 transition-colors flex items-center gap-1.5"
              title="Lock & Exit Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#6E6A65] hover:text-[#1E1D1B] p-2 rounded-full hover:bg-white/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. PROJECT SELECTOR & TABS BAR */}
        <div className="px-6 py-3 bg-white border-b border-[#EAE4DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Project Dropdown */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <label className="text-xs font-bold text-[#3C3A36] uppercase tracking-wider whitespace-nowrap">
              Project:
            </label>
            <div className="relative flex-1 sm:w-72">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setIsEditing(false);
                }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-[#FAF8F5] border border-[#D8D1C7] rounded-xl text-xs font-semibold text-[#1E1D1B] focus:border-[#8A563D] focus:outline-hidden cursor-pointer"
              >
                {projectsData.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status} • {p.location})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#7A7570] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {onSelectProjectOnSite && (
              <button
                onClick={() => {
                  onSelectProjectOnSite(selectedProjectId);
                  onClose();
                }}
                className="text-[11px] font-semibold text-[#8A563D] hover:underline flex items-center gap-1 whitespace-nowrap"
                title="View on public site"
              >
                <span>View on site</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tab Switcher & Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex bg-[#F2ECE6] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('manager')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'manager'
                    ? 'bg-white text-[#1E1D1B] shadow-xs'
                    : 'text-[#6E6A65] hover:text-[#1E1D1B]'
                }`}
              >
                Cards ({updates.length})
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'leads'
                    ? 'bg-white text-[#1E1D1B] shadow-xs'
                    : 'text-[#6E6A65] hover:text-[#1E1D1B]'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E7E34]" />
                <span>Google Sheet Leads ({storedLeads.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'code'
                    ? 'bg-white text-[#1E1D1B] shadow-xs'
                    : 'text-[#6E6A65] hover:text-[#1E1D1B]'
                }`}
              >
                Code Snippet
              </button>
            </div>

            {activeTab === 'manager' && !isEditing && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8A563D] hover:bg-[#734732] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. FEEDBACK TOAST */}
        {feedbackMsg && (
          <div className="bg-[#E7F7ED] border-b border-[#C8EAD3] px-6 py-2 text-xs font-semibold text-[#1C7430] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedbackMsg}</span>
            </div>
            <span className="text-[11px] text-[#28A745]">Visible live on website now</span>
          </div>
        )}

        {/* 4. MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5]">
          {activeTab === 'manager' ? (
            <div>
              {/* EDIT / ADD FORM MODAL OVERLAY OR IN-PLACE FORM */}
              {isEditing ? (
                <div className="bg-white rounded-2xl p-6 border border-[#E6E1DC] shadow-sm mb-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EBE6]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] block">
                        {editingCardId ? 'UPDATE MILESTONE' : 'NEW ON-SITE PROGRESS CARD'}
                      </span>
                      <h3 className="font-editorial text-xl font-bold text-[#1E1D1B]">
                        {editingCardId ? 'Edit Milestone Card' : `Add Live Update for ${currentProject.title}`}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-[#7A7570] hover:text-[#1E1D1B] px-2.5 py-1 rounded-lg hover:bg-[#F2ECE6]"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveForm} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Milestone Title */}
                      <div>
                        <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                          Milestone Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. 5th Floor RCC Slab Concreting Complete"
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-xs sm:text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      {/* Construction Stage */}
                      <div>
                        <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                          Construction Stage Badge *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            list="stages-datalist"
                            value={formStage}
                            onChange={(e) => setFormStage(e.target.value)}
                            placeholder="Select or type custom stage"
                            className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-xs sm:text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                          />
                          <datalist id="stages-datalist">
                            {COMMON_STAGES.map((stg) => (
                              <option key={stg} value={stg} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Date / Month */}
                      <div>
                        <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                          Date / Timeline Tag *
                        </label>
                        <input
                          type="text"
                          required
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          placeholder="e.g. September 2026 or Week 3, Oct 2026"
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-xs sm:text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      {/* Photo Source URL */}
                      <div>
                        <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                          Site Photo (URL or Upload)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formImage}
                            onChange={(e) => setFormImage(e.target.value)}
                            placeholder="Image URL or choose sample below"
                            className="flex-1 px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-xs text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden"
                          />
                          <label
                            className="px-3 py-2 bg-[#EFEAE6] hover:bg-[#E5DFD7] text-[#3C3A36] rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Upload image from device"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Quick Photo Presets */}
                    <div>
                      <span className="block text-[11px] font-semibold text-[#6E6A65] mb-1.5">
                        Quick Construction Site Photo Presets:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SAMPLE_SITE_PHOTOS.map((photo, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setFormImage(photo.url)}
                            className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              formImage === photo.url
                                ? 'border-[#8A563D] bg-[#F7F2EC]'
                                : 'border-[#E6E1DC] bg-[#FAF8F5] hover:bg-white'
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={photo.label}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <span className="text-[10px] font-medium text-[#2C2B29] truncate">
                              {photo.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-[#3C3A36] mb-1">
                        Site Engineer Progress Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Detailed technical progress: e.g., High-grade M30 concrete poured with complete quality cube test clearances. Electrical conduits laid successfully before shuttering removal."
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-xs sm:text-sm text-[#1E1D1B] focus:border-[#8A563D] focus:bg-white focus:outline-hidden resize-none"
                      />
                    </div>

                    {/* Form Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-[#F2ECE6] text-[#4E4B47] text-xs font-semibold rounded-xl hover:bg-[#EAE3DC] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#8A563D] hover:bg-[#734732] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        {editingCardId ? 'Save Changes' : 'Add Milestone Card'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* LIST OF CARDS */}
              {updates.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#DDD6CE] p-8">
                  <div className="w-14 h-14 rounded-full bg-[#F5EFE9] text-[#8A563D] flex items-center justify-center mx-auto mb-3">
                    <HardHat className="w-7 h-7" />
                  </div>
                  <h4 className="font-editorial text-xl font-bold text-[#1E1D1B]">
                    No Live Updates for {currentProject.title}
                  </h4>
                  <p className="text-xs text-[#6E6A65] max-w-md mx-auto mt-1 mb-5">
                    Currently, this project does not display an On-Site Live Progress section. 
                    Add your first milestone card above to immediately publish this section on the live project page!
                  </p>
                  <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8A563D] text-white text-xs font-semibold rounded-xl hover:bg-[#734732] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Milestone Card</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#6E6A65] pb-1">
                    <span>
                      Showing <strong>{updates.length}</strong> active progress milestones for{' '}
                      <strong className="text-[#1E1D1B]">{currentProject.title}</strong>
                    </span>
                    <button
                      onClick={handleResetToDefault}
                      className="text-[11px] text-[#8A563D] hover:underline flex items-center gap-1"
                      title="Revert to initial data"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to factory defaults</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {updates.map((card, idx) => (
                      <div
                        key={card.id}
                        className="bg-white rounded-2xl overflow-hidden border border-[#E6E1DC] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow"
                      >
                        {/* Image & Badges */}
                        <div className="relative h-40 bg-[#E5DFD7] overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-[#1E1D1B]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                            {card.stage}
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-[#E8C2AF] text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
                            {card.date}
                          </div>
                        </div>

                        {/* Card Text */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#8C8781] mb-1">
                              <span>Milestone #{idx + 1}</span>
                            </div>
                            <h4 className="font-editorial text-base font-bold text-[#1E1D1B] leading-snug">
                              {card.title}
                            </h4>
                            <p className="text-xs text-[#5E5954] mt-1.5 line-clamp-3 leading-relaxed">
                              {card.description}
                            </p>
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-3 border-t border-[#F0EBE6] flex items-center justify-between">
                            <span className="text-[10px] font-medium text-[#1E7E34] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Live on Website</span>
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(card)}
                                className="p-1.5 text-[#6E6A65] hover:text-[#8A563D] hover:bg-[#FAF8F5] rounded-lg transition-colors"
                                title="Edit milestone card"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(card.id)}
                                className="p-1.5 text-[#6E6A65] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete milestone card"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'leads' ? (
            /* GOOGLE SHEETS & LEADS VIEW */
            <div className="space-y-6">
              {/* Webhook Configuration & Status Card */}
              <div className="bg-white rounded-2xl p-6 border border-[#E6E1DC] shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0EBE6] pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8C2AF]/30 text-[#8A563D] flex items-center justify-center shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D]">
                          GOOGLE SHEETS INTEGRATION
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#8A563D] animate-pulse" />
                      </div>
                      <h3 className="font-editorial text-xl font-bold text-[#1E1D1B]">
                        Google Sheets Lead Forwarding & Diagnostics
                      </h3>
                      <p className="text-xs text-[#6E6A65] mt-0.5">
                        Inquiries from Quote Modals, Contact Page, Brochure Downloads, and Careers flow directly to your Google Sheet and are mirrored in the local audit log.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleDiagnoseConnection}
                      disabled={isDiagnosing}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F5] border border-[#D8D1C7] hover:bg-[#F2ECE6] text-[#1E1D1B] text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#8A563D] ${isDiagnosing ? 'animate-spin' : ''}`} />
                      <span>{isDiagnosing ? 'Testing Connection...' : 'Test Connection'}</span>
                    </button>
                    <button
                      onClick={handleSendTestLead}
                      disabled={isTestingWebhook}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#8A563D] hover:bg-[#734732] text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTestingWebhook ? 'Dispatching...' : 'Send Test Lead'}</span>
                    </button>
                    <button
                      onClick={handleExportLeadsCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F5] border border-[#D8D1C7] hover:bg-[#F2ECE6] text-[#1E1D1B] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8A563D]" />
                      <span>Export CSV ({storedLeads.length})</span>
                    </button>
                  </div>
                </div>

                {/* Diagnostic Result Banner (if tested) */}
                {diagnosticResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                      diagnosticResult.success
                        ? 'bg-[#EBF9EE] border-[#C3ECCB] text-[#1E7E34]'
                        : 'bg-[#FFF5F0] border-[#F4D2C3] text-[#8A563D]'
                    }`}
                  >
                    {diagnosticResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#1E7E34]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#8A563D]" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="font-bold text-sm">
                        {diagnosticResult.success
                          ? 'Endpoint Verified & Connected!'
                          : `Connection Issue: HTTP ${diagnosticResult.statusCode || 'Error'}`}
                      </div>
                      <p>
                        {diagnosticResult.message ||
                          diagnosticResult.error ||
                          'Check your Google Apps Script permissions.'}
                      </p>
                      {!diagnosticResult.success && (
                        <div className="pt-1">
                          <button
                            onClick={() => setShowScriptDetails(true)}
                            className="font-semibold text-[#8A563D] underline hover:text-[#5C3928] cursor-pointer"
                          >
                            Open Setup Guide & Copy Apps Script Code &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Webhook URL bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3C3A36]">Active Google Apps Script Webhook Endpoint:</span>
                    {!isEditingWebhookUrl ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowScriptDetails(!showScriptDetails)}
                          className="text-[#8A563D] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{showScriptDetails ? 'Hide Setup Script' : 'View Setup Script (Code.gs)'}</span>
                        </button>
                        <button
                          onClick={() => setIsEditingWebhookUrl(true)}
                          className="text-[#8A563D] font-semibold hover:underline cursor-pointer"
                        >
                          Edit URL
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveWebhookUrl}
                          className="text-[#1E7E34] font-bold hover:underline cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleResetWebhookUrl}
                          className="text-[#8A563D] hover:underline cursor-pointer"
                        >
                          Reset Default
                        </button>
                        <button
                          onClick={() => {
                            setWebhookUrlInput(sheetsWebhookService.getWebhookUrl());
                            setIsEditingWebhookUrl(false);
                          }}
                          className="text-[#7A7570] hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingWebhookUrl ? (
                    <div className="p-3 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl text-xs font-mono text-[#5C5752] break-all select-all flex items-center justify-between gap-2">
                      <span className="truncate">{sheetsWebhookService.getWebhookUrl()}</span>
                      <span className="text-[10px] font-sans font-semibold bg-[#FAF0EB] text-[#8A563D] px-2 py-0.5 rounded-full shrink-0">
                        Current
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webhookUrlInput}
                        onChange={(e) => setWebhookUrlInput(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 px-3 py-2 bg-white border border-[#8A563D] rounded-xl text-xs font-mono text-[#1E1D1B] focus:outline-hidden"
                      />
                      <button
                        onClick={handleSaveWebhookUrl}
                        className="px-4 py-2 bg-[#8A563D] text-white font-semibold text-xs rounded-xl"
                      >
                        Save URL
                      </button>
                    </div>
                  )}
                </div>

                {/* Setup Guide & Code Snippet Box (Collapsible) */}
                {showScriptDetails && (
                  <div className="p-4 bg-[#FAF8F5] border border-[#DDD6CE] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-[#8A563D]" />
                        <h4 className="font-bold text-xs text-[#1E1D1B]">
                          Google Apps Script (Code.gs) for your Google Sheet
                        </h4>
                      </div>
                      <button
                        onClick={handleCopyScript}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#8A563D] hover:bg-[#734732] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                      >
                        {copiedScript ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied Code.gs!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Code.gs</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-[#5C5752] space-y-1.5">
                      <p className="font-semibold text-[#1E1D1B]">Quick 4-Step Setup:</p>
                      <ol className="list-decimal list-inside space-y-1 pl-1">
                        <li>
                          Open your target Google Sheet &rarr; click <strong>Extensions &gt; Apps Script</strong>.
                        </li>
                        <li>
                          Paste the script code below into <code>Code.gs</code> and click <strong>Save (💾)</strong>.
                        </li>
                        <li>
                          Click <strong>Deploy &gt; New deployment</strong> (or <em>Manage deployments &gt; Edit</em>) &rarr; select type <strong>Web app</strong>.
                        </li>
                        <li>
                          Set <strong>Execute as:</strong> <code>Me</code> and <strong>Who has access:</strong> <code>Anyone</code> (<strong>Essential</strong>, so public leads aren't blocked by 401).
                        </li>
                        <li>
                          Copy the generated Web App URL and paste it into the <strong>Edit URL</strong> field above.
                        </li>
                      </ol>
                    </div>

                    <pre className="bg-[#1E1D1B] text-[#E8C2AF] text-[11px] p-3 rounded-lg overflow-x-auto max-h-[220px] font-mono leading-relaxed select-all">
                      {APPS_SCRIPT_TEMPLATE}
                    </pre>
                  </div>
                )}

                {/* Important deployment tip banner */}
                <div className="p-3 bg-[#FFF9E6] border border-[#FFE082] rounded-xl text-xs text-[#7A5B00] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#C47F00] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Why did an enquiry fail to reach Google Sheets?</strong> When Google Apps Script responds with <em>HTTP 401 ("Sorry, unable to open the file at present")</em>, it means the Web App deployment permission is set to private instead of <strong>"Who has access: Anyone"</strong>. Check the setup guide above to set access to <strong>"Anyone"</strong>. All inquiries are safely stored in your browser audit log below so no leads are ever lost!
                  </div>
                </div>
              </div>

              {/* Recorded Leads Feed & History */}
              <div className="bg-white rounded-2xl p-6 border border-[#E6E1DC] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE6] pb-3">
                  <div>
                    <h4 className="font-editorial text-lg font-bold text-[#1E1D1B]">
                      Recent Submissions & Lead Audit Log
                    </h4>
                    <p className="text-xs text-[#6E6A65]">
                      Local mirror of inquiries ({storedLeads.length} total recorded)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {storedLeads.some((l) => l.status === 'local_only') && (
                      <button
                        onClick={handleRetryAllPending}
                        disabled={isRetryingAll}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8A563D] hover:bg-[#734732] text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRetryingAll ? 'animate-spin' : ''}`} />
                        <span>{isRetryingAll ? 'Syncing...' : 'Sync All Pending to Sheet'}</span>
                      </button>
                    )}

                    <select
                      value={leadsFilter}
                      onChange={(e) => setLeadsFilter(e.target.value)}
                      className="px-3 py-1.5 bg-[#FAF8F5] border border-[#D8D1C7] rounded-lg text-xs font-semibold text-[#1E1D1B]"
                    >
                      <option value="all">All Submissions</option>
                      <option value="quote">Quotes & Consultations</option>
                      <option value="contact">Contact Messages</option>
                      <option value="careers">Careers Applications</option>
                      <option value="brochure">Brochure / Floorplans</option>
                    </select>

                    {storedLeads.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Clear local history log? Leads already in Google Sheet are unaffected.')) {
                            sheetsWebhookService.clearStoredLeads();
                          }
                        }}
                        className="text-xs text-[#8A563D] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Clear Log
                      </button>
                    )}
                  </div>
                </div>

                {/* Pending leads notice banner */}
                {storedLeads.some((l) => l.status === 'local_only') && (
                  <div className="p-3 bg-[#FFF5F0] border border-[#F4D2C3] rounded-xl text-xs text-[#8A563D] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#8A563D]" />
                      <span>
                        <strong>
                          {storedLeads.filter((l) => l.status === 'local_only').length} lead(s)
                        </strong>{' '}
                        are preserved in this browser log awaiting synchronization with Google Sheets.
                      </span>
                    </div>
                    <button
                      onClick={handleRetryAllPending}
                      disabled={isRetryingAll}
                      className="font-bold underline hover:text-[#5C3928] whitespace-nowrap cursor-pointer"
                    >
                      Retry Sync Now
                    </button>
                  </div>
                )}

                {storedLeads.length === 0 ? (
                  <div className="py-12 text-center text-[#7A7570] space-y-2">
                    <FileSpreadsheet className="w-10 h-10 mx-auto text-[#D8D1C7]" />
                    <p className="text-sm font-semibold text-[#3C3A36]">No inquiries submitted yet</p>
                    <p className="text-xs text-[#8C8781] max-w-sm mx-auto">
                      Whenever visitors submit an enquiry on the website, their details stream to your connected Google Sheet and remain permanently backed up in this local audit log.
                    </p>
                    <button
                      onClick={handleSendTestLead}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF8F5] border border-[#DDD6CE] hover:bg-[#F2ECE6] text-[#1E1D1B] text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-[#8A563D]" />
                      <span>Send a Sample Test Lead</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {storedLeads
                      .filter((lead) => {
                        if (leadsFilter === 'all') return true;
                        const lower = lead.formType.toLowerCase();
                        if (leadsFilter === 'quote') return lower.includes('quote') || lower.includes('consultation');
                        if (leadsFilter === 'contact') return lower.includes('contact');
                        if (leadsFilter === 'careers') return lower.includes('career');
                        if (leadsFilter === 'brochure') return lower.includes('brochure') || lower.includes('plan');
                        return true;
                      })
                      .map((lead) => (
                        <div
                          key={lead.id}
                          className={`p-4 rounded-xl border transition-colors space-y-2 ${
                            lead.status === 'synced'
                              ? 'border-[#EDE7E1] bg-[#FAF8F5] hover:bg-[#F7F3EE]'
                              : 'border-[#F4D2C3] bg-[#FFFBF8] hover:bg-[#FFF6F0]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8C2AF]/40 text-[#8A563D]">
                                {lead.formType}
                              </span>
                              <span className="font-bold text-sm text-[#1E1D1B]">{lead.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#7A7570]">
                              <span>{lead.timestamp}</span>
                              {lead.status === 'synced' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#1E7E34] bg-[#E5F7EB] px-2 py-0.5 rounded-full font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Synced to Sheet
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] text-[#8A563D] bg-[#FAF0EB] px-2 py-0.5 rounded-full font-medium"
                                    title={lead.errorDetails || 'Pending Sync'}
                                  >
                                    <AlertCircle className="w-3 h-3" />
                                    Saved Locally (Pending Sync)
                                  </span>
                                  <button
                                    onClick={() => handleRetryLead(lead.id)}
                                    disabled={isRetryingId === lead.id}
                                    className="text-[11px] font-bold text-[#8A563D] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <RefreshCw
                                      className={`w-3 h-3 ${isRetryingId === lead.id ? 'animate-spin' : ''}`}
                                    />
                                    <span>Retry</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#5C5752] pt-1">
                            <div>
                              <strong className="text-[#3C3A36]">Phone:</strong>{' '}
                              <a href={`tel:${lead.phone}`} className="text-[#8A563D] hover:underline font-medium">
                                {lead.phone}
                              </a>
                            </div>
                            <div>
                              <strong className="text-[#3C3A36]">Email:</strong>{' '}
                              <a href={`mailto:${lead.email}`} className="text-[#8A563D] hover:underline font-medium">
                                {lead.email}
                              </a>
                            </div>
                            <div>
                              <strong className="text-[#3C3A36]">Project / Role:</strong>{' '}
                              <span className="font-medium text-[#1E1D1B]">{lead.projectOrRole || 'General'}</span>
                            </div>
                          </div>

                          {lead.details && (
                            <div className="text-xs text-[#6E6A65] bg-white p-2 rounded-lg border border-[#EDE7E1]">
                              <strong className="text-[#3C3A36]">Details:</strong> {lead.details}
                            </div>
                          )}

                          {lead.message && (
                            <div className="text-xs text-[#3C3A36] italic bg-white p-2.5 rounded-lg border border-[#EDE7E1]">
                              "{lead.message}"
                            </div>
                          )}

                          {lead.status === 'local_only' && lead.errorDetails && (
                            <div className="text-[11px] text-[#8A563D] bg-[#FFF5F0] p-2 rounded-lg border border-[#F4D2C3] flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-[#8A563D] shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <strong>Status Details:</strong> {lead.errorDetails}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* CODE EXPORT VIEW */
            <div className="bg-white rounded-2xl p-6 border border-[#E6E1DC] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE6] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A563D] block">
                    CODEBASE EXPORT / REPO PERSISTENCE
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-[#1E1D1B]">
                    TypeScript Code for projectsData.ts
                  </h3>
                  <p className="text-xs text-[#6E6A65] mt-0.5">
                    Changes are already saved in the browser. To permanently bake these updates into your project code repository, copy and paste this block into <code className="bg-[#F0EBE6] px-1 py-0.5 rounded text-[#1E1D1B]">src/data/projectsData.ts</code> under <code className="text-[#8A563D]">{selectedProjectId}</code>.
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8A563D] hover:bg-[#734732] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-[#1E1D1B] text-[#E8C2AF] text-xs p-4 rounded-xl overflow-x-auto max-h-[380px] font-mono leading-relaxed select-all">
                  {projectUpdatesService.generateCodeSnippet(selectedProjectId)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 5. FOOTER STATUS BAR */}
        <div className="px-6 py-3 bg-[#F4EFEA] border-t border-[#E8E2DA] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6E6A65]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1E7E34]" />
            <span>
              Real-time synchronization active. Any edits immediately refresh the public carousel.
            </span>
          </div>
          <div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#E6E1DC] hover:bg-[#DDD6CE] text-[#1E1D1B] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
