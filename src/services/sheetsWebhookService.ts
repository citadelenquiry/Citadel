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

    // 1. Try via server proxy endpoint for verified delivery and accurate status
    try {
      const apiResp = await fetch('/api/lead/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          webhookUrl,
        }),
      });

      if (apiResp.ok) {
        const data = await apiResp.json();
        if (data.success) {
          sendSuccess = true;
          leadRecord.status = 'synced';
        } else {
          sendSuccess = false;
          errorMessage = data.error || 'Google Sheets Webhook rejected transmission';
          leadRecord.status = 'local_only';
          leadRecord.errorDetails = errorMessage;
        }
      } else {
        throw new Error(`Server returned HTTP ${apiResp.status}`);
      }
    } catch (proxyErr: any) {
      // 2. Direct browser fallback using no-cors
      try {
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
        sendSuccess = true;
        leadRecord.status = 'synced';
      } catch (err: any) {
        console.warn('Direct webhook transmission encountered an issue:', err);
        sendSuccess = false;
        errorMessage = err?.message || 'Network issue during submission';
        leadRecord.status = 'local_only';
        leadRecord.errorDetails = errorMessage;
      }
    }

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

    return { success: sendSuccess, error: errorMessage };
  }

  public async retryLead(leadId: string): Promise<{ success: boolean; error?: string }> {
    const leads = this.getStoredLeads();
    const targetIndex = leads.findIndex((l) => l.id === leadId);
    if (targetIndex === -1) return { success: false, error: 'Lead not found' };

    const lead = leads[targetIndex];
    const webhookUrl = this.getWebhookUrl();

    try {
      const apiResp = await fetch('/api/lead/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: lead.formType,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          projectOrRole: lead.projectOrRole,
          details: lead.details,
          message: lead.message,
          webhookUrl,
        }),
      });

      if (apiResp.ok) {
        const data = await apiResp.json();
        if (data.success) {
          leads[targetIndex].status = 'synced';
          leads[targetIndex].errorDetails = undefined;
          localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
          this.notify();
          return { success: true };
        } else {
          leads[targetIndex].errorDetails = data.error;
          localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
          this.notify();
          return { success: false, error: data.error };
        }
      }
    } catch (err: any) {
      // Direct browser fallback
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(lead),
        });
        leads[targetIndex].status = 'synced';
        leads[targetIndex].errorDetails = undefined;
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
        this.notify();
        return { success: true };
      } catch (directErr: any) {
        return { success: false, error: directErr?.message };
      }
    }

    return { success: false, error: 'Transmission failed' };
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

