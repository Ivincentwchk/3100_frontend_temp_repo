import imgLogo from "figma:asset/685e1c874d33b97ec46986ea2b9b2bf321a7a1d7.png";
import imgChicken from "../assets/chicken.png";

export type NavPage = "home" | "explore" | "ranking" | "export" | "profile";

interface NavbarProps {
  onLogoClick?: () => void;
  username?: string;
  activePage?: NavPage;
  onNavigate?: (page: NavPage) => void;
  profilePicUrl?: string;
}

const navItems: { id: NavPage; label: string }[] = [
  { id: "home", label: "HOME" },
  { id: "explore", label: "EXPLORE" },
  { id: "ranking", label: "RANKING" },
  { id: "export", label: "EXPORT" },
];

export function Navbar({ onLogoClick, username, activePage, onNavigate, profilePicUrl }: NavbarProps) {
  const isLoggedIn = Boolean(username && onNavigate);

  // Guest navbar (with logo)
  if (!isLoggedIn) {
    return (
      <div className="relative h-[100px] w-full z-50" data-name="nav bar guest">
        <div className="absolute bg-[#101010] inset-0 opacity-90" data-name="nav bar">
          <div aria-hidden="true" className="absolute border-[#666666] border-[0px_0px_1px] border-solid bottom-[-1px] left-0 pointer-events-none right-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0" />
        </div>
        <div 
          className="absolute w-[207px] h-[70px] left-[200px] top-[15px] cursor-pointer" 
          data-name="logo button 1"
          onClick={onLogoClick}
        >
          <img alt="Condingo Logo" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgLogo} />
        </div>
      </div>
    );
  }

  // Logged-in navbar (no logo, with nav items and user profile)
  return (
    <div className="relative h-[70px] w-full z-50 bg-[#1a1a1a]" data-name="nav bar logged in">
      <div className="absolute inset-0 border-b border-[#333333]" />
      
      <div className="relative h-full flex items-center justify-between px-8">
        {/* Navigation items - centered */}
        <nav className="flex items-center gap-12">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className="relative flex items-center h-[70px] font-['Poppins'] text-[16px] tracking-wide transition-colors"
              >
                {/* Yellow active indicator bar */}
                {isActive && (
                  <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[4px] h-[24px] bg-[#c3bb1a] rounded-full" />
                )}
                <span className={isActive ? "text-white font-semibold" : "text-[#888888] hover:text-white"}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User profile section - right side */}
        <button
          onClick={() => onNavigate?.("profile")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span className="font-['Poppins'] text-[16px] text-white">
            {username}
          </span>
          <div className="w-[40px] h-[40px] rounded-full bg-[#c3bb1a] flex items-center justify-center overflow-hidden">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <img src={imgChicken} alt="Profile" className="w-[28px] h-[28px] object-contain" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}