import logoImg from "figma:asset/685e1c874d33b97ec46986ea2b9b2bf321a7a1d7.png";

interface AuthHeaderProps {
  onLogoClick?: () => void;
}

export function AuthHeader({ onLogoClick }: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <div className="auth-header-logo" onClick={onLogoClick}>
        <img src={logoImg} alt="Condingo Logo" />
      </div>
    </header>
  );
}
