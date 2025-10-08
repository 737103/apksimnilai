// Simple hash function for password (in production, use proper hashing)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// Server-backed login

export function isAuthenticated(): boolean {
  const authData = localStorage.getItem("sips_auth");
  if (!authData) return false;
  
  try {
    const { username, sessionExpiry } = JSON.parse(authData);
    const now = Date.now();
    
    // Check if session is expired (24 hours)
    if (now > sessionExpiry) {
      logout();
      return false;
    }
    
    return !!username;
  } catch {
    logout();
    return false;
  }
}

export async function loginAsync(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok || !json?.success) return false;

    const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem("sips_auth", JSON.stringify({ username, sessionExpiry }));
    localStorage.setItem("sips_user", JSON.stringify({ username }));
    return true;
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.removeItem("sips_auth");
  localStorage.removeItem("sips_user");
}

export function getCurrentUser(): { username: string } | null {
  try {
    const userData = localStorage.getItem("sips_user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}
