const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // =====================================================
  // CORS
  // =====================================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // =====================================================
  // ONLY POST REQUESTS
  // =====================================================

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        message: "Method not allowed",
      },
      405
    );
  }

  try {
    // ===================================================
    // GET RESEND API KEY
    // ===================================================

    const resendApiKey =
      Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error(
        "RESEND_API_KEY is not configured."
      );

      return jsonResponse(
        {
          success: false,
          message:
            "Email service is not configured.",
        },
        500
      );
    }

    // ===================================================
    // READ REQUEST BODY
    // ===================================================

    const body = await req.json();

    const name = String(
      body?.name ?? ""
    ).trim();

    const email = String(
      body?.email ?? ""
    ).trim();

    const phone = String(
      body?.phone ?? ""
    ).trim();

    const subject = String(
      body?.subject ?? ""
    ).trim();

    const message = String(
      body?.message ?? ""
    ).trim();

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!name) {
      return jsonResponse(
        {
          success: false,
          message: "Name is required.",
        },
        400
      );
    }

    if (!email) {
      return jsonResponse(
        {
          success: false,
          message: "Email is required.",
        },
        400
      );
    }

    if (!message) {
      return jsonResponse(
        {
          success: false,
          message: "Message is required.",
        },
        400
      );
    }

    // ===================================================
    // BASIC EMAIL VALIDATION
    // ===================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return jsonResponse(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        400
      );
    }

    // ===================================================
    // EMAIL SUBJECT
    // ===================================================

    const emailSubject = subject
      ? `VORN Customer Enquiry — ${subject}`
      : "VORN Customer Enquiry";

    // ===================================================
    // EMAIL HTML
    // ===================================================

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>VORN Customer Enquiry</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#111111;
  "
>

  <div
    style="
      width:100%;
      padding:40px 15px;
      box-sizing:border-box;
      background:#f5f5f5;
    "
  >

    <div
      style="
        max-width:650px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #e5e5e5;
      "
    >

      <!-- HEADER -->

      <div
        style="
          padding:30px;
          background:#111111;
          color:#ffffff;
        "
      >

        <div
          style="
            font-size:28px;
            font-weight:700;
            letter-spacing:5px;
          "
        >
          VORN
        </div>

        <div
          style="
            margin-top:8px;
            font-size:11px;
            color:#bbbbbb;
            letter-spacing:2px;
            text-transform:uppercase;
          "
        >
          Customer Enquiry
        </div>

      </div>


      <!-- CONTENT -->

      <div
        style="
          padding:30px;
        "
      >

        <h2
          style="
            margin:0 0 25px;
            font-size:22px;
            font-weight:500;
          "
        >
          New Customer Message
        </h2>


        <!-- NAME -->

        <div
          style="
            padding-bottom:18px;
            margin-bottom:18px;
            border-bottom:1px solid #eeeeee;
          "
        >

          <div
            style="
              margin-bottom:7px;
              color:#777777;
              font-size:10px;
              font-weight:700;
              letter-spacing:1.5px;
              text-transform:uppercase;
            "
          >
            Name
          </div>

          <div
            style="
              font-size:15px;
              line-height:1.6;
            "
          >
            ${escapeHtml(name)}
          </div>

        </div>


        <!-- EMAIL -->

        <div
          style="
            padding-bottom:18px;
            margin-bottom:18px;
            border-bottom:1px solid #eeeeee;
          "
        >

          <div
            style="
              margin-bottom:7px;
              color:#777777;
              font-size:10px;
              font-weight:700;
              letter-spacing:1.5px;
              text-transform:uppercase;
            "
          >
            Email
          </div>

          <div
            style="
              font-size:15px;
              line-height:1.6;
            "
          >

            <a
              href="mailto:${escapeAttribute(email)}"
              style="
                color:#111111;
                text-decoration:none;
              "
            >
              ${escapeHtml(email)}
            </a>

          </div>

        </div>


        <!-- PHONE -->

        <div
          style="
            padding-bottom:18px;
            margin-bottom:18px;
            border-bottom:1px solid #eeeeee;
          "
        >

          <div
            style="
              margin-bottom:7px;
              color:#777777;
              font-size:10px;
              font-weight:700;
              letter-spacing:1.5px;
              text-transform:uppercase;
            "
          >
            Phone
          </div>

          <div
            style="
              font-size:15px;
              line-height:1.6;
            "
          >
            ${
              phone
                ? escapeHtml(phone)
                : "Not provided"
            }
          </div>

        </div>


        <!-- SUBJECT -->

        <div
          style="
            padding-bottom:18px;
            margin-bottom:18px;
            border-bottom:1px solid #eeeeee;
          "
        >

          <div
            style="
              margin-bottom:7px;
              color:#777777;
              font-size:10px;
              font-weight:700;
              letter-spacing:1.5px;
              text-transform:uppercase;
            "
          >
            Subject
          </div>

          <div
            style="
              font-size:15px;
              line-height:1.6;
            "
          >
            ${
              subject
                ? escapeHtml(subject)
                : "General enquiry"
            }
          </div>

        </div>


        <!-- MESSAGE -->

        <div>

          <div
            style="
              margin-bottom:10px;
              color:#777777;
              font-size:10px;
              font-weight:700;
              letter-spacing:1.5px;
              text-transform:uppercase;
            "
          >
            Message
          </div>

          <div
            style="
              padding:18px;
              background:#f7f7f7;
              border-left:3px solid #111111;
              font-size:14px;
              line-height:1.8;
              white-space:pre-wrap;
              word-break:break-word;
            "
          >
            ${escapeHtml(message)}
          </div>

        </div>

      </div>


      <!-- FOOTER -->

      <div
        style="
          padding:20px 30px;
          border-top:1px solid #eeeeee;
          color:#888888;
          font-size:11px;
          line-height:1.6;
        "
      >
        This email was submitted through
        the VORN website contact form.
      </div>

    </div>

  </div>

</body>

</html>
`;

    // ===================================================
    // SEND THROUGH RESEND API
    // ===================================================

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${resendApiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          from:
            "VORN Website <onboarding@resend.dev>",

          to: [
            "vornwearruthless@gmail.com",
          ],

          reply_to: email,

          subject: emailSubject,

          html,
        }),
      }
    );

    // ===================================================
    // RESEND RESPONSE
    // ===================================================

    const resendData =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend API error:",
        resendData
      );

      return jsonResponse(
        {
          success: false,
          message:
            resendData?.message ||
            "Unable to send email.",
        },
        500
      );
    }

    // ===================================================
    // SUCCESS
    // ===================================================

    console.log(
      "Email sent successfully:",
      resendData
    );

    return jsonResponse(
      {
        success: true,
        message:
          "Email sent successfully.",
        id: resendData?.id ?? null,
      },
      200
    );

  } catch (error) {

    // ===================================================
    // ERROR HANDLING
    // ===================================================

    console.error(
      "send-contact-email error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong.";

    return jsonResponse(
      {
        success: false,
        message: errorMessage,
      },
      500
    );
  }
});


// =====================================================
// JSON RESPONSE HELPER
// =====================================================

function jsonResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...corsHeaders,

        "Content-Type":
          "application/json",
      },
    }
  );
}


// =====================================================
// HTML ESCAPING
// =====================================================

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =====================================================
// ATTRIBUTE ESCAPING
// =====================================================

function escapeAttribute(
  value: string
) {
  return escapeHtml(value);
}