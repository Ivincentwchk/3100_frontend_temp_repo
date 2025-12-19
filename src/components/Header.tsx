import logoImg from "figma:asset/685e1c874d33b97ec46986ea2b9b2bf321a7a1d7.png";

import type { AuthUser } from "../feature/auth/api";
import { ProfileAvatar } from "./ProfileAvatar";

export type NavPage = "home" | "explore" | "ranking" | "export" | "profile";

interface HeaderProps {
  onLogoClick?: () => void;
  user?: AuthUser | null;
  onProfileClick?: () => void;
  activePage?: NavPage;
  onNavigate?: (page: NavPage) => void;
}

const navItems: { id: NavPage; label: string }[] = [
  { id: "home", label: "HOME" },
  { id: "explore", label: "EXPLORE" },
  { id: "ranking", label: "RANKING" },
  { id: "export", label: "EXPORT" },
];

export function Header({ onLogoClick, user, onProfileClick, activePage = "home", onNavigate }: HeaderProps) {
  const isLoggedIn = Boolean(user);

  // Guest header (with logo only)
  if (!isLoggedIn) {
    return (
      <header className="header">
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="header-logo" onClick={onLogoClick}>
            <img src={logoImg} alt="Condingo Logo" />
          </div>
        </div>
      </header>
    );
  }

  // Logged-in header (nav items + user profile, no logo)
  return (
    <header className="header" style={{ height: "70px", background: "#1a1a1a", borderBottom: "1px solid #333", padding: "0" }}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem" }}>
        {/* Navigation items */}
        <nav style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  height: "70px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "16px",
                  letterSpacing: "0.5px",
                  color: isActive ? "#ffffff" : "#888888",
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#888888";
                }}
              >
                {/* Yellow active indicator bar */}
                {isActive && (
                  <span style={{
                    position: "absolute",
                    left: "-12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "4px",
                    height: "24px",
                    backgroundColor: "#c3bb1a",
                    borderRadius: "2px",
                  }} />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User profile section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "16px",
            color: "#ffffff",
          }}>
            {user?.user_name || "User"}
          </span>
          {user && <ProfileAvatar user={user} size={40} variant="header" onClick={onProfileClick} />}
        </div>
      </div>
    </header>
  );
}
