import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../feature/auth/useAuth";
import {
  validatePassword,
  isEmailValid,
  isPasswordValid,
  doPasswordsMatch,
  EMAIL_REGEX,
} from "../../feature/auth/validation";

interface RegisterProps {
  onLogin: () => void;
}

const SHOW_PASSWORD_ICON = "https://cdn-icons-png.flaticon.com/512/159/159604.png";
const HIDE_PASSWORD_ICON = "https://cdn-icons-png.flaticon.com/512/565/565655.png";

type AvailabilityState = "available" | "taken" | "checking" | null;

const statusClass = (state: AvailabilityState) => {
  if (state === "taken") return "status-text warn";
  if (state === "available") return "status-text ok";
  return "status-text";
};

export function Register({ onLogin }: RegisterProps) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [license, setLicense] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userNameStatus, setUserNameStatus] = useState<AvailabilityState>(null);
  const [emailStatus, setEmailStatus] = useState<AvailabilityState>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const { handleRegister, error, checkUserAvailability } = useAuth();

  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const passwordsMatch = useMemo(() => doPasswordsMatch(password, confirmPassword), [password, confirmPassword]);

  useEffect(() => {
    let cancelled = false;
    if (!userName.trim()) {
      setUserNameStatus(null);
      return;
    }
    setUserNameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkUserAvailability(userName.trim(), undefined);
        if (!cancelled) {
          setUserNameStatus(result.user_name_available ? "available" : "taken");
        }
      } catch {
        if (!cancelled) setUserNameStatus(null);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userName, checkUserAvailability]);

  useEffect(() => {
    let cancelled = false;
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailStatus(null);
      setEmailError(null);
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailStatus(null);
      setEmailError("Invalid email format");
      return;
    }
    setEmailError(null);
    setEmailStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkUserAvailability(undefined, trimmed);
        if (!cancelled) {
          setEmailStatus(result.email_available ? "available" : "taken");
        }
      } catch {
        if (!cancelled) setEmailStatus(null);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email, checkUserAvailability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid(email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!isPasswordValid(password)) {
      alert("Password is too weak. Add uppercase, numbers, or symbols.");
      return;
    }
    if (!doPasswordsMatch(password, confirmPassword)) {
      alert("Passwords do not match");
      return;
    }
    setSubmitting(true);
    setSuccessMessage(null);
    handleRegister(userName, email, password, license)
      .then(() => {
        setSuccessMessage(`Account created for ${userName}!`);
        onLogin();
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="page-shell" data-name="register">
      <div className="page-content">
        <h1 className="page-title">Create your account</h1>
        <p className="helper-text" style={{ textAlign: "center" }}>
          Unlock the full experience by creating a developer profile.
        </p>

        {(error || successMessage) && (
          <div className={`status-text ${error ? "warn" : "ok"}`}>{error ?? successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          <div className="field">
            <label htmlFor="register-username" className="field-label">
              User name
            </label>
            <input
              id="register-username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input"
              required
            />
            <p className={statusClass(userNameStatus)}>
              {userNameStatus === "checking"
                ? "Checking availability..."
                : userNameStatus === "taken"
                  ? "Username already taken"
                  : userNameStatus === "available"
                    ? "Username available"
                    : "Choose a unique username"}
            </p>
          </div>

          <div className="field">
            <label htmlFor="register-email" className="field-label">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
            <p className={emailError ? "status-text warn" : statusClass(emailStatus)}>
              {emailError
                ? emailError
                : emailStatus === "checking"
                  ? "Checking email..."
                  : emailStatus === "taken"
                    ? "Email already registered"
                    : emailStatus === "available"
                      ? "Email available"
                      : "Use a valid email address"}
            </p>
          </div>

          <div className="field">
            <label htmlFor="register-password" className="field-label">
              Password
            </label>
            <div className="field password-field">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
              <button
                type="button"
                className="btn btn-secondary password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="password-toggle-icon" aria-hidden="true">
                  <img src={showPassword ? HIDE_PASSWORD_ICON : SHOW_PASSWORD_ICON} alt="" />
                </span>
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <div className="password-strength">
              <div className="strength-bars">
                <span className={`bar ${passwordValidation.strength ? "active" : ""} ${passwordValidation.strength}`} />
                <span className={`bar ${passwordValidation.strength === "medium" || passwordValidation.strength === "strong" ? "active" : ""} ${passwordValidation.strength}`} />
                <span className={`bar ${passwordValidation.strength === "strong" ? "active" : ""} ${passwordValidation.strength}`} />
              </div>
              <span className={`strength-label ${passwordValidation.strength || ""}`}>
                {passwordValidation.strength === "weak" && "Weak"}
                {passwordValidation.strength === "medium" && "Medium"}
                {passwordValidation.strength === "strong" && "Strong"}
                {!passwordValidation.strength && "Enter password"}
              </span>
            </div>
            <p className="helper-text">Use at least 8 characters with uppercase, lowercase, numbers, and symbols.</p>
          </div>

          <div className="field">
            <label htmlFor="register-confirm-password" className="field-label">
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
            {confirmPassword && (
              <p className={`status-text ${passwordsMatch ? "ok" : "warn"}`}>
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="register-license" className="field-label">
              License (optional)
            </label>
            <input
              id="register-license"
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="input"
              placeholder="e.g. MIT, Apache-2.0"
            />
          </div>

          <div className="helper-text">
            By continuing, you agree to our Terms of Use and Privacy Policy.
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Creating account..." : "Sign up"}
          </button>

          <p className="helper-text" style={{ textAlign: "center" }}>
            Already have an account?{" "}
            <button type="button" className="btn btn-ghost" onClick={onLogin}>
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}