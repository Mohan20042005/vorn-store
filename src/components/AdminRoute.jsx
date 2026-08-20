import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute({
  children,
}) {
  const {
    user,
    profile,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "3px",
            }}
          >
            VORN ADMIN
          </p>

          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: "400",
            }}
          >
            Checking Access...
          </h1>
        </div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged in but not admin
  if (profile?.role !== "admin") {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  return children;
}