import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabaseClient";

/*
|--------------------------------------------------------------------------
| DEFAULT VORN CLOTHING CATEGORIES
|--------------------------------------------------------------------------
| These are fallback categories.
|
| If the same category already exists in Supabase,
| it will not be duplicated.
|
| If you add a new category from Admin later,
| it will automatically appear in Shop.
|--------------------------------------------------------------------------
*/

const DEFAULT_SHOP_CATEGORIES = [
  {
    name: "T-Shirt",
    slug: "t-shirt",
  },
  {
    name: "Down Shoulder",
    slug: "down-shoulder",
  },
  {
    name: "Tracks",
    slug: "tracks",
  },
  {
    name: "Pants",
    slug: "pants",
  },
  {
    name: "Full Sleeve",
    slug: "full-sleeve",
  },
  {
    name: "Branded Tshirt",
    slug: "branded-tshirt",
  },
  {
    name: "Vorn",
    slug: "vorn",
  },
  {
    name: "Oversized T-Shirt",
    slug: "oversized-t-shirt",
  },
  {
    name: "Collared T-Shirt",
    slug: "collared-t-shirt",
  },
  {
    name: "Customizable T-Shirt",
    slug: "customizable-t-shirt",
  },
  {
    name: "Printed Style",
    slug: "printed-style",
  },
  {
    name: "Sweatshirt",
    slug: "sweatshirt",
  },
  {
    name: "Hoodies",
    slug: "hoodies",
  },
  {
    name: "Joggers",
    slug: "joggers",
  },
  {
    name: "Shorts",
    slug: "shorts",
  },
  {
    name: "Jackets",
    slug: "jackets",
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategory(value) {
  return slugify(value);
}

function formatCategoryName(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function Shop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
    useSearchParams();

  const { addToCart } = useCart();

  /*
  |--------------------------------------------------------------------------
  | PRODUCTS
  |--------------------------------------------------------------------------
  */

  const [products, setProducts] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | CATEGORIES
  |--------------------------------------------------------------------------
  */

  const [categories, setCategories] = useState(
    []
  );

  /*
  |--------------------------------------------------------------------------
  | LOADING STATES
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(true);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | ERRORS
  |--------------------------------------------------------------------------
  */

  const [errorMessage, setErrorMessage] =
    useState("");

  const [categoryError, setCategoryError] =
    useState("");

  const [toast, setToast] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const [addingProductId, setAddingProductId] =
    useState(null);

  const [brokenImages, setBrokenImages] =
    useState(() => new Set());

  /*
  |--------------------------------------------------------------------------
  | FILTER STATE
  |--------------------------------------------------------------------------
  */

  const initialCategory =
    searchParams.get("category") || "";

  const initialPrice =
    searchParams.get("price") || "";

  const initialSort =
    searchParams.get("sort") || "newest";

  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);

  const [priceFilter, setPriceFilter] =
    useState(initialPrice);

  const [sortBy, setSortBy] =
    useState(initialSort);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | KEEP FILTER STATE IN SYNC WITH URL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const category =
      searchParams.get("category") || "";

    const price =
      searchParams.get("price") || "";

    const sort =
      searchParams.get("sort") || "newest";

    setSelectedCategory(category);
    setPriceFilter(price);
    setSortBy(sort);
  }, [searchParams]);

  /*
  |--------------------------------------------------------------------------
  | LOAD ACTIVE PRODUCTS
  |--------------------------------------------------------------------------
  */

  async function loadProducts() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error(
        "Shop products loading error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD ACTIVE CATEGORIES
  |--------------------------------------------------------------------------
  */

  async function loadCategories() {
    try {
      setCategoriesLoading(true);
      setCategoryError("");

      const { data, error } = await supabase
        .from("categories")
        .select(
          "id, name, slug, is_active, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const databaseCategories =
        data || [];

      /*
      |--------------------------------------------------------------------------
      | MERGE DATABASE + DEFAULT CATEGORIES
      |--------------------------------------------------------------------------
      */

      const mergedCategories = [
        ...databaseCategories,
      ];

      DEFAULT_SHOP_CATEGORIES.forEach(
        (defaultCategory) => {
          const alreadyExists =
            mergedCategories.some(
              (category) => {
                const databaseSlug =
                  normalizeCategory(
                    category.slug
                  );

                const databaseName =
                  normalizeCategory(
                    category.name
                  );

                const defaultSlug =
                  normalizeCategory(
                    defaultCategory.slug
                  );

                const defaultName =
                  normalizeCategory(
                    defaultCategory.name
                  );

                return (
                  databaseSlug ===
                    defaultSlug ||
                  databaseName ===
                    defaultName
                );
              }
            );

          if (!alreadyExists) {
            mergedCategories.push({
              id: `default-${defaultCategory.slug}`,
              name: defaultCategory.name,
              slug: defaultCategory.slug,
              is_active: true,
              sort_order: 999,
              isDefault: true,
            });
          }
        }
      );

      /*
      |--------------------------------------------------------------------------
      | REMOVE DUPLICATES
      |--------------------------------------------------------------------------
      */

      const uniqueCategories = [];

      const categoryKeys =
        new Set();

      mergedCategories.forEach(
        (category) => {
          const key =
            normalizeCategory(
              category.slug ||
                category.name
            );

          if (!key) {
            return;
          }

          if (
            categoryKeys.has(key)
          ) {
            return;
          }

          categoryKeys.add(key);

          uniqueCategories.push(
            category
          );
        }
      );

      /*
      |--------------------------------------------------------------------------
      | SORT CATEGORIES
      |--------------------------------------------------------------------------
      */

      uniqueCategories.sort(
        (a, b) => {
          const orderA =
            Number.isFinite(
              Number(a.sort_order)
            )
              ? Number(a.sort_order)
              : 999;

          const orderB =
            Number.isFinite(
              Number(b.sort_order)
            )
              ? Number(b.sort_order)
              : 999;

          if (orderA !== orderB) {
            return orderA - orderB;
          }

          return String(
            a.name || ""
          ).localeCompare(
            String(b.name || "")
          );
        }
      );

      setCategories(
        uniqueCategories
      );
    } catch (error) {
      console.error(
        "Shop categories loading error:",
        error
      );

      setCategoryError(
        error?.message ||
          "Unable to load categories."
      );

      /*
      |--------------------------------------------------------------------------
      | FALLBACK
      |--------------------------------------------------------------------------
      */

      setCategories(
        DEFAULT_SHOP_CATEGORIES.map(
          (category, index) => ({
            id: `default-${category.slug}`,
            name: category.name,
            slug: category.slug,
            is_active: true,
            sort_order: index,
            isDefault: true,
          })
        )
      );
    } finally {
      setCategoriesLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET PRODUCT IMAGE
  |--------------------------------------------------------------------------
  */

  function getProductImage(product) {
    /*
    |--------------------------------------------------------------------------
    | JSONB ARRAY
    |--------------------------------------------------------------------------
    */

    if (
      Array.isArray(
        product?.images
      ) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    /*
    |--------------------------------------------------------------------------
    | STRING JSON
    |--------------------------------------------------------------------------
    */

    if (
      typeof product?.images ===
      "string"
    ) {
      try {
        const parsed =
          JSON.parse(
            product.images
          );

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          return parsed[0];
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    /*
    |--------------------------------------------------------------------------
    | IMAGE URL
    |--------------------------------------------------------------------------
    */

    if (product?.image_url) {
      return product.image_url;
    }

    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | GET PRODUCT PRICE
  |--------------------------------------------------------------------------
  */

  function getProductPrice(product) {
    if (
      product?.sale_price !== null &&
      product?.sale_price !== undefined &&
      product?.sale_price !== ""
    ) {
      return Number(
        product.sale_price
      );
    }

    if (
      product?.base_price !== null &&
      product?.base_price !== undefined &&
      product?.base_price !== ""
    ) {
      return Number(
        product.base_price
      );
    }

    if (
      product?.price !== null &&
      product?.price !== undefined &&
      product?.price !== ""
    ) {
      return Number(
        product.price
      );
    }

    return 0;
  }

  /*
  |--------------------------------------------------------------------------
  | GET PRODUCT CATEGORY SLUG
  |--------------------------------------------------------------------------
  */

  function getProductCategorySlug(
    product
  ) {
    /*
    |--------------------------------------------------------------------------
    | DIRECT CATEGORY SLUG
    |--------------------------------------------------------------------------
    */

    if (
      product?.category_slug
    ) {
      return normalizeCategory(
        product.category_slug
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY TEXT
    |--------------------------------------------------------------------------
    */

    if (product?.category) {
      return normalizeCategory(
        product.category
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY NAME
    |--------------------------------------------------------------------------
    */

    if (product?.category_name) {
      return normalizeCategory(
        product.category_name
      );
    }

    return "";
  }

  /*
  |--------------------------------------------------------------------------
  | CATEGORY MATCH
  |--------------------------------------------------------------------------
  */

  function productMatchesCategory(
    product,
    selectedSlug
  ) {
    if (!selectedSlug) {
      return true;
    }

    const normalizedSelected =
      normalizeCategory(
        selectedSlug
      );

    /*
    |--------------------------------------------------------------------------
    | DIRECT PRODUCT CATEGORY
    |--------------------------------------------------------------------------
    */

    const directCategory =
      getProductCategorySlug(
        product
      );

    if (
      directCategory ===
      normalizedSelected
    ) {
      return true;
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY OBJECT
    |--------------------------------------------------------------------------
    */

    if (
      product?.category &&
      typeof product.category ===
        "object"
    ) {
      const objectSlug =
        normalizeCategory(
          product.category.slug ||
            product.category.name
        );

      if (
        objectSlug ===
        normalizedSelected
      ) {
        return true;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY ID
    |--------------------------------------------------------------------------
    */

    const selectedCategoryObject =
      categories.find(
        (category) =>
          normalizeCategory(
            category.slug ||
              category.name
          ) ===
          normalizedSelected
      );

    if (
      selectedCategoryObject &&
      product?.category_id
    ) {
      if (
        String(
          product.category_id
        ) ===
        String(
          selectedCategoryObject.id
        )
      ) {
        return true;
      }
    }

    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | PRICE FILTER
  |--------------------------------------------------------------------------
  */

  function productMatchesPrice(
    product,
    filter
  ) {
    const price =
      getProductPrice(product);

    switch (filter) {
      case "under-999":
        return price < 999;

      case "1000-1499":
        return (
          price >= 1000 &&
          price <= 1499
        );

      case "1500-1999":
        return (
          price >= 1500 &&
          price <= 1999
        );

      case "2000-2999":
        return (
          price >= 2000 &&
          price <= 2999
        );

      case "3000-plus":
        return price >= 3000;

      default:
        return true;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FILTERED + SORTED PRODUCTS
  |--------------------------------------------------------------------------
  */

  const filteredProducts =
    useMemo(() => {
      let result = [
        ...products,
      ];

      /*
      |--------------------------------------------------------------------------
      | CATEGORY
      |--------------------------------------------------------------------------
      */

      if (selectedCategory) {
        result =
          result.filter(
            (product) =>
              productMatchesCategory(
                product,
                selectedCategory
              )
          );
      }

      /*
      |--------------------------------------------------------------------------
      | PRICE
      |--------------------------------------------------------------------------
      */

      if (priceFilter) {
        result =
          result.filter(
            (product) =>
              productMatchesPrice(
                product,
                priceFilter
              )
          );
      }

      /*
      |--------------------------------------------------------------------------
      | SORT
      |--------------------------------------------------------------------------
      */

      result.sort(
        (a, b) => {
          switch (sortBy) {
            case "price-low":
              return (
                getProductPrice(a) -
                getProductPrice(b)
              );

            case "price-high":
              return (
                getProductPrice(b) -
                getProductPrice(a)
              );

            case "name-az":
              return String(
                a.name || ""
              ).localeCompare(
                String(b.name || "")
              );

            case "name-za":
              return String(
                b.name || ""
              ).localeCompare(
                String(a.name || "")
              );

            case "newest":
            default: {
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

              return (
                dateB - dateA
              );
            }
          }
        }
      );

      return result;
    }, [
      products,
      categories,
      selectedCategory,
      priceFilter,
      sortBy,
    ]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE FILTERS
  |--------------------------------------------------------------------------
  */

  function updateFilters({
    category = selectedCategory,
    price = priceFilter,
    sort = sortBy,
  }) {
    const nextParams = {};

    if (category) {
      nextParams.category =
        category;
    }

    if (price) {
      nextParams.price =
        price;
    }

    if (sort && sort !== "newest") {
      nextParams.sort =
        sort;
    }

    setSearchParams(
      nextParams
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CLEAR FILTERS
  |--------------------------------------------------------------------------
  */

  function clearFilters() {
    setSearchParams({});
  }

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

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
    }, 2800);
  }

  function handleAddToCart(product) {
    if (!product?.id || addingProductId) {
      return;
    }

    const price = getProductPrice(product);

    try {
      setAddingProductId(product.id);

      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price,
        quantity: 1,
        slug: product.slug || product.id,
        image: getProductImage(product),
        category:
          typeof product.category === "string"
            ? product.category
            : "",
      });

      showToast(
        `${product.name || "Product"} added to cart.`
      );
    } catch (error) {
      console.error("Add to cart error:", error);

      showToast(
        "Unable to add this product to cart.",
        "error"
      );
    } finally {
      window.setTimeout(() => {
        setAddingProductId(null);
      }, 500);
    }
  }

  function handleImageError(productId) {
    setBrokenImages((current) => {
      const next = new Set(current);
      next.add(productId);
      return next;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | VIEW PRODUCT
  |--------------------------------------------------------------------------
  */

  function handleViewProduct(
    product
  ) {
    navigate(
      `/product/${
        product.slug ||
        product.id
      }`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="vorn-shop-page" style={styles.page}>
        <section
          className="vorn-header"
          style={styles.header}
        >
          <p style={styles.eyebrow}>
            VORN COLLECTION
          </p>

          <h1 style={styles.title}>
            Shop
          </h1>

          <p style={styles.subtitle}>
            Discover the latest VORN pieces designed
            for confident everyday style.
          </p>
        </section>

        <section
          className="vorn-shop-grid"
          style={styles.grid}
          aria-label="Loading products"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <article
              key={index}
              style={styles.card}
              aria-hidden="true"
            >
              <div
                className="vorn-skeleton"
                style={styles.skeletonImage}
              />
              <div style={styles.info}>
                <div
                  className="vorn-skeleton"
                  style={styles.skeletonLineSmall}
                />
                <div
                  className="vorn-skeleton"
                  style={styles.skeletonLine}
                />
                <div
                  className="vorn-skeleton"
                  style={styles.skeletonLinePrice}
                />
                <div
                  className="vorn-actions"
                  style={styles.actions}
                >
                  <div
                    className="vorn-skeleton"
                    style={styles.skeletonButton}
                  />
                  <div
                    className="vorn-skeleton"
                    style={styles.skeletonButton}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    );
  }

  /*

  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="vorn-shop-page" style={styles.page}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        style={styles.header}
      >
        <p
          style={styles.eyebrow}
        >
          VORN COLLECTION
        </p>

        <h1
          style={styles.title}
        >
          Shop
        </h1>

        <p
          style={styles.subtitle}
        >
          Discover the latest
          VORN pieces designed for
          confident everyday style.
        </p>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {errorMessage && (
        <section style={styles.messageSection}>
          <div style={styles.errorBox}>
            <strong style={styles.errorTitle}>
              Something went wrong
            </strong>

            <p style={styles.errorText}>
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              style={{
                ...styles.retryButton,
                ...(loading
                  ? styles.buttonDisabled
                  : {}),
              }}
            >
              {loading ? "RETRYING..." : "TRY AGAIN"}
            </button>
          </div>
        </section>
      )}

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <section
        style={
          styles.filterSection
        }
      >
        <div className="vorn-filter-grid" style={styles.filterGrid}>
          {/* =================================================
              CATEGORY
          ================================================= */}

          <div
            style={
              styles.filterGroup
            }
          >
            <label
              style={
                styles.filterLabel
              }
            >
              CATEGORY
            </label>

            <select
              value={
                selectedCategory
              }
              onChange={(event) =>
                updateFilters({
                  category:
                    event.target
                      .value,
                  price:
                    priceFilter,
                  sort: sortBy,
                })
              }
              style={
                styles.select
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id ||
                      category.slug
                    }
                    value={
                      category.slug ||
                      slugify(
                        category.name
                      )
                    }
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* =================================================
              PRICE
          ================================================= */}

          <div
            style={
              styles.filterGroup
            }
          >
            <label
              style={
                styles.filterLabel
              }
            >
              PRICE
            </label>

            <select
              value={
                priceFilter
              }
              onChange={(event) =>
                updateFilters({
                  category:
                    selectedCategory,
                  price:
                    event.target
                      .value,
                  sort: sortBy,
                })
              }
              style={
                styles.select
              }
            >
              <option value="">
                All Prices
              </option>

              <option value="under-999">
                Under ₹999
              </option>

              <option value="1000-1499">
                ₹1,000 - ₹1,499
              </option>

              <option value="1500-1999">
                ₹1,500 - ₹1,999
              </option>

              <option value="2000-2999">
                ₹2,000 - ₹2,999
              </option>

              <option value="3000-plus">
                ₹3,000+
              </option>
            </select>
          </div>

          {/* =================================================
              SORT
          ================================================= */}

          <div
            style={
              styles.filterGroup
            }
          >
            <label
              style={
                styles.filterLabel
              }
            >
              SORT BY
            </label>

            <select
              value={sortBy}
              onChange={(event) =>
                updateFilters({
                  category:
                    selectedCategory,
                  price:
                    priceFilter,
                  sort:
                    event.target
                      .value,
                })
              }
              style={
                styles.select
              }
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name-az">
                Name: A-Z
              </option>

              <option value="name-za">
                Name: Z-A
              </option>
            </select>
          </div>

          {/* =================================================
              CLEAR
          ================================================= */}

          {(selectedCategory ||
            priceFilter ||
            sortBy !== "newest") && (
            <div
              style={
                styles.clearGroup
              }
            >
              <button
                type="button"
                onClick={
                  clearFilters
                }
                style={
                  styles.clearButton
                }
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CATEGORY ERROR
      ===================================================== */}

      {categoryError && (
        <p
          style={
            styles.categoryNotice
          }
        >
          Showing default VORN
          categories.
        </p>
      )}

      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      {products.length > 0 && (
        <div className="vorn-result-bar" style={styles.resultBar}>
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length ===
            1
              ? "product"
              : "products"}
          </span>

          {selectedCategory && (
            <span
              style={
                styles.activeFilter
              }
            >
              {formatCategoryName(
                selectedCategory
              )}
            </span>
          )}
        </div>
      )}

      {/* =====================================================
          EMPTY PRODUCTS
      ===================================================== */}

      {!errorMessage &&
        products.length === 0 && (
          <section
            style={
              styles.messageSection
            }
          >
            <h2
              style={
                styles.emptyTitle
              }
            >
              No Products Available
            </h2>

            <p
              style={
                styles.messageText
              }
            >
              New VORN pieces will
              appear here soon.
            </p>
          </section>
        )}

      {/* =====================================================
          FILTERED EMPTY
      ===================================================== */}

      {products.length > 0 &&
        filteredProducts.length ===
          0 && (
          <section
            style={
              styles.messageSection
            }
          >
            <h2
              style={
                styles.emptyTitle
              }
            >
              No Products Found
            </h2>

            <p
              style={
                styles.messageText
              }
            >
              Try another category
              or clear your filters.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
              style={
                styles.emptyClearButton
              }
            >
              CLEAR FILTERS
            </button>
          </section>
        )}

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      {filteredProducts.length >
        0 && (
        <section className="vorn-shop-grid" style={styles.grid}>
          {filteredProducts.map(
            (product) => {
              const image =
                getProductImage(
                  product
                );

              const price =
                getProductPrice(
                  product
                );

              const category =
                String(
                  product.category ||
                    product.category_name ||
                    "UNISEX"
                ).toUpperCase();

              return (
                <article
                  key={
                    product.id
                  }
                  style={
                    styles.card
                  }
                >
                  {/* =========================================
                      PRODUCT IMAGE
                  ========================================= */}

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
                        styles.image
                      }
                    >
                      {image &&
                      !brokenImages.has(product.id) ? (
                        <img
                          src={image}
                          alt={
                            product.name ||
                            "VORN product"
                          }
                          style={styles.productImage}
                          loading="lazy"
                          onError={() =>
                            handleImageError(product.id)
                          }
                        />
                      ) : (
                        <div style={styles.imageFallback}>
                          <span
                            style={
                              styles.imageFallbackMark
                            }
                          >
                            V
                          </span>

                          <span
                            style={
                              styles.imageFallbackText
                            }
                          >
                            VORN
                          </span>

                          <small
                            style={
                              styles.imageFallbackSmall
                            }
                          >
                            Image unavailable
                          </small>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* =========================================
                      PRODUCT INFO
                  ========================================= */}

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
                      {category}
                    </p>

                    <h2
                      style={
                        styles.productName
                      }
                    >
                      {
                        product.name
                      }
                    </h2>

                    <p
                      style={
                        styles.price
                      }
                    >
                      ₹
                      {price.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    {/* =======================================
                        ACTIONS
                    ======================================= */}

                    <div className="vorn-actions" style={styles.actions}>
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
                          handleAddToCart(product)
                        }
                        disabled={
                          addingProductId ===
                          product.id
                        }
                        aria-busy={
                          addingProductId ===
                          product.id
                        }
                        style={{
                          ...styles.cartButton,
                          ...(addingProductId ===
                          product.id
                            ? styles.buttonDisabled
                            : {}),
                        }}
                      >
                        {addingProductId ===
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
      )}

      {/* =====================================================
          CATEGORY LOADING
      ===================================================== */}

      {categoriesLoading &&
        categories.length ===
          0 && (
          <p style={styles.categoryLoading}>
            Loading categories...
          </p>
        )}

      {toast.visible && (
        <div
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
            {toast.type === "error" ? "!" : "✓"}
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
        .vorn-shop-grid {
          grid-template-columns:
            repeat(4, minmax(0, 1fr)) !important;
        }

        @media (max-width: 1000px) {
          .vorn-shop-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 720px) {
          .vorn-shop-page {
            padding: 56px 16px !important;
          }

          .vorn-shop-page .vorn-header {
            margin-bottom: 38px !important;
          }

          .vorn-shop-page h1 {
            font-size: 40px !important;
          }

          .vorn-shop-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: 24px 14px !important;
          }

          .vorn-filter-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .vorn-result-bar {
            align-items: flex-start !important;
            flex-direction: column !important;
          }

          .vorn-actions {
            flex-direction: column !important;
          }
        }

        @media (max-width: 430px) {
          .vorn-shop-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .vorn-skeleton {
          position: relative;
          overflow: hidden;
          background: #eeeeee;
        }

        .vorn-skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.65),
            transparent
          );
          animation:
            vorn-skeleton-shimmer 1.35s infinite;
        }

        @keyframes vorn-skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-skeleton::after {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = {
  page: {
    minHeight: "75vh",
    padding:
      "80px 30px",
    background: "#fff",
  },

  header: {
    maxWidth: "700px",
    margin:
      "0 auto 60px",
    textAlign: "center",
  },

  eyebrow: {
    margin:
      "0 0 12px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "3px",
    color: "#555",
  },

  title: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "52px",
    fontWeight: "400",
    color: "#111",
  },

  subtitle: {
    margin:
      "16px auto 0",
    maxWidth: "520px",
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#666",
  },

  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  filterSection: {
    width: "100%",
    maxWidth: "1200px",
    margin:
      "0 auto 45px",
    padding:
      "20px",
    border:
      "1px solid #e7e7e7",
    background:
      "#fff",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
    alignItems: "end",
  },

  filterGroup: {
    display: "flex",
    flexDirection:
      "column",
    gap: "8px",
  },

  filterLabel: {
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "2px",
    color: "#555",
  },

  select: {
    width: "100%",
    minHeight: "42px",
    padding:
      "0 12px",
    border:
      "1px solid #dcdcdc",
    background:
      "#fff",
    color: "#111",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  },

  clearGroup: {
    display: "flex",
    alignItems:
      "flex-end",
  },

  clearButton: {
    width: "100%",
    minHeight: "42px",
    padding:
      "0 14px",
    border:
      "1px solid #111",
    background:
      "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  resultBar: {
    width: "100%",
    maxWidth: "1200px",
    margin:
      "0 auto 22px",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "space-between",
    gap: "15px",
    fontSize: "11px",
    color: "#777",
    letterSpacing: "1px",
  },

  activeFilter: {
    padding:
      "6px 10px",
    border:
      "1px solid #ddd",
    color: "#111",
    fontSize: "9px",
    letterSpacing:
      "1.5px",
    textTransform:
      "uppercase",
  },

  categoryNotice: {
    width: "100%",
    maxWidth: "1200px",
    margin:
      "-25px auto 25px",
    fontSize: "11px",
    color: "#777",
    textAlign: "right",
  },

  categoryLoading: {
    width: "100%",
    maxWidth: "1200px",
    margin:
      "20px auto",
    fontSize: "12px",
    color: "#777",
    textAlign: "center",
  },

  /*
  |--------------------------------------------------------------------------
  | PRODUCT GRID
  |--------------------------------------------------------------------------
  */

  grid: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px 24px",
  },

  card: {
    background: "#fff",
  },

  imageButton: {
    width: "100%",
    padding: 0,
    border: "none",
    background:
      "none",
    cursor: "pointer",
  },

  image: {
    width: "100%",
    aspectRatio:
      "4 / 5",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #f4f4f4, #e5e5e5)",
    color: "#999",
    fontFamily:
      "Georgia, serif",
    fontSize: "22px",
    letterSpacing: "6px",
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  info: {
    padding:
      "18px 2px 0",
  },

  category: {
    margin:
      "0 0 8px",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "2px",
    color: "#777",
  },

  productName: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "18px",
    fontWeight: "400",
    color: "#111",
  },

  price: {
    margin:
      "10px 0 18px",
    fontSize: "14px",
    color: "#222",
  },

  actions: {
    display: "flex",
    gap: "8px",
  },

  viewButton: {
    flex: 1,
    padding:
      "12px 8px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing:
      "1px",
  },

  cartButton: {
    flex: 1,
    padding:
      "12px 8px",
    border:
      "1px solid #111",
    background:
      "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing:
      "1px",
  },

  /*
  |--------------------------------------------------------------------------
  | EMPTY / ERROR
  |--------------------------------------------------------------------------
  */

  messageSection: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding:
      "60px 20px",
    textAlign: "center",
  },

  messageText: {
    margin: 0,
    color: "#777",
    fontSize: "14px",
    lineHeight: "1.7",
  },

  emptyTitle: {
    margin:
      "0 0 12px",
    fontFamily:
      "Georgia, serif",
    fontSize: "30px",
    fontWeight: "400",
    color: "#111",
  },

  emptyClearButton: {
    marginTop: "20px",
    padding:
      "13px 22px",
    border:
      "1px solid #111",
    background:
      "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing:
      "1.5px",
  },

  errorTitle: {
    display: "block",
    marginBottom: "6px",
    fontSize: "15px",
    color: "#111",
  },

  errorText: {
    margin: "0 0 16px",
    color: "#b42318",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  retryButton: {
    padding: "11px 16px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },

  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  skeletonImage: {
    width: "100%",
    aspectRatio: "4 / 5",
  },

  skeletonLineSmall: {
    width: "30%",
    height: "9px",
    marginBottom: "12px",
  },

  skeletonLine: {
    width: "72%",
    height: "18px",
    marginBottom: "12px",
  },

  skeletonLinePrice: {
    width: "35%",
    height: "14px",
    marginBottom: "18px",
  },

  skeletonButton: {
    flex: 1,
    height: "38px",
  },

  imageFallback: {
    width: "100%",
    height: "100%",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    background: "#f2f2f2",
    color: "#888",
  },

  imageFallbackMark: {
    fontFamily: "Georgia, serif",
    fontSize: "42px",
    lineHeight: 1,
    color: "#111",
  },

  imageFallbackText: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "4px",
    color: "#222",
  },

  imageFallbackSmall: {
    fontSize: "10px",
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

  errorBox: {
    padding:
      "15px 18px",
    border:
      "1px solid #f0caca",
    background:
      "#fff5f5",
    color: "#b42318",
    fontSize: "13px",
    textAlign: "left",
  },
};