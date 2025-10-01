import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
