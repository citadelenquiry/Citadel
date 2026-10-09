/**
 * WhatsApp integration utilities for Citadel Group
 * Configured Phone: 8779975270 (Sales: +91 87799 75270)
 * Dual Notification Emails: citadelgroupenquiry@gmail.com, enquiry@thecitadelgroup.co
 */

import { CITADEL_NOTIFICATION_EMAILS } from '../config/integrations';

export const CITADEL_WHATSAPP_CONFIG = {
  rawNumber: '8779975270',
  intlNumber: '918779975270',
  displayNumber: '+91 87799 75270',
  notificationEmail: CITADEL_NOTIFICATION_EMAILS,
  officialAddress: 'Swapnapurti Apts, Prabhat Road, Lane 8, Erandwane, Pune – 411 004',
};

/**
 * Creates a WhatsApp click-to-chat URL with pre-filled message (clean URL encoded)
 */
export function createWhatsAppUrl(message: string, customPhone?: string): string {
  const phone = customPhone || CITADEL_WHATSAPP_CONFIG.intlNumber;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats full enquiry submission details into clean, readable plain text (no emojis or broken unicode symbols)
 */
export function formatEnquiryForWhatsApp(lead: {
  name: string;
  phone: string;
  email: string;
  projectOrRole?: string;
  details?: string;
  message?: string;
  formType?: string;
}): string {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return [
    `*NEW ENQUIRY - CITADEL GROUP*`,
    `----------------------------------------`,
    `*Name:* ${lead.name || 'Not provided'}`,
    `*Phone:* ${lead.phone || 'Not provided'}`,
    `*Email:* ${lead.email || 'Not provided'}`,
    `*Project / Interest:* ${lead.projectOrRole || 'Citadel Developments'}`,
    lead.details ? `*Specifications:* ${lead.details}` : null,
    lead.message ? `*Message:* "${lead.message}"` : null,
    `*Source:* ${lead.formType || 'Website Enquiry Form'}`,
    `*Submitted:* ${now} IST`,
    `----------------------------------------`,
    `Forwarded from Citadel Group Web Portal (thecitadelgroup.in)`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Opens WhatsApp in a new tab with pre-filled message
 */
export function triggerWhatsAppChat(message: string, customPhone?: string): void {
  const url = createWhatsAppUrl(message, customPhone);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
