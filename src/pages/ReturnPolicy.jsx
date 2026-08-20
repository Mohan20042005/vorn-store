import { Link } from "react-router-dom";

function ReturnPolicy() {
  return (
    <>
      <style>{`
        .vorn-return-page {
          min-height: 70vh;
          background: #ffffff;
          color: #111111;
          padding: 90px 24px 110px;
        }

        .vorn-return-container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
        }

        .vorn-return-header {
          text-align: center;
          margin-bottom: 65px;
        }

        .vorn-return-eyebrow {
          margin: 0 0 14px;
          font-family: Georgia, serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .vorn-return-title {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(42px, 6vw, 70px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .vorn-return-subtitle {
          max-width: 650px;
          margin: 24px auto 0;
          color: #666666;
          font-size: 15px;
          line-height: 1.8;
        }

        .vorn-return-section {
          padding: 34px 0;
          border-top: 1px solid #dddddd;
        }

        .vorn-return-section:last-of-type {
          border-bottom: 1px solid #dddddd;
        }

        .vorn-return-section h2 {
          margin: 0 0 16px;
          font-family: Georgia, serif;
          font-size: 25px;
          font-weight: 400;
        }

        .vorn-return-section p {
          margin: 0 0 13px;
          color: #666666;
          font-size: 14px;
          line-height: 1.85;
        }

        .vorn-return-section p:last-child {
          margin-bottom: 0;
        }

        .vorn-return-list {
          margin: 15px 0 0;
          padding-left: 20px;
          color: #666666;
        }

        .vorn-return-list li {
          margin-bottom: 10px;
          padding-left: 5px;
          font-size: 14px;
          line-height: 1.7;
        }

        .vorn-return-highlight {
          margin-top: 20px;
          padding: 20px 22px;
          border-left: 3px solid #111111;
          background: #f7f7f7;
          color: #444444;
          font-size: 13px;
          line-height: 1.75;
        }

        .vorn-return-steps {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 25px;
        }

        .vorn-return-step {
          padding: 24px 20px;
          border: 1px solid #dddddd;
        }

        .vorn-return-step-number {
          display: block;
          margin-bottom: 15px;
          font-family: Georgia, serif;
          font-size: 26px;
        }

        .vorn-return-step h3 {
          margin: 0 0 9px;
          font-size: 14px;
          font-weight: 700;
        }

        .vorn-return-step p {
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
        }

        .vorn-return-contact {
          margin-top: 70px;
          padding: 42px 30px;
          background: #111111;
          color: #ffffff;
          text-align: center;
        }

        .vorn-return-contact h2 {
          margin: 0 0 12px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
        }

        .vorn-return-contact p {
          max-width: 520px;
          margin: 0 auto 24px;
          color: #bdbdbd;
          font-size: 14px;
          line-height: 1.7;
        }

        .vorn-return-contact a {
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

        .vorn-return-contact a:hover {
          background: #ffffff;
          color: #111111;
        }

        @media (max-width: 700px) {
          .vorn-return-page {
            padding: 65px 18px 80px;
          }

          .vorn-return-header {
            margin-bottom: 45px;
          }

          .vorn-return-title {
            font-size: 46px;
          }

          .vorn-return-subtitle {
            font-size: 14px;
          }

          .vorn-return-section {
            padding: 28px 0;
          }

          .vorn-return-section h2 {
            font-size: 23px;
          }

          .vorn-return-steps {
            grid-template-columns: 1fr;
          }

          .vorn-return-contact {
            margin-top: 50px;
            padding: 34px 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-return-contact a {
            transition: none;
          }
        }
      `}</style>

      <main className="vorn-return-page">
        <div className="vorn-return-container">

          <header className="vorn-return-header">
            <p className="vorn-return-eyebrow">
              Customer Care
            </p>

            <h1 className="vorn-return-title">
              Return Policy
            </h1>

            <p className="vorn-return-subtitle">
              Information about returning eligible VORN
              products and getting help with your order.
            </p>
          </header>

          <section className="vorn-return-section">
            <h2>
              Return Eligibility
            </h2>

            <p>
              Return requests are reviewed according to
              the condition of the product and the
              applicable return conditions for the order.
            </p>

            <p>
              Products requested for return should be
              unused, undamaged and in their original
              condition, packaging and tags where
              applicable.
            </p>

            <div className="vorn-return-highlight">
              Please keep the product and its original
              packaging safely until your return request
              has been reviewed.
            </div>
          </section>

          <section className="vorn-return-section">
            <h2>
              Products That May Not Be Eligible
            </h2>

            <p>
              Some products may not be eligible for
              return depending on their condition,
              hygiene requirements or other applicable
              restrictions.
            </p>

            <ul className="vorn-return-list">
              <li>
                Products that have been used or worn.
              </li>

              <li>
                Products that are damaged after delivery
                due to customer handling.
              </li>

              <li>
                Products missing applicable tags,
                packaging or accessories.
              </li>

              <li>
                Products that do not meet the applicable
                return conditions.
              </li>
            </ul>
          </section>

          <section className="vorn-return-section">
            <h2>
              How to Request a Return
            </h2>

            <div className="vorn-return-steps">

              <div className="vorn-return-step">
                <span className="vorn-return-step-number">
                  01
                </span>

                <h3>
                  CONTACT US
                </h3>

                <p>
                  Contact VORN customer care with your
                  order details and reason for return.
                </p>
              </div>

              <div className="vorn-return-step">
                <span className="vorn-return-step-number">
                  02
                </span>

                <h3>
                  REVIEW
                </h3>

                <p>
                  Our team reviews the request and
                  provides the next instructions.
                </p>
              </div>

              <div className="vorn-return-step">
                <span className="vorn-return-step-number">
                  03
                </span>

                <h3>
                  RETURN
                </h3>

                <p>
                  If approved, follow the return
                  instructions provided by our team.
                </p>
              </div>

            </div>
          </section>

          <section className="vorn-return-section">
            <h2>
              Damaged or Incorrect Product
            </h2>

            <p>
              If you receive a damaged, defective or
              incorrect product, please contact us as soon
              as possible after delivery.
            </p>

            <p>
              Include your order details and clear photos
              of the product so our customer-care team can
              review the issue.
            </p>
          </section>

          <section className="vorn-return-section">
            <h2>
              Return Shipping
            </h2>

            <p>
              Return shipping arrangements and any
              applicable charges will depend on the reason
              for the return and the outcome of the review.
            </p>

            <p>
              Please do not send a product back without
              first receiving return instructions from
              VORN customer care.
            </p>
          </section>

          <section className="vorn-return-section">
            <h2>
              Refunds
            </h2>

            <p>
              Once an approved return is received and
              reviewed, any applicable refund will be
              processed according to the payment method
              and applicable order conditions.
            </p>

            <p>
              Processing time may vary depending on the
              payment provider or financial institution.
            </p>
          </section>

          <section className="vorn-return-section">
            <h2>
              Need Help?
            </h2>

            <p>
              If you are unsure whether your order is
              eligible for a return, contact our
              customer-care team before sending anything
              back.
            </p>
          </section>

          <section className="vorn-return-contact">
            <h2>
              Need help with a return?
            </h2>

            <p>
              Contact VORN customer care and share your
              order details. We'll guide you through the
              next steps.
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

export default ReturnPolicy;