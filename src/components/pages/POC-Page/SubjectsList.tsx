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
      <div className="poc-card-list" aria-hidden="true">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="poc-card-button" style={{ cursor: "default" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div className="skeleton skeleton-text lg" style={{ width: `${80 - idx * 10}%` }} />
              <div className="skeleton skeleton-text" style={{ width: `${60 - idx * 8}%` }} />
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
    <div className="poc-card-list">
      {subjects.map((subject: Subject) => (
        <button
          key={subject.SubjectID}
          type="button"
          className="poc-card-button"
          onClick={() => onSelect?.(subject)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left" }}>
              {subject.icon_svg_url && (
                <img
                  src={subject.icon_svg_url}
                  alt=""
                  aria-hidden="true"
                  style={{ width: 26, height: 26, marginBottom: "0.25rem", filter: "grayscale(1) brightness(1.1)" }}
                />
              )}
              <div className="poc-card-title">{subject.SubjectName}</div>
              <div className="poc-card-subtitle">{subject.SubjectDescription}</div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isBookmarked(subject.SubjectID)) {
                  unbookmarkMutation.mutate(subject.SubjectID);
                } else {
                  bookmarkMutation.mutate(subject.SubjectID);
                }
              }}
              aria-label="Bookmark subject"
              title="Bookmark subject"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: isBookmarked(subject.SubjectID) ? "#fff41d" : "#9ca3af",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flex: "0 0 auto",
              }}
            >
              ★
            </button>
          </div>
        </button>
      ))}
    </div>
  );
}
