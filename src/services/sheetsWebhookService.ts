export interface LeadSubmissionPayload {
  formType: string;
  name: string;
  phone: string;
  email: string;
  projectOrRole?: string;
  details?: string;
  message?: string;
}

export interface StoredLeadRecord extends LeadSubmissionPayload {
  id: string;
  timestamp: string;
  status: 'synced' | 'local_only';
  errorDetails?: string;
}

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbz8cRvGuCHxi6sr-T0S3laRAwM7jmuNbvv303AtC5YwmFOYBiNVOTeYbw8HateV8tzdoA/exec';

const STORAGE_KEY_LEADS = 'citadel_recorded_leads';
const STORAGE_KEY_CUSTOM_URL = 'citadel_custom_sheets_webhook_url';

class SheetsWebhookService {
  private listeners: (() => void)[] = [];

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

  public async submitLead(payload: LeadSubmissionPayload): Promise<{ success: boolean; error?: string }> {
    const webhookUrl = this.getWebhookUrl();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const leadId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

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
      status: 'synced',
    };

    let sendSuccess = true;
    let errorMessage: string | undefined;

    try {
      // Send directly to Google Apps Script Web App
      // Using Content-Type: text/plain;charset=utf-8 & mode: 'no-cors' allows 
      // cross-origin POST requests to Google Apps Script without preflight rejection,
      // while delivering the raw JSON string into e.postData.contents
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          formType: leadRecord.formType,
          name: leadRecord.name,
          phone: leadRecord.phone,
          email: leadRecord.email,
          projectOrRole: leadRecord.projectOrRole,
          details: leadRecord.details,
          message: leadRecord.message,
        }),
      });
    } catch (err: any) {
      console.warn('Webhook transmission encountered an issue:', err);
      sendSuccess = false;
      errorMessage = err?.message || 'Network issue during submission';
      leadRecord.status = 'local_only';
      leadRecord.errorDetails = errorMessage;
    }

    // Always preserve lead record in browser storage for safety and auditability
    try {
      const currentLeads = this.getStoredLeads();
      currentLeads.unshift(leadRecord);
      // Keep up to 200 recent leads
      if (currentLeads.length > 200) currentLeads.length = 200;
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(currentLeads));
      this.notify();
    } catch (e) {
      console.error('Failed to store lead locally:', e);
    }

    return { success: sendSuccess, error: errorMessage };
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
