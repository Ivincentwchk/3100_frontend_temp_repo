import { useEffect, useMemo, useState } from "react";

import type { AuthUser } from "../feature/auth/api";
import { getMyProfilePicBlob } from "../feature/auth/api";

interface ProfileAvatarProps {
  user: AuthUser;
  size?: number;
  onClick?: () => void;
}

export function ProfileAvatar({ user, size = 44, onClick }: ProfileAvatarProps) {
  const hasPic = Boolean(user.profile?.has_profile_pic);
  const [url, setUrl] = useState<string | null>(null);

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

  const buttonStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  const content = url ? (
    <img src={url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  ) : hasPic ? (
    <div aria-hidden="true" className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "999px" }} />
  ) : (
    <span style={{ fontWeight: 700, color: "#fff41d", fontSize: Math.max(12, Math.floor(size * 0.34)) }}>{initials}</span>
  );

  return (
    <button type="button" onClick={onClick} className="btn btn-ghost" style={buttonStyle} aria-label="Open profile" title="Profile">
      {content}
    </button>
  );
}
