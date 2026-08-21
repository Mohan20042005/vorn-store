/// <reference lib="deno.ns" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const razorpayKeyId =
      Deno.env.get("RAZORPAY_KEY_ID");

    const razorpayKeySecret =
      Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error(
        "Razorpay secrets are not configured."
      );
    }

    const body = await req.json();

    const cartItems = body?.cartItems || [];
    const formData = body?.formData || {};

    if (!cartItems.length) {
      throw new Error("Cart is empty.");
    }

    // ================================
    // CALCULATE TOTAL
    // ================================

    let subtotal = 0;

    for (const item of cartItems) {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < 0 ||
        quantity <= 0
      ) {
        throw new Error("Invalid cart item.");
      }

      subtotal += price * quantity;
    }

    const shipping = 0;
    const total = subtotal + shipping;

    if (
      !Number.isFinite(total) ||
      total <= 0
    ) {
      throw new Error("Invalid order amount.");
    }

    // Razorpay amount is in paise
    const amountInPaise =
      Math.round(total * 100);

    // ================================
    // ORDER NUMBER
    // ================================

    const orderNumber =
      `VORN-${Date.now()}`;

    // ================================
    // RAZORPAY AUTH
    // ================================

    const auth = btoa(
      `${razorpayKeyId}:${razorpayKeySecret}`
    );

    // ================================
    // CREATE RAZORPAY ORDER
    // ================================

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: orderNumber,

          notes: {
            customer_email:
              formData.email || "",

            customer_phone:
              formData.phone || "",
          },
        }),
      }
    );

    const razorpayData =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay error:",
        razorpayData
      );

      throw new Error(
        razorpayData?.error?.description ||
          "Failed to create Razorpay order."
      );
    }

    // ================================
    // RETURN TO FRONTEND
    // ================================

    return new Response(
      JSON.stringify({
        success: true,

        orderId: null,

        orderNumber,

        razorpayOrderId:
          razorpayData.id,

        amount:
          razorpayData.amount,

        currency:
          razorpayData.currency,

        keyId:
          razorpayKeyId,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },

        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "create-razorpay-order error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },

        status: 400,
      }
    );
  }
});