import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const SIZES = ["S", "M", "L", "XL"];

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const [productsResult, inventoryResult] =
        await Promise.all([
          supabase
            .from("products")
            .select(
              "id, name, slug, price, sale_price, base_price, stock, image_url, images, category"
            )
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("product_inventory")
            .select(
              "id, product_id, size, stock"
            ),
        ]);

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (inventoryResult.error) {
        throw inventoryResult.error;
      }

      const productData =
        productsResult.data || [];

      const inventoryData =
        inventoryResult.data || [];

      const inventoryMap = {};

      productData.forEach((product) => {
        inventoryMap[product.id] = {
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
        };
      });

      inventoryData.forEach((item) => {
        if (!inventoryMap[item.product_id]) {
          inventoryMap[item.product_id] = {
            S: 0,
            M: 0,
            L: 0,
            XL: 0,
          };
        }

        if (SIZES.includes(item.size)) {
          inventoryMap[item.product_id][item.size] =
            Number(item.stock || 0);
        }
      });

      setProducts(productData);
      setInventory(inventoryMap);
    } catch (error) {
      console.error(
        "Admin inventory error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateStock(
    productId,
    size,
    value
  ) {
    const numericValue = Math.max(
      0,
      Number(value) || 0
    );

    setInventory((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] || {
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
        }),
        [size]: numericValue,
      },
    }));

    setSuccessMessage("");
  }

  function getTotalStock(productId) {
    const item =
      inventory[productId] || {};

    return SIZES.reduce(
      (total, size) =>
        total + Number(item[size] || 0),
      0
    );
  }

  async function saveInventory(product) {
    try {
      setSaving((current) => ({
        ...current,
        [product.id]: true,
      }));

      setErrorMessage("");
      setSuccessMessage("");

      const productInventory =
        inventory[product.id] || {
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
        };

      const rows = SIZES.map((size) => ({
        product_id: product.id,
        size,
        stock: Number(
          productInventory[size] || 0
        ),
      }));

      const { error } = await supabase
        .from("product_inventory")
        .upsert(rows, {
          onConflict:
            "product_id,size",
        });

      if (error) {
        throw error;
      }

      const totalStock =
        getTotalStock(product.id);

      const { error: productError } =
        await supabase
          .from("products")
          .update({
            stock: totalStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

      if (productError) {
        throw productError;
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stock: totalStock,
              }
            : item
        )
      );

      setSuccessMessage(
        `${product.name} inventory saved successfully.`
      );
    } catch (error) {
      console.error(
        "Save inventory error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to save inventory."
      );
    } finally {
      setSaving((current) => ({
        ...current,
        [product.id]: false,
      }));
    }
  }

  function getProductImage(product) {
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    if (
      product.images &&
      typeof product.images === "object"
    ) {
      const values =
        Object.values(product.images);

      if (values.length > 0) {
        return values[0];
      }
    }

    return product.image_url || "";
  }

  if (loading) {
    return (
      <main style={styles.centerPage}>
        <p style={styles.eyebrow}>
          VORN ADMIN
        </p>

        <h1 style={styles.loadingTitle}>
          Loading Inventory...
        </h1>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            VORN ADMIN
          </p>

          <h1 style={styles.title}>
            Inventory
          </h1>

          <p style={styles.subtitle}>
            Manage product stock by size.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInventory}
          style={styles.refreshButton}
        >
          REFRESH
        </button>
      </header>

      {errorMessage && (
        <div style={styles.errorBox}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div style={styles.successBox}>
          {successMessage}
        </div>
      )}

      <section style={styles.summary}>
        <div style={styles.summaryCard}>
          <p style={styles.statLabel}>
            PRODUCTS
          </p>

          <strong style={styles.statValue}>
            {products.length}
          </strong>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.statLabel}>
            TOTAL UNITS
          </p>

          <strong style={styles.statValue}>
            {products.reduce(
              (total, product) =>
                total +
                Number(product.stock || 0),
              0
            )}
          </strong>
        </div>
      </section>

      <section style={styles.catalogHeader}>
        <div>
          <p style={styles.eyebrow}>
            STOCK MANAGEMENT
          </p>

          <h2 style={styles.catalogTitle}>
            {products.length} Products
          </h2>
        </div>
      </section>

      {products.length === 0 ? (
        <div style={styles.emptyBox}>
          No products found.
        </div>
      ) : (
        <section style={styles.productList}>
          {products.map((product) => {
            const image =
              getProductImage(product);

            const total =
              getTotalStock(product.id);

            const lowStock =
              total > 0 && total <= 5;

            return (
              <article
                key={product.id}
                style={styles.productCard}
              >
                <div style={styles.productInfo}>
                  <div style={styles.imageBox}>
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        style={styles.productImage}
                      />
                    ) : (
                      <span style={styles.imagePlaceholder}>
                        VORN
                      </span>
                    )}
                  </div>

                  <div style={styles.productDetails}>
                    <p style={styles.category}>
                      {product.category ||
                        "UNISEX"}
                    </p>

                    <h3 style={styles.productName}>
                      {product.name}
                    </h3>

                    <p style={styles.slug}>
                      {product.slug}
                    </p>

                    <p style={styles.price}>
                      ₹
                      {Number(
                        product.sale_price ||
                          product.price ||
                          product.base_price ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>

                <div style={styles.stockArea}>
                  <div style={styles.stockHeader}>
                    <div>
                      <p style={styles.stockLabel}>
                        SIZE STOCK
                      </p>

                      <strong
                        style={{
                          ...styles.totalStock,
                          ...(lowStock
                            ? styles.lowStock
                            : {}),
                        }}
                      >
                        {total} units
                      </strong>
                    </div>

                    {lowStock && (
                      <span
                        style={styles.lowStockBadge}
                      >
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <div style={styles.sizeGrid}>
                    {SIZES.map((size) => (
                      <div
                        key={size}
                        style={styles.sizeItem}
                      >
                        <label
                          style={styles.sizeLabel}
                        >
                          {size}
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            inventory[
                              product.id
                            ]?.[size] ?? 0
                          }
                          onChange={(event) =>
                            updateStock(
                              product.id,
                              size,
                              event.target.value
                            )
                          }
                          style={styles.stockInput}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      saveInventory(product)
                    }
                    disabled={
                      saving[product.id]
                    }
                    style={{
                      ...styles.saveButton,
                      ...(saving[
                        product.id
                      ]
                        ? styles.disabledButton
                        : {}),
                    }}
                  >
                    {saving[product.id]
                      ? "SAVING..."
                      : "SAVE INVENTORY"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

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
    marginBottom: "40px",
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
    marginBottom: "20px",
    border: "1px solid #f0caca",
    background: "#fff5f5",
    color: "#b42318",
    fontSize: "13px",
  },

  successBox: {
    padding: "15px 18px",
    marginBottom: "20px",
    border: "1px solid #cce8d5",
    background: "#f5fff8",
    color: "#176b35",
    fontSize: "13px",
  },

  summary: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "55px",
  },

  summaryCard: {
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

  catalogHeader: {
    marginBottom: "25px",
  },

  catalogTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: "400",
  },

  productList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  productCard: {
    display: "grid",
    gridTemplateColumns:
      "minmax(350px, 1fr) minmax(450px, 1fr)",
    gap: "40px",
    alignItems: "center",
    border: "1px solid #e5e5e5",
    padding: "24px",
    background: "#fff",
  },

  productInfo: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
  },

  imageBox: {
    width: "120px",
    height: "150px",
    flexShrink: 0,
    background: "#f5f5f5",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  imagePlaceholder: {
    fontFamily: "Georgia, serif",
    fontSize: "16px",
    letterSpacing: "4px",
    color: "#999",
  },

  productDetails: {
    minWidth: 0,
  },

  category: {
    margin: "0 0 8px",
    fontSize: "9px",
    letterSpacing: "2px",
    fontWeight: "600",
    color: "#777",
    textTransform: "uppercase",
  },

  productName: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "25px",
    fontWeight: "400",
  },

  slug: {
    margin: "7px 0 14px",
    color: "#999",
    fontSize: "11px",
  },

  price: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
  },

  stockArea: {
    borderLeft: "1px solid #eee",
    paddingLeft: "35px",
  },

  stockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  stockLabel: {
    margin: "0 0 6px",
    fontSize: "9px",
    letterSpacing: "2px",
    fontWeight: "600",
    color: "#888",
  },

  totalStock: {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: "400",
  },

  lowStock: {
    color: "#b42318",
  },

  lowStockBadge: {
    padding: "7px 10px",
    border: "1px solid #f0caca",
    background: "#fff5f5",
    color: "#b42318",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  sizeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "18px",
  },

  sizeItem: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  sizeLabel: {
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#777",
  },

  stockInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    outline: "none",
  },

  saveButton: {
    width: "100%",
    padding: "14px 20px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  emptyBox: {
    padding: "50px",
    border: "1px solid #e5e5e5",
    textAlign: "center",
    color: "#777",
  },
};