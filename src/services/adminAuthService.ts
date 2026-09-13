const ADMIN_SESSION_KEY = 'citadel_admin_logged_in';
const FALLBACK_PASS = '#site@Admin';

export const adminAuthService = {
  isAuthenticated(): boolean {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  },

  async login(password: string): Promise<{ success: boolean; message?: string }> {
    // 1. Try server-side verification endpoint
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          return { success: true };
        }
      } else if (res.status === 401) {
        return { success: false, message: 'Incorrect Admin Password' };
      }
    } catch {
      // If server is unreachable or static deployment, fallback to direct validation
    }

    // 2. Direct fallback validation
    if (password === FALLBACK_PASS) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return { success: true };
    }

    return { success: false, message: 'Incorrect Admin Password' };
  },

  logout(): void {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // safe fallback
    }
  },
};
