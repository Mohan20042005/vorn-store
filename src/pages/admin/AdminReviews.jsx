import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../services/supabaseClient";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     LOAD REVIEWS
  ===================================================== */

  async function loadReviews() {
    setLoading(true);
    setError("");

    const {
      data,
      error: fetchError,
    } = await supabase
      .from("reviews")
      .select(`
        id,
        product_id,
        user_id,
        order_id,
        rating,
        title,
        comment,
        is_approved,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      });

    if (fetchError) {
      console.error(
        "Admin reviews loading error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load reviews."
      );

      setReviews([]);
    } else {
      setReviews(data || []);
    }

    setLoading(false);
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadReviews();
  }, []);

  /* =====================================================
     UPDATE APPROVAL STATUS
  ===================================================== */

  async function updateApproval(
    reviewId,
    approved
  ) {
    setProcessingId(reviewId);
    setMessage("");
    setError("");

    const {
      error: updateError,
    } = await supabase
      .from("reviews")
      .update({
        is_approved: approved,
      })
      .eq("id", reviewId);

    if (updateError) {
      console.error(
        "Review approval error:",
        updateError
      );

      setError(
        updateError.message ||
          "Unable to update review."
      );

      setProcessingId(null);

      return;
    }

    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              is_approved: approved,
            }
          : review
      )
    );

    setMessage(
      approved
        ? "Review approved successfully."
        : "Review rejected successfully."
    );

    setProcessingId(null);
  }

  /* =====================================================
     DELETE REVIEW
  ===================================================== */

  async function deleteReview(
    reviewId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this review?"
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(reviewId);
    setMessage("");
    setError("");

    const {
      error: deleteError,
    } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      console.error(
        "Review delete error:",
        deleteError
      );

      setError(
        deleteError.message ||
          "Unable to delete review."
      );

      setProcessingId(null);

      return;
    }

    setReviews((current) =>
      current.filter(
        (review) =>
          review.id !== reviewId
      )
    );

    setMessage(
      "Review deleted successfully."
    );

    setProcessingId(null);
  }

  /* =====================================================
     COUNTS
  ===================================================== */

  const pendingCount =
    reviews.filter(
      (review) =>
        !review.is_approved
    ).length;

  const approvedCount =
    reviews.filter(
      (review) =>
        review.is_approved
    ).length;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main
      style={
        styles.page
      }
    >
      <div
        style={
          styles.container
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
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
              VORN ADMIN
            </p>

            <h1
              style={
                styles.title
              }
            >
              Reviews
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              Manage customer reviews
              and approval status.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadReviews
            }
            style={
              styles.refreshButton
            }
          >
            REFRESH
          </button>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div
          style={
            styles.stats
          }
        >
          <div
            style={
              styles.statCard
            }
          >
            <span
              style={
                styles.statLabel
              }
            >
              TOTAL REVIEWS
            </span>

            <strong
              style={
                styles.statValue
              }
            >
              {reviews.length}
            </strong>
          </div>

          <div
            style={
              styles.statCard
            }
          >
            <span
              style={
                styles.statLabel
              }
            >
              PENDING
            </span>

            <strong
              style={
                styles.statValue
              }
            >
              {pendingCount}
            </strong>
          </div>

          <div
            style={
              styles.statCard
            }
          >
            <span
              style={
                styles.statLabel
              }
            >
              APPROVED
            </span>

            <strong
              style={
                styles.statValue
              }
            >
              {approvedCount}
            </strong>
          </div>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div
            style={
              styles.success
            }
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={
              styles.error
            }
          >
            {error}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (
          <div
            style={
              styles.empty
            }
          >
            Loading reviews...
          </div>
        ) : reviews.length ===
          0 ? (
          <div
            style={
              styles.empty
            }
          >
            <h2
              style={
                styles.emptyTitle
              }
            >
              No reviews yet
            </h2>

            <p
              style={
                styles.emptyText
              }
            >
              Customer reviews will
              appear here.
            </p>
          </div>
        ) : (
          <div
            style={
              styles.reviewList
            }
          >
            {reviews.map(
              (review) => (
                <article
                  key={
                    review.id
                  }
                  style={
                    styles.reviewCard
                  }
                >
                  {/* REVIEW HEADER */}

                  <div
                    style={
                      styles.reviewHeader
                    }
                  >
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
                              Number(
                                review.rating ||
                                  0
                              )
                                ? "★"
                                : "☆"}
                            </span>
                          )
                        )}
                      </div>

                      <h2
                        style={
                          styles.reviewTitle
                        }
                      >
                        {review.title ||
                          "Untitled review"}
                      </h2>
                    </div>

                    <span
                      style={{
                        ...styles.status,
                        ...(review.is_approved
                          ? styles.approved
                          : styles.pending),
                      }}
                    >
                      {review.is_approved
                        ? "APPROVED"
                        : "PENDING"}
                    </span>
                  </div>

                  {/* COMMENT */}

                  <p
                    style={
                      styles.comment
                    }
                  >
                    {review.comment}
                  </p>

                  {/* META */}

                  <div
                    style={
                      styles.meta
                    }
                  >
                    <span>
                      Product ID:{" "}
                      {review.product_id}
                    </span>

                    <span>
                      User ID:{" "}
                      {review.user_id}
                    </span>

                    <span>
                      {review.created_at
                        ? new Date(
                            review.created_at
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : ""}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  <div
                    style={
                      styles.actions
                    }
                  >
                    {!review.is_approved && (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          review.id
                        }
                        onClick={() =>
                          updateApproval(
                            review.id,
                            true
                          )
                        }
                        style={
                          styles.approveButton
                        }
                      >
                        {processingId ===
                        review.id
                          ? "PROCESSING..."
                          : "APPROVE"}
                      </button>
                    )}

                    {review.is_approved && (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          review.id
                        }
                        onClick={() =>
                          updateApproval(
                            review.id,
                            false
                          )
                        }
                        style={
                          styles.rejectButton
                        }
                      >
                        {processingId ===
                        review.id
                          ? "PROCESSING..."
                          : "REJECT"}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        review.id
                      }
                      onClick={() =>
                        deleteReview(
                          review.id
                        )
                      }
                      style={
                        styles.deleteButton
                      }
                    >
                      DELETE
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    padding: "70px 40px",
    background: "#fff",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1300px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "45px",
  },

  eyebrow: {
    margin: "0 0 10px",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "3px",
    color: "#777",
  },

  title: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "46px",
    fontWeight: "400",
    color: "#111",
  },

  subtitle: {
    margin: "12px 0 0",
    fontSize: "13px",
    color: "#777",
  },

  refreshButton: {
    padding: "13px 22px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "30px",
  },

  statCard: {
    padding: "25px",
    border: "1px solid #e5e5e5",
    background: "#fff",
  },

  statLabel: {
    display: "block",
    marginBottom: "12px",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "#777",
  },

  statValue: {
    display: "block",
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: "400",
    color: "#111",
  },

  success: {
    marginBottom: "20px",
    padding: "14px 16px",
    border: "1px solid #dce8dc",
    background: "#f5f8f5",
    color: "#385438",
    fontSize: "12px",
  },

  error: {
    marginBottom: "20px",
    padding: "14px 16px",
    border: "1px solid #eadada",
    background: "#faf5f5",
    color: "#8a3333",
    fontSize: "12px",
  },

  reviewList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  reviewCard: {
    padding: "28px",
    border: "1px solid #e5e5e5",
    background: "#fff",
  },

  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },

  stars: {
    display: "flex",
    gap: "2px",
    marginBottom: "8px",
  },

  star: {
    fontSize: "15px",
    color: "#111",
  },

  reviewTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: "400",
    color: "#111",
  },

  status: {
    flexShrink: 0,
    padding: "7px 11px",
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  approved: {
    background: "#edf6ed",
    color: "#386038",
  },

  pending: {
    background: "#f7f2e8",
    color: "#80652f",
  },

  comment: {
    margin: "22px 0",
    maxWidth: "900px",
    fontSize: "13px",
    lineHeight: 1.8,
    color: "#555",
  },

  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #eee",
    fontSize: "10px",
    color: "#888",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
  },

  approveButton: {
    minWidth: "110px",
    padding: "12px 18px",
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  rejectButton: {
    minWidth: "110px",
    padding: "12px 18px",
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  deleteButton: {
    minWidth: "90px",
    padding: "12px 18px",
    border: "1px solid #d6d6d6",
    background: "#fff",
    color: "#777",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  empty: {
    padding: "80px 20px",
    border: "1px solid #e5e5e5",
    textAlign: "center",
  },

  emptyTitle: {
    margin: "0 0 10px",
    fontFamily: "Georgia, serif",
    fontSize: "28px",
    fontWeight: "400",
  },

  emptyText: {
    margin: 0,
    color: "#777",
    fontSize: "13px",
  },
};