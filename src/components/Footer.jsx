import { Link } from "react-router-dom";
import storeConfig from "../config/storeConfig";

function Footer() {
  return (
    <>
      <style>{`
        .vorn-footer {
          margin-top: 80px;
          background: #111111;
          color: #ffffff;
          width: 100%;
          overflow-x: hidden;
        }

        .vorn-footer-inner {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 64px 32px 30px;
          box-sizing: border-box;
        }

        .vorn-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 50px;
          width: 100%;
        }

        .vorn-footer-brand {
          max-width: 360px;
          min-width: 0;
        }

        .vorn-footer-brand-logo {
          display: inline-flex;
          margin-bottom: 22px;
        }

        .vorn-footer-brand-logo img {
          width: auto;
          max-width: 135px;
          max-height: 48px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .vorn-footer-description {
          margin: 0;
          color: #b7b7b7;
          font-size: 14px;
          line-height: 1.8;
        }

        .vorn-footer-title {
          margin: 0 0 20px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: normal;
        }

        .vorn-footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vorn-footer-links a {
          width: fit-content;
          max-width: 100%;
          color: #b7b7b7;
          text-decoration: none;
          font-size: 14px;
          line-height: 1.5;
          transition: color 0.2s ease;
        }

        .vorn-footer-links a:hover {
          color: #ffffff;
        }

        .vorn-footer-socials {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .vorn-footer-social {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          border: 1px solid #3a3a3a;
          border-radius: 50%;
          text-decoration: none;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .vorn-footer-social:hover {
          background: #242424;
          border-color: #ffffff;
          transform: translateY(-2px);
        }

        .vorn-footer-social svg {
          width: 19px;
          height: 19px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .vorn-footer-social.instagram svg {
          fill: none;
        }

        .vorn-footer-social.facebook svg {
          fill: none;
        }

        .vorn-footer-bottom {
          margin-top: 50px;
          padding-top: 24px;
          border-top: 1px solid #2d2d2d;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-width: 0;
        }

        .vorn-footer-copyright {
          margin: 0;
          color: #888888;
          font-size: 12px;
        }

        .vorn-footer-policy-links {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }

        .vorn-footer-policy-links a {
          color: #888888;
          text-decoration: none;
          font-size: 12px;
          transition: color 0.2s ease;
        }

        .vorn-footer-policy-links a:hover {
          color: #ffffff;
        }

        /* ================================
           TABLET
        ================================= */

        @media (max-width: 900px) {
          .vorn-footer-inner {
            padding: 50px 22px 26px;
          }

          .vorn-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 42px 28px;
          }

          .vorn-footer-brand {
            grid-column: 1 / -1;
            max-width: 500px;
          }

          .vorn-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 560px) {
          .vorn-footer {
            margin-top: 60px;
            width: 100%;
            overflow-x: hidden;
          }

          .vorn-footer-inner {
            width: 100%;
            padding: 44px 18px 24px;
            box-sizing: border-box;
          }

          /*
            IMPORTANT:
            Mobile-la 2 columns vendam.
            Single column layout use pannrom.
          */

          .vorn-footer-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 38px;
            width: 100%;
          }

          .vorn-footer-brand {
            grid-column: auto;
            width: 100%;
            max-width: none;
          }

          .vorn-footer-brand-logo {
            margin-bottom: 18px;
          }

          .vorn-footer-brand-logo img {
            max-width: 125px;
            max-height: 46px;
          }

          .vorn-footer-description {
            font-size: 14px;
            line-height: 1.75;
            max-width: 100%;
          }

          .vorn-footer-title {
            margin-bottom: 16px;
            font-size: 13px;
            letter-spacing: 0.08em;
          }

          .vorn-footer-links {
            gap: 11px;
          }

          .vorn-footer-links a {
            font-size: 14px;
            line-height: 1.55;
          }

          .vorn-footer-socials {
            gap: 12px;
          }

          .vorn-footer-social {
            width: 44px;
            height: 44px;
            flex-basis: 44px;
          }

          .vorn-footer-bottom {
            width: 100%;
            margin-top: 40px;
            padding-top: 22px;
            gap: 18px;
            align-items: flex-start;
          }

          .vorn-footer-copyright {
            font-size: 12px;
            line-height: 1.6;
          }

          .vorn-footer-policy-links {
            gap: 10px 16px;
          }

          .vorn-footer-policy-links a {
            font-size: 12px;
          }
        }

        /* Small phones */

        @media (max-width: 360px) {
          .vorn-footer-inner {
            padding-left: 15px;
            padding-right: 15px;
          }

          .vorn-footer-grid {
            gap: 34px;
          }

          .vorn-footer-description {
            font-size: 13px;
          }

          .vorn-footer-links a {
            font-size: 13px;
          }
        }
      `}</style>

      <footer className="vorn-footer">
        <div className="vorn-footer-inner">

          <div className="vorn-footer-grid">

            {/* BRAND */}
            <div className="vorn-footer-brand">

              <Link
                to="/"
                className="vorn-footer-brand-logo"
                aria-label={`${storeConfig.brand.name} home`}
              >
                <img
                  src={storeConfig.brand.logo}
                  alt={storeConfig.brand.name}
                />
              </Link>

              <p className="vorn-footer-description">
                VORN is a clothing and fashion store built around
                confident everyday style.
              </p>

            </div>

            {/* SHOP */}
            <div>
              <h3 className="vorn-footer-title">
                Shop
              </h3>

              <div className="vorn-footer-links">
                <Link to="/shop">
                  All Products
                </Link>

                <Link to="/shop?category=men">
                  Men
                </Link>

                <Link to="/shop?category=women">
                  Women
                </Link>

                <Link to="/shop?category=new-arrivals">
                  New Arrivals
                </Link>

                <Link to="/shop?category=sale">
                  Sale
                </Link>
              </div>
            </div>

            {/* CUSTOMER CARE */}
            <div>
              <h3 className="vorn-footer-title">
                Customer Care
              </h3>

              <div className="vorn-footer-links">
                <Link to="/contact">
                  Contact Us
                </Link>

                <Link to="/faq">
                  FAQ
                </Link>

                <Link to="/shipping-policy">
                  Shipping Policy
                </Link>

                <Link to="/return-policy">
                  Return Policy
                </Link>

                <Link to="/privacy-policy">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* SOCIAL */}
            <div>
              <h3 className="vorn-footer-title">
                Follow VORN
              </h3>

              <div className="vorn-footer-socials">

                {/* INSTAGRAM */}
                <a
                  className="vorn-footer-social instagram"
                  href={storeConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VORN Instagram"
                >
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
                </a>

                {/* FACEBOOK */}
                <a
                  className="vorn-footer-social facebook"
                  href={storeConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VORN Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M13.5 20v-7h2.5l.5-3h-3V8.1c0-.9.3-1.6 1.7-1.6h1.6V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H8v3h2.4v7h3.1Z" />
                  </svg>
                </a>

                {/* WHATSAPP */}
                <a
                  className="vorn-footer-social"
                  href={storeConfig.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VORN WhatsApp"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20 11.5a8 8 0 0 1-11.8 7.1L4 20l1.4-4A8 8 0 1 1 20 11.5Z" />

                    <path d="M9 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.5.9 1.2 1.5 2.1 2 .2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.4.7c.2.1.3.3.2.5-.2.7-.8 1.2-1.5 1.3-1.3.2-3.1-.7-4.3-1.8-1.1-1-2.1-2.8-1.9-4.1.1-.4.5-.7 1-.8Z" />
                  </svg>
                </a>

              </div>
            </div>

          </div>

          {/* FOOTER BOTTOM */}
          <div className="vorn-footer-bottom">

            <p className="vorn-footer-copyright">
              © {new Date().getFullYear()}{" "}
              {storeConfig.brand.name}.
              All rights reserved.
            </p>

            <div className="vorn-footer-policy-links">

              <Link to="/terms">
                Terms
              </Link>

              <Link to="/refund-policy">
                Refunds
              </Link>

              <Link to="/cancellation-policy">
                Cancellation
              </Link>

            </div>

          </div>

        </div>
      </footer>
    </>
  );
}

export default Footer;