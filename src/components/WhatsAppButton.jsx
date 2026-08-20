import { useEffect, useState } from "react";
import storeConfig from "../config/storeConfig";

function WhatsAppButton({ product } = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const createWhatsAppMessage = () => {
    if (!product) {
      return "Hi VORN, I need help regarding your store.";
    }

    const productName = product.name || "Product";
    const productPrice = product.price
      ? `₹${product.price}`
      : "Price unavailable";

    const selectedSize =
      product.selectedSize || "Not selected";

    const selectedColor =
      product.selectedColor || "Not selected";

    const productUrl =
      product.url || window.location.href;

    return `Hi VORN, I’m interested in this product:

Product: ${productName}
Price: ${productPrice}
Size: ${selectedSize}
Color: ${selectedColor}

Product Link: ${productUrl}`;
  };

  const handleWhatsAppClick = () => {
    const message = createWhatsAppMessage();

    const whatsappUrl = `${storeConfig.whatsapp.url}?text=${encodeURIComponent(
      message
    )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <style>{`
        .vorn-whatsapp-button {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 900;
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: #25d366;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
          opacity: 0;
          transform: translateY(18px) scale(0.92);
          transition:
            opacity 0.35s ease,
            transform 0.35s ease,
            box-shadow 0.2s ease;
        }

        .vorn-whatsapp-button.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          animation: vorn-whatsapp-pulse 2.8s ease-in-out 1.2s
            infinite;
        }

        .vorn-whatsapp-button:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.24);
        }

        .vorn-whatsapp-button svg {
          width: 29px;
          height: 29px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @keyframes vorn-whatsapp-pulse {
          0%,
          100% {
            box-shadow:
              0 8px 28px rgba(0, 0, 0, 0.18),
              0 0 0 0 rgba(37, 211, 102, 0.18);
          }

          50% {
            box-shadow:
              0 8px 28px rgba(0, 0, 0, 0.18),
              0 0 0 8px rgba(37, 211, 102, 0);
          }
        }

        @media (max-width: 768px) {
          .vorn-whatsapp-button {
            right: 18px;
            bottom: 82px;
            width: 54px;
            height: 54px;
          }

          .vorn-whatsapp-button svg {
            width: 27px;
            height: 27px;
          }
        }

        @media (max-width: 480px) {
          .vorn-whatsapp-button {
            right: 16px;
            bottom: 78px;
            width: 52px;
            height: 52px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-whatsapp-button {
            transition: none;
          }

          .vorn-whatsapp-button.is-visible {
            animation: none;
          }
        }
      `}</style>

      <button
        type="button"
        className={`vorn-whatsapp-button ${
          visible ? "is-visible" : ""
        }`}
        onClick={handleWhatsAppClick}
        aria-label="Chat with VORN on WhatsApp"
        title="Chat with VORN on WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11.5a8 8 0 0 1-11.8 7.1L4 20l1.4-4A8 8 0 1 1 20 11.5Z" />
          <path d="M9 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.5.9 1.2 1.5 2.1 2 .2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.4.7c.2.1.3.3.2.5-.2.7-.8 1.2-1.5 1.3-1.3.2-3.1-.7-4.3-1.8-1.1-1-2.1-2.8-1.9-4.1.1-.4.5-.7 1-.8Z" />
        </svg>
      </button>
    </>
  );
}

export default WhatsAppButton;