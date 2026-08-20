import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    subtotal,
    shipping,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const [busyKey, setBusyKey] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    type: "success",
    message: "",
  });


  // =====================================================
  // FORMAT PRICE
  // =====================================================

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("en-IN");
  }

  function showToast(message, type = "success") {
    setToast({
      visible: true,
      type,
      message,
    });

    if (showToast.timeoutId) {
      window.clearTimeout(showToast.timeoutId);
    }

    showToast.timeoutId = window.setTimeout(() => {
      setToast((current) => ({
        ...current,
        visible: false,
      }));
    }, 2600);
  }

  function getStock(item) {
    if (
      item?.stock === null ||
      item?.stock === undefined
    ) {
      return null;
    }

    const stock = Number(item.stock);
    return Number.isFinite(stock) ? stock : null;
  }

  function getItemQuantity(item) {
    const quantity = Number(item?.quantity || 0);
    return Number.isFinite(quantity) && quantity > 0
      ? quantity
      : 0;
  }

  function setItemBusy(item, action) {
    setBusyKey(
      `${getItemKey(item)}:${action}`
    );
  }

  function clearItemBusy() {
    window.setTimeout(() => {
      setBusyKey("");
    }, 180);
  }

  function isItemBusy(item) {
    return busyKey.startsWith(
      `${getItemKey(item)}:`
    );
  }

  function handleImageError(event) {
    const image = event.currentTarget;

    image.style.display = "none";

    const placeholder =
      image.parentElement?.querySelector(
        "[data-cart-placeholder]"
      );

    if (placeholder) {
      placeholder.style.display = "flex";
    }
  }

  // =====================================================
  // ITEM KEY
  // =====================================================

  function getItemKey(item) {
    return `${item.id}-${item.size || "no-size"}`;
  }

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  function handleIncrease(item) {
    if (isItemBusy(item)) {
      return;
    }

    const currentQuantity =
      getItemQuantity(item);

    const stock = getStock(item);

    if (stock !== null && stock <= 0) {
      showToast(
        "This product is out of stock.",
        "error"
      );
      return;
    }

    if (
      stock !== null &&
      currentQuantity >= stock
    ) {
      showToast(
        `Only ${stock} available for ${item.name || "this product"}.`,
        "error"
      );
      return;
    }

    try {
      setItemBusy(item, "increase");

      increaseQuantity(
        item.id,
        item.size || null
      );

      showToast("Quantity updated.");
    } catch (error) {
      console.error(
        "Increase quantity error:",
        error
      );
      showToast(
        "Unable to update quantity.",
        "error"
      );
    } finally {
      clearItemBusy();
    }
  }

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  function handleDecrease(item) {
    if (isItemBusy(item)) {
      return;
    }

    const currentQuantity =
      getItemQuantity(item);

    try {
      setItemBusy(item, "decrease");

      if (currentQuantity <= 1) {
        removeFromCart(
          item.id,
          item.size || null
        );

        showToast(
          `${item.name || "Product"} removed from cart.`
        );
        return;
      }

      decreaseQuantity(
        item.id,
        item.size || null
      );

      showToast("Quantity updated.");
    } catch (error) {
      console.error(
        "Decrease quantity error:",
        error
      );
      showToast(
        "Unable to update quantity.",
        "error"
      );
    } finally {
      clearItemBusy();
    }
  }

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  function handleRemove(item) {
    if (isItemBusy(item)) {
      return;
    }

    try {
      setItemBusy(item, "remove");

      removeFromCart(
        item.id,
        item.size || null
      );

      showToast(
        `${item.name || "Product"} removed from cart.`
      );
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error
      );
      showToast(
        "Unable to remove item.",
        "error"
      );
    } finally {
      clearItemBusy();
    }
  }

  // =====================================================
  // STOCK MESSAGE
  // =====================================================

  function getStockMessage(item) {
    if (
      item.stock === null ||
      item.stock === undefined
    ) {
      return null;
    }

    const stock = Number(item.stock);

    if (!Number.isFinite(stock)) {
      return null;
    }

    if (stock <= 0) {
      return "OUT OF STOCK";
    }

    const quantity = Number(
      item.quantity || 0
    );

    if (quantity >= stock) {
      return `MAX ${stock} AVAILABLE`;
    }

    return `${stock} IN STOCK`;
  }

  // =====================================================
  // CONTINUE SHOPPING
  // =====================================================

  function handleContinueShopping() {
    navigate("/shop");
  }

  // =====================================================
  // CHECKOUT
  // =====================================================

  function handleCheckout() {
    if (!cartItems || cartItems.length === 0) {
      showToast(
        "Your cart is empty.",
        "error"
      );
      return;
    }

    const unavailableItem =
      cartItems.find((item) => {
        const stock = getStock(item);
        const quantity =
          getItemQuantity(item);

        return (
          stock !== null &&
          (stock <= 0 ||
            quantity > stock)
        );
      });

    if (unavailableItem) {
      showToast(
        `${unavailableItem.name || "A cart item"} is no longer available in the selected quantity.`,
        "error"
      );
      return;
    }

    navigate("/checkout");
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="vorn-cart-page" style={styles.page}>
        <section style={styles.container}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>
              VORN SHOPPING BAG
            </p>

            <h1 style={styles.title}>
              Your Cart
            </h1>

            <p style={styles.subtitle}>
              Review your selected VORN pieces
              before checkout.
            </p>
          </div>

          <section style={styles.emptyCard}>
            <h2 style={styles.emptyTitle}>
              Your Cart Is Empty
            </h2>

            <p style={styles.emptyText}>
              You haven't added any VORN
              products to your cart yet.
            </p>

            <button
              type="button"
              onClick={
                handleContinueShopping
              }
              style={styles.primaryButton}
            >
              START SHOPPING
            </button>
          </section>
        </section>
      </main>
    );
  }

  // =====================================================
  // CART PAGE
  // =====================================================

  return (
    <main className="vorn-cart-page" style={styles.page}>
      <section style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <p style={styles.eyebrow}>
            VORN SHOPPING BAG
          </p>

          <div style={styles.titleRow}>
            <h1 style={styles.title}>
              Your Cart
            </h1>

            {!(!cartItems || cartItems.length === 0) && (
              <span style={styles.cartCount}>
                {cartItems.reduce(
                  (count, item) =>
                    count +
                    getItemQuantity(item),
                  0
                )}{" "}
                {cartItems.reduce(
                  (count, item) =>
                    count +
                    getItemQuantity(item),
                  0
                ) === 1
                  ? "ITEM"
                  : "ITEMS"}
              </span>
            )}
          </div>

          <p style={styles.subtitle}>
            Review your selected VORN pieces
            before checkout.
          </p>
        </div>

        {/* CART LAYOUT */}

        <div style={styles.cartLayout}>

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <section style={styles.itemsPanel}>

            {cartItems.map((item) => {
              const quantity = Number(
                item.quantity || 0
              );

              const price = Number(
                item.price || 0
              );

              const itemTotal =
                price * quantity;

              const stockMessage =
                getStockMessage(item);

              const isOutOfStock =
                item.stock !== null &&
                item.stock !== undefined &&
                Number(item.stock) <= 0;

              const maxStockReached =
                item.stock !== null &&
                item.stock !== undefined &&
                quantity >= Number(item.stock);

              return (
                <article
                  key={getItemKey(item)}
                  className="vorn-cart-item"
                  style={{
                    ...styles.item,
                    ...(isItemBusy(item)
                      ? styles.itemBusy
                      : {}),
                  }}
                >
                  {/* PRODUCT IMAGE */}

                  <div
                    style={styles.imageBox}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={
                          item.name ||
                          "VORN Product"
                        }
                        style={styles.image}
                        loading="lazy"
                        onError={handleImageError}
                      />
                    ) : null}

                    <span
                      data-cart-placeholder
                      style={{
                        ...styles.imagePlaceholder,
                        display: item.image
                          ? "none"
                          : "flex",
                      }}
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
                    </span>
                  </div>

                  {/* PRODUCT INFORMATION */}

                  <div
                    style={styles.itemInfo}
                  >
                    <div
                      style={styles.itemTop}
                    >
                      <div>
                        <h2
                          style={
                            styles.itemName
                          }
                        >
                          {item.name ||
                            "VORN Product"}
                        </h2>

                        {item.size && (
                          <p
                            style={
                              styles.itemMeta
                            }
                          >
                            Size: {item.size}
                          </p>
                        )}

                        {item.color && (
                          <p
                            style={
                              styles.itemMeta
                            }
                          >
                            Color: {item.color}
                          </p>
                        )}

                        {stockMessage && (
                          <p
                            style={
                              isOutOfStock
                                ? styles.outOfStock
                                : styles.stockHint
                            }
                          >
                            {stockMessage}
                          </p>
                        )}
                      </div>

                      {/* UNIT PRICE */}

                      <p
                        style={
                          styles.itemPrice
                        }
                      >
                        ₹
                        {formatPrice(price)}
                      </p>
                    </div>

                    {/* BOTTOM ROW */}

                    <div
                      style={
                        styles.bottomRow
                      }
                    >
                      {isItemBusy(item) && (
                        <span
                          style={
                            styles.itemUpdating
                          }
                        >
                          Updating…
                        </span>
                      )}
                      {/* QUANTITY */}

                      <div
                        style={
                          styles.quantityWrapper
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleDecrease(
                              item
                            )
                          }
                          disabled={isItemBusy(item)}
                          style={{
                            ...styles.quantityButton,
                            ...(isItemBusy(item)
                              ? styles.disabledQuantityButton
                              : {}),
                          }}
                          aria-label={`Decrease quantity for ${
                            item.name ||
                            "product"
                          }`}
                        >
                          −
                        </button>

                        <span
                          style={
                            styles.quantity
                          }
                        >
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleIncrease(
                              item
                            )
                          }
                          disabled={
                            isOutOfStock ||
                            maxStockReached ||
                            isItemBusy(item)
                          }
                          style={{
                            ...styles.quantityButton,

                            ...(isOutOfStock ||
                            maxStockReached ||
                            isItemBusy(item)
                              ? styles.disabledQuantityButton
                              : {}),
                          }}
                          aria-label={`Increase quantity for ${
                            item.name ||
                            "product"
                          }`}
                        >
                          +
                        </button>
                      </div>

                      {/* ITEM TOTAL */}

                      <div
                        style={
                          styles.itemTotalGroup
                        }
                      >
                        <p
                          style={
                            styles.itemTotal
                          }
                        >
                          ₹
                          {formatPrice(
                            itemTotal
                          )}
                        </p>
                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(item)
                        }
                        disabled={isItemBusy(item)}
                        style={{
                          ...styles.removeButton,
                          ...(isItemBusy(item)
                            ? styles.disabledRemoveButton
                            : {}),
                        }}
                      >
                        {isItemBusy(item)
                          ? "UPDATING..."
                          : "REMOVE"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside
            style={styles.summary}
          >
            <h2
              style={styles.summaryTitle}
            >
              ORDER SUMMARY
            </h2>

            <div style={styles.summaryItems}>
              {cartItems.reduce(
                (count, item) =>
                  count +
                  getItemQuantity(item),
                0
              )}{" "}
              {cartItems.reduce(
                (count, item) =>
                  count +
                  getItemQuantity(item),
                0
              ) === 1
                ? "item"
                : "items"}{" "}
              in your bag
            </div>

            {/* SUBTOTAL */}

            <div
              style={styles.summaryRow}
            >
              <span>
                Subtotal
              </span>

              <span>
                ₹{formatPrice(subtotal)}
              </span>
            </div>

            {/* SHIPPING */}

            <div
              style={styles.summaryRow}
            >
              <span>
                Shipping
              </span>

              <span>
                {shipping === 0
                  ? "FREE"
                  : `₹${formatPrice(
                      shipping
                    )}`}
              </span>
            </div>

            <div
              style={styles.divider}
            />

            {/* TOTAL */}

            <div
              style={styles.totalRow}
            >
              <span>
                Total
              </span>

              <strong>
                ₹{formatPrice(total)}
              </strong>
            </div>

            {/* CHECKOUT */}

            <button
              type="button"
              onClick={handleCheckout}
              style={
                styles.checkoutButton
              }
            >
              PROCEED TO CHECKOUT
            </button>

            {/* CONTINUE SHOPPING */}

            <button
              type="button"
              onClick={
                handleContinueShopping
              }
              style={
                styles.continueButton
              }
            >
              CONTINUE SHOPPING
            </button>
          </aside>
        </div>
      </section>

      {toast.visible && (
        <div
          className="vorn-cart-toast"
          role="status"
          aria-live="polite"
          style={{
            ...styles.toast,
            ...(toast.type === "error"
              ? styles.toastError
              : styles.toastSuccess),
          }}
        >
          <span style={styles.toastIcon}>
            {toast.type === "error"
              ? "!"
              : "✓"}
          </span>

          <span>{toast.message}</span>

          <button
            type="button"
            onClick={() =>
              setToast((current) => ({
                ...current,
                visible: false,
              }))
            }
            style={styles.toastClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .vorn-cart-page {
          box-sizing: border-box;
        }

        .vorn-cart-page *,
        .vorn-cart-page *::before,
        .vorn-cart-page *::after {
          box-sizing: border-box;
        }

        .vorn-cart-item {
          transition:
            opacity .18s ease,
            background .18s ease;
        }

        .vorn-cart-item:hover {
          background: #fcfcfc;
        }

        @media (max-width: 900px) {
          .vorn-cart-page {
            padding-top: 65px !important;
          }
        }

        @media (max-width: 520px) {
          .vorn-cart-page {
            padding-top: 38px !important;
          }

          .vorn-cart-page .vorn-cart-item:hover {
            background: #fff;
          }

          .vorn-cart-toast {
            left: 14px !important;
            right: 14px !important;
            bottom: 14px !important;
            max-width: none !important;
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

  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
  },

  cartCount: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "26px",
    padding: "5px 9px",
    border: "1px solid #ddd",
    color: "#666",
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "1.2px",
  },

  summaryItems: {
    margin: "-8px 0 15px",
    color: "#888",
    fontSize: "10px",
    letterSpacing: "0.4px",
  },

  itemBusy: {
    opacity: 0.62,
  },

  itemUpdating: {
    color: "#888",
    fontSize: "9px",
    letterSpacing: "0.7px",
    fontWeight: "600",
  },

  disabledRemoveButton: {
    color: "#aaa",
    cursor: "not-allowed",
  },

  placeholderMark: {
    fontFamily: "Georgia, serif",
    fontSize: "30px",
    lineHeight: 1,
    color: "#222",
  },

  placeholderText: {
    marginTop: "5px",
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
    boxShadow: "0 12px 35px rgba(0,0,0,.14)",
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
    padding: "80px 24px",
    background: "#fff",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  // =====================================================
  // HEADER
  // =====================================================

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
    fontFamily: "Georgia, serif",
    fontSize: "44px",
    fontWeight: "500",
    color: "#111",
  },

  subtitle: {
    margin: "14px auto 0",
    maxWidth: "550px",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.7",
  },

  // =====================================================
  // EMPTY CART
  // =====================================================

  emptyCard: {
    border: "1px solid #e5e5e5",
    padding: "85px 30px",
    textAlign: "center",
    background: "#fff",
  },

  emptyTitle: {
    margin: "0 0 14px",
    fontFamily: "Georgia, serif",
    fontSize: "30px",
    fontWeight: "500",
    color: "#111",
  },

  emptyText: {
    margin: "0 auto 30px",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  primaryButton: {
    padding: "16px 30px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  // =====================================================
  // CART LAYOUT
  // =====================================================

  cartLayout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 360px",
    gap: "30px",
    alignItems: "start",
  },

  // =====================================================
  // ITEMS PANEL
  // =====================================================

  itemsPanel: {
    border: "1px solid #e5e5e5",
    background: "#fff",
  },

  item: {
    display: "flex",
    gap: "24px",
    padding: "24px",
    borderBottom:
      "1px solid #eeeeee",
  },

  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  imageBox: {
    width: "150px",
    height: "180px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f6f6",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    fontSize: "10px",
    letterSpacing: "3px",
    background: "#f6f6f6",
  },

  // =====================================================
  // ITEM INFO
  // =====================================================

  itemInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },

  itemName: {
    margin: "0 0 8px",
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    fontWeight: "500",
    color: "#111",
  },

  itemMeta: {
    margin: "4px 0",
    color: "#777",
    fontSize: "12px",
  },

  itemPrice: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    color: "#111",
  },

  // =====================================================
  // STOCK
  // =====================================================

  stockHint: {
    display: "block",
    marginTop: "6px",
    fontSize: "9px",
    color: "#888",
    letterSpacing: "0.5px",
  },

  outOfStock: {
    margin: "7px 0 0",
    fontSize: "9px",
    color: "#b42318",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },

  // =====================================================
  // BOTTOM ROW
  // =====================================================

  bottomRow: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  // =====================================================
  // QUANTITY
  // =====================================================

  quantityWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    background: "#fff",
  },

  quantityButton: {
    width: "36px",
    height: "36px",
    border: "none",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledQuantityButton: {
    color: "#aaa",
    background: "#f5f5f5",
    cursor: "not-allowed",
  },

  quantity: {
    width: "36px",
    textAlign: "center",
    fontSize: "13px",
    color: "#111",
  },

  // =====================================================
  // ITEM TOTAL
  // =====================================================

  itemTotalGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  itemTotal: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    color: "#111",
  },

  // =====================================================
  // REMOVE
  // =====================================================

  removeButton: {
    marginLeft: "auto",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "10px",
    letterSpacing: "1px",
  },

  // =====================================================
  // ORDER SUMMARY
  // =====================================================

  summary: {
    padding: "30px",
    border: "1px solid #e5e5e5",
    background: "#fff",
  },

  summaryTitle: {
    margin: "0 0 25px",
    paddingBottom: "18px",
    borderBottom:
      "1px solid #eeeeee",
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#111",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "10px 0",
    color: "#555",
    fontSize: "13px",
  },

  divider: {
    height: "1px",
    margin: "15px 0",
    background: "#eeeeee",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    color: "#111",
    fontSize: "15px",
  },

  // =====================================================
  // CHECKOUT
  // =====================================================

  checkoutButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.3px",
  },

  continueButton: {
    width: "100%",
    marginTop: "10px",
    padding: "14px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.2px",
  },

  // =====================================================
  // RESPONSIVE
  // =====================================================

  "@media (max-width: 900px)": {
    cartLayout: {
      gridTemplateColumns: "1fr",
    },

    summary: {
      width: "100%",
      boxSizing: "border-box",
    },

    item: {
      gap: "18px",
    },

    imageBox: {
      width: "130px",
      height: "160px",
    },
  },

  "@media (max-width: 700px)": {
    page: {
      padding: "60px 18px 80px",
    },

    title: {
      fontSize: "38px",
    },

    subtitle: {
      fontSize: "13px",
    },

    header: {
      marginBottom: "35px",
    },

    item: {
      padding: "18px",
      gap: "15px",
    },

    imageBox: {
      width: "110px",
      height: "140px",
    },

    itemName: {
      fontSize: "18px",
    },

    bottomRow: {
      marginTop: "22px",
      gap: "12px",
    },

    summary: {
      padding: "24px",
    },
  },

  "@media (max-width: 520px)": {
    page: {
      padding: "45px 14px 70px",
    },

    header: {
      marginBottom: "28px",
    },

    eyebrow: {
      fontSize: "9px",
      letterSpacing: "2.5px",
    },

    title: {
      fontSize: "34px",
    },

    subtitle: {
      maxWidth: "320px",
      fontSize: "12px",
      lineHeight: "1.6",
    },

    emptyCard: {
      padding: "60px 20px",
    },

    emptyTitle: {
      fontSize: "26px",
    },

    emptyText: {
      fontSize: "13px",
    },

    cartLayout: {
      display: "block",
    },

    itemsPanel: {
      width: "100%",
    },

    item: {
      display: "grid",
      gridTemplateColumns:
        "90px minmax(0, 1fr)",
      gap: "14px",
      padding: "16px",
    },

    imageBox: {
      width: "90px",
      height: "115px",
    },

    itemTop: {
      display: "block",
    },

    itemName: {
      fontSize: "16px",
      lineHeight: "1.35",
      marginBottom: "6px",
    },

    itemPrice: {
      marginTop: "8px",
      fontSize: "13px",
    },

    itemMeta: {
      fontSize: "11px",
    },

    bottomRow: {
      gridColumn: "1 / -1",
      width: "100%",
      marginTop: "10px",
      gap: "12px",
    },

    quantityButton: {
      width: "32px",
      height: "32px",
    },

    quantity: {
      width: "32px",
      fontSize: "12px",
    },

    itemTotalGroup: {
      marginLeft: "auto",
    },

    itemTotal: {
      fontSize: "12px",
    },

    removeButton: {
      fontSize: "9px",
    },

    summary: {
      marginTop: "20px",
      padding: "22px 18px",
    },

    summaryTitle: {
      fontSize: "12px",
    },

    summaryRow: {
      fontSize: "12px",
    },

    totalRow: {
      fontSize: "14px",
    },

    checkoutButton: {
      padding: "15px",
      fontSize: "10px",
    },

    continueButton: {
      padding: "13px",
      fontSize: "9px",
    },
  },

  "@media (max-width: 380px)": {
    page: {
      paddingLeft: "10px",
      paddingRight: "10px",
    },

    item: {
      gridTemplateColumns:
        "75px minmax(0, 1fr)",
      padding: "13px",
      gap: "11px",
    },

    imageBox: {
      width: "75px",
      height: "100px",
    },

    itemName: {
      fontSize: "15px",
    },

    bottomRow: {
      gap: "8px",
    },

    quantityButton: {
      width: "29px",
      height: "29px",
    },

    quantity: {
      width: "28px",
    },

    removeButton: {
      fontSize: "8px",
    },
  },
};