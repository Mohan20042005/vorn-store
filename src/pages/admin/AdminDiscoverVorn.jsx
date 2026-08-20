import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

const DEFAULT_DATA = {
  eyebrow: "DISCOVER VORN",
  title: "DRESS WITHOUT LIMITS.",
  description:
    "VORN is built around confident everyday fashion. Our collections focus on clean silhouettes, strong identity and pieces that fit naturally into your wardrobe.",
  image_url: "",
  button_text: "SHOP VORN",
  button_link: "/shop",
};

export default function AdminDiscoverVorn() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("discover_vorn_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setForm({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          button_text: data.button_text || "",
          button_link: data.button_link || "",
        });
      }
    } catch (error) {
      console.error("Discover VORN load error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to load Discover VORN settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setErrorMessage("");

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file.");
      }

      const maxSize = 8 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Image size must be less than 8MB."
        );
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const fileName = `discover-vorn-${Date.now()}.${extension}`;

      const filePath = `discover-vorn/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("site-assets")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData?.publicUrl || "";

      if (!publicUrl) {
        throw new Error(
          "Unable to create image URL."
        );
      }

      setForm((current) => ({
        ...current,
        image_url: publicUrl,
      }));

      setMessage(
        "Image uploaded. Click SAVE DISCOVER VORN to apply it."
      );
    } catch (error) {
      console.error(
        "Discover VORN image upload error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function removeImage() {
    try {
      setMessage("");
      setErrorMessage("");

      if (!form.image_url) {
        return;
      }

      const marker =
        "/storage/v1/object/public/site-assets/";

      const markerIndex =
        form.image_url.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath = decodeURIComponent(
          form.image_url.slice(
            markerIndex + marker.length
          )
        );

        if (
          filePath.startsWith("discover-vorn/")
        ) {
          const { error } =
            await supabase.storage
              .from("site-assets")
              .remove([filePath]);

          if (error) {
            console.warn(
              "Unable to remove old image:",
              error
            );
          }
        }
      }

      setForm((current) => ({
        ...current,
        image_url: "",
      }));

      setMessage(
        "Image removed. Click SAVE DISCOVER VORN to save."
      );
    } catch (error) {
      console.error(
        "Discover VORN remove image error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to remove image."
      );
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const payload = {
        id: SETTINGS_ID,
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        image_url: form.image_url || null,
        button_text: form.button_text.trim(),
        button_link: form.button_link.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("discover_vorn_settings")
        .upsert(payload, {
          onConflict: "id",
        });

      if (error) {
        throw error;
      }

      setMessage(
        "Discover VORN saved successfully."
      );
    } catch (error) {
      console.error(
        "Discover VORN save error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to save Discover VORN."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.centerPage}>
        <p style={styles.eyebrow}>
          VORN ADMIN
        </p>

        <h1 style={styles.loadingTitle}>
          Loading Discover VORN...
        </h1>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      {/* ================= HEADER ================= */}

      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            DISCOVER VORN
          </p>

          <h1 style={styles.title}>
            Discover VORN
          </h1>

          <p style={styles.subtitle}>
            Control the Discover VORN section
            from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          style={{
            ...styles.saveButton,
            ...(saving
              ? styles.disabledButton
              : {}),
          }}
        >
          {saving
            ? "SAVING..."
            : "SAVE DISCOVER VORN"}
        </button>
      </header>

      {/* ================= MESSAGE ================= */}

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

      {/* ================= CONTENT ================= */}

      <section style={styles.card}>
        <p style={styles.sectionEyebrow}>
          CONTENT
        </p>

        <h2 style={styles.sectionTitle}>
          Discover VORN content
        </h2>

        {/* EYEBROW */}

        <div style={styles.field}>
          <label style={styles.label}>
            Eyebrow
          </label>

          <input
            type="text"
            value={form.eyebrow}
            onChange={(event) =>
              updateField(
                "eyebrow",
                event.target.value
              )
            }
            style={styles.input}
            placeholder="DISCOVER VORN"
          />
        </div>

        {/* TITLE */}

        <div style={styles.field}>
          <label style={styles.label}>
            Title
          </label>

          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              updateField(
                "title",
                event.target.value
              )
            }
            style={styles.input}
            placeholder="DRESS WITHOUT LIMITS."
          />
        </div>

        {/* DESCRIPTION */}

        <div style={styles.field}>
          <label style={styles.label}>
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            style={styles.textarea}
            rows={6}
            placeholder="Enter Discover VORN description..."
          />
        </div>
      </section>

      {/* ================= IMAGE ================= */}

      <section style={styles.card}>
        <p style={styles.sectionEyebrow}>
          IMAGE
        </p>

        <h2 style={styles.sectionTitle}>
          Discover VORN image
        </h2>

        <p style={styles.helpText}>
          Upload one image for the Discover VORN
          section. URL input is not required.
        </p>

        {form.image_url ? (
          <div style={styles.imageBox}>
            <img
              src={form.image_url}
              alt="Discover VORN preview"
              style={styles.previewImage}
            />

            <div style={styles.imageActions}>
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                style={styles.blackButton}
              >
                {uploading
                  ? "UPLOADING..."
                  : "CHANGE IMAGE"}
              </button>

              <button
                type="button"
                onClick={removeImage}
                disabled={uploading}
                style={styles.removeButton}
              >
                REMOVE
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.uploadBox}>
            <div style={styles.uploadIcon}>
              +
            </div>

            <h3 style={styles.uploadTitle}>
              No image selected
            </h3>

            <p style={styles.uploadText}>
              Upload a JPG, PNG or WebP image.
            </p>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
              style={styles.blackButton}
            >
              {uploading
                ? "UPLOADING..."
                : "CHOOSE IMAGE"}
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </section>

      {/* ================= CTA ================= */}

      <section style={styles.card}>
        <p style={styles.sectionEyebrow}>
          CALL TO ACTION
        </p>

        <h2 style={styles.sectionTitle}>
          Button settings
        </h2>

        <div style={styles.twoColumns}>
          <div style={styles.field}>
            <label style={styles.label}>
              Button Text
            </label>

            <input
              type="text"
              value={form.button_text}
              onChange={(event) =>
                updateField(
                  "button_text",
                  event.target.value
                )
              }
              style={styles.input}
              placeholder="SHOP VORN"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Button Link
            </label>

            <input
              type="text"
              value={form.button_link}
              onChange={(event) =>
                updateField(
                  "button_link",
                  event.target.value
                )
              }
              style={styles.input}
              placeholder="/shop"
            />
          </div>
        </div>
      </section>

      {/* ================= SAVE ================= */}

      <section style={styles.bottomBar}>
        <div>
          <strong style={styles.bottomTitle}>
            Discover VORN content
          </strong>

          <p style={styles.bottomText}>
            Changes will be saved to your store
            settings.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          style={{
            ...styles.saveButton,
            ...(saving
              ? styles.disabledButton
              : {}),
          }}
        >
          {saving
            ? "SAVING..."
            : "SAVE DISCOVER VORN"}
        </button>
      </section>
    </main>
  );
}

/* ===================================================== */
/* STYLES */
/* ===================================================== */

const styles = {
  page: {
    minHeight: "75vh",
    padding: "70px 24px 100px",
    maxWidth: "1200px",
    margin: "0 auto",
    background: "#fff",
    color: "#111",
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

  saveButton: {
    padding: "14px 24px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    whiteSpace: "nowrap",
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  successBox: {
    padding: "14px 18px",
    marginBottom: "20px",
    border: "1px solid #cce8d7",
    background: "#f2fbf5",
    color: "#167044",
    fontSize: "13px",
  },

  errorBox: {
    padding: "14px 18px",
    marginBottom: "20px",
    border: "1px solid #f0caca",
    background: "#fff5f5",
    color: "#b42318",
    fontSize: "13px",
  },

  card: {
    border: "1px solid #e5e5e5",
    padding: "32px",
    marginBottom: "20px",
    background: "#fff",
  },

  sectionEyebrow: {
    margin: "0 0 8px",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "2px",
    color: "#888",
  },

  sectionTitle: {
    margin: "0 0 28px",
    fontFamily: "Georgia, serif",
    fontSize: "28px",
    fontWeight: "400",
  },

  field: {
    marginBottom: "24px",
  },

  label: {
    display: "block",
    marginBottom: "9px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    color: "#333",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    lineHeight: "1.7",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },

  helpText: {
    margin: "-15px 0 22px",
    color: "#888",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  imageBox: {
    border: "1px solid #e5e5e5",
    background: "#fafafa",
  },

  previewImage: {
    display: "block",
    width: "100%",
    maxHeight: "500px",
    objectFit: "cover",
  },

  imageActions: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    background: "#fff",
    borderTop: "1px solid #e5e5e5",
  },

  uploadBox: {
    minHeight: "320px",
    border: "1px dashed #ccc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
    background: "#fafafa",
  },

  uploadIcon: {
    width: "45px",
    height: "45px",
    border: "1px solid #111",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "18px",
  },

  uploadTitle: {
    margin: "0 0 8px",
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: "400",
  },

  uploadText: {
    margin: "0 0 20px",
    color: "#888",
    fontSize: "12px",
  },

  uploadButton: {
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    padding: "13px 20px",
    cursor: "pointer",
  },

  blackButton: {
    padding: "13px 20px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.2px",
  },

  removeButton: {
    padding: "13px 20px",
    border: "1px solid #d8baba",
    background: "#fff",
    color: "#b42318",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.2px",
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  bottomBar: {
    border: "1px solid #e5e5e5",
    padding: "25px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    background: "#fafafa",
  },

  bottomTitle: {
    display: "block",
    fontFamily: "Georgia, serif",
    fontSize: "18px",
    fontWeight: "400",
  },

  bottomText: {
    margin: "7px 0 0",
    color: "#888",
    fontSize: "12px",
  },
};