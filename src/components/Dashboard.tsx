import type { AuthUser } from "../feature/auth/api";
import { GridBackground } from "./GridBackground";

interface DashboardProps {
  user: AuthUser;
  token: string | null;
  onLogout: () => void;
}

function Dashboard({ user, token, onLogout }: DashboardProps) {
  const maskedToken = token ? `${token.substring(0, 20)}...` : 'No token';

  return (
    <div className="page-shell" data-name="dashboard">
      <GridBackground />
      <div className="page-content">
        <h1 className="page-title">Welcome back, {user.user_name}!</h1>
        <p className="helper-text" style={{ textAlign: "center", marginBottom: "2rem" }}>
          You are successfully logged in with your authentication token.
        </p>
        
        <div className="form-card">
          <h2 className="field-label" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>User Information</h2>
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
            <label className="field-label">Score</label>
            <div className="input">{user.profile.score}</div>
          </div>
          
          <div className="field">
            <label className="field-label">Rank</label>
            <div className="input">{user.profile.rank}</div>
          </div>
          
          <div className="field">
            <label className="field-label">Login Streak</label>
            <div className="input">{user.profile.login_streak_days} days</div>
          </div>
          
          <div className="field">
            <label className="field-label">Authentication Token</label>
            <div className="input" style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>{maskedToken}</div>
          </div>
          
          <button type="button" onClick={onLogout} className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Logout
          </button>
        </div>
        
        <div className="form-card" style={{ marginTop: "2rem" }}>
          <h2 className="field-label" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Quick Actions</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={() => alert('Profile settings coming soon!')}>
              Edit Profile
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => alert('View statistics coming soon!')}>
              View Statistics
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => alert('Settings coming soon!')}>
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
