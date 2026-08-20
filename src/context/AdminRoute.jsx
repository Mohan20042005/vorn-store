import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const {
    user,
    profile,
    loading,
    isAdmin,
  } = useAuth();

  const location = useLocation();

  /*
   * Wait until Supabase authentication
   * and profile loading are completed.
   */
  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading admin...</p>
      </div>
    );
  }

  /*
   * User is not logged in.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
   * Admin access check.
   *
   * AuthContext gets the role from:
   * public.profiles.role
   *
   * We also keep metadata checks as
   * a fallback.
   */
  const hasAdminAccess =
    isAdmin === true ||
    profile?.role === "admin" ||
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin";

  /*
   * Logged-in customer trying to access
   * admin pages.
   */
  if (!hasAdminAccess) {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  /*
   * Admin is allowed.
   */
  return children;
}

const styles = {
  loading: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    color: "#111",
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
  },
};

export default AdminRoute;