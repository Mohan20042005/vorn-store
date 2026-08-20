import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import heroImage from "../assets/hero.png";
import { supabase } from "../services/supabaseClient";
import InstagramSection from "../components/InstagramSection";

function Home() {
  const [products, setProducts] =
    useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [productError, setProductError] =
    useState("");

  const [heroBanners, setHeroBanners] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroLoading, setHeroLoading] = useState(true);
  const [homeSettings, setHomeSettings] = useState(null);
  const [promoImage, setPromoImage] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  // =====================================================
  // LOAD ACTIVE PRODUCTS
  // =====================================================

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadHeroBanners();
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      setCategoryError("");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Home categories loading error:", error);
      setCategories([]);
      setCategoryError(
        error?.message || "Unable to load categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  function getCategoryImage(category) {
    return category?.image_url || null;
  }

  function getCategorySlug(category) {
    return category?.slug || category?.id;
  }

  function getCategoryName(category) {
    return category?.name || "Category";
  }

  async function loadHeroBanners() {
    try {
      setHeroLoading(true);

      const { data, error } = await supabase
        .from("home_settings")
        .select(
          "hero_image_1_url, hero_image_2_url, hero_image_3_url, hero_image_4_url"
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const images = [
        data?.hero_image_1_url,
        data?.hero_image_2_url,
        data?.hero_image_3_url,
        data?.hero_image_4_url,
        data?.hero_image_url,
      ].filter(Boolean);

      // Remove duplicates while preserving the admin order.
      const uniqueImages = [...new Set(images)];

      setHeroBanners(uniqueImages);
      setHeroSlide(0);
    } catch (error) {
      console.error("Home banner loading error:", error);
      setHeroBanners([]);
    } finally {
      setHeroLoading(false);
    }
  }

  useEffect(() => {
    loadHomeSettings();
  }, []);

  async function loadHomeSettings() {
    try {
      const { data, error } = await supabase
        .from("home_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setHomeSettings(null);
        setPromoImage("");
        return;
      }

      setHomeSettings(data);
      setPromoImage(data.promo_image_url || "");
    } catch (error) {
      console.error("Homepage settings loading error:", error);
      setHomeSettings(null);
      setPromoImage("");
    }
  }

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      setProductError("");

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(4);

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error(
        "Home products loading error:",
        error
      );

      setProductError(
        error?.message ||
          "Unable to load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  function getProductImage(product) {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    if (
      typeof product?.images === "string"
    ) {
      try {
        const parsed =
          JSON.parse(product.images);

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

    if (product?.image_url) {
      return product.image_url;
    }

    return null;
  }

  // =====================================================
  // PRODUCT PRICE
  // =====================================================

  function getProductPrice(product) {
    if (
      product?.sale_price !== null &&
      product?.sale_price !== undefined
    ) {
      return Number(
        product.sale_price
      );
    }

    if (
      product?.base_price !== null &&
      product?.base_price !== undefined
    ) {
      return Number(
        product.base_price
      );
    }

    return Number(
      product?.price || 0
    );
  }

  useEffect(() => {
    if (heroBanners.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setHeroSlide((current) =>
        (current + 1) % heroBanners.length
      );
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [heroBanners.length]);

  function goToHeroSlide(index) {
    if (!heroBanners.length) return;

    setHeroSlide(
      (index + heroBanners.length) %
        heroBanners.length
    );
  }

  function goToNextHeroSlide() {
    if (!heroBanners.length) return;

    setHeroSlide(
      (current) =>
        (current + 1) %
        heroBanners.length
    );
  }

  function goToPreviousHeroSlide() {
    if (!heroBanners.length) return;

    setHeroSlide(
      (current) =>
        (current - 1 + heroBanners.length) %
        heroBanners.length
    );
  }

  return (
    <>
      <style>{`

        .vorn-home {
          width: 100%;
          overflow: hidden;
          background: #ffffff;
          color: #111111;
        }

        .vorn-container {
          width: min(100% - 40px, 1380px);
          margin: 0 auto;
        }

        /* =================================================
           HERO
        ================================================= */

        .vorn-hero {
          position: relative;
          min-height: min(760px, calc(100vh - 76px));
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background: #eeeeee;
        }

        .vorn-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vorn-hero-slider {
          position: absolute;
          inset: 0;
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.7s ease;
          will-change: transform;
        }

        .vorn-hero-slide {
          position: relative;
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .vorn-hero-slide-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .vorn-hero-controls {
          position: absolute;
          z-index: 4;
          right: 28px;
          bottom: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vorn-hero-arrow {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.75);
          background: rgba(0, 0, 0, 0.22);
          color: #ffffff;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
          backdrop-filter: blur(4px);
        }

        .vorn-hero-dots {
          position: absolute;
          z-index: 4;
          left: 50%;
          bottom: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          transform: translateX(-50%);
        }

        .vorn-hero-dot {
          width: 7px;
          height: 7px;
          padding: 0;
          border: 1px solid #ffffff;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
        }

        .vorn-hero-dot-active {
          background: #ffffff;
        }

        /* =================================================
           DYNAMIC IMAGE CONTRAST
           White base + difference blend:
           dark image -> white text
           light image -> black text
        ================================================= */

        .vorn-contrast-text {
          color: #ffffff;
          mix-blend-mode: difference;
        }

        .vorn-contrast-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 28px;
          border: 1px solid #ffffff;
          background: transparent;
          color: #ffffff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          mix-blend-mode: difference;
          transition: transform 0.2s ease;
        }

        .vorn-contrast-button:hover {
          transform: translateY(-2px);
        }

        .vorn-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.02) 20%,
              rgba(0, 0, 0, 0.18) 100%
            );
        }

        .vorn-hero-content {
          position: relative;
          z-index: 2;
          width: min(100% - 40px, 1380px);
          margin: 0 auto;
          padding: 80px 0 70px;
          color: #ffffff;
        }

        .vorn-hero-eyebrow {
          margin: 0 0 14px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .vorn-hero-title {
          max-width: 700px;
          margin: 0;
          font-size: clamp(48px, 8vw, 104px);
          line-height: 0.9;
          font-weight: 700;
          letter-spacing: -0.055em;
          text-transform: uppercase;
        }

        .vorn-hero-description {
          max-width: 450px;
          margin: 24px 0 30px;
          font-size: 15px;
          line-height: 1.7;
        }

        .vorn-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 28px;
          border: 1px solid #ffffff;
          background: #ffffff;
          color: #111111;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .vorn-primary-button:hover {
          background: transparent;
          color: #ffffff;
          transform: translateY(-2px);
        }

        /* =================================================
           SECTION
        ================================================= */

        .vorn-section {
          padding: 90px 0;
        }

        .vorn-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 36px;
        }

        .vorn-section-eyebrow {
          margin: 0 0 9px;
          color: #777777;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .vorn-section-title {
          margin: 0;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1;
          letter-spacing: -0.035em;
          text-transform: uppercase;
        }

        .vorn-section-link {
          flex-shrink: 0;
          color: #111111;
          text-decoration: none;
          border-bottom: 1px solid #111111;
          padding-bottom: 4px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* =================================================
           CATEGORIES
        ================================================= */

        .vorn-category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .vorn-category-card {
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background: #eeeeee;
          text-decoration: none;
          color: #ffffff;
        }

        .vorn-category-placeholder {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              135deg,
              #dedede,
              #8e8e8e
            );
          transition: transform 0.5s ease;
        }

        .vorn-category-card:nth-child(2)
          .vorn-category-placeholder {
          background:
            linear-gradient(
              135deg,
              #d7d7d7,
              #707070
            );
        }

        .vorn-category-card:nth-child(3)
          .vorn-category-placeholder {
          background:
            linear-gradient(
              135deg,
              #cfcfcf,
              #575757
            );
        }

        .vorn-category-card:hover
          .vorn-category-placeholder {
          transform: scale(1.04);
        }

        .vorn-category-real-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .vorn-category-card:hover
          .vorn-category-real-image {
          transform: scale(1.04);
        }

        .vorn-category-loading,
        .vorn-category-empty,
        .vorn-category-error {
          grid-column: 1 / -1;
          padding: 50px 20px;
          text-align: center;
          font-size: 14px;
        }

        .vorn-category-loading,
        .vorn-category-empty {
          border: 1px solid #eeeeee;
          color: #777777;
        }

        .vorn-category-error {
          border: 1px solid #f0caca;
          background: #fff5f5;
          color: #b42318;
        }

        .vorn-category-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              transparent 40%,
              rgba(0, 0, 0, 0.55)
            );
        }

        .vorn-category-content {
          position: relative;
          z-index: 2;
          padding: 30px;
        }

        .vorn-category-content h3 {
          margin: 0 0 8px;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -0.03em;
          text-transform: uppercase;
        }

        .vorn-category-content span {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* =================================================
           PRODUCTS
        ================================================= */

        .vorn-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .vorn-product-card {
          min-width: 0;
          text-decoration: none;
          color: inherit;
        }

        .vorn-product-image {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #eeeeee;
        }

        .vorn-product-image-inner {
          width: 100%;
          height: 100%;
          background:
            linear-gradient(
              145deg,
              #eeeeee,
              #c6c6c6
            );
          transition: transform 0.45s ease;
        }

        .vorn-product-card:hover
          .vorn-product-image-inner {
          transform: scale(1.035);
        }

        .vorn-product-real-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.45s ease;
        }

        .vorn-product-card:hover
          .vorn-product-real-image {
          transform: scale(1.035);
        }

        .vorn-product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 7px 9px;
          background: #ffffff;
          color: #111111;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          z-index: 2;
        }

        .vorn-product-info {
          padding: 15px 0 0;
        }

        .vorn-product-name {
          margin: 0 0 7px;
          font-size: 14px;
          font-weight: 600;
        }

        .vorn-product-price {
          margin: 0;
          color: #666666;
          font-size: 13px;
        }

        .vorn-product-category {
          margin: 0 0 7px;
          color: #888888;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .vorn-product-loading {
          grid-column: 1 / -1;
          padding: 50px 20px;
          text-align: center;
          color: #777777;
          font-size: 14px;
        }

        .vorn-product-empty {
          grid-column: 1 / -1;
          padding: 50px 20px;
          text-align: center;
          border: 1px solid #eeeeee;
          color: #777777;
          font-size: 14px;
        }

        .vorn-product-error {
          grid-column: 1 / -1;
          padding: 16px 18px;
          border: 1px solid #f0caca;
          background: #fff5f5;
          color: #b42318;
          font-size: 13px;
        }

        /* =================================================
           PROMO
        ================================================= */

        .vorn-promo {
          position: relative;
          min-height: 460px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #111111;
          color: #ffffff;
          text-align: center;
        }

        .vorn-promo-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .vorn-promo-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.03);
          pointer-events: none;
        }

        .vorn-promo-content {
          position: relative;
          z-index: 2;
          max-width: 700px;
          padding: 60px 20px;
        }

        .vorn-promo-eyebrow {
          margin: 0 0 16px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .vorn-promo-title {
          margin: 0;
          font-size: clamp(42px, 7vw, 82px);
          line-height: 0.92;
          letter-spacing: -0.05em;
          text-transform: uppercase;
        }

        .vorn-promo-description {
          max-width: 470px;
          margin: 24px auto 30px;
          color: #bdbdbd;
          font-size: 14px;
          line-height: 1.7;
        }

        /* =================================================
           BRAND
        ================================================= */

        .vorn-brand-section {
          padding: 110px 0;
        }

        .vorn-brand-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          align-items: center;
        }

        .vorn-brand-image-wrap {
          position: relative;
          min-height: 520px;
          overflow: hidden;
          background: #eeeeee;
        }

        .vorn-brand-image {
          width: 100%;
          height: 100%;
          min-height: 520px;
          display: block;
          object-fit: cover;
        }

        .vorn-brand-mark {
          font-size: clamp(80px, 15vw, 190px);
          font-weight: 800;
          line-height: 0.8;
          letter-spacing: -0.09em;
        }

        .vorn-brand-copy h2 {
          margin: 0 0 20px;
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1;
          letter-spacing: -0.045em;
          text-transform: uppercase;
        }

        .vorn-brand-copy p {
          max-width: 500px;
          margin: 0;
          color: #666666;
          font-size: 15px;
          line-height: 1.8;
        }

        .vorn-brand-copy a {
          display: inline-flex;
          margin-top: 28px;
          color: #111111;
          text-decoration: none;
          border-bottom: 1px solid #111111;
          padding-bottom: 5px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* =================================================
           INSTAGRAM
        ================================================= */

        .vorn-instagram-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .vorn-instagram-tile {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              #eeeeee,
              #c1c1c1
            );
          color: #555555;
          text-decoration: none;
          overflow: hidden;
          transition: opacity 0.2s ease;
        }

        .vorn-instagram-tile:nth-child(2) {
          background:
            linear-gradient(
              135deg,
              #d9d9d9,
              #969696
            );
        }

        .vorn-instagram-tile:nth-child(3) {
          background:
            linear-gradient(
              135deg,
              #cccccc,
              #777777
            );
        }

        .vorn-instagram-tile:nth-child(4) {
          background:
            linear-gradient(
              135deg,
              #e1e1e1,
              #a4a4a4
            );
        }

        .vorn-instagram-tile:hover {
          opacity: 0.8;
        }

        .vorn-instagram-tile span {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1000px) {
          .vorn-category-card {
            min-height: 420px;
          }

          .vorn-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .vorn-brand-grid {
            gap: 40px;
          }
        }

        @media (max-width: 700px) {
          .vorn-hero-controls {
            right: 16px;
            bottom: 20px;
          }

          .vorn-hero-arrow {
            width: 38px;
            height: 38px;
          }

          .vorn-hero-dots {
            bottom: 22px;
          }

          .vorn-container {
            width: min(100% - 28px, 1380px);
          }

          .vorn-hero {
            min-height: 620px;
          }

          .vorn-hero-content {
            width: min(100% - 28px, 1380px);
            padding-bottom: 50px;
          }

          .vorn-section {
            padding: 65px 0;
          }

          .vorn-section-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 16px;
          }

          .vorn-category-grid {
            grid-template-columns: 1fr;
          }

          .vorn-category-card {
            min-height: 430px;
          }

          .vorn-brand-section {
            padding: 75px 0;
          }

          .vorn-brand-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .vorn-brand-image-wrap {
            min-height: 380px;
          }

          .vorn-brand-image {
            min-height: 380px;
          }

          .vorn-brand-mark {
            font-size: 100px;
          }

          .vorn-instagram-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .vorn-product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .vorn-product-name {
            font-size: 13px;
          }

          .vorn-product-price {
            font-size: 12px;
          }

          .vorn-category-card {
            min-height: 380px;
          }

          .vorn-category-content {
            padding: 22px;
          }
        }

      `}</style>

      <main className="vorn-home">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="vorn-hero">

          {!heroLoading && heroBanners.length > 0 ? (
            <div
              className="vorn-hero-slider"
              style={{
                transform: `translateX(-${heroSlide * 100}%)`,
              }}
            >
              {heroBanners.map((image, index) => (
                <div
                  className="vorn-hero-slide"
                  key={`${image}-${index}`}
                >
                  <img
                    className="vorn-hero-slide-image"
                    src={image}
                    alt={`VORN banner ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <img
              className="vorn-hero-image"
              src={heroImage}
              alt="VORN fashion collection"
            />
          )}

          <div className="vorn-hero-overlay" />

          {heroBanners.length > 1 && (
            <>
              <div className="vorn-hero-controls">
                <button
                  type="button"
                  className="vorn-hero-arrow"
                  onClick={goToPreviousHeroSlide}
                  aria-label="Previous banner"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="vorn-hero-arrow"
                  onClick={goToNextHeroSlide}
                  aria-label="Next banner"
                >
                  ›
                </button>
              </div>

              <div className="vorn-hero-dots">
                {heroBanners.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`vorn-hero-dot ${
                      index === heroSlide
                        ? "vorn-hero-dot-active"
                        : ""
                    }`}
                    onClick={() =>
                      goToHeroSlide(index)
                    }
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="vorn-hero-content">

            <p className="vorn-hero-eyebrow vorn-contrast-text">
              {homeSettings?.hero_eyebrow || "VORN / New Collection"}
            </p>

            <h1 className="vorn-hero-title vorn-contrast-text">
              {(homeSettings?.hero_title || "Built To Be Seen")
                .split(/\s+/)
                .reduce((parts, word, index, words) => {
                  if (index === 0) return [word];
                  const current = parts[parts.length - 1];
                  const lineLength = current.replace(/\s/g, "").length;
                  if (lineLength >= 7 && parts.length < 2) {
                    return [...parts, word];
                  }
                  return [
                    ...parts.slice(0, -1),
                    `${current} ${word}`,
                  ];
                }, [])
                .map((line, index) => (
                  <span key={index}>
                    {index > 0 && <br />}
                    {line}
                  </span>
                ))}
            </h1>

            <p className="vorn-hero-description vorn-contrast-text">
              {homeSettings?.hero_description ||
                "Discover the latest VORN collection, designed for confident everyday style."}
            </p>

            <Link
              to="/shop"
              className="vorn-contrast-button"
            >
              {homeSettings?.hero_button_text || "Shop Collection"}
            </Link>

          </div>
        </section>

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <section className="vorn-section">
          <div className="vorn-container">

            <div className="vorn-section-header">

              <div>
                <p className="vorn-section-eyebrow">
                  Explore VORN
                </p>

                <h2 className="vorn-section-title">
                  Shop By Category
                </h2>
              </div>

              <Link
                to="/shop"
                className="vorn-section-link"
              >
                View All
              </Link>

            </div>

            <div className="vorn-category-grid">

              {loadingCategories && (
                <div className="vorn-category-loading">
                  Loading categories...
                </div>
              )}

              {!loadingCategories && categoryError && (
                <div className="vorn-category-error">
                  {categoryError}
                </div>
              )}

              {!loadingCategories &&
                !categoryError &&
                categories.length === 0 && (
                  <div className="vorn-category-empty">
                    No active categories available right now.
                  </div>
                )}

              {!loadingCategories &&
                !categoryError &&
                categories.map((category) => {
                  const image = getCategoryImage(category);
                  const slug = getCategorySlug(category);
                  const name = getCategoryName(category);

                  return (
                    <Link
                      key={category.id || slug}
                      to={`/shop?category=${encodeURIComponent(slug)}`}
                      className="vorn-category-card"
                    >
                      {image ? (
                        <img
                          className="vorn-category-real-image"
                          src={image}
                          alt={name}
                        />
                      ) : (
                        <div className="vorn-category-placeholder" />
                      )}

                      <div className="vorn-category-overlay" />

                      <div className="vorn-category-content">
                        <h3>{name}</h3>
                        <span>
                          Shop {name}
                        </span>
                      </div>
                    </Link>
                  );
                })}

            </div>
          </div>
        </section>


        {/* =================================================
            NEW ARRIVALS
        ================================================= */}

        <section className="vorn-section">
          <div className="vorn-container">

            <div className="vorn-section-header">

              <div>
                <p className="vorn-section-eyebrow">
                  Latest Drop
                </p>

                <h2 className="vorn-section-title">
                  New Arrivals
                </h2>
              </div>

              <Link
                to="/shop"
                className="vorn-section-link"
              >
                Shop New
              </Link>

            </div>

            <div className="vorn-product-grid">

              {loadingProducts && (
                <div className="vorn-product-loading">
                  Loading latest products...
                </div>
              )}

              {!loadingProducts &&
                productError && (
                  <div className="vorn-product-error">
                    {productError}
                  </div>
                )}

              {!loadingProducts &&
                !productError &&
                products.length === 0 && (
                  <div className="vorn-product-empty">
                    No active products available right now.
                  </div>
                )}

              {!loadingProducts &&
                !productError &&
                products.map(
                  (product, index) => {
                    const image =
                      getProductImage(
                        product
                      );

                    const price =
                      getProductPrice(
                        product
                      );

                    const slug =
                      product.slug ||
                      product.id;

                    return (
                      <Link
                        key={
                          product.id
                        }
                        to={`/product/${slug}`}
                        className="vorn-product-card"
                      >

                        <div className="vorn-product-image">

                          {image ? (
                            <img
                              src={image}
                              alt={
                                product.name
                              }
                              className="vorn-product-real-image"
                            />
                          ) : (
                            <div className="vorn-product-image-inner" />
                          )}

                          {index < 2 && (
                            <span className="vorn-product-badge">
                              New
                            </span>
                          )}

                        </div>

                        <div className="vorn-product-info">

                          <p className="vorn-product-category">
                            {String(
                              product.category ||
                                "UNISEX"
                            ).toUpperCase()}
                          </p>

                          <h3 className="vorn-product-name">
                            {
                              product.name
                            }
                          </h3>

                          <p className="vorn-product-price">
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>
                      </Link>
                    );
                  }
                )}

            </div>
          </div>
        </section>

        {/* =================================================
            PROMO
        ================================================= */}

        <section className="vorn-promo">

          {promoImage ? (
            <img
              className="vorn-promo-image"
              src={promoImage}
              alt="VORN promotional campaign"
            />
          ) : null}

          <div className="vorn-promo-overlay" />

          <div className="vorn-promo-content">

            <p className="vorn-promo-eyebrow vorn-contrast-text">
              {homeSettings?.promo_eyebrow ||
                "VORN / The Standard"}
            </p>

            <h2 className="vorn-promo-title vorn-contrast-text">
              {(homeSettings?.promo_title ||
                "Wear Your Statement")
                .split(/\s+/)
                .reduce((parts, word, index) => {
                  if (index === 0) return [word];

                  const current = parts[parts.length - 1];
                  const lineLength =
                    current.replace(/\s/g, "").length;

                  if (lineLength >= 7 && parts.length < 2) {
                    return [...parts, word];
                  }

                  return [
                    ...parts.slice(0, -1),
                    `${current} ${word}`,
                  ];
                }, [])
                .map((line, index) => (
                  <span key={index}>
                    {index > 0 && <br />}
                    {line}
                  </span>
                ))}
            </h2>

            <p className="vorn-promo-description vorn-contrast-text">
              {homeSettings?.promo_description ||
                "Everyday pieces made to stand out without trying too hard."}
            </p>

            <Link
              to={homeSettings?.promo_button_link || "/shop"}
              className="vorn-contrast-button"
            >
              {homeSettings?.promo_button_text ||
                "Explore VORN"}
            </Link>

          </div>
        </section>

        {/* =================================================
            BRAND
        ================================================= */}

        <section className="vorn-brand-section">

          <div className="vorn-container">

            <div className="vorn-brand-grid">

              <div className="vorn-brand-image-wrap">
                {homeSettings?.brand_image_url ? (
                  <img
                    className="vorn-brand-image"
                    src={homeSettings.brand_image_url}
                    alt={
                      homeSettings?.brand_title ||
                      "VORN brand"
                    }
                  />
                ) : (
                  <div className="vorn-brand-mark">
                    VORN
                  </div>
                )}
              </div>

              <div className="vorn-brand-copy">

                <h2>
                  {(homeSettings?.brand_title ||
                    "More Than A Label.")
                    .split(/\s+/)
                    .reduce((parts, word, index) => {
                      if (index === 0) return [word];

                      const current =
                        parts[parts.length - 1];

                      if (
                        current.replace(/\s/g, "").length >= 7 &&
                        parts.length < 2
                      ) {
                        return [...parts, word];
                      }

                      return [
                        ...parts.slice(0, -1),
                        `${current} ${word}`,
                      ];
                    }, [])
                    .map((line, index) => (
                      <span key={index}>
                        {index > 0 && <br />}
                        {line}
                      </span>
                    ))}
                </h2>

                <p>
                  {homeSettings?.brand_description ||
                    "VORN is built around confident everyday fashion. Our collections focus on clean silhouettes, strong identity and pieces that fit naturally into your wardrobe."}
                </p>

                <Link
                  to={
                    homeSettings?.brand_link ||
                    "/about"
                  }
                >
                  {homeSettings?.brand_link_text ||
                    "Discover VORN"}
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            INSTAGRAM
        ================================================= */}

        <InstagramSection />

      </main>
    </>
  );
}

export default Home;