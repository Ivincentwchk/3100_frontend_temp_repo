import { useQuery } from "@tanstack/react-query";

import { getQuestionIdsByCourse } from "../../../feature/learning/api";

interface QuestionsListProps {
  courseId: number;
  onSelect?: (questionId: number) => void;
}

export function QuestionsList({ courseId, onSelect }: QuestionsListProps) {
  const {
    data: questionIds,
    isLoading,
    isError,
  } = useQuery<number[]>({
    queryKey: ["questionIds", courseId],
    queryFn: () => getQuestionIdsByCourse(courseId),
    staleTime: 60_000,
  });

  if (isLoading) {
    return <p className="helper-text">Loading questions...</p>;
  }

  if (isError) {
    return (
      <div className="error-box">
        <span className="error-icon">!</span>
        <div className="error-content">
          <p>Failed to load questions. Make sure the backend is running.</p>
        </div>
      </div>
    );
  }

  if (!questionIds?.length) {
    return <p className="helper-text">No questions found.</p>;
  }

  return (
    <div className="poc-card-list">
      {questionIds.map((questionId: number) => (
        <button
          key={questionId}
          type="button"
          className="poc-card-button"
          onClick={() => onSelect?.(questionId)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div className="poc-card-title">Question {questionId}</div>
            <div className="poc-card-subtitle">Tap to preview</div>
          </div>
        </button>
      ))}
    </div>
  );
}
