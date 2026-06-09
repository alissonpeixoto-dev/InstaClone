import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-4xl font-bold ig-gradient-text mb-6"
            style={{ fontFamily: "cursive" }}
          >
            InstaClone
          </h1>
          <div className="animate-spin w-8 h-8 border-2 border-[#dbdbdb] border-t-[#833AB4] rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-4xl font-bold ig-gradient-text mb-6"
            style={{ fontFamily: "cursive" }}
          >
            InstaClone
          </h1>
          <div className="animate-spin w-8 h-8 border-2 border-[#dbdbdb] border-t-[#833AB4] rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
