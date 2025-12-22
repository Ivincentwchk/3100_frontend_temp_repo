import type { AuthUser } from "../feature/auth/api";
import { changeMyPassword } from "../feature/auth/api";
import { useState } from "react";
import { ProfileAvatar } from "./ProfileAvatar";

interface AccountInfoProps {
  user: AuthUser;
  onEditProfile?: () => void;
  onLogout?: () => void;
  onOpenSubjects?: () => void;
  onOpenAchievements?: () => void;
}

function AccountInfo({ user, onEditProfile }: AccountInfoProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"ok" | "warn">("ok");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setStatusTone("warn");
      setStatusMessage("Current password is required.");
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
      await changeMyPassword(currentPassword, newPassword);
      setStatusTone("ok");
      setStatusMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setStatusTone("warn");
      setStatusMessage("Unable to update password. Check your current password and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell" data-name="account info">
      <div className="page-content">
        <h1 className="page-title">Account Info</h1>
        
        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <ProfileAvatar user={user} size={92} onClick={onEditProfile} showEditOnHover />
          </div>

          <div className="field">
            <label className="field-label">User name</label>
            <div className="input">{user.user_name}</div>
          </div>

          <div className="field">
            <label className="field-label">Email</label>
            <div className="input">{user.email}</div>
          </div>

        </div>

        <div className="form-card" style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <h2 className="field-label" style={{ fontSize: "1.25rem", marginBottom: 0 }}>Password</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsChangePasswordOpen((prev) => !prev);
                setStatusMessage(null);
                setStatusTone("ok");
              }}
            >
              {isChangePasswordOpen ? "Cancel" : "Change password"}
            </button>
          </div>

          {isChangePasswordOpen && (
            <form onSubmit={handleChangePassword} style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              <div className="field">
                <label className="field-label">Current password</label>
                <input
                  className="input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
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
          )}
        </div>
        
      </div>
    </div>
  );
}

export default AccountInfo;
