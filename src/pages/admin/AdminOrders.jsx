import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_OPTIONS = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [expandedOrderId, setExpandedOrderId] =
    useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  /* =====================================================
     LOAD ORDERS
  ===================================================== */

  async function loadOrders() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (orderError) {
        throw orderError;
      }

      if (!orderData) {
        setOrders([]);
        return;
      }

      const ordersWithItems =
        await Promise.all(
          orderData.map(
            async (order) => {
              const {
                data: items,
                error: itemsError,
              } = await supabase
                .from("order_items")
                .select(`
                  id,
                  product_id,
                  product_name,
                  sku,
                  selected_size,
                  selected_color,
                  unit_price,
                  quantity,
                  total_price
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

              if (itemsError) {
                console.error(
                  "Order items error:",
                  itemsError
                );
              }

              /*
               * Load product images separately.
               * We only use product_id here,
               * so no new order_items columns
               * are required.
               */

              const itemsWithImages =
                await Promise.all(
                  (items || []).map(
                    async (item) => {
                      if (
                        !item.product_id
                      ) {
                        return {
                          ...item,
                          image_url:
                            null,
                        };
                      }

                      const {
                        data:
                          product,
                        error:
                          productError,
                      } =
                        await supabase
                          .from(
                            "products"
                          )
                          .select(
                            "id, image_url, images"
                          )
                          .eq(
                            "id",
                            item.product_id
                          )
                          .maybeSingle();

                      if (
                        productError
                      ) {
                        console.error(
                          "Product image error:",
                          productError
                        );
                      }

                      let imageUrl =
                        product?.image_url ||
                        null;

                      if (
                        !imageUrl &&
                        Array.isArray(
                          product?.images
                        )
                      ) {
                        imageUrl =
                          product
                            .images[0] ||
                          null;
                      }

                      return {
                        ...item,
                        image_url:
                          imageUrl,
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
    } catch (error) {
      console.error(
        "Admin orders error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     UPDATE ORDER STATUS
  ===================================================== */

  async function updateOrderStatus(
    orderId,
    newStatus
  ) {
    try {
      setUpdatingId(orderId);
      setErrorMessage("");
      setSuccessMessage("");

      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq(
          "id",
          orderId
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order.id ===
              orderId
                ? {
                    ...order,
                    status:
                      data.status,
                  }
                : order
          )
      );

      setSuccessMessage(
        `Order ${
          data.order_number ||
          data.id
        } status updated.`
      );
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /* =====================================================
     UPDATE PAYMENT STATUS
  ===================================================== */

  async function updatePaymentStatus(
    orderId,
    newStatus
  ) {
    try {
      setUpdatingId(orderId);
      setErrorMessage("");
      setSuccessMessage("");

      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .update({
          payment_status:
            newStatus,
        })
        .eq(
          "id",
          orderId
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order.id ===
              orderId
                ? {
                    ...order,
                    payment_status:
                      data.payment_status,
                  }
                : order
          )
      );

      setSuccessMessage(
        "Payment status updated successfully."
      );
    } catch (error) {
      console.error(
        "Payment update error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to update payment status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /* =====================================================
     FILTER + SEARCH + SORT
  ===================================================== */

  const filteredOrders =
    useMemo(() => {
      let result = [
        ...orders,
      ];

      const query =
        search
          .trim()
          .toLowerCase();

      if (query) {
        result =
          result.filter(
            (order) => {
              const orderNumber =
                String(
                  order.order_number ||
                    ""
                ).toLowerCase();

              const orderId =
                String(
                  order.id || ""
                ).toLowerCase();

              const customer =
                String(
                  order.shipping_name ||
                    ""
                ).toLowerCase();

              const phone =
                String(
                  order.shipping_phone ||
                    ""
                ).toLowerCase();

              const email =
                String(
                  order.shipping_email ||
                    ""
                ).toLowerCase();

              return (
                orderNumber.includes(
                  query
                ) ||
                orderId.includes(
                  query
                ) ||
                customer.includes(
                  query
                ) ||
                phone.includes(
                  query
                ) ||
                email.includes(
                  query
                )
              );
            }
          );
      }

      if (
        statusFilter !==
        "all"
      ) {
        result =
          result.filter(
            (order) =>
              String(
                order.status ||
                  "pending"
              ).toLowerCase() ===
              statusFilter
          );
      }

      if (
        paymentFilter !==
        "all"
      ) {
        result =
          result.filter(
            (order) =>
              String(
                order.payment_status ||
                  "pending"
              ).toLowerCase() ===
              paymentFilter
          );
      }

      result.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.created_at ||
                0
            ).getTime();

          const dateB =
            new Date(
              b.created_at ||
                0
            ).getTime();

          if (
            sortBy ===
            "oldest"
          ) {
            return (
              dateA - dateB
            );
          }

          if (
            sortBy ===
            "amount-high"
          ) {
            return (
              Number(
                b.total_amount ||
                  0
              ) -
              Number(
                a.total_amount ||
                  0
              )
            );
          }

          if (
            sortBy ===
            "amount-low"
          ) {
            return (
              Number(
                a.total_amount ||
                  0
              ) -
              Number(
                b.total_amount ||
                  0
              )
            );
          }

          return (
            dateB - dateA
          );
        }
      );

      return result;
    }, [
      orders,
      search,
      statusFilter,
      paymentFilter,
      sortBy,
    ]);

  /* =====================================================
     STATS
  ===================================================== */

  const totalOrders =
    orders.length;

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "shipped"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "delivered"
    ).length;

  const paidRevenue =
    orders
      .filter(
        (order) =>
          String(
            order.payment_status ||
              ""
          ).toLowerCase() ===
          "paid"
      )
      .reduce(
        (
          total,
          order
        ) =>
          total +
          Number(
            order.total_amount ||
              0
          ),
        0
      );

  /* =====================================================
     TOGGLE DETAILS
  ===================================================== */

  function toggleOrder(
    orderId
  ) {
    setExpandedOrderId(
      (current) =>
        current === orderId
          ? null
          : orderId
    );
  }

  /* =====================================================
     LOADING
  ===================================================== */

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
          VORN ADMIN
        </p>

        <h1
          style={
            styles.loadingTitle
          }
        >
          Loading Orders...
        </h1>
      </main>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main
      style={
        styles.page
      }
    >

      {/* =================================================
          HEADER
      ================================================= */}

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
            VORN ADMIN
          </p>

          <h1
            style={
              styles.title
            }
          >
            Orders
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Manage customer orders,
            payments and delivery
            status.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadOrders
          }
          style={
            styles.refreshButton
          }
        >
          REFRESH
        </button>
      </header>

      {/* =================================================
          MESSAGES
      ================================================= */}

      {errorMessage && (
        <div
          style={
            styles.errorBox
          }
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={
            styles.successBox
          }
        >
          {successMessage}
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <section
        style={
          styles.statsGrid
        }
      >

        <StatCard
          label="TOTAL ORDERS"
          value={
            totalOrders
          }
        />

        <StatCard
          label="PENDING"
          value={
            pendingOrders
          }
        />

        <StatCard
          label="SHIPPED"
          value={
            shippedOrders
          }
        />

        <StatCard
          label="DELIVERED"
          value={
            deliveredOrders
          }
        />

      </section>

      {/* =================================================
          REVENUE
      ================================================= */}

      <section
        style={
          styles.revenueCard
        }
      >
        <div>
          <p
            style={
              styles.revenueLabel
            }
          >
            PAID REVENUE
          </p>

          <strong
            style={
              styles.revenueValue
            }
          >
            ₹
            {paidRevenue.toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <p
          style={
            styles.revenueHint
          }
        >
          Based on orders marked
          as paid.
        </p>
      </section>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <section
        style={
          styles.filterCard
        }
      >

        <div
          style={
            styles.filterTop
          }
        >
          <div>
            <p
              style={
                styles.eyebrow
              }
            >
              ORDER MANAGEMENT
            </p>

            <h2
              style={
                styles.filterTitle
              }
            >
              {filteredOrders.length}{" "}
              Orders
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter(
                "all"
              );
              setPaymentFilter(
                "all"
              );
              setSortBy(
                "newest"
              );
            }}
            style={
              styles.clearButton
            }
          >
            CLEAR FILTERS
          </button>
        </div>

        <div
          style={
            styles.filterGrid
          }
        >

          {/* SEARCH */}

          <div
            style={
              styles.filterField
            }
          >
            <label
              style={
                styles.filterLabel
              }
            >
              SEARCH
            </label>

            <input
              type="search"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Order number, customer, phone..."
              style={
                styles.filterInput
              }
            />
          </div>

          {/* STATUS */}

          <div
            style={
              styles.filterField
            }
          >
            <label
              style={
                styles.filterLabel
              }
            >
              ORDER STATUS
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              style={
                styles.filterInput
              }
            >
              <option value="all">
                All statuses
              </option>

              {STATUS_OPTIONS.map(
                (
                  status
                ) => (
                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {formatStatus(
                      status
                    )}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PAYMENT */}

          <div
            style={
              styles.filterField
            }
          >
            <label
              style={
                styles.filterLabel
              }
            >
              PAYMENT
            </label>

            <select
              value={
                paymentFilter
              }
              onChange={(
                event
              ) =>
                setPaymentFilter(
                  event.target
                    .value
                )
              }
              style={
                styles.filterInput
              }
            >
              <option value="all">
                All payments
              </option>

              {PAYMENT_OPTIONS.map(
                (
                  payment
                ) => (
                  <option
                    key={
                      payment
                    }
                    value={
                      payment
                    }
                  >
                    {formatStatus(
                      payment
                    )}
                  </option>
                )
              )}
            </select>
          </div>

          {/* SORT */}

          <div
            style={
              styles.filterField
            }
          >
            <label
              style={
                styles.filterLabel
              }
            >
              SORT
            </label>

            <select
              value={
                sortBy
              }
              onChange={(
                event
              ) =>
                setSortBy(
                  event.target
                    .value
                )
              }
              style={
                styles.filterInput
              }
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="amount-high">
                Highest amount
              </option>

              <option value="amount-low">
                Lowest amount
              </option>
            </select>
          </div>

        </div>
      </section>

      {/* =================================================
          EMPTY
      ================================================= */}

      {filteredOrders.length ===
        0 && (
        <section
          style={
            styles.empty
          }
        >
          <p
            style={
              styles.eyebrow
            }
          >
            NO ORDERS
          </p>

          <h2
            style={
              styles.emptyTitle
            }
          >
            No matching orders.
          </h2>

          <p
            style={
              styles.emptyText
            }
          >
            Try changing your
            search or filters.
          </p>
        </section>
      )}

      {/* =================================================
          ORDER LIST
      ================================================= */}

      <section
        style={
          styles.ordersList
        }
      >

        {filteredOrders.map(
          (order) => {
            const total =
              Number(
                order.total_amount ||
                  0
              );

            const subtotal =
              Number(
                order.subtotal ||
                  0
              );

            const shipping =
              Number(
                order.shipping_amount ||
                  0
              );

            const orderDate =
              order.created_at
                ? new Date(
                    order.created_at
                  ).toLocaleString(
                    "en-IN",
                    {
                      dateStyle:
                        "medium",
                      timeStyle:
                        "short",
                    }
                  )
                : "—";

            const isExpanded =
              expandedOrderId ===
              order.id;

            return (
              <article
                key={
                  order.id
                }
                style={
                  styles.orderCard
                }
              >

                {/* =======================================
                    ORDER HEADER
                ======================================= */}

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
                      styles.orderHeaderLeft
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
                      {order.order_number ||
                        order.id}
                    </h2>

                    <p
                      style={
                        styles.orderDate
                      }
                    >
                      {orderDate}
                    </p>
                  </div>

                  <div
                    style={
                      styles.orderHeaderRight
                    }
                  >

                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusStyle(
                          order.status
                        ),
                      }}
                    >
                      {formatStatus(
                        order.status
                      )}
                    </span>

                    <strong
                      style={
                        styles.totalHeader
                      }
                    >
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <span
                      style={
                        styles.expandArrow
                      }
                    >
                      {isExpanded
                        ? "−"
                        : "+"}
                    </span>

                  </div>

                </button>

                {/* =======================================
                    QUICK CUSTOMER ROW
                ======================================= */}

                <div
                  style={
                    styles.quickInfo
                  }
                >

                  <div>
                    <span
                      style={
                        styles.quickLabel
                      }
                    >
                      CUSTOMER
                    </span>

                    <strong
                      style={
                        styles.quickValue
                      }
                    >
                      {order.shipping_name ||
                        "Customer"}
                    </strong>
                  </div>

                  <div>
                    <span
                      style={
                        styles.quickLabel
                      }
                    >
                      PHONE
                    </span>

                    <strong
                      style={
                        styles.quickValue
                      }
                    >
                      {order.shipping_phone ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span
                      style={
                        styles.quickLabel
                      }
                    >
                      PAYMENT
                    </span>

                    <span
                      style={{
                        ...styles.paymentBadge,
                        ...getPaymentStyle(
                          order.payment_status
                        ),
                      }}
                    >
                      {formatStatus(
                        order.payment_status
                      )}
                    </span>
                  </div>

                  <div>
                    <span
                      style={
                        styles.quickLabel
                      }
                    >
                      ITEMS
                    </span>

                    <strong
                      style={
                        styles.quickValue
                      }
                    >
                      {order.items
                        .length}
                    </strong>
                  </div>

                </div>

                {/* =======================================
                    EXPANDED DETAILS
                ======================================= */}

                {isExpanded && (
                  <div
                    style={
                      styles.details
                    }
                  >

                    {/* CUSTOMER */}

                    <div
                      style={
                        styles.detailsGrid
                      }
                    >

                      <div>
                        <p
                          style={
                            styles.sectionLabel
                          }
                        >
                          CUSTOMER
                        </p>

                        <p
                          style={
                            styles.customerName
                          }
                        >
                          {order.shipping_name ||
                            "Customer"}
                        </p>

                        <p
                          style={
                            styles.customerText
                          }
                        >
                          {order.shipping_phone ||
                            "No phone"}
                        </p>

                        {order.shipping_email && (
                          <p
                            style={
                              styles.customerText
                            }
                          >
                            {
                              order.shipping_email
                            }
                          </p>
                        )}
                      </div>

                      {/* ADDRESS */}

                      <div>
                        <p
                          style={
                            styles.sectionLabel
                          }
                        >
                          SHIPPING ADDRESS
                        </p>

                        <p
                          style={
                            styles.customerText
                          }
                        >
                          {order.shipping_address_line1 ||
                            "—"}
                        </p>

                        {order.shipping_address_line2 && (
                          <p
                            style={
                              styles.customerText
                            }
                          >
                            {
                              order.shipping_address_line2
                            }
                          </p>
                        )}

                        <p
                          style={
                            styles.customerText
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
                            styles.customerText
                          }
                        >
                          {order.shipping_postal_code ||
                            ""}
                        </p>

                        {order.shipping_country && (
                          <p
                            style={
                              styles.customerText
                            }
                          >
                            {
                              order.shipping_country
                            }
                          </p>
                        )}
                      </div>

                      {/* PAYMENT */}

                      <div>
                        <p
                          style={
                            styles.sectionLabel
                          }
                        >
                          PAYMENT
                        </p>

                        <p
                          style={
                            styles.customerText
                          }
                        >
                          Method:{" "}
                          <strong>
                            {formatPaymentMethod(
                              order.payment_method
                            )}
                          </strong>
                        </p>

                        <p
                          style={
                            styles.customerText
                          }
                        >
                          Status:{" "}
                          <strong>
                            {formatStatus(
                              order.payment_status
                            )}
                          </strong>
                        </p>

                        {order.payment_id && (
                          <p
                            style={
                              styles.paymentId
                            }
                          >
                            Payment ID:{" "}
                            {
                              order.payment_id
                            }
                          </p>
                        )}
                      </div>

                    </div>

                    {/* =================================
                        ITEMS
                    ================================= */}

                    <div
                      style={
                        styles.itemsSection
                      }
                    >

                      <p
                        style={
                          styles.sectionLabel
                        }
                      >
                        ORDER ITEMS
                      </p>

                      {order.items
                        .length ===
                      0 ? (
                        <p
                          style={
                            styles.noItems
                          }
                        >
                          No order items
                          found.
                        </p>
                      ) : (
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
                                    styles.itemImageBox
                                  }
                                >
                                  {item.image_url ? (
                                    <img
                                      src={
                                        item.image_url
                                      }
                                      alt={
                                        item.product_name ||
                                        "Product"
                                      }
                                      style={
                                        styles.itemImage
                                      }
                                    />
                                  ) : (
                                    <span
                                      style={
                                        styles.itemImagePlaceholder
                                      }
                                    >
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
                                  <strong
                                    style={
                                      styles.itemName
                                    }
                                  >
                                    {item.product_name ||
                                      "Product"}
                                  </strong>

                                  <div
                                    style={
                                      styles.itemMeta
                                    }
                                  >

                                    {item.sku && (
                                      <span>
                                        SKU:{" "}
                                        {
                                          item.sku
                                        }
                                      </span>
                                    )}

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

                                    <span>
                                      Unit: ₹
                                      {Number(
                                        item.unit_price ||
                                          0
                                      ).toLocaleString(
                                        "en-IN"
                                      )}
                                    </span>

                                  </div>
                                </div>

                                {/* TOTAL */}

                                <div
                                  style={
                                    styles.itemPrice
                                  }
                                >
                                  ₹
                                  {Number(
                                    item.total_price ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </div>

                              </div>
                            )
                          )}
                        </div>
                      )}

                    </div>

                    {/* =================================
                        SUMMARY + CONTROLS
                    ================================= */}

                    <div
                      style={
                        styles.bottomSection
                      }
                    >

                      {/* SUMMARY */}

                      <div>
                        <p
                          style={
                            styles.summaryText
                          }
                        >
                          Subtotal: ₹
                          {subtotal.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p
                          style={
                            styles.summaryText
                          }
                        >
                          Shipping:{" "}
                          {shipping >
                          0
                            ? `₹${shipping.toLocaleString(
                                "en-IN"
                              )}`
                            : "FREE"}
                        </p>

                        <p
                          style={
                            styles.summaryTotal
                          }
                        >
                          Total: ₹
                          {total.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      {/* CONTROLS */}

                      <div
                        style={
                          styles.controls
                        }
                      >

                        <label
                          style={
                            styles.controlLabel
                          }
                        >
                          ORDER STATUS

                          <select
                            value={
                              order.status ||
                              "pending"
                            }
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(
                              event
                            ) =>
                              updateOrderStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            style={
                              styles.select
                            }
                          >
                            {STATUS_OPTIONS.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {formatStatus(
                                    status
                                  )}
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <label
                          style={
                            styles.controlLabel
                          }
                        >
                          PAYMENT STATUS

                          <select
                            value={
                              order.payment_status ||
                              "pending"
                            }
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(
                              event
                            ) =>
                              updatePaymentStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            style={
                              styles.select
                            }
                          >
                            {PAYMENT_OPTIONS.map(
                              (
                                payment
                              ) => (
                                <option
                                  key={
                                    payment
                                  }
                                  value={
                                    payment
                                  }
                                >
                                  {formatStatus(
                                    payment
                                  )}
                                </option>
                              )
                            )}
                          </select>
                        </label>

                      </div>

                    </div>

                  </div>
                )}

              </article>
            );
          }
        )}

      </section>

    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.statCard
      }
    >
      <p
        style={
          styles.statLabel
        }
      >
        {label}
      </p>

      <strong
        style={
          styles.statValue
        }
      >
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   FORMAT STATUS
========================================================= */

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

/* =========================================================
   PAYMENT METHOD
========================================================= */

function formatPaymentMethod(
  method
) {
  if (!method) {
    return "COD";
  }

  if (
    String(method)
      .toLowerCase() ===
    "cod"
  ) {
    return "Cash on Delivery";
  }

  return formatStatus(
    method
  );
}

/* =========================================================
   STATUS STYLE
========================================================= */

function getStatusStyle(
  status
) {
  const value =
    String(
      status ||
        "pending"
    ).toLowerCase();

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

/* =========================================================
   PAYMENT STYLE
========================================================= */

function getPaymentStyle(
  status
) {
  const value =
    String(
      status ||
        "pending"
    ).toLowerCase();

  if (
    value === "paid"
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
    value === "failed"
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
    "refunded"
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

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    minHeight:
      "75vh",
    padding:
      "80px 24px 110px",
    maxWidth:
      "1350px",
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
    background:
      "#fff",
  },

  eyebrow: {
    margin:
      "0 0 10px",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "3px",
    color:
      "#777",
  },

  loadingTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize:
      "42px",
    fontWeight:
      "400",
  },

  header: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap:
      "30px",
    marginBottom:
      "40px",
  },

  title: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize:
      "48px",
    fontWeight:
      "400",
  },

  subtitle: {
    margin:
      "12px 0 0",
    color:
      "#777",
    fontSize:
      "14px",
  },

  refreshButton: {
    padding:
      "13px 22px",
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
    padding:
      "15px 18px",
    marginBottom:
      "20px",
    border:
      "1px solid #f0caca",
    background:
      "#fff5f5",
    color:
      "#b42318",
    fontSize:
      "13px",
  },

  successBox: {
    padding:
      "15px 18px",
    marginBottom:
      "20px",
    border:
      "1px solid #cce8d5",
    background:
      "#f3fff5",
    color:
      "#18733a",
    fontSize:
      "13px",
  },

  statsGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap:
      "15px",
    marginBottom:
      "18px",
  },

  statCard: {
    border:
      "1px solid #e5e5e5",
    padding:
      "22px",
    background:
      "#fff",
  },

  statLabel: {
    margin:
      "0 0 12px",
    fontSize:
      "9px",
    letterSpacing:
      "2px",
    fontWeight:
      "600",
    color:
      "#888",
  },

  statValue: {
    fontFamily:
      "Georgia, serif",
    fontSize:
      "30px",
    fontWeight:
      "400",
  },

  revenueCard: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      "30px",
    padding:
      "25px 28px",
    marginBottom:
      "35px",
    background:
      "#111",
    color:
      "#fff",
  },

  revenueLabel: {
    margin:
      "0 0 8px",
    fontSize:
      "9px",
    letterSpacing:
      "2px",
    fontWeight:
      "600",
    opacity:
      "0.6",
  },

  revenueValue: {
    fontFamily:
      "Georgia, serif",
    fontSize:
      "34px",
    fontWeight:
      "400",
  },

  revenueHint: {
    margin: 0,
    fontSize:
      "12px",
    opacity:
      "0.6",
  },

  filterCard: {
    border:
      "1px solid #e5e5e5",
    padding:
      "25px",
    marginBottom:
      "30px",
    background:
      "#fff",
  },

  filterTop: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap:
      "20px",
    marginBottom:
      "22px",
  },

  filterTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize:
      "28px",
    fontWeight:
      "400",
  },

  clearButton: {
    padding:
      "10px 15px",
    border:
      "1px solid #ddd",
    background:
      "#fff",
    color:
      "#555",
    cursor:
      "pointer",
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "1px",
  },

  filterGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "2fr 1fr 1fr 1fr",
    gap:
      "12px",
  },

  filterField: {
    minWidth: 0,
  },

  filterLabel: {
    display:
      "block",
    marginBottom:
      "7px",
    fontSize:
      "8px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
    color:
      "#888",
  },

  filterInput: {
    width:
      "100%",
    boxSizing:
      "border-box",
    padding:
      "12px 13px",
    border:
      "1px solid #ddd",
    background:
      "#fff",
    color:
      "#111",
    outline:
      "none",
    fontSize:
      "12px",
  },

  empty: {
    padding:
      "70px 30px",
    border:
      "1px solid #e5e5e5",
    textAlign:
      "center",
    marginBottom:
      "30px",
  },

  emptyTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize:
      "30px",
    fontWeight:
      "400",
  },

  emptyText: {
    margin:
      "10px 0 0",
    color:
      "#777",
    fontSize:
      "13px",
  },

  ordersList: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "18px",
  },

  orderCard: {
    border:
      "1px solid #e2e2e2",
    background:
      "#fff",
  },

  orderHeaderButton: {
    width:
      "100%",
    padding:
      "24px 28px",
    border: 0,
    borderBottom:
      "1px solid #eee",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      "20px",
    textAlign:
      "left",
  },

  orderHeaderLeft: {
    minWidth:
      "0",
  },

  orderLabel: {
    margin: 0,
    fontSize:
      "9px",
    letterSpacing:
      "2px",
    fontWeight:
      "600",
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
  },

  orderDate: {
    margin: 0,
    color:
      "#777",
    fontSize:
      "12px",
  },

  orderHeaderRight: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "14px",
    flexShrink: 0,
  },

  statusBadge: {
    padding:
      "8px 12px",
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "1px",
    textTransform:
      "uppercase",
  },

  totalHeader: {
    fontSize:
      "20px",
    fontWeight:
      "600",
  },

  expandArrow: {
    width:
      "28px",
    height:
      "28px",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    border:
      "1px solid #ddd",
    fontSize:
      "18px",
    fontWeight:
      "300",
  },

  quickInfo: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap:
      "20px",
    padding:
      "18px 28px",
    borderBottom:
      "1px solid #eee",
    background:
      "#fafafa",
  },

  quickLabel: {
    display:
      "block",
    marginBottom:
      "6px",
    fontSize:
      "8px",
    letterSpacing:
      "1.5px",
    fontWeight:
      "600",
    color:
      "#999",
  },

  quickValue: {
    fontSize:
      "12px",
    fontWeight:
      "500",
  },

  paymentBadge: {
    display:
      "inline-block",
    padding:
      "5px 8px",
    fontSize:
      "8px",
    fontWeight:
      "600",
    letterSpacing:
      "0.8px",
    textTransform:
      "uppercase",
  },

  details: {
    background:
      "#fff",
  },

  detailsGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "1fr 1.3fr 1fr",
    gap:
      "30px",
    padding:
      "25px 28px",
    borderBottom:
      "1px solid #eee",
  },

  sectionLabel: {
    margin:
      "0 0 10px",
    fontSize:
      "9px",
    letterSpacing:
      "2px",
    fontWeight:
      "600",
    color:
      "#888",
  },

  customerName: {
    margin:
      "0 0 5px",
    fontSize:
      "14px",
    fontWeight:
      "600",
  },

  customerText: {
    margin:
      "3px 0",
    color:
      "#666",
    fontSize:
      "12px",
    lineHeight:
      "1.5",
  },

  paymentId: {
    marginTop:
      "10px",
    padding:
      "8px",
    background:
      "#f7f7f7",
    color:
      "#777",
    fontSize:
      "9px",
    wordBreak:
      "break-all",
  },

  itemsSection: {
    padding:
      "25px 28px",
    borderBottom:
      "1px solid #eee",
  },

  noItems: {
    margin: 0,
    color:
      "#888",
    fontSize:
      "13px",
  },

  itemRow: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "16px",
    padding:
      "15px 0",
    borderTop:
      "1px solid #f0f0f0",
  },

  itemImageBox: {
    width:
      "65px",
    height:
      "78px",
    flexShrink: 0,
    background:
      "#f4f4f4",
    overflow:
      "hidden",
  },

  itemImage: {
    width:
      "100%",
    height:
      "100%",
    objectFit:
      "cover",
    display:
      "block",
  },

  itemImagePlaceholder: {
    width:
      "100%",
    height:
      "100%",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    color:
      "#999",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "9px",
    letterSpacing:
      "2px",
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },

  itemName: {
    display:
      "block",
    marginBottom:
      "7px",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "17px",
    fontWeight:
      "400",
  },

  itemMeta: {
    display:
      "flex",
    flexWrap:
      "wrap",
    gap:
      "10px",
    color:
      "#777",
    fontSize:
      "11px",
  },

  itemPrice: {
    minWidth:
      "100px",
    textAlign:
      "right",
    fontWeight:
      "600",
    fontSize:
      "14px",
  },

  bottomSection: {
    padding:
      "25px 28px",
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap:
      "30px",
  },

  summaryText: {
    margin:
      "4px 0",
    color:
      "#666",
    fontSize:
      "12px",
  },

  summaryTotal: {
    margin:
      "12px 0 0",
    fontSize:
      "18px",
    fontWeight:
      "600",
  },

  controls: {
    display:
      "flex",
    gap:
      "12px",
    alignItems:
      "flex-end",
  },

  controlLabel: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "7px",
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "1px",
    color:
      "#777",
  },

  select: {
    minWidth:
      "160px",
    padding:
      "11px 12px",
    border:
      "1px solid #ccc",
    background:
      "#fff",
    color:
      "#111",
    fontSize:
      "12px",
    cursor:
      "pointer",
  },
};