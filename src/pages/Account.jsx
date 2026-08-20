import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Account() {
  const navigate = useNavigate();

  const {
    user,
    profile,
    signOut,
    loading,
  } = useAuth();

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setErrorMessage("");

      await signOut();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to sign out. Please try again."
      );

      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <section style={styles.loadingCard}>
          <p style={styles.eyebrow}>
            VORN ACCOUNT
          </p>

          <div style={styles.spinner} />

          <p style={styles.loadingText}>
            Loading your account...
          </p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={styles.page}>
        <section style={styles.authCard}>
          <p style={styles.eyebrow}>
            VORN ACCOUNT
          </p>

          <h1 style={styles.title}>
            Sign In Required
          </h1>

          <p style={styles.description}>
            Please sign in to view your VORN
            account.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            style={styles.primaryButton}
          >
            SIGN IN
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
            style={styles.secondaryButton}
          >
            CREATE ACCOUNT
          </button>
        </section>
      </main>
    );
  }

  const fullName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    "VORN Customer";

  const isAdmin =
    profile?.role === "admin";

  const accountType = isAdmin
    ? "Administrator"
    : "Customer";

  return (
    <main style={styles.page}>
      <section style={styles.container}>

        {/* =========================
            PAGE HEADER
        ========================== */}

        <header style={styles.header}>
          <p style={styles.eyebrow}>
            VORN ACCOUNT
          </p>

          <h1 style={styles.title}>
            My Account
          </h1>

          <p style={styles.description}>
            Welcome back, {fullName}.
          </p>
        </header>

        {/* =========================
            ACCOUNT GRID
        ========================== */}

        <div style={styles.grid}>

          {/* =========================
              PROFILE
          ========================== */}

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>
                Profile
              </h2>
            </div>

            <div style={styles.infoList}>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  Name
                </span>

                <span style={styles.infoValue}>
                  {fullName}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  Email
                </span>

                <span style={styles.infoValue}>
                  {user.email || "—"}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  Account
                </span>

                <span
                  style={{
                    ...styles.infoValue,
                    ...(isAdmin
                      ? styles.adminRole
                      : {}),
                  }}
                >
                  {accountType}
                </span>
              </div>

            </div>
          </section>

          {/* =========================
              ORDERS
          ========================== */}

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>
                Orders
              </h2>
            </div>

            <p style={styles.panelDescription}>
              View your VORN order history
              and track your purchases.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/account/orders")
              }
              style={styles.outlineButton}
            >
              VIEW ORDERS
            </button>
          </section>

          {/* =========================
              WISHLIST
          ========================== */}

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>
                Wishlist
              </h2>
            </div>

            <p style={styles.panelDescription}>
              View the products you saved
              for later.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/wishlist")
              }
              style={styles.outlineButton}
            >
              VIEW WISHLIST
            </button>
          </section>

          {/* =========================
              ADMIN PANEL
          ========================== */}

          {isAdmin && (
            <section
              style={{
                ...styles.panel,
                ...styles.adminPanel,
              }}
            >
              <div style={styles.panelHeader}>
                <div>
                  <p
                    style={
                      styles.adminEyebrow
                    }
                  >
                    ADMIN ACCESS
                  </p>

                  <h2
                    style={
                      styles.panelTitle
                    }
                  >
                    Admin Panel
                  </h2>
                </div>
              </div>

              <p
                style={
                  styles.panelDescription
                }
              >
                Manage your complete VORN
                store including orders,
                products, customers,
                inventory and website settings.
              </p>

              {/* =========================
                  GO TO ADMIN DASHBOARD
              ========================== */}

              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                style={styles.adminButton}
              >
                OPEN ADMIN DASHBOARD
              </button>
            </section>
          )}

          {/* =========================
              ACCOUNT ACTIONS
          ========================== */}

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>
                Account
              </h2>
            </div>

            <p style={styles.panelDescription}>
              Manage your VORN account and
              current session.
            </p>

            {errorMessage && (
              <div style={styles.error}>
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                ...styles.logoutButton,
                opacity: loggingOut
                  ? 0.65
                  : 1,
                cursor: loggingOut
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loggingOut
                ? "SIGNING OUT..."
                : "SIGN OUT"}
            </button>
          </section>

        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    padding: "80px 24px",
    background: "#fff",
    boxSizing: "border-box",
  },

  loadingPage: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    background: "#fff",
    boxSizing: "border-box",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "420px",
    padding: "50px 30px",
    border: "1px solid #e5e5e5",
    textAlign: "center",
    boxSizing: "border-box",
  },

  loadingText: {
    margin: "18px 0 0",
    fontSize: "13px",
    color: "#666",
  },

  spinner: {
    width: "28px",
    height: "28px",
    margin: "25px auto 0",
    border: "2px solid #e5e5e5",
    borderTop: "2px solid #111",
    borderRadius: "50%",
    animation:
      "vornAccountSpin 0.8s linear infinite",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "50px",
  },

  eyebrow: {
    margin: "0 0 12px",
    fontSize: "10px",
    letterSpacing: "3px",
    fontWeight: "600",
    color: "#111",
  },

  title: {
    margin: 0,
    fontSize: "44px",
    fontFamily: "Georgia, serif",
    fontWeight: "500",
    color: "#111",
  },

  description: {
    margin: "14px auto 0",
    maxWidth: "520px",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.7",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  panel: {
    padding: "30px",
    border: "1px solid #e5e5e5",
    background: "#fff",
    boxSizing: "border-box",
  },

  adminPanel: {
    border: "1px solid #111",
    background: "#fafafa",
  },

  panelHeader: {
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom:
      "1px solid #eeeeee",
  },

  panelTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  adminEyebrow: {
    margin: "0 0 8px",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#777",
  },

  infoList: {
    width: "100%",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    padding: "14px 0",
    borderBottom:
      "1px solid #f0f0f0",
  },

  infoLabel: {
    color: "#777",
    fontSize: "12px",
    flexShrink: 0,
  },

  infoValue: {
    maxWidth: "65%",
    textAlign: "right",
    color: "#111",
    fontSize: "13px",
    wordBreak: "break-word",
  },

  adminRole: {
    fontWeight: "700",
  },

  panelDescription: {
    margin: "0 0 24px",
    color: "#666",
    fontSize: "13px",
    lineHeight: "1.7",
  },

  outlineButton: {
    padding: "13px 18px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.3px",
  },

  adminButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  logoutButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  error: {
    marginBottom: "14px",
    padding: "11px 12px",
    background: "#fff1f1",
    border:
      "1px solid #f0cccc",
    color: "#a00000",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  authCard: {
    width: "100%",
    maxWidth: "460px",
    margin: "0 auto",
    padding: "48px",
    border: "1px solid #e5e5e5",
    textAlign: "center",
    boxSizing: "border-box",
  },

  primaryButton: {
    width: "100%",
    marginTop: "28px",
    padding: "15px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  secondaryButton: {
    width: "100%",
    marginTop: "10px",
    padding: "15px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },
};

if (
  typeof document !== "undefined" &&
  !document.getElementById(
    "vorn-account-animation"
  )
) {
  const style =
    document.createElement("style");

  style.id =
    "vorn-account-animation";

  style.textContent = `
    @keyframes vornAccountSpin {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }
  `;

  document.head.appendChild(style);
}