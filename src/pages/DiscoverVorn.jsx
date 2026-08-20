import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function DiscoverVorn() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from("home_settings")
        .select(`
          hero_eyebrow,
          hero_title,
          hero_description,
          hero_button_text,
          hero_button_link,
          brand_title,
          brand_description,
          brand_link_text,
          brand_link,
          brand_image_url
        `)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Discover VORN settings error:", error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error("Discover VORN error:", error);
    } finally {
      setLoading(false);
    }
  }

  const content = {
    eyebrow:
      settings?.hero_eyebrow ||
      "VORN EXPERIENCE",

    title:
      settings?.hero_title ||
      "More than a label.",

    description:
      settings?.hero_description ||
      "VORN is built around confident everyday fashion. Our collections focus on clean silhouettes, strong identity and pieces that fit naturally into your wardrobe.",

    buttonText:
      settings?.hero_button_text ||
      "Explore Collection",

    buttonLink:
      settings?.hero_button_link ||
      "/shop",

    storyTitle:
      settings?.brand_title ||
      "Wear your identity.",

    storyDescription:
      settings?.brand_description ||
      "We believe clothing should feel natural, confident and unmistakably yours. VORN brings together everyday essentials and statement pieces designed to move with your lifestyle.",

    storyLinkText:
      settings?.brand_link_text ||
      "Discover VORN",

    storyLink:
      settings?.brand_link ||
      "/shop",

    image:
      settings?.brand_image_url ||
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
  };

  function renderTitle(title) {
    if (!title) return null;

    const words = title.trim().split(/\s+/);

    if (words.length <= 2) {
      return title;
    }

    return (
      <>
        {words.slice(0, Math.ceil(words.length / 2)).join(" ")}
        <br />
        {words.slice(Math.ceil(words.length / 2)).join(" ")}
      </>
    );
  }

  return (
    <>
      <style>{`

        /* =====================================================
           DISCOVER VORN
        ===================================================== */

        .discover-vorn {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #111111;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .discover-vorn *,
        .discover-vorn *::before,
        .discover-vorn *::after {
          box-sizing: border-box;
        }

        .discover-vorn-inner {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 90px 6%;
        }

        /* =====================================================
           INTRO
        ===================================================== */

        .discover-vorn-intro {
          width: 100%;
          max-width: 900px;
          margin: 0 0 85px;
        }

        .discover-vorn-eyebrow {
          margin: 0 0 22px;
          color: #777777;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .discover-vorn-title {
          margin: 0;
          max-width: 1000px;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(54px, 7vw, 100px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.045em;
          text-transform: uppercase;
          word-break: normal;
        }

        .discover-vorn-description {
          width: 100%;
          max-width: 680px;
          margin: 34px 0 0;
          color: #666666;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 18px;
          line-height: 1.8;
        }

        /* =====================================================
           STORY
        ===================================================== */

        .discover-vorn-story {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(0, 0.65fr);
          align-items: center;
          gap: 80px;
          margin-top: 30px;
        }

        .discover-vorn-image-wrap {
          width: 100%;
          min-width: 0;
          overflow: hidden;
          background: #eeeeee;
        }

        .discover-vorn-image {
          display: block;
          width: 100%;
          max-width: 100%;
          height: 620px;
          object-fit: cover;
          object-position: center;
        }

        .discover-vorn-copy {
          width: 100%;
          max-width: 520px;
          min-width: 0;
        }

        .discover-vorn-copy-title {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(48px, 5vw, 78px);
          font-weight: 400;
          line-height: 0.98;
          letter-spacing: -0.045em;
          text-transform: uppercase;
        }

        .discover-vorn-copy-text {
          margin: 32px 0 0;
          color: #666666;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 17px;
          line-height: 1.8;
        }

        /* =====================================================
           BUTTON
        ===================================================== */

        .discover-vorn-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-width: 210px;
          min-height: 58px;

          margin-top: 34px;
          padding: 16px 28px;

          border: 1px solid #111111;
          background: #111111;

          color: #ffffff;
          text-decoration: none;

          font-size: 13px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: 0.14em;
          text-transform: uppercase;

          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }

        .discover-vorn-button:hover {
          background: #ffffff;
          color: #111111;
          transform: translateY(-2px);
        }

        /* =====================================================
           VALUES
        ===================================================== */

        .discover-vorn-values {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 30px;

          margin-top: 120px;
          padding-top: 70px;

          border-top: 1px solid #dddddd;
        }

        .discover-vorn-value {
          min-width: 0;
          padding-right: 30px;
        }

        .discover-vorn-value-number {
          display: block;
          margin-bottom: 18px;
          color: #999999;
          font-size: 12px;
          line-height: 1.4;
          letter-spacing: 0.2em;
        }

        .discover-vorn-value-title {
          margin: 0 0 15px;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 28px;
          font-weight: 400;
          line-height: 1.15;
        }

        .discover-vorn-value-text {
          margin: 0;
          color: #666666;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 15px;
          line-height: 1.7;
        }

        /* =====================================================
           CTA
        ===================================================== */

        .discover-vorn-cta {
          width: 100%;
          margin-top: 120px;
          padding: 90px 30px;

          background: #111111;
          color: #ffffff;

          text-align: center;
        }

        .discover-vorn-cta-eyebrow {
          margin: 0 0 20px;
          color: #aaaaaa;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .discover-vorn-cta-title {
          max-width: 800px;
          margin: 0 auto;

          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(44px, 6vw, 82px);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -0.04em;
          text-transform: uppercase;
        }

        .discover-vorn-cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-width: 190px;
          min-height: 54px;

          margin-top: 34px;
          padding: 15px 25px;

          border: 1px solid #ffffff;
          background: #ffffff;

          color: #111111;
          text-decoration: none;

          font-size: 12px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: 0.14em;
          text-transform: uppercase;

          transition: all 0.25s ease;
        }

        .discover-vorn-cta-button:hover {
          background: transparent;
          color: #ffffff;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {

          .discover-vorn-inner {
            padding: 70px 5%;
          }

          .discover-vorn-intro {
            margin-bottom: 60px;
          }

          .discover-vorn-story {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .discover-vorn-image {
            height: 520px;
          }

          .discover-vorn-copy {
            max-width: 700px;
          }

          .discover-vorn-values {
            grid-template-columns: 1fr;
            gap: 45px;
            margin-top: 90px;
          }

          .discover-vorn-value {
            padding-right: 0;
          }

          .discover-vorn-cta {
            margin-top: 90px;
            padding: 70px 25px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .discover-vorn-inner {
            padding: 55px 20px;
          }

          .discover-vorn-intro {
            margin-bottom: 50px;
          }

          .discover-vorn-eyebrow {
            margin-bottom: 17px;
            font-size: 10px;
            letter-spacing: 0.22em;
          }

          .discover-vorn-title {
            max-width: 100%;
            font-size: clamp(48px, 14vw, 72px);
            line-height: 0.96;
          }

          .discover-vorn-description {
            margin-top: 25px;
            font-size: 16px;
            line-height: 1.7;
          }

          .discover-vorn-story {
            grid-template-columns: 1fr;
            gap: 35px;
            margin-top: 20px;
          }

          .discover-vorn-image-wrap {
            width: 100%;
          }

          .discover-vorn-image {
            width: 100%;
            height: 430px;
            object-fit: cover;
          }

          .discover-vorn-copy {
            width: 100%;
            max-width: 100%;
          }

          .discover-vorn-copy-title {
            font-size: clamp(42px, 12vw, 62px);
            line-height: 0.98;
          }

          .discover-vorn-copy-text {
            margin-top: 24px;
            font-size: 15px;
            line-height: 1.7;
          }

          .discover-vorn-button {
            width: 100%;
            min-width: 0;
            margin-top: 28px;
          }

          .discover-vorn-values {
            grid-template-columns: 1fr;
            margin-top: 75px;
            padding-top: 50px;
            gap: 40px;
          }

          .discover-vorn-value {
            padding-right: 0;
          }

          .discover-vorn-value-title {
            font-size: 25px;
          }

          .discover-vorn-value-text {
            font-size: 14px;
          }

          .discover-vorn-cta {
            margin-top: 75px;
            padding: 65px 20px;
          }

          .discover-vorn-cta-title {
            font-size: clamp(40px, 12vw, 60px);
            line-height: 1;
          }

          .discover-vorn-cta-button {
            width: 100%;
            min-width: 0;
          }
        }

        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {

          .discover-vorn-inner {
            padding-left: 16px;
            padding-right: 16px;
          }

          .discover-vorn-title {
            font-size: 46px;
          }

          .discover-vorn-image {
            height: 360px;
          }

          .discover-vorn-copy-title {
            font-size: 40px;
          }

          .discover-vorn-cta {
            padding-left: 16px;
            padding-right: 16px;
          }
        }

      `}</style>

      <main className="discover-vorn">
        <div className="discover-vorn-inner">

          {/* =================================================
              INTRO
          ================================================= */}

          <section className="discover-vorn-intro">

            <p className="discover-vorn-eyebrow">
              {content.eyebrow}
            </p>

            <h1 className="discover-vorn-title">
              {renderTitle(content.title)}
            </h1>

            <p className="discover-vorn-description">
              {content.description}
            </p>

          </section>

          {/* =================================================
              STORY
          ================================================= */}

          <section className="discover-vorn-story">

            <div className="discover-vorn-image-wrap">

              <img
                className="discover-vorn-image"
                src={content.image}
                alt="VORN fashion collection"
                loading="lazy"
              />

            </div>

            <div className="discover-vorn-copy">

              <h2 className="discover-vorn-copy-title">
                {renderTitle(content.storyTitle)}
              </h2>

              <p className="discover-vorn-copy-text">
                {content.storyDescription}
              </p>

              <Link
                to={content.storyLink || "/shop"}
                className="discover-vorn-button"
              >
                {content.storyLinkText}
              </Link>

            </div>

          </section>

          {/* =================================================
              VALUES
          ================================================= */}

          <section className="discover-vorn-values">

            <div className="discover-vorn-value">

              <span className="discover-vorn-value-number">
                01
              </span>

              <h3 className="discover-vorn-value-title">
                Confidence
              </h3>

              <p className="discover-vorn-value-text">
                Clothes designed to help you feel comfortable,
                confident and ready for everyday moments.
              </p>

            </div>

            <div className="discover-vorn-value">

              <span className="discover-vorn-value-number">
                02
              </span>

              <h3 className="discover-vorn-value-title">
                Identity
              </h3>

              <p className="discover-vorn-value-text">
                Clean silhouettes and strong details that let
                your personal style speak for itself.
              </p>

            </div>

            <div className="discover-vorn-value">

              <span className="discover-vorn-value-number">
                03
              </span>

              <h3 className="discover-vorn-value-title">
                Everyday
              </h3>

              <p className="discover-vorn-value-text">
                Versatile pieces made to naturally become part
                of your everyday wardrobe.
              </p>

            </div>

          </section>

          {/* =================================================
              CTA
          ================================================= */}

          <section className="discover-vorn-cta">

            <p className="discover-vorn-cta-eyebrow">
              Discover VORN
            </p>

            <h2 className="discover-vorn-cta-title">
              Dress without
              <br />
              limits.
            </h2>

            <Link
              to="/shop"
              className="discover-vorn-cta-button"
            >
              Shop VORN
            </Link>

          </section>

        </div>
      </main>
    </>
  );
}

export default DiscoverVorn;