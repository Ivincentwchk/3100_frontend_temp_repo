import { useQuery } from "@tanstack/react-query";

import { getCoursesBySubject, type CourseListItem } from "../../../feature/learning/api";

interface CoursesListProps {
  subjectId: number;
  subjectName?: string;
  subjectIconUrl?: string | null;
  onSelect?: (course: CourseListItem) => void;
  completedScoresByCourseId?: Record<number, number>;
}

export function CoursesList({ subjectId, subjectName, subjectIconUrl, onSelect, completedScoresByCourseId }: CoursesListProps) {
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

  const renderV2GroupHeader = (prefixText: string, title: string, width = 520) => {
    return (
      <div className="home-label" data-name="label" style={{ width }}>
        <div className="home-label-inner">
          <div className="home-label-top" />
          <div className="home-label-body" />
          <div className="home-label-variant">{title}</div>
          <div className="home-label-pill" />
          <div className="home-label-text">{prefixText}</div>
          <div className="home-label-strip" />
        </div>
      </div>
    );
  };

  const normalize = (value: string) => value.trim().toLowerCase();

  const introCourses = courses.filter((course) => {
    const t = normalize(course.CourseTitle);
    return t.startsWith("intro") || t.includes("introduction") || t.includes("beginner");
  });

  const advancedCourses = courses.filter((course) => {
    const t = normalize(course.CourseTitle);
    return t.includes("advanced") || t.includes("intermediate") || t.includes("expert");
  });

  const otherCourses = courses.filter((course) => !introCourses.includes(course) && !advancedCourses.includes(course));

  const renderCoursesGrid = (groupCourses: CourseListItem[]) => {
    const label = subjectName ? String(subjectName).toUpperCase() : "COURSE";
    const cardHeight = 210;
    const titleTop = 72;
    const descriptionTop = 110;
    const buttonTop = cardHeight - 58;
    const horizontalOffset = "clamp(90px, 16vw, 118px)";
    const horizontalPadding = "clamp(12px, 4vw, 24px)";
    const contentWidth = `calc(100% - ${horizontalOffset} - ${horizontalPadding})`;

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 320px))",
          gap: "0.9rem",
          justifyContent: "start",
        }}
      >
        {groupCourses.map((course: CourseListItem) => {
          const bestScore = completedScoresByCourseId?.[course.CourseID];
          const isAdded = bestScore !== undefined;
          const primaryCta = isAdded ? "Continue" : "Add course";

          return (
            <div
              key={course.CourseID}
              className="home-course-card"
              role="button"
              tabIndex={0}
              onClick={() => onSelect?.(course)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(course);
                }
              }}
              style={{
                width: "100%",
                height: cardHeight,
                cursor: "pointer",
              }}
              data-variant="explore-course"
            >
              <div className="home-course-card-bg" />

              <div className="home-course-colorbar" aria-hidden="true" style={{ height: cardHeight }}>
                <div className="home-course-colorbar-yellow" style={{ height: cardHeight }} />
                <div className="home-course-colorbar-gradient" style={{ height: cardHeight }} />
              </div>

              <div className="home-course-colorbar-label" aria-hidden="true">
                <div className="home-course-colorbar-label-text" style={{ fontSize: 36, color: "rgba(255,255,255,0.55)" }}>
                  {label}
                </div>
              </div>

              <div className="home-course-icon" aria-hidden="true" style={{ top: 20, left: horizontalOffset }}>
                {subjectIconUrl ? (
                  <img
                    src={subjectIconUrl}
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

              <div
                className="home-course-title"
                style={{
                  textAlign: "left",
                  top: titleTop,
                  left: horizontalOffset,
                  width: contentWidth,
                  fontSize: "clamp(16px, 2vw, 20px)",
                  lineHeight: 1.3,
                }}
              >
                {course.CourseTitle}
              </div>

              <div
                className="helper-text"
                style={{
                  position: "absolute",
                  left: horizontalOffset,
                  top: descriptionTop,
                  width: contentWidth,
                  fontSize: "clamp(13px, 1.6vw, 15px)",
                  lineHeight: 1.35,
                }}
              >
                {course.CourseTitle}
              </div>

              <button
                type="button"
                className="home-course-continue"
                style={{
                  position: "absolute",
                  left: horizontalOffset,
                  top: buttonTop,
                  width: contentWidth,
                  height: "clamp(36px, 5vw, 46px)",
                  fontSize: "clamp(14px, 1.8vw, 16px)",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: isAdded ? "rgba(255,255,255,0.15)" : "#c3bb1a",
                  color: isAdded ? "#ffffff" : "#111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect?.(course);
                }}
              >
                {primaryCta}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {introCourses.length > 0 && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {renderV2GroupHeader(`//${String(subjectName ?? "COURSE").toUpperCase()}+++`, "INTRO")}
          {renderCoursesGrid(introCourses)}
        </div>
      )}

      {advancedCourses.length > 0 && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {renderV2GroupHeader(`//${String(subjectName ?? "COURSE").toUpperCase()}+++`, "ADVANCED")}
          {renderCoursesGrid(advancedCourses)}
        </div>
      )}

      {otherCourses.length > 0 && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {renderV2GroupHeader(`//${String(subjectName ?? "COURSE").toUpperCase()}+++ MORE`, "COURSES")}
          {renderCoursesGrid(otherCourses)}
        </div>
      )}
    </div>
  );
}
