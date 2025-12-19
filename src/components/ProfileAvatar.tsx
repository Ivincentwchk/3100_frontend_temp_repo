import { useEffect, useMemo, useState } from "react";

import type { AuthUser } from "../feature/auth/api";
import { getMyProfilePicBlob } from "../feature/auth/api";
import imgChicken from "../assets/chicken.png";

interface ProfileAvatarProps {
  user: AuthUser;
  size?: number;
  onClick?: () => void;
  variant?: "default" | "header";
  showEditOnHover?: boolean;
}

export function ProfileAvatar({
  user,
  size = 44,
  onClick,
  variant = "default",
  showEditOnHover = false,
}: ProfileAvatarProps) {
  const hasPic = Boolean(user.profile?.has_profile_pic);
  const [url, setUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const initials = useMemo(() => {
    const name = (user.user_name ?? "").trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? name[0];
    const second = parts.length > 1 ? parts[1]?.[0] : name[1];
    return `${(first ?? "U").toUpperCase()}${(second ?? "").toUpperCase()}`;
  }, [user.user_name]);

  useEffect(() => {
    let isMounted = true;
    let nextUrl: string | null = null;

    if (!hasPic) {
      setUrl(null);
      return;
    }

    const load = async () => {
      try {
        const blob = await getMyProfilePicBlob();
        if (!isMounted) return;
        nextUrl = URL.createObjectURL(blob);
        setUrl(nextUrl);
      } catch {
        if (!isMounted) return;
        setUrl(null);
      }
    };

    load();

    return () => {
      isMounted = false;
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [hasPic]);

  const isHeader = variant === "header";

  const buttonStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "999px",
    border: isHeader ? "none" : "1px solid rgba(255,255,255,0.16)",
    background: isHeader ? "#c3bb1a" : "rgba(255,255,255,0.04)",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    position: "relative",
  };

  const content = url ? (
    <img src={url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  ) : hasPic ? (
    <div aria-hidden="true" className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "999px" }} />
  ) : isHeader ? (
    <img src={imgChicken} alt="Profile" style={{ width: "70%", height: "70%", objectFit: "contain" }} />
  ) : (
    <span style={{ fontWeight: 700, color: "#fff41d", fontSize: Math.max(12, Math.floor(size * 0.34)) }}>{initials}</span>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-ghost"
      style={buttonStyle}
      aria-label={showEditOnHover ? "Edit profile picture" : "Open profile"}
      title={showEditOnHover ? "Edit profile picture" : "Profile"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
      {showEditOnHover && isHovered && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
          }}
        >
          <svg
            width={Math.max(18, Math.floor(size * 0.28))}
            height={Math.max(18, Math.floor(size * 0.28))}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 20h9"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
