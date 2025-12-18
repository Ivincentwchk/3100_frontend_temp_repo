import logoImg from "figma:asset/685e1c874d33b97ec46986ea2b9b2bf321a7a1d7.png";

import type { AuthUser } from "../feature/auth/api";
import { ProfileAvatar } from "./ProfileAvatar";

interface HeaderProps {
  onLogoClick?: () => void;
  user?: AuthUser | null;
  onProfileClick?: () => void;
}

export function Header({ onLogoClick, user, onProfileClick }: HeaderProps) {
  return (
    <header className="header">
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="header-logo" onClick={onLogoClick}>
          <img src={logoImg} alt="Condingo Logo" />
        </div>

        {user && <ProfileAvatar user={user} size={44} onClick={onProfileClick} />}
      </div>
    </header>
  );
}
