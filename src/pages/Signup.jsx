import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("");

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!fullName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await signUp({
        email,
        password,
        fullName,
      });

      if (data.session) {
        navigate("/");
        return;
      }

      setSuccessMessage(
        "Account created successfully. Please check your email to verify your account."
      );

      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Signup error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to create your account. Please try again."
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
            Create Account
          </h1>

          <p style={styles.subtitle}>
            Join VORN and discover your everyday style.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Full Name

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              style={styles.input}
              disabled={loading}
            />
          </label>

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
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                style={styles.passwordInput}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                style={styles.passwordButton}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label style={styles.label}>
            Confirm Password

            <div style={styles.passwordWrapper}>
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                style={styles.passwordInput}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                style={styles.passwordButton}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {errorMessage && (
            <div style={styles.error}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={styles.success}>
              {successMessage}
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
              ? "CREATING ACCOUNT..."
              : "CREATE ACCOUNT"}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={styles.loginButton}
          >
            Sign in
          </button>
        </p>
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
    margin: "0",
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

  success: {
    padding: "12px 14px",
    background: "#f1f8f3",
    border: "1px solid #cfe4d3",
    color: "#276137",
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

  loginText: {
    margin: "28px 0 0",
    textAlign: "center",
    fontSize: "13px",
    color: "#666",
  },

  loginButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: "600",
  },
};