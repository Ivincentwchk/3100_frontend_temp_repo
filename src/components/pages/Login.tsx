import { useMemo, useState } from "react";
import { GridBackground } from "../GridBackground";
import type { LoginResponse } from "../../feature/auth/api";

interface LoginProps {
  onSignUp: () => void;
  onForgotPassword: () => void;
  handleLogin: (user_name: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  authError?: string | null;
}

export function Login({
  onSignUp,
  onForgotPassword,
  handleLogin,
  authError,
}: LoginProps) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordToggleLabel = useMemo(() => (showPassword ? "Hide password" : "Show password"), [showPassword]);

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

  return (
    <div className="page-shell" data-name="login">
      <GridBackground />
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
                className="btn btn-ghost password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
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
            <button type="button" className="btn btn-ghost" onClick={onForgotPassword}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

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