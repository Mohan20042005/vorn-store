import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabaseClient";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Expanded order IDs
  const [expandedOrders, setExpandedOrders] = useState(
    {}
  );

  useEffect(() => {
    let channel;

    async function setup() {
      const userResult =
        await supabase.auth.getUser();

      const user =
        userResult?.data?.user;

      if (!user) {
        navigate("/login");
        return;
      }

      await loadOrders(true);

      // ============================================
      // REALTIME ORDER STATUS UPDATES
      // ============================================

      channel = supabase
        .channel(
          `customer-orders-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadOrders(false);
          }
        )
        .subscribe();
    }

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [navigate]);

  // ============================================
  // LOAD ORDERS
  // ============================================

  async function loadOrders(
    showLoader = false
  ) {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage("");

      // ==========================================
      // CURRENT USER
      // ==========================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      // ==========================================
      // ORDERS
      // ==========================================

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (orderError) {
        throw orderError;
      }

      if (
        !orderData ||
        orderData.length === 0
      ) {
        setOrders([]);
        return;
      }

      // ==========================================
      // ORDER ITEMS
      // ==========================================

      const ordersWithItems =
        await Promise.all(
          orderData.map(
            async (order) => {
              const {
                data: itemData,
                error: itemError,
              } = await supabase
                .from("order_items")
                .select(`
                  id,
                  order_id,
                  product_id,
                  variant_id,
                  product_name,
                  sku,
                  selected_size,
                  selected_color,
                  unit_price,
                  quantity,
                  total_price,
                  created_at
                `)
                .eq(
                  "order_id",
                  order.id
                )
                .order(
                  "created_at",
                  {
                    ascending: true,
                  }
                );

              if (itemError) {
                console.error(
                  "Order items error:",
                  itemError
                );

                return {
                  ...order,
                  items: [],
                };
              }

              // ==================================
              // GET PRODUCT IMAGES
              // ==================================

              const itemsWithImages =
                await Promise.all(
                  (
                    itemData || []
                  ).map(
                    async (item) => {
                      if (
                        !item.product_id
                      ) {
                        return {
                          ...item,
                          image: null,
                          slug: null,
                        };
                      }

                      const {
                        data:
                          productData,
                      } =
                        await supabase
                          .from(
                            "products"
                          )
                          .select(
                            "id, slug, image_url, image"
                          )
                          .eq(
                            "id",
                            item.product_id
                          )
                          .maybeSingle();

                      return {
                        ...item,

                        image:
                          productData?.image_url ||
                          productData?.image ||
                          null,

                        slug:
                          productData?.slug ||
                          null,
                      };
                    }
                  )
                );

              return {
                ...order,
                items:
                  itemsWithImages,
              };
            }
          )
        );

      setOrders(
        ordersWithItems
      );

      // ==========================================
      // AUTO EXPAND FIRST ORDER
      // ==========================================

      if (
        ordersWithItems.length > 0
      ) {
        setExpandedOrders(
          (previous) => {
            if (
              Object.keys(
                previous
              ).length > 0
            ) {
              return previous;
            }

            return {
              [ordersWithItems[0].id]:
                true,
            };
          }
        );
      }
    } catch (error) {
      console.error(
        "Orders page error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Something went wrong while loading your orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ============================================
  // REFRESH
  // ============================================

  async function handleRefresh() {
    await loadOrders(false);
  }

  // ============================================
  // TOGGLE ORDER
  // ============================================

  function toggleOrder(
    orderId
  ) {
    setExpandedOrders(
      (previous) => ({
        ...previous,
        [orderId]:
          !previous[orderId],
      })
    );
  }

  // ============================================
  // VIEW PRODUCT
  // ============================================

  function handleViewProduct(
    item
  ) {
    if (item.slug) {
      navigate(
        `/product/${item.slug}`
      );

      return;
    }

    if (item.product_id) {
      navigate(
        `/product/${item.product_id}`
      );
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
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
          VORN ACCOUNT
        </p>

        <h1
          style={
            styles.title
          }
        >
          Loading Orders...
        </h1>

        <p
          style={
            styles.loadingText
          }
        >
          Please wait.
        </p>
      </main>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <main
      style={
        styles.page
      }
    >
      {/* ========================================
          HEADER
      ======================================== */}

      <header
        style={
          styles.header
        }
      >
        <div>
          <p
            style={
              styles.eyebrow
            }
          >
            VORN ACCOUNT
          </p>

          <h1
            style={
              styles.title
            }
          >
            My Orders
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            View your VORN order history
            and track your purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleRefresh
          }
          disabled={
            refreshing
          }
          style={
            styles.refreshButton
          }
        >
          {refreshing
            ? "REFRESHING..."
            : "REFRESH ORDERS"}
        </button>
      </header>

      {/* ========================================
          ERROR
      ======================================== */}

      {errorMessage && (
        <div
          style={
            styles.errorBox
          }
        >
          <strong>
            Unable to load orders
          </strong>

          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            style={
              styles.errorButton
            }
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {/* ========================================
          EMPTY
      ======================================== */}

      {!errorMessage &&
        orders.length === 0 && (
          <section
            style={
              styles.empty
            }
          >
            <p
              style={
                styles.emptyEyebrow
              }
            >
              NO ORDERS
            </p>

            <h2
              style={
                styles.emptyTitle
              }
            >
              You haven't placed any
              orders yet.
            </h2>

            <p
              style={
                styles.emptyText
              }
            >
              Your orders will appear
              here after you complete
              a purchase.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/shop"
                )
              }
              style={
                styles.primaryButton
              }
            >
              START SHOPPING
            </button>
          </section>
        )}

      {/* ========================================
          ORDERS
      ======================================== */}

      <div
        style={
          styles.ordersList
        }
      >
        {orders.map(
          (order) => {
            const orderNumber =
              order.order_number ||
              order.id;

            const orderStatus =
              String(
                order.status ||
                  "pending"
              ).toLowerCase();

            const paymentStatus =
              String(
                order.payment_status ||
                  "pending"
              ).toLowerCase();

            const paymentMethod =
              order.payment_method ||
              "online";

            const totalAmount =
              Number(
                order.total_amount ||
                  0
              );

            const subtotal =
              Number(
                order.subtotal ||
                  0
              );

            const shippingAmount =
              Number(
                order.shipping_amount ||
                  0
              );

            const discountAmount =
              Number(
                order.discount_amount ||
                  0
              );

            const orderDate =
              order.created_at
                ? new Date(
                    order.created_at
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "—";

            const isExpanded =
              Boolean(
                expandedOrders[
                  order.id
                ]
              );

            return (
              <article
                key={
                  order.id
                }
                style={
                  styles.orderCard
                }
              >
                {/* ==================================
                    ORDER HEADER
                ================================== */}

                <button
                  type="button"
                  onClick={() =>
                    toggleOrder(
                      order.id
                    )
                  }
                  style={
                    styles.orderHeaderButton
                  }
                >
                  <div
                    style={
                      styles.orderHeader
                    }
                  >
                    <div
                      style={
                        styles.orderHeaderInfo
                      }
                    >
                      <p
                        style={
                          styles.orderLabel
                        }
                      >
                        ORDER
                      </p>

                      <h2
                        style={
                          styles.orderNumber
                        }
                      >
                        {
                          orderNumber
                        }
                      </h2>

                      <p
                        style={
                          styles.orderDate
                        }
                      >
                        Placed on{" "}
                        {
                          orderDate
                        }
                      </p>
                    </div>

                    <div
                      style={
                        styles.headerRight
                      }
                    >
                      <div
                        style={
                          styles.statusGroup
                        }
                      >
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(
                              orderStatus
                            ),
                          }}
                        >
                          {formatStatus(
                            orderStatus
                          )}
                        </span>

                        <span
                          style={{
                            ...styles.paymentBadge,
                            ...getPaymentStyle(
                              paymentStatus
                            ),
                          }}
                        >
                          Payment:{" "}
                          {formatStatus(
                            paymentStatus
                          )}
                        </span>
                      </div>

                      <span
                        style={
                          styles.expandIcon
                        }
                      >
                        {isExpanded
                          ? "−"
                          : "+"}
                      </span>
                    </div>
                  </div>
                </button>

                {/* ==================================
                    ORDER CONTENT
                ================================== */}

                {isExpanded && (
                  <>
                    {/* ==================================
                        ORDER STATUS TRACKER
                    ================================== */}

                    <StatusTimeline
                      status={
                        orderStatus
                      }
                    />

                    {/* ==================================
                        ITEMS
                    ================================== */}

                    <div
                      style={
                        styles.itemsSection
                      }
                    >
                      <div
                        style={
                          styles.sectionHeading
                        }
                      >
                        ORDER ITEMS
                      </div>

                      {order.items &&
                      order.items
                        .length >
                        0 ? (
                        <div>
                          {order.items.map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.id
                                }
                                style={
                                  styles.itemRow
                                }
                              >
                                {/* IMAGE */}

                                <div
                                  style={
                                    styles.itemImage
                                  }
                                >
                                  {item.image ? (
                                    <img
                                      src={
                                        item.image
                                      }
                                      alt={
                                        item.product_name ||
                                        "VORN Product"
                                      }
                                      style={
                                        styles.itemImageActual
                                      }
                                    />
                                  ) : (
                                    <span>
                                      VORN
                                    </span>
                                  )}
                                </div>

                                {/* INFO */}

                                <div
                                  style={
                                    styles.itemInfo
                                  }
                                >
                                  <h3
                                    style={
                                      styles.itemName
                                    }
                                  >
                                    {
                                      item.product_name
                                    }
                                  </h3>

                                  {item.sku && (
                                    <p
                                      style={
                                        styles.itemMeta
                                      }
                                    >
                                      SKU:{" "}
                                      {
                                        item.sku
                                      }
                                    </p>
                                  )}

                                  <div
                                    style={
                                      styles.itemDetails
                                    }
                                  >
                                    {item.selected_size && (
                                      <span>
                                        Size:{" "}
                                        {
                                          item.selected_size
                                        }
                                      </span>
                                    )}

                                    {item.selected_color && (
                                      <span>
                                        Color:{" "}
                                        {
                                          item.selected_color
                                        }
                                      </span>
                                    )}

                                    <span>
                                      Qty:{" "}
                                      {
                                        item.quantity
                                      }
                                    </span>
                                  </div>

                                  {/* VIEW PRODUCT */}

                                  {(
                                    item.slug ||
                                    item.product_id
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleViewProduct(
                                          item
                                        )
                                      }
                                      style={
                                        styles.viewProductButton
                                      }
                                    >
                                      VIEW PRODUCT
                                    </button>
                                  )}
                                </div>

                                {/* PRICE */}

                                <div
                                  style={
                                    styles.itemPrice
                                  }
                                >
                                  <p
                                    style={
                                      styles.unitPrice
                                    }
                                  >
                                    ₹
                                    {Number(
                                      item.unit_price ||
                                        0
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>

                                  <strong>
                                    ₹
                                    {Number(
                                      item.total_price ||
                                        0
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </strong>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p
                          style={
                            styles.noItems
                          }
                        >
                          Order item details
                          are not available.
                        </p>
                      )}
                    </div>

                    {/* ==================================
                        BOTTOM GRID
                    ================================== */}

                    <div
                      style={
                        styles.bottomGrid
                      }
                    >
                      {/* SHIPPING */}

                      <div
                        style={
                          styles.shippingBox
                        }
                      >
                        <div
                          style={
                            styles.sectionHeading
                          }
                        >
                          SHIPPING ADDRESS
                        </div>

                        <p
                          style={
                            styles.addressName
                          }
                        >
                          {order.shipping_name ||
                            "—"}
                        </p>

                        {order.shipping_address_line1 && (
                          <p
                            style={
                              styles.addressText
                            }
                          >
                            {
                              order.shipping_address_line1
                            }
                          </p>
                        )}

                        {order.shipping_address_line2 && (
                          <p
                            style={
                              styles.addressText
                            }
                          >
                            {
                              order.shipping_address_line2
                            }
                          </p>
                        )}

                        <p
                          style={
                            styles.addressText
                          }
                        >
                          {order.shipping_city ||
                            ""}

                          {order.shipping_city &&
                          order.shipping_state
                            ? ", "
                            : ""}

                          {order.shipping_state ||
                            ""}
                        </p>

                        <p
                          style={
                            styles.addressText
                          }
                        >
                          {order.shipping_postal_code ||
                            ""}
                        </p>

                        <p
                          style={
                            styles.addressText
                          }
                        >
                          {order.shipping_country ||
                            "India"}
                        </p>

                        {order.shipping_phone && (
                          <p
                            style={
                              styles.phoneText
                            }
                          >
                            Phone:{" "}
                            {
                              order.shipping_phone
                            }
                          </p>
                        )}
                      </div>

                      {/* SUMMARY */}

                      <div
                        style={
                          styles.summaryBox
                        }
                      >
                        <div
                          style={
                            styles.sectionHeading
                          }
                        >
                          ORDER SUMMARY
                        </div>

                        <div
                          style={
                            styles.summaryRow
                          }
                        >
                          <span>
                            Subtotal
                          </span>

                          <span>
                            ₹
                            {subtotal.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        <div
                          style={
                            styles.summaryRow
                          }
                        >
                          <span>
                            Shipping
                          </span>

                          <span>
                            {shippingAmount >
                            0
                              ? `₹${shippingAmount.toLocaleString(
                                  "en-IN"
                                )}`
                              : "FREE"}
                          </span>
                        </div>

                        {discountAmount >
                          0 && (
                          <div
                            style={
                              styles.summaryRow
                            }
                          >
                            <span>
                              Discount
                            </span>

                            <span>
                              -₹
                              {discountAmount.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        )}

                        <div
                          style={
                            styles.totalRow
                          }
                        >
                          <span>
                            Total
                          </span>

                          <strong>
                            ₹
                            {totalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>

                        <div
                          style={
                            styles.paymentMethod
                          }
                        >
                          Payment method:{" "}
                          <strong>
                            {formatPaymentMethod(
                              paymentMethod
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* ==================================
                        NOTES
                    ================================== */}

                    {order.notes && (
                      <div
                        style={
                          styles.notesBox
                        }
                      >
                        <div
                          style={
                            styles.sectionHeading
                          }
                        >
                          ORDER NOTES
                        </div>

                        <p
                          style={
                            styles.notesText
                          }
                        >
                          {
                            order.notes
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          }
        )}
      </div>

      {/* ========================================
          BOTTOM BUTTON
      ======================================== */}

      <div
        style={
          styles.bottomAction
        }
      >
        <button
          type="button"
          onClick={() =>
            navigate(
              "/shop"
            )
          }
          style={
            styles.secondaryButton
          }
        >
          CONTINUE SHOPPING
        </button>
      </div>
    </main>
  );
}

/* =====================================================
   STATUS TIMELINE
===================================================== */

function StatusTimeline({
  status,
}) {
  const statuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
  ];

  const normalized =
    String(
      status || "pending"
    ).toLowerCase();

  const isCancelled =
    normalized ===
      "cancelled" ||
    normalized ===
      "canceled";

  if (isCancelled) {
    return (
      <div
        style={
          styles.timeline
        }
      >
        <div
          style={
            styles.cancelledTimeline
          }
        >
          <span
            style={
              styles.cancelledDot
            }
          >
            ×
          </span>

          <div>
            <strong>
              Order Cancelled
            </strong>

            <p
              style={
                styles.cancelledText
              }
            >
              This order has been
              cancelled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex =
    statuses.indexOf(
      normalized
    ) >= 0
      ? statuses.indexOf(
          normalized
        )
      : 0;

  return (
    <div
      style={
        styles.timeline
      }
    >
      <div
        style={
          styles.timelineInner
        }
      >
        {statuses.map(
          (
            item,
            index
          ) => {
            const completed =
              index <=
              currentIndex;

            return (
              <div
                key={item}
                style={
                  styles.timelineStep
                }
              >
                <div
                  style={{
                    ...styles.timelineDot,
                    ...(completed
                      ? styles.timelineDotActive
                      : {}),
                  }}
                >
                  {completed
                    ? "✓"
                    : ""}
                </div>

                <span
                  style={{
                    ...styles.timelineLabel,
                    ...(completed
                      ? styles.timelineLabelActive
                      : {}),
                  }}
                >
                  {formatStatus(
                    item
                  )}
                </span>

                {index <
                  statuses.length -
                    1 && (
                  <div
                    style={{
                      ...styles.timelineLine,
                      ...(index <
                      currentIndex
                        ? styles.timelineLineActive
                        : {}),
                    }}
                  />
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function formatStatus(
  status
) {
  if (!status) {
    return "Pending";
  }

  return String(status)
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatPaymentMethod(
  method
) {
  if (!method) {
    return "Online Payment";
  }

  const value =
    String(method).toLowerCase();

  if (
    value ===
    "online"
  ) {
    return "Online Payment";
  }

  return formatStatus(
    method
  );
}

function getStatusStyle(
  status
) {
  const value =
    String(status).toLowerCase();

  if (
    value ===
    "delivered"
  ) {
    return {
      background:
        "#eaf7ee",
      color:
        "#18733a",
      border:
        "1px solid #cce8d5",
    };
  }

  if (
    value ===
      "cancelled" ||
    value ===
      "canceled"
  ) {
    return {
      background:
        "#fff0f0",
      color:
        "#b42318",
      border:
        "1px solid #f2cccc",
    };
  }

  if (
    value ===
    "shipped"
  ) {
    return {
      background:
        "#eef5ff",
      color:
        "#175cd3",
      border:
        "1px solid #c9dcff",
    };
  }

  if (
    value ===
    "confirmed"
  ) {
    return {
      background:
        "#f3efff",
      color:
        "#6941c6",
      border:
        "1px solid #ddd2ff",
    };
  }

  return {
    background:
      "#fff8e6",
    color:
      "#946200",
    border:
      "1px solid #f1dfaa",
  };
}

function getPaymentStyle(
  status
) {
  const value =
    String(status).toLowerCase();

  if (
    value === "paid" ||
    value ===
      "completed"
  ) {
    return {
      background:
        "#eaf7ee",
      color:
        "#18733a",
      border:
        "1px solid #cce8d5",
    };
  }

  if (
    value === "failed" ||
    value ===
      "cancelled"
  ) {
    return {
      background:
        "#fff0f0",
      color:
        "#b42318",
      border:
        "1px solid #f2cccc",
    };
  }

  return {
    background:
      "#f5f5f5",
    color:
      "#555",
    border:
      "1px solid #e2e2e2",
  };
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
  page: {
    minHeight: "75vh",
    padding:
      "80px 24px 100px",
    maxWidth:
      "1200px",
    margin:
      "0 auto",
    background:
      "#fff",
  },

  centerPage: {
    minHeight:
      "70vh",
    padding:
      "120px 24px",
    textAlign:
      "center",
  },

  loadingText: {
    color: "#777",
    fontSize:
      "14px",
  },

  header: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap: "30px",
    marginBottom:
      "55px",
  },

  eyebrow: {
    margin:
      "0 0 12px",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "3px",
    color:
      "#777",
  },

  title: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize:
      "48px",
    fontWeight:
      "400",
    color:
      "#111",
  },

  subtitle: {
    marginTop:
      "16px",
    color:
      "#777",
    fontSize:
      "14px",
  },

  refreshButton: {
    padding:
      "13px 18px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
  },

  errorBox: {
    maxWidth:
      "800px",
    margin:
      "0 auto 30px",
    padding:
      "18px",
    border:
      "1px solid #f0caca",
    background:
      "#fff5f5",
    color:
      "#b42318",
    fontSize:
      "14px",
  },

  errorButton: {
    marginTop:
      "12px",
    padding:
      "10px 16px",
    border:
      "1px solid #b42318",
    background:
      "#fff",
    color:
      "#b42318",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
  },

  empty: {
    textAlign:
      "center",
    border:
      "1px solid #e8e8e8",
    padding:
      "70px 30px",
    maxWidth:
      "700px",
    margin:
      "0 auto",
  },

  emptyEyebrow: {
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "3px",
    color:
      "#777",
  },

  emptyTitle: {
    margin:
      "15px 0",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "34px",
    fontWeight:
      "400",
  },

  emptyText: {
    color:
      "#777",
    fontSize:
      "14px",
  },

  ordersList: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "30px",
  },

  orderCard: {
    border:
      "1px solid #e5e5e5",
    background:
      "#fff",
  },

  /* ============================================
     ORDER HEADER
  ============================================ */

  orderHeaderButton: {
    width: "100%",
    padding: 0,
    border: "none",
    background:
      "transparent",
    textAlign:
      "left",
    cursor:
      "pointer",
  },

  orderHeader: {
    padding:
      "28px 30px",
    display:
      "flex",
    justifyContent:
      "space-between",
    gap:
      "20px",
    alignItems:
      "flex-start",
  },

  orderHeaderInfo: {
    minWidth: 0,
  },

  orderLabel: {
    margin: 0,
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "2px",
    color:
      "#999",
  },

  orderNumber: {
    margin:
      "7px 0 5px",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "24px",
    fontWeight:
      "400",
    color:
      "#111",
  },

  orderDate: {
    margin: 0,
    color:
      "#777",
    fontSize:
      "12px",
  },

  headerRight: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "18px",
  },

  statusGroup: {
    display:
      "flex",
    flexDirection:
      "column",
    alignItems:
      "flex-end",
    gap:
      "8px",
  },

  expandIcon: {
    width:
      "32px",
    height:
      "32px",
    border:
      "1px solid #ddd",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    fontSize:
      "20px",
    color:
      "#555",
    flexShrink: 0,
  },

  statusBadge: {
    display:
      "inline-flex",
    padding:
      "7px 11px",
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "1px",
    textTransform:
      "uppercase",
  },

  paymentBadge: {
    display:
      "inline-flex",
    padding:
      "7px 11px",
    fontSize:
      "9px",
    fontWeight:
      "500",
    letterSpacing:
      "0.5px",
  },

  /* ============================================
     TIMELINE
  ============================================ */

  timeline: {
    padding:
      "28px 30px",
    borderTop:
      "1px solid #eee",
    borderBottom:
      "1px solid #eee",
    overflowX:
      "auto",
  },

  timelineInner: {
    display:
      "flex",
    alignItems:
      "center",
    minWidth:
      "fit-content",
  },

  timelineStep: {
    display:
      "inline-flex",
    alignItems:
      "center",
    verticalAlign:
      "top",
  },

  timelineDot: {
    width:
      "28px",
    height:
      "28px",
    borderRadius:
      "50%",
    border:
      "1px solid #d8d8d8",
    background:
      "#fff",
    color:
      "#aaa",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    fontSize:
      "11px",
    flexShrink: 0,
  },

  timelineDotActive: {
    background:
      "#111",
    borderColor:
      "#111",
    color:
      "#fff",
  },

  timelineLabel: {
    marginLeft:
      "8px",
    fontSize:
      "10px",
    color:
      "#999",
    whiteSpace:
      "nowrap",
  },

  timelineLabelActive: {
    color:
      "#111",
    fontWeight:
      "600",
  },

  timelineLine: {
    width:
      "55px",
    height:
      "1px",
    background:
      "#ddd",
    margin:
      "0 10px",
  },

  timelineLineActive: {
    background:
      "#111",
  },

  cancelledTimeline: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "12px",
    color:
      "#b42318",
  },

  cancelledDot: {
    width:
      "30px",
    height:
      "30px",
    borderRadius:
      "50%",
    background:
      "#fff0f0",
    border:
      "1px solid #f2cccc",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    fontSize:
      "16px",
  },

  cancelledText: {
    margin:
      "4px 0 0",
    fontSize:
      "12px",
    color:
      "#777",
  },

  /* ============================================
     ITEMS
  ============================================ */

  itemsSection: {
    padding:
      "30px",
  },

  sectionHeading: {
    marginBottom:
      "18px",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "2px",
    color:
      "#777",
  },

  itemRow: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "18px",
    padding:
      "18px 0",
    borderBottom:
      "1px solid #eee",
  },

  itemImage: {
    width:
      "82px",
    height:
      "100px",
    flexShrink: 0,
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    background:
      "#f4f4f4",
    color:
      "#999",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "12px",
    letterSpacing:
      "3px",
    overflow:
      "hidden",
  },

  itemImageActual: {
    width:
      "100%",
    height:
      "100%",
    objectFit:
      "cover",
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },

  itemName: {
    margin:
      "0 0 6px",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "19px",
    fontWeight:
      "400",
    color:
      "#111",
  },

  itemMeta: {
    margin:
      "0 0 10px",
    color:
      "#999",
    fontSize:
      "11px",
  },

  itemDetails: {
    display:
      "flex",
    flexWrap:
      "wrap",
    gap:
      "12px",
    color:
      "#666",
    fontSize:
      "12px",
  },

  viewProductButton: {
    marginTop:
      "12px",
    padding:
      "8px 12px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "1px",
  },

  itemPrice: {
    textAlign:
      "right",
    minWidth:
      "110px",
  },

  unitPrice: {
    margin:
      "0 0 5px",
    color:
      "#999",
    fontSize:
      "11px",
  },

  noItems: {
    margin: 0,
    color:
      "#888",
    fontSize:
      "13px",
  },

  /* ============================================
     BOTTOM
  ============================================ */

  bottomGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap:
      "30px",
    padding:
      "30px",
    borderTop:
      "1px solid #eee",
  },

  shippingBox: {
    padding:
      "22px",
    background:
      "#fafafa",
  },

  addressName: {
    margin:
      "0 0 8px",
    fontWeight:
      "600",
    fontSize:
      "14px",
  },

  addressText: {
    margin:
      "3px 0",
    color:
      "#666",
    fontSize:
      "13px",
    lineHeight:
      "1.5",
  },

  phoneText: {
    margin:
      "12px 0 0",
    color:
      "#444",
    fontSize:
      "12px",
  },

  summaryBox: {
    padding:
      "22px",
    background:
      "#fafafa",
  },

  summaryRow: {
    display:
      "flex",
    justifyContent:
      "space-between",
    gap:
      "20px",
    padding:
      "8px 0",
    color:
      "#555",
    fontSize:
      "13px",
  },

  totalRow: {
    marginTop:
      "12px",
    paddingTop:
      "16px",
    borderTop:
      "1px solid #ddd",
    display:
      "flex",
    justifyContent:
      "space-between",
    gap:
      "20px",
    fontSize:
      "19px",
    color:
      "#111",
  },

  paymentMethod: {
    marginTop:
      "18px",
    paddingTop:
      "15px",
    borderTop:
      "1px solid #eee",
    color:
      "#777",
    fontSize:
      "12px",
  },

  notesBox: {
    margin:
      "0 30px 30px",
    padding:
      "20px",
    border:
      "1px solid #eee",
    fontSize:
      "13px",
    color:
      "#666",
  },

  notesText: {
    margin: 0,
  },

  /* ============================================
     BUTTONS
  ============================================ */

  primaryButton: {
    marginTop:
      "25px",
    padding:
      "15px 28px",
    border: "none",
    background:
      "#111",
    color:
      "#fff",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
  },

  secondaryButton: {
    padding:
      "15px 28px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
  },

  bottomAction: {
    textAlign:
      "center",
    marginTop:
      "45px",
  },
};