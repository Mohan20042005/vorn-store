import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabaseClient";

/* =========================================================
   PRODUCT REVIEWS
========================================================= */

export default function ProductReviews({
  productId,
}) {
  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [rating, setRating] =
    useState(0);

  const [title, setTitle] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data,
        error,
      } =
        await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (error) {
        setUser(null);
        return;
      }

      setUser(
        data?.user || null
      );
    }

    loadUser();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) {
            return;
          }

          setUser(
            session?.user || null
          );
        }
      );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /* =======================================================
     LOAD APPROVED REVIEWS
  ======================================================= */

  async function loadReviews() {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const {
      data,
      error: fetchError,
    } =
      await supabase
        .from("reviews")
        .select(
          `
            id,
            product_id,
            user_id,
            order_id,
            rating,
            title,
            comment,
            is_approved,
            created_at,
            updated_at
          `
        )
        .eq(
          "product_id",
          productId
        )
        .eq(
          "is_approved",
          true
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (fetchError) {
      console.error(
        "Review loading error:",
        fetchError
      );

      setError(
        "Unable to load reviews."
      );

      setReviews([]);
    } else {
      setReviews(
        data || []
      );
    }

    setLoading(false);
  }

  /* =======================================================
     LOAD REVIEWS WHEN PRODUCT CHANGES
  ======================================================= */

  useEffect(() => {
    loadReviews();
  }, [productId]);

  /* =======================================================
     AVERAGE RATING
  ======================================================= */

  const averageRating =
    useMemo(() => {
      if (!reviews.length) {
        return 0;
      }

      const total =
        reviews.reduce(
          (sum, review) =>
            sum +
            Number(
              review.rating || 0
            ),
          0
        );

      return (
        total /
        reviews.length
      );
    }, [reviews]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {
    setRating(0);
    setTitle("");
    setComment("");
    setMessage("");
    setError("");
  }

  /* =======================================================
     OPEN REVIEW FORM
  ======================================================= */

  function handleWriteReview() {
    setMessage("");
    setError("");

    if (!user) {
      setError(
        "Please sign in to write a review."
      );

      return;
    }

    setShowForm(true);
  }

  /* =======================================================
     SUBMIT REVIEW
  ======================================================= */

  async function handleSubmitReview(
    event
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!user) {
      setError(
        "Please sign in to write a review."
      );

      return;
    }

    if (!productId) {
      setError(
        "Product information is missing."
      );

      return;
    }

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      setError(
        "Please select a rating."
      );

      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a review title."
      );

      return;
    }

    if (!comment.trim()) {
      setError(
        "Please enter your review."
      );

      return;
    }

    setSubmitting(true);

    /* =======================================================
       PURCHASE VERIFICATION
    ======================================================= */

    const {
      data: hasPurchased,
      error: purchaseError,
    } = await supabase.rpc(
      "has_purchased_product",
      {
        p_user_id: user.id,
        p_product_id: productId,
      }
    );

    if (purchaseError) {
      console.error(
        "Purchase verification error:",
        purchaseError
      );

      setError(
        "Unable to verify your purchase. Please try again."
      );

      setSubmitting(false);

      return;
    }

    if (!hasPurchased) {
      setError(
        "You can review this product only after purchasing it."
      );

      setSubmitting(false);

      return;
    }

    const reviewData = {
      product_id: productId,

      user_id: user.id,

      order_id: null,

      rating: Number(
        rating
      ),

      title:
        title.trim(),

      comment:
        comment.trim(),

      is_approved: false,
    };

    const {
      error: insertError,
    } =
      await supabase
        .from("reviews")
        .insert(
          reviewData
        );

    if (insertError) {
      console.error(
        "Review submission error:",
        insertError
      );

      setError(
        insertError.message ||
          "Unable to submit your review."
      );

      setSubmitting(false);

      return;
    }

    resetForm();

    setShowForm(false);

    setMessage(
      "Thank you! Your review has been submitted and is awaiting approval."
    );

    setSubmitting(false);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className="vorn-reviews-section"
      style={
        styles.section
      }
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="vorn-reviews-header"
        style={
          styles.header
        }
      >
        <div>
          <p
            style={
              styles.eyebrow
            }
          >
            VORN EXPERIENCE
          </p>

          <h2
            className="vorn-reviews-heading"
            style={
              styles.heading
            }
          >
            Customer Reviews
          </h2>
        </div>

        <div
          className="vorn-reviews-summary"
          style={
            styles.summary
          }
        >
          <div
            style={
              styles.average
            }
          >
            {averageRating
              ? averageRating.toFixed(
                  1
                )
              : "0.0"}
          </div>

          <div>
            <div
              style={
                styles.stars
              }
            >
              {[
                1,
                2,
                3,
                4,
                5,
              ].map(
                (star) => (
                  <span
                    key={
                      star
                    }
                    style={
                      styles.star
                    }
                  >
                    {star <=
                    Math.round(
                      averageRating
                    )
                      ? "★"
                      : "☆"}
                  </span>
                )
              )}
            </div>

            <div
              style={
                styles.reviewCount
              }
            >
              {reviews.length}{" "}
              {reviews.length ===
              1
                ? "review"
                : "reviews"}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          style={
            styles.successMessage
          }
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={
            styles.errorMessage
          }
        >
          {error}
        </div>
      )}

      {/* =================================================
          WRITE REVIEW
      ================================================= */}

      <div
        className="vorn-reviews-action-row"
        style={
          styles.actionRow
        }
      >
        <button
          className="vorn-reviews-write-button"
          type="button"
          onClick={
            handleWriteReview
          }
          style={
            styles.writeButton
          }
        >
          WRITE A REVIEW
        </button>
      </div>

      {/* =================================================
          REVIEW FORM
      ================================================= */}

      {showForm && (
        <form
          className="vorn-review-form"
          onSubmit={
            handleSubmitReview
          }
          style={
            styles.form
          }
        >
          <div
            className="vorn-review-form-header"
            style={
              styles.formHeader
            }
          >
            <div>
              <p
                style={
                  styles.formEyebrow
                }
              >
                SHARE YOUR EXPERIENCE
              </p>

              <h3
                className="vorn-review-form-title"
                style={
                  styles.formTitle
                }
              >
                Write a Review
              </h3>
            </div>

            <button
              className="vorn-review-close-button"
              type="button"
              onClick={() => {
                setShowForm(
                  false
                );
                resetForm();
              }}
              style={
                styles.closeButton
              }
            >
              ×
            </button>
          </div>

          {/* RATING */}

          <div
            style={
              styles.field
            }
          >
            <label
              style={
                styles.label
              }
            >
              RATING
            </label>

            <div
              style={
                styles.ratingPicker
              }
            >
              {[
                1,
                2,
                3,
                4,
                5,
              ].map(
                (star) => (
                  <button
                    className="vorn-review-rating-button"
                    key={
                      star
                    }
                    type="button"
                    onClick={() =>
                      setRating(
                        star
                      )
                    }
                    style={{
                      ...styles.ratingButton,

                      ...(star <=
                      rating
                        ? styles.ratingActive
                        : {}),
                    }}
                    aria-label={`Rate ${star} star`}
                  >
                    ★
                  </button>
                )
              )}
            </div>
          </div>

          {/* TITLE */}

          <div
            style={
              styles.field
            }
          >
            <label
              htmlFor="review-title"
              style={
                styles.label
              }
            >
              REVIEW TITLE
            </label>

            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Give your review a title"
              maxLength={120}
              style={
                styles.input
              }
            />
          </div>

          {/* COMMENT */}

          <div
            style={
              styles.field
            }
          >
            <label
              htmlFor="review-comment"
              style={
                styles.label
              }
            >
              YOUR REVIEW
            </label>

            <textarea
              id="review-comment"
              value={
                comment
              }
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              placeholder="Tell us about your experience..."
              maxLength={1000}
              rows={6}
              style={
                styles.textarea
              }
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              submitting
            }
            style={{
              ...styles.submitButton,

              opacity:
                submitting
                  ? 0.6
                  : 1,
            }}
          >
            {submitting
              ? "SUBMITTING..."
              : "SUBMIT REVIEW"}
          </button>
        </form>
      )}

      {/* =================================================
          REVIEWS LIST
      ================================================= */}

      <div
        style={
          styles.reviewList
        }
      >
        {loading ? (
          <div
            style={
              styles.emptyState
            }
          >
            Loading reviews...
          </div>
        ) : reviews.length ===
          0 ? (
          <div
            style={
              styles.emptyState
            }
          >
            <p
              style={
                styles.emptyTitle
              }
            >
              No reviews yet
            </p>

            <p
              style={
                styles.emptyText
              }
            >
              Be the first to share
              your experience with
              this VORN piece.
            </p>
          </div>
        ) : (
          reviews.map(
            (review) => (
              <article
                className="vorn-review-card"
                key={
                  review.id
                }
                style={
                  styles.reviewCard
                }
              >
                <div
                  style={
                    styles.reviewTop
                  }
                >
                  <div>
                    <div
                      style={
                        styles.reviewStars
                      }
                    >
                      {[
                        1,
                        2,
                        3,
                        4,
                        5,
                      ].map(
                        (star) => (
                          <span
                            key={
                              star
                            }
                            style={
                              styles.reviewStar
                            }
                          >
                            {star <=
                            Number(
                              review.rating
                            )
                              ? "★"
                              : "☆"}
                          </span>
                        )
                      )}
                    </div>

                    <h3
                      className="vorn-review-title"
                      style={
                        styles.reviewTitle
                      }
                    >
                      {
                        review.title
                      }
                    </h3>
                  </div>

                  <span
                    style={
                      styles.reviewDate
                    }
                  >
                    {review.created_at
                      ? new Date(
                          review.created_at
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : ""}
                  </span>
                </div>

                <p
                  style={
                    styles.reviewComment
                  }
                >
                  {
                    review.comment
                  }
                </p>
              </article>
            )
          )
        )}
      </div>

      <style>{`
        .vorn-reviews-section,
        .vorn-reviews-section * {
          box-sizing: border-box;
        }

        .vorn-reviews-section {
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          overflow-x: hidden;
        }

        .vorn-reviews-section input,
        .vorn-reviews-section textarea,
        .vorn-reviews-section button {
          max-width: 100%;
        }

        @media (max-width: 900px) {
          .vorn-reviews-section {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }

          .vorn-reviews-header {
            align-items: flex-start !important;
          }
        }

        @media (max-width: 680px) {
          .vorn-reviews-section {
            margin-top: 60px !important;
            padding: 44px 16px 56px !important;
          }

          .vorn-reviews-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 24px !important;
            margin-bottom: 26px !important;
          }

          .vorn-reviews-heading {
            font-size: 32px !important;
            line-height: 1.15 !important;
          }

          .vorn-reviews-summary {
            justify-content: flex-start !important;
            width: 100%;
          }

          .vorn-reviews-action-row {
            justify-content: stretch !important;
            padding-bottom: 20px !important;
          }

          .vorn-reviews-write-button {
            width: 100%;
            padding: 14px 18px !important;
          }

          .vorn-review-form {
            padding: 22px 16px !important;
          }

          .vorn-review-form-header {
            gap: 16px !important;
          }

          .vorn-review-form-title {
            font-size: 25px !important;
          }

          .vorn-review-top {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .vorn-review-date {
            align-self: flex-start !important;
          }

          .vorn-review-comment {
            max-width: none !important;
            font-size: 13px !important;
            line-height: 1.7 !important;
          }

          .vorn-review-rating-picker {
            gap: 2px !important;
          }

          .vorn-review-rating-button {
            padding: 4px 2px !important;
            font-size: 23px !important;
          }
        }

        @media (max-width: 420px) {
          .vorn-reviews-section {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .vorn-reviews-heading {
            font-size: 28px !important;
          }

          .vorn-reviews-summary {
            gap: 10px !important;
          }

          .vorn-reviews-average {
            font-size: 36px !important;
          }

          .vorn-review-form {
            padding: 18px 12px !important;
          }

          .vorn-review-card {
            padding: 22px 0 !important;
          }

          .vorn-review-title {
            font-size: 18px !important;
          }

          .vorn-review-close-button {
            font-size: 25px !important;
          }
        }
      `}</style>

    </section>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  section: {
    width: "100%",
    maxWidth: "1200px",
    margin:
      "90px auto 0",
    padding:
      "70px 0",
    borderTop:
      "1px solid #e8e8e8",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap: "30px",
    marginBottom:
      "35px",
  },

  eyebrow: {
    margin: "0 0 10px",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing:
      "3px",
    color: "#777",
  },

  heading: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "38px",
    fontWeight: "400",
    color: "#111",
  },

  summary: {
    display: "flex",
    alignItems:
      "center",
    gap: "14px",
  },

  average: {
    fontFamily:
      "Georgia, serif",
    fontSize: "42px",
    color: "#111",
  },

  stars: {
    display: "flex",
    gap: "2px",
  },

  star: {
    fontSize: "17px",
    color: "#111",
  },

  reviewCount: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#777",
  },

  actionRow: {
    display: "flex",
    justifyContent:
      "flex-end",
    paddingBottom:
      "25px",
    borderBottom:
      "1px solid #e8e8e8",
  },

  writeButton: {
    padding:
      "14px 24px",
    border:
      "1px solid #111",
    background:
      "#fff",
    color: "#111",
    cursor:
      "pointer",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing:
      "1.5px",
  },

  successMessage: {
    marginBottom:
      "20px",
    padding:
      "14px 16px",
    background:
      "#f5f8f5",
    border:
      "1px solid #dce8dc",
    color: "#385438",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  errorMessage: {
    marginBottom:
      "20px",
    padding:
      "14px 16px",
    background:
      "#faf5f5",
    border:
      "1px solid #eadada",
    color: "#8a3333",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  form: {
    marginTop:
      "30px",
    padding:
      "30px",
    border:
      "1px solid #e2e2e2",
    background:
      "#fafafa",
  },

  formHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    marginBottom:
      "30px",
  },

  formEyebrow: {
    margin:
      "0 0 7px",
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing:
      "2px",
    color: "#888",
  },

  formTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "28px",
    fontWeight: "400",
  },

  closeButton: {
    border: "none",
    background:
      "transparent",
    fontSize: "28px",
    cursor:
      "pointer",
    color: "#111",
  },

  field: {
    marginBottom:
      "22px",
  },

  label: {
    display: "block",
    marginBottom:
      "9px",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing:
      "1.5px",
    color: "#333",
  },

  ratingPicker: {
    display: "flex",
    gap: "4px",
  },

  ratingButton: {
    border: "none",
    background:
      "transparent",
    padding:
      "3px",
    cursor:
      "pointer",
    fontSize: "25px",
    color: "#ccc",
  },

  ratingActive: {
    color: "#111",
  },

  input: {
    width: "100%",
    boxSizing:
      "border-box",
    padding:
      "13px 14px",
    border:
      "1px solid #d8d8d8",
    background:
      "#fff",
    outline: "none",
    fontSize: "13px",
    fontFamily:
      "inherit",
  },

  textarea: {
    width: "100%",
    boxSizing:
      "border-box",
    padding:
      "13px 14px",
    border:
      "1px solid #d8d8d8",
    background:
      "#fff",
    outline: "none",
    resize: "vertical",
    fontSize: "13px",
    lineHeight: 1.6,
    fontFamily:
      "inherit",
  },

  submitButton: {
    width: "100%",
    padding:
      "15px",
    border:
      "1px solid #111",
    background:
      "#111",
    color:
      "#fff",
    cursor:
      "pointer",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing:
      "1.5px",
  },

  reviewList: {
    marginTop:
      "30px",
  },

  emptyState: {
    padding:
      "60px 20px",
    textAlign:
      "center",
    border:
      "1px solid #eee",
  },

  emptyTitle: {
    margin:
      "0 0 8px",
    fontFamily:
      "Georgia, serif",
    fontSize: "24px",
  },

  emptyText: {
    margin: 0,
    color: "#777",
    fontSize: "12px",
  },

  reviewCard: {
    padding:
      "28px 0",
    borderBottom:
      "1px solid #e8e8e8",
  },

  reviewTop: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "20px",
  },

  reviewStars: {
    display: "flex",
    gap: "2px",
    marginBottom:
      "8px",
  },

  reviewStar: {
    fontSize: "13px",
    color: "#111",
  },

  reviewTitle: {
    margin: 0,
    fontFamily:
      "Georgia, serif",
    fontSize: "19px",
    fontWeight: "400",
  },

  reviewDate: {
    flexShrink: 0,
    fontSize: "10px",
    color: "#888",
  },

  reviewComment: {
    margin:
      "14px 0 0",
    maxWidth: "800px",
    fontSize: "13px",
    lineHeight: 1.8,
    color: "#555",
  },
};