import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("confirming");
  const [message, setMessage] = useState(
    "Confirming your VORN account..."
  );

  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Auth callback error:", error);

        setStatus("error");
        setMessage(
          "We could not confirm your account. Please try again."
        );

        return;
      }

      if (session?.user) {
        setStatus("success");
        setMessage(
          "Your email has been confirmed successfully."
        );

        setTimeout(() => {
          navigate("/account", {
            replace: true,
          });
        }, 1200);

        return;
      }

      setStatus("error");
      setMessage(
        "Your confirmation link is invalid or has expired."
      );
    }

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>VORN ACCOUNT</p>

        {status === "confirming" && (
          <>
            <div style={styles.loader} />
            <h1 style={styles.title}>
              Confirming Email
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.icon}>✓</div>

            <h1 style={styles.title}>
              Email Confirmed
            </h1>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorIcon}>!</div>

            <h1 style={styles.title}>
              Confirmation Failed
            </h1>
          </>
        )}

        <p style={styles.message}>
          {message}
        </p>

        {status === "error" && (
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={styles.button}
          >
            GO TO SIGN IN
          </button>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    background: "#fff",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "55px 40px",
    textAlign: "center",
    border: "1px solid #e8e8e8",
  },

  eyebrow: {
    margin: "0 0 18px",
    fontSize: "10px",
    letterSpacing: "3px",
    fontWeight: "600",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontFamily: "Georgia, serif",
    fontWeight: "500",
  },

  message: {
    margin: "18px auto 0",
    maxWidth: "360px",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.7",
  },

  loader: {
    width: "30px",
    height: "30px",
    margin: "0 auto 25px",
    border: "2px solid #e5e5e5",
    borderTop: "2px solid #111",
    borderRadius: "50%",
    animation: "vornAuthSpin 0.8s linear infinite",
  },

  icon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#111",
    color: "#fff",
    fontSize: "24px",
  },

  errorIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#111",
    color: "#fff",
    fontSize: "22px",
  },

  button: {
    marginTop: "28px",
    padding: "15px 25px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontWeight: "600",
  },
};