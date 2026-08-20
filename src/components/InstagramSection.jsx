import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

function InstagramSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstagramPosts();
  }, []);

  async function loadInstagramPosts() {
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
        })
        .limit(4);

      // DEBUG
      console.log("INSTAGRAM HOME DATA:", data);
      console.log("INSTAGRAM HOME ERROR:", error);

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      console.error(
        "Instagram posts error:",
        error
      );

      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  return (
    <>
      <style>{`
        .vorn-instagram {
          width: 100%;
          padding: 90px 0;
          background: #ffffff;
          color: #111111;
          overflow: hidden;
          box-sizing: border-box;
        }

        .vorn-instagram *,
        .vorn-instagram *::before,
        .vorn-instagram *::after {
          box-sizing: border-box;
        }

        .vorn-instagram-inner {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .vorn-instagram-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 35px;
        }

        .vorn-instagram-eyebrow {
          margin: 0 0 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #777777;
        }

        .vorn-instagram-title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 5vw, 68px);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .vorn-instagram-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 45px;
          padding: 0 20px;
          border-bottom: 1px solid #111111;
          color: #111111;
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: opacity 0.25s ease;
          white-space: nowrap;
        }

        .vorn-instagram-link:hover {
          opacity: 0.6;
        }

        .vorn-instagram-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          width: 100%;
        }

        .vorn-instagram-item {
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #eeeeee;
          text-decoration: none;
        }

        .vorn-instagram-item img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .vorn-instagram-item:hover img {
          transform: scale(1.04);
        }

        .vorn-instagram-empty {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          width: 100%;
        }

        .vorn-instagram-placeholder {
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f3f3;
          color: #999999;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        @media (max-width: 800px) {
          .vorn-instagram {
            padding: 70px 0;
          }

          .vorn-instagram-inner {
            padding: 0 20px;
          }

          .vorn-instagram-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 20px;
          }

          .vorn-instagram-grid,
          .vorn-instagram-empty {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .vorn-instagram {
            padding: 55px 0;
          }

          .vorn-instagram-inner {
            padding: 0 16px;
          }

          .vorn-instagram-grid,
          .vorn-instagram-empty {
            gap: 8px;
          }

          .vorn-instagram-title {
            font-size: 40px;
          }

          .vorn-instagram-link {
            width: fit-content;
          }
        }
      `}</style>

      <section className="vorn-instagram">
        <div className="vorn-instagram-inner">

          <div className="vorn-instagram-header">

            <div>
              <p className="vorn-instagram-eyebrow">
                Follow VORN
              </p>

              <h2 className="vorn-instagram-title">
                ON INSTAGRAM
              </h2>
            </div>

            <a
              href="https://instagram.com/vornruthless"
              target="_blank"
              rel="noopener noreferrer"
              className="vorn-instagram-link"
            >
              @VORNRUTHLESS
            </a>

          </div>

          {posts.length > 0 ? (
            <div className="vorn-instagram-grid">

              {posts.map((post) => (
                <a
                  key={post.id}
                  href="https://instagram.com/vornruthless"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vorn-instagram-item"
                  aria-label="VORN on Instagram"
                >
                  <img
                    src={post.image_url}
                    alt={
                      post.caption ||
                      "VORN Instagram"
                    }
                    loading="lazy"
                  />
                </a>
              ))}

            </div>
          ) : (
            <div className="vorn-instagram-empty">

              <div className="vorn-instagram-placeholder">
                VORN
              </div>

              <div className="vorn-instagram-placeholder">
                VORN
              </div>

              <div className="vorn-instagram-placeholder">
                VORN
              </div>

              <div className="vorn-instagram-placeholder">
                VORN
              </div>

            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default InstagramSection;