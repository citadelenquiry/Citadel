/**
 * WhatsApp integration utilities for Citadel Group
 * Configured Phone: 7030818966 (India: +91 70308 18966)
 * Configured Notification Email: citadelenquiry@gmail.com
 */

export const CITADEL_WHATSAPP_CONFIG = {
  rawNumber: '7030818966',
  intlNumber: '917030818966',
  displayNumber: '+91 70308 18966',
  notificationEmail: 'citadelenquiry@gmail.com',
  officialAddress: 'Swapnapurti Apts, Prabhat Road, Lane 8, Erandwane, Pune – 411 004',
};

/**
 * Creates a WhatsApp click-to-chat URL with pre-filled message
 */
export function createWhatsAppUrl(message: string, customPhone?: string): string {
  const phone = customPhone || CITADEL_WHATSAPP_CONFIG.intlNumber;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats full enquiry submission details into a clean WhatsApp text format
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
    `*🏛️ NEW ENQUIRY — CITADEL GROUP*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Name:* ${lead.name || 'Not provided'}`,
    `📞 *Phone:* ${lead.phone || 'Not provided'}`,
    `✉️ *Email:* ${lead.email || 'Not provided'}`,
    `🏢 *Project / Interest:* ${lead.projectOrRole || 'Citadel Developments'}`,
    lead.details ? `📋 *Specifications:* ${lead.details}` : null,
    lead.message ? `💬 *Message:* "${lead.message}"` : null,
    `📁 *Source:* ${lead.formType || 'Website Enquiry Form'}`,
    `🗓️ *Submitted:* ${now} IST`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `_Forwarded directly from Citadel Group Web Portal_`,
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
