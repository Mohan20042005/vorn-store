import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import storeConfig from "../config/storeConfig";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const query = searchValue.trim();

    if (!query) {
      navigate("/search");
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>{`

        /* =====================================================
           HEADER
        ===================================================== */

        .vorn-header {
          position: relative;
          z-index: 1000;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #eeeeee;
        }

        .vorn-header-inner {
          width: 100%;
          max-width: 1600px;
          height: 88px;
          margin: 0 auto;
          padding: 0 38px;

          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }


        /* =====================================================
           LOGO
        ===================================================== */

        .vorn-header-logo {
          justify-self: start;

          width: 110px;
          height: 52px;

          display: flex;
          align-items: center;
          justify-content: flex-start;

          text-decoration: none;
          overflow: hidden;
        }

        .vorn-header-logo img {
          display: block;

          width: auto;
          height: auto;

          max-width: 92px;
          max-height: 46px;

          object-fit: contain;
          object-position: center;

          flex-shrink: 0;

          /*
            Important:
            If your uploaded logo is white/very light,
            this makes it visible on the white header.
          */
          filter: brightness(0) saturate(100%);
        }


        /* =====================================================
           NAVIGATION
        ===================================================== */

        .vorn-header-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 34px;
        }

        .vorn-header-nav a {
          position: relative;

          color: #111111;
          text-decoration: none;

          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          font-weight: 500;

          letter-spacing: 0.04em;
          text-transform: uppercase;

          padding: 34px 0;

          white-space: nowrap;

          transition:
            color 0.2s ease,
            opacity 0.2s ease;
        }

        .vorn-header-nav a:hover {
          color: #555555;
        }

        .vorn-header-nav a::after {
          content: "";

          position: absolute;
          left: 0;
          right: 0;
          bottom: 25px;

          height: 1px;

          background: #111111;

          transform: scaleX(0);
          transform-origin: center;

          transition: transform 0.2s ease;
        }

        .vorn-header-nav a:hover::after,
        .vorn-header-nav a.active::after {
          transform: scaleX(1);
        }


        /* =====================================================
           RIGHT ACTIONS
        ===================================================== */

        .vorn-header-actions {
          justify-self: end;

          display: flex;
          align-items: center;
          gap: 24px;
        }


        /* =====================================================
           ACCOUNT BUTTON
        ===================================================== */

        .vorn-account-button {
          height: 42px;
          min-width: 118px;

          padding: 0 18px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border: 1px solid #222222;
          background: #ffffff;

          color: #111111;

          text-decoration: none;

          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          font-weight: 600;

          letter-spacing: 0.08em;
          text-transform: uppercase;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .vorn-account-button:hover {
          background: #111111;
          color: #ffffff;
        }


        /* =====================================================
           ICON BUTTON
        ===================================================== */

        .vorn-header-icon {
          width: 24px;
          height: 24px;

          padding: 0;
          margin: 0;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border: 0;
          background: transparent;

          color: #111111;

          cursor: pointer;

          text-decoration: none;

          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        .vorn-header-icon:hover {
          opacity: 0.55;
          transform: translateY(-1px);
        }

        .vorn-header-icon svg {
          width: 21px;
          height: 21px;

          fill: none;
          stroke: currentColor;

          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
        }


        /* =====================================================
           SEARCH
        ===================================================== */

        .vorn-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .vorn-search-form {
          position: absolute;

          top: calc(100% + 14px);
          right: 0;

          width: 300px;

          padding: 10px;

          background: #ffffff;
          border: 1px solid #dddddd;

          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

          display: flex;
          align-items: center;

          opacity: 0;
          visibility: hidden;
          transform: translateY(-6px);

          transition:
            opacity 0.2s ease,
            visibility 0.2s ease,
            transform 0.2s ease;
        }

        .vorn-search-wrapper.open .vorn-search-form {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .vorn-search-input {
          flex: 1;

          height: 42px;

          padding: 0 12px;

          border: 1px solid #dddddd;
          outline: none;

          color: #111111;
          background: #ffffff;

          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
        }

        .vorn-search-input:focus {
          border-color: #111111;
        }

        .vorn-search-submit {
          width: 42px;
          height: 42px;

          border: 0;
          background: #111111;
          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        .vorn-search-submit svg {
          width: 18px;
          height: 18px;

          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        .vorn-mobile-menu-button {
          display: none;

          width: 38px;
          height: 38px;

          padding: 0;

          border: 0;
          background: transparent;

          cursor: pointer;

          align-items: center;
          justify-content: center;
          flex-direction: column;

          gap: 5px;
        }

        .vorn-mobile-menu-button span {
          display: block;

          width: 21px;
          height: 1px;

          background: #111111;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }


        /* =====================================================
           MOBILE NAV
        ===================================================== */

        .vorn-mobile-nav {
          display: none;

          border-top: 1px solid #eeeeee;
          background: #ffffff;

          padding: 12px 22px 22px;
        }

        .vorn-mobile-nav.open {
          display: block;
        }

        .vorn-mobile-nav a {
          display: block;

          padding: 15px 0;

          border-bottom: 1px solid #eeeeee;

          color: #111111;
          text-decoration: none;

          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;

          letter-spacing: 0.05em;
          text-transform: uppercase;
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1100px) {

          .vorn-header-inner {
            padding: 0 24px;
          }

          .vorn-header-nav {
            gap: 22px;
          }

          .vorn-header-nav a {
            font-size: 13px;
          }

          .vorn-header-actions {
            gap: 17px;
          }

          .vorn-account-button {
            min-width: 105px;
            padding: 0 14px;
          }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 800px) {

          .vorn-header-inner {
            height: 72px;

            padding: 0 18px;

            display: flex;
            align-items: center;
            justify-content: space-between;
          }


          /* Logo */

          .vorn-header-logo {
            width: 90px;
            height: 42px;

            justify-content: flex-start;
          }

          .vorn-header-logo img {
            width: auto;
            height: auto;

            max-width: 78px;
            max-height: 38px;

            object-fit: contain;

            filter: brightness(0) saturate(100%);
          }


          /* Desktop navigation hidden */

          .vorn-header-nav {
            display: none;
          }


          /* Actions */

          .vorn-header-actions {
            margin-left: auto;

            gap: 13px;
          }

          .vorn-account-button {
            display: none;
          }

          .vorn-header-actions .vorn-search-wrapper {
            display: none;
          }

          .vorn-header-actions > .vorn-header-icon {
            display: none;
          }


          /* Mobile menu */

          .vorn-mobile-menu-button {
            display: inline-flex;
          }
        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {

          .vorn-header-inner {
            height: 64px;
            padding: 0 14px;
          }

          .vorn-header-logo {
            width: 76px;
            height: 38px;
          }

          .vorn-header-logo img {
            max-width: 70px;
            max-height: 32px;

            object-fit: contain;
          }

          .vorn-mobile-menu-button {
            width: 34px;
            height: 34px;
          }

          .vorn-mobile-menu-button span {
            width: 19px;
          }
        }

      `}</style>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="vorn-header">

        <div className="vorn-header-inner">


          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="vorn-header-logo"
            aria-label={`${storeConfig.brand.name} home`}
          >
            <img
              src={storeConfig.brand.logo}
              alt={storeConfig.brand.name}
            />
          </Link>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav
            className="vorn-header-nav"
            aria-label="Main navigation"
          >

            <Link
              to="/"
              className={isActive("/") ? "active" : ""}
            >
              Home
            </Link>

            <Link
              to="/shop"
              className={isActive("/shop") ? "active" : ""}
            >
              Shop
            </Link>

            <Link
              to="/shop?category=men"
              className={
                location.search.includes("category=men")
                  ? "active"
                  : ""
              }
            >
              Men
            </Link>

            <Link
              to="/shop?category=women"
              className={
                location.search.includes("category=women")
                  ? "active"
                  : ""
              }
            >
              Women
            </Link>

            <Link
              to="/shop?category=new-arrivals"
              className={
                location.search.includes("category=new-arrivals")
                  ? "active"
                  : ""
              }
            >
              New Arrivals
            </Link>

          </nav>


          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div className="vorn-header-actions">


            {/* =================================================
                ACCOUNT
            ================================================= */}

            <Link
              to="/account"
              className="vorn-account-button"
            >
              My Account
            </Link>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div
              className={`vorn-search-wrapper ${
                searchOpen ? "open" : ""
              }`}
            >

              <button
                type="button"
                className="vorn-header-icon"
                aria-label="Search"
                onClick={() =>
                  setSearchOpen((current) => !current)
                }
              >

                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                  />

                  <path d="m16 16 5 5" />
                </svg>

              </button>


              <form
                className="vorn-search-form"
                onSubmit={handleSearchSubmit}
              >

                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) =>
                    setSearchValue(e.target.value)
                  }
                  placeholder="Search products..."
                  className="vorn-search-input"
                  autoComplete="off"
                />

                <button
                  type="submit"
                  className="vorn-search-submit"
                  aria-label="Submit search"
                >

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6.5"
                    />

                    <path d="m16 16 5 5" />
                  </svg>

                </button>

              </form>

            </div>


            {/* =================================================
                ACCOUNT ICON
            ================================================= */}

            <Link
              to="/account"
              className="vorn-header-icon"
              aria-label="Account"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                />

                <path d="M5.5 20c.7-3.6 3-5.5 6.5-5.5s5.8 1.9 6.5 5.5" />

              </svg>

            </Link>


            {/* =================================================
                WISHLIST
            ================================================= */}

            <Link
              to="/wishlist"
              className="vorn-header-icon"
              aria-label="Wishlist"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <path
                  d="M20.8 8.7c0 5.1-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z"
                />

              </svg>

            </Link>


            {/* =================================================
                CART
            ================================================= */}

            <Link
              to="/cart"
              className="vorn-header-icon"
              aria-label="Shopping cart"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.5L20 8H6" />

                <circle
                  cx="10"
                  cy="20"
                  r="1"
                />

                <circle
                  cx="17"
                  cy="20"
                  r="1"
                />

              </svg>

            </Link>


            {/* =================================================
                MOBILE MENU BUTTON
            ================================================= */}

            <button
              type="button"
              className="vorn-mobile-menu-button"
              aria-label="Open menu"
              onClick={() => {
                const menu =
                  document.querySelector(
                    ".vorn-mobile-nav"
                  );

                if (menu) {
                  menu.classList.toggle("open");
                }
              }}
            >

              <span />
              <span />
              <span />

            </button>

          </div>

        </div>


        {/* =====================================================
            MOBILE NAVIGATION
        ===================================================== */}

        <nav
          className="vorn-mobile-nav"
          aria-label="Mobile navigation"
        >

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
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

          <Link to="/account">
            My Account
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

          <Link to="/cart">
            Cart
          </Link>

        </nav>

      </header>
    </>
  );
}

export default Header;