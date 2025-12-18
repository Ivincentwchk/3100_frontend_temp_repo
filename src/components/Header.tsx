import logoImg from "figma:asset/685e1c874d33b97ec46986ea2b9b2bf321a7a1d7.png";

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-logo" onClick={onLogoClick}>
        <img src={logoImg} alt="Condingo Logo" />
      </div>
    </header>
  );
}
