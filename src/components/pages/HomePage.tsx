import type { AuthUser } from "../../feature/auth/api";
import { useMemo } from "react";

interface HomePageProps {
  user: AuthUser;
  onExplore: () => void;
  onContinueRecentCourse?: () => void;
}

export function HomePage({ user, onExplore, onContinueRecentCourse }: HomePageProps) {
  const totalScore = user.total_score ?? user.profile.score;
  const streak = user.profile.login_streak_days;

  const bookmarkedSubjects = user.recent_bookmarked_subjects?.slice(0, 5) ?? [];

  const emptyIconUrl = "https://upload.wikimedia.org/wikipedia/commons/e/ee/Wakaba_mark.svg";

  return (
    <div className="home-shell" data-name="home">
      <div className="home-main">
        <div className="home-grid">
          {/* Left */}
          <div className="home-left">
            <div className="home-section">
              <div className="home-label" data-name="label">
                <div className="home-label-inner">
                  <div className="home-label-top" />
                  <div className="home-label-body" />
                  <div className="home-label-variant">COURSES</div>
                  <div className="home-label-pill" />
                  <div className="home-label-text">//YOUR +</div>
                  <div className="home-label-strip" />
                </div>
              </div>
            </div>

            {bookmarkedSubjects.length === 0 ? (
              <div className="home-course-card" data-name="home course card">
                <div className="home-course-card-bg" />

                <div className="home-course-colorbar" aria-hidden="true">
                  <div className="home-course-colorbar-yellow" />
                  <div className="home-course-colorbar-gradient" />
                </div>

                <div className="home-course-colorbar-label" aria-hidden="true">
                  <div className="home-course-colorbar-label-text">// EXPLORE</div>
                </div>

                <div className="home-course-icon" aria-hidden="true">
                  <img
                    src={emptyIconUrl}
                    alt=""
                    aria-hidden="true"
                    className="icon-white"
                    style={{ width: 44, height: 44 }}
                  />
                </div>

                <div className="home-course-title">Start exploring</div>

                <button type="button" className="home-course-continue" onClick={onExplore}>
                  Explore
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {bookmarkedSubjects.map((bm) => (
                    <div
                      key={`${bm.subject_id}:${bm.bookmarked_at}`}
                      className="home-course-card"
                      data-name="home course card"
                      style={{ width: "100%", height: 180 }}
                    >
                      <div className="home-course-card-bg" />

                      <div className="home-course-colorbar" aria-hidden="true" style={{ height: 180, width: 70 }}>
                        <div className="home-course-colorbar-yellow" style={{ height: 180, width: 58 }} />
                        <div className="home-course-colorbar-gradient" style={{ height: 180, width: 12 }} />
                      </div>

                      <div className="home-course-colorbar-label" aria-hidden="true" style={{ width: 44 }}>
                        <div className="home-course-colorbar-label-text" style={{ fontSize: 16 }}>
                          // {String(bm.subject_name).toUpperCase()}
                        </div>
                      </div>

                      <div className="home-course-icon" aria-hidden="true" style={{ left: 92, top: 22 }}>
                        {bm.subject_icon_svg_url ? (
                          <img
                            src={bm.subject_icon_svg_url}
                            alt=""
                            aria-hidden="true"
                            className="icon-white"
                            style={{ width: 34, height: 34 }}
                          />
                        ) : (
                          <span className="home-course-icon-mark" style={{ fontSize: 24 }}>
                            ⬣
                          </span>
                        )}
                      </div>

                      <div className="home-course-title" style={{ left: 92, top: 72, width: "calc(100% - 110px)", fontSize: 16 }}>
                        {bm.subject_name}
                      </div>

                      <button
                        type="button"
                        className="home-course-continue"
                        onClick={onContinueRecentCourse}
                        title="Continue"
                        style={{ left: 92, top: 120, width: "calc(100% - 110px)", height: 38, fontSize: 16 }}
                      >
                        Continue
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="home-divider" />

            <div className="home-explore-row">
              <div className="home-explore-text">Want to learn something new?</div>
              <button type="button" className="home-explore-button" onClick={onExplore}>
                <span className="home-explore-button-label">Explore +</span>
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="home-right">
            <div className="home-welcome-card-v2">
              <div className="home-welcome-title-v2">Welcome back!</div>
              <div className="home-welcome-subtitle-v2">Good to see you today!</div>
            </div>

            <div className="home-stat-card-v2">
              <div className="home-stat-label-v2">Streak</div>
              <div className="home-stat-value-v2">{streak}🔥</div>
            </div>

            <div className="home-stat-card-v2">
              <div className="home-stat-label-v2">Score</div>
              <div className="home-stat-value-v2">{totalScore}⭐</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
