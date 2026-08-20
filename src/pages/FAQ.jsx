import { useState } from "react";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "How can I place an order?",
    answer:
      "Browse our shop, select the product you want, choose the available size and quantity, then add it to your cart. From the cart, continue to checkout and complete your order.",
  },
  {
    question: "How can I check my order status?",
    answer:
      "After signing in, go to My Account and open Orders to view your order details and current status.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept the payment methods available at checkout. The available options will be shown before you complete your order.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Shipping time can vary depending on your location and the delivery service. Please check our Shipping Policy for the latest delivery information.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Cancellation depends on the current status of your order. Please contact us as soon as possible if you need to request a cancellation.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes, eligible products can be returned according to our Return Policy. Please review the policy before sending a return request.",
  },
  {
    question: "What should I do if I receive a damaged product?",
    answer:
      "Please contact us as soon as possible with your order details and clear photos of the damaged product. Our customer-care team will review the issue and guide you through the next steps.",
  },
  {
    question: "How can I contact VORN?",
    answer:
      "You can reach us through our Contact Us page. Our customer-care team will review your message and get back to you.",
  },
  {
    question: "Do I need an account to place an order?",
    answer:
      "An account may be required for certain customer features such as viewing your orders and managing your account. Follow the checkout flow shown on the website.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "We take reasonable steps to protect customer information. Please review our Privacy Policy for more information about how your information is handled.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <>
      <style>{`
        .vorn-faq-page {
          min-height: 70vh;
          background: #ffffff;
          color: #111111;
          padding: 90px 24px 110px;
        }

        .vorn-faq-container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
        }

        .vorn-faq-header {
          text-align: center;
          margin-bottom: 58px;
        }

        .vorn-faq-eyebrow {
          margin: 0 0 14px;
          font-family: Georgia, serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .vorn-faq-title {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .vorn-faq-subtitle {
          max-width: 620px;
          margin: 24px auto 0;
          color: #666666;
          font-size: 15px;
          line-height: 1.8;
        }

        .vorn-faq-list {
          border-top: 1px solid #d8d8d8;
        }

        .vorn-faq-item {
          border-bottom: 1px solid #d8d8d8;
        }

        .vorn-faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 25px 4px;
          border: 0;
          background: transparent;
          color: #111111;
          cursor: pointer;
          text-align: left;
          font-family: Georgia, serif;
          font-size: 18px;
          line-height: 1.4;
        }

        .vorn-faq-question:hover {
          color: #555555;
        }

        .vorn-faq-question:focus-visible {
          outline: 2px solid #111111;
          outline-offset: 4px;
        }

        .vorn-faq-icon {
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #222222;
          border-radius: 50%;
          font-family: Arial, sans-serif;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          transition:
            transform 0.25s ease,
            background 0.25s ease,
            color 0.25s ease;
        }

        .vorn-faq-question[aria-expanded="true"]
          .vorn-faq-icon {
          transform: rotate(45deg);
          background: #111111;
          color: #ffffff;
        }

        .vorn-faq-answer {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s ease;
        }

        .vorn-faq-answer.open {
          grid-template-rows: 1fr;
        }

        .vorn-faq-answer-inner {
          min-height: 0;
          overflow: hidden;
        }

        .vorn-faq-answer p {
          margin: 0;
          padding: 0 58px 27px 4px;
          color: #666666;
          font-size: 14px;
          line-height: 1.85;
        }

        .vorn-faq-bottom {
          margin-top: 70px;
          padding: 42px 32px;
          background: #111111;
          color: #ffffff;
          text-align: center;
        }

        .vorn-faq-bottom h2 {
          margin: 0 0 12px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 400;
        }

        .vorn-faq-bottom p {
          max-width: 500px;
          margin: 0 auto 24px;
          color: #bdbdbd;
          font-size: 14px;
          line-height: 1.7;
        }

        .vorn-faq-contact {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 24px;
          border: 1px solid #ffffff;
          color: #ffffff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .vorn-faq-contact:hover {
          background: #ffffff;
          color: #111111;
        }

        @media (max-width: 640px) {
          .vorn-faq-page {
            padding: 65px 18px 80px;
          }

          .vorn-faq-header {
            margin-bottom: 42px;
          }

          .vorn-faq-title {
            font-size: 46px;
          }

          .vorn-faq-subtitle {
            font-size: 14px;
          }

          .vorn-faq-question {
            padding: 21px 2px;
            font-size: 16px;
          }

          .vorn-faq-icon {
            width: 28px;
            height: 28px;
            font-size: 18px;
          }

          .vorn-faq-answer p {
            padding: 0 40px 23px 2px;
            font-size: 13px;
          }

          .vorn-faq-bottom {
            margin-top: 55px;
            padding: 34px 20px;
          }

          .vorn-faq-bottom h2 {
            font-size: 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vorn-faq-answer,
          .vorn-faq-icon,
          .vorn-faq-contact {
            transition: none;
          }
        }
      `}</style>

      <main className="vorn-faq-page">
        <div className="vorn-faq-container">

          <header className="vorn-faq-header">
            <p className="vorn-faq-eyebrow">
              Customer Care
            </p>

            <h1 className="vorn-faq-title">
              FAQ
            </h1>

            <p className="vorn-faq-subtitle">
              Find answers to common questions about
              orders, shipping, returns, payments and
              your VORN account.
            </p>
          </header>

          <section
            className="vorn-faq-list"
            aria-label="Frequently asked questions"
          >
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  className="vorn-faq-item"
                  key={item.question}
                >
                  <button
                    type="button"
                    className="vorn-faq-question"
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>{item.question}</span>

                    <span
                      className="vorn-faq-icon"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={`vorn-faq-answer ${
                      isOpen ? "open" : ""
                    }`}
                    aria-hidden={!isOpen}
                  >
                    <div className="vorn-faq-answer-inner">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="vorn-faq-bottom">
            <h2>Still need help?</h2>

            <p>
              If you couldn't find the answer you're
              looking for, our customer-care team is
              ready to help.
            </p>

            <Link
              to="/contact"
              className="vorn-faq-contact"
            >
              Contact Us
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}

export default FAQ;