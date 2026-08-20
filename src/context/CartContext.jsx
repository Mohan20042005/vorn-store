import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "vorn_cart";

/*
  ============================================================
  CART HELPERS
  ============================================================
*/

function normalizeQuantity(quantity) {
  const value = Number(quantity);

  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function normalizePrice(product) {
  if (!product) {
    return 0;
  }

  /*
    Product price priority:
    sale_price → base_price → price
  */

  if (
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    product.sale_price !== "" &&
    Number(product.sale_price) > 0
  ) {
    return Number(product.sale_price);
  }

  if (
    product.base_price !== null &&
    product.base_price !== undefined &&
    product.base_price !== "" &&
    Number(product.base_price) > 0
  ) {
    return Number(product.base_price);
  }

  if (
    product.price !== null &&
    product.price !== undefined &&
    product.price !== "" &&
    Number(product.price) > 0
  ) {
    return Number(product.price);
  }

  return 0;
}

function normalizeStock(stock) {
  if (
    stock === null ||
    stock === undefined ||
    stock === ""
  ) {
    return null;
  }

  const value = Number(stock);

  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
}

function limitQuantity(quantity, stock) {
  const normalizedQuantity =
    normalizeQuantity(quantity);

  const normalizedStock =
    normalizeStock(stock);

  /*
    If stock is not supplied, don't impose a limit.
  */

  if (normalizedStock === null) {
    return normalizedQuantity;
  }

  /*
    Product is out of stock.
  */

  if (normalizedStock <= 0) {
    return 0;
  }

  return Math.min(
    normalizedQuantity,
    normalizedStock
  );
}

function normalizeCartItem(item) {
  if (!item || !item.id) {
    return null;
  }

  const stock = normalizeStock(item.stock);

  const quantity = limitQuantity(
    item.quantity,
    stock
  );

  if (quantity <= 0) {
    return null;
  }

  return {
    ...item,

    id: item.id,

    name:
      item.name ||
      "VORN Product",

    price: normalizePrice(item),

    size:
      item.size ||
      null,

    quantity,

    ...(stock !== null
      ? { stock }
      : {}),
  };
}

/*
  ============================================================
  CART PROVIDER
  ============================================================
*/

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (!savedCart) {
        return [];
      }

      const parsedCart =
        JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart
        .map(normalizeCartItem)
        .filter(Boolean);
    } catch (error) {
      console.error(
        "Cart loading error:",
        error
      );

      return [];
    }
  });

  /*
    ==========================================================
    SAVE CART
    ==========================================================
  */

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Cart saving error:",
        error
      );
    }
  }, [cartItems]);

  /*
    ==========================================================
    ADD TO CART
    ==========================================================
  */

  function addToCart(product) {
    if (!product || !product.id) {
      console.error(
        "Cannot add invalid product to cart."
      );

      return false;
    }

    const stock =
      normalizeStock(product.stock);

    const requestedQuantity =
      normalizeQuantity(
        product.quantity || 1
      );

    /*
      Stop immediately if product is out of stock.
    */

    if (
      stock !== null &&
      stock <= 0
    ) {
      console.warn(
        "Product is out of stock."
      );

      return false;
    }

    const productId = product.id;

    const productSize =
      product.size || null;

    const productPrice =
      normalizePrice(product);

    setCartItems((previousItems) => {
      const existingItem =
        previousItems.find(
          (item) =>
            item.id === productId &&
            item.size === productSize
        );

      /*
        ======================================================
        EXISTING ITEM
        ======================================================
      */

      if (existingItem) {
        const existingQuantity =
          normalizeQuantity(
            existingItem.quantity
          );

        const newQuantity =
          existingQuantity +
          requestedQuantity;

        const finalQuantity =
          limitQuantity(
            newQuantity,
            stock !== null
              ? stock
              : existingItem.stock
          );

        if (finalQuantity <= 0) {
          return previousItems;
        }

        return previousItems.map((item) =>
          item.id === productId &&
          item.size === productSize
            ? {
                ...item,

                /*
                  Keep latest product information.
                */

                ...product,

                id: productId,

                name:
                  product.name ||
                  item.name ||
                  "VORN Product",

                price:
                  productPrice ||
                  item.price ||
                  0,

                size: productSize,

                quantity:
                  finalQuantity,

                ...(stock !== null
                  ? { stock }
                  : item.stock !==
                    undefined
                  ? {
                      stock:
                        item.stock,
                    }
                  : {}),
              }
            : item
        );
      }

      /*
        ======================================================
        NEW ITEM
        ======================================================
      */

      const finalQuantity =
        limitQuantity(
          requestedQuantity,
          stock
        );

      if (finalQuantity <= 0) {
        return previousItems;
      }

      return [
        ...previousItems,
        {
          ...product,

          id: productId,

          name:
            product.name ||
            "VORN Product",

          price: productPrice,

          size: productSize,

          quantity:
            finalQuantity,

          ...(stock !== null
            ? { stock }
            : {}),
        },
      ];
    });

    return true;
  }

  /*
    ==========================================================
    UPDATE QUANTITY
    ==========================================================
  */

  function updateQuantity(
    productId,
    quantity,
    productSize = null
  ) {
    const requestedQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        requestedQuantity
      )
    ) {
      return;
    }

    /*
      Quantity 0 means remove.
    */

    if (requestedQuantity <= 0) {
      removeFromCart(
        productId,
        productSize
      );

      return;
    }

    setCartItems((previousItems) =>
      previousItems
        .map((item) => {
          if (
            item.id !== productId ||
            item.size !== productSize
          ) {
            return item;
          }

          const finalQuantity =
            limitQuantity(
              requestedQuantity,
              item.stock
            );

          if (finalQuantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity:
              finalQuantity,
          };
        })
        .filter(Boolean)
    );
  }

  /*
    ==========================================================
    INCREASE QUANTITY
    ==========================================================
  */

  function increaseQuantity(
    productId,
    productSize = null
  ) {
    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (
          item.id !== productId ||
          item.size !== productSize
        ) {
          return item;
        }

        const currentQuantity =
          normalizeQuantity(
            item.quantity
          );

        const nextQuantity =
          currentQuantity + 1;

        const finalQuantity =
          limitQuantity(
            nextQuantity,
            item.stock
          );

        return {
          ...item,
          quantity:
            finalQuantity,
        };
      })
    );
  }

  /*
    ==========================================================
    DECREASE QUANTITY
    ==========================================================
  */

  function decreaseQuantity(
    productId,
    productSize = null
  ) {
    setCartItems((previousItems) =>
      previousItems
        .map((item) => {
          if (
            item.id !== productId ||
            item.size !== productSize
          ) {
            return item;
          }

          const currentQuantity =
            normalizeQuantity(
              item.quantity
            );

          const nextQuantity =
            currentQuantity - 1;

          if (nextQuantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity:
              nextQuantity,
          };
        })
        .filter(Boolean)
    );
  }

  /*
    ==========================================================
    REMOVE ITEM
    ==========================================================
  */

  function removeFromCart(
    productId,
    productSize = null
  ) {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) =>
          !(
            item.id === productId &&
            item.size === productSize
          )
      )
    );
  }

  /*
    ==========================================================
    CLEAR CART
    ==========================================================
  */

  function clearCart() {
    setCartItems([]);
  }

  /*
    ==========================================================
    CART COUNT
    ==========================================================
  */

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        normalizeQuantity(
          item.quantity
        ),
      0
    );
  }, [cartItems]);

  /*
    ==========================================================
    SUBTOTAL
    ==========================================================
  */

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => {
        const price =
          normalizePrice(item);

        const quantity =
          normalizeQuantity(
            item.quantity
          );

        return (
          total +
          price * quantity
        );
      },
      0
    );
  }, [cartItems]);

  /*
    ==========================================================
    SHIPPING
    ==========================================================
  */

  const shipping = useMemo(() => {
    if (cartItems.length === 0) {
      return 0;
    }

    /*
      Free shipping above ₹2,999
    */

    if (subtotal >= 2999) {
      return 0;
    }

    return 99;
  }, [
    cartItems.length,
    subtotal,
  ]);

  /*
    ==========================================================
    GRAND TOTAL
    ==========================================================
  */

  const total = useMemo(() => {
    return subtotal + shipping;
  }, [
    subtotal,
    shipping,
  ]);

  /*
    ==========================================================
    CONTEXT VALUE
    ==========================================================
  */

  const value = {
    cartItems,

    cartCount,

    subtotal,

    shipping,

    total,

    addToCart,

    updateQuantity,

    increaseQuantity,

    decreaseQuantity,

    removeFromCart,

    clearCart,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
  ============================================================
  USE CART
  ============================================================
*/

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}