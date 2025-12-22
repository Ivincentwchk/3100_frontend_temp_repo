import { Flame, Star, User } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { AuthUser } from "../../feature/auth/api";
import { getAchievements, type AchievementIconKey, type AchievementItem } from "../../feature/achievements/api";
import "./AchievementsPage.css";

interface ProfilePageProps {
  user: AuthUser;
  onOpenAccountInfo?: () => void;
}

function AchievementIcon({ name }: { name: AchievementIconKey }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "docker") {
    return (
      <svg {...common}>
        <path d="M4 14h16" />
        <path d="M6 14c0 3 2.5 6 6 6 4.5 0 7-3 7-6" />
        <path d="M7 10h3v4H7z" />
        <path d="M11 10h3v4h-3z" />
        <path d="M15 10h2v4h-2z" />
        <path d="M9 7h3v3H9z" />
      </svg>
    );
  }

  if (name === "git") {
    return (
      <svg {...common}>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 6h6" />
        <path d="M18 8v6" />
        <path d="M8 6c5 0 10 2 10 8" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 2c2.5 2 4 4.5 4 7 0 1.5-.5 2.5-1 3.5" />
      <path d="M9 3c-.5 1.5-2 2.5-3 4-1 1.6-1.5 3.2-1.5 4.8C4.5 16.3 7.6 20 12 20s7.5-3.7 7.5-8.2c0-1.4-.3-2.6-1-3.8" />
      <path d="M12 12c1 1 1.3 2.1 1 3.2-.4 1.3-1.5 2.3-3 2.8" />
    </svg>
  );
}

function AchievementCard({ item }: { item: AchievementItem }) {
  const progressLabel = `${Math.min(item.progress, item.target)} / ${item.target}`;
  return (
    <div className={`achievement-card ${item.unlocked ? "is-unlocked" : "is-locked"}`}>
      <div className="achievement-row">
        <div className="achievement-icon">
          <AchievementIcon name={item.icon} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="poc-card-title">{item.title}</div>
          <div className="poc-card-subtitle">{item.description}</div>
        </div>
        <div className="achievement-status">
          <div className="poc-card-subtitle" style={{ fontWeight: 700, color: item.unlocked ? "#9ae6b4" : "#b7b7b7" }}>
            {item.unlocked ? "Unlocked" : "Locked"}
          </div>
          <div className="poc-card-subtitle">{progressLabel}</div>
        </div>
      </div>

      <div className="poc-progress-track" style={{ marginTop: "0.75rem" }}>
        <div className="poc-progress-bar" style={{ width: `${Math.round((Math.min(item.progress, item.target) / item.target) * 100)}%` }} />
      </div>
    </div>
  );
}

export function ProfilePage({ user, onOpenAccountInfo }: ProfilePageProps) {
  const totalScore = user.total_score ?? user.profile.score;
  const streak = user.profile.login_streak_days;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements,
    staleTime: 30_000,
  });

  const unlockedCount = useMemo(() => {
    const items = data?.achievements ?? [];
    return items.filter((x) => x.unlocked).length;
  }, [data?.achievements]);

  return (
    <div className="page-shell" data-name="profile">
      <div className="page-content" style={{ width: "min(860px, 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title" style={{ textAlign: "left" }}>Profile</h1>
            <div className="helper-text">User info, streak and achievements.</div>
          </div>
          {onOpenAccountInfo && (
            <button type="button" className="btn btn-secondary" onClick={onOpenAccountInfo}>
              Account info
            </button>
          )}
        </div>

        <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <div className="form-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                background: "#c3bb1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={34} color="#111111" />
            </div>
            <div>
              <div style={{ fontFamily: "Poppins", fontSize: 28, color: "#ffffff", fontWeight: 700 }}>{user.user_name}</div>
              <div className="poc-card-subtitle">{user.email}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div className="form-card" style={{ gap: 0 }}>
              <div className="poc-card-subtitle" style={{ fontSize: 16 }}>Total Score</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Poppins", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>
                <Star size={18} color="#c3bb1a" />
                {totalScore}
              </div>
            </div>
            <div className="form-card" style={{ gap: 0 }}>
              <div className="poc-card-subtitle" style={{ fontSize: 16 }}>Achievements</div>
              <div style={{ fontFamily: "Poppins", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>
                {isLoading ? "…" : isError ? "—" : `${unlockedCount}/${data?.achievements.length ?? 0}`}
              </div>
            </div>
            <div className="form-card" style={{ gap: 0 }}>
              <div className="poc-card-subtitle" style={{ fontSize: 16 }}>Streak</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Poppins", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>
                <Flame size={18} color="#fb923c" />
                {streak}
              </div>
            </div>
          </div>

          <div className="poc-panel">
            <div className="poc-section-title">Achievements</div>
            <div className="poc-card-subtitle">Unlock achievements as you learn.</div>

            {isLoading && (
              <div className="form-card" style={{ marginTop: "1rem" }}>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="achievement-card" aria-hidden="true">
                    <div className="achievement-row">
                      <div className="achievement-icon">
                        <div className="skeleton" style={{ width: "44px", height: "44px", borderRadius: "14px" }} />
                      </div>
                      <div style={{ flex: 1, display: "grid", gap: "0.5rem" }}>
                        <div className="skeleton skeleton-text" style={{ width: `${70 - idx * 10}%` }} />
                        <div className="skeleton skeleton-text sm" style={{ width: `${55 - idx * 8}%` }} />
                      </div>
                      <div style={{ width: "110px", display: "grid", gap: "0.5rem", justifyItems: "end" }}>
                        <div className="skeleton skeleton-text" style={{ width: "70px" }} />
                        <div className="skeleton skeleton-text sm" style={{ width: "90px" }} />
                      </div>
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                      <div className="skeleton" style={{ height: "10px", width: "100%", borderRadius: "999px" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isError && (
              <div className="error-box" style={{ marginTop: "1rem" }}>
                <span className="error-icon">!</span>
                <div className="error-content">
                  <p>Failed to load achievements. Make sure the backend is running.</p>
                </div>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="form-card" style={{ marginTop: "1rem" }}>
                {(data?.achievements ?? []).map((item) => (
                  <AchievementCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
