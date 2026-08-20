import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

/* =========================================================
   DISCOUNT TYPES
========================================================= */

const DISCOUNT_TYPES = [
  "fixed",
  "percentage",
];

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  code: "",
  discount_type: "fixed",
  discount_value: "",
  minimum_order_amount: "",
  usage_limit: "",
  is_active: true,
};

/* =========================================================
   ADMIN COUPONS
========================================================= */

export default function AdminCoupons() {
  /* =======================================================
     COUPONS
  ======================================================= */

  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  /* =======================================================
     MESSAGES
  ======================================================= */

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     FORM
  ======================================================= */

  const [showForm, setShowForm] =
    useState(false);

  const [editingCoupon, setEditingCoupon] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  /* =======================================================
     LOAD COUPONS
  ======================================================= */

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      setLoading(true);

      setErrorMessage("");

      const {
        data,
        error,
      } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setCoupons(data || []);
    } catch (error) {
      console.error(
        "Admin coupons error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load coupons."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     FORM HELPER
  ======================================================= */

  function updateField(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =======================================================
     OPEN ADD FORM
  ======================================================= */

  function openAddForm() {
    setEditingCoupon(null);

    setForm({
      ...EMPTY_FORM,
    });

    setErrorMessage("");

    setSuccessMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     OPEN EDIT FORM
  ======================================================= */

  function openEditForm(coupon) {
    setEditingCoupon(coupon);

    setForm({
      code:
        coupon.code || "",

      discount_type:
        coupon.discount_type ||
        "fixed",

      discount_value:
        coupon.discount_value ??
        "",

      minimum_order_amount:
        coupon.minimum_order_amount ??
        0,

      usage_limit:
        coupon.usage_limit ??
        "",

      is_active:
        coupon.is_active ??
        true,
    });

    setErrorMessage("");

    setSuccessMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);

    setEditingCoupon(null);

    setForm({
      ...EMPTY_FORM,
    });

    setErrorMessage("");

    setSuccessMessage("");
  }
    /* =======================================================
     SAVE COUPON
  ======================================================= */

  async function saveCoupon(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      setErrorMessage("");

      setSuccessMessage("");

      /* ===================================================
         VALIDATE CODE
      =================================================== */

      const cleanCode =
        String(form.code || "")
          .trim()
          .toUpperCase();

      if (!cleanCode) {
        throw new Error(
          "Coupon code is required."
        );
      }

      /* ===================================================
         VALIDATE DISCOUNT TYPE
      =================================================== */

      if (
        !DISCOUNT_TYPES.includes(
          form.discount_type
        )
      ) {
        throw new Error(
          "Invalid discount type."
        );
      }

      /* ===================================================
         VALIDATE DISCOUNT VALUE
      =================================================== */

      const discountValue =
        Number(
          form.discount_value
        );

      if (
        !Number.isFinite(
          discountValue
        ) ||
        discountValue <= 0
      ) {
        throw new Error(
          "Discount value must be greater than 0."
        );
      }

      /* ===================================================
         PERCENTAGE VALIDATION
      =================================================== */

      if (
        form.discount_type ===
          "percentage" &&
        discountValue > 100
      ) {
        throw new Error(
          "Percentage discount cannot be more than 100%."
        );
      }

      /* ===================================================
         MINIMUM ORDER
      =================================================== */

      const minimumOrder =
        Number(
          form.minimum_order_amount || 0
        );

      if (
        !Number.isFinite(
          minimumOrder
        ) ||
        minimumOrder < 0
      ) {
        throw new Error(
          "Minimum order amount is invalid."
        );
      }

      /* ===================================================
         USAGE LIMIT
      =================================================== */

      let usageLimit = null;

      if (
        form.usage_limit !== "" &&
        form.usage_limit !== null &&
        form.usage_limit !== undefined
      ) {
        usageLimit =
          Number(
            form.usage_limit
          );

        if (
          !Number.isInteger(
            usageLimit
          ) ||
          usageLimit <= 0
        ) {
          throw new Error(
            "Usage limit must be a positive whole number."
          );
        }
      }

      /* ===================================================
         PAYLOAD
      =================================================== */

      const payload = {
        code: cleanCode,

        discount_type:
          form.discount_type,

        discount_value:
          discountValue,

        minimum_order_amount:
          minimumOrder,

        usage_limit:
          usageLimit,

        is_active:
          Boolean(
            form.is_active
          ),
      };

      /* ===================================================
         UPDATE EXISTING COUPON
      =================================================== */

      if (editingCoupon) {
        const {
          data,
          error,
        } = await supabase
          .from("coupons")
          .update({
            ...payload,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            editingCoupon.id
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        setCoupons(
          (previousCoupons) =>
            previousCoupons.map(
              (coupon) =>
                coupon.id ===
                editingCoupon.id
                  ? data
                  : coupon
            )
        );

        setSuccessMessage(
          "Coupon updated successfully."
        );
      }

      /* ===================================================
         CREATE NEW COUPON
      =================================================== */

      else {
        const {
          data,
          error,
        } = await supabase
          .from("coupons")
          .insert([
            payload,
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        setCoupons(
          (previousCoupons) => [
            data,
            ...previousCoupons,
          ]
        );

        setSuccessMessage(
          "Coupon created successfully."
        );
      }

      /* ===================================================
         RESET FORM
      =================================================== */

      setForm({
        ...EMPTY_FORM,
      });

      setEditingCoupon(null);

      setShowForm(false);
    } catch (error) {
      console.error(
        "Save coupon error:",
        error
      );

      if (
        error?.code ===
        "23505"
      ) {
        setErrorMessage(
          "This coupon code already exists."
        );
      } else {
        setErrorMessage(
          error?.message ||
            "Unable to save coupon."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     TOGGLE COUPON STATUS
  ======================================================= */

  async function toggleCouponStatus(
    coupon
  ) {
    try {
      setErrorMessage("");

      setSuccessMessage("");

      const nextStatus =
        !Boolean(
          coupon.is_active
        );

      const {
        data,
        error,
      } = await supabase
        .from("coupons")
        .update({
          is_active:
            nextStatus,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          coupon.id
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCoupons(
        (previousCoupons) =>
          previousCoupons.map(
            (item) =>
              item.id === coupon.id
                ? data
                : item
          )
      );

      setSuccessMessage(
        nextStatus
          ? "Coupon activated."
          : "Coupon disabled."
      );
    } catch (error) {
      console.error(
        "Toggle coupon error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to update coupon status."
      );
    }
  }

  /* =======================================================
     DELETE COUPON
  ======================================================= */

  async function deleteCoupon(
    coupon
  ) {
    const confirmed =
      window.confirm(
        `Delete coupon "${coupon.code}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");

      setSuccessMessage("");

      const {
        error,
      } = await supabase
        .from("coupons")
        .delete()
        .eq(
          "id",
          coupon.id
        );

      if (error) {
        throw error;
      }

      setCoupons(
        (previousCoupons) =>
          previousCoupons.filter(
            (item) =>
              item.id !==
              coupon.id
          )
      );

      setSuccessMessage(
        "Coupon deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete coupon error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to delete coupon."
      );
    }
  }

  /* =======================================================
     SEARCH / FILTER
  ======================================================= */

  const filteredCoupons =
    coupons.filter(
      (coupon) =>
        String(
          coupon.code || ""
        )
          .toLowerCase()
          .includes(
            search
              .trim()
              .toLowerCase()
          )
    );
      /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{`

        /* =================================================
           PAGE
        ================================================= */

        .vorn-admin-coupons-page {
          min-height: 80vh;
          padding: 80px 24px 120px;
          background: #ffffff;
        }

        .vorn-admin-coupons-container {
          max-width: 1300px;
          margin: 0 auto;
        }

        /* =================================================
           HEADER
        ================================================= */

        .vorn-admin-coupons-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 50px;
        }

        .vorn-admin-eyebrow {
          margin: 0 0 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #777777;
          text-transform: uppercase;
        }

        .vorn-admin-coupons-title {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 58px;
          font-weight: 400;
          line-height: 1;
          color: #111111;
        }

        .vorn-admin-coupons-description {
          margin: 18px 0 0;
          color: #777777;
          font-size: 14px;
          line-height: 1.7;
        }

        /* =================================================
           ADD BUTTON
        ================================================= */

        .vorn-coupon-add-button {
          min-width: 150px;
          min-height: 46px;
          padding: 0 22px;
          border: 1px solid #111111;
          background: #111111;
          color: #ffffff;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .vorn-coupon-add-button:hover {
          background: #ffffff;
          color: #111111;
        }

        /* =================================================
           ALERTS
        ================================================= */

        .vorn-coupon-alert {
          margin-bottom: 24px;
          padding: 14px 16px;
          border: 1px solid #dddddd;
          font-size: 13px;
        }

        .vorn-coupon-error {
          border-color: #d7a4a4;
          color: #9d2020;
          background: #fffafa;
        }

        .vorn-coupon-success {
          border-color: #a9c9ad;
          color: #27632d;
          background: #f8fff9;
        }

        /* =================================================
           FORM
        ================================================= */

        .vorn-coupon-form-wrapper {
          margin-bottom: 50px;
          padding: 30px;
          border: 1px solid #e4e4e4;
          background: #fafafa;
        }

        .vorn-coupon-form-title {
          margin: 0 0 25px;
          font-family: Georgia, serif;
          font-size: 30px;
          font-weight: 400;
          color: #111111;
        }

        .vorn-coupon-form {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .vorn-coupon-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vorn-coupon-field-full {
          grid-column: 1 / -1;
        }

        .vorn-coupon-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #555555;
        }

        .vorn-coupon-input,
        .vorn-coupon-select {
          width: 100%;
          min-height: 46px;
          padding: 0 13px;
          border: 1px solid #dddddd;
          background: #ffffff;
          color: #111111;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }

        .vorn-coupon-input:focus,
        .vorn-coupon-select:focus {
          border-color: #111111;
        }

        .vorn-coupon-checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 46px;
        }

        .vorn-coupon-checkbox {
          width: 17px;
          height: 17px;
          accent-color: #111111;
        }

        .vorn-coupon-checkbox-label {
          font-size: 13px;
          color: #333333;
        }

        /* =================================================
           FORM ACTIONS
        ================================================= */

        .vorn-coupon-form-actions {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .vorn-coupon-save-button,
        .vorn-coupon-cancel-button {
          min-height: 44px;
          padding: 0 22px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .vorn-coupon-save-button {
          border: 1px solid #111111;
          background: #111111;
          color: #ffffff;
        }

        .vorn-coupon-save-button:hover {
          background: #333333;
        }

        .vorn-coupon-save-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .vorn-coupon-cancel-button {
          border: 1px solid #cccccc;
          background: #ffffff;
          color: #111111;
        }

        .vorn-coupon-cancel-button:hover {
          background: #f3f3f3;
        }

        /* =================================================
           TOOLBAR
        ================================================= */

        .vorn-coupon-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .vorn-coupon-count {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #777777;
          text-transform: uppercase;
        }

        .vorn-coupon-search {
          width: 295px;
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid #dddddd;
          background: #ffffff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }

        .vorn-coupon-search:focus {
          border-color: #111111;
        }

        /* =================================================
           TABLE
        ================================================= */

        .vorn-coupon-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-top: 1px solid #dddddd;
        }

        .vorn-coupon-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .vorn-coupon-table th {
          padding: 16px 12px;
          border-bottom: 1px solid #dddddd;
          text-align: left;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #777777;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .vorn-coupon-table td {
          padding: 18px 12px;
          border-bottom: 1px solid #eeeeee;
          vertical-align: middle;
          font-size: 13px;
          color: #222222;
        }

        .vorn-coupon-code {
          font-weight: 700;
          letter-spacing: 1px;
        }

        .vorn-coupon-discount {
          font-weight: 600;
        }

        .vorn-coupon-muted {
          color: #888888;
        }

        /* =================================================
           STATUS
        ================================================= */

        .vorn-coupon-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          min-height: 25px;
          padding: 0 8px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .vorn-coupon-status-active {
          background: #111111;
          color: #ffffff;
        }

        .vorn-coupon-status-inactive {
          background: #eeeeee;
          color: #777777;
        }

        /* =================================================
           ACTIONS
        ================================================= */

        .vorn-coupon-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .vorn-coupon-action {
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid #cccccc;
          background: #ffffff;
          color: #111111;
          cursor: pointer;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .vorn-coupon-action:hover {
          background: #111111;
          border-color: #111111;
          color: #ffffff;
        }

        .vorn-coupon-delete:hover {
          background: #b42323;
          border-color: #b42323;
        }

        /* =================================================
           EMPTY / LOADING
        ================================================= */

        .vorn-coupon-message {
          padding: 70px 20px;
          border-bottom: 1px solid #eeeeee;
          text-align: center;
          color: #777777;
          font-size: 14px;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {
          .vorn-admin-coupons-page {
            padding: 55px 18px 90px;
          }

          .vorn-admin-coupons-header {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 35px;
          }

          .vorn-admin-coupons-title {
            font-size: 45px;
          }

          .vorn-coupon-form {
            grid-template-columns: 1fr;
          }

          .vorn-coupon-field-full {
            grid-column: auto;
          }

          .vorn-coupon-form-actions {
            grid-column: auto;
            flex-wrap: wrap;
          }

          .vorn-coupon-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .vorn-coupon-search {
            width: 100%;
          }

          .vorn-coupon-form-wrapper {
            padding: 20px;
          }
        }

      `}</style>

      <main className="vorn-admin-coupons-page">
        <div className="vorn-admin-coupons-container">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <header className="vorn-admin-coupons-header">

            <div>
              <p className="vorn-admin-eyebrow">
                VORN ADMIN
              </p>

              <h1 className="vorn-admin-coupons-title">
                Coupons
              </h1>

              <p className="vorn-admin-coupons-description">
                Create and manage discount
                coupons for your store.
              </p>
            </div>

            <button
              type="button"
              className="vorn-coupon-add-button"
              onClick={openAddForm}
            >
              + Add Coupon
            </button>

          </header>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {errorMessage && (
            <div
              className="
                vorn-coupon-alert
                vorn-coupon-error
              "
            >
              {errorMessage}
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {successMessage && (
            <div
              className="
                vorn-coupon-alert
                vorn-coupon-success
              "
            >
              {successMessage}
            </div>
          )}

          {/* =================================================
              ADD / EDIT FORM
          ================================================= */}

          {showForm && (
            <section
              className="vorn-coupon-form-wrapper"
            >
              <h2
                className="vorn-coupon-form-title"
              >
                {editingCoupon
                  ? "Edit Coupon"
                  : "Add Coupon"}
              </h2>

              <form
                className="vorn-coupon-form"
                onSubmit={saveCoupon}
              >

                {/* CODE */}

                <div className="vorn-coupon-field">
                  <label
                    className="vorn-coupon-label"
                    htmlFor="coupon-code"
                  >
                    Coupon Code
                  </label>

                  <input
                    id="coupon-code"
                    type="text"
                    className="vorn-coupon-input"
                    value={form.code}
                    onChange={(event) =>
                      updateField(
                        "code",
                        event.target.value
                      )
                    }
                    placeholder="VORN500"
                    autoComplete="off"
                  />
                </div>

                {/* DISCOUNT TYPE */}

                <div className="vorn-coupon-field">
                  <label
                    className="vorn-coupon-label"
                    htmlFor="coupon-type"
                  >
                    Discount Type
                  </label>

                  <select
                    id="coupon-type"
                    className="vorn-coupon-select"
                    value={
                      form.discount_type
                    }
                    onChange={(event) =>
                      updateField(
                        "discount_type",
                        event.target.value
                      )
                    }
                  >
                    <option value="fixed">
                      Fixed Amount
                    </option>

                    <option value="percentage">
                      Percentage
                    </option>
                  </select>
                </div>

                {/* DISCOUNT VALUE */}

                <div className="vorn-coupon-field">
                  <label
                    className="vorn-coupon-label"
                    htmlFor="discount-value"
                  >
                    Discount Value
                  </label>

                  <input
                    id="discount-value"
                    type="number"
                    min="0"
                    step="0.01"
                    className="vorn-coupon-input"
                    value={
                      form.discount_value
                    }
                    onChange={(event) =>
                      updateField(
                        "discount_value",
                        event.target.value
                      )
                    }
                    placeholder={
                      form.discount_type ===
                      "percentage"
                        ? "10"
                        : "500"
                    }
                  />
                </div>

                {/* MINIMUM ORDER */}

                <div className="vorn-coupon-field">
                  <label
                    className="vorn-coupon-label"
                    htmlFor="minimum-order"
                  >
                    Minimum Order Amount
                  </label>

                  <input
                    id="minimum-order"
                    type="number"
                    min="0"
                    step="0.01"
                    className="vorn-coupon-input"
                    value={
                      form.minimum_order_amount
                    }
                    onChange={(event) =>
                      updateField(
                        "minimum_order_amount",
                        event.target.value
                      )
                    }
                    placeholder="2000"
                  />
                </div>

                {/* USAGE LIMIT */}

                <div className="vorn-coupon-field">
                  <label
                    className="vorn-coupon-label"
                    htmlFor="usage-limit"
                  >
                    Usage Limit
                  </label>

                  <input
                    id="usage-limit"
                    type="number"
                    min="1"
                    step="1"
                    className="vorn-coupon-input"
                    value={
                      form.usage_limit
                    }
                    onChange={(event) =>
                      updateField(
                        "usage_limit",
                        event.target.value
                      )
                    }
                    placeholder="100"
                  />
                </div>

                {/* ACTIVE */}

                <div className="vorn-coupon-field">
                  <span className="vorn-coupon-label">
                    Status
                  </span>

                  <label
                    className="
                      vorn-coupon-checkbox-row
                    "
                  >
                    <input
                      type="checkbox"
                      className="
                        vorn-coupon-checkbox
                      "
                      checked={
                        form.is_active
                      }
                      onChange={(event) =>
                        updateField(
                          "is_active",
                          event.target.checked
                        )
                      }
                    />

                    <span
                      className="
                        vorn-coupon-checkbox-label
                      "
                    >
                      Coupon is active
                    </span>
                  </label>
                </div>

                {/* FORM ACTIONS */}

                <div
                  className="
                    vorn-coupon-form-actions
                  "
                >
                  <button
                    type="submit"
                    className="
                      vorn-coupon-save-button
                    "
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCoupon
                        ? "Update Coupon"
                        : "Create Coupon"}
                  </button>

                  <button
                    type="button"
                    className="
                      vorn-coupon-cancel-button
                    "
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </section>
          )}

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="vorn-coupon-toolbar">

            <p className="vorn-coupon-count">
              {filteredCoupons.length}{" "}
              {filteredCoupons.length === 1
                ? "Coupon"
                : "Coupons"}
            </p>

            <input
              type="search"
              className="vorn-coupon-search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search coupons..."
              aria-label="Search coupons"
            />

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="vorn-coupon-message">
              Loading coupons...
            </div>
          ) : filteredCoupons.length === 0 ? (
            /* ===============================================
               EMPTY
            =============================================== */

            <div className="vorn-coupon-message">
              {search.trim()
                ? "No coupons found."
                : "No coupons created yet."}
            </div>
          ) : (
            /* ===============================================
               TABLE
            =============================================== */

            <div
              className="
                vorn-coupon-table-wrapper
              "
            >
              <table
                className="
                  vorn-coupon-table
                "
              >
                <thead>
                  <tr>
                    <th>
                      Code
                    </th>

                    <th>
                      Discount
                    </th>

                    <th>
                      Minimum Order
                    </th>

                    <th>
                      Usage
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCoupons.map(
                    (coupon) => (
                      <tr
                        key={
                          coupon.id
                        }
                      >
                        {/* CODE */}

                        <td>
                          <span
                            className="
                              vorn-coupon-code
                            "
                          >
                            {coupon.code}
                          </span>
                        </td>

                        {/* DISCOUNT */}

                        <td>
                          <span
                            className="
                              vorn-coupon-discount
                            "
                          >
                            {coupon.discount_type ===
                            "percentage"
                              ? `${Number(
                                  coupon.discount_value
                                )}%`
                              : `₹${Number(
                                  coupon.discount_value
                                ).toLocaleString(
                                  "en-IN"
                                )}`}
                          </span>
                        </td>

                        {/* MINIMUM ORDER */}

                        <td>
                          ₹
                          {Number(
                            coupon.minimum_order_amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* USAGE */}

                        <td>
                          {Number(
                            coupon.used_count ||
                              0
                          )}

                          {" / "}

                          {coupon.usage_limit ||
                            "∞"}
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`
                              vorn-coupon-status
                              ${
                                coupon.is_active
                                  ? "vorn-coupon-status-active"
                                  : "vorn-coupon-status-inactive"
                              }
                            `}
                          >
                            {coupon.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div
                            className="
                              vorn-coupon-actions
                            "
                          >
                            <button
                              type="button"
                              className="
                                vorn-coupon-action
                              "
                              onClick={() =>
                                openEditForm(
                                  coupon
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="
                                vorn-coupon-action
                              "
                              onClick={() =>
                                toggleCouponStatus(
                                  coupon
                                )
                              }
                            >
                              {coupon.is_active
                                ? "Disable"
                                : "Enable"}
                            </button>

                            <button
                              type="button"
                              className="
                                vorn-coupon-action
                                vorn-coupon-delete
                              "
                              onClick={() =>
                                deleteCoupon(
                                  coupon
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </>
  );
}