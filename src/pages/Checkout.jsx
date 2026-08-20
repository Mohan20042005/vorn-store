import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabaseClient";

/* =====================================================
   RAZORPAY SCRIPT
===================================================== */

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (
      document.getElementById(
        "razorpay-checkout-js"
      )
    ) {
      resolve(true);
      return;
    }

    const script =
      document.createElement("script");

    script.id =
      "razorpay-checkout-js";

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () =>
      resolve(true);

    script.onerror = () =>
      resolve(false);

    document.body.appendChild(
      script
    );
  });
}

/* =====================================================
   UUID CHECK
===================================================== */

function isValidUUID(value) {
  if (
    !value ||
    typeof value !== "string"
  ) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/* =====================================================
   RESOLVE PRODUCT UUID
===================================================== */

async function resolveProductUUID(item) {
  // CASE 1:
  // Cart contains productId UUID

  if (
    isValidUUID(item.productId)
  ) {
    return item.productId;
  }

  // CASE 2:
  // Cart id itself is UUID

  if (
    isValidUUID(item.id)
  ) {
    return item.id;
  }

  // CASE 3:
  // Cart contains slug

  const slug =
    item.slug || item.id;

  if (!slug) {
    throw new Error(
      `Product ID/slug is missing for "${
        item.name ||
        "unknown product"
      }".`
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      "id, name, slug"
    )
    .eq(
      "slug",
      slug
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Product lookup error:",
      error
    );

    throw new Error(
      `Unable to find product "${slug}".`
    );
  }

  if (!data?.id) {
    throw new Error(
      `Product "${slug}" was not found in the products table.`
    );
  }

  if (
    !isValidUUID(data.id)
  ) {
    throw new Error(
      `Product "${slug}" has an invalid UUID in the database.`
    );
  }

  return data.id;
}

/* =====================================================
   CHECKOUT
===================================================== */

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    subtotal,
    shipping,
    total,
    clearCart,
  } = useCart();

  const [user, setUser] =
    useState(null);

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      notes: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [razorpayOpening, setRazorpayOpening] =
    useState(false);


  /* ===================================================
     GET CURRENT USER
  =================================================== */

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      setUser(
        user || null
      );

      if (user?.email) {
        setFormData(
          (previous) => ({
            ...previous,
            email:
              user.email,
          })
        );
      }
    }

    getCurrentUser();
  }, []);

  /* ===================================================
     HANDLE INPUT
  =================================================== */

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setFieldErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      const next = { ...previous };
      delete next[name];
      return next;
    });

    setErrorMessage("");
    setSuccessMessage("");
  }

  function validateForm() {
    const errors = {};

    const requiredFields = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["email", "Email address"],
      ["phone", "Phone number"],
      ["address", "Address"],
      ["city", "City"],
      ["state", "State"],
      ["postalCode", "Postal code"],
    ];

    requiredFields.forEach(([field, label]) => {
      if (!String(formData[field] || "").trim()) {
        errors[field] = `${label} is required.`;
      }
    });

    const email = formData.email.trim();

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email =
        "Please enter a valid email address.";
    }

    const phoneDigits =
      formData.phone.replace(/\D/g, "");

    if (
      phoneDigits &&
      (phoneDigits.length < 10 ||
        phoneDigits.length > 15)
    ) {
      errors.phone =
        "Please enter a valid phone number.";
    }

    const postalCode =
      formData.postalCode.trim();

    if (
      postalCode &&
      !/^[A-Za-z0-9 -]{4,10}$/.test(
        postalCode
      )
    ) {
      errors.postalCode =
        "Please enter a valid postal code.";
    }

    const missingSize = cartItems.find(
      (item) => !item.size
    );

    if (missingSize) {
      errors.cartSize =
        `Please select a size for ${
          missingSize.name ||
          "your product"
        }.`;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage(
        Object.values(errors)[0]
      );
      return false;
    }

    return true;
  }

  function formatPrice(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }

  function handleBackToCart() {
    if (!loading) {
      navigate("/cart");
    }
  }

  /* ===================================================
     PLACE ORDER / START PAYMENT
  =================================================== */

  async function handlePlaceOrder() {
    setErrorMessage("");
    setSuccessMessage("");

    /* ================================================
       CART CHECK
    ================================================ */

    if (
      cartItems.length === 0
    ) {
      setErrorMessage(
        "Your cart is empty."
      );

      return;
    }

    /* ================================================
       LOGIN CHECK
    ================================================ */

    if (!user) {
      setErrorMessage(
        "Please sign in before making a payment."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

      return;
    }

    /* ================================================
       FORM VALIDATION
    ================================================ */

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setRazorpayOpening(false);

      /* ==============================================
         STEP 1
         LOAD RAZORPAY
      ============================================== */

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please check your internet connection."
        );
      }

      /* ==============================================
         STEP 2
         GET SESSION
      ============================================== */

      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (
        !session?.access_token
      ) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      /* ==============================================
         STEP 3
         RESOLVE PRODUCT UUIDs
      ============================================== */

      console.log(
        "Resolving product UUIDs..."
      );

      const resolvedCartItems =
        await Promise.all(
          cartItems.map(
            async (item) => {
              const productUUID =
                await resolveProductUUID(
                  item
                );

              console.log(
                "Product resolved:",
                {
                  name:
                    item.name,

                  cartId:
                    item.id,

                  productUUID,
                }
              );

              return {
                ...item,
                productUUID,
              };
            }
          )
        );

      console.log(
        "Resolved cart items:",
        resolvedCartItems
      );

      /* ==============================================
         STEP 4
         CREATE RAZORPAY ORDER
         
         SERVER SIDE CALCULATION
      ============================================== */

      const {
        data: paymentOrder,
        error:
          paymentOrderError,
      } =
        await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: {
              cartItems:
                resolvedCartItems.map(
                  (item) => ({
                    id:
                      item.id,

                    productId:
                      item.productId,

                    productUUID:
                      item.productUUID,

                    slug:
                      item.slug,

                    name:
                      item.name,

                    price:
                      item.price,

                    quantity:
                      item.quantity,

                    size:
                      item.size,

                    color:
                      item.color,

                    variantId:
                      item.variantId,
                  })
                ),

              formData: {
                firstName:
                  formData.firstName.trim(),

                lastName:
                  formData.lastName.trim(),

                email:
                  formData.email.trim(),

                phone:
                  formData.phone.trim(),

                address:
                  formData.address.trim(),

                city:
                  formData.city.trim(),

                state:
                  formData.state.trim(),

                postalCode:
                  formData.postalCode.trim(),

                notes:
                  formData.notes.trim(),
              },
            },

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      if (
        paymentOrderError
      ) {
        console.error(
          "Razorpay order creation error:",
          paymentOrderError
        );

        throw new Error(
          paymentOrderError.message ||
            "Unable to create payment order."
        );
      }

      if (
        !paymentOrder?.success
      ) {
        throw new Error(
          paymentOrder?.error ||
            "Unable to create payment order."
        );
      }

      console.log(
        "Razorpay order created:",
        paymentOrder
      );

      /* ==============================================
         STEP 5
         OPEN RAZORPAY CHECKOUT
      ============================================== */

      setRazorpayOpening(true);

      const razorpayKeyId =
        import.meta.env
          .VITE_RAZORPAY_KEY_ID ||
        paymentOrder.keyId;

      if (!razorpayKeyId) {
        throw new Error(
          "Missing Razorpay Key ID. Add VITE_RAZORPAY_KEY_ID to .env.local."
        );
      }

      if (
        typeof window.Razorpay !==
        "function"
      ) {
        throw new Error(
          "Razorpay Checkout is not available."
        );
      }

      const options = {
        key:
          razorpayKeyId,

        amount:
          paymentOrder.amount,

        currency:
          paymentOrder.currency ||
          "INR",

        name:
          "VORN",

        description:
          `VORN Order ${paymentOrder.orderNumber}`,

        order_id:
          paymentOrder.razorpayOrderId,

        prefill: {
          name:
            `${formData.firstName} ${formData.lastName}`.trim(),

          email:
            formData.email.trim(),

          contact:
            formData.phone.trim(),
        },

        notes: {
          order_number:
            paymentOrder.orderNumber,
        },

        theme: {
          color:
            "#111111",
        },

        modal: {
          confirm_close:
            true,

          escape:
            true,

          backdropclose:
            false,

          ondismiss: () => {
            setLoading(false);
            setRazorpayOpening(false);

            setErrorMessage(
              "Payment was cancelled. Your order has not been confirmed."
            );
          },
        },

        retry: {
          enabled:
            true,

          max_count:
            2,
        },

        /* ==========================================
           PAYMENT SUCCESS
        ========================================== */

        handler:
          async function (
            response
          ) {
            try {
              setLoading(true);
              setErrorMessage("");
              setSuccessMessage("");

              console.log(
                "Razorpay response:",
                response
              );

              /* ======================================
                 STEP 6
                 VERIFY PAYMENT SERVER-SIDE
              ====================================== */

              const {
                data:
                  verification,
                error:
                  verificationError,
              } =
                await supabase.functions.invoke(
                  "verify-razorpay-payment",
                  {
                    body: {
                      orderId:
                        paymentOrder.orderId,

                      orderNumber:
                        paymentOrder.orderNumber,

                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,

                      cartItems:
                        resolvedCartItems.map(
                          (item) => ({
                            id:
                              item.id,

                            productId:
                              item.productId,

                            productUUID:
                              item.productUUID,

                            slug:
                              item.slug,

                            name:
                              item.name,

                            price:
                              item.price,

                            quantity:
                              item.quantity,

                            size:
                              item.size,

                            color:
                              item.color,

                            variantId:
                              item.variantId,
                          })
                        ),

                      formData: {
                        firstName:
                          formData.firstName.trim(),

                        lastName:
                          formData.lastName.trim(),

                        email:
                          formData.email.trim(),

                        phone:
                          formData.phone.trim(),

                        address:
                          formData.address.trim(),

                        city:
                          formData.city.trim(),

                        state:
                          formData.state.trim(),

                        postalCode:
                          formData.postalCode.trim(),

                        notes:
                          formData.notes.trim(),
                      },
                    },

                    headers: {
                      Authorization:
                        `Bearer ${session.access_token}`,
                    },
                  }
                );

              if (
                verificationError
              ) {
                console.error(
                  "Payment verification error:",
                  verificationError
                );

                throw new Error(
                  verificationError.message ||
                    "Payment verification failed."
                );
              }

              if (
                !verification?.success
              ) {
                throw new Error(
                  verification?.error ||
                    "Payment verification failed."
                );
              }

              /* ======================================
                 PAYMENT SUCCESS
              ====================================== */

              console.log(
                "Payment verified:",
                verification
              );

              setSuccessMessage(
                `Payment successful! Order #${verification.orderNumber}`
              );

              /* ======================================
                 CLEAR CART
              ====================================== */

              clearCart();

              /* ======================================
                 GO TO ORDERS
              ====================================== */

              setTimeout(() => {
                navigate(
                  "/account/orders"
                );
              }, 1200);
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              setErrorMessage(
                error?.message ||
                  "Payment verification failed. Please contact support."
              );
            } finally {
              setLoading(false);
            }
          },
      };

      /* ==============================================
         CREATE RAZORPAY INSTANCE
      ============================================== */

      const razorpay =
        new window.Razorpay(
          options
        );

      /* ==============================================
         PAYMENT FAILED
      ============================================== */

      razorpay.on(
        "payment.failed",
        function (
          response
        ) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          const description =
            response?.error
              ?.description;

          setErrorMessage(
            description ||
              "Payment failed. Please try again."
          );

          setLoading(false);
          setRazorpayOpening(false);
        }
      );

      /* ==============================================
         OPEN PAYMENT WINDOW
      ============================================== */

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout payment error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Something went wrong while starting the payment."
      );

      setLoading(false);
      setRazorpayOpening(false);
    }
  }

  /* ===================================================
     EMPTY CART
  =================================================== */

  if (
    cartItems.length === 0
  ) {
    return (
      <main
        style={{
          minHeight: "70vh",
          padding:
            "120px 24px",
          textAlign:
            "center",
        }}
      >
        <p
          style={{
            letterSpacing:
              "4px",
            fontSize:
              "12px",
            fontWeight:
              "600",
          }}
        >
          VORN CHECKOUT
        </p>

        <h1
          style={{
            fontSize:
              "48px",
            margin:
              "20px 0",
            fontFamily:
              "Georgia, serif",
          }}
        >
          Your Cart Is Empty
        </h1>

        <p
          style={{
            color: "#666",
          }}
        >
          Add a product before
          proceeding to checkout.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/shop")
          }
          style={
            buttonStyle
          }
        >
          START SHOPPING
        </button>
      </main>
    );
  }

  /* ===================================================
     CHECKOUT PAGE
  =================================================== */

  return (
    <main
      className="vorn-checkout-page"
      style={
        styles.page
      }
    >
      {/* ================================================
          PAGE HEADER
      ================================================ */}

      <div
        style={
          styles.header
        }
      >
        <p
          style={
            styles.eyebrow
          }
        >
          VORN CHECKOUT
        </p>

        <h1
          className="vorn-checkout-title"
          style={
            styles.title
          }
        >
          Checkout
        </h1>

        <p
          style={
            styles.subtitle
          }
        >
          Complete your order
          details below.
        </p>
      </div>

      {/* ================================================
          MAIN GRID
      ================================================ */}

      <div
        className="vorn-checkout-grid"
        style={
          styles.mainGrid
        }
      >
        {/* =============================================
            SHIPPING INFORMATION
        ============================================= */}

        <section
          className="vorn-checkout-form"
          style={
            styles.formSection
          }
        >
          <h2
            style={
              styles.sectionTitle
            }
          >
            Shipping Information
          </h2>

          {/* FIRST + LAST NAME */}

          <div
            style={
              styles.twoColumn
            }
          >
            <input
              type="text"
              name="firstName"
              autoComplete="given-name"
              placeholder="First name"
              value={
                formData.firstName
              }
              onChange={
                handleChange
              }
              aria-invalid={Boolean(fieldErrors.firstName)}
              style={
                inputStyle
              }
            />

            <input
              type="text"
              name="lastName"
              autoComplete="family-name"
              placeholder="Last name"
              value={
                formData.lastName
              }
              onChange={
                handleChange
              }
              aria-invalid={Boolean(fieldErrors.lastName)}
              style={
                inputStyle
              }
            />
          </div>

          {/* EMAIL */}

          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            value={
              formData.email
            }
            onChange={
              handleChange
            }
            aria-invalid={Boolean(fieldErrors.email)}
              style={
              inputStyle
            }
          />

          {/* PHONE */}

          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Phone number"
            value={
              formData.phone
            }
            onChange={
              handleChange
            }
            aria-invalid={Boolean(fieldErrors.phone)}
              style={
              inputStyle
            }
          />

          {/* ADDRESS */}

          <input
            type="text"
            name="address"
            autoComplete="street-address"
            placeholder="Address"
            value={
              formData.address
            }
            onChange={
              handleChange
            }
            aria-invalid={Boolean(fieldErrors.address)}
              style={
              inputStyle
            }
          />

          {/* CITY + STATE */}

          <div
            style={
              styles.twoColumn
            }
          >
            <input
              type="text"
              name="city"
              autoComplete="address-level2"
              placeholder="City"
              value={
                formData.city
              }
              onChange={
                handleChange
              }
              aria-invalid={Boolean(fieldErrors.city)}
              style={
                inputStyle
              }
            />

            <input
              type="text"
              name="state"
              autoComplete="address-level1"
              placeholder="State"
              value={
                formData.state
              }
              onChange={
                handleChange
              }
              aria-invalid={Boolean(fieldErrors.state)}
              style={
                inputStyle
              }
            />
          </div>

          {/* POSTAL CODE */}

          <input
            type="text"
            name="postalCode"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="Postal code"
            value={
              formData.postalCode
            }
            onChange={
              handleChange
            }
            aria-invalid={Boolean(fieldErrors.postalCode)}
              style={
              inputStyle
            }
          />

          {/* NOTES */}

          <textarea
            name="notes"
            placeholder="Order notes (optional)"
            rows="4"
            value={
              formData.notes
            }
            onChange={
              handleChange
            }
            style={{
              ...inputStyle,
              resize:
                "vertical",
            }}
          />

          {/* PAYMENT INFO */}

          <div
            style={
              styles.paymentInfo
            }
          >
            <p
              style={
                styles.paymentLabel
              }
            >
              PAYMENT
            </p>

            <p
              style={
                styles.paymentText
              }
            >
              Secure online payment
              powered by Razorpay.
              <br />
              COD is not available.
            </p>
          </div>

          {/* FIELD VALIDATION SUMMARY */}

          {Object.keys(fieldErrors).length > 0 && (
            <div style={styles.validationHint}>
              Please review the highlighted details
              before continuing.
            </div>
          )}

          {/* ERROR */}

          {errorMessage && (
            <div
              style={
                styles.errorBox
              }
            >
              {errorMessage}
            </div>
          )}

          {/* SUCCESS */}

          {successMessage && (
            <div
              style={
                styles.successBox
              }
            >
              {successMessage}
            </div>
          )}
        </section>

        {/* =============================================
            ORDER SUMMARY
        ============================================= */}

        <section
          className="vorn-checkout-summary"
          style={
            styles.summarySection
          }
        >
          <h2
            style={
              styles.summaryTitle
            }
          >
            ORDER SUMMARY
          </h2>

          <p style={styles.summarySubtitle}>
            {cartItems.reduce(
              (count, item) =>
                count + Number(item.quantity || 0),
              0
            )}{" "}
            {cartItems.reduce(
              (count, item) =>
                count + Number(item.quantity || 0),
              0
            ) === 1
              ? "item"
              : "items"}{" "}
            in your order
          </p>

          {/* CART ITEMS */}

          {cartItems.map(
            (item) => (
              <div
                key={`${item.id}-${
                  item.size ||
                  "default"
                }-${
                  item.color ||
                  "default"
                }`}
                style={
                  styles.orderItem
                }
              >
                <div>
                  <strong>
                    {item.name}
                  </strong>

                  {item.size && (
                    <p
                      style={
                        styles.itemMeta
                      }
                    >
                      Size:{" "}
                      {item.size}
                    </p>
                  )}

                  {item.color && (
                    <p
                      style={
                        styles.itemMeta
                      }
                    >
                      Color:{" "}
                      {item.color}
                    </p>
                  )}

                  <p
                    style={
                      styles.itemMeta
                    }
                  >
                    Qty:{" "}
                    {item.quantity}
                  </p>
                </div>

                <strong>
                  ₹
                  {(
                    Number(
                      item.price ||
                        0
                    ) *
                    Number(
                      item.quantity ||
                        0
                    )
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            )
          )}

          {/* SUBTOTAL */}

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
              {Number(
                subtotal || 0
              ).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          {/* SHIPPING */}

          <div
            style={
              styles.summaryRow
            }
          >
            <span>
              Shipping
            </span>

            <span>
              {Number(
                shipping || 0
              ) === 0
                ? "FREE"
                : `₹${Number(
                    shipping
                  ).toLocaleString(
                    "en-IN"
                  )}`}
            </span>
          </div>

          {/* TOTAL */}

          <div
            style={
              styles.totalRow
            }
          >
            <span>
              Total
            </span>

            <span>
              ₹
              {Number(
                total || 0
              ).toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          {/* ONLINE PAYMENT */}

          <div
            style={
              styles.onlinePayment
            }
          >
            <strong>
              Online Payment Only
            </strong>

            <p>
              Pay securely using
              Razorpay.
            </p>
          </div>

          {/* PAY BUTTON */}

          <button
            type="button"
            onClick={
              handlePlaceOrder
            }
            disabled={
              loading ||
              razorpayOpening
            }
            style={{
              ...styles.payButton,
              background:
                loading
                  ? "#777"
                  : "#111",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {razorpayOpening
              ? "OPENING PAYMENT..."
              : loading
                ? "PROCESSING PAYMENT..."
                : `PAY ₹${formatPrice(total)}`}
          </button>

          {/* BACK TO CART */}

          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
            disabled={
              loading
            }
            style={{
              ...styles.backButton,
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            BACK TO CART
          </button>
        </section>
      </div>

      <style>{`
        .vorn-checkout-page input[aria-invalid="true"] {
          border-color: #c98d8d !important;
          background: #fffafa !important;
        }

        .vorn-checkout-page textarea:focus,
        .vorn-checkout-page input:focus {
          border-color: #111 !important;
          box-shadow: 0 0 0 1px #111;
        }

        .vorn-checkout-page button {
          transition:
            opacity .18s ease,
            transform .18s ease,
            background .18s ease;
        }

        .vorn-checkout-page button:not(:disabled):hover {
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .vorn-checkout-page {
            padding-top: 70px !important;
          }
        }

        @media (max-width: 760px) {
          .vorn-checkout-page {
            padding: 55px 18px 75px !important;
          }

          .vorn-checkout-grid {
            grid-template-columns: 1fr !important;
          }

          .vorn-checkout-summary {
            position: static !important;
            top: auto !important;
          }
        }

        @media (max-width: 520px) {
          .vorn-checkout-page {
            padding: 42px 14px 65px !important;
          }

          .vorn-checkout-title {
            font-size: 38px !important;
          }

          .vorn-checkout-form,
          .vorn-checkout-summary {
            padding: 22px 16px !important;
          }

          .vorn-checkout-page .twoColumn {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-checkout-page button {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =====================================================
   PAGE STYLES
===================================================== */

const styles = {
  summarySubtitle: {
    margin: "-10px 0 14px",
    color: "#888",
    fontSize: "11px",
  },

  validationHint: {
    marginTop: "15px",
    padding: "12px 14px",
    border: "1px solid #f0d5d5",
    background: "#fffafa",
    color: "#8f2f2f",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  page: {
    minHeight: "70vh",
    padding: "100px 24px",
    maxWidth: "1300px",
    margin: "0 auto",
    background: "#fff",
  },

  header: {
    textAlign: "center",
    marginBottom: "60px",
  },

  eyebrow: {
    margin: 0,
    letterSpacing: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#111",
  },

  title: {
    fontSize: "52px",
    margin: "15px 0",
    fontFamily: "Georgia, serif",
    fontWeight: "400",
    color: "#111",
  },

  subtitle: {
    margin: 0,
    color: "#666",
    fontSize: "14px",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.5fr) minmax(320px, 1fr)",
    gap: "40px",
    alignItems: "start",
  },

  formSection: {
    border: "1px solid #e5e5e5",
    padding: "35px",
    background: "#fff",
  },

  sectionTitle: {
    margin: "0 0 30px",
    fontFamily: "Georgia, serif",
    fontSize: "26px",
    fontWeight: "400",
    color: "#111",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "20px",
  },

  paymentInfo: {
    marginTop: "5px",
    padding: "18px",
    border: "1px solid #e5e5e5",
    background: "#fafafa",
  },

  paymentLabel: {
    margin: "0 0 7px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#111",
  },

  paymentText: {
    margin: 0,
    color: "#666",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  errorBox: {
    marginTop: "15px",
    padding: "15px",
    border: "1px solid #f0caca",
    background: "#fff5f5",
    color: "#b42318",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  successBox: {
    marginTop: "15px",
    padding: "15px",
    border: "1px solid #cce8d1",
    background: "#f3fff5",
    color: "#18733a",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  summarySection: {
    border: "1px solid #e5e5e5",
    padding: "35px",
    background: "#fff",
    height: "fit-content",
    position: "sticky",
    top: "30px",
  },

  summaryTitle: {
    margin: "0 0 25px",
    paddingBottom: "18px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    letterSpacing: "2px",
    fontWeight: "600",
    color: "#111",
  },

  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    padding: "15px 0",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    color: "#111",
  },

  itemMeta: {
    margin: "5px 0 0",
    color: "#777",
    fontSize: "13px",
  },

  summaryRow: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    fontSize: "14px",
    color: "#555",
  },

  totalRow: {
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    fontSize: "20px",
    fontWeight: "600",
    color: "#111",
  },

  onlinePayment: {
    marginTop: "18px",
    padding: "14px",
    background: "#fafafa",
    border: "1px solid #eee",
    fontSize: "12px",
    color: "#555",
    lineHeight: "1.5",
  },

  payButton: {
    width: "100%",
    marginTop: "20px",
    padding: "18px",
    color: "#fff",
    border: "none",
    fontWeight: "600",
    letterSpacing: "1.5px",
    fontSize: "11px",
  },

  backButton: {
    width: "100%",
    marginTop: "12px",
    padding: "17px",
    background: "#fff",
    color: "#111",
    border: "1px solid #111",
    fontWeight: "600",
    letterSpacing: "1.5px",
    fontSize: "11px",
  },
};

/* =====================================================
   INPUT STYLE
===================================================== */

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "15px",
  marginBottom: "20px",
  border: "1px solid #ddd",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
  color: "#111",
};

/* =====================================================
   CHECKOUT FIELD ERROR STYLE
===================================================== */

const fieldErrorStyle = {
  margin: "-12px 0 14px",
  color: "#b42318",
  fontSize: "11px",
};

/* =====================================================
   EMPTY CART BUTTON
===================================================== */

const buttonStyle = {
  marginTop: "30px",
  padding: "16px 32px",
  background: "#111",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  letterSpacing: "1.5px",
  fontWeight: "600",
};

/* =====================================================
   EXPORT
===================================================== */

export default Checkout;