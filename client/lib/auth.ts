export function isAuthenticated(): boolean {
  return localStorage.getItem("sips_auth") === "true";
}

export function logout() {
  localStorage.removeItem("sips_auth");
  localStorage.removeItem("sips_user");
}
