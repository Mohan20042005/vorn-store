import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useCart,
} from "../context/CartContext";

import {
  useWishlist,
} from "../context/WishlistContext";

// =========================================================
// WISHLIST PAGE
// =========================================================

export default function Wishlist() {
  const navigate = useNavigate();

  // =======================================================
  // CART
  // =======================================================

  const {
    addToCart,
  } = useCart();

  // =======================================================
  // WISHLIST CONTEXT
  // =======================================================

  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  // =======================================================
  // UI STATE
  // =======================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  const [
    addingId,
    setAddingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    toast,
    setToast,
  ] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const [
    brokenImages,
    setBrokenImages,
  ] = useState(() => new Set());

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    try {
      setError("");
      setLoading(false);
    } catch (err) {
      console.error(
        "Wishlist loading error:",
        err
      );

      setError(
        "Unable to load wishlist."
      );

      setLoading(false);
    }
  }, []);

  // =======================================================
  // REMOVE FROM WISHLIST
  // =======================================================

  function showToast(
    message,
    type = "success"
  ) {
    setToast({
      visible: true,
      type,
      message,
    });

    if (showToast.timeoutId) {
      window.clearTimeout(
        showToast.timeoutId
      );
    }

    showToast.timeoutId =
      window.setTimeout(() => {
        setToast((current) => ({
          ...current,
          visible: false,
        }));
      }, 2600);
  }

  function handleImageError(image) {
    if (!image) {
      return;
    }

    setBrokenImages((current) => {
      const next = new Set(current);
      next.add(image);
      return next;
    });
  }

  function handleRemove(
    productId
  ) {
    if (!productId || removingId) {
      return;
    }

    try {
      setRemovingId(productId);

      removeFromWishlist(
        productId
      );

      showToast(
        "Removed from wishlist."
      );
    } catch (err) {
      console.error(
        "Remove wishlist error:",
        err
      );

      showToast(
        "Unable to remove item.",
        "error"
      );

      setRemovingId(null);
    }
  }

  // =======================================================
  // CLEAR WISHLIST
  // =======================================================

  function handleClearWishlist() {
    if (
      !wishlistItems ||
      wishlistItems.length === 0 ||
      removingId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to clear your wishlist?"
      );

    if (!confirmed) {
      return;
    }

    try {
      clearWishlist();

      showToast(
        "Wishlist cleared."
      );
    } catch (err) {
      console.error(
        "Clear wishlist error:",
        err
      );

      showToast(
        "Unable to clear wishlist.",
        "error"
      );
    }
  }

  // =======================================================
  // ADD TO CART
  // =======================================================

  function handleAddToCart(
    product
  ) {
    if (
      !product?.id ||
      addingId
    ) {
      return;
    }

    try {
      setAddingId(product.id);

      const price =
        Number(
          product.sale_price ||
            product.base_price ||
            product.price ||
            0
        );

      addToCart({
        id: product.id,

        name:
          product.name ||
          "VORN Product",

        price,

        sale_price:
          product.sale_price ??
          null,

        base_price:
          product.base_price ??
          null,

        category:
          product.category ||
          "VORN COLLECTION",

        slug:
          product.slug ||
          "",

        image:
          product.image ||
          product.image_url ||
          (
            Array.isArray(
              product.images
            )
              ? product.images[0]
              : null
          ) ||
          null,

        quantity: 1,
      });

      showToast(
        `${product.name || "Product"} added to cart.`
      );
    } catch (err) {
      console.error(
        "Wishlist add-to-cart error:",
        err
      );

      showToast(
        "Unable to add product to cart.",
        "error"
      );
    } finally {
      window.setTimeout(() => {
        setAddingId(null);
      }, 650);
    }
  }

  // =======================================================
  // VIEW PRODUCT
  // =======================================================

  function handleViewProduct(
    product
  ) {
    if (!product?.slug) {
      return;
    }

    navigate(
      `/product/${product.slug}`
    );
  }

  // =======================================================
  // FORMAT PRICE
  // =======================================================

  function formatPrice(
    value
  ) {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );
  }

  // =======================================================
  // PRODUCT IMAGE
  // =======================================================

  function getProductImage(
    product
  ) {
    if (product?.image) {
      return product.image;
    }

    if (product?.image_url) {
      return product.image_url;
    }

    if (
      Array.isArray(
        product?.images
      ) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    return "";
  }

  // =======================================================
  // PRICE
  // =======================================================

  function getProductPrice(
    product
  ) {
    return Number(
      product?.sale_price ||
        product?.base_price ||
        product?.price ||
        0
    );
  }

  // =======================================================
  // OLD PRICE
  // =======================================================

  function getOldPrice(
    product
  ) {
    return Number(
      product?.base_price ||
        product?.price ||
        0
    );
  }

  // =======================================================
  // SALE CHECK
  // =======================================================

  function hasSalePrice(
    product
  ) {
    const salePrice =
      Number(
        product?.sale_price ||
          0
      );

    const basePrice =
      getOldPrice(product);

    return (
      salePrice > 0 &&
      basePrice > salePrice
    );
  }

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main
        className="vorn-wishlist-page"
        style={styles.page}
      >
        <section
          style={styles.container}
        >
          <header
            style={styles.header}
          >
            <p style={styles.eyebrow}>
              VORN COLLECTION
            </p>

            <h1
              style={styles.title}
            >
              Wishlist
            </h1>

            <p
              style={styles.subtitle}
            >
              Loading your saved pieces...
            </p>
          </header>

          <section
            className="vorn-wishlist-grid"
            style={styles.grid}
            aria-label="Loading wishlist"
          >
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <article
                key={index}
                style={styles.card}
              >
                <div
                  className="vorn-wishlist-skeleton"
                  style={
                    styles.skeletonImage
                  }
                />

                <div
                  style={
                    styles.skeletonInfo
                  }
                >
                  <div
                    className="vorn-wishlist-skeleton"
                    style={
                      styles.skeletonSmall
                    }
                  />
                  <div
                    className="vorn-wishlist-skeleton"
                    style={
                      styles.skeletonMedium
                    }
                  />
                  <div
                    className="vorn-wishlist-skeleton"
                    style={
                      styles.skeletonPrice
                    }
                  />
                  <div
                    className="vorn-wishlist-skeleton"
                    style={
                      styles.skeletonButton
                    }
                  />
                </div>
              </article>
            ))}
          </section>
        </section>

        <style>{`
          .vorn-wishlist-skeleton {
            position: relative;
            overflow: hidden;
            background: #eeeeee;
          }

          .vorn-wishlist-skeleton::after {
            content: "";
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.7),
              transparent
            );
            animation:
              vorn-wishlist-shimmer 1.35s infinite;
          }

          @keyframes vorn-wishlist-shimmer {
            100% {
              transform: translateX(100%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .vorn-wishlist-skeleton::after {
              animation: none;
            }
          }
        `}</style>
      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <main
        style={
          styles.centerPage
        }
      >
        <p
          style={
            styles.eyebrow
          }
        >
          VORN COLLECTION
        </p>

        <h1
          style={
            styles.loadingTitle
          }
        >
          Something went wrong
        </h1>

        <p
          style={
            styles.errorText
          }
        >
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          style={
            styles.primaryButton
          }
        >
          TRY AGAIN
        </button>
      </main>
    );
  }

  // =======================================================
  // EMPTY WISHLIST
  // =======================================================

  if (
    !wishlistItems ||
    wishlistItems.length === 0
  ) {
    return (
      <main
        style={styles.page}
      >
        <section
          style={
            styles.container
          }
        >
          <header
            style={
              styles.header
            }
          >
            <p
              style={
                styles.eyebrow
              }
            >
              VORN COLLECTION
            </p>

            <h1
              style={
                styles.title
              }
            >
              Wishlist
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              Save your favorite
              VORN pieces for
              later.
            </p>
          </header>

          <section
            style={
              styles.emptyCard
            }
          >
            <div
              style={
                styles.heartIcon
              }
            >
              ♡
            </div>

            <h2
              style={
                styles.emptyTitle
              }
            >
              Your Wishlist Is Empty
            </h2>

            <p
              style={
                styles.emptyText
              }
            >
              Explore our collection
              and save the pieces
              you love.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/shop")
              }
              style={
                styles.primaryButton
              }
            >
              EXPLORE SHOP
            </button>
          </section>
        </section>
      </main>
    );
  }

  // =======================================================
  // MAIN WISHLIST PAGE
  // =======================================================

  return (
    <main
      className="vorn-wishlist-page"
      style={styles.page}
    >
      <section
        style={
          styles.container
        }
      >
        <header
          className="vorn-wishlist-header"
          style={
            styles.header
          }
        >
          <p
            style={
              styles.eyebrow
            }
          >
            VORN COLLECTION
          </p>

          <h1
            style={
              styles.title
            }
          >
            Wishlist
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Your saved VORN pieces,
            all in one place.
          </p>
        </header>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div
          className="vorn-wishlist-toolbar"
          style={
            styles.toolbar
          }
        >
          <p
            style={
              styles.itemCount
            }
          >
            {wishlistCount}{" "}
            {wishlistCount === 1
              ? "ITEM"
              : "ITEMS"}
          </p>

          <button
            type="button"
            onClick={
              handleClearWishlist
            }
            disabled={Boolean(removingId)}
            className="vorn-wishlist-clear"
            style={{
              ...styles.clearButton,
              ...(removingId
                ? styles.disabledButton
                : {}),
            }}
          >
            CLEAR WISHLIST
          </button>
        </div>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <section
          className="vorn-wishlist-grid"
          style={
            styles.grid
          }
        >
          {wishlistItems.map(
            (product) => {
              const image =
                getProductImage(
                  product
                );

              const price =
                getProductPrice(
                  product
                );

              const oldPrice =
                getOldPrice(
                  product
                );

              const hasSale =
                hasSalePrice(
                  product
                );

              return (
                <article
                  key={
                    product.id
                  }
                  className="vorn-wishlist-card"
                  style={{
                    ...styles.card,
                    ...(removingId === product.id
                      ? styles.cardRemoving
                      : {}),
                  }}
                >
                  {/* IMAGE */}

                  <div
                    style={
                      styles.imageWrapper
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleViewProduct(
                          product
                        )
                      }
                      style={
                        styles.imageButton
                      }
                    >
                      {image &&
                      !brokenImages.has(image) ? (
                        <img
                          src={image}
                          alt={
                            product.name ||
                            "VORN Product"
                          }
                          loading="lazy"
                          style={
                            styles.image
                          }
                          onError={() =>
                            handleImageError(
                              image
                            )
                          }
                        />
                      ) : (
                        <div
                          style={
                            styles.placeholder
                          }
                        >
                          <span
                            style={
                              styles.placeholderMark
                            }
                          >
                            V
                          </span>

                          <span
                            style={
                              styles.placeholderText
                            }
                          >
                            VORN
                          </span>
                        </div>
                      )}
                    </button>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          product.id
                        )
                      }
                      disabled={
                        removingId ===
                        product.id
                      }
                      style={{
                        ...styles.removeIcon,
                        ...(removingId ===
                        product.id
                          ? styles.disabledButton
                          : {}),
                      }}
                      aria-label={`Remove ${
                        product.name ||
                        "product"
                      } from wishlist`}
                    >
                      {removingId ===
                      product.id
                        ? "..."
                        : "♥"}
                    </button>
                  </div>

                  {/* PRODUCT INFO */}

                  <div
                    style={
                      styles.info
                    }
                  >
                    <p
                      style={
                        styles.category
                      }
                    >
                      {product.category ||
                        "VORN COLLECTION"}
                    </p>

                    <h2
                      className="vorn-wishlist-product-name"
                      style={
                        styles.productName
                      }
                    >
                      {product.name ||
                        "VORN Product"}
                    </h2>

                    {/* PRICE */}

                    <div
                      style={
                        styles.priceRow
                      }
                    >
                      <span
                        style={
                          styles.price
                        }
                      >
                        ₹
                        {formatPrice(
                          price
                        )}
                      </span>

                      {hasSale && (
                        <span
                          style={
                            styles.oldPrice
                          }
                        >
                          ₹
                          {formatPrice(
                            oldPrice
                          )}
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div
                      className="vorn-wishlist-actions"
                      style={
                        styles.actions
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleViewProduct(
                            product
                          )
                        }
                        style={
                          styles.viewButton
                        }
                      >
                        VIEW PRODUCT
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                        disabled={
                          addingId ===
                          product.id
                        }
                        style={{
                          ...styles.cartButton,
                          ...(addingId ===
                          product.id
                            ? styles.disabledButton
                            : {}),
                        }}
                      >
                        {addingId ===
                        product.id
                          ? "ADDING..."
                          : "ADD TO CART"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      </section>

      {toast.visible && (
        <div
          className="vorn-wishlist-toast"
          role="status"
          aria-live="polite"
          style={{
            ...styles.toast,
            ...(toast.type === "error"
              ? styles.toastError
              : styles.toastSuccess),
          }}
        >
          <span
            style={
              styles.toastIcon
            }
          >
            {toast.type === "error"
              ? "!"
              : "✓"}
          </span>

          <span>
            {toast.message}
          </span>

          <button
            type="button"
            onClick={() =>
              setToast(
                (current) => ({
                  ...current,
                  visible: false,
                })
              )
            }
            style={
              styles.toastClose
            }
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .vorn-wishlist-page {
          box-sizing: border-box;
        }

        .vorn-wishlist-page *,
        .vorn-wishlist-page *::before,
        .vorn-wishlist-page *::after {
          box-sizing: border-box;
        }

        .vorn-wishlist-card {
          transition:
            transform .2s ease,
            opacity .2s ease;
        }

        .vorn-wishlist-card:hover {
          transform: translateY(-2px);
        }

        .vorn-wishlist-card:hover img {
          transform: scale(1.025);
        }

        .vorn-wishlist-page
        .vorn-wishlist-toast {
          animation:
            vorn-wishlist-toast-in .2s ease;
        }

        @keyframes vorn-wishlist-toast-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 760px) {
          .vorn-wishlist-page {
            padding:
              55px 16px 75px !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: 20px 12px !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-header {
            margin-bottom: 38px !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-toolbar {
            align-items: flex-start !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-actions {
            flex-direction: column !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-actions button {
            width: 100% !important;
          }

          .vorn-wishlist-toast {
            left: 14px !important;
            right: 14px !important;
            bottom: 14px !important;
            max-width: none !important;
          }
        }

        @media (max-width: 480px) {
          .vorn-wishlist-page {
            padding:
              45px 12px 65px !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-grid {
            gap: 22px 10px !important;
          }

          .vorn-wishlist-page h1 {
            font-size: 34px !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-toolbar {
            gap: 10px !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-clear {
            font-size: 8px !important;
          }

          .vorn-wishlist-page
          .vorn-wishlist-product-name {
            font-size: 15px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-wishlist-card,
          .vorn-wishlist-card img,
          .vorn-wishlist-toast {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
const styles = {
  // =====================================================
  // POLISH
  // =====================================================

  skeletonImage: {
    width: "100%",
    aspectRatio: "4 / 5",
  },

  skeletonInfo: {
    padding: "17px 2px 0",
  },

  skeletonSmall: {
    width: "28%",
    height: "9px",
    marginBottom: "12px",
  },

  skeletonMedium: {
    width: "72%",
    height: "18px",
    marginBottom: "12px",
  },

  skeletonPrice: {
    width: "34%",
    height: "14px",
    marginBottom: "17px",
  },

  skeletonButton: {
    width: "100%",
    height: "36px",
  },

  cardRemoving: {
    opacity: 0.45,
    pointerEvents: "none",
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  placeholderMark: {
    fontFamily: "Georgia, serif",
    fontSize: "36px",
    lineHeight: 1,
    color: "#222",
  },

  placeholderText: {
    marginTop: "6px",
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "3px",
    color: "#999",
  },

  toast: {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    maxWidth: "calc(100vw - 40px)",
    padding: "13px 14px",
    border: "1px solid #ddd",
    boxShadow:
      "0 12px 35px rgba(0,0,0,.14)",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  toastSuccess: {
    background: "#111",
    color: "#fff",
    borderColor: "#111",
  },

  toastError: {
    background: "#fff",
    color: "#b42318",
    borderColor: "#efcaca",
  },

  toastIcon: {
    width: "22px",
    height: "22px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#fff",
    color: "#111",
    fontWeight: "800",
    flexShrink: 0,
  },

  toastClose: {
    marginLeft: "6px",
    padding: "0 2px",
    border: "none",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: "20px",
    lineHeight: 1,
  },

  // =====================================================
  // PAGE
  // =====================================================

  page: {
    minHeight: "70vh",
    padding: "80px 30px 100px",
    background: "#fff",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    maxWidth: "650px",
    margin: "0 auto 55px",
    textAlign: "center",
  },

  eyebrow: {
    margin: "0 0 12px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "3px",
    color: "#555",
  },

  title: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "50px",
    fontWeight: "400",
    lineHeight: "1.15",
    color: "#111",
  },

  subtitle: {
    margin: "16px auto 0",
    maxWidth: "520px",
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#666",
  },

  // =====================================================
  // CENTER / LOADING
  // =====================================================

  centerPage: {
    minHeight: "65vh",
    padding: "100px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background: "#fff",
  },

  loadingTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: "400",
    color: "#111",
  },

  errorText: {
    margin: "14px 0 25px",
    fontSize: "13px",
    color: "#a02020",
  },

  // =====================================================
  // BUTTONS
  // =====================================================

  primaryButton: {
    padding: "14px 24px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.3px",
  },

  // =====================================================
  // EMPTY WISHLIST
  // =====================================================

  emptyCard: {
    minHeight: "360px",
    padding: "60px 30px",
    boxSizing: "border-box",
    border: "1px solid #e5e5e5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background: "#fff",
  },

  heartIcon: {
    width: "60px",
    height: "60px",
    marginBottom: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #ddd",
    borderRadius: "50%",
    fontSize: "28px",
    color: "#111",
  },

  emptyTitle: {
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
    fontSize: "30px",
    fontWeight: "400",
    color: "#111",
  },

  emptyText: {
    maxWidth: "430px",
    margin: "0 0 28px",
    fontSize: "13px",
    lineHeight: "1.7",
    color: "#777",
  },

  // =====================================================
  // TOOLBAR
  // =====================================================

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "25px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eeeeee",
  },

  itemCount: {
    margin: 0,
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#777",
  },

  clearButton: {
    padding: "9px 0",
    border: "none",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  // =====================================================
  // PRODUCT GRID
  // =====================================================

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "24px",
  },

  // =====================================================
  // PRODUCT CARD
  // =====================================================

  card: {
    minWidth: 0,
    background: "#fff",
  },

  // =====================================================
  // IMAGE
  // =====================================================

  imageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "4 / 5",
    overflow: "hidden",
    background: "#f3f3f3",
  },

  imageButton: {
    width: "100%",
    height: "100%",
    padding: 0,
    border: "none",
    background: "none",
    cursor: "pointer",
    display: "block",
  },

  image: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
    transition:
      "transform 0.25s ease",
  },

  placeholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #f4f4f4, #e5e5e5)",
    color: "#999",
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    letterSpacing: "5px",
  },

  // =====================================================
  // REMOVE HEART
  // =====================================================

  removeIcon: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "50%",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "15px",
    boxShadow:
      "0 2px 10px rgba(0, 0, 0, 0.08)",
  },

  // =====================================================
  // PRODUCT INFO
  // =====================================================

  info: {
    padding: "17px 2px 0",
  },

  category: {
    margin: "0 0 8px",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "1.8px",
    color: "#777",
    textTransform: "uppercase",
  },

  productName: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "18px",
    fontWeight: "400",
    lineHeight: "1.35",
    color: "#111",
  },

  // =====================================================
  // PRICE
  // =====================================================

  priceRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "9px",
    marginTop: "10px",
  },

  price: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#111",
  },

  oldPrice: {
    fontSize: "12px",
    color: "#999",
    textDecoration:
      "line-through",
  },

  // =====================================================
  // ACTIONS
  // =====================================================

  actions: {
    display: "flex",
    gap: "7px",
    marginTop: "16px",
  },

  viewButton: {
    flex: 1,
    minWidth: 0,
    padding: "11px 6px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },

  cartButton: {
    flex: 1,
    minWidth: 0,
    padding: "11px 6px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },

  // =====================================================
  // TABLET
  // =====================================================

  "@media (max-width: 1050px)": {
    page: {
      padding:
        "65px 22px 85px",
    },

    container: {
      maxWidth: "100%",
    },

    grid: {
      gridTemplateColumns:
        "repeat(3, minmax(0, 1fr))",
    },
  },

  // =====================================================
  // MOBILE
  // =====================================================

  "@media (max-width: 760px)": {
    page: {
      padding:
        "55px 16px 75px",
    },

    header: {
      marginBottom: "38px",
    },

    title: {
      fontSize: "40px",
    },

    subtitle: {
      fontSize: "13px",
    },

    grid: {
      gridTemplateColumns:
        "repeat(2, minmax(0, 1fr))",
      gap: "18px 12px",
    },

    productName: {
      fontSize: "16px",
    },

    actions: {
      flexDirection: "column",
      gap: "6px",
    },

    viewButton: {
      width: "100%",
    },

    cartButton: {
      width: "100%",
    },
  },

  // =====================================================
  // SMALL MOBILE
  // =====================================================

  "@media (max-width: 480px)": {
    page: {
      padding:
        "45px 12px 65px",
    },

    title: {
      fontSize: "34px",
    },

    eyebrow: {
      fontSize: "9px",
      letterSpacing: "2.5px",
    },

    subtitle: {
      fontSize: "12px",
      lineHeight: "1.7",
    },

    toolbar: {
      marginBottom: "18px",
    },

    grid: {
      gap: "20px 10px",
    },

    imageWrapper: {
      aspectRatio: "4 / 5",
    },

    removeIcon: {
      top: "8px",
      right: "8px",
      width: "31px",
      height: "31px",
      fontSize: "13px",
    },

    info: {
      paddingTop: "13px",
    },

    category: {
      fontSize: "7px",
      letterSpacing: "1.4px",
    },

    productName: {
      fontSize: "15px",
    },

    price: {
      fontSize: "12px",
    },

    oldPrice: {
      fontSize: "11px",
    },

    actions: {
      marginTop: "12px",
    },

    viewButton: {
      padding: "10px 4px",
      fontSize: "7px",
    },

    cartButton: {
      padding: "10px 4px",
      fontSize: "7px",
    },

    emptyCard: {
      minHeight: "320px",
      padding: "45px 20px",
    },

    emptyTitle: {
      fontSize: "25px",
    },

    emptyText: {
      fontSize: "12px",
    },
  },
};