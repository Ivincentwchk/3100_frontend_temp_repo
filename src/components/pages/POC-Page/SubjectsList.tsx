import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { getSubjects, type Subject } from "../../../feature/learning/api";
import { removeBookmarkedSubject, setBookmarkedSubject, type AuthUser } from "../../../feature/auth/api";

interface SubjectsListProps {
  onSelect?: (subject: Subject) => void;
  user?: AuthUser;
  onBookmarked?: () => void;
}

export function SubjectsList({ onSelect, user, onBookmarked }: SubjectsListProps) {
  const isBookmarked = (subjectId: number) => {
    const list = user?.recent_bookmarked_subjects;
    if (!list?.length) return false;
    return list.some((item) => item.subject_id === subjectId);
  };

  const bookmarkMutation = useMutation({
    mutationFn: (subjectId: number) => setBookmarkedSubject(subjectId),
    onSuccess: () => {
      onBookmarked?.();
    },
  });

  const unbookmarkMutation = useMutation({
    mutationFn: (subjectId: number) => removeBookmarkedSubject(subjectId),
    onSuccess: () => {
      onBookmarked?.();
    },
  });
  const cardHeight = 220;

  const {
    data: subjects,
    isLoading,
    isError,
  } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: getSubjects,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="poc-skeleton-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="home-course-card is-loading" style={{ width: "100%", height: cardHeight }}>
            <div className="home-course-card-bg" />
            <div className="home-course-colorbar" aria-hidden="true" style={{ height: cardHeight }}>
              <div className="home-course-colorbar-yellow" style={{ height: cardHeight }} />
              <div className="home-course-colorbar-gradient" style={{ height: cardHeight }} />
            </div>
            <div className="home-course-colorbar-label" aria-hidden="true">
              <div className="home-course-colorbar-label-text skeleton skeleton-text" style={{ width: "80%" }} />
            </div>
            <div className="home-course-icon" aria-hidden="true" style={{ top: 18 }}>
              <div className="skeleton skeleton-text" style={{ width: 34, height: 34, borderRadius: "50%" }} />
            </div>
            <div className="home-course-title" style={{ textAlign: "left", top: 76 }}>
              <div className="skeleton skeleton-text lg" style={{ width: "85%" }} />
              <div className="skeleton skeleton-text" style={{ width: "60%", marginTop: "0.4rem" }} />
            </div>
            <div
              className="helper-text"
              style={{ position: "absolute", left: 122, top: 118, width: "calc(100% - 150px)" }}
            >
              <div className="skeleton skeleton-text" style={{ width: "70%" }} />
            </div>
            <div
              className="home-course-continue"
              style={{
                position: "absolute",
                left: 122,
                top: cardHeight - 58,
                width: "calc(100% - 150px)",
                height: 40,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="skeleton skeleton-text" style={{ width: "60%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-box">
        <span className="error-icon">!</span>
        <div className="error-content">
          <p>Failed to load subjects. Make sure the backend is running.</p>
        </div>
      </div>
    );
  }

  if (!subjects?.length) {
    return <p className="helper-text">No subjects found.</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
      {subjects.map((subject: Subject) => {
        const bookmarked = isBookmarked(subject.SubjectID);

        return (
          <div
            key={subject.SubjectID}
            className="home-course-card"
            role="button"
            tabIndex={0}
            onClick={() => onSelect?.(subject)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(subject);
              }
            }}
            style={{ width: "100%", height: cardHeight, cursor: "pointer" }}
          >
            <div className="home-course-card-bg" />

            <div className="home-course-colorbar" aria-hidden="true" style={{ height: cardHeight }}>
              <div className="home-course-colorbar-yellow" style={{ height: cardHeight }} />
              <div className="home-course-colorbar-gradient" style={{ height: cardHeight }} />
            </div>

            <div className="home-course-colorbar-label" aria-hidden="true">
              <div className="home-course-colorbar-label-text">
                // {String(subject.SubjectName).toUpperCase()}
              </div>
            </div>

            <div className="home-course-icon" aria-hidden="true" style={{ top: 18 }}>
              {subject.icon_svg_url ? (
                <img
                  src={subject.icon_svg_url}
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

            <div className="home-course-title" style={{ textAlign: "left", top: 76 }}>
              {subject.SubjectName}
            </div>

            <div
              className="helper-text"
              style={{ position: "absolute", left: 122, top: 118, width: "calc(100% - 150px)" }}
            >
              {subject.SubjectDescription}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (bookmarked) {
                  unbookmarkMutation.mutate(subject.SubjectID);
                } else {
                  bookmarkMutation.mutate(subject.SubjectID);
                }
              }}
              aria-label={bookmarked ? "Unbookmark subject" : "Bookmark subject"}
              title={bookmarked ? "Unbookmark" : "Bookmark"}
              style={{
                position: "absolute",
                right: 14,
                top: 12,
                width: 32,
                height: 32,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: bookmarked ? "#c3bb1a" : "rgba(255,255,255,0.06)",
                color: bookmarked ? "#111111" : "#ffffff",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              ★
            </button>
          </div>
        );
      })}
    </div>
  );
}
