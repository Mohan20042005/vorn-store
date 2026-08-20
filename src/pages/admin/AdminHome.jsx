import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import AdminRoute from "../../components/AdminRoute";

export default function AdminHome() {
  return (
    <AdminRoute>
      <AdminHomeContent />
    </AdminRoute>
  );
}

function AdminHomeContent() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadHomeSettings();
  }, []);

  async function loadHomeSettings() {
    try {
      setLoading(true);
      setErrorMessage("");
      setMessage("");

      const { data, error } = await supabase
        .from("home_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Home settings record was not found."
        );
      }

      setSettings(data);
    } catch (error) {
      console.error(
        "Load home settings error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load homepage settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  async function uploadHomeImage(file, fieldName) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 5MB.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${fieldName}-${Date.now()}.${extension}`;
      const filePath = `homepage/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("home-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("home-images")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error("Unable to create public image URL.");
      }

      const { data, error } = await supabase
        .from("home_settings")
        .update({
          [fieldName]: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .select("*")
        .single();

      if (error) throw error;

      setSettings(data);
      setMessage(
        fieldName.startsWith("hero_image_")
          ? "Banner image uploaded successfully."
          : "Promo image uploaded successfully."
      );
    } catch (error) {
      console.error("Upload home image error:", error);
      setErrorMessage(error?.message || "Unable to upload image.");
    } finally {
      setSaving(false);
    }
  }

  async function removeHomeImage(fieldName) {
    if (!settings?.id || !settings?.[fieldName]) return;

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const imageUrl = settings[fieldName];

      const { data, error } = await supabase
        .from("home_settings")
        .update({
          [fieldName]: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .select("*")
        .single();

      if (error) throw error;

      const marker = "/storage/v1/object/public/home-images/";
      const markerIndex = imageUrl.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath = decodeURIComponent(
          imageUrl.slice(markerIndex + marker.length)
        );

        await supabase.storage
          .from("home-images")
          .remove([filePath]);
      }

      setSettings(data);
      setMessage("Image removed successfully.");
    } catch (error) {
      console.error("Remove home image error:", error);
      setErrorMessage(error?.message || "Unable to remove image.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!settings?.id) {
      setErrorMessage(
        "Homepage settings record is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const updateData = {
        hero_eyebrow:
          settings.hero_eyebrow?.trim() || "",
        hero_title:
          settings.hero_title?.trim() || "",
        hero_description:
          settings.hero_description?.trim() || "",
        hero_button_text:
          settings.hero_button_text?.trim() || "",
        hero_button_link:
          settings.hero_button_link?.trim() || "",
        hero_image_1_url:
          settings.hero_image_1_url || null,
        hero_image_2_url:
          settings.hero_image_2_url || null,
        hero_image_3_url:
          settings.hero_image_3_url || null,
        hero_image_4_url:
          settings.hero_image_4_url || null,

        promo_eyebrow:
          settings.promo_eyebrow?.trim() || "",
        promo_title:
          settings.promo_title?.trim() || "",
        promo_description:
          settings.promo_description?.trim() || "",
        promo_button_text:
          settings.promo_button_text?.trim() || "",
        promo_button_link:
          settings.promo_button_link?.trim() || "",
        promo_image_url:
          settings.promo_image_url || null,

        brand_title:
          settings.brand_title?.trim() || "",
        brand_description:
          settings.brand_description?.trim() || "",
        brand_link_text:
          settings.brand_link_text?.trim() || "",
        brand_link:
          settings.brand_link?.trim() || "",
        brand_image_url:
          settings.brand_image_url || null,

        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("home_settings")
        .update(updateData)
        .eq("id", settings.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      setSettings(data);

      setMessage(
        "Homepage settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Save home settings error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to save homepage settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <p style={styles.loadingText}>
          Loading homepage settings...
        </p>
      </main>
    );
  }

  if (!settings) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.errorBox}>
            {errorMessage ||
              "Homepage settings could not be loaded."}
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin")}
            style={styles.secondaryButton}
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* ============================================
            HEADER
        ============================================ */}

        <div style={styles.topBar}>
          <div>
            <p style={styles.eyebrow}>
              STORE MANAGEMENT
            </p>

            <h1 style={styles.title}>
              Home Page
            </h1>

            <p style={styles.subtitle}>
              Manage the main content displayed
              on your VORN homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin")}
            style={styles.backButton}
          >
            ← BACK TO DASHBOARD
          </button>
        </div>

        {/* ============================================
            MESSAGES
        ============================================ */}

        {message && (
          <div style={styles.successBox}>
            {message}
          </div>
        )}

        {errorMessage && (
          <div style={styles.errorBox}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* ==========================================
              HERO SECTION
          ========================================== */}

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionEyebrow}>
                  HOMEPAGE
                </p>

                <h2 style={styles.cardTitle}>
                  Hero Section
                </h2>
              </div>

              <span style={styles.sectionNumber}>
                01
              </span>
            </div>

            <div style={styles.divider} />

            <div style={styles.bannerGrid}>
              <ImageUploadField
                label="Banner Image 1"
                value={settings.hero_image_1_url}
                onUpload={(file) =>
                  uploadHomeImage(
                    file,
                    "hero_image_1_url"
                  )
                }
                onRemove={() =>
                  removeHomeImage(
                    "hero_image_1_url"
                  )
                }
                disabled={saving}
              />

              <ImageUploadField
                label="Banner Image 2"
                value={settings.hero_image_2_url}
                onUpload={(file) =>
                  uploadHomeImage(
                    file,
                    "hero_image_2_url"
                  )
                }
                onRemove={() =>
                  removeHomeImage(
                    "hero_image_2_url"
                  )
                }
                disabled={saving}
              />

              <ImageUploadField
                label="Banner Image 3"
                value={settings.hero_image_3_url}
                onUpload={(file) =>
                  uploadHomeImage(
                    file,
                    "hero_image_3_url"
                  )
                }
                onRemove={() =>
                  removeHomeImage(
                    "hero_image_3_url"
                  )
                }
                disabled={saving}
              />

              <ImageUploadField
                label="Banner Image 4"
                value={settings.hero_image_4_url}
                onUpload={(file) =>
                  uploadHomeImage(
                    file,
                    "hero_image_4_url"
                  )
                }
                onRemove={() =>
                  removeHomeImage(
                    "hero_image_4_url"
                  )
                }
                disabled={saving}
              />
            </div>

            <div style={{ height: "24px" }} />

            <div style={styles.formGrid}>
              <Field
                label="Eyebrow"
                name="hero_eyebrow"
                value={settings.hero_eyebrow}
                onChange={handleChange}
                placeholder="VORN / New Collection"
              />

              <Field
                label="Button Text"
                name="hero_button_text"
                value={settings.hero_button_text}
                onChange={handleChange}
                placeholder="Shop Collection"
              />

              <Field
                label="Hero Title"
                name="hero_title"
                value={settings.hero_title}
                onChange={handleChange}
                placeholder="Built To Be Seen"
                fullWidth
              />

              <TextAreaField
                label="Description"
                name="hero_description"
                value={settings.hero_description}
                onChange={handleChange}
                placeholder="Hero description..."
              />

              <Field
                label="Button Link"
                name="hero_button_link"
                value={settings.hero_button_link}
                onChange={handleChange}
                placeholder="/shop"
              />
            </div>
          </section>

          {/* ==========================================
              PROMO SECTION
          ========================================== */}

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionEyebrow}>
                  HOMEPAGE
                </p>

                <h2 style={styles.cardTitle}>
                  Promo Section
                </h2>
              </div>

              <span style={styles.sectionNumber}>
                02
              </span>
            </div>

            <div style={styles.divider} />

            <ImageUploadField
              label="Promo Image"
              value={settings.promo_image_url}
              onUpload={(file) =>
                uploadHomeImage(file, "promo_image_url")
              }
              onRemove={() =>
                removeHomeImage("promo_image_url")
              }
              disabled={saving}
            />

            <div style={{ height: "24px" }} />

            <div style={styles.formGrid}>
              <Field
                label="Eyebrow"
                name="promo_eyebrow"
                value={settings.promo_eyebrow}
                onChange={handleChange}
                placeholder="VORN / The Standard"
              />

              <Field
                label="Button Text"
                name="promo_button_text"
                value={settings.promo_button_text}
                onChange={handleChange}
                placeholder="Explore VORN"
              />

              <Field
                label="Promo Title"
                name="promo_title"
                value={settings.promo_title}
                onChange={handleChange}
                placeholder="Wear Your Statement"
                fullWidth
              />

              <TextAreaField
                label="Description"
                name="promo_description"
                value={settings.promo_description}
                onChange={handleChange}
                placeholder="Promo description..."
              />

              <Field
                label="Button Link"
                name="promo_button_link"
                value={settings.promo_button_link}
                onChange={handleChange}
                placeholder="/shop"
              />
            </div>
          </section>

          {/* ==========================================
              BRAND SECTION
          ========================================== */}

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionEyebrow}>
                  HOMEPAGE
                </p>

                <h2 style={styles.cardTitle}>
                  Brand Section
                </h2>
              </div>

              <span style={styles.sectionNumber}>
                03
              </span>
            </div>

            <div style={styles.divider} />

            <ImageUploadField
              label="Brand Image"
              value={settings.brand_image_url}
              onUpload={(file) =>
                uploadHomeImage(file, "brand_image_url")
              }
              onRemove={() =>
                removeHomeImage("brand_image_url")
              }
              disabled={saving}
            />

            <div style={{ height: "24px" }} />

            <div style={styles.formGrid}>
              <Field
                label="Brand Title"
                name="brand_title"
                value={settings.brand_title}
                onChange={handleChange}
                placeholder="More Than A Label."
                fullWidth
              />

              <TextAreaField
                label="Brand Description"
                name="brand_description"
                value={settings.brand_description}
                onChange={handleChange}
                placeholder="Brand description..."
                fullWidth
              />

              <Field
                label="Link Text"
                name="brand_link_text"
                value={settings.brand_link_text}
                onChange={handleChange}
                placeholder="Discover VORN"
              />

              <Field
                label="Link"
                name="brand_link"
                value={settings.brand_link}
                onChange={handleChange}
                placeholder="/about"
              />
            </div>
          </section>

          {/* ==========================================
              SAVE BAR
          ========================================== */}

          <div style={styles.saveBar}>
            <div>
              <p style={styles.saveTitle}>
                Homepage content
              </p>

              <p style={styles.saveDescription}>
                Changes will be saved to your store
                settings.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.65 : 1,
              }}
            >
              {saving
                ? "SAVING..."
                : "SAVE HOMEPAGE"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* =====================================================
   IMAGE UPLOAD COMPONENT
===================================================== */

function ImageUploadField({
  label,
  value,
  onUpload,
  onRemove,
  disabled = false,
}) {
  return (
    <div style={styles.imageField}>
      <div style={styles.imageFieldHeader}>
        <span style={styles.label}>{label}</span>
        <span style={styles.imageHint}>
          JPG, PNG, WEBP • Max 5MB
        </span>
      </div>

      {value ? (
        <div style={styles.imagePreviewWrap}>
          <img
            src={value}
            alt={label}
            style={styles.imagePreview}
          />

          <div style={styles.imageActions}>
            <label
              style={{
                ...styles.uploadButton,
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? "none" : "auto",
              }}
            >
              CHANGE IMAGE
              <input
                type="file"
                accept="image/*"
                disabled={disabled}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(file);
                  event.target.value = "";
                }}
                style={styles.hiddenFileInput}
              />
            </label>

            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              style={{
                ...styles.removeButton,
                opacity: disabled ? 0.6 : 1,
              }}
            >
              REMOVE
            </button>
          </div>
        </div>
      ) : (
        <label
          style={{
            ...styles.uploadEmpty,
            opacity: disabled ? 0.6 : 1,
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          <span style={styles.uploadEmptyTitle}>
            UPLOAD IMAGE
          </span>

          <span style={styles.uploadEmptyText}>
            Click to choose a banner image from your computer.
          </span>

          <input
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = "";
            }}
            style={styles.hiddenFileInput}
          />
        </label>
      )}
    </div>
  );
}

/* =====================================================
   FIELD COMPONENT
===================================================== */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  fullWidth = false,
}) {
  return (
    <label
      style={{
        ...styles.field,
        ...(fullWidth
          ? styles.fullWidth
          : {}),
      }}
    >
      <span style={styles.label}>
        {label}
      </span>

      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  );
}

/* =====================================================
   TEXTAREA COMPONENT
===================================================== */

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  fullWidth = false,
}) {
  return (
    <label
      style={{
        ...styles.field,
        ...(fullWidth
          ? styles.fullWidth
          : {}),
      }}
    >
      <span style={styles.label}>
        {label}
      </span>

      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={5}
        style={styles.textarea}
      />
    </label>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
  page: {
    minHeight: "70vh",
    background: "#fff",
    padding: "70px 24px 100px",
  },

  loadingPage: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
  },

  loadingText: {
    margin: 0,
    fontSize: "14px",
    color: "#666",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  topBar: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "30px",
    marginBottom: "45px",
  },

  eyebrow: {
    margin: "0 0 12px",
    fontSize: "10px",
    letterSpacing: "3px",
    fontWeight: "600",
    color: "#777",
  },

  title: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "42px",
    fontWeight: "500",
    color: "#111",
  },

  subtitle: {
    margin: "12px 0 0",
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#777",
  },

  backButton: {
    flexShrink: 0,
    padding: "13px 18px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    letterSpacing: "1.2px",
    fontWeight: "600",
  },

  successBox: {
    marginBottom: "22px",
    padding: "14px 16px",
    border: "1px solid #d5e6d8",
    background: "#f3f8f4",
    color: "#286238",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  errorBox: {
    marginBottom: "22px",
    padding: "14px 16px",
    border: "1px solid #eccfcf",
    background: "#fff5f5",
    color: "#9b2222",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  card: {
    marginBottom: "25px",
    padding: "32px",
    border: "1px solid #e5e5e5",
    background: "#fff",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
  },

  sectionEyebrow: {
    margin: "0 0 8px",
    fontSize: "10px",
    letterSpacing: "2.5px",
    fontWeight: "600",
    color: "#888",
  },

  cardTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "27px",
    fontWeight: "500",
    color: "#111",
  },

  sectionNumber: {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    color: "#aaa",
  },

  divider: {
    height: "1px",
    background: "#ededed",
    margin: "25px 0 28px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "24px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    minWidth: 0,
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  label: {
    fontSize: "11px",
    letterSpacing: "0.7px",
    fontWeight: "600",
    color: "#333",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d7d7d7",
    outline: "none",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    fontFamily: "inherit",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d7d7d7",
    outline: "none",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    lineHeight: "1.6",
    fontFamily: "inherit",
    resize: "vertical",
  },

  bannerGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "10px",
  },

  imageField: {
    width: "100%",
  },

  imageFieldHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "10px",
  },

  imageHint: {
    fontSize: "10px",
    color: "#888",
    letterSpacing: "0.4px",
  },

  imagePreviewWrap: {
    border: "1px solid #dedede",
    background: "#fafafa",
    overflow: "hidden",
  },

  imagePreview: {
    display: "block",
    width: "100%",
    maxHeight: "420px",
    objectFit: "cover",
    background: "#f3f3f3",
  },

  imageActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px",
    borderTop: "1px solid #dedede",
    background: "#fff",
  },

  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "10px",
    letterSpacing: "1.2px",
    fontWeight: "600",
  },

  removeButton: {
    padding: "12px 16px",
    border: "1px solid #d7baba",
    background: "#fff",
    color: "#a00000",
    cursor: "pointer",
    fontSize: "10px",
    letterSpacing: "1.2px",
    fontWeight: "600",
  },

  uploadEmpty: {
    minHeight: "190px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    border: "1px dashed #cfcfcf",
    background: "#fafafa",
    cursor: "pointer",
    textAlign: "center",
  },

  uploadEmptyTitle: {
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontWeight: "600",
    color: "#111",
  },

  uploadEmptyText: {
    fontSize: "12px",
    color: "#777",
  },

  hiddenFileInput: {
    display: "none",
  },

  saveBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    padding: "24px 28px",
    border: "1px solid #dedede",
    background: "#fafafa",
  },

  saveTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#111",
  },

  saveDescription: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#777",
  },

  saveButton: {
    flexShrink: 0,
    padding: "16px 25px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontWeight: "600",
  },

  secondaryButton: {
    marginTop: "15px",
    padding: "13px 18px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    fontSize: "10px",
    letterSpacing: "1px",
    fontWeight: "600",
  },
};