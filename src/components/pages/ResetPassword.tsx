import { useMemo, useState } from "react";
import { GridBackground } from "../GridBackground";
import { confirmPasswordReset } from "../../feature/auth/api";

const getQueryParam = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

export function ResetPassword() {
  const tokenFromUrl = useMemo(() => getQueryParam("token") ?? "", []);
  const emailFromUrl = useMemo(() => getQueryParam("email") ?? "", []);

  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"ok" | "warn">("ok");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !email.trim()) {
      setStatusTone("warn");
      setStatusMessage("Missing token or email. Please ensure you used the reset link from your email.");
      return;
    }
    if (!password || password.length < 8) {
      setStatusTone("warn");
      setStatusMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setStatusTone("warn");
      setStatusMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("Updating your password...");
    setStatusTone("ok");
    try {
      const response = await confirmPasswordReset(token.trim(), email.trim(), password);
      setStatusMessage(response.data.detail ?? "Password updated. You may now log in.");
      setStatusTone("ok");
    } catch (err) {
      console.error("reset password error", err);
      setStatusTone("warn");
      setStatusMessage("Unable to reset password. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell" data-name="reset-password">
      <GridBackground />
      <div className="page-content">
        <h1 className="page-title">Reset your password</h1>
        <p className="helper-text" style={{ textAlign: "center" }}>
          Enter the email address and token from the link we sent you, then choose a new password.
        </p>

        {statusMessage && (
          <div className={`status-text ${statusTone === "warn" ? "warn" : "ok"}`}>{statusMessage}</div>
        )}

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="reset-email" className="field-label">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reset-token" className="field-label">
              Reset token
            </label>
            <input
              id="reset-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="input"
              required
            />
            <p className="helper-text">This is included in the link we emailed to you.</p>
          </div>

          <div className="field">
            <label htmlFor="new-password" className="field-label">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="confirm-password" className="field-label">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
