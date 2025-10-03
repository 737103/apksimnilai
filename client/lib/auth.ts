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

// In production, store hashed passwords in environment variables or database
const VALID_CREDENTIALS = [
  { username: "admin", passwordHash: simpleHash("admin123") },
  { username: "guru", passwordHash: simpleHash("guru123") },
  { username: "dalle", passwordHash: simpleHash("asrahabu") }
];

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

export function login(username: string, password: string): boolean {
  const user = VALID_CREDENTIALS.find(u => u.username === username);
  if (!user || user.passwordHash !== simpleHash(password)) {
    return false;
  }
  
  const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  localStorage.setItem("sips_auth", JSON.stringify({ username, sessionExpiry }));
  localStorage.setItem("sips_user", JSON.stringify({ username }));
  
  return true;
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
