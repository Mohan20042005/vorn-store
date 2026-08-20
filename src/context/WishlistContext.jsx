import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WishlistContext =
  createContext(null);

const WISHLIST_STORAGE_KEY =
  "vorn_wishlist";

/* =========================================================
   HELPERS
========================================================= */

function normalizeProduct(product) {
  if (!product || !product.id) {
    return null;
  }

  return {
    ...product,

    id: product.id,

    name:
      product.name ||
      "VORN Product",

    slug:
      product.slug ||
      "",

    price:
      Number(
        product.price ||
          product.sale_price ||
          product.base_price ||
          0
      ),

    sale_price:
      product.sale_price ??
      null,

    base_price:
      product.base_price ??
      null,

    category:
      product.category ||
      "VORN COLLECTION",

    image:
      product.image ||
      product.image_url ||
      (
        Array.isArray(
          product.images
        )
          ? product.images[0]
          : null
      ) ||
      null,
  };
}

/* =========================================================
   PROVIDER
========================================================= */

export function WishlistProvider({
  children,
}) {
  const [
    wishlistItems,
    setWishlistItems,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          WISHLIST_STORAGE_KEY
        );

      if (!saved) {
        return [];
      }

      const parsed =
        JSON.parse(saved);

      if (
        !Array.isArray(parsed)
      ) {
        return [];
      }

      return parsed
        .map(
          normalizeProduct
        )
        .filter(Boolean);
    } catch (error) {
      console.error(
        "Wishlist loading error:",
        error
      );

      return [];
    }
  });

  /* =======================================================
     SAVE WISHLIST
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(
          wishlistItems
        )
      );
    } catch (error) {
      console.error(
        "Wishlist saving error:",
        error
      );
    }
  }, [wishlistItems]);

  /* =======================================================
     CHECK WISHLIST
  ======================================================= */

  function isInWishlist(
    productId
  ) {
    return wishlistItems.some(
      (item) =>
        item.id === productId
    );
  }

  /* =======================================================
     ADD TO WISHLIST
  ======================================================= */

  function addToWishlist(
    product
  ) {
    const normalizedProduct =
      normalizeProduct(
        product
      );

    if (
      !normalizedProduct
    ) {
      return false;
    }

    setWishlistItems(
      (previousItems) => {
        const exists =
          previousItems.some(
            (item) =>
              item.id ===
              normalizedProduct.id
          );

        if (exists) {
          return previousItems;
        }

        return [
          ...previousItems,
          normalizedProduct,
        ];
      }
    );

    return true;
  }

  /* =======================================================
     REMOVE FROM WISHLIST
  ======================================================= */

  function removeFromWishlist(
    productId
  ) {
    setWishlistItems(
      (previousItems) =>
        previousItems.filter(
          (item) =>
            item.id !==
            productId
        )
    );
  }

  /* =======================================================
     TOGGLE WISHLIST
  ======================================================= */

  function toggleWishlist(
    product
  ) {
    const normalizedProduct =
      normalizeProduct(
        product
      );

    if (
      !normalizedProduct
    ) {
      return false;
    }

    const exists =
      wishlistItems.some(
        (item) =>
          item.id ===
          normalizedProduct.id
      );

    if (exists) {
      removeFromWishlist(
        normalizedProduct.id
      );

      return false;
    }

    addToWishlist(
      normalizedProduct
    );

    return true;
  }

  /* =======================================================
     CLEAR WISHLIST
  ======================================================= */

  function clearWishlist() {
    setWishlistItems([]);
  }

  /* =======================================================
     WISHLIST COUNT
  ======================================================= */

  const wishlistCount =
    useMemo(() => {
      return wishlistItems.length;
    }, [wishlistItems]);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = {
    wishlistItems,

    wishlistCount,

    isInWishlist,

    addToWishlist,

    removeFromWishlist,

    toggleWishlist,

    clearWishlist,
  };

  return (
    <WishlistContext.Provider
      value={value}
    >
      {children}
    </WishlistContext.Provider>
  );
}

/* =========================================================
   USE WISHLIST
========================================================= */

export function useWishlist() {
  const context =
    useContext(
      WishlistContext
    );

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}
