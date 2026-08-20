import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../services/supabaseClient";
import ProductReviews from "../components/ProductReviews";

const sizes = ["S", "M", "L", "XL"];

/* =========================================================
   GET PRODUCT IMAGES
========================================================= */

function getProductImages(product) {
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
      // Ignore invalid JSON.
    }
  }

  if (product?.image_url) {
    return [product.image_url];
  }

  return [];
}

/* =========================================================
   PRODUCT DETAILS
========================================================= */

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  /* =======================================================
     CART
  ======================================================= */

  const { addToCart } = useCart();

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

  function handleImageError(image) {
    if (!image) return;

    setBrokenImages((current) => {
      const next = new Set(current);
      next.add(image);
      return next;
    });
  }

  function handleRetryProduct() {
    window.location.reload();
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  const {
    isInWishlist,
    toggleWishlist,
  } = useWishlist();

  /* =======================================================
     PRODUCT STATE
  ======================================================= */

  const [product, setProduct] = useState(null);

  const [productImages, setProductImages] =
    useState([]);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [selectedSize, setSelectedSize] =
    useState("");

  /* =======================================================
     INVENTORY
  ======================================================= */

  const [inventory, setInventory] =
    useState({});

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [inventoryLoading, setInventoryLoading] =
    useState(false);

  const [relatedLoading, setRelatedLoading] =
    useState(false);

  const [adding, setAdding] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     SWIPE STATE
  ======================================================= */

  const [touchStartX, setTouchStartX] =
    useState(null);

  const [touchEndX, setTouchEndX] =
    useState(null);

  const [mouseStartX, setMouseStartX] =
    useState(null);

  const [brokenImages, setBrokenImages] =
    useState(() => new Set());

  const [toast, setToast] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const [wishlistUpdating, setWishlistUpdating] =
    useState(false);

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setSelectedSize("");
        setInventory({});

        const {
          data,
          error: fetchError,
        } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (cancelled) {
          return;
        }

        if (fetchError) {
          console.error(
            "Product fetch error:",
            fetchError
          );

          setError(fetchError.message);
          setProduct(null);
          setProductImages([]);
          setSelectedImage("");
          setLoading(false);

          return;
        }

        if (!data) {
          setError("Product not found.");
          setProduct(null);
          setProductImages([]);
          setSelectedImage("");
          setLoading(false);

          return;
        }

        const images =
          getProductImages(data);

        setProduct(data);
        setProductImages(images);
        setSelectedImage(
          images[0] || ""
        );

        setLoading(false);

        loadInventory(data.id);
        loadRelatedProducts(data);
      } catch (loadError) {
        console.error(
          "Product loading error:",
          loadError
        );

        if (!cancelled) {
          setError(
            loadError?.message ||
              "Unable to load product."
          );

          setProduct(null);
          setProductImages([]);
          setSelectedImage("");
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* =======================================================
     LOAD INVENTORY
  ======================================================= */

  async function loadInventory(productId) {
    try {
      setInventoryLoading(true);

      const {
        data,
        error: inventoryError,
      } = await supabase
        .from("product_inventory")
        .select("size, stock")
        .eq("product_id", productId);

      if (inventoryError) {
        console.error(
          "Inventory fetch error:",
          inventoryError
        );

        setInventory({});
        return;
      }

      const inventoryMap = {};

      (data || []).forEach((item) => {
        if (!item?.size) {
          return;
        }

        inventoryMap[
          String(item.size).toUpperCase()
        ] = Number(item.stock || 0);
      });

      setInventory(inventoryMap);
    } catch (inventoryLoadError) {
      console.error(
        "Inventory loading error:",
        inventoryLoadError
      );

      setInventory({});
    } finally {
      setInventoryLoading(false);
    }
  }

  /* =======================================================
     INVENTORY HELPERS
  ======================================================= */

  function getSizeStock(size) {
    return Number(
      inventory?.[size] ?? 0
    );
  }

  function hasInventory() {
    return (
      Object.keys(inventory).length > 0
    );
  }

  function getTotalInventory() {
    return sizes.reduce(
      (total, size) =>
        total + getSizeStock(size),
      0
    );
  }

  function isSizeAvailable(size) {
    if (inventoryLoading) {
      return false;
    }

    if (hasInventory()) {
      return getSizeStock(size) > 0;
    }

    if (
      product?.stock !== null &&
      product?.stock !== undefined
    ) {
      return Number(product.stock) > 0;
    }

    return false;
  }

  function isProductOutOfStock() {
    if (inventoryLoading) {
      return false;
    }

    if (hasInventory()) {
      return getTotalInventory() <= 0;
    }

    if (
      product?.stock !== null &&
      product?.stock !== undefined
    ) {
      return Number(product.stock) <= 0;
    }

    return false;
  }

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  async function loadRelatedProducts(
    currentProduct
  ) {
    try {
      setRelatedLoading(true);

      let query = supabase
        .from("products")
        .select("*")
        .neq(
          "id",
          currentProduct.id
        )
        .limit(4);

      if (currentProduct.category) {
        query = query.eq(
          "category",
          currentProduct.category
        );
      }

      const {
        data,
        error: relatedError,
      } = await query;

      if (relatedError) {
        console.error(
          "Related products error:",
          relatedError
        );

        setRelatedProducts([]);
        return;
      }

      setRelatedProducts(data || []);
    } catch (relatedLoadError) {
      console.error(
        "Related products error:",
        relatedLoadError
      );

      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  }

  /* =======================================================
     PRODUCT PRICE
  ======================================================= */

  function getProductPrice() {
    if (!product) {
      return 0;
    }

    if (
      product.sale_price !== null &&
      product.sale_price !== undefined &&
      product.sale_price !== "" &&
      Number(product.sale_price) > 0
    ) {
      return Number(
        product.sale_price
      );
    }

    if (
      product.base_price !== null &&
      product.base_price !== undefined &&
      product.base_price !== "" &&
      Number(product.base_price) > 0
    ) {
      return Number(
        product.base_price
      );
    }

    if (
      product.price !== null &&
      product.price !== undefined &&
      product.price !== "" &&
      Number(product.price) > 0
    ) {
      return Number(
        product.price
      );
    }

    return 0;
  }

  /* =======================================================
     CATEGORY
  ======================================================= */

  function getCategoryName() {
    if (!product) {
      return "VORN COLLECTION";
    }

    if (product.category) {
      return product.category;
    }

    if (product.categories?.name) {
      return product.categories.name;
    }

    return "VORN COLLECTION";
  }

  /* =======================================================
     IMAGE NAVIGATION
  ======================================================= */

  function goToImage(index) {
    if (
      index < 0 ||
      index >= productImages.length
    ) {
      return;
    }

    setSelectedImage(
      productImages[index]
    );
  }

  function getCurrentImageIndex() {
    const index =
      productImages.indexOf(
        selectedImage
      );

    return index >= 0 ? index : 0;
  }

  function showNextImage() {
    if (productImages.length <= 1) {
      return;
    }

    const currentIndex =
      getCurrentImageIndex();

    const nextIndex =
      (currentIndex + 1) %
      productImages.length;

    goToImage(nextIndex);
  }

  function showPreviousImage() {
    if (productImages.length <= 1) {
      return;
    }

    const currentIndex =
      getCurrentImageIndex();

    const previousIndex =
      (currentIndex -
        1 +
        productImages.length) %
      productImages.length;

    goToImage(previousIndex);
  }

  /* =======================================================
     TOUCH SWIPE
  ======================================================= */

  function handleTouchStart(event) {
    const touch =
      event.touches[0];

    setTouchStartX(
      touch.clientX
    );

    setTouchEndX(null);
  }

  function handleTouchMove(event) {
    const touch =
      event.touches[0];

    setTouchEndX(
      touch.clientX
    );
  }

  function handleTouchEnd() {
    if (
      touchStartX === null ||
      touchEndX === null
    ) {
      return;
    }

    const distance =
      touchStartX - touchEndX;

    const minimumSwipeDistance = 50;

    if (
      Math.abs(distance) <
      minimumSwipeDistance
    ) {
      return;
    }

    if (distance > 0) {
      showNextImage();
    } else {
      showPreviousImage();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  }

  /* =======================================================
     DESKTOP MOUSE DRAG
  ======================================================= */

  function handleMouseDown(event) {
    setMouseStartX(
      event.clientX
    );
  }

  function handleMouseUp(event) {
    if (
      mouseStartX === null
    ) {
      return;
    }

    const distance =
      mouseStartX -
      event.clientX;

    const minimumDragDistance = 50;

    if (
      Math.abs(distance) >=
      minimumDragDistance
    ) {
      if (distance > 0) {
        showNextImage();
      } else {
        showPreviousImage();
      }
    }

    setMouseStartX(null);
  }

  /* =======================================================
     KEYBOARD IMAGE NAVIGATION
  ======================================================= */

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        !productImages.length
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        showNextImage();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        showPreviousImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    productImages,
    selectedImage,
  ]);

  /* =======================================================
     SIZE SELECT
  ======================================================= */

  function handleSizeSelect(size) {
    if (inventoryLoading) {
      return;
    }

    if (!isSizeAvailable(size)) {
      return;
    }

    setSelectedSize(size);
  }

  /* =======================================================
     WISHLIST
  ======================================================= */

  function handleWishlistToggle() {
    if (!product || wishlistUpdating) {
      return;
    }

    try {
      setWishlistUpdating(true);

      toggleWishlist({
        ...product,
        id: product.id,
        name: product.name || "VORN Product",
        slug: product.slug || "",
        price: getProductPrice(),
        sale_price: product.sale_price ?? null,
        base_price: product.base_price ?? null,
        category: getCategoryName(),
        image:
          selectedImage ||
          product.image_url ||
          getProductImages(product)[0] ||
          null,
      });

      showToast(
        wishlisted
          ? "Removed from wishlist."
          : "Added to wishlist."
      );
    } catch (wishlistError) {
      console.error("Wishlist error:", wishlistError);
      showToast(
        "Unable to update wishlist.",
        "error"
      );
    } finally {
      window.setTimeout(() => {
        setWishlistUpdating(false);
      }, 350);
    }
  }

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function handleAddToCart() {
    if (!product || adding) {
      return;
    }

    if (!selectedSize) {
      showToast(
        "Please select a size first.",
        "error"
      );
      return;
    }

    const selectedStock =
      getSizeStock(selectedSize);

    if (hasInventory()) {
      if (selectedStock <= 0) {
        showToast(
          `${selectedSize} size is out of stock.`,
          "error"
        );
        return;
      }
    } else if (
      product.stock !== null &&
      product.stock !== undefined &&
      Number(product.stock) <= 0
    ) {
      showToast(
        "This product is out of stock.",
        "error"
      );
      return;
    }

    try {
      setAdding(true);

      addToCart({
        id: product.id,
        name: product.name,
        price: getProductPrice(),
        category: getCategoryName(),
        categoryId: product.category_id || null,
        productId: product.id,
        slug: product.slug,
        size: selectedSize,
        quantity: 1,
        image:
          selectedImage ||
          product.image_url ||
          null,
      });

      showToast(
        `${product.name || "Product"} added to cart.`
      );

      window.setTimeout(() => {
        navigate("/cart");
      }, 650);
    } catch (cartError) {
      console.error(
        "Add to cart error:",
        cartError
      );

      showToast(
        "Unable to add product to cart.",
        "error"
      );
    } finally {
      window.setTimeout(() => {
        setAdding(false);
      }, 500);
    }
  }

  /* =======================================================
     RELATED PRODUCT CLICK
  ======================================================= */

  function openRelatedProduct(
    relatedProduct
  ) {
    if (
      !relatedProduct?.slug
    ) {
      return;
    }

    navigate(
      `/product/${relatedProduct.slug}`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     RELATED PRODUCT IMAGE
  ======================================================= */

  function getRelatedProductImage(
    relatedProduct
  ) {
    const images =
      getProductImages(
        relatedProduct
      );

    return (
      images[0] || ""
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        className="vorn-product-page"
        style={styles.page}
      >
        <section style={styles.skeletonProduct}>
          <div
            className="vorn-skeleton"
            style={styles.skeletonMainImage}
          />

          <div style={styles.skeletonDetails}>
            <div
              className="vorn-skeleton"
              style={styles.skeletonCategory}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonTitle}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonTitleShort}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonPrice}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonLine}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonDescription}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonDescription}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonSize}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonButton}
            />
            <div
              className="vorn-skeleton"
              style={styles.skeletonButton}
            />
          </div>
        </section>

        <style>{`
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
              rgba(255,255,255,.7),
              transparent
            );
            animation:
              vorn-product-shimmer 1.35s infinite;
          }

          @keyframes vorn-product-shimmer {
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

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!product) {
    return (
      <main
        style={
          styles.notFound
        }
      >
        <p
          style={
            styles.eyebrow
          }
        >
          VORN COLLECTION
        </p>

        <h1
          style={
            styles.notFoundTitle
          }
        >
          Product Not Found
        </h1>

        {error && (
          <p
            style={
              styles.errorText
            }
          >
            {error}
          </p>
        )}

        <div style={styles.notFoundActions}>
          <button
            type="button"
            onClick={handleRetryProduct}
            style={styles.secondaryButton}
          >
            TRY AGAIN
          </button>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            style={styles.primaryButton}
          >
            BACK TO SHOP
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const price =
    getProductPrice();

  const categoryName =
    getCategoryName();

  const hasMultipleImages =
    productImages.length > 1;

  const currentImageIndex =
    getCurrentImageIndex();

  const productOutOfStock =
    isProductOutOfStock();

  const totalInventory =
    getTotalInventory();

  const wishlisted =
    isInWishlist(product.id);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="vorn-product-page" style={styles.page}>

      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          navigate("/shop")
        }
        style={
          styles.backButton
        }
      >
        ← BACK TO SHOP
      </button>

      {/* =================================================
          PRODUCT
      ================================================= */}

      <section className="vorn-product-layout" style={styles.product}>

        {/* =================================================
            IMAGE SECTION
        ================================================= */}

        <div
          style={
            styles.imageSection
          }
        >

          <div
            style={
              styles.mainImageWrapper
            }
            onTouchStart={
              handleTouchStart
            }
            onTouchMove={
              handleTouchMove
            }
            onTouchEnd={
              handleTouchEnd
            }
            onMouseDown={
              handleMouseDown
            }
            onMouseUp={
              handleMouseUp
            }
          >

            {selectedImage &&
            !brokenImages.has(selectedImage) ? (
              <img
                src={selectedImage}
                alt={
                  product.name ||
                  "VORN product"
                }
                draggable={false}
                loading="eager"
                style={styles.mainImage}
                onError={() =>
                  handleImageError(selectedImage)
                }
              />
            ) : (
              <div style={styles.imagePlaceholder}>
                <span style={styles.imageFallbackMark}>
                  V
                </span>
                <span style={styles.imageFallbackText}>
                  VORN
                </span>
                <small style={styles.imageFallbackSmall}>
                  Image unavailable
                </small>
              </div>
            )}

            {/* LEFT */}

            {hasMultipleImages && (
              <button
                type="button"
                onClick={
                  showPreviousImage
                }
                style={{
                  ...styles.imageArrow,
                  ...styles.leftArrow,
                }}
                aria-label="Previous image"
              >
                ←
              </button>
            )}

            {/* RIGHT */}

            {hasMultipleImages && (
              <button
                type="button"
                onClick={
                  showNextImage
                }
                style={{
                  ...styles.imageArrow,
                  ...styles.rightArrow,
                }}
                aria-label="Next image"
              >
                →
              </button>
            )}

            {/* COUNTER */}

            {hasMultipleImages && (
              <div
                style={
                  styles.imageCounter
                }
              >
                {currentImageIndex + 1}
                {" / "}
                {productImages.length}
              </div>
            )}

          </div>

          {/* SWIPE HINT */}

          {hasMultipleImages && (
            <p
              style={
                styles.swipeHint
              }
            >
              SWIPE TO VIEW MORE
            </p>
          )}

          {/* THUMBNAILS */}

          {hasMultipleImages && (
            <div
              style={
                styles.thumbnailGrid
              }
            >
              {productImages.map(
                (
                  image,
                  index
                ) => {
                  const isSelected =
                    selectedImage ===
                    image;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      style={{
                        ...styles.thumbnailButton,

                        ...(isSelected
                          ? styles.thumbnailSelected
                          : {}),
                      }}
                    >
                      {brokenImages.has(image) ? (
                        <span style={styles.thumbnailFallback}>
                          V
                        </span>
                      ) : (
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          draggable={false}
                          loading="lazy"
                          style={styles.thumbnailImage}
                          onError={() =>
                            handleImageError(image)
                          }
                        />
                      )}

                      {index ===
                        0 && (
                        <span
                          style={
                            styles.mainBadge
                          }
                        >
                          MAIN
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}

        </div>

        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <div className="vorn-product-details" style={styles.details}>

          {/* CATEGORY */}

          <p
            style={
              styles.category
            }
          >
            {categoryName}
          </p>

          {/* TITLE + WISHLIST */}

          <div
            style={
              styles.titleRow
            }
          >

            <h1
              style={
                styles.title
              }
            >
              {product.name}
            </h1>

            {/* WISHLIST ICON */}

            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={wishlistUpdating}
              aria-disabled={wishlistUpdating}
              aria-label={
                wishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              title={
                wishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              style={{
                ...styles.wishlistButton,

                ...(wishlisted
                  ? styles.wishlistButtonActive
                  : {}),

                ...(wishlistUpdating
                  ? styles.buttonDisabled
                  : {}),
              }}
            >
              {wishlistUpdating
                ? "…"
                : wishlisted
                ? "♥"
                : "♡"}
            </button>

          </div>

          {/* PRICE */}

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
              {price.toLocaleString(
                "en-IN"
              )}
            </span>

            {product.base_price &&
              Number(
                product.base_price
              ) > price && (
                <span
                  style={
                    styles.oldPrice
                  }
                >
                  ₹
                  {Number(
                    product.base_price
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}
          </div>

          <div
            style={
              styles.line
            }
          />

          {/* DESCRIPTION */}

          <div
            style={
              styles.description
            }
          >
            {product.description ? (
              product.description
                .split("\n")
                .map(
                  (
                    line,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      style={
                        styles.descriptionLine
                      }
                    >
                      {line}
                    </div>
                  )
                )
            ) : (
              <p>
                A refined VORN
                piece designed
                for confident
                everyday wear.
              </p>
            )}
          </div>

          {/* =================================================
              INVENTORY
          ================================================= */}

          <div
            style={
              styles.inventoryHeader
            }
          >
            <div>

              <div
                style={
                  styles.sizeTitle
                }
              >
                SELECT SIZE
              </div>

              {inventoryLoading ? (
                <div
                  style={
                    styles.inventoryLoading
                  }
                >
                  Checking availability...
                </div>
              ) : hasInventory() ? (
                <div
                  style={
                    styles.totalStock
                  }
                >
                  {totalInventory > 0
                    ? `In Stock: ${totalInventory}`
                    : "Out of Stock"}
                </div>
              ) : (
                product.stock !==
                  null &&
                product.stock !==
                  undefined && (
                  <div
                    style={
                      styles.totalStock
                    }
                  >
                    {Number(
                      product.stock
                    ) > 0
                      ? `In Stock: ${product.stock}`
                      : "Out of Stock"}
                  </div>
                )
              )}

            </div>
          </div>

          {/* SIZE BUTTONS */}

          <div
            style={
              styles.sizes
            }
          >
            {sizes.map(
              (size) => {
                const isSelected =
                  selectedSize ===
                  size;

                const stock =
                  getSizeStock(
                    size
                  );

                const available =
                  isSizeAvailable(
                    size
                  );

                return (
                  <button
                    className="vorn-size-button"
                    key={
                      size
                    }
                    type="button"
                    onClick={() =>
                      handleSizeSelect(
                        size
                      )
                    }
                    disabled={
                      inventoryLoading ||
                      !available
                    }
                    style={{
                      ...styles.sizeButton,

                      ...(isSelected
                        ? styles.selectedSize
                        : {}),

                      ...(!available
                        ? styles.disabledSize
                        : {}),
                    }}
                  >
                    <span>
                      {size}
                    </span>

                    {hasInventory() && (
                      <small
                        style={
                          styles.sizeStock
                        }
                      >
                        {stock > 0
                          ? stock
                          : "0"}
                      </small>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* SELECTED SIZE */}

          {selectedSize && (
            <p
              style={
                styles.selectedText
              }
            >
              Selected size:{" "}
              <strong>
                {selectedSize}
              </strong>

              {hasInventory() && (
                <>
                  {" · "}
                  {getSizeStock(
                    selectedSize
                  )}{" "}
                  available
                </>
              )}
            </p>
          )}

          {/* OUT OF STOCK */}

          {productOutOfStock &&
            !inventoryLoading && (
              <p
                style={
                  styles.outOfStockText
                }
              >
                This product is
                currently out of stock.
              </p>
            )}

          {/* =================================================
              WISHLIST BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={wishlistUpdating}
            style={{
              ...styles.wishlistWideButton,

              ...(wishlisted
                ? styles.wishlistWideButtonActive
                : {}),

              ...(wishlistUpdating
                ? styles.buttonDisabled
                : {}),
            }}
          >
            <span style={styles.wishlistIcon}>
              {wishlistUpdating
                ? "…"
                : wishlisted
                ? "♥"
                : "♡"}
            </span>

            <span>
              {wishlistUpdating
                ? "UPDATING..."
                : wishlisted
                ? "ADDED TO WISHLIST"
                : "ADD TO WISHLIST"}
            </span>
          </button>

          {/* =================================================
              ADD TO CART
          ================================================= */}

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              adding ||
              inventoryLoading ||
              productOutOfStock
            }
            style={{
              ...styles.addButton,

              ...(adding ||
              inventoryLoading ||
              productOutOfStock
                ? styles.buttonDisabled
                : {}),
            }}
          >
            {productOutOfStock
              ? "OUT OF STOCK"
              : inventoryLoading
              ? "CHECKING STOCK..."
              : adding
              ? "ADDING..."
              : "ADD TO CART"}
          </button>

          {/* VIEW CART */}

          <button
            type="button"
            onClick={() =>
              navigate("/cart")
            }
            style={
              styles.cartButton
            }
          >
            VIEW CART
          </button>

        </div>

      </section>

     {/* =====================================================
          PRODUCT REVIEWS
      ===================================================== */}

      <ProductReviews
        productId={product.id}
      />

      {/* =====================================================
          RELATED PRODUCTS
      ===================================================== */}

      <section className="vorn-related-section" style={styles.relatedSection}>

        <div className="vorn-related-header" style={styles.relatedHeader}>

          <div>

            <p
              style={
                styles.relatedEyebrow
              }
            >
              VORN COLLECTION
            </p>

            <h2
              style={
                styles.relatedTitle
              }
            >
              Related Products
            </h2>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/shop?category=${encodeURIComponent(
                  categoryName
                )}`
              )
            }
            style={
              styles.viewAllButton
            }
          >
            VIEW ALL
          </button>

        </div>

        {/* LOADING */}

        {relatedLoading && (
          <p
            style={
              styles.relatedLoading
            }
          >
            Loading related
            products...
          </p>
        )}

        {/* PRODUCTS */}

        {!relatedLoading &&
          relatedProducts.length >
            0 && (
            <div
              style={
                styles.relatedGrid
              }
            >
              {relatedProducts.map(
                (
                  relatedProduct
                ) => {
                  const image =
                    getRelatedProductImage(
                      relatedProduct
                    );

                  const relatedPrice =
                    Number(
                      relatedProduct.sale_price ||
                        relatedProduct.base_price ||
                        relatedProduct.price ||
                        0
                    );

                  return (
                    <button
                      key={
                        relatedProduct.id
                      }
                      type="button"
                      onClick={() =>
                        openRelatedProduct(
                          relatedProduct
                        )
                      }
                      style={
                        styles.relatedCard
                      }
                    >

                      <div
                        style={
                          styles.relatedImageWrapper
                        }
                      >
                        {image &&
                        !brokenImages.has(image) ? (
                          <img
                            src={image}
                            alt={
                              relatedProduct.name ||
                              "VORN product"
                            }
                            loading="lazy"
                            style={styles.relatedImage}
                            onError={() =>
                              handleImageError(image)
                            }
                          />
                        ) : (
                          <div style={styles.relatedPlaceholder}>
                            <span style={styles.imageFallbackMark}>
                              V
                            </span>
                            <span style={styles.imageFallbackText}>
                              VORN
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        style={
                          styles.relatedInfo
                        }
                      >

                        <p
                          style={
                            styles.relatedCategory
                          }
                        >
                          {relatedProduct.category ||
                            "UNISEX"}
                        </p>

                        <h3
                          style={
                            styles.relatedProductName
                          }
                        >
                          {
                            relatedProduct.name
                          }
                        </h3>

                        <p
                          style={
                            styles.relatedPrice
                          }
                        >
                          ₹
                          {relatedPrice.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                    </button>
                  );
                }
              )}
            </div>
          )}

        {/* NO RELATED */}

        {!relatedLoading &&
          relatedProducts.length ===
            0 && (
            <p
              style={
                styles.noRelated
              }
            >
              No related products
              available.
            </p>
          )}

      </section>

      {toast.visible && (
        <div
          className="vorn-toast"
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
        .vorn-product-layout {
          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(320px, .95fr) !important;
        }

        .vorn-related-grid {
          grid-template-columns:
            repeat(4, minmax(0, 1fr)) !important;
        }

        @media (max-width: 980px) {
          .vorn-product-layout {
            grid-template-columns: 1fr !important;
            gap: 42px !important;
          }

          .vorn-product-details {
            padding-top: 0 !important;
          }

          .vorn-related-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 680px) {
          .vorn-product-page {
            padding:
              24px 16px 70px !important;
          }

          .vorn-product-layout {
            margin-top: 20px !important;
            gap: 34px !important;
          }

          .vorn-product-page h1 {
            font-size: 36px !important;
          }

          .vorn-related-section {
            margin-top: 70px !important;
            padding-top: 40px !important;
          }

          .vorn-related-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: 24px 14px !important;
          }

          .vorn-related-section h2 {
            font-size: 30px !important;
          }

          .vorn-related-header {
            align-items: flex-start !important;
          }

          .vorn-toast {
            left: 16px !important;
            right: 16px !important;
            bottom: 16px !important;
          }
        }

        @media (max-width: 420px) {
          .vorn-related-grid {
            grid-template-columns: 1fr !important;
          }

          .vorn-size-button {
            flex: 1 !important;
            width: auto !important;
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
            rgba(255,255,255,.7),
            transparent
          );
          animation:
            vorn-product-shimmer 1.35s infinite;
        }

        @keyframes vorn-product-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-skeleton::after {
            animation: none;
          }
        }
              /* =====================================================
           FINAL RESPONSIVE FIX
           CSS ONLY — no JSX / component logic changes.
        ===================================================== */

        .vorn-product-page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        .vorn-product-page *,
        .vorn-related-section * {
          box-sizing: border-box;
        }

        .vorn-product-layout {
          width: 100%;
          min-width: 0;
          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(0, 0.95fr) !important;
        }

        .vorn-product-details {
          min-width: 0;
          width: 100%;
        }

        .vorn-product-details h1,
        .vorn-product-details p,
        .vorn-product-details div {
          max-width: 100%;
        }

        /* Main product image */
        .vorn-product-layout > div:first-child > div:first-child {
          width: 100%;
          max-width: 100%;
        }

        .vorn-product-layout > div:first-child > div:first-child img {
          max-width: 100%;
        }

        /* Thumbnail row */
        .vorn-product-layout > div:first-child > div:nth-of-type(2) {
          width: 100%;
          min-width: 0;
        }

        /* Title + wishlist icon */
        .vorn-product-details > div:nth-of-type(2) {
          min-width: 0;
        }

        .vorn-product-details > div:nth-of-type(2) h1 {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        /* Action buttons */
        .vorn-product-details > button {
          max-width: 100%;
        }

        @media (max-width: 980px) {
          .vorn-product-page {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }

          .vorn-product-layout {
            grid-template-columns: 1fr !important;
            gap: 38px !important;
          }

          .vorn-product-details {
            padding-top: 0 !important;
          }

          .vorn-related-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 680px) {
          .vorn-product-page {
            padding:
              22px 14px 64px !important;
          }

          .vorn-product-layout {
            margin-top: 20px !important;
            gap: 30px !important;
          }

          .vorn-product-details > div:nth-of-type(2) {
            gap: 12px !important;
          }

          .vorn-product-details > div:nth-of-type(2) h1 {
            font-size:
              clamp(30px, 9vw, 38px) !important;
            line-height: 1.12 !important;
          }

          /* Wishlist circle */
          .vorn-product-details
            > div:nth-of-type(2)
            > button {
            width: 42px !important;
            height: 42px !important;
            flex: 0 0 42px !important;
          }

          /* Size buttons */
          .vorn-size-button {
            min-width: 0 !important;
          }

          .vorn-related-section {
            margin-top: 64px !important;
            padding-top: 38px !important;
          }

          .vorn-related-header {
            align-items: flex-start !important;
            gap: 18px !important;
          }

          .vorn-related-header > button {
            width: 100% !important;
          }

          .vorn-related-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: 22px 12px !important;
          }

          .vorn-related-section h2 {
            font-size: 30px !important;
            line-height: 1.15 !important;
          }

          .vorn-toast {
            left: 12px !important;
            right: 12px !important;
            bottom: 12px !important;
            max-width:
              calc(100vw - 24px) !important;
          }
        }

        @media (max-width: 480px) {
          .vorn-product-page {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          /* Make thumbnails horizontally scrollable */
          .vorn-product-layout
            > div:first-child
            > div:nth-of-type(2) {
            display: flex !important;
            gap: 8px !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
            scrollbar-width: none;
          }

          .vorn-product-layout
            > div:first-child
            > div:nth-of-type(2)::-webkit-scrollbar {
            display: none;
          }

          .vorn-product-layout
            > div:first-child
            > div:nth-of-type(2)
            > button {
            flex: 0 0 76px !important;
            width: 76px !important;
          }

          /* Two-column sizes on very small screens */
          .vorn-product-details
            > div:nth-of-type(4) {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .vorn-related-grid {
            grid-template-columns: 1fr !important;
          }

          .vorn-related-section h2 {
            font-size: 27px !important;
          }

          .vorn-product-layout
            > div:first-child
            > div:first-child
            button {
            width: 38px !important;
            height: 38px !important;
          }

          .vorn-product-layout
            > div:first-child
            > div:first-child
            button:first-of-type {
            left: 8px !important;
          }

          .vorn-product-layout
            > div:first-child
            > div:first-child
            button:last-of-type {
            right: 8px !important;
          }
        }

        @media (max-width: 360px) {
          .vorn-product-page {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .vorn-product-details > div:nth-of-type(2) h1 {
            font-size: 28px !important;
          }

          .vorn-product-details > button {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }


`}
</style>
    </main>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  skeletonProduct: {
    width: "100%",
    maxWidth: "1200px",
    margin: "35px auto 0",
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
    gap: "70px",
    alignItems: "start",
  },

  skeletonMainImage: {
    width: "100%",
    aspectRatio: "4 / 5",
  },

  skeletonDetails: {
    paddingTop: "15px",
  },

  skeletonCategory: {
    width: "120px",
    height: "10px",
    marginBottom: "18px",
  },

  skeletonTitle: {
    width: "85%",
    height: "48px",
    marginBottom: "10px",
  },

  skeletonTitleShort: {
    width: "55%",
    height: "48px",
    marginBottom: "22px",
  },

  skeletonPrice: {
    width: "90px",
    height: "20px",
    marginBottom: "25px",
  },

  skeletonLine: {
    width: "100%",
    height: "1px",
    marginBottom: "25px",
  },

  skeletonDescription: {
    width: "100%",
    height: "14px",
    marginBottom: "10px",
  },

  skeletonSize: {
    width: "240px",
    height: "54px",
    marginTop: "22px",
    marginBottom: "20px",
  },

  skeletonButton: {
    width: "100%",
    height: "52px",
    marginBottom: "10px",
  },

  imageFallbackMark: {
    fontFamily: "Georgia, serif",
    fontSize: "42px",
    lineHeight: 1,
    color: "#111",
  },

  imageFallbackText: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "4px",
    color: "#222",
  },

  imageFallbackSmall: {
    marginTop: "5px",
    fontSize: "9px",
    color: "#999",
  },

  thumbnailFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    color: "#999",
    background: "#f4f4f4",
  },

  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
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

  notFoundActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
  },

  secondaryButton: {
    padding: "15px 25px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },

  page: {
    minHeight: "75vh",
    padding:
      "35px 30px 100px",
    background: "#fff",
  },

  centerPage: {
    minHeight: "70vh",
    padding:
      "120px 24px",
    textAlign: "center",
  },

  loadingTitle: {
    fontFamily:
      "Georgia, serif",
    fontSize: "42px",
    fontWeight: "400",
  },

  backButton: {
    border: "none",
    background:
      "transparent",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing:
      "1.4px",
    padding: "10px 0",
  },

  product: {
    width: "100%",
    maxWidth: "1200px",
    margin:
      "35px auto 0",
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
    gap: "70px",
    alignItems: "start",
  },

  imageSection: {
    width: "100%",
  },

  mainImageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio:
      "4 / 5",
    background:
      "#f5f5f5",
    overflow: "hidden",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    touchAction:
      "pan-y",
    userSelect:
      "none",
    cursor:
      "grab",
  },

  mainImage: {
    width: "100%",
    height: "100%",
    objectFit:
      "cover",
    display: "block",
    pointerEvents:
      "none",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    background:
      "linear-gradient(135deg, #f4f4f4, #e5e5e5)",
    color: "#999",
    fontFamily:
      "Georgia, serif",
    fontSize: "30px",
    letterSpacing:
      "8px",
  },

  imageArrow: {
    position:
      "absolute",
    top: "50%",
    transform:
      "translateY(-50%)",
    width: "42px",
    height: "42px",
    border:
      "1px solid rgba(0,0,0,0.15)",
    background:
      "rgba(255,255,255,0.9)",
    color: "#111",
    cursor:
      "pointer",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    fontSize:
      "18px",
    zIndex: 5,
  },

  leftArrow: {
    left: "15px",
  },

  rightArrow: {
    right: "15px",
  },

  imageCounter: {
    position:
      "absolute",
    right: "15px",
    bottom: "15px",
    padding:
      "7px 10px",
    background:
      "rgba(17,17,17,0.8)",
    color: "#fff",
    fontSize: "9px",
    letterSpacing:
      "1px",
    zIndex: 5,
  },

  swipeHint: {
    margin:
      "10px 0 0",
    textAlign:
      "center",
    fontSize: "8px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
    color:
      "#999",
  },

  thumbnailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "10px",
    marginTop:
      "12px",
  },

  thumbnailButton: {
    position:
      "relative",
    padding: 0,
    border:
      "1px solid #ddd",
    background:
      "#f5f5f5",
    cursor:
      "pointer",
    aspectRatio:
      "1 / 1",
    overflow:
      "hidden",
  },

  thumbnailSelected: {
    border:
      "2px solid #111",
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit:
      "cover",
    display:
      "block",
  },

  mainBadge: {
    position:
      "absolute",
    left: "6px",
    top: "6px",
    padding:
      "4px 6px",
    background:
      "#111",
    color:
      "#fff",
    fontSize:
      "7px",
    fontWeight:
      "700",
    letterSpacing:
      "1px",
  },

  details: {
    paddingTop:
      "15px",
  },

  category: {
    margin:
      "0 0 14px",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "3px",
    color:
      "#777",
    textTransform:
      "uppercase",
  },

  titleRow: {
    display: "flex",
    alignItems:
      "flex-start",
    justifyContent:
      "space-between",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize:
      "44px",
    fontWeight:
      "400",
    lineHeight:
      "1.15",
    color:
      "#111",
  },

  /* =======================================================
     WISHLIST ICON
  ======================================================= */

  wishlistButton: {
    flex:
      "0 0 auto",
    width: "46px",
    height: "46px",
    border:
      "1px solid #111",
    borderRadius:
      "50%",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "23px",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    lineHeight:
      "1",
  },

  wishlistButtonActive: {
    background:
      "#111",
    color:
      "#fff",
  },

  priceRow: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "12px",
    margin:
      "20px 0 25px",
  },

  price: {
    fontSize:
      "18px",
    color:
      "#111",
    fontWeight:
      "500",
  },

  oldPrice: {
    fontSize:
      "14px",
    color:
      "#999",
    textDecoration:
      "line-through",
  },

  line: {
    width:
      "100%",
    height:
      "1px",
    background:
      "#e5e5e5",
    marginBottom:
      "25px",
  },

  description: {
    margin:
      "0 0 25px",
    maxWidth:
      "550px",
    color:
      "#666",
    fontSize:
      "14px",
    lineHeight:
      "1.8",
  },

  descriptionLine: {
    minHeight:
      "20px",
  },

  inventoryHeader: {
    marginBottom:
      "12px",
  },

  sizeTitle: {
    marginBottom:
      "8px",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
    color:
      "#111",
  },

  inventoryLoading: {
    fontSize:
      "11px",
    color:
      "#888",
    marginBottom:
      "8px",
  },

  totalStock: {
    fontSize:
      "11px",
    fontWeight:
      "600",
    letterSpacing:
      "1px",
    color:
      "#555",
  },

  sizes: {
    display:
      "flex",
    gap:
      "8px",
    marginBottom:
      "10px",
  },

  sizeButton: {
    width:
      "62px",
    minHeight:
      "52px",
    border:
      "1px solid #ccc",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "11px",
    fontWeight:
      "600",
    display:
      "flex",
    flexDirection:
      "column",
    alignItems:
      "center",
    justifyContent:
      "center",
    gap:
      "3px",
  },

  selectedSize: {
    background:
      "#111",
    color:
      "#fff",
    border:
      "1px solid #111",
  },

  disabledSize: {
    background:
      "#f5f5f5",
    color:
      "#aaa",
    cursor:
      "not-allowed",
    textDecoration:
      "line-through",
  },

  sizeStock: {
    fontSize:
      "8px",
    fontWeight:
      "500",
    letterSpacing:
      "0.5px",
    textDecoration:
      "none",
  },

  selectedText: {
    margin:
      "12px 0 20px",
    color:
      "#666",
    fontSize:
      "12px",
  },

  outOfStockText: {
    margin:
      "10px 0 18px",
    color:
      "#b42318",
    fontSize:
      "12px",
    fontWeight:
      "600",
  },

  /* =======================================================
     WISHLIST WIDE BUTTON
  ======================================================= */

  wishlistWideButton: {
    width:
      "100%",
    marginTop:
      "5px",
    marginBottom:
      "10px",
    padding:
      "15px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    gap:
      "9px",
  },

  wishlistWideButtonActive: {
    background:
      "#111",
    color:
      "#fff",
  },

  wishlistIcon: {
    fontSize:
      "17px",
    lineHeight:
      "1",
  },

  addButton: {
    width:
      "100%",
    padding:
      "16px",
    border:
      "1px solid #111",
    background:
      "#111",
    color:
      "#fff",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
  },

  cartButton: {
    width:
      "100%",
    marginTop:
      "10px",
    padding:
      "16px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
  },

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  relatedSection: {
    width:
      "100%",
    maxWidth:
      "1200px",
    margin:
      "110px auto 0",
    paddingTop:
      "60px",
    borderTop:
      "1px solid #e5e5e5",
  },

  relatedHeader: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap:
      "30px",
    marginBottom:
      "30px",
  },

  relatedEyebrow: {
    margin:
      "0 0 10px",
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "3px",
    color:
      "#888",
  },

  relatedTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize:
      "36px",
    fontWeight:
      "400",
    color:
      "#111",
  },

  viewAllButton: {
    padding:
      "13px 20px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color:
      "#111",
    cursor:
      "pointer",
    fontSize:
      "9px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
  },

  relatedGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap:
      "18px",
  },

  relatedCard: {
    width:
      "100%",
    padding: 0,
    border:
      "none",
    background:
      "#fff",
    color:
      "#111",
    textAlign:
      "left",
    cursor:
      "pointer",
  },

  relatedImageWrapper: {
    width:
      "100%",
    aspectRatio:
      "4 / 5",
    background:
      "#f4f4f4",
    overflow:
      "hidden",
  },

  relatedImage: {
    width:
      "100%",
    height:
      "100%",
    objectFit:
      "cover",
    display:
      "block",
  },

  relatedPlaceholder: {
    width:
      "100%",
    height:
      "100%",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    background:
      "#f4f4f4",
    color:
      "#999",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "22px",
    letterSpacing:
      "5px",
  },

  relatedInfo: {
    padding:
      "15px 0 0",
  },

  relatedCategory: {
    margin:
      "0 0 7px",
    fontSize:
      "8px",
    fontWeight:
      "600",
    letterSpacing:
      "2px",
    color:
      "#888",
    textTransform:
      "uppercase",
  },

  relatedProductName: {
    margin:
      "0 0 8px",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "18px",
    fontWeight:
      "400",
    lineHeight:
      "1.3",
  },

  relatedPrice: {
    margin: 0,
    fontSize:
      "13px",
    color:
      "#111",
  },

  relatedLoading: {
    margin:
      "30px 0",
    color:
      "#777",
    fontSize:
      "13px",
  },

  noRelated: {
    margin:
      "30px 0",
    color:
      "#777",
    fontSize:
      "13px",
  },

  /* =======================================================
     NOT FOUND
  ======================================================= */

  notFound: {
    minHeight:
      "70vh",
    padding:
      "100px 24px",
    textAlign:
      "center",
  },

  eyebrow: {
    margin:
      "0 0 12px",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "3px",
  },

  notFoundTitle: {
    margin:
      "0 0 20px",
    fontFamily:
      "Georgia, serif",
    fontSize:
      "44px",
    fontWeight:
      "400",
  },

  errorText: {
    margin:
      "0 auto 25px",
    maxWidth:
      "600px",
    color:
      "#b42318",
    fontSize:
      "13px",
  },

  primaryButton: {
    padding:
      "15px 25px",
    border:
      "none",
    background:
      "#111",
    color:
      "#fff",
    cursor:
      "pointer",
    fontSize:
      "10px",
    fontWeight:
      "600",
    letterSpacing:
      "1.5px",
  },
};