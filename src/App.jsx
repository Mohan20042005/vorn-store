import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Search from "./pages/Search";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import DiscoverVorn from "./pages/DiscoverVorn";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDiscoverVorn from "./pages/admin/AdminDiscoverVorn";
import AdminInstagram from "./pages/admin/AdminInstagram";

import AdminRoute from "./components/AdminRoute";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// =====================================================
// 404
// =====================================================

function NotFound() {
  return (
    <main style={styles.placeholderPage}>
      <h1 style={styles.placeholderTitle}>
        404
      </h1>

      <p>
        Page not found.
      </p>
    </main>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>

          {/* =================================================
              HEADER
          ================================================= */}

          <Header />

          {/* =================================================
              ROUTES
          ================================================= */}

          <Routes>

            {/* =================================================
                HOME
            ================================================= */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* =================================================
                SHOP
            ================================================= */}

            <Route
              path="/shop"
              element={<Shop />}
            />

            {/* =================================================
                PRODUCT DETAILS
            ================================================= */}

            <Route
              path="/product/:slug"
              element={<ProductDetails />}
            />

            {/* =================================================
                SEARCH
            ================================================= */}

            <Route
              path="/search"
              element={<Search />}
            />

            {/* =================================================
                CART
            ================================================= */}

            <Route
              path="/cart"
              element={<Cart />}
            />

            {/* =================================================
                WISHLIST
            ================================================= */}

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            {/* =================================================
                AUTH
            ================================================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Signup />}
            />

            <Route
              path="/auth/callback"
              element={<AuthCallback />}
            />

            {/* =================================================
                CHECKOUT
            ================================================= */}

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <Route
              path="/account"
              element={<Account />}
            />

            {/* =================================================
                CUSTOMER ORDERS
            ================================================= */}

            <Route
              path="/account/orders"
              element={<Orders />}
            />

            {/* =================================================
                CUSTOMER CARE
            ================================================= */}

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/faq"
              element={<FAQ />}
            />

            <Route
              path="/shipping-policy"
              element={<ShippingPolicy />}
            />

            <Route
              path="/return-policy"
              element={<ReturnPolicy />}
            />

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            {/* =================================================
                DISCOVER VORN - CUSTOMER PAGE
            ================================================= */}

            <Route
              path="/discover-vorn"
              element={<DiscoverVorn />}
            />

            {/* ABOUT ALIAS */}

            <Route
              path="/about"
              element={<DiscoverVorn />}
            />

            {/* =================================================
                ADMIN
            ================================================= */}

            {/* ================= ADMIN DASHBOARD ================= */}

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN HOME ================= */}

            <Route
              path="/admin/home"
              element={
                <AdminRoute>
                  <AdminHome />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN ORDERS ================= */}

            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN PRODUCTS ================= */}

            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN CUSTOMERS ================= */}

            <Route
              path="/admin/customers"
              element={
                <AdminRoute>
                  <AdminCustomers />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN INVENTORY ================= */}

            <Route
              path="/admin/inventory"
              element={
                <AdminRoute>
                  <AdminInventory />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN COUPONS ================= */}

            <Route
              path="/admin/coupons"
              element={
                <AdminRoute>
                  <AdminCoupons />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN REVIEWS ================= */}

            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <AdminReviews />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN CATEGORIES ================= */}

            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <AdminCategories />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN DISCOVER VORN ================= */}

            <Route
              path="/admin/discover-vorn"
              element={
                <AdminRoute>
                  <AdminDiscoverVorn />
                </AdminRoute>
              }
            />

            {/* ================= ADMIN INSTAGRAM ================= */}

            <Route
              path="/admin/instagram"
              element={
                <AdminRoute>
                  <AdminInstagram />
                </AdminRoute>
              }
            />

            {/* =================================================
                404
            ================================================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

          {/* =================================================
              FOOTER
          ================================================= */}

          <Footer />

          {/* =================================================
              WHATSAPP
          ================================================= */}

          <WhatsAppButton />

        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}

// =====================================================
// 404 STYLES
// =====================================================

const styles = {
  placeholderPage: {
    minHeight: "60vh",
    padding: "100px 24px",
    background: "#fff",
  },

  placeholderTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
  },
};

export default App;