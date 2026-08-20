import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PROFILES
  // ==========================================

  async function loadProfiles() {
    try {
      setLoading(true);
      setError("");

      const { data, error: supabaseError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          phone,
          role,
          created_at
        `
        )
        .order("created_at", {
          ascending: true,
        });

      if (supabaseError) {
        throw supabaseError;
      }

      setProfiles(data || []);
    } catch (err) {
      console.error(
        "Customer loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load customer accounts."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadProfiles();
  }, []);

  // ==========================================
  // FILTER PROFILES
  // ==========================================

  const filteredProfiles = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return profiles;
    }

    return profiles.filter((profile) => {
      const name =
        profile.full_name || "";

      const phone =
        profile.phone || "";

      const role =
        profile.role || "";

      return (
        name
          .toLowerCase()
          .includes(keyword) ||
        phone
          .toLowerCase()
          .includes(keyword) ||
        role
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [profiles, search]);

  // ==========================================
  // COUNTS
  // ==========================================

  const totalProfiles =
    profiles.length;

  const totalCustomers =
    profiles.filter(
      (profile) =>
        String(profile.role || "").toLowerCase() ===
        "customer"
    ).length;

  const totalAdmins =
    profiles.filter(
      (profile) =>
        String(profile.role || "").toLowerCase() ===
        "admin"
    ).length;

  // ==========================================
  // DATE FORMAT
  // ==========================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ==========================================
  // INITIAL LETTER
  // ==========================================

  function getInitial(name) {
    if (!name) {
      return "U";
    }

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  }

  // ==========================================
  // ROLE LABEL
  // ==========================================

  function getRoleLabel(role) {
    if (!role) {
      return "CUSTOMER";
    }

    return String(role).toUpperCase();
  }

  // ==========================================
  // ROLE CLASS
  // ==========================================

  function getRoleClass(role) {
    const normalizedRole =
      String(role || "")
        .toLowerCase();

    if (normalizedRole === "admin") {
      return styles.adminBadge;
    }

    return styles.customerBadge;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main style={styles.page}>
      {/* ======================================
          HEADER
      ====================================== */}

      <section style={styles.header}>
        <div>
          <div style={styles.eyebrow}>
            VORN ADMIN
          </div>

          <h1 style={styles.title}>
            Customers
          </h1>

          <p style={styles.subtitle}>
            View and manage VORN customer
            accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProfiles}
          disabled={loading}
          style={{
            ...styles.refreshButton,
            ...(loading
              ? styles.disabledButton
              : {}),
          }}
        >
          {loading
            ? "REFRESHING..."
            : "REFRESH"}
        </button>
      </section>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div style={styles.errorBox}>
          <strong>
            Unable to load accounts
          </strong>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            type="button"
            onClick={loadProfiles}
            style={styles.retryButton}
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {/* ======================================
          STAT CARDS
      ====================================== */}

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            TOTAL PROFILES
          </div>

          <div style={styles.statValue}>
            {totalProfiles}
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            CUSTOMERS
          </div>

          <div style={styles.statValue}>
            {totalCustomers}
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>
            ADMINS
          </div>

          <div style={styles.statValue}>
            {totalAdmins}
          </div>
        </div>
      </section>

      {/* ======================================
          CUSTOMER SECTION HEADER
      ====================================== */}

      <section style={styles.accountsHeader}>
        <div>
          <div style={styles.sectionEyebrow}>
            CUSTOMER ACCOUNTS
          </div>

          <h2 style={styles.sectionTitle}>
            {filteredProfiles.length}{" "}
            {filteredProfiles.length === 1
              ? "Account"
              : "Accounts"}
          </h2>
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search name, phone or role..."
          style={styles.searchInput}
        />
      </section>

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && profiles.length === 0 && (
        <div style={styles.loadingBox}>
          Loading customer accounts...
        </div>
      )}

      {/* ======================================
          EMPTY SEARCH RESULT
      ====================================== */}

      {!loading &&
        filteredProfiles.length === 0 && (
          <div style={styles.emptyBox}>
            <h3 style={styles.emptyTitle}>
              No accounts found
            </h3>

            <p style={styles.emptyText}>
              {search
                ? "Try another search term."
                : "There are no customer accounts yet."}
            </p>
          </div>
        )}

      {/* ======================================
          ACCOUNT LIST
      ====================================== */}

      <section style={styles.accountList}>
        {filteredProfiles.map(
          (profile) => {
            const fullName =
              profile.full_name ||
              "Unnamed User";

            return (
              <article
                key={profile.id}
                style={styles.accountCard}
              >
                {/* LEFT */}
                <div style={styles.identity}>
                  <div style={styles.avatar}>
                    {getInitial(fullName)}
                  </div>

                  <div
                    style={
                      styles.identityContent
                    }
                  >
                    <h3 style={styles.name}>
                      {fullName}
                    </h3>

                    <div style={styles.id}>
                      ID: {profile.id}
                    </div>
                  </div>
                </div>

                {/* PHONE */}
                <div style={styles.detail}>
                  <div
                    style={styles.detailLabel}
                  >
                    PHONE
                  </div>

                  <p
                    style={styles.detailValue}
                  >
                    {profile.phone ||
                      "Not provided"}
                  </p>
                </div>

                {/* ROLE */}
                <div style={styles.detail}>
                  <div
                    style={styles.detailLabel}
                  >
                    ROLE
                  </div>

                  <span
                    style={getRoleClass(
                      profile.role
                    )}
                  >
                    {getRoleLabel(
                      profile.role
                    )}
                  </span>
                </div>

                {/* JOINED */}
                <div style={styles.detail}>
                  <div
                    style={styles.detailLabel}
                  >
                    JOINED
                  </div>

                  <p
                    style={styles.detailValue}
                  >
                    {formatDate(
                      profile.created_at
                    )}
                  </p>
                </div>
              </article>
            );
          }
        )}
      </section>

      {/* ======================================
          INFORMATION BOX
      ====================================== */}

      <section style={styles.profileNote}>
        <strong style={styles.noteTitle}>
          Customer information
        </strong>

        <p style={styles.profileNoteText}>
          Email addresses are stored in
          Supabase Authentication and are
          intentionally not queried directly
          from the browser. We can add a
          secure admin-only database function
          later if email display is required.
        </p>
      </section>
    </main>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = {
  page: {
    minHeight: "70vh",
    padding:
      "55px 5.2% 80px",
    background: "#fff",
    color: "#111",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "48px",
  },

  eyebrow: {
    marginBottom: "14px",
    fontSize: "10px",
    letterSpacing: "4px",
    fontWeight: "600",
    color: "#777",
  },

  title: {
    margin: 0,
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "52px",
    lineHeight: "1",
    fontWeight: "400",
    letterSpacing: "-1.5px",
  },

  subtitle: {
    margin:
      "18px 0 0",
    color: "#777",
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  refreshButton: {
    minWidth: "110px",
    height: "42px",
    padding:
      "0 20px",
    background: "#fff",
    border:
      "1px solid #222",
    color: "#111",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  // ==========================================
  // ERROR
  // ==========================================

  errorBox: {
    marginBottom: "28px",
    padding: "20px",
    border:
      "1px solid #e5c8c8",
    background: "#fffafa",
  },

  errorText: {
    margin:
      "8px 0 15px",
    color: "#777",
    fontSize: "13px",
  },

  retryButton: {
    padding:
      "10px 18px",
    border:
      "1px solid #222",
    background: "#111",
    color: "#fff",
    fontSize: "10px",
    letterSpacing: "1.5px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // ==========================================
  // STATS
  // ==========================================

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "55px",
  },

  statCard: {
    minHeight: "115px",
    padding: "28px",
    border:
      "1px solid #e5e5e5",
    boxSizing: "border-box",
  },

  statLabel: {
    marginBottom: "20px",
    fontSize: "9px",
    letterSpacing: "3px",
    fontWeight: "600",
    color: "#888",
  },

  statValue: {
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "30px",
    fontWeight: "400",
  },

  // ==========================================
  // ACCOUNT HEADER
  // ==========================================

  accountsHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "28px",
  },

  sectionEyebrow: {
    marginBottom: "12px",
    fontSize: "9px",
    letterSpacing: "3px",
    fontWeight: "600",
    color: "#888",
  },

  sectionTitle: {
    margin: 0,
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "30px",
    lineHeight: "1.1",
    fontWeight: "400",
  },

  searchInput: {
    width: "340px",
    height: "46px",
    padding:
      "0 16px",
    border:
      "1px solid #ddd",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "13px",
    color: "#222",
    background: "#fff",
  },

  // ==========================================
  // LOADING
  // ==========================================

  loadingBox: {
    padding: "40px",
    border:
      "1px solid #e5e5e5",
    textAlign: "center",
    color: "#777",
    fontSize: "13px",
  },

  // ==========================================
  // EMPTY
  // ==========================================

  emptyBox: {
    padding: "55px 30px",
    border:
      "1px solid #e5e5e5",
    textAlign: "center",
  },

  emptyTitle: {
    margin: 0,
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "22px",
    fontWeight: "400",
  },

  emptyText: {
    margin:
      "10px 0 0",
    color: "#777",
    fontSize: "13px",
  },

  // ==========================================
  // ACCOUNT LIST
  // ==========================================

  accountList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  accountCard: {
    display: "grid",
    gridTemplateColumns:
      "2.1fr 1.2fr 0.9fr 1fr",
    alignItems: "center",
    gap: "30px",
    minHeight: "94px",
    padding:
      "20px 24px",
    border:
      "1px solid #e5e5e5",
    boxSizing: "border-box",
  },

  // ==========================================
  // IDENTITY
  // ==========================================

  identity: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: 0,
  },

  avatar: {
    width: "50px",
    height: "50px",
    minWidth: "50px",
    border:
      "1px solid #ddd",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "18px",
    color: "#222",
    background: "#fafafa",
  },

  identityContent: {
    minWidth: 0,
  },

  name: {
    margin: 0,
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "21px",
    lineHeight: "1.2",
    fontWeight: "400",
    overflowWrap:
      "anywhere",
  },

  id: {
    marginTop: "7px",
    fontSize: "8px",
    color: "#999",
    letterSpacing: "0.3px",
    wordBreak: "break-all",
  },

  // ==========================================
  // DETAILS
  // ==========================================

  detail: {
    minWidth: 0,
  },

  detailLabel: {
    margin:
      "0 0 8px",
    fontSize: "8px",
    letterSpacing: "2px",
    fontWeight: "600",
    color: "#999",
  },

  detailValue: {
    margin: 0,
    color: "#222",
    fontSize: "13px",
    wordBreak:
      "break-word",
  },

  // ==========================================
  // ROLE BADGES
  // ==========================================

  adminBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent:
      "center",
    padding:
      "6px 11px",
    background: "#111",
    color: "#fff",
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },

  customerBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent:
      "center",
    padding:
      "6px 11px",
    background: "#f5f5f5",
    color: "#555",
    border:
      "1px solid #ddd",
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },

  // ==========================================
  // NOTE
  // ==========================================

  profileNote: {
    margin:
      "25px 0 0",
    padding: "18px",
    border:
      "1px solid #e5e5e5",
    background: "#fafafa",
    color: "#666",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  profileNoteText: {
    margin:
      "8px 0 0",
  },

  noteTitle: {
    color: "#555",
    fontSize: "12px",
  },
};