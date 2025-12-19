import type { AuthUser } from "../feature/auth/api";

import { ProfileAvatar } from "./ProfileAvatar";

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
  onOpenSubjects?: () => void;
  onEditProfile?: () => void;
  onOpenAchievements?: () => void;
}

function UserInfo({ user, onLogout, onOpenSubjects, onEditProfile, onOpenAchievements }: DashboardProps) {
  const totalScore = user.total_score ?? user.profile.score;

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
          
          <div className="field">
            <label className="field-label">Total Score</label>
            <div className="input">{totalScore}</div>
          </div>
          
          <div className="field">
            <label className="field-label">Rank</label>
            <div className="input">{user.profile.rank}</div>
          </div>
          
          <div className="field">
            <label className="field-label">Login Streak</label>
            <div className="input">{user.profile.login_streak_days} days</div>
          </div>
          
          <button type="button" onClick={onLogout} className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Logout
          </button>
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
