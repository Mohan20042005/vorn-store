import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabaseClient";

function AdminInstagram() {
  const fileInputRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error?.message ||
          "Unable to load Instagram images."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setErrorMessage("");

      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Please select an image file."
        );
      }

      if (file.size > 8 * 1024 * 1024) {
        throw new Error(
          "Image must be smaller than 8MB."
        );
      }

      if (posts.length >= 4) {
        throw new Error(
          "Maximum 4 Instagram images allowed."
        );
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `instagram-${Date.now()}.${extension}`;

      const filePath =
        `posts/${fileName}`;

      // ==========================================
      // UPLOAD TO SUPABASE STORAGE
      // ==========================================

      const { error: uploadError } =
        await supabase.storage
          .from("discover-vorn")
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

      // ==========================================
      // GET PUBLIC IMAGE URL
      // ==========================================

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("discover-vorn")
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to get image URL."
        );
      }

      // ==========================================
      // SAVE IMAGE URL TO DATABASE
      // ==========================================

      const { error: insertError } =
        await supabase
          .from("instagram_posts")
          .insert({
            image_url: publicUrl,
            sort_order: posts.length,
          });

      if (insertError) {
        throw insertError;
      }

      setMessage(
        "Instagram image uploaded successfully."
      );

      await loadPosts();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error?.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function deletePost(post) {
    const confirmed = window.confirm(
      "Delete this Instagram image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      // ==========================================
      // GET STORAGE FILE PATH
      // ==========================================

      const marker =
        "/storage/v1/object/public/discover-vorn/";

      const markerIndex =
        post.image_url.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath =
          decodeURIComponent(
            post.image_url.slice(
              markerIndex + marker.length
            )
          );

        // ========================================
        // DELETE IMAGE FROM STORAGE
        // ========================================

        const { error: storageDeleteError } =
          await supabase.storage
            .from("discover-vorn")
            .remove([filePath]);

        if (storageDeleteError) {
          throw storageDeleteError;
        }
      }

      // ==========================================
      // DELETE DATABASE RECORD
      // ==========================================

      const { error } =
        await supabase
          .from("instagram_posts")
          .delete()
          .eq("id", post.id);

      if (error) {
        throw error;
      }

      setMessage(
        "Instagram image deleted."
      );

      await loadPosts();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error?.message ||
          "Unable to delete image."
      );
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main className="admin-instagram-loading">
        Loading Instagram images...
      </main>
    );
  }

  return (
    <>
      <style>{`

        /* =========================================
           PAGE
        ========================================= */

        .admin-instagram-page {
          min-height: 75vh;
          padding: 60px 24px 100px;
          max-width: 1200px;
          margin: 0 auto;
          background: #fff;
          color: #111;
        }

        /* =========================================
           HEADER
        ========================================= */

        .admin-instagram-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 35px;
        }

        .admin-instagram-eyebrow {
          margin: 0 0 10px;
          color: #777;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
        }

        .admin-instagram-title {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 48px;
          font-weight: 400;
        }

        .admin-instagram-subtitle {
          margin: 10px 0 0;
          color: #777;
          font-size: 14px;
        }

        /* =========================================
           UPLOAD BUTTON
        ========================================= */

        .admin-instagram-upload {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 22px;
          background: #111;
          color: #fff;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .admin-instagram-upload.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .admin-instagram-file {
          display: none;
        }

        /* =========================================
           SUCCESS MESSAGE
        ========================================= */

        .admin-instagram-message {
          margin-bottom: 25px;
          padding: 14px 16px;
          background: #f3fbf5;
          border: 1px solid #cde7d5;
          color: #177245;
          font-size: 13px;
        }

        /* =========================================
           ERROR MESSAGE
        ========================================= */

        .admin-instagram-error {
          margin-bottom: 25px;
          padding: 14px 16px;
          background: #fff5f5;
          border: 1px solid #efcccc;
          color: #b42318;
          font-size: 13px;
        }

        /* =========================================
           CARD
        ========================================= */

        .admin-instagram-card {
          padding: 30px;
          border: 1px solid #e5e5e5;
          background: #fff;
        }

        .admin-instagram-card-title {
          margin: 0 0 8px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
        }

        .admin-instagram-card-help {
          margin: 0 0 28px;
          color: #777;
          font-size: 13px;
          line-height: 1.6;
        }

        /* =========================================
           IMAGE GRID
        ========================================= */

        .admin-instagram-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .admin-instagram-item {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: #eee;
          border: 1px solid #ddd;
        }

        .admin-instagram-item img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* =========================================
           DELETE BUTTON
        ========================================= */

        .admin-instagram-delete {
          position: absolute;
          right: 10px;
          bottom: 10px;
          padding: 9px 12px;
          border: 0;
          background: #fff;
          color: #b42318;
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .admin-instagram-delete:hover {
          background: #111;
          color: #fff;
        }

        /* =========================================
           EMPTY STATE
        ========================================= */

        .admin-instagram-empty {
          padding: 70px 20px;
          text-align: center;
          border: 1px dashed #ccc;
          background: #fafafa;
        }

        .admin-instagram-empty-title {
          margin: 0 0 8px;
          font-family: Georgia, serif;
          font-size: 25px;
          font-weight: 400;
        }

        .admin-instagram-empty-text {
          margin: 0;
          color: #888;
          font-size: 13px;
        }

        /* =========================================
           COUNT
        ========================================= */

        .admin-instagram-count {
          margin-top: 25px;
          color: #888;
          font-size: 12px;
        }

        /* =========================================
           LOADING
        ========================================= */

        .admin-instagram-loading {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Georgia, serif;
          color: #555;
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 800px) {

          .admin-instagram-page {
            padding: 40px 18px 80px;
          }

          .admin-instagram-header {
            align-items: stretch;
            flex-direction: column;
          }

          .admin-instagram-upload {
            width: 100%;
          }

          .admin-instagram-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .admin-instagram-card {
            padding: 22px;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 480px) {

          .admin-instagram-title {
            font-size: 38px;
          }

          .admin-instagram-subtitle {
            font-size: 13px;
            line-height: 1.6;
          }

          .admin-instagram-grid {
            gap: 9px;
          }

          .admin-instagram-card {
            padding: 18px;
          }

          .admin-instagram-card-title {
            font-size: 24px;
          }

          .admin-instagram-empty {
            padding: 55px 15px;
          }

        }

      `}</style>

      <main className="admin-instagram-page">

        {/* ==========================================
            HEADER
        ========================================== */}

        <header className="admin-instagram-header">

          <div>

            <p className="admin-instagram-eyebrow">
              STORE CONTENT
            </p>

            <h1 className="admin-instagram-title">
              Instagram
            </h1>

            <p className="admin-instagram-subtitle">
              Manage the four images shown in the
              ON INSTAGRAM section.
            </p>

          </div>

          {/* ========================================
              UPLOAD
          ======================================== */}

          <label
            className={`admin-instagram-upload ${
              uploading ||
              posts.length >= 4
                ? "disabled"
                : ""
            }`}
          >

            {uploading
              ? "UPLOADING..."
              : "UPLOAD IMAGE"}

            <input
              ref={fileInputRef}
              className="admin-instagram-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              disabled={
                uploading ||
                posts.length >= 4
              }
            />

          </label>

        </header>

        {/* ==========================================
            SUCCESS
        ========================================== */}

        {message && (
          <div className="admin-instagram-message">
            {message}
          </div>
        )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {errorMessage && (
          <div className="admin-instagram-error">
            {errorMessage}
          </div>
        )}

        {/* ==========================================
            IMAGE CARD
        ========================================== */}

        <section className="admin-instagram-card">

          <h2 className="admin-instagram-card-title">
            Instagram Images
          </h2>

          <p className="admin-instagram-card-help">
            Upload up to 4 images. These will
            automatically appear in the ON INSTAGRAM
            section on your website.
          </p>

          {/* ========================================
              IMAGES
          ======================================== */}

          {posts.length > 0 ? (

            <div className="admin-instagram-grid">

              {posts.map((post) => (

                <div
                  key={post.id}
                  className="admin-instagram-item"
                >

                  <img
                    src={post.image_url}
                    alt={
                      post.caption ||
                      "Instagram post"
                    }
                  />

                  <button
                    type="button"
                    className="admin-instagram-delete"
                    onClick={() =>
                      deletePost(post)
                    }
                  >
                    DELETE
                  </button>

                </div>

              ))}

            </div>

          ) : (

            <div className="admin-instagram-empty">

              <h3 className="admin-instagram-empty-title">
                No images yet
              </h3>

              <p className="admin-instagram-empty-text">
                Upload your first VORN Instagram
                image using the button above.
              </p>

            </div>

          )}

          {/* ========================================
              COUNT
          ======================================== */}

          <p className="admin-instagram-count">
            {posts.length} / 4 images uploaded
          </p>

        </section>

      </main>
    </>
  );
}

export default AdminInstagram;