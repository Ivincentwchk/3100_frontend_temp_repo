import { useQuery } from "@tanstack/react-query";

import { getSubjects, type Subject } from "../../../feature/learning/api";

interface SubjectsListProps {
  onSelect?: (subject: Subject) => void;
}

export function SubjectsList({ onSelect }: SubjectsListProps) {
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
    return <p className="helper-text">Loading subjects...</p>;
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div className="poc-card-title">{subject.SubjectName}</div>
            <div className="poc-card-subtitle">{subject.SubjectDescription}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
