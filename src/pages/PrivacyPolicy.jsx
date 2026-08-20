import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <>
      <style>{`
        .vorn-privacy-page {
          min-height: 70vh;
          background: #ffffff;
          color: #111111;
          padding: 90px 24px 110px;
        }

        .vorn-privacy-container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
        }

        .vorn-privacy-header {
          text-align: center;
          margin-bottom: 65px;
        }

        .vorn-privacy-eyebrow {
          margin: 0 0 14px;
          font-family: Georgia, serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .vorn-privacy-title {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(42px, 6vw, 70px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .vorn-privacy-subtitle {
          max-width: 660px;
          margin: 24px auto 0;
          color: #666666;
          font-size: 15px;
          line-height: 1.8;
        }

        .vorn-privacy-section {
          padding: 34px 0;
          border-top: 1px solid #dddddd;
        }

        .vorn-privacy-section:last-of-type {
          border-bottom: 1px solid #dddddd;
        }

        .vorn-privacy-section h2 {
          margin: 0 0 16px;
          font-family: Georgia, serif;
          font-size: 25px;
          font-weight: 400;
        }

        .vorn-privacy-section h3 {
          margin: 25px 0 10px;
          font-size: 14px;
          font-weight: 700;
        }

        .vorn-privacy-section p {
          margin: 0 0 13px;
          color: #666666;
          font-size: 14px;
          line-height: 1.85;
        }

        .vorn-privacy-section p:last-child {
          margin-bottom: 0;
        }

        .vorn-privacy-list {
          margin: 15px 0 0;
          padding-left: 20px;
          color: #666666;
        }

        .vorn-privacy-list li {
          margin-bottom: 10px;
          padding-left: 5px;
          font-size: 14px;
          line-height: 1.7;
        }

        .vorn-privacy-highlight {
          margin-top: 20px;
          padding: 20px 22px;
          border-left: 3px solid #111111;
          background: #f7f7f7;
          color: #444444;
          font-size: 13px;
          line-height: 1.75;
        }

        .vorn-privacy-contact {
          margin-top: 70px;
          padding: 42px 30px;
          background: #111111;
          color: #ffffff;
          text-align: center;
        }

        .vorn-privacy-contact h2 {
          margin: 0 0 12px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
        }

        .vorn-privacy-contact p {
          max-width: 540px;
          margin: 0 auto 24px;
          color: #bdbdbd;
          font-size: 14px;
          line-height: 1.7;
        }

        .vorn-privacy-contact a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 24px;
          border: 1px solid #ffffff;
          color: #ffffff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .vorn-privacy-contact a:hover {
          background: #ffffff;
          color: #111111;
        }

        @media (max-width: 700px) {
          .vorn-privacy-page {
            padding: 65px 18px 80px;
          }

          .vorn-privacy-header {
            margin-bottom: 45px;
          }

          .vorn-privacy-title {
            font-size: 46px;
          }

          .vorn-privacy-subtitle {
            font-size: 14px;
          }

          .vorn-privacy-section {
            padding: 28px 0;
          }

          .vorn-privacy-section h2 {
            font-size: 23px;
          }

          .vorn-privacy-contact {
            margin-top: 50px;
            padding: 34px 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-privacy-contact a {
            transition: none;
          }
        }
      `}</style>

      <main className="vorn-privacy-page">
        <div className="vorn-privacy-container">

          <header className="vorn-privacy-header">
            <p className="vorn-privacy-eyebrow">
              Customer Care
            </p>

            <h1 className="vorn-privacy-title">
              Privacy Policy
            </h1>

            <p className="vorn-privacy-subtitle">
              This page explains the types of information
              that may be collected when you use VORN and
              how that information may be used to operate
              and improve our services.
            </p>
          </header>

          <section className="vorn-privacy-section">
            <h2>
              Information We Collect
            </h2>

            <p>
              When you use our website, place an order,
              create an account or contact us, we may
              receive information that you provide to us.
            </p>

            <ul className="vorn-privacy-list">
              <li>
                Name and contact details.
              </li>

              <li>
                Shipping and delivery information.
              </li>

              <li>
                Account information.
              </li>

              <li>
                Order and purchase information.
              </li>

              <li>
                Information you provide when contacting
                customer care.
              </li>
            </ul>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              How We Use Information
            </h2>

            <p>
              Information may be used to operate the
              website and provide the services you request.
            </p>

            <ul className="vorn-privacy-list">
              <li>
                Process and manage orders.
              </li>

              <li>
                Provide delivery and order-related
                communication.
              </li>

              <li>
                Provide customer support.
              </li>

              <li>
                Maintain and manage customer accounts.
              </li>

              <li>
                Improve website functionality and
                customer experience.
              </li>

              <li>
                Detect, prevent or investigate suspicious
                activity where appropriate.
              </li>
            </ul>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Account Information
            </h2>

            <p>
              If you create an account, information
              associated with your account may be used to
              provide account-related features such as
              order history and account management.
            </p>

            <p>
              Please keep your login credentials
              confidential and do not share them with
              other people.
            </p>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Payment Information
            </h2>

            <p>
              Payments may be processed through third-party
              payment services used by the website.
            </p>

            <div className="vorn-privacy-highlight">
              Payment credentials should be entered only
              through the secure payment interface provided
              during checkout. VORN does not ask customers
              to send card or payment credentials through
              email or customer-care messages.
            </div>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Website Usage & Cookies
            </h2>

            <p>
              The website may use technical information,
              browser information and similar data to
              maintain functionality, security and
              performance.
            </p>

            <p>
              Depending on the services enabled on the
              website, cookies or similar technologies may
              be used to remember preferences and support
              website functionality.
            </p>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Third-Party Services
            </h2>

            <p>
              We may rely on third-party services to
              provide certain website functionality, such
              as authentication, database services,
              payment processing, email delivery or
              analytics.
            </p>

            <p>
              Information shared with such services is
              handled according to the applicable service
              and its privacy practices.
            </p>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Data Security
            </h2>

            <p>
              We take reasonable measures to protect
              information handled through the website.
              However, no online system can be guaranteed
              to be completely secure.
            </p>

            <p>
              Security controls, access permissions and
              database policies may be reviewed and
              improved as the website develops.
            </p>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Information Sharing
            </h2>

            <p>
              We do not use customer information for
              purposes unrelated to operating the website
              and providing requested services without an
              applicable reason or permission.
            </p>

            <p>
              Information may be shared with service
              providers when necessary to provide
              services such as payment processing,
              delivery, authentication, email or website
              infrastructure.
            </p>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Your Information
            </h2>

            <p>
              Depending on applicable law and the services
              available on the website, you may have
              rights relating to your personal information.
            </p>

            <p>
              If you have a privacy-related request,
              please contact VORN customer care with
              enough information for us to understand
              your request.
            </p>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Policy Updates
            </h2>

            <p>
              This Privacy Policy may be updated from time
              to time as the website, services or applicable
              requirements change.
            </p>

            <p>
              Any updated version will be made available
              on this page.
            </p>
          </section>

          <section className="vorn-privacy-section">
            <h2>
              Contact Us
            </h2>

            <p>
              If you have questions about this Privacy
              Policy or how information is handled, please
              contact VORN customer care.
            </p>
          </section>

          <section className="vorn-privacy-contact">
            <h2>
              Have a privacy question?
            </h2>

            <p>
              Contact VORN customer care and we'll help
              you with your privacy-related request.
            </p>

            <Link to="/contact">
              Contact Us
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}

export default PrivacyPolicy;