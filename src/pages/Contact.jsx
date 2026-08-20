import { useState } from "react";
import { Link } from "react-router-dom";

import storeConfig from "../config/storeConfig";
import { supabase } from "../services/supabaseClient";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!form.message.trim()) {
      setErrorMessage("Please enter your message.");
      return;
    }

    try {
      setLoading(true);

      // =====================================================
      // CLEAN FORM DATA
      // =====================================================

      const contactData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      };

      // =====================================================
      // 1. SEND EMAIL THROUGH SUPABASE EDGE FUNCTION
      // =====================================================

      const { data: emailData, error: emailError } =
        await supabase.functions.invoke(
          "send-contact-email",
          {
            body: contactData,
          }
        );

      if (emailError) {
        console.error(
          "Contact email function error:",
          emailError
        );

        throw new Error(
          emailError.message ||
            "Unable to send your message right now."
        );
      }

      if (!emailData?.success) {
        console.error(
          "Contact email function failed:",
          emailData
        );

        throw new Error(
          emailData?.message ||
            "Email could not be sent."
        );
      }

      // =====================================================
      // 2. SAVE CONTACT MESSAGE IN DATABASE
      // =====================================================

      const { error: databaseError } = await supabase
        .from("contact_messages")
        .insert({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          subject: contactData.subject,
          message: contactData.message,
          status: "new",
        });

      if (databaseError) {
        console.error(
          "Contact database error:",
          databaseError
        );

        // Email has already been sent successfully.
        // We don't block the customer with a false
        // email failure message.
        setSuccessMessage(
          "Your message has been sent successfully. Our team will get back to you soon."
        );

        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        return;
      }

      // =====================================================
      // 3. COMPLETE SUCCESS
      // =====================================================

      setSuccessMessage(
        "Thank you. Your message has been sent successfully. Our team will get back to you soon."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function openWhatsApp() {
    const message = encodeURIComponent(
      "Hi VORN, I need help with my order."
    );

    window.open(
      `${storeConfig.whatsapp.url}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .vorn-contact-page {
          min-height: 75vh;
          background: #ffffff;
          color: #111111;
        }


        .vorn-contact-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 90px 30px;
          box-sizing: border-box;
        }


        /* =====================================================
           HERO
        ===================================================== */

        .vorn-contact-hero {
          max-width: 700px;
          margin: 0 auto 70px;
          text-align: center;
        }


        .vorn-contact-eyebrow {
          margin: 0 0 14px;

          color: #777777;

          font-size: 10px;
          font-weight: 600;

          letter-spacing: 3px;
          text-transform: uppercase;
        }


        .vorn-contact-title {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 52px;
          font-weight: 400;

          line-height: 1.1;
        }


        .vorn-contact-subtitle {
          max-width: 560px;
          margin: 18px auto 0;

          color: #666666;

          font-size: 14px;
          line-height: 1.8;
        }


        /* =====================================================
           CONTENT GRID
        ===================================================== */

        .vorn-contact-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 0.85fr)
            minmax(0, 1.15fr);

          gap: 70px;

          align-items: start;
        }


        /* =====================================================
           CONTACT INFO
        ===================================================== */

        .vorn-contact-info {
          padding-top: 5px;
        }


        .vorn-contact-section-title {
          margin: 0 0 12px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 28px;
          font-weight: 400;
        }


        .vorn-contact-info-description {
          margin: 0 0 32px;

          color: #666666;

          font-size: 14px;
          line-height: 1.8;
        }


        .vorn-contact-info-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }


        .vorn-contact-info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }


        .vorn-contact-info-icon {
          width: 40px;
          height: 40px;

          flex: 0 0 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid #dddddd;

          color: #111111;
        }


        .vorn-contact-info-icon svg {
          width: 18px;
          height: 18px;

          fill: none;
          stroke: currentColor;

          stroke-width: 1.5;

          stroke-linecap: round;
          stroke-linejoin: round;
        }


        .vorn-contact-info-label {
          margin: 0 0 5px;

          color: #777777;

          font-size: 9px;
          font-weight: 600;

          letter-spacing: 1.5px;
          text-transform: uppercase;
        }


        .vorn-contact-info-value {
          margin: 0;

          color: #111111;

          font-size: 14px;
          line-height: 1.6;
        }


        .vorn-contact-info-value a {
          color: #111111;
          text-decoration: none;
        }


        .vorn-contact-info-value a:hover {
          text-decoration: underline;
        }


        /* =====================================================
           WHATSAPP
        ===================================================== */

        .vorn-contact-whatsapp {
          margin-top: 34px;

          width: 100%;

          min-height: 48px;

          border: 1px solid #111111;

          background: #111111;
          color: #ffffff;

          cursor: pointer;

          font-size: 10px;
          font-weight: 600;

          letter-spacing: 1.5px;
          text-transform: uppercase;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .vorn-contact-whatsapp:hover {
          background: #ffffff;
          color: #111111;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .vorn-contact-form-wrapper {
          border: 1px solid #e2e2e2;

          padding: 34px;

          background: #ffffff;
        }


        .vorn-contact-form-title {
          margin: 0 0 8px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 28px;
          font-weight: 400;
        }


        .vorn-contact-form-description {
          margin: 0 0 28px;

          color: #777777;

          font-size: 13px;
          line-height: 1.7;
        }


        .vorn-contact-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }


        .vorn-contact-field-row {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 16px;
        }


        .vorn-contact-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }


        .vorn-contact-label {
          color: #444444;

          font-size: 9px;
          font-weight: 600;

          letter-spacing: 1.5px;
          text-transform: uppercase;
        }


        .vorn-contact-input,
        .vorn-contact-textarea {
          width: 100%;

          box-sizing: border-box;

          border: 1px solid #dcdcdc;

          background: #ffffff;
          color: #111111;

          outline: none;

          font-family:
            Arial,
            sans-serif;

          font-size: 13px;

          transition:
            border-color 0.2s ease;
        }


        .vorn-contact-input {
          height: 46px;

          padding: 0 13px;
        }


        .vorn-contact-textarea {
          min-height: 150px;

          padding: 13px;

          resize: vertical;
        }


        .vorn-contact-input:focus,
        .vorn-contact-textarea:focus {
          border-color: #111111;
        }


        .vorn-contact-input::placeholder,
        .vorn-contact-textarea::placeholder {
          color: #aaaaaa;
        }


        /* =====================================================
           FORM BUTTON
        ===================================================== */

        .vorn-contact-submit {
          width: 100%;

          min-height: 50px;

          border: 1px solid #111111;

          background: #111111;
          color: #ffffff;

          cursor: pointer;

          font-size: 10px;
          font-weight: 600;

          letter-spacing: 1.8px;
          text-transform: uppercase;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .vorn-contact-submit:hover:not(:disabled) {
          background: #333333;
        }


        .vorn-contact-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }


        /* =====================================================
           SUCCESS / ERROR
        ===================================================== */

        .vorn-contact-success {
          margin-bottom: 20px;

          padding: 13px 15px;

          border: 1px solid #c9dfcc;

          background: #f3faf4;
          color: #256b2d;

          font-size: 12px;
          line-height: 1.6;
        }


        .vorn-contact-error {
          margin-bottom: 20px;

          padding: 13px 15px;

          border: 1px solid #edcccc;

          background: #fff5f5;
          color: #a32020;

          font-size: 12px;
          line-height: 1.6;
        }


        /* =====================================================
           BACK LINK
        ===================================================== */

        .vorn-contact-back {
          margin-top: 50px;

          text-align: center;
        }


        .vorn-contact-back a {
          color: #666666;

          font-size: 11px;

          text-decoration: none;

          letter-spacing: 1px;
          text-transform: uppercase;
        }


        .vorn-contact-back a:hover {
          color: #111111;
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 900px) {

          .vorn-contact-container {
            padding:
              70px 24px;
          }


          .vorn-contact-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }


          .vorn-contact-info {
            max-width: 600px;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .vorn-contact-container {
            padding:
              55px 18px;
          }


          .vorn-contact-hero {
            margin-bottom: 45px;
          }


          .vorn-contact-title {
            font-size: 40px;
          }


          .vorn-contact-subtitle {
            font-size: 13px;
          }


          .vorn-contact-section-title,
          .vorn-contact-form-title {
            font-size: 25px;
          }


          .vorn-contact-form-wrapper {
            padding: 22px 18px;
          }


          .vorn-contact-field-row {
            grid-template-columns: 1fr;
            gap: 18px;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {

          .vorn-contact-container {
            padding:
              45px 14px;
          }


          .vorn-contact-title {
            font-size: 34px;
          }


          .vorn-contact-form-wrapper {
            padding: 20px 14px;
          }

        }

      `}</style>


      <main className="vorn-contact-page">

        <div className="vorn-contact-container">


          {/* =================================================
              HERO
          ================================================= */}

          <section className="vorn-contact-hero">

            <p className="vorn-contact-eyebrow">
              CUSTOMER CARE
            </p>


            <h1 className="vorn-contact-title">
              Contact Us
            </h1>


            <p className="vorn-contact-subtitle">
              Have a question about your
              order, products, shipping, or
              anything else? We're here to
              help.
            </p>

          </section>


          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="vorn-contact-grid">


            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <div className="vorn-contact-info">

              <h2 className="vorn-contact-section-title">
                We're here to help.
              </h2>


              <p className="vorn-contact-info-description">
                Reach out to VORN through
                the contact details below or
                send us a message. Our team
                will get back to you as soon
                as possible.
              </p>


              <div className="vorn-contact-info-list">


                {/* =================================================
                    PHONE
                ================================================= */}

                <div className="vorn-contact-info-item">

                  <div className="vorn-contact-info-icon">

                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M6.5 3.5 9 3l2 5-2 1.5a14 14 0 0 0 5 5L15.5 12l5 2 .5 2.5a2 2 0 0 1-2.2 2.4C11 18.2 5.8 13 4.9 5.2A2 2 0 0 1 6.5 3.5Z" />
                    </svg>

                  </div>


                  <div>

                    <p className="vorn-contact-info-label">
                      Phone
                    </p>


                    <p className="vorn-contact-info-value">

                      <a
                        href={`tel:${storeConfig.contact.phone}`}
                      >
                        {storeConfig.contact.phone}
                      </a>

                    </p>

                  </div>

                </div>


                {/* =================================================
                    WHATSAPP
                ================================================= */}

                <div className="vorn-contact-info-item">

                  <div className="vorn-contact-info-icon">

                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20 11.5a8 8 0 0 1-11.8 7.1L4 20l1.4-4A8 8 0 1 1 20 11.5Z" />

                      <path d="M9 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.5.9 1.2 1.5 2.1 2 .2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.4.7c.2.1.3.3.2.5-.2.7-.8 1.2-1.5 1.3-1.3.2-3.1-.7-4.3-1.8-1.1-1-2.1-2.8-1.9-4.1.1-.4.5-.7 1-.8Z" />
                    </svg>

                  </div>


                  <div>

                    <p className="vorn-contact-info-label">
                      WhatsApp
                    </p>


                    <p className="vorn-contact-info-value">

                      <a
                        href={
                          storeConfig.whatsapp.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Chat with VORN
                      </a>

                    </p>

                  </div>

                </div>


                {/* =================================================
                    INSTAGRAM
                ================================================= */}

                <div className="vorn-contact-info-item">

                  <div className="vorn-contact-info-icon">

                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >

                      <rect
                        x="3.5"
                        y="3.5"
                        width="17"
                        height="17"
                        rx="5"
                      />


                      <circle
                        cx="12"
                        cy="12"
                        r="4"
                      />


                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="0.8"
                        fill="currentColor"
                        stroke="none"
                      />

                    </svg>

                  </div>


                  <div>

                    <p className="vorn-contact-info-label">
                      Instagram
                    </p>


                    <p className="vorn-contact-info-value">

                      <a
                        href={
                          storeConfig.social.instagram
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Follow VORN
                      </a>

                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  WHATSAPP BUTTON
              ================================================= */}

              <button
                type="button"
                className="vorn-contact-whatsapp"
                onClick={openWhatsApp}
              >
                Chat on WhatsApp
              </button>

            </div>


            {/* =================================================
                CONTACT FORM
            ================================================= */}

            <div className="vorn-contact-form-wrapper">

              <h2 className="vorn-contact-form-title">
                Send us a message
              </h2>


              <p className="vorn-contact-form-description">
                Fill in the form below and
                our team will get back to you.
              </p>


              {/* =================================================
                  SUCCESS MESSAGE
              ================================================= */}

              {successMessage && (
                <div
                  className="vorn-contact-success"
                  role="status"
                >
                  {successMessage}
                </div>
              )}


              {/* =================================================
                  ERROR MESSAGE
              ================================================= */}

              {errorMessage && (
                <div
                  className="vorn-contact-error"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}


              <form
                className="vorn-contact-form"
                onSubmit={handleSubmit}
              >


                {/* =================================================
                    NAME + EMAIL
                ================================================= */}

                <div className="vorn-contact-field-row">

                  <div className="vorn-contact-field">

                    <label
                      className="vorn-contact-label"
                      htmlFor="contact-name"
                    >
                      Name *
                    </label>


                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                      placeholder="Your name"
                      className="vorn-contact-input"
                      autoComplete="name"
                    />

                  </div>


                  <div className="vorn-contact-field">

                    <label
                      className="vorn-contact-label"
                      htmlFor="contact-email"
                    >
                      Email *
                    </label>


                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={
                        handleChange
                      }
                      placeholder="you@example.com"
                      className="vorn-contact-input"
                      autoComplete="email"
                    />

                  </div>

                </div>


                {/* =================================================
                    PHONE + SUBJECT
                ================================================= */}

                <div className="vorn-contact-field-row">

                  <div className="vorn-contact-field">

                    <label
                      className="vorn-contact-label"
                      htmlFor="contact-phone"
                    >
                      Phone
                    </label>


                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={
                        handleChange
                      }
                      placeholder="+91"
                      className="vorn-contact-input"
                      autoComplete="tel"
                    />

                  </div>


                  <div className="vorn-contact-field">

                    <label
                      className="vorn-contact-label"
                      htmlFor="contact-subject"
                    >
                      Subject
                    </label>


                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={
                        handleChange
                      }
                      placeholder="How can we help?"
                      className="vorn-contact-input"
                    />

                  </div>

                </div>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                <div className="vorn-contact-field">

                  <label
                    className="vorn-contact-label"
                    htmlFor="contact-message"
                  >
                    Message *
                  </label>


                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={
                      handleChange
                    }
                    placeholder="Write your message..."
                    className="vorn-contact-textarea"
                  />

                </div>


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  className="vorn-contact-submit"
                  disabled={loading}
                >
                  {loading
                    ? "SENDING..."
                    : "SEND MESSAGE"}
                </button>

              </form>

            </div>

          </section>


          {/* =================================================
              BACK TO SHOP
          ================================================= */}

          <div className="vorn-contact-back">

            <Link to="/shop">
              ← Continue Shopping
            </Link>

          </div>

        </div>

      </main>
    </>
  );
}

export default Contact;