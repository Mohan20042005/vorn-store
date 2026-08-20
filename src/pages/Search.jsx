import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabaseClient";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { addToCart } = useCart();

  const queryFromUrl = searchParams.get("q") || "";

  const [search, setSearch] = useState(queryFromUrl);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================
   * LOAD PRODUCTS
   * ============================================
   */

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const { data, error: fetchError } =
          await supabase
            .from("products")
            .select(
              `
                id,
                name,
                slug,
                description,
                base_price,
                sale_price,
                price,
                brand,
                category,
                category_id,
                image_url,
                images,
                is_active,
                is_featured,
                is_new_arrival,
                created_at
              `
            )
            .eq("is_active", true)
            .order("created_at", {
              ascending: false,
            });

        if (fetchError) {
          throw fetchError;
        }

        setProducts(data || []);
      } catch (err) {
        console.error(
          "Search products error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load products."
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const { data, error: categoryError } =
          await supabase
            .from("categories")
            .select(
              "id, name, slug, is_active"
            )
            .eq("is_active", true)
            .order("sort_order", {
              ascending: true,
            })
            .order("name", {
              ascending: true,
            });

        if (categoryError) {
          throw categoryError;
        }

        setCategories(data || []);
      } catch (err) {
        console.error(
          "Search categories error:",
          err
        );

        // Product search should continue even if
        // category loading fails.
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadProducts();
    loadCategories();
  }, []);

  /*
   * ============================================
   * KEEP INPUT IN SYNC WITH URL
   * ============================================
   */

  useEffect(() => {
    setSearch(queryFromUrl);
  }, [queryFromUrl]);

  /*
   * ============================================
   * FILTER PRODUCTS
   * ============================================
   */

  const filteredProducts = useMemo(() => {
    const keyword = queryFromUrl
      .trim()
      .toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const name =
        product?.name?.toLowerCase() || "";

      const description =
        product?.description?.toLowerCase() || "";

      const brand =
        product?.brand?.toLowerCase() || "";

      const matchedCategory =
        categories.find(
          (item) =>
            item.id === product?.category_id ||
            item.name?.toLowerCase() ===
              product?.category?.toLowerCase() ||
            item.slug?.toLowerCase() ===
              product?.category?.toLowerCase()
        );

      const categoryName =
        matchedCategory?.name ||
        product?.category ||
        "";

      const categorySlug =
        matchedCategory?.slug ||
        "";

      const slug =
        product?.slug?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        description.includes(keyword) ||
        brand.includes(keyword) ||
        categoryName
          .toLowerCase()
          .includes(keyword) ||
        categorySlug
          .toLowerCase()
          .includes(keyword) ||
        slug.includes(keyword)
      );
    });
  }, [products, categories, queryFromUrl]);

  /*
   * ============================================
   * SEARCH SUBMIT
   * ============================================
   */

  function handleSearchSubmit(event) {
    event.preventDefault();

    const value = search.trim();

    if (value) {
      setSearchParams({
        q: value,
      });
    } else {
      setSearchParams({});
    }
  }

  /*
   * ============================================
   * CLEAR SEARCH
   * ============================================
   */

  function handleClearSearch() {
    setSearch("");
    setSearchParams({});
  }

  /*
   * ============================================
   * PRODUCT PRICE
   * ============================================
   */

  function getProductPrice(product) {
    const salePrice = Number(product?.sale_price);
    const basePrice = Number(product?.base_price);
    const oldPrice = Number(product?.price);

    if (
      Number.isFinite(salePrice) &&
      salePrice > 0
    ) {
      return salePrice;
    }

    if (
      Number.isFinite(basePrice) &&
      basePrice > 0
    ) {
      return basePrice;
    }

    if (
      Number.isFinite(oldPrice) &&
      oldPrice > 0
    ) {
      return oldPrice;
    }

    return 0;
  }

  /*
   * ============================================
   * PRODUCT IMAGE
   * ============================================
   */

  function getProductImage(product) {
    if (
      product?.image_url &&
      typeof product.image_url === "string"
    ) {
      return product.image_url;
    }

    if (Array.isArray(product?.images)) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (
        firstImage &&
        typeof firstImage === "object"
      ) {
        return (
          firstImage.url ||
          firstImage.image_url ||
          firstImage.src ||
          ""
        );
      }
    }

    return "";
  }

  /*
   * ============================================
   * ADD TO CART
   * ============================================
   */

  function handleAddToCart(product) {
    const price = getProductPrice(product);

    addToCart({
      id: product.id,
      name: product.name,
      price,
      quantity: 1,
      image:
        getProductImage(product) || undefined,
      slug: product.slug,
    });
  }

  /*
   * ============================================
   * OPEN PRODUCT
   * ============================================
   */

  function handleViewProduct(product) {
    if (product?.slug) {
      navigate(
        `/product/${product.slug}`
      );

      return;
    }

    if (product?.id) {
      navigate(
        `/product/${product.id}`
      );
    }
  }

  /*
   * ============================================
   * RENDER
   * ============================================
   */

  return (
    <main style={styles.page}>
      {/* ======================================
          HEADER
      ====================================== */}

      <section style={styles.header}>
        <p style={styles.eyebrow}>
          VORN COLLECTION
        </p>

        <h1 style={styles.title}>
          Search
        </h1>

        <p style={styles.subtitle}>
          Find the VORN pieces you are looking
          for.
        </p>

        {/* SEARCH FORM */}

        <form
          onSubmit={handleSearchSubmit}
          style={styles.searchForm}
        >
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products..."
            aria-label="Search products"
            style={styles.searchInput}
          />

          <button
            type="submit"
            style={styles.searchButton}
          >
            SEARCH
          </button>
        </form>

        {!categoriesLoading &&
          categories.length > 0 && (
            <div style={styles.categoryList}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSearch(category.name);
                    setSearchParams({
                      q: category.name,
                    });
                  }}
                  style={styles.categoryButton}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

        {queryFromUrl && (
          <div style={styles.searchInfo}>
            <span>
              Search results for{" "}
              <strong>
                "{queryFromUrl}"
              </strong>
            </span>

            <button
              type="button"
              onClick={handleClearSearch}
              style={styles.clearButton}
            >
              CLEAR
            </button>
          </div>
        )}
      </section>

      {/* ======================================
          CONTENT
      ====================================== */}

      <section style={styles.content}>
        {loading && (
          <div style={styles.messageBox}>
            <p style={styles.messageTitle}>
              Loading products...
            </p>

            <p style={styles.messageText}>
              Please wait.
            </p>
          </div>
        )}

        {!loading && error && (
          <div style={styles.messageBox}>
            <p style={styles.messageTitle}>
              Something went wrong
            </p>

            <p style={styles.messageText}>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              style={styles.retryButton}
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div style={styles.empty}>
              <h2 style={styles.emptyTitle}>
                No products found
              </h2>

              <p style={styles.emptyText}>
                {queryFromUrl
                  ? `We couldn't find any products matching "${queryFromUrl}".`
                  : "There are no products available right now."}
              </p>

              {queryFromUrl && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={styles.emptyButton}
                >
                  VIEW ALL PRODUCTS
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <>
              <div style={styles.resultHeader}>
                <p style={styles.resultCount}>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "PRODUCT"
                    : "PRODUCTS"}
                </p>
              </div>

              <div style={styles.grid}>
                {filteredProducts.map(
                  (product) => {
                    const image =
                      getProductImage(product);

                    const productPrice =
                      getProductPrice(product);

                    const salePrice =
                      Number(
                        product?.sale_price
                      );

                    const basePrice =
                      Number(
                        product?.base_price
                      );

                    const hasSale =
                      Number.isFinite(
                        salePrice
                      ) &&
                      salePrice > 0 &&
                      Number.isFinite(
                        basePrice
                      ) &&
                      basePrice > salePrice;

                    return (
                      <article
                        key={product.id}
                        style={styles.card}
                      >
                        {/* PRODUCT IMAGE */}

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
                          <div
                            style={
                              styles.imageWrapper
                            }
                          >
                            {image ? (
                              <img
                                src={image}
                                alt={
                                  product.name ||
                                  "VORN product"
                                }
                                style={
                                  styles.image
                                }
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";

                                  const
                                    fallback =
                                      event
                                        .currentTarget
                                        .parentElement
                                        ?.querySelector(
                                          "[data-image-fallback]"
                                        );

                                  if (
                                    fallback
                                  ) {
                                    fallback.style.display =
                                      "flex";
                                  }
                                }}
                              />
                            ) : null}

                            <div
                              data-image-fallback
                              style={{
                                ...styles
                                  .imageFallback,
                                display: image
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              VORN
                            </div>

                            {product?.is_new_arrival && (
                              <span
                                style={
                                  styles
                                    .badge
                                }
                              >
                                NEW
                              </span>
                            )}

                            {product?.is_featured &&
                              !product?.is_new_arrival && (
                                <span
                                  style={
                                    styles
                                      .badge
                                  }
                                >
                                  FEATURED
                                </span>
                              )}
                          </div>
                        </button>

                        {/* PRODUCT INFO */}

                        <div
                          style={styles.info}
                        >
                          <p
                            style={
                              styles.category
                            }
                          >
                            {categories.find(
                              (item) =>
                                item.id ===
                                product?.category_id
                            )?.name ||
                              product?.category ||
                              product?.brand ||
                              "VORN"}
                          </p>

                          <h2
                            style={
                              styles.productName
                            }
                          >
                            {product.name}
                          </h2>

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
                              {productPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            {hasSale && (
                              <span
                                style={
                                  styles.oldPrice
                                }
                              >
                                ₹
                                {basePrice.toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}
                          </div>

                          {/* ACTIONS */}

                          <div
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
                              style={
                                styles.cartButton
                              }
                            >
                              ADD TO CART
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </>
          )}
      </section>
    </main>
  );
}

/*
 * ==============================================
 * STYLES
 * ==============================================
 */

const styles = {
  page: {
    minHeight: "75vh",
    padding: "80px 30px 100px",
    background: "#fff",
  },

  header: {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto 60px",
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
    fontSize: "52px",
    fontWeight: "400",
    lineHeight: "1.1",
    color: "#111",
  },

  subtitle: {
    margin: "16px auto 30px",
    maxWidth: "520px",
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#666",
  },

  searchForm: {
    width: "100%",
    maxWidth: "650px",
    margin: "0 auto",
    display: "flex",
    gap: "8px",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "48px",
    padding: "0 16px",
    border: "1px solid #ddd",
    outline: "none",
    background: "#fff",
    color: "#111",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  searchButton: {
    height: "48px",
    padding: "0 24px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  searchInfo: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    fontSize: "12px",
    color: "#666",
  },

  categoryList: {
    marginTop: "22px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
  },

  categoryButton: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },

  clearButton: {
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#111",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
    textDecoration: "underline",
  },

  content: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  resultHeader: {
    marginBottom: "18px",
    borderBottom: "1px solid #eee",
    paddingBottom: "14px",
  },

  resultCount: {
    margin: 0,
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "2px",
    color: "#777",
  },

  grid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "32px 24px",
  },

  card: {
    minWidth: 0,
    background: "#fff",
  },

  imageButton: {
    width: "100%",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
  },

  imageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "4 / 5",
    overflow: "hidden",
    background: "#f4f4f4",
  },

  image: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
  },

  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #f4f4f4, #e5e5e5)",
    color: "#999",
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    letterSpacing: "6px",
  },

  badge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "7px 9px",
    background: "#111",
    color: "#fff",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  info: {
    padding: "18px 2px 0",
  },

  category: {
    margin: "0 0 8px",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "2px",
    color: "#777",
    textTransform: "uppercase",
  },

  productName: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "18px",
    fontWeight: "400",
    lineHeight: "1.4",
    color: "#111",
  },

  priceRow: {
    margin: "10px 0 18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  price: {
    fontSize: "14px",
    color: "#222",
  },

  oldPrice: {
    fontSize: "12px",
    color: "#999",
    textDecoration: "line-through",
  },

  actions: {
    display: "flex",
    gap: "8px",
  },

  viewButton: {
    flex: 1,
    padding: "12px 8px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  cartButton: {
    flex: 1,
    padding: "12px 8px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  messageBox: {
    maxWidth: "700px",
    margin: "60px auto",
    padding: "60px 30px",
    border: "1px solid #e5e5e5",
    textAlign: "center",
  },

  messageTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "24px",
    fontWeight: "400",
    color: "#111",
  },

  messageText: {
    margin: "12px 0 0",
    color: "#777",
    fontSize: "13px",
    lineHeight: "1.7",
  },

  retryButton: {
    marginTop: "24px",
    padding: "12px 20px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  empty: {
    maxWidth: "700px",
    margin: "60px auto",
    padding: "60px 30px",
    border: "1px solid #e5e5e5",
    textAlign: "center",
  },

  emptyTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "24px",
    fontWeight: "400",
    color: "#111",
  },

  emptyText: {
    margin: "12px auto 24px",
    maxWidth: "500px",
    color: "#777",
    fontSize: "13px",
    lineHeight: "1.7",
  },

  emptyButton: {
    padding: "12px 20px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
  },
};