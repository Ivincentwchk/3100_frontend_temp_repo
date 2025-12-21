import { useMemo, useState } from "react";
import { requestPasswordReset, type LoginResponse } from "../../feature/auth/api";

const SHOW_PASSWORD_ICON = "https://cdn-icons-png.flaticon.com/512/159/159604.png";
const HIDE_PASSWORD_ICON = "https://cdn-icons-png.flaticon.com/512/565/565655.png";


interface LoginProps {
  onSignUp: () => void;
  handleLogin: (user_name: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  authError?: string | null;
}

export function Login({
  onSignUp,
  handleLogin,
  authError,
}: LoginProps) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const passwordToggleLabel = useMemo(() => (showPassword ? "Hide password" : "Show password"), [showPassword]);
  const resetBaseUrl = import.meta.env.VITE_RESET_PASSWORD_URL as string | undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    handleLogin(userName, password, rememberMe)
      .then(() => {
        setSuccessMessage(`Welcome back, ${userName}!`);
      })
      .finally(() => setSubmitting(false));
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetFeedback("Please enter your email address.");
      return;
    }
    setResetSubmitting(true);
    setResetFeedback("Sending reset instructions...");
    requestPasswordReset(resetEmail.trim(), resetBaseUrl)
      .then((response) => {
        setResetFeedback(response.data.detail ?? "If an account exists for that email, you'll receive instructions shortly.");
      })
      .catch(() => {
        setResetFeedback("If an account exists for that email, you'll receive instructions shortly.");
      })
      .finally(() => setResetSubmitting(false));
  };

  return (
    <div className="page-shell" data-name="login">
      <div className="page-content">
        <h1 className="page-title">Log in</h1>

        {successMessage && (
          <div className="status-text ok">{successMessage}</div>
        )}

        {authError && (
          <div className="error-box">
            <span className="error-icon">⚠</span>
            <div className="error-content">
              <span>{authError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          <div className="field">
            <label htmlFor="login-user" className="field-label">
              User name
            </label>
            <input
              id="login-user"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
            <div className="field password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
              <button
                type="button"
                aria-label={passwordToggleLabel}
                className="btn btn-secondary password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                                <span className="password-toggle-icon" aria-hidden="true">
                  <img src={showPassword ? HIDE_PASSWORD_ICON : SHOW_PASSWORD_ICON} alt="" />
                </span>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="field">
            <label className="field-label remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="btn btn-ghost" onClick={() => setShowResetForm((prev) => !prev)}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {showResetForm && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="modal-header">
                  <h2 className="field-label" style={{ margin: 0 }}>Reset password</h2>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowResetForm(false)}>
                    ✕
                  </button>
                </div>
                <div className="field">
                  <label htmlFor="reset-email" className="field-label">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input"
                    autoFocus
                    required
                  />
                </div>
                {resetFeedback && (
                  <div className="status-text" style={{ marginBottom: "0.75rem" }}>{resetFeedback}</div>
                )}
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowResetForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-secondary" disabled={resetSubmitting}>
                    {resetSubmitting ? "Sending..." : "Send reset link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="helper-text" style={{ textAlign: "center" }}>
          Need an account?{" "}
          <button type="button" className="btn btn-ghost" onClick={onSignUp}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}