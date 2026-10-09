/**
 * =======================================================================
 * CITADEL GROUP — MASTER INTEGRATIONS CONFIGURATION
 * =======================================================================
 * 
 * THIS IS THE SINGLE PLACE TO UPDATE YOUR GOOGLE APPS SCRIPT WEBHOOK URL.
 * 
 * When you change the URL below, it is automatically applied across:
 * 1. The live website client-side direct dispatcher (sheetsWebhookService)
 * 2. The contact form, quote requests, & brochure downloads
 * 3. The WhatsApp chatbot lead capturing pipeline
 * 4. The on-site Admin Panel defaults and diagnostics
 * 5. The local Vite development / preview CORS proxy
 * =======================================================================
 */

export const CITADEL_APPS_SCRIPT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyQ3Ej9IdrJI8FPCbZqeAaiR9B6Qf3SXkb-DP9pwN5loA1YqubMOmeWpsCrhFa5cqqfBg/exec';

/**
 * Dual inboxes that receive background lead notifications across the entire portal:
 * 1. Contact Us & Get a Quote submissions
 * 2. Brochure downloads
 * 3. Careers & Job applications
 * 4. Interactive WhatsApp Concierge chat transcripts
 */
export const CITADEL_NOTIFICATION_EMAILS =
  'citadelgroupenquiry@gmail.com, enquiry@thecitadelgroup.co';
