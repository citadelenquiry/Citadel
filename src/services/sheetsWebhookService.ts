import { CITADEL_WHATSAPP_CONFIG, formatEnquiryForWhatsApp, createWhatsAppUrl } from '../utils/whatsapp';

export type DeliveryMode = 'dual' | 'sheets_only' | 'email_only';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: 'ssl' | 'tls';
}

export interface DirectEmailResult {
  success: boolean;
  mode?: string;
  message?: string;
  error?: string;
}

export interface LeadSubmissionPayload {
  formType: string;
  name: string;
  phone: string;
  email: string;
  projectOrRole?: string;
  details?: string;
  message?: string;
  notificationEmail?: string;
  whatsappNumber?: string;
}

export interface StoredLeadRecord extends LeadSubmissionPayload {
  id: string;
  timestamp: string;
  status: 'synced' | 'local_only';
  errorDetails?: string;
  deliveryChannels?: string[];
}

export interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  message?: string;
  error?: string;
}

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbz8cRvGuCHxi6sr-T0S3laRAwM7jmuNbvv303AtC5YwmFOYBiNVOTeYbw8HateV8tzdoA/exec';

const STORAGE_KEY_LEADS = 'citadel_recorded_leads';
const STORAGE_KEY_CUSTOM_URL = 'citadel_custom_sheets_webhook_url';
const STORAGE_KEY_DELIVERY_MODE = 'citadel_delivery_mode';
const STORAGE_KEY_SMTP_CONFIG = 'citadel_smtp_config';
const STORAGE_KEY_NOTIFY_EMAIL = 'citadel_notification_email';

class SheetsWebhookService {
  private listeners: (() => void)[] = [];

  // ==================== CONFIGURATION ====================

  public getDeliveryMode(): DeliveryMode {
    const mode = localStorage.getItem(STORAGE_KEY_DELIVERY_MODE);
    if (mode === 'sheets_only' || mode === 'email_only' || mode === 'dual') {
      return mode;
    }
    return 'dual'; // Default for maximum 100% operational resiliency
  }

  public setDeliveryMode(mode: DeliveryMode): void {
    localStorage.setItem(STORAGE_KEY_DELIVERY_MODE, mode);
    this.notify();
  }

  public getNotificationEmail(): string {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFY_EMAIL);
    if (saved && saved.trim()) return saved.trim();
    return CITADEL_WHATSAPP_CONFIG.notificationEmail || 'citadelenquiry@gmail.com, enquiry@thecitadelgroup.co';
  }

  public setNotificationEmail(email: string): void {
    if (!email || !email.trim()) {
      localStorage.removeItem(STORAGE_KEY_NOTIFY_EMAIL);
    } else {
      localStorage.setItem(STORAGE_KEY_NOTIFY_EMAIL, email.trim());
    }
    this.notify();
  }

  public getSmtpConfig(): SmtpConfig | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SMTP_CONFIG);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public setSmtpConfig(config: SmtpConfig | null): void {
    if (!config) {
      localStorage.removeItem(STORAGE_KEY_SMTP_CONFIG);
    } else {
      localStorage.setItem(STORAGE_KEY_SMTP_CONFIG, JSON.stringify(config));
    }
    this.notify();
  }

  public getWebhookUrl(): string {
    const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_URL);
    if (custom && custom.trim()) {
      return custom.trim();
    }
    const envUrl = (import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    if (envUrl && envUrl.trim()) {
      return envUrl.trim();
    }
    return DEFAULT_WEBHOOK_URL;
  }

  public setCustomWebhookUrl(url: string): void {
    if (!url || !url.trim()) {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
    }
    this.notify();
  }

  public resetWebhookUrl(): void {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    this.notify();
  }

  // ==================== STORED LEADS ====================

  public getStoredLeads(): StoredLeadRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_LEADS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public clearStoredLeads(): void {
    localStorage.removeItem(STORAGE_KEY_LEADS);
    this.notify();
  }

  // ==================== DIRECT SERVER / SMTP EMAIL ====================

  public async sendDirectEmail(payload: LeadSubmissionPayload): Promise<DirectEmailResult> {
    const notificationEmail = payload.notificationEmail || this.getNotificationEmail();
    const smtp = this.getSmtpConfig();

    try {
      const resp = await fetch('/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          notificationEmail,
          smtp,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        return data;
      }

      return {
        success: false,
        error: `Server responded with HTTP ${resp.status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error reaching email dispatch service',
      };
    }
  }

  public async testDirectEmail(customSmtp?: SmtpConfig): Promise<DirectEmailResult> {
    const recipient = this.getNotificationEmail();
    const smtp = customSmtp !== undefined ? customSmtp : this.getSmtpConfig();

    try {
      const resp = await fetch('/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Citadel Operations Probe',
          phone: '+91 87799 75270',
          email: 'diagnostics@thecitadelgroup.in',
          projectOrRole: 'Connectivity Test',
          formType: 'Diagnostic Email Test',
          details: 'Direct Server Mail / SMTP Resilience Test',
          message: 'Verifying instant delivery to ' + recipient,
          notificationEmail: recipient,
          smtp,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
      return {
        success: false,
        error: `HTTP ${resp.status}: Unable to reach server email script`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error executing email probe',
      };
    }
  }

  // ==================== GOOGLE SHEETS TEST ====================

  public async testWebhookConnection(customUrl?: string): Promise<WebhookTestResult> {
    const targetUrl = customUrl || this.getWebhookUrl();
    try {
      const resp = await fetch('/api/sheets/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: targetUrl }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch {
      // Fallback if backend API is unreachable
    }

    // Direct browser attempt
    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ test: true }),
      });
      return {
        success: true,
        message: 'Dispatched via browser no-cors channel.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Connection failure',
      };
    }
  }

  // ==================== RESILIENT LEAD SUBMISSION ====================

  public async submitLead(payload: LeadSubmissionPayload): Promise<{ success: boolean; error?: string }> {
    const webhookUrl = this.getWebhookUrl();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const leadId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const notificationEmail = payload.notificationEmail || this.getNotificationEmail();
    const whatsappNumber = payload.whatsappNumber || CITADEL_WHATSAPP_CONFIG.rawNumber;
    const mode = this.getDeliveryMode();

    const deliveredChannels: string[] = [];
    let sheetsSuccess = false;
    let emailSuccess = false;
    let errorMessage: string | undefined;

    // 1. Google Sheets Dispatch (if mode is 'dual' or 'sheets_only')
    if (mode === 'dual' || mode === 'sheets_only') {
      try {
        const apiResp = await fetch('/api/lead/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            notificationEmail,
            whatsappNumber,
            webhookUrl,
          }),
        });

        if (apiResp.ok) {
          const data = await apiResp.json();
          if (data.success) {
            sheetsSuccess = true;
            deliveredChannels.push('Google Sheets');
          } else {
            errorMessage = data.error;
          }
        }
      } catch {
        // Direct browser no-cors fallback
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              formType: payload.formType,
              name: payload.name,
              phone: payload.phone,
              email: payload.email,
              projectOrRole: payload.projectOrRole,
              details: payload.details,
              message: payload.message,
              notificationEmail,
              whatsappNumber,
            }),
          });
          sheetsSuccess = true;
          deliveredChannels.push('Google Sheets (Direct)');
        } catch (directErr: any) {
          errorMessage = directErr?.message || 'Google Sheets dispatch error';
        }
      }
    }

    // 2. Direct Server / SMTP Email Dispatch (if mode is 'dual' or 'email_only')
    if (mode === 'dual' || mode === 'email_only') {
      try {
        const emailResult = await this.sendDirectEmail({
          ...payload,
          notificationEmail,
        });
        if (emailResult.success) {
          emailSuccess = true;
          deliveredChannels.push(emailResult.mode === 'smtp' ? 'Custom SMTP' : 'Hostinger Direct Mail');
        } else if (!errorMessage) {
          errorMessage = emailResult.error;
        }
      } catch (e: any) {
        if (!errorMessage) errorMessage = e?.message;
      }
    }

    // Determine overall success:
    // In dual mode, if AT LEAST ONE succeeded, the lead is safely recorded and delivered!
    const overallSuccess =
      mode === 'dual'
        ? sheetsSuccess || emailSuccess
        : mode === 'sheets_only'
        ? sheetsSuccess
        : emailSuccess;

    const leadRecord: StoredLeadRecord = {
      id: leadId,
      timestamp,
      formType: payload.formType || 'General Enquiry',
      name: payload.name || '',
      phone: payload.phone || '',
      email: payload.email || '',
      projectOrRole: payload.projectOrRole || '',
      details: payload.details || '',
      message: payload.message || '',
      notificationEmail,
      whatsappNumber,
      status: overallSuccess ? 'synced' : 'local_only',
      errorDetails: overallSuccess ? undefined : errorMessage,
      deliveryChannels: deliveredChannels,
    };

    // Always preserve lead record in local storage for safety and auditability
    try {
      const currentLeads = this.getStoredLeads();
      currentLeads.unshift(leadRecord);
      if (currentLeads.length > 200) currentLeads.length = 200;
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(currentLeads));
      this.notify();
    } catch (e) {
      console.error('Failed to store lead locally:', e);
    }

    return { success: overallSuccess, error: errorMessage };
  }

  public async retryLead(leadId: string): Promise<{ success: boolean; error?: string }> {
    const leads = this.getStoredLeads();
    const targetIndex = leads.findIndex((l) => l.id === leadId);
    if (targetIndex === -1) return { success: false, error: 'Lead not found' };

    const lead = leads[targetIndex];
    const res = await this.submitLead(lead);

    if (res.success) {
      leads[targetIndex].status = 'synced';
      leads[targetIndex].errorDetails = undefined;
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
      this.notify();
      return { success: true };
    } else {
      leads[targetIndex].errorDetails = res.error;
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
      this.notify();
      return { success: false, error: res.error };
    }
  }

  public async retryAllPending(): Promise<{ count: number; failed: number }> {
    const leads = this.getStoredLeads();
    let count = 0;
    let failed = 0;
    for (const lead of leads) {
      if (lead.status === 'local_only') {
        const res = await this.retryLead(lead.id);
        if (res.success) {
          count++;
        } else {
          failed++;
        }
      }
    }
    return { count, failed };
  }

  public getWhatsAppUrlForLead(lead: LeadSubmissionPayload): string {
    const formatted = formatEnquiryForWhatsApp(lead);
    return createWhatsAppUrl(formatted, lead.whatsappNumber || CITADEL_WHATSAPP_CONFIG.intlNumber);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Error in listener:', e);
      }
    });
  }
}

export const sheetsWebhookService = new SheetsWebhookService();
