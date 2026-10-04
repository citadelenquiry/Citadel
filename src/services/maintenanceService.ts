/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { adminAuthService } from './adminAuthService';

const MAINTENANCE_KEY = 'citadel_maintenance_active';
const PREVIEW_BYPASS_KEY = 'citadel_preview_bypass_granted';

type MaintenanceListener = () => void;

class MaintenanceService {
  private listeners: Set<MaintenanceListener> = new Set();

  constructor() {
    this.checkUrlParams();
  }

  /**
   * Check URL query parameters for quick preview or maintenance toggles
   * E.g. https://yourdomain.com/?preview=true or ?test=true
   */
  private checkUrlParams(): void {
    if (typeof window === 'undefined') return;

    try {
      const urlParams = new URLSearchParams(window.location.search);

      // Instant preview bypass via link: ?preview=true or ?test=true
      if (urlParams.get('preview') === 'true' || urlParams.get('test') === 'true') {
        this.grantPreviewAccess();
        // Clean URL parameter without reload
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }

      // Quick maintenance mode test toggle: ?maintenance=true / ?maintenance=false
      if (urlParams.get('maintenance') === 'true') {
        this.setMaintenanceMode(true);
      } else if (urlParams.get('maintenance') === 'false') {
        this.setMaintenanceMode(false);
      }
    } catch {
      // safe fallback
    }
  }

  /**
   * Returns whether maintenance mode is turned on globally.
   */
  isMaintenanceActive(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(MAINTENANCE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
      // Check optional build environment variable
      if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
        return true;
      }
    } catch {
      // safe fallback
    }
    return false;
  }

  /**
   * Returns whether current browser session has permission to preview the live site
   */
  hasPreviewAccess(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Logged in Admin always has preview access
    if (adminAuthService.isAuthenticated()) {
      return true;
    }

    // 2. Browser session with verified preview passkey
    try {
      return sessionStorage.getItem(PREVIEW_BYPASS_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Evaluates if the current visitor should see the maintenance page
   */
  shouldShowMaintenanceScreen(): boolean {
    return this.isMaintenanceActive() && !this.hasPreviewAccess();
  }

  /**
   * Turn Maintenance Mode on or off
   */
  setMaintenanceMode(active: boolean): void {
    try {
      localStorage.setItem(MAINTENANCE_KEY, active ? 'true' : 'false');
      this.notifyListeners();
    } catch {
      // safe fallback
    }
  }

  /**
   * Grant preview access to current browser session
   */
  grantPreviewAccess(): void {
    try {
      sessionStorage.setItem(PREVIEW_BYPASS_KEY, 'true');
      this.notifyListeners();
    } catch {
      // safe fallback
    }
  }

  /**
   * Revoke preview access
   */
  revokePreviewAccess(): void {
    try {
      sessionStorage.removeItem(PREVIEW_BYPASS_KEY);
      this.notifyListeners();
    } catch {
      // safe fallback
    }
  }

  subscribe(listener: MaintenanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // ignore subscriber error
      }
    });
  }
}

export const maintenanceService = new MaintenanceService();
