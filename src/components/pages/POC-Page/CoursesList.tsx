import { useQuery } from "@tanstack/react-query";

import { getCoursesBySubject, type CourseListItem } from "../../../feature/learning/api";

interface CoursesListProps {
  subjectId: number;
  onSelect?: (course: CourseListItem) => void;
  completedScoresByCourseId?: Record<number, number>;
}

export function CoursesList({ subjectId, onSelect, completedScoresByCourseId }: CoursesListProps) {
  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery<CourseListItem[]>({
    queryKey: ["courses", subjectId],
    queryFn: () => getCoursesBySubject(subjectId),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="poc-card-list" aria-hidden="true">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="poc-card-button" style={{ cursor: "default" }}>
            <div className="poc-row">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                <div className="skeleton skeleton-text lg" style={{ width: `${75 - idx * 8}%` }} />
                <div className="skeleton skeleton-text" style={{ width: `${45 - idx * 6}%` }} />
              </div>
              <div className="skeleton skeleton-text" style={{ width: "64px" }} />
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
          <p>Failed to load courses. Make sure the backend is running.</p>
        </div>
      </div>
    );
  }

  if (!courses?.length) {
    return <p className="helper-text">No courses found.</p>;
  }

  return (
    <div className="poc-card-list">
      {courses.map((course: CourseListItem) => {
        const bestScore = completedScoresByCourseId?.[course.CourseID];

        return (
          <button
            key={course.CourseID}
            type="button"
            className="poc-card-button"
            onClick={() => onSelect?.(course)}
          >
            <div className="poc-row">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div className="poc-card-title">{course.CourseTitle}</div>
                <div className="poc-card-subtitle">Course ID: {course.CourseID}</div>
              </div>
              {bestScore !== undefined && (
                <div className="poc-card-subtitle" style={{ color: "#fff41d", fontWeight: 700 }}>
                  Best: {bestScore}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
