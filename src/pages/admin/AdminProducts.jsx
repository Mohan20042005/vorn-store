import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabaseClient";

// =========================================================
// DEFAULT PRODUCT CATEGORIES
// =========================================================

const DEFAULT_CATEGORIES = [
  "T-Shirt",
  "Down Shoulder",
  "Tracks",
  "Pants",
  "Full Sleeve",
  "Branded Tshirt",
  "Vorn",
  "Oversized T-Shirt",
  "Collared T-Shirt",
  "Customizable T-Shirt",
  "Printed Style",

  // Additional useful apparel categories
  "Hoodie",
  "Sweatshirt",
  "Jacket",
  "Polo T-Shirt",
  "Crop T-Shirt",
  "Tank Top",
  "Shorts",
  "Joggers",
  "Cargo Pants",
  "Track Pants",
  "Innerwear",
  "Accessories",
  "New Arrivals",
  "Best Sellers",
  "Limited Edition",
  "Custom Print",
];

// =========================================================
// EMPTY FORM
// =========================================================

const EMPTY_FORM = {
  name: "",
  slug: "",
  price: "",
  stock: "",
  categoryId: "",
  category: "",
  description: "",
};

// =========================================================
// IMAGE HELPERS
// =========================================================

function getImages(product) {
  if (Array.isArray(product?.images)) {
    return product.images.filter(Boolean);
  }

  if (typeof product?.images === "string") {
    try {
      const parsed = JSON.parse(product.images);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  if (product?.image_url) {
    return [product.image_url];
  }

  return [];
}

// =========================================================
// CREATE SLUG
// =========================================================

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// =========================================================
// ADMIN PRODUCTS
// =========================================================

export default function AdminProducts() {
  const navigate = useNavigate();

  // =======================================================
  // PRODUCTS
  // =======================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  // =======================================================
  // CATEGORIES
  // =======================================================

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  // =======================================================
  // MESSAGES
  // =======================================================

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // =======================================================
  // SEARCH
  // =======================================================

  const [search, setSearch] = useState("");

  // =======================================================
  // FORM
  // =======================================================

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  // =======================================================
  // IMAGES
  // =======================================================

  const [images, setImages] = useState([]);

  const [selectedMainImage, setSelectedMainImage] =
    useState("");

  // =======================================================
  // LOAD PRODUCTS
  // =======================================================

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setCategoriesLoading(true);

      const {
        data,
        error,
      } = await supabase
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
        (data || []).map((item) => ({
          ...item,
          source: "database",
        }));

      const databaseNames = new Set(
        databaseCategories.map(
          (item) =>
            String(item.name || "")
              .trim()
              .toLowerCase()
        )
      );

      const fallbackCategories =
        DEFAULT_CATEGORIES
          .filter(
            (name) =>
              !databaseNames.has(
                name.toLowerCase()
              )
          )
          .map((name, index) => ({
            id: `default-${index}-${name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`,
            name,
            slug: name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
            is_active: true,
            sort_order:
              1000 + index,
            source: "default",
          }));

      setCategories([
        ...databaseCategories,
        ...fallbackCategories,
      ]);
    } catch (error) {
      console.error(
        "Admin categories error:",
        error
      );

      setCategories(
        DEFAULT_CATEGORIES.map(
          (name, index) => ({
            id: `default-${index}-${name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`,
            name,
            slug: name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
            is_active: true,
            sort_order:
              1000 + index,
            source: "default",
          })
        )
      );

      setErrorMessage(
        error?.message ||
          "Unable to load categories. Using default categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error(
        "Admin products error:",
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

  // =======================================================
  // FORM HELPERS
  // =======================================================

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // =======================================================
  // OPEN ADD FORM
  // =======================================================

  function openAddForm() {
    setEditingProduct(null);

    const firstCategory =
      categories[0] || null;

    setForm({
      ...EMPTY_FORM,
      categoryId:
        firstCategory?.id || "",
      category:
        firstCategory?.name || "",
    });

    setImages([]);

    setSelectedMainImage("");

    setErrorMessage("");

    setSuccessMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =======================================================
  // OPEN EDIT FORM
  // =======================================================

  function openEditForm(product) {
    const productImages = getImages(product);

    setEditingProduct(product);

    setForm({
      name:
        product.name || "",

      slug:
        product.slug || "",

      // =================================================
      // PRICE PRIORITY
      // price -> base_price -> sale_price
      // =================================================

      price:
        product.price ??
        product.base_price ??
        product.sale_price ??
        "",

      stock:
        product.stock ?? "",

      categoryId:
        product.category_id ||
        categories.find(
          (item) =>
            item.name === product.category ||
            item.slug === product.category
        )?.id ||
        "",

      category:
        product.category ||
        categories.find(
          (item) =>
            item.id === product.category_id
        )?.name ||
        categories[0]?.name ||
        "",

      description:
        product.description ||
        "",
    });

    setImages(productImages);

    setSelectedMainImage(
      productImages[0] || ""
    );

    setErrorMessage("");

    setSuccessMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =======================================================
  // CLOSE FORM
  // =======================================================

  function closeForm() {
    if (saving || uploading) {
      return;
    }

    setShowForm(false);

    setEditingProduct(null);

    setImages([]);

    setSelectedMainImage("");

    const firstCategory =
      categories[0] || null;

    setForm({
      ...EMPTY_FORM,
      categoryId:
        firstCategory?.id || "",
      category:
        firstCategory?.name || "",
    });
  }

  // =======================================================
  // IMAGE UPLOAD
  // =======================================================

  async function handleImageUpload(event) {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    try {
      setUploading(true);

      setErrorMessage("");

      setSuccessMessage("");

      const uploadedUrls = [];

      // =================================================
      // UPLOAD EACH IMAGE
      // =================================================

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          continue;
        }

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const safeName =
          file.name
            .replace(
              /\.[^/.]+$/,
              ""
            )
            .replace(
              /[^a-zA-Z0-9-_]/g,
              "-"
            )
            .toLowerCase();

        const fileName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}-${safeName}.${extension}`;

        const filePath =
          `products/${fileName}`;

        // =================================================
        // SUPABASE STORAGE UPLOAD
        // =================================================

        const {
          error: uploadError,
        } =
          await supabase.storage
            .from("product-images")
            .upload(
              filePath,
              file,
              {
                cacheControl: "3600",
                upsert: false,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        // =================================================
        // GET PUBLIC URL
        // =================================================

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from("product-images")
            .getPublicUrl(
              filePath
            );

        if (
          publicUrlData?.publicUrl
        ) {
          uploadedUrls.push(
            publicUrlData.publicUrl
          );
        }
      }

      // =================================================
      // ADD UPLOADED IMAGES
      // =================================================

      if (uploadedUrls.length) {
        setImages((current) => {
          const nextImages = [
            ...current,
            ...uploadedUrls,
          ];

          if (!selectedMainImage) {
            setSelectedMainImage(
              nextImages[0]
            );
          }

          return nextImages;
        });

        setSuccessMessage(
          `${uploadedUrls.length} image${
            uploadedUrls.length > 1
              ? "s"
              : ""
          } uploaded successfully.`
        );
      }
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  // =======================================================
  // REMOVE IMAGE
  // =======================================================

  function removeImage(image) {
    setImages((current) =>
      current.filter(
        (item) => item !== image
      )
    );

    if (selectedMainImage === image) {
      setImages((current) => {
        const nextImages =
          current.filter(
            (item) => item !== image
          );

        setSelectedMainImage(
          nextImages[0] || ""
        );

        return nextImages;
      });
    }
  }

  // =======================================================
  // SET MAIN IMAGE
  // =======================================================

  function makeMainImage(image) {
    setSelectedMainImage(image);

    setImages((current) => {
      const withoutImage =
        current.filter(
          (item) => item !== image
        );

      return [
        image,
        ...withoutImage,
      ];
    });
  }

  // =======================================================
  // SAVE PRODUCT
  // =======================================================

  async function saveProduct(event) {
    event.preventDefault();

    try {
      setSaving(true);

      setErrorMessage("");

      setSuccessMessage("");

      const cleanName =
        form.name.trim();

      if (!cleanName) {
        throw new Error(
          "Product name is required."
        );
      }

      const cleanSlug =
        form.slug.trim() ||
        createSlug(cleanName);

      const price =
        Number(form.price);

      const stock =
        Number(form.stock);

      if (
        Number.isNaN(price) ||
        price < 0
      ) {
        throw new Error(
          "Please enter a valid price."
        );
      }

      if (
        Number.isNaN(stock) ||
        stock < 0
      ) {
        throw new Error(
          "Please enter a valid stock."
        );
      }

      // =================================================
      // FINAL IMAGES
      // =================================================

      const finalImages = [
        ...(selectedMainImage
          ? [selectedMainImage]
          : []),

        ...images.filter(
          (image) =>
            image !==
            selectedMainImage
        ),
      ];

      // =================================================
      // PRODUCT PAYLOAD
      // =================================================

      const payload = {
        name:
          cleanName,

        slug:
          cleanSlug,

        // =================================================
        // IMPORTANT PRICE FIX
        // =================================================

        price:
          price,

        base_price:
          price,

        stock:
          stock,

        category_id:
          form.categoryId &&
          !String(
            form.categoryId
          ).startsWith("default-")
            ? form.categoryId
            : null,

        category:
          form.category ||
          categories.find(
            (item) =>
              item.id === form.categoryId
          )?.name ||
          "",

        description:
          form.description.trim(),

        images:
          finalImages,

        image_url:
          finalImages[0] ||
          null,

        is_active:
          editingProduct?.is_active ??
          true,
      };

      // =================================================
      // UPDATE EXISTING PRODUCT
      // =================================================

      if (editingProduct) {
        const {
          error,
        } = await supabase
          .from("products")
          .update(payload)
          .eq(
            "id",
            editingProduct.id
          );

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Product updated successfully."
        );
      }

      // =================================================
      // CREATE NEW PRODUCT
      // =================================================

      else {
        const {
          error,
        } = await supabase
          .from("products")
          .insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Product created successfully."
        );
      }

      // =================================================
      // RELOAD PRODUCTS
      // =================================================

      await loadProducts();

      setTimeout(() => {
        setShowForm(false);

        setEditingProduct(null);

        setImages([]);

        setSelectedMainImage("");

        const firstCategory =
          categories[0] || null;

        setForm({
          ...EMPTY_FORM,
          categoryId:
            firstCategory?.id || "",
          category:
            firstCategory?.name || "",
        });
      }, 700);
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }
  // =======================================================
// TOGGLE PRODUCT STATUS
// =======================================================

async function toggleProductStatus(product) {
  try {
    setErrorMessage("");

    setSuccessMessage("");

    const nextStatus =
      !Boolean(
        product.is_active
      );

    const {
      error,
    } = await supabase
      .from("products")
      .update({
        is_active:
          nextStatus,
      })
      .eq(
        "id",
        product.id
      );

    if (error) {
      throw error;
    }

    setProducts(
      (currentProducts) =>
        currentProducts.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  is_active:
                    nextStatus,
                }
              : item
        )
    );

    setSuccessMessage(
      nextStatus
        ? "Product activated successfully."
        : "Product deactivated successfully."
    );
  } catch (error) {
    console.error(
      "Toggle product status error:",
      error
    );

    setErrorMessage(
      error?.message ||
        "Unable to update product status."
    );
  }
}

// =======================================================
// DELETE PRODUCT
// =======================================================

async function deleteProduct(product) {
  const confirmed =
    window.confirm(
      `Delete "${product.name}"?`
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
      .from("products")
      .delete()
      .eq(
        "id",
        product.id
      );

    if (error) {
      throw error;
    }

    setProducts(
      (currentProducts) =>
        currentProducts.filter(
          (item) =>
            item.id !==
            product.id
        )
    );

    setSuccessMessage(
      "Product deleted successfully."
    );
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    setErrorMessage(
      error?.message ||
        "Unable to delete product."
    );
  }
}

// =======================================================
// VIEW PRODUCT
// =======================================================

function viewProduct(product) {
  if (!product?.slug) {
    return;
  }

  navigate(
    `/product/${product.slug}`
  );
}

// =======================================================
// SEARCH FILTER
// =======================================================

const filteredProducts =
  products.filter(
    (product) => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      if (!searchText) {
        return true;
      }

      const name =
        String(
          product.name || ""
        ).toLowerCase();

      const slug =
        String(
          product.slug || ""
        ).toLowerCase();

      const categoryName =
        product.category ||
        categories.find(
          (item) =>
            item.id ===
            product.category_id
        )?.name ||
        "";

      const category =
        String(
          categoryName
        ).toLowerCase();

      return (
        name.includes(
          searchText
        ) ||
        slug.includes(
          searchText
        ) ||
        category.includes(
          searchText
        )
      );
    }
  );

// =======================================================
// FORMAT PRICE
// =======================================================

function formatPrice(value) {
  const amount =
    Number(value || 0);

  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;
}

// =======================================================
// PAGE
// =======================================================

return (
  <main style={styles.page}>

    {/* ===================================================
        PAGE HEADER
    =================================================== */}

    <section style={styles.header}>

      <div>
        <p style={styles.eyebrow}>
          VORN ADMIN
        </p>

        <h1 style={styles.title}>
          Products
        </h1>

        <p style={styles.subtitle}>
          Manage your product
          catalog, pricing,
          inventory and images.
        </p>
      </div>

      <button
        type="button"
        onClick={openAddForm}
        style={styles.primaryButton}
      >
        + ADD PRODUCT
      </button>

    </section>

    {/* ===================================================
        MESSAGES
    =================================================== */}

    {errorMessage && (
      <div
        style={
          styles.errorMessage
        }
      >
        {errorMessage}
      </div>
    )}

    {successMessage && (
      <div
        style={
          styles.successMessage
        }
      >
        {successMessage}
      </div>
    )}

    {/* ===================================================
        PRODUCT FORM
    =================================================== */}

    {showForm && (
      <section
        style={
          styles.formSection
        }
      >

        <div
          style={
            styles.formHeader
          }
        >
          <div>

            <p
              style={
                styles.formEyebrow
              }
            >
              {editingProduct
                ? "EDIT PRODUCT"
                : "NEW PRODUCT"}
            </p>

            <h2
              style={
                styles.formTitle
              }
            >
              {editingProduct
                ? "Update Product"
                : "Add Product"}
            </h2>

          </div>

          <button
            type="button"
            onClick={closeForm}
            disabled={
              saving ||
              uploading
            }
            style={
              styles.closeButton
            }
          >
            ×
          </button>
        </div>

        {/* ===============================================
            FORM
        =============================================== */}

        <form
          onSubmit={
            saveProduct
          }
          style={
            styles.form
          }
        >

          {/* =============================================
              BASIC INFORMATION
          ============================================= */}

          <div
            style={
              styles.formGrid
            }
          >

            {/* PRODUCT NAME */}

            <label
              style={
                styles.field
              }
            >
              <span
                style={
                  styles.label
                }
              >
                PRODUCT NAME
              </span>

              <input
                type="text"
                value={
                  form.name
                }
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter product name"
                style={
                  styles.input
                }
                required
              />
            </label>

            {/* SLUG */}

            <label
              style={
                styles.field
              }
            >
              <span
                style={
                  styles.label
                }
              >
                SLUG
              </span>

              <input
                type="text"
                value={
                  form.slug
                }
                onChange={(event) =>
                  updateField(
                    "slug",
                    event.target.value
                  )
                }
                placeholder="product-slug"
                style={
                  styles.input
                }
              />

              <small
                style={
                  styles.helperText
                }
              >
                Leave empty to
                generate automatically.
              </small>
            </label>

            {/* PRICE */}

            <label
              style={
                styles.field
              }
            >
              <span
                style={
                  styles.label
                }
              >
                PRICE
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.price
                }
                onChange={(event) =>
                  updateField(
                    "price",
                    event.target.value
                  )
                }
                placeholder="1299"
                style={
                  styles.input
                }
                required
              />

              <small
                style={
                  styles.helperText
                }
              >
                This price will be
                saved as both
                price and base_price.
              </small>
            </label>

            {/* STOCK */}

            <label
              style={
                styles.field
              }
            >
              <span
                style={
                  styles.label
                }
              >
                STOCK
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  form.stock
                }
                onChange={(event) =>
                  updateField(
                    "stock",
                    event.target.value
                  )
                }
                placeholder="10"
                style={
                  styles.input
                }
                required
              />
            </label>

            {/* CATEGORY */}

            <label
              style={
                styles.field
              }
            >
              <span
                style={
                  styles.label
                }
              >
                CATEGORY
              </span>

              <select
                value={
                  form.categoryId
                }
                onChange={(event) => {
                  const categoryId =
                    event.target.value;

                  const selectedCategory =
                    categories.find(
                      (item) =>
                        item.id ===
                        categoryId
                    );

                  setForm((current) => ({
                    ...current,
                    categoryId,
                    category:
                      selectedCategory?.name ||
                      "",
                  }));
                }}
                disabled={
                  categoriesLoading ||
                  categories.length === 0
                }
                style={
                  styles.input
                }
              >
                {categories.length === 0 ? (
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "No active categories"}
                  </option>
                ) : (
                  categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )
                )}
              </select>

              <small
                style={
                  styles.helperText
                }
              >
                Supabase categories are
                shown first. Default VORN
                categories are also available
                if they are not in Supabase.
              </small>
            </label>

          </div>

          {/* =============================================
              DESCRIPTION
          ============================================= */}

          <label
            style={
              styles.field
            }
          >
            <span
              style={
                styles.label
              }
            >
              DESCRIPTION
            </span>

            <textarea
              value={
                form.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe this product..."
              rows={6}
              style={
                styles.textarea
              }
            />
          </label>

          {/* =============================================
              IMAGE UPLOAD
          ============================================= */}

          <div
            style={
              styles.imageSection
            }
          >

            <div
              style={
                styles.imageSectionHeader
              }
            >
              <div>

                <span
                  style={
                    styles.label
                  }
                >
                  PRODUCT IMAGES
                </span>

                <p
                  style={
                    styles.imageHint
                  }
                >
                  Upload one or more
                  product images.
                </p>

              </div>

              <label
                style={
                  styles.uploadButton
                }
              >
                {uploading
                  ? "UPLOADING..."
                  : "UPLOAD IMAGES"}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    handleImageUpload
                  }
                  disabled={
                    uploading ||
                    saving
                  }
                  style={
                    styles.hiddenInput
                  }
                />
              </label>
            </div>

            {/* =========================================
                IMAGE PREVIEW
            ========================================= */}

            {images.length > 0 ? (
              <div
                style={
                  styles.imageGrid
                }
              >
                {images.map(
                  (
                    image,
                    index
                  ) => (
                    <div
                      key={`${image}-${index}`}
                      style={
                        styles.imageCard
                      }
                    >

                      <div
                        style={
                          styles.imageWrapper
                        }
                      >

                        <img
                          src={image}
                          alt={
                            form.name ||
                            "Product"
                          }
                          style={
                            styles.previewImage
                          }
                        />

                        {selectedMainImage ===
                          image && (
                          <span
                            style={
                              styles.mainBadge
                            }
                          >
                            MAIN
                          </span>
                        )}

                      </div>

                      <div
                        style={
                          styles.imageActions
                        }
                      >

                        <button
                          type="button"
                          onClick={() =>
                            makeMainImage(
                              image
                            )
                          }
                          style={
                            styles.smallButton
                          }
                        >
                          MAKE MAIN
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              image
                            )
                          }
                          style={
                            styles.deleteImageButton
                          }
                        >
                          REMOVE
                        </button>

                      </div>

                    </div>
                  )
                )}
              </div>
            ) : (
              <div
                style={
                  styles.emptyImages
                }
              >
                <span>
                  No product images
                  uploaded yet.
                </span>
              </div>
            )}

          </div>

          {/* =============================================
              FORM ACTIONS
          ============================================= */}

          <div
            style={
              styles.formActions
            }
          >

            <button
              type="button"
              onClick={
                closeForm
              }
              disabled={
                saving ||
                uploading
              }
              style={
                styles.secondaryButton
              }
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                uploading
              }
              style={
                styles.primaryButton
              }
            >
              {saving
                ? "SAVING..."
                : editingProduct
                ? "UPDATE PRODUCT"
                : "CREATE PRODUCT"}
            </button>

          </div>

        </form>

      </section>
    )}

    {/* ===================================================
        PRODUCTS TOOLBAR
    =================================================== */}

    <section
      style={
        styles.toolbar
      }
    >

      <div>
        <p
          style={
            styles.countText
          }
        >
          {filteredProducts.length}{" "}
          PRODUCT
          {filteredProducts.length !==
          1
            ? "S"
            : ""}
        </p>
      </div>

      <div
        style={
          styles.searchWrapper
        }
      >
        <input
          type="search"
          value={
            search
          }
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search products..."
          style={
            styles.searchInput
          }
        />
      </div>

    </section>
        {/* ===================================================
        PRODUCT LIST
    =================================================== */}

    <section
      style={
        styles.productsSection
      }
    >

      {loading ? (
        <div
          style={
            styles.loadingCard
          }
        >
          <p
            style={
              styles.loadingText
            }
          >
            Loading products...
          </p>
        </div>
      ) : filteredProducts.length ===
        0 ? (
        <div
          style={
            styles.emptyProducts
          }
        >
          <div
            style={
              styles.emptyProductIcon
            }
          >
            +
          </div>

          <h2
            style={
              styles.emptyProductTitle
            }
          >
            No Products Found
          </h2>

          <p
            style={
              styles.emptyProductText
            }
          >
            {search
              ? "No products match your search."
              : "Start building your VORN catalog by adding your first product."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={
                openAddForm
              }
              style={
                styles.primaryButton
              }
            >
              ADD FIRST PRODUCT
            </button>
          )}
        </div>
      ) : (
        <div
          style={
            styles.productsGrid
          }
        >

          {filteredProducts.map(
            (product) => {

              // =========================================
              // PRICE
              // =========================================

              const productPrice =
                Number(
                  product.price ??
                    product.base_price ??
                    product.sale_price ??
                    0
                );

              // =========================================
              // STOCK
              // =========================================

              const productStock =
                Number(
                  product.stock || 0
                );

              // =========================================
              // IMAGES
              // =========================================

              const productImages =
                getImages(
                  product
                );

              const mainImage =
                productImages[0] ||
                product.image_url ||
                "";

              // =========================================
              // STATUS
              // =========================================

              const isActive =
                Boolean(
                  product.is_active
                );

              // =========================================
              // STOCK STATUS
              // =========================================

              let stockLabel =
                "IN STOCK";

              let stockStyle =
                styles.stockActive;

              if (
                productStock <=
                0
              ) {
                stockLabel =
                  "OUT OF STOCK";

                stockStyle =
                  styles.stockOut;
              } else if (
                productStock <=
                5
              ) {
                stockLabel =
                  "LOW STOCK";

                stockStyle =
                  styles.stockLow;
              }

              return (
                <article
                  key={
                    product.id
                  }
                  style={
                    styles.productCard
                  }
                >

                  {/* =====================================
                      PRODUCT IMAGE
                  ===================================== */}

                  <div
                    style={
                      styles.productImageWrapper
                    }
                  >

                    {mainImage ? (
                      <img
                        src={
                          mainImage
                        }
                        alt={
                          product.name ||
                          "VORN Product"
                        }
                        style={
                          styles.productImage
                        }
                      />
                    ) : (
                      <div
                        style={
                          styles.productImagePlaceholder
                        }
                      >
                        VORN
                      </div>
                    )}

                    {/* STATUS BADGE */}

                    <span
                      style={{
                        ...styles.statusBadge,

                        ...(isActive
                          ? styles.statusActive
                          : styles.statusInactive),
                      }}
                    >
                      {isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>

                  </div>

                  {/* =====================================
                      PRODUCT CONTENT
                  ===================================== */}

                  <div
                    style={
                      styles.productContent
                    }
                  >

                    {/* CATEGORY */}

                    <p
                      style={
                        styles.productCategory
                      }
                    >
                      {product.category ||
                        categories.find(
                          (item) =>
                            item.id ===
                            product.category_id
                        )?.name ||
                        "Uncategorized"}
                    </p>

                    {/* NAME */}

                    <h2
                      style={
                        styles.productName
                      }
                    >
                      {product.name ||
                        "Untitled Product"}
                    </h2>

                    {/* SLUG */}

                    <p
                      style={
                        styles.productSlug
                      }
                    >
                      /
                      {product.slug ||
                        "no-slug"}
                    </p>

                    {/* =================================
                        PRICE + STOCK
                    ================================= */}

                    <div
                      style={
                        styles.productMeta
                      }
                    >

                      <div>
                        <p
                          style={
                            styles.metaLabel
                          }
                        >
                          PRICE
                        </p>

                        <p
                          style={
                            styles.productPrice
                          }
                        >
                          {formatPrice(
                            productPrice
                          )}
                        </p>
                      </div>

                      <div
                        style={
                          styles.stockBox
                        }
                      >
                        <p
                          style={
                            styles.metaLabel
                          }
                        >
                          STOCK
                        </p>

                        <p
                          style={
                            stockStyle
                          }
                        >
                          {productStock}
                        </p>

                        <span
                          style={
                            stockStyle
                          }
                        >
                          {stockLabel}
                        </span>
                      </div>

                    </div>

                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <div
                      style={
                        styles.productActions
                      }
                    >

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() =>
                          viewProduct(
                            product
                          )
                        }
                        style={
                          styles.viewButton
                        }
                      >
                        VIEW
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(
                            product
                          )
                        }
                        style={
                          styles.editButton
                        }
                      >
                        EDIT
                      </button>

                      {/* ACTIVE / INACTIVE */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleProductStatus(
                            product
                          )
                        }
                        style={{
                          ...styles.statusButton,

                          ...(isActive
                            ? styles.deactivateButton
                            : styles.activateButton),
                        }}
                      >
                        {isActive
                          ? "HIDE"
                          : "SHOW"}
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          deleteProduct(
                            product
                          )
                        }
                        style={
                          styles.deleteButton
                        }
                      >
                        DELETE
                      </button>

                    </div>

                  </div>
                </article>
              );
            }
          )}

        </div>
      )}

    </section>

  </main>
);
}
// =========================================================
// STYLES
// =========================================================

const styles = {
  // =======================================================
  // PAGE
  // =======================================================

  page: {
    minHeight: "80vh",
    padding: "70px 30px 100px",
    background: "#f8f8f8",
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto 35px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "30px",
  },

  eyebrow: {
    margin: "0 0 10px",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "3px",
    color: "#777",
  },

  title: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "46px",
    fontWeight: "400",
    lineHeight: "1.1",
    color: "#111",
  },

  subtitle: {
    margin: "12px 0 0",
    maxWidth: "520px",
    fontSize: "13px",
    lineHeight: "1.7",
    color: "#777",
  },

  // =======================================================
  // BUTTONS
  // =======================================================

  primaryButton: {
    flexShrink: 0,
    padding: "14px 22px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.3px",
  },

  secondaryButton: {
    padding: "14px 22px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.3px",
  },

  // =======================================================
  // MESSAGES
  // =======================================================

  errorMessage: {
    width: "100%",
    maxWidth: "1250px",
    boxSizing: "border-box",
    margin: "0 auto 20px",
    padding: "14px 18px",
    border: "1px solid #e4b4b4",
    background: "#fff7f7",
    color: "#a02020",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  successMessage: {
    width: "100%",
    maxWidth: "1250px",
    boxSizing: "border-box",
    margin: "0 auto 20px",
    padding: "14px 18px",
    border: "1px solid #c8ddc8",
    background: "#f7fff7",
    color: "#286328",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  // =======================================================
  // FORM SECTION
  // =======================================================

  formSection: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto 35px",
    padding: "30px",
    boxSizing: "border-box",
    border: "1px solid #e2e2e2",
    background: "#fff",
  },

  formHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "24px",
    marginBottom: "30px",
    borderBottom: "1px solid #eeeeee",
  },

  formEyebrow: {
    margin: "0 0 8px",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "2px",
    color: "#777",
  },

  formTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "30px",
    fontWeight: "400",
    color: "#111",
  },

  closeButton: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "22px",
    lineHeight: "1",
  },

  // =======================================================
  // FORM
  // =======================================================

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "26px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    display: "block",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1.4px",
    color: "#555",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #d8d8d8",
    outline: "none",
    background: "#fff",
    color: "#111",
    fontSize: "13px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "140px",
    padding: "14px",
    border: "1px solid #d8d8d8",
    outline: "none",
    resize: "vertical",
    background: "#fff",
    color: "#111",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  helperText: {
    margin: 0,
    fontSize: "10px",
    lineHeight: "1.5",
    color: "#999",
  },

  // =======================================================
  // IMAGE SECTION
  // =======================================================

  imageSection: {
    padding: "24px",
    border: "1px solid #e5e5e5",
    background: "#fafafa",
  },

  imageSectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },

  imageHint: {
    margin: "6px 0 0",
    fontSize: "11px",
    color: "#888",
  },

  uploadButton: {
    position: "relative",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  hiddenInput: {
    position: "absolute",
    width: "1px",
    height: "1px",
    opacity: 0,
    pointerEvents: "none",
  },

  // =======================================================
  // IMAGE GRID
  // =======================================================

  imageGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
  },

  imageCard: {
    minWidth: 0,
    border: "1px solid #e2e2e2",
    background: "#fff",
  },

  imageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    background: "#f1f1f1",
  },

  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  mainBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    padding: "5px 7px",
    background: "#111",
    color: "#fff",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  imageActions: {
    display: "flex",
    gap: "6px",
    padding: "8px",
  },

  smallButton: {
    flex: 1,
    padding: "8px 5px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "7px",
    fontWeight: "600",
    letterSpacing: "0.7px",
  },

  deleteImageButton: {
    flex: 1,
    padding: "8px 5px",
    border: "1px solid #c9c9c9",
    background: "#fff",
    color: "#777",
    cursor: "pointer",
    fontSize: "7px",
    fontWeight: "600",
    letterSpacing: "0.7px",
  },

  emptyImages: {
    minHeight: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed #d5d5d5",
    background: "#fff",
    color: "#999",
    fontSize: "12px",
  },

  // =======================================================
  // FORM ACTIONS
  // =======================================================

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "5px",
  },

  // =======================================================
  // TOOLBAR
  // =======================================================

  toolbar: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  countText: {
    margin: 0,
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#777",
  },

  searchWrapper: {
    width: "300px",
    maxWidth: "100%",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d8d8d8",
    outline: "none",
    background: "#fff",
    color: "#111",
    fontSize: "12px",
  },

  // =======================================================
  // PRODUCTS SECTION
  // =======================================================

  productsSection: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto",
  },

  // =======================================================
  // PRODUCTS GRID
  // =======================================================

  productsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "20px",
  },

  // =======================================================
  // PRODUCT CARD
  // =======================================================

  productCard: {
    minWidth: 0,
    overflow: "hidden",
    border: "1px solid #e2e2e2",
    background: "#fff",
  },

  productImageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "4 / 5",
    overflow: "hidden",
    background: "#f1f1f1",
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  productImagePlaceholder: {
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

  // =======================================================
  // STATUS BADGE
  // =======================================================

  statusBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "6px 9px",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  statusActive: {
    background: "#111",
    color: "#fff",
  },

  statusInactive: {
    background: "#ddd",
    color: "#555",
  },

  // =======================================================
  // PRODUCT CONTENT
  // =======================================================

  productContent: {
    padding: "20px",
  },

  productCategory: {
    margin: "0 0 7px",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "1.8px",
    color: "#777",
    textTransform: "uppercase",
  },

  productName: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    fontWeight: "400",
    lineHeight: "1.35",
    color: "#111",
  },

  productSlug: {
    margin: "7px 0 0",
    fontSize: "9px",
    color: "#999",
    wordBreak: "break-all",
  },

  // =======================================================
  // PRODUCT META
  // =======================================================

  productMeta: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #eeeeee",
  },

  metaLabel: {
    margin: "0 0 5px",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "1px",
    color: "#999",
  },

  productPrice: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#111",
  },

  stockBox: {
    textAlign: "right",
  },

  stockActive: {
    margin: 0,
    fontSize: "12px",
    color: "#286328",
  },

  stockLow: {
    margin: 0,
    fontSize: "12px",
    color: "#9a6700",
  },

  stockOut: {
    margin: 0,
    fontSize: "12px",
    color: "#a02020",
  },

  // =======================================================
  // PRODUCT ACTIONS
  // =======================================================

  productActions: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "6px",
    marginTop: "20px",
  },

  viewButton: {
    padding: "10px 5px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },

  editButton: {
    padding: "10px 5px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },

  statusButton: {
    padding: "10px 5px",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },

  activateButton: {
    border: "1px solid #286328",
    background: "#fff",
    color: "#286328",
  },

  deactivateButton: {
    border: "1px solid #777",
    background: "#fff",
    color: "#555",
  },

  deleteButton: {
    padding: "10px 5px",
    border: "1px solid #a02020",
    background: "#fff",
    color: "#a02020",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "600",
    letterSpacing: "0.8px",
  },
    // =======================================================
  // LOADING STATE
  // =======================================================

  loadingCard: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "280px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e2e2",
    background: "#fff",
  },

  loadingText: {
    margin: 0,
    fontSize: "12px",
    color: "#777",
    letterSpacing: "0.5px",
  },

  // =======================================================
  // EMPTY PRODUCTS
  // =======================================================

  emptyProducts: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "360px",
    padding: "60px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e2e2",
    background: "#fff",
    textAlign: "center",
  },

  emptyProductIcon: {
    width: "55px",
    height: "55px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d8d8d8",
    borderRadius: "50%",
    fontFamily: "Georgia, serif",
    fontSize: "28px",
    fontWeight: "300",
    color: "#555",
  },

  emptyProductTitle: {
    margin: "0 0 10px",
    fontFamily: "Georgia, serif",
    fontSize: "27px",
    fontWeight: "400",
    color: "#111",
  },

  emptyProductText: {
    maxWidth: "450px",
    margin: "0 0 25px",
    fontSize: "12px",
    lineHeight: "1.7",
    color: "#777",
  },

  // =======================================================
  // TABLET
  // =======================================================

  "@media (max-width: 1050px)": {
    page: {
      padding: "60px 22px 80px",
    },

    header: {
      maxWidth: "100%",
    },

    productsSection: {
      maxWidth: "100%",
    },

    toolbar: {
      maxWidth: "100%",
    },

    formSection: {
      maxWidth: "100%",
    },

    productsGrid: {
      gridTemplateColumns:
        "repeat(2, minmax(0, 1fr))",
    },

    imageGrid: {
      gridTemplateColumns:
        "repeat(3, minmax(0, 1fr))",
    },
  },

  // =======================================================
  // MOBILE
  // =======================================================

  "@media (max-width: 700px)": {
    page: {
      padding: "45px 15px 70px",
    },

    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "22px",
      marginBottom: "28px",
    },

    title: {
      fontSize: "38px",
    },

    subtitle: {
      fontSize: "12px",
    },

    primaryButton: {
      width: "100%",
      padding: "14px 18px",
    },

    secondaryButton: {
      flex: 1,
    },

    formSection: {
      padding: "20px 16px",
    },

    formHeader: {
      marginBottom: "22px",
      paddingBottom: "18px",
    },

    formTitle: {
      fontSize: "26px",
    },

    formGrid: {
      gridTemplateColumns:
        "1fr",
      gap: "16px",
    },

    imageSection: {
      padding: "18px 14px",
    },

    imageSectionHeader: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    uploadButton: {
      width: "100%",
      boxSizing: "border-box",
    },

    imageGrid: {
      gridTemplateColumns:
        "repeat(2, minmax(0, 1fr))",
      gap: "10px",
    },

    formActions: {
      flexDirection: "column-reverse",
    },

    formActions: {
      gap: "8px",
    },

    toolbar: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: "12px",
    },

    searchWrapper: {
      width: "100%",
    },

    searchInput: {
      width: "100%",
    },

    productsGrid: {
      gridTemplateColumns:
        "1fr",
      gap: "15px",
    },

    productContent: {
      padding: "17px",
    },

    productName: {
      fontSize: "19px",
    },

    productActions: {
      gridTemplateColumns:
        "repeat(2, minmax(0, 1fr))",
      gap: "7px",
    },

    viewButton: {
      padding: "11px 6px",
    },

    editButton: {
      padding: "11px 6px",
    },

    statusButton: {
      padding: "11px 6px",
    },

    deleteButton: {
      padding: "11px 6px",
    },
  },
    // =======================================================
  // SMALL MOBILE
  // =======================================================

  "@media (max-width: 480px)": {
    page: {
      padding: "38px 12px 60px",
    },

    eyebrow: {
      fontSize: "8px",
      letterSpacing: "2.5px",
    },

    title: {
      fontSize: "32px",
    },

    subtitle: {
      fontSize: "11px",
      lineHeight: "1.6",
    },

    formSection: {
      padding: "17px 12px",
    },

    formTitle: {
      fontSize: "23px",
    },

    closeButton: {
      width: "32px",
      height: "32px",
      fontSize: "19px",
    },

    input: {
      padding: "12px",
      fontSize: "12px",
    },

    textarea: {
      padding: "12px",
      fontSize: "12px",
    },

    imageSection: {
      padding: "15px 10px",
    },

    imageGrid: {
      gridTemplateColumns:
        "repeat(2, minmax(0, 1fr))",
      gap: "8px",
    },

    imageActions: {
      flexDirection: "column",
      gap: "5px",
    },

    smallButton: {
      width: "100%",
      padding: "8px 4px",
    },

    deleteImageButton: {
      width: "100%",
      padding: "8px 4px",
    },

    productContent: {
      padding: "15px",
    },

    productCategory: {
      fontSize: "7px",
      letterSpacing: "1.5px",
    },

    productName: {
      fontSize: "18px",
    },

    productSlug: {
      fontSize: "8px",
    },

    productMeta: {
      marginTop: "16px",
      paddingTop: "13px",
    },

    productPrice: {
      fontSize: "14px",
    },

    stockActive: {
      fontSize: "11px",
    },

    stockLow: {
      fontSize: "11px",
    },

    stockOut: {
      fontSize: "11px",
    },

    productActions: {
      gridTemplateColumns:
        "repeat(2, minmax(0, 1fr))",
      gap: "6px",
      marginTop: "16px",
    },

    viewButton: {
      padding: "10px 4px",
      fontSize: "7px",
    },

    editButton: {
      padding: "10px 4px",
      fontSize: "7px",
    },

    statusButton: {
      padding: "10px 4px",
      fontSize: "7px",
    },

    deleteButton: {
      padding: "10px 4px",
      fontSize: "7px",
    },

    emptyProducts: {
      minHeight: "300px",
      padding: "45px 18px",
    },

    emptyProductIcon: {
      width: "48px",
      height: "48px",
      fontSize: "24px",
    },

    emptyProductTitle: {
      fontSize: "23px",
    },

    emptyProductText: {
      fontSize: "11px",
    },

    loadingCard: {
      minHeight: "240px",
    },
  },

  // =======================================================
  // EXTRA SMALL MOBILE
  // =======================================================

  "@media (max-width: 360px)": {
    page: {
      paddingLeft: "9px",
      paddingRight: "9px",
    },

    title: {
      fontSize: "29px",
    },

    formSection: {
      padding: "14px 10px",
    },

    imageSection: {
      padding: "13px 8px",
    },

    imageGrid: {
      gridTemplateColumns:
        "1fr 1fr",
      gap: "6px",
    },

    productContent: {
      padding: "13px",
    },

    productActions: {
      gap: "5px",
    },

    viewButton: {
      fontSize: "6.5px",
      letterSpacing: "0.4px",
    },

    editButton: {
      fontSize: "6.5px",
      letterSpacing: "0.4px",
    },

    statusButton: {
      fontSize: "6.5px",
      letterSpacing: "0.4px",
    },

    deleteButton: {
      fontSize: "6.5px",
      letterSpacing: "0.4px",
    },
  },

  // =======================================================
  // ACCESSIBILITY / FOCUS
  // =======================================================

  focusInput: {
    outline: "none",
  },

  // =======================================================
  // END OF STYLES
  // =======================================================
};