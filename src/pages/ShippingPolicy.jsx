import { Link } from "react-router-dom";

function ShippingPolicy() {
  return (
    <>
      <style>{`
        .vorn-shipping-page {
          min-height: 70vh;
          background: #ffffff;
          color: #111111;
          padding: 90px 24px 110px;
        }

        .vorn-shipping-container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
        }

        .vorn-shipping-header {
          text-align: center;
          margin-bottom: 65px;
        }

        .vorn-shipping-eyebrow {
          margin: 0 0 14px;
          font-family: Georgia, serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .vorn-shipping-title {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(42px, 6vw, 70px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .vorn-shipping-subtitle {
          max-width: 650px;
          margin: 24px auto 0;
          color: #666666;
          font-size: 15px;
          line-height: 1.8;
        }

        .vorn-shipping-section {
          padding: 34px 0;
          border-top: 1px solid #dddddd;
        }

        .vorn-shipping-section:last-of-type {
          border-bottom: 1px solid #dddddd;
        }

        .vorn-shipping-section h2 {
          margin: 0 0 16px;
          font-family: Georgia, serif;
          font-size: 25px;
          font-weight: 400;
        }

        .vorn-shipping-section p {
          margin: 0 0 13px;
          color: #666666;
          font-size: 14px;
          line-height: 1.85;
        }

        .vorn-shipping-section p:last-child {
          margin-bottom: 0;
        }

        .vorn-shipping-list {
          margin: 15px 0 0;
          padding-left: 20px;
          color: #666666;
        }

        .vorn-shipping-list li {
          margin-bottom: 10px;
          padding-left: 5px;
          font-size: 14px;
          line-height: 1.7;
        }

        .vorn-shipping-highlight {
          margin-top: 20px;
          padding: 20px 22px;
          border-left: 3px solid #111111;
          background: #f7f7f7;
          color: #444444;
          font-size: 13px;
          line-height: 1.75;
        }

        .vorn-shipping-steps {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 25px;
        }

        .vorn-shipping-step {
          padding: 24px 20px;
          border: 1px solid #dddddd;
        }

        .vorn-shipping-step-number {
          display: block;
          margin-bottom: 15px;
          font-family: Georgia, serif;
          font-size: 26px;
        }

        .vorn-shipping-step h3 {
          margin: 0 0 9px;
          font-size: 14px;
          font-weight: 700;
        }

        .vorn-shipping-step p {
          margin: 0;
          font-size: 13px;
          line-height: 1.7;
        }

        .vorn-shipping-contact {
          margin-top: 70px;
          padding: 42px 30px;
          background: #111111;
          color: #ffffff;
          text-align: center;
        }

        .vorn-shipping-contact h2 {
          margin: 0 0 12px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
        }

        .vorn-shipping-contact p {
          max-width: 520px;
          margin: 0 auto 24px;
          color: #bdbdbd;
          font-size: 14px;
          line-height: 1.7;
        }

        .vorn-shipping-contact a {
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

        .vorn-shipping-contact a:hover {
          background: #ffffff;
          color: #111111;
        }

        @media (max-width: 700px) {
          .vorn-shipping-page {
            padding: 65px 18px 80px;
          }

          .vorn-shipping-header {
            margin-bottom: 45px;
          }

          .vorn-shipping-title {
            font-size: 46px;
          }

          .vorn-shipping-subtitle {
            font-size: 14px;
          }

          .vorn-shipping-section {
            padding: 28px 0;
          }

          .vorn-shipping-section h2 {
            font-size: 23px;
          }

          .vorn-shipping-steps {
            grid-template-columns: 1fr;
          }

          .vorn-shipping-contact {
            margin-top: 50px;
            padding: 34px 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-shipping-contact a {
            transition: none;
          }
        }
      `}</style>

      <main className="vorn-shipping-page">
        <div className="vorn-shipping-container">

          <header className="vorn-shipping-header">
            <p className="vorn-shipping-eyebrow">
              Customer Care
            </p>

            <h1 className="vorn-shipping-title">
              Shipping Policy
            </h1>

            <p className="vorn-shipping-subtitle">
              Everything you need to know about order
              processing, delivery and tracking your
              VORN purchase.
            </p>
          </header>

          <section className="vorn-shipping-section">
            <h2>Order Processing</h2>

            <p>
              Once your order and payment have been
              successfully confirmed, we begin processing
              your order for dispatch.
            </p>

            <p>
              Processing time may vary depending on
              product availability, order volume and
              other operational factors.
            </p>

            <div className="vorn-shipping-highlight">
              Please make sure your shipping address and
              contact details are correct before completing
              your order.
            </div>
          </section>

          <section className="vorn-shipping-section">
            <h2>Shipping & Delivery</h2>

            <p>
              Orders are shipped to the delivery address
              provided during checkout.
            </p>

            <p>
              Delivery time can vary depending on your
              location, courier availability and other
              circumstances outside our control.
            </p>

            <ul className="vorn-shipping-list">
              <li>
                Delivery timelines may differ by
                location.
              </li>

              <li>
                Remote locations may require additional
                delivery time.
              </li>

              <li>
                Delays can occasionally occur due to
                weather, logistics or courier issues.
              </li>
            </ul>
          </section>

          <section className="vorn-shipping-section">
            <h2>Shipping Charges</h2>

            <p>
              Applicable shipping charges, if any, will
              be shown during checkout before you place
              your order.
            </p>

            <p>
              The final amount displayed at checkout is
              the amount applicable to your order.
            </p>
          </section>

          <section className="vorn-shipping-section">
            <h2>Tracking Your Order</h2>

            <p>
              When tracking information is available,
              it may be provided through the order or
              delivery information associated with your
              purchase.
            </p>

            <div className="vorn-shipping-steps">
              <div className="vorn-shipping-step">
                <span className="vorn-shipping-step-number">
                  01
                </span>

                <h3>
                  ORDER CONFIRMED
                </h3>

                <p>
                  Your order and payment are confirmed.
                </p>
              </div>

              <div className="vorn-shipping-step">
                <span className="vorn-shipping-step-number">
                  02
                </span>

                <h3>
                  ORDER DISPATCHED
                </h3>

                <p>
                  Your order is prepared and handed over
                  for delivery.
                </p>
              </div>

              <div className="vorn-shipping-step">
                <span className="vorn-shipping-step-number">
                  03
                </span>

                <h3>
                  ORDER DELIVERED
                </h3>

                <p>
                  Your package reaches the delivery
                  address provided at checkout.
                </p>
              </div>
            </div>
          </section>

          <section className="vorn-shipping-section">
            <h2>Delivery Delays</h2>

            <p>
              While we work to ensure smooth delivery,
              unexpected delays may occur due to courier
              operations, weather, holidays, transportation
              disruptions or other circumstances.
            </p>

            <p>
              If your order appears to be significantly
              delayed, please contact our customer-care
              team with your order details.
            </p>
          </section>

          <section className="vorn-shipping-section">
            <h2>Incorrect Shipping Address</h2>

            <p>
              Please carefully review your address before
              placing an order.
            </p>

            <p>
              If you notice an address mistake after
              placing your order, contact us as soon as
              possible. We will try to assist, but address
              changes may not be possible once an order has
              been dispatched.
            </p>
          </section>

          <section className="vorn-shipping-section">
            <h2>Need Help?</h2>

            <p>
              If you have questions about your shipment,
              please contact VORN customer care with your
              order details.
            </p>
          </section>

          <section className="vorn-shipping-contact">
            <h2>
              Have a question about your order?
            </h2>

            <p>
              Our customer-care team is here to help
              with shipping and delivery questions.
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

export default ShippingPolicy;