import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { signIn } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await signIn({
        email,
        password,
      });

      const redirectTo =
        location.state?.from || "/account";

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>VORN ACCOUNT</p>

          <h1 style={styles.title}>
            Sign In
          </h1>

          <p style={styles.subtitle}>
            Welcome back to VORN.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          <label style={styles.label}>
            Email Address

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              style={styles.input}
              disabled={loading}
            />
          </label>

          <label style={styles.label}>
            Password

            <div style={styles.passwordWrapper}>
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                style={styles.passwordInput}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                style={styles.passwordButton}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </label>

          {errorMessage && (
            <div style={styles.error}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "SIGNING IN..."
              : "SIGN IN"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have a VORN account?
          </p>

          <Link
            to="/register"
            style={styles.registerLink}
          >
            CREATE ACCOUNT
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "80px 20px",
    background: "#fff",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "48px",
    border: "1px solid #e8e8e8",
    background: "#fff",
  },

  header: {
    textAlign: "center",
    marginBottom: "36px",
  },

  eyebrow: {
    margin: "0 0 12px",
    fontSize: "11px",
    letterSpacing: "3px",
    fontWeight: "600",
  },

  title: {
    margin: 0,
    fontSize: "42px",
    fontFamily: "Georgia, serif",
    fontWeight: "500",
  },

  subtitle: {
    margin: "14px 0 0",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "12px",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d8d8d8",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
  },

  passwordWrapper: {
    display: "flex",
    alignItems: "stretch",
    border: "1px solid #d8d8d8",
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    padding: "14px 15px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
  },

  passwordButton: {
    padding: "0 14px",
    border: "none",
    background: "#fff",
    cursor: "pointer",
    fontSize: "11px",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },

  error: {
    padding: "12px 14px",
    background: "#fff1f1",
    border: "1px solid #f0cccc",
    color: "#a00000",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  submitButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    letterSpacing: "1.5px",
    fontWeight: "600",
  },

  footer: {
    marginTop: "28px",
    textAlign: "center",
  },

  footerText: {
    margin: "0 0 10px",
    fontSize: "13px",
    color: "#666",
  },

  registerLink: {
    color: "#111",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textDecoration: "underline",
  },
};