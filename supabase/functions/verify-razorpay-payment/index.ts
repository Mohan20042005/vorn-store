import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

function isValidUUID(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    /*
      ==========================================
      ENVIRONMENT VARIABLES
      ==========================================
    */

    const razorpayKeySecret =
      Deno.env.get("RAZORPAY_KEY_SECRET");

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!razorpayKeySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not configured.",
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Supabase server environment is not configured.",
      );
    }

    /*
      ==========================================
      REQUEST BODY
      ==========================================
    */

    const body = await req.json();

    const {
      orderNumber,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems = [],
      formData = {},
    } = body ?? {};

    if (!razorpay_order_id) {
      throw new Error(
        "Razorpay order ID is missing.",
      );
    }

    if (!razorpay_payment_id) {
      throw new Error(
        "Razorpay payment ID is missing.",
      );
    }

    if (!razorpay_signature) {
      throw new Error(
        "Razorpay signature is missing.",
      );
    }

    if (!orderNumber) {
      throw new Error(
        "Order number is missing.",
      );
    }

    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      throw new Error("Cart is empty.");
    }

    /*
      ==========================================
      VERIFY RAZORPAY SIGNATURE
      ==========================================
    */

    const encoder = new TextEncoder();

    const keyData =
      encoder.encode(razorpayKeySecret);

    const messageData =
      encoder.encode(
        `${razorpay_order_id}|${razorpay_payment_id}`,
      );

    const cryptoKey =
      await crypto.subtle.importKey(
        "raw",
        keyData,
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["sign"],
      );

    const signatureBuffer =
      await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        messageData,
      );

    const expectedSignature =
      Array.from(
        new Uint8Array(signatureBuffer),
      )
        .map((byte) =>
          byte
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      console.error(
        "Invalid Razorpay signature.",
      );

      throw new Error(
        "Payment verification failed.",
      );
    }

    /*
      ==========================================
      SUPABASE ADMIN CLIENT
      ==========================================
    */

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        },
      );

    /*
      ==========================================
      GET LOGGED-IN USER
      ==========================================
    */

    let userId: string | null = null;

    const authorization =
      req.headers.get("Authorization");

    if (
      authorization &&
      authorization.startsWith("Bearer ")
    ) {
      const accessToken =
        authorization.replace(
          "Bearer ",
          "",
        );

      const {
        data: userData,
      } = await supabase.auth.getUser(
        accessToken,
      );

      userId =
        userData?.user?.id || null;
    }

    /*
      ==========================================
      CALCULATE ORDER TOTAL
      ==========================================
    */

    let subtotal = 0;

    for (const item of cartItems) {
      const price =
        Number(item?.price || 0);

      const quantity =
        Number(item?.quantity || 0);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < 0 ||
        quantity <= 0
      ) {
        throw new Error(
          "Invalid cart item.",
        );
      }

      subtotal +=
        price * quantity;
    }

    const shippingAmount = 0;
    const discountAmount = 0;

    const totalAmount =
      subtotal -
      discountAmount +
      shippingAmount;

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      throw new Error(
        "Invalid order total.",
      );
    }

    /*
      ==========================================
      PREVENT DUPLICATE PAYMENT
      ==========================================
    */

    const {
      data: existingPayment,
      error: existingPaymentError,
    } = await supabase
      .from("orders")
      .select(
        "id, order_number",
      )
      .eq(
        "razorpay_payment_id",
        razorpay_payment_id,
      )
      .maybeSingle();

    if (existingPaymentError) {
      console.error(
        "Existing payment lookup error:",
        existingPaymentError,
      );
    }

    if (existingPayment) {
      return jsonResponse({
        success: true,
        orderId:
          existingPayment.id,
        orderNumber:
          existingPayment.order_number,
        message:
          "Payment already verified.",
      });
    }

    /*
      ==========================================
      SHIPPING DETAILS
      ==========================================
    */

    const shippingName =
      `${formData?.firstName || ""} ${
        formData?.lastName || ""
      }`
        .trim();

    /*
      ==========================================
      CREATE ORDER
      ==========================================
    */

    const orderInsert = {
      user_id:
        isValidUUID(userId)
          ? userId
          : null,

      order_number:
        orderNumber,

      status:
        "confirmed",

      payment_status:
        "paid",

      payment_method:
        "razorpay",

      subtotal:
        subtotal,

      discount_amount:
        discountAmount,

      shipping_amount:
        shippingAmount,

      total_amount:
        totalAmount,

      shipping_name:
        shippingName,

      shipping_phone:
        String(
          formData?.phone || "",
        ).trim(),

      shipping_address_line1:
        String(
          formData?.address || "",
        ).trim(),

      shipping_address_line2:
        null,

      shipping_city:
        String(
          formData?.city || "",
        ).trim(),

      shipping_state:
        String(
          formData?.state || "",
        ).trim(),

      shipping_postal_code:
        String(
          formData?.postalCode || "",
        ).trim(),

      shipping_country:
        "India",

      notes:
        String(
          formData?.notes || "",
        ).trim() || null,

      razorpay_order_id:
        razorpay_order_id,

      razorpay_payment_id:
        razorpay_payment_id,

      razorpay_signature:
        razorpay_signature,
    };

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert(orderInsert)
      .select(
        "id, order_number",
      )
      .single();

    if (orderError) {
      console.error(
        "Order insert error:",
        orderError,
      );

      throw new Error(
        orderError.message ||
          "Unable to save order.",
      );
    }

    /*
      ==========================================
      CREATE ORDER ITEMS
      ==========================================
    */

    const orderItems =
      cartItems.map((item) => {
        const unitPrice =
          Number(item?.price || 0);

        const quantity =
          Number(item?.quantity || 0);

        const productUUID =
          isValidUUID(
            item?.productUUID,
          )
            ? item.productUUID
            : isValidUUID(
                item?.productId,
              )
            ? item.productId
            : null;

        const variantUUID =
          isValidUUID(
            item?.variantId,
          )
            ? item.variantId
            : null;

        return {
          order_id:
            order.id,

          product_id:
            productUUID,

          variant_id:
            variantUUID,

          product_name:
            String(
              item?.name ||
                "VORN Product",
            ),

          sku:
            item?.sku
              ? String(item.sku)
              : null,

          selected_size:
            item?.size
              ? String(item.size)
              : null,

          selected_color:
            item?.color
              ? String(item.color)
              : null,

          unit_price:
            unitPrice,

          quantity:
            quantity,

          total_price:
            unitPrice *
            quantity,
        };
      });

    const {
      error: orderItemsError,
    } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error(
        "Order items insert error:",
        orderItemsError,
      );

      throw new Error(
        orderItemsError.message ||
          "Unable to save order items.",
      );
    }

    /*
      ==========================================
      SUCCESS
      ==========================================
    */

    console.log(
      "Payment verified and order saved:",
      {
        orderId:
          order.id,

        orderNumber:
          order.order_number,

        razorpayPaymentId:
          razorpay_payment_id,
      },
    );

    return jsonResponse({
      success: true,

      orderId:
        order.id,

      orderNumber:
        order.order_number,

      razorpayOrderId:
        razorpay_order_id,

      razorpayPaymentId:
        razorpay_payment_id,

      paymentStatus:
        "paid",

      status:
        "confirmed",
    });
  } catch (error) {
    console.error(
      "verify-razorpay-payment error:",
      error,
    );

    return jsonResponse(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      400,
    );
  }
});