import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

export default function AdminCategories() {
  const navigate = useNavigate();

  const emptyForm = {
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
    sort_order: 0,
  };

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", {
          ascending: true,
        })
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  // =====================================================
  // CREATE SLUG
  // =====================================================

  function createSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // =====================================================
  // NAME CHANGE
  // =====================================================

  function handleNameChange(event) {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      name: value,

      ...(editingId
        ? {}
        : {
            slug: createSlug(value),
          }),
    }));
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  // =====================================================
  // EDIT CATEGORY
  // =====================================================

  function handleEdit(category) {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description:
        category.description || "",
      image_url:
        category.image_url || "",
      is_active:
        category.is_active ?? true,
      sort_order:
        category.sort_order ?? 0,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // CATEGORY IMAGE UPLOAD
  // =====================================================

  async function uploadCategoryImage(file) {
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Please upload a JPG, PNG, or WEBP image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "Category image must be smaller than 5MB."
      );
      return;
    }

    try {
      setSaving(true);

      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const filePath = `categories/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("home-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from("home-images")
        .getPublicUrl(filePath);

      const publicUrl =
        publicData?.publicUrl || "";

      if (!publicUrl) {
        throw new Error(
          "Unable to create public image URL."
        );
      }

      setForm((previous) => ({
        ...previous,
        image_url: publicUrl,
      }));

      setSuccessMessage(
        "Category image uploaded successfully."
      );
    } catch (error) {
      console.error(
        "Category image upload error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to upload category image."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // REMOVE CATEGORY IMAGE
  // =====================================================

  async function removeCategoryImage() {
    const currentUrl =
      form.image_url?.trim();

    if (!currentUrl) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const marker = "/storage/v1/object/public/home-images/";

      if (currentUrl.includes(marker)) {
        const filePath =
          currentUrl.split(marker)[1];

        if (filePath) {
          const { error } =
            await supabase.storage
              .from("home-images")
              .remove([filePath]);

          if (error) {
            throw error;
          }
        }
      }

      setForm((previous) => ({
        ...previous,
        image_url: "",
      }));

      setSuccessMessage(
        "Category image removed."
      );
    } catch (error) {
      console.error(
        "Category image remove error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to remove category image."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // SAVE CATEGORY
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const name = form.name.trim();
    const slug = form.slug.trim();

    if (!name) {
      setErrorMessage(
        "Please enter a category name."
      );
      return;
    }

    if (!slug) {
      setErrorMessage(
        "Please enter a category slug."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        slug,
        description:
          form.description.trim() || null,
        image_url:
          form.image_url.trim() || null,
        is_active:
          Boolean(form.is_active),
        sort_order:
          Number(form.sort_order) || 0,
      };

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {
        const {
          data,
          error,
        } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setCategories((previous) =>
          previous.map((category) =>
            category.id === editingId
              ? data
              : category
          )
        );

        setSuccessMessage(
          "Category updated successfully."
        );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        const {
          data,
          error,
        } = await supabase
          .from("categories")
          .insert([payload])
          .select()
          .single();

        if (error) {
          throw error;
        }

        setCategories((previous) => [
          ...previous,
          data,
        ]);

        setSuccessMessage(
          "Category created successfully."
        );
      }

      setForm({
        ...emptyForm,
      });

      setEditingId(null);
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Delete "${category.name}" category?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setErrorMessage("");
      setSuccessMessage("");

      const {
        error,
      } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (error) {
        throw error;
      }

      setCategories((previous) =>
        previous.filter(
          (item) =>
            item.id !== category.id
        )
      );

      if (editingId === category.id) {
        resetForm();
      }

      setSuccessMessage(
        "Category deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  async function handleToggleActive(
    category
  ) {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const newStatus =
        !category.is_active;

      const {
        data,
        error,
      } = await supabase
        .from("categories")
        .update({
          is_active: newStatus,
        })
        .eq("id", category.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCategories((previous) =>
        previous.map((item) =>
          item.id === category.id
            ? data
            : item
        )
      );

      setSuccessMessage(
        newStatus
          ? "Category activated."
          : "Category deactivated."
      );
    } catch (error) {
      console.error(
        "Toggle category error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to update category."
      );
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>
          Loading categories...
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              STORE MANAGEMENT
            </p>

            <h1 style={styles.title}>
              Categories
            </h1>

            <p style={styles.subtitle}>
              Manage your store categories
              and collections.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            style={styles.backButton}
          >
            ← BACK TO DASHBOARD
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <div style={styles.error}>
            {errorMessage}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMessage && (
          <div style={styles.success}>
            {successMessage}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <section style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <p
                style={
                  styles.sectionEyebrow
                }
              >
                {editingId
                  ? "EDIT CATEGORY"
                  : "NEW CATEGORY"}
              </p>

              <h2
                style={styles.formTitle}
              >
                {editingId
                  ? "Update category"
                  : "Add category"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={styles.cancelButton}
              >
                CANCEL
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >

            {/* NAME */}

            <label style={styles.label}>
              Category Name

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={
                  handleNameChange
                }
                placeholder="Men"
                style={styles.input}
                disabled={saving}
              />
            </label>

            {/* SLUG */}

            <label style={styles.label}>
              Slug

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="men"
                style={styles.input}
                disabled={saving}
              />
            </label>

            {/* DESCRIPTION */}

            <label
              style={{
                ...styles.label,
                gridColumn:
                  "1 / -1",
              }}
            >
              Description

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={handleChange}
                placeholder="Category description..."
                rows={4}
                style={styles.textarea}
                disabled={saving}
              />
            </label>

            {/* CATEGORY IMAGE */}

            <div
              style={{
                ...styles.label,
                gridColumn: "1 / -1",
              }}
            >
              <span>
                Category Image
              </span>

              <div style={styles.imageUploadBox}>
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt={
                      form.name ||
                      "Category preview"
                    }
                    style={
                      styles.imagePreview
                    }
                  />
                ) : (
                  <div
                    style={
                      styles.imageUploadPlaceholder
                    }
                  >
                    NO IMAGE
                  </div>
                )}

                <div
                  style={
                    styles.imageUploadActions
                  }
                >
                  <label
                    style={
                      styles.uploadButton
                    }
                  >
                    {form.image_url
                      ? "CHANGE IMAGE"
                      : "UPLOAD IMAGE"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0];

                        if (file) {
                          uploadCategoryImage(
                            file
                          );
                        }

                        event.target.value = "";
                      }}
                      disabled={saving}
                      style={
                        styles.hiddenFileInput
                      }
                    />
                  </label>

                  {form.image_url && (
                    <button
                      type="button"
                      onClick={
                        removeCategoryImage
                      }
                      disabled={saving}
                      style={
                        styles.removeImageButton
                      }
                    >
                      REMOVE IMAGE
                    </button>
                  )}
                </div>

                <p
                  style={
                    styles.imageHelp
                  }
                >
                  JPG, PNG or WEBP · Max 5MB
                </p>
              </div>
            </div>

            {/* SORT ORDER */}

            <label style={styles.label}>
              Sort Order

              <input
                type="number"
                name="sort_order"
                value={
                  form.sort_order
                }
                onChange={handleChange}
                min="0"
                style={styles.input}
                disabled={saving}
              />
            </label>

            {/* ACTIVE */}

            <label
              style={
                styles.checkboxLabel
              }
            >
              <input
                type="checkbox"
                name="is_active"
                checked={
                  form.is_active
                }
                onChange={handleChange}
                disabled={saving}
              />

              <span>
                Active category
              </span>
            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.submitButton,
                opacity: saving
                  ? 0.7
                  : 1,
              }}
            >
              {saving
                ? "SAVING..."
                : editingId
                ? "UPDATE CATEGORY"
                : "ADD CATEGORY"}
            </button>
          </form>
        </section>

        {/* =================================================
            CATEGORY LIST
        ================================================= */}

        <section
          style={styles.listSection}
        >
          <div
            style={styles.listHeader}
          >
            <div>
              <p
                style={
                  styles.sectionEyebrow
                }
              >
                COLLECTIONS
              </p>

              <h2
                style={styles.listTitle}
              >
                All Categories
              </h2>
            </div>

            <span
              style={styles.count}
            >
              {categories.length}{" "}
              {categories.length ===
              1
                ? "category"
                : "categories"}
            </span>
          </div>

          {/* EMPTY */}

          {categories.length === 0 ? (
            <div
              style={styles.empty}
            >
              <h3
                style={
                  styles.emptyTitle
                }
              >
                No categories yet
              </h3>

              <p
                style={
                  styles.emptyText
                }
              >
                Create your first
                category using the
                form above.
              </p>
            </div>
          ) : (
            <div
              style={
                styles.tableWrapper
              }
            >
              <table
                style={styles.table}
              >
                <thead>
                  <tr>
                    <th
                      style={styles.th}
                    >
                      CATEGORY
                    </th>

                    <th
                      style={styles.th}
                    >
                      SLUG
                    </th>

                    <th
                      style={styles.th}
                    >
                      ORDER
                    </th>

                    <th
                      style={styles.th}
                    >
                      STATUS
                    </th>

                    <th
                      style={{
                        ...styles.th,
                        textAlign:
                          "right",
                      }}
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (category) => (
                      <tr
                        key={
                          category.id
                        }
                        style={styles.tr}
                      >
                        {/* CATEGORY */}

                        <td
                          style={
                            styles.td
                          }
                        >
                          <div
                            style={
                              styles.categoryCell
                            }
                          >
                            {category.image_url ? (
                              <img
                                src={
                                  category.image_url
                                }
                                alt={
                                  category.name
                                }
                                style={
                                  styles.image
                                }
                              />
                            ) : (
                              <div
                                style={
                                  styles.imagePlaceholder
                                }
                              >
                                V
                              </div>
                            )}

                            <div>
                              <strong
                                style={
                                  styles.categoryName
                                }
                              >
                                {
                                  category.name
                                }
                              </strong>

                              {category.description && (
                                <p
                                  style={
                                    styles.description
                                  }
                                >
                                  {
                                    category.description
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SLUG */}

                        <td
                          style={
                            styles.td
                          }
                        >
                          <span
                            style={
                              styles.slug
                            }
                          >
                            {
                              category.slug
                            }
                          </span>
                        </td>

                        {/* SORT */}

                        <td
                          style={
                            styles.td
                          }
                        >
                          {
                            category.sort_order
                          }
                        </td>

                        {/* STATUS */}

                        <td
                          style={
                            styles.td
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleActive(
                                category
                              )
                            }
                            style={{
                              ...styles.status,
                              ...(category.is_active
                                ? styles.activeStatus
                                : styles.inactiveStatus),
                            }}
                          >
                            {category.is_active
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </button>
                        </td>

                        {/* ACTIONS */}

                        <td
                          style={{
                            ...styles.td,
                            textAlign:
                              "right",
                          }}
                        >
                          <div
                            style={
                              styles.actions
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  category
                                )
                              }
                              style={
                                styles.editButton
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                              disabled={
                                deletingId ===
                                category.id
                              }
                              style={
                                styles.deleteButton
                              }
                            >
                              {deletingId ===
                              category.id
                                ? "..."
                                : "DELETE"}
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
        </section>
      </div>
    </main>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "70vh",
    background: "#fff",
    padding:
      "70px 20px 100px",
  },

  container: {
    width: "100%",
    maxWidth: "1250px",
    margin: "0 auto",
  },

  loading: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "#666",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "40px",
  },

  eyebrow: {
    margin: "0 0 12px",
    fontSize: "11px",
    letterSpacing: "3px",
    fontWeight: "600",
    color: "#777",
  },

  title: {
    margin: 0,
    fontSize: "46px",
    fontFamily:
      "Georgia, serif",
    fontWeight: "500",
  },

  subtitle: {
    margin: "12px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  backButton: {
    padding:
      "13px 18px",
    background: "#fff",
    border:
      "1px solid #ccc",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing:
      "1.2px",
    whiteSpace:
      "nowrap",
  },

  error: {
    marginBottom: "20px",
    padding:
      "14px 16px",
    background: "#fff1f1",
    border:
      "1px solid #efcccc",
    color: "#9d1717",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  success: {
    marginBottom: "20px",
    padding:
      "14px 16px",
    background: "#f1f8f3",
    border:
      "1px solid #cfe3d3",
    color: "#276137",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  formCard: {
    border:
      "1px solid #e5e5e5",
    padding: "32px",
    marginBottom: "55px",
  },

  formHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    marginBottom: "28px",
  },

  sectionEyebrow: {
    margin: "0 0 8px",
    fontSize: "10px",
    letterSpacing:
      "2.5px",
    fontWeight: "600",
    color: "#777",
  },

  formTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "28px",
    fontWeight: "500",
  },

  cancelButton: {
    padding:
      "10px 16px",
    background: "#fff",
    border:
      "1px solid #ccc",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  form: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  label: {
    display: "flex",
    flexDirection:
      "column",
    gap: "8px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing:
      "0.6px",
  },

  input: {
    width: "100%",
    boxSizing:
      "border-box",
    padding:
      "13px 14px",
    border:
      "1px solid #d8d8d8",
    outline: "none",
    background: "#fff",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    boxSizing:
      "border-box",
    padding:
      "13px 14px",
    border:
      "1px solid #d8d8d8",
    outline: "none",
    background: "#fff",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
  },

  imageUploadBox: {
    border: "1px solid #e5e5e5",
    padding: "18px",
    background: "#fafafa",
  },

  imagePreview: {
    width: "100%",
    maxWidth: "420px",
    height: "220px",
    display: "block",
    objectFit: "cover",
    border: "1px solid #e0e0e0",
    background: "#fff",
  },

  imageUploadPlaceholder: {
    width: "100%",
    maxWidth: "420px",
    height: "220px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed #cfcfcf",
    background: "#fff",
    color: "#999",
    fontSize: "11px",
    letterSpacing: "1.5px",
  },

  imageUploadActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },

  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40px",
    padding: "0 15px",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  hiddenFileInput: {
    display: "none",
  },

  removeImageButton: {
    minHeight: "40px",
    padding: "0 15px",
    border: "1px solid #d7bebe",
    background: "#fff",
    color: "#9d2222",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  imageHelp: {
    margin: "10px 0 0",
    color: "#888",
    fontSize: "11px",
    fontWeight: "400",
    letterSpacing: "0.2px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems:
      "center",
    gap: "10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  submitButton: {
    padding: "15px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing:
      "1.5px",
  },

  listSection: {
    width: "100%",
  },

  listHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    marginBottom: "25px",
  },

  listTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "30px",
    fontWeight: "500",
  },

  count: {
    fontSize: "12px",
    color: "#777",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border:
      "1px solid #e5e5e5",
  },

  table: {
    width: "100%",
    minWidth: "850px",
    borderCollapse:
      "collapse",
  },

  th: {
    padding:
      "15px 18px",
    textAlign: "left",
    borderBottom:
      "1px solid #e5e5e5",
    background: "#fafafa",
    fontSize: "10px",
    letterSpacing:
      "1.5px",
    fontWeight: "600",
    color: "#777",
  },

  tr: {
    borderBottom:
      "1px solid #eeeeee",
  },

  td: {
    padding: "18px",
    verticalAlign:
      "middle",
    fontSize: "13px",
  },

  categoryCell: {
    display: "flex",
    alignItems:
      "center",
    gap: "14px",
  },

  image: {
    width: "52px",
    height: "52px",
    objectFit: "cover",
    border:
      "1px solid #e5e5e5",
  },

  imagePlaceholder: {
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    background: "#f5f5f5",
    border:
      "1px solid #e5e5e5",
    fontFamily:
      "Georgia, serif",
    fontSize: "20px",
  },

  categoryName: {
    display: "block",
    fontFamily:
      "Georgia, serif",
    fontSize: "17px",
    fontWeight: "500",
  },

  description: {
    maxWidth: "300px",
    margin: "5px 0 0",
    color: "#777",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  slug: {
    color: "#666",
    fontFamily:
      "monospace",
    fontSize: "12px",
  },

  status: {
    border: "none",
    padding:
      "7px 10px",
    cursor: "pointer",
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: "700",
  },

  activeStatus: {
    background: "#edf7ef",
    color: "#26703b",
  },

  inactiveStatus: {
    background: "#f3f3f3",
    color: "#777",
  },

  actions: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "8px",
  },

  editButton: {
    padding:
      "8px 12px",
    border:
      "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: "600",
  },

  deleteButton: {
    padding:
      "8px 12px",
    border:
      "1px solid #d7bebe",
    background: "#fff",
    color: "#9d2222",
    cursor: "pointer",
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: "600",
  },

  empty: {
    border:
      "1px solid #e5e5e5",
    padding:
      "70px 20px",
    textAlign: "center",
  },

  emptyTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "25px",
    fontWeight: "500",
  },

  emptyText: {
    margin: "10px 0 0",
    color: "#777",
    fontSize: "13px",
  },
};