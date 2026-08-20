import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabaseClient";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    orders: 0,
    paidOrders: 0,
    products: 0,
    customers: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        ordersResult,
        productsResult,
        customersResult,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select(
            "id, order_number, total_amount, payment_status, status, created_at"
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("products")
          .select("id"),

        supabase
          .from("profiles")
          .select("id"),
      ]);

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (customersResult.error) {
        throw customersResult.error;
      }

      const orders = ordersResult.data || [];

      const paidOrders = orders.filter(
        (order) =>
          String(order.payment_status || "").toLowerCase() ===
          "paid"
      );

      const revenue = paidOrders.reduce(
        (total, order) =>
          total + Number(order.total_amount || 0),
        0
      );

      setStats({
        orders: orders.length,
        paidOrders: paidOrders.length,
        products:
          productsResult.data?.length || 0,
        customers:
          customersResult.data?.length || 0,
        revenue,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <main style={styles.centerPage}>
        <p style={styles.eyebrow}>
          VORN ADMIN
        </p>

        <h1 style={styles.loadingTitle}>
          Loading Dashboard...
        </h1>
      </main>
    );
  }

  return (
    <main style={styles.page}>

      {/* ================= HEADER ================= */}

      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            VORN ADMIN
          </p>

          <h1 style={styles.title}>
            Dashboard
          </h1>

          <p style={styles.subtitle}>
            Manage your VORN store from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          style={styles.refreshButton}
        >
          REFRESH
        </button>
      </header>

      {/* ================= ERROR ================= */}

      {errorMessage && (
        <div style={styles.errorBox}>
          {errorMessage}
        </div>
      )}

      {/* ================= STATS ================= */}

      <section style={styles.statsGrid}>

        <StatCard
          label="TOTAL ORDERS"
          value={stats.orders}
        />

        <StatCard
          label="PAID ORDERS"
          value={stats.paidOrders}
        />

        <StatCard
          label="PRODUCTS"
          value={stats.products}
        />

        <StatCard
          label="CUSTOMERS"
          value={stats.customers}
        />

      </section>

      {/* ================= REVENUE ================= */}

      <section style={styles.revenueCard}>

        <p style={styles.revenueLabel}>
          PAID REVENUE
        </p>

        <strong style={styles.revenueValue}>
          {formatCurrency(stats.revenue)}
        </strong>

        <p style={styles.revenueText}>
          Revenue from successfully paid orders.
        </p>

      </section>

      {/* ================= QUICK MANAGEMENT ================= */}

      <section style={styles.managementSection}>

        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.eyebrow}>
              STORE MANAGEMENT
            </p>

            <h2 style={styles.sectionTitle}>
              Manage your store
            </h2>
          </div>
        </div>

        <div style={styles.managementGrid}>

          {/* ================= ORDERS ================= */}

          <AdminCard
            title="Orders"
            description="View orders, payments and delivery status."
            onClick={() =>
              navigate("/admin/orders")
            }
          />

          {/* ================= PRODUCTS ================= */}

          <AdminCard
            title="Products"
            description="Add, edit and manage your products."
            onClick={() =>
              navigate("/admin/products")
            }
          />

          {/* ================= CUSTOMERS ================= */}

          <AdminCard
            title="Customers"
            description="View customer accounts and order history."
            onClick={() =>
              navigate("/admin/customers")
            }
          />

          {/* ================= INVENTORY ================= */}

          <AdminCard
            title="Inventory"
            description="Manage stock, sizes and product availability."
            onClick={() =>
              navigate("/admin/inventory")
            }
          />

          {/* ================= HOME PAGE ================= */}

          <AdminCard
            title="Home Page"
            description="Control banners, featured products and sections."
            onClick={() =>
              navigate("/admin/home")
            }
          />

          {/* ================= DISCOVER VORN ================= */}

          <AdminCard
            title="Discover VORN"
            description="Manage Discover VORN content, images and call-to-action."
            onClick={() =>
              navigate("/admin/discover-vorn")
            }
          />

          {/* ================= INSTAGRAM ================= */}

          <AdminCard
            title="Instagram"
            description="Upload and manage images shown in the ON INSTAGRAM section."
            onClick={() =>
              navigate("/admin/instagram")
            }
          />

          {/* ================= CATEGORIES ================= */}

          <AdminCard
            title="Categories"
            description="Manage shop categories and collections."
            onClick={() =>
              navigate("/admin/categories")
            }
          />

          {/* ================= COUPONS ================= */}

          <AdminCard
            title="Coupons"
            description="Manage offers, discounts and coupon codes."
            onClick={() =>
              navigate("/admin/coupons")
            }
          />

          {/* ================= REVIEWS ================= */}

          <AdminCard
            title="Reviews"
            description="Review, approve and manage customer reviews."
            onClick={() =>
              navigate("/admin/reviews")
            }
          />

          {/* ================= SETTINGS ================= */}

          <AdminCard
            title="Settings"
            description="Manage store-wide website settings."
            onClick={() =>
              navigate("/admin/settings")
            }
          />

        </div>
      </section>

      {/* ================= RECENT ORDERS ================= */}

      <section style={styles.recentSection}>

        <div style={styles.recentHeader}>

          <div>
            <p style={styles.eyebrow}>
              ORDERS
            </p>

            <h2 style={styles.sectionTitle}>
              Recent orders
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/orders")
            }
            style={styles.viewAllButton}
          >
            VIEW ALL
          </button>

        </div>

        <div style={styles.ordersTable}>

          <div style={styles.tableHeader}>
            <span>ORDER</span>
            <span>DATE</span>
            <span>PAYMENT</span>
            <span>STATUS</span>
            <span>AMOUNT</span>
          </div>

          {recentOrders.length === 0 ? (
            <div style={styles.emptyOrders}>
              No orders found.
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                style={styles.tableRow}
              >

                <span style={styles.orderNumber}>
                  {order.order_number ||
                    order.id}
                </span>

                <span>
                  {formatDate(
                    order.created_at
                  )}
                </span>

                <span>
                  <StatusBadge
                    value={
                      order.payment_status
                    }
                  />
                </span>

                <span>
                  <StatusBadge
                    value={order.status}
                  />
                </span>

                <span style={styles.amount}>
                  {formatCurrency(
                    order.total_amount
                  )}
                </span>

              </div>
            ))
          )}

        </div>

      </section>

    </main>
  );
}

/* ================================================= */
/* STAT CARD */
/* ================================================= */

function StatCard({
  label,
  value,
}) {
  return (
    <div style={styles.statCard}>

      <p style={styles.statLabel}>
        {label}
      </p>

      <strong style={styles.statValue}>
        {value}
      </strong>

    </div>
  );
}

/* ================================================= */
/* ADMIN CARD */
/* ================================================= */

function AdminCard({
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.managementCard}
    >

      <div>

        <h2 style={styles.cardTitle}>
          {title}
        </h2>

        <p style={styles.cardDescription}>
          {description}
        </p>

      </div>

      <span style={styles.cardArrow}>
        →
      </span>

    </button>
  );
}

/* ================================================= */
/* STATUS BADGE */
/* ================================================= */

function StatusBadge({
  value,
}) {
  const cleanValue =
    String(value || "unknown")
      .toLowerCase();

  return (
    <span
      style={{
        ...styles.statusBadge,
        ...(cleanValue === "paid" ||
        cleanValue === "delivered" ||
        cleanValue === "confirmed"
          ? styles.statusSuccess
          : cleanValue === "pending"
          ? styles.statusPending
          : styles.statusDefault),
      }}
    >
      {value || "Unknown"}
    </span>
  );
}

/* ================================================= */
/* STYLES */
/* ================================================= */

const styles = {
  page: {
    minHeight: "75vh",
    padding: "80px 24px 100px",
    maxWidth: "1300px",
    margin: "0 auto",
    background: "#fff",
  },

  centerPage: {
    minHeight: "70vh",
    padding: "120px 24px",
    textAlign: "center",
    background: "#fff",
  },

  eyebrow: {
    margin: "0 0 10px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "3px",
    color: "#777",
  },

  loadingTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "42px",
    fontWeight: "400",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "45px",
  },

  title: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "48px",
    fontWeight: "400",
  },

  subtitle: {
    margin: "12px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  refreshButton: {
    padding: "13px 22px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  errorBox: {
    padding: "15px 18px",
    marginBottom: "25px",
    border: "1px solid #f0caca",
    background: "#fff5f5",
    color: "#b42318",
    fontSize: "13px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  statCard: {
    border: "1px solid #e5e5e5",
    padding: "25px",
    background: "#fff",
  },

  statLabel: {
    margin: "0 0 12px",
    fontSize: "9px",
    letterSpacing: "2px",
    fontWeight: "600",
    color: "#888",
  },

  statValue: {
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: "400",
  },

  revenueCard: {
    border: "1px solid #111",
    padding: "30px",
    marginBottom: "60px",
    background: "#111",
    color: "#fff",
  },

  revenueLabel: {
    margin: "0 0 10px",
    fontSize: "9px",
    letterSpacing: "2px",
    fontWeight: "600",
    opacity: 0.7,
  },

  revenueValue: {
    display: "block",
    fontFamily: "Georgia, serif",
    fontSize: "40px",
    fontWeight: "400",
  },

  revenueText: {
    margin: "10px 0 0",
    fontSize: "13px",
    opacity: 0.7,
  },

  managementSection: {
    marginTop: "20px",
  },

  sectionHeader: {
    marginBottom: "25px",
  },

  sectionTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "30px",
    fontWeight: "400",
  },

  managementGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
  },

  managementCard: {
    minHeight: "170px",
    padding: "25px",
    border: "1px solid #e5e5e5",
    background: "#fff",
    color: "#111",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  cardTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "23px",
    fontWeight: "400",
  },

  cardDescription: {
    margin: "12px 0 0",
    color: "#777",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  cardArrow: {
    display: "block",
    marginTop: "20px",
    fontSize: "20px",
  },

  recentSection: {
    marginTop: "70px",
  },

  recentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "25px",
    gap: "20px",
  },

  viewAllButton: {
    padding: "12px 20px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  ordersTable: {
    border: "1px solid #e5e5e5",
    overflow: "hidden",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns:
      "2fr 1.2fr 1.2fr 1.2fr 1fr",
    gap: "15px",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e5e5",
    background: "#fafafa",
    color: "#888",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns:
      "2fr 1.2fr 1.2fr 1.2fr 1fr",
    gap: "15px",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #eee",
    color: "#555",
    fontSize: "12px",
  },

  orderNumber: {
    color: "#111",
    fontFamily: "Georgia, serif",
    fontSize: "14px",
  },

  amount: {
    color: "#111",
    fontWeight: "600",
    textAlign: "right",
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 9px",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderRadius: "2px",
  },

  statusSuccess: {
    background: "#edf8f1",
    color: "#167044",
  },

  statusPending: {
    background: "#fff7e8",
    color: "#9a6700",
  },

  statusDefault: {
    background: "#f3f3f3",
    color: "#666",
  },

  emptyOrders: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#888",
    fontSize: "13px",
  },
};
