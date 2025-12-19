import type { AuthUser } from "../feature/auth/api";

import { ProfileAvatar } from "./ProfileAvatar";
import { confirmPasswordReset } from "../feature/auth/api";
import { useMemo, useState } from "react";

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
  onOpenSubjects?: () => void;
  onEditProfile?: () => void;
  onOpenAchievements?: () => void;
}

function UserInfo({ user, onLogout, onOpenSubjects, onEditProfile, onOpenAchievements }: DashboardProps) {
  const emailPrefill = useMemo(() => user.email ?? "", [user.email]);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState(emailPrefill);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"ok" | "warn">("ok");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !email.trim()) {
      setStatusTone("warn");
      setStatusMessage("Missing token or email.");
      return;
    }
    if (newPassword.length < 8) {
      setStatusTone("warn");
      setStatusMessage("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusTone("warn");
      setStatusMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setStatusTone("ok");
    setStatusMessage("Updating password...");
    try {
      await confirmPasswordReset(token, email, newPassword);
      setStatusTone("ok");
      setStatusMessage("Password updated. You can now log in with the new password.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setStatusTone("warn");
      setStatusMessage("Unable to update password. Check token/email and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell" data-name="user info">
      <div className="page-content">
        <h1 className="page-title">User Info</h1>
        <p className="helper-text" style={{ textAlign: "center", marginBottom: "2rem" }}>
          {user.user_name}
        </p>
        
        <div className="form-card">
          <h2 className="field-label" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>User Information</h2>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <ProfileAvatar user={user} size={92} onClick={onEditProfile} showEditOnHover />
          </div>

          <div className="field">
            <label className="field-label">User Name</label>
            <div className="input">{user.user_name}</div>
          </div>
          
          <div className="field">
            <label className="field-label">Email</label>
            <div className="input">{user.email}</div>
          </div>
          
          <div className="field">
            <label className="field-label">License</label>
            <div className="input">{user.License || 'None'}</div>
          </div>
          
          <button type="button" onClick={onLogout} className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Logout
          </button>
        </div>

        <div className="form-card" style={{ marginTop: "2rem" }}>
          <h2 className="field-label" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Change Password</h2>
          <form onSubmit={handleChangePassword} style={{ display: "grid", gap: "0.75rem" }}>
            <div className="field">
              <label className="field-label">Reset token</label>
              <input
                className="input"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from email"
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label className="field-label">New password</label>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="field">
              <label className="field-label">Confirm password</label>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              Update Password
            </button>
            {statusMessage && <div className={`status-text ${statusTone}`}>{statusMessage}</div>}
          </form>
        </div>
        
        <div className="form-card" style={{ marginTop: "2rem" }}>
          <h2 className="field-label" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Quick Actions</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={onEditProfile}>
              Edit Profile
            </button>
            {onOpenAchievements && (
              <button type="button" className="btn btn-secondary" onClick={onOpenAchievements}>
                Achievements
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => alert('View statistics coming soon!')}>
              View Statistics
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => alert('Settings coming soon!')}>
              Settings
            </button>
            {onOpenSubjects && (
              <button type="button" className="btn btn-secondary" onClick={onOpenSubjects}>
                POC: Subjects
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
