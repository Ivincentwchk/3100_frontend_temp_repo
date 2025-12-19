import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  getCompletedCourseScores,
  getQuestionDetail,
  getQuestionIdsByCourse,
  submitCourseAnswers,
  type CourseListItem,
  type CourseSubmissionResponse,
  type CompletedCourseScore,
  type QuestionDetail,
  type Subject,
} from "../../../feature/learning/api";
import { setRecentCourse } from "../../../feature/auth/api";
import { CoursesList } from "./CoursesList";
import { SubjectsList } from "./SubjectsList";

interface SubjectsPageProps {
  onBack?: () => void;
}

export function SubjectsPage({ onBack }: SubjectsPageProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionByQuestionId, setSelectedOptionByQuestionId] = useState<Record<number, number>>({});
  const [submissionResult, setSubmissionResult] = useState<CourseSubmissionResponse | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const resetAttemptState = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionByQuestionId({});
    setSubmissionResult(null);
  };

  const resetToSubjects = () => {
    setSelectedSubject(null);
    setSelectedCourse(null);
    resetAttemptState();
  };

  const resetToCourses = () => {
    setSelectedCourse(null);
    resetAttemptState();
  };

  const backToCourses = () => {
    setIsResultOpen(false);
    resetToCourses();
  };

  const backToDashboard = () => {
    setIsResultOpen(false);
    onBack?.();
  };

  const step = selectedSubject ? (selectedCourse ? 3 : 2) : 1;
  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  const courseId = selectedCourse?.CourseID ?? null;

  const storageKey = courseId ? `course_progress:${courseId}` : null;

  const { data: completedScores } = useQuery<CompletedCourseScore[]>({
    queryKey: ["completedCourseScores"],
    queryFn: getCompletedCourseScores,
    staleTime: 60_000,
  });

  const setRecentCourseMutation = useMutation({
    mutationFn: (courseIdToSet: number) => setRecentCourse(courseIdToSet),
  });

  const completedScoresByCourseId = useMemo(() => {
    const map: Record<number, number> = {};
    (completedScores ?? []).forEach((item) => {
      map[item.CourseID] = item.CourseScore;
    });
    return map;
  }, [completedScores]);

  const selectedCourseBestScore = courseId !== null ? completedScoresByCourseId[courseId] : undefined;

  const { data: questionIds, isLoading: isLoadingQuestionIds } = useQuery<number[]>({
    queryKey: ["questionIds", courseId],
    queryFn: () => getQuestionIdsByCourse(courseId as number),
    enabled: courseId !== null,
    staleTime: 60_000,
  });

  const activeQuestionId = questionIds?.[currentQuestionIndex] ?? null;

  const { data: activeQuestionDetail, isLoading: isLoadingQuestionDetail } = useQuery<QuestionDetail>({
    queryKey: ["questionDetail", activeQuestionId],
    queryFn: () => getQuestionDetail(activeQuestionId as number),
    enabled: activeQuestionId !== null,
    staleTime: 60_000,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!courseId || !questionIds) {
        throw new Error("Course not selected");
      }

      const answers = questionIds.map((qid) => ({
        question_id: qid,
        option_id: selectedOptionByQuestionId[qid],
      }));

      return submitCourseAnswers(courseId, answers);
    },
    onSuccess: (data) => {
      setSubmissionResult(data);
      setIsResultOpen(true);
    },
  });

  const persistLocalProgress = (nextMap: Record<number, number>) => {
    if (!storageKey) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers: nextMap,
        updated_at: new Date().toISOString(),
      })
    );
  };

  const loadLocalProgress = () => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { answers?: Record<string, number> };
      const answers = parsed.answers ?? {};
      const normalized: Record<number, number> = {};
      Object.entries(answers).forEach(([k, v]) => {
        const qid = Number(k);
        if (!Number.isNaN(qid)) normalized[qid] = v;
      });
      setSelectedOptionByQuestionId(normalized);
    } catch {
      // ignore
    }
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedCourse(null);
    resetAttemptState();
  };

  const handleSelectCourse = (course: CourseListItem) => {
    setSelectedCourse(course);
    resetAttemptState();

    // Track "recent course" on backend for later use (e.g., Home page).
    if (course.CourseID) {
      setRecentCourseMutation.mutate(course.CourseID);
    }
  };

  const renderSidebar = () => {
    return (
      <div className="poc-sidebar">
        <div className="poc-stepper">
          <div className="poc-row">
            <div className="poc-section-title">Practice</div>
            {onBack && (
              <button type="button" className="poc-link" onClick={onBack}>
                Exit
              </button>
            )}
          </div>

          <div className="poc-breadcrumbs">
            <span>{selectedSubject ? <strong>Subject</strong> : "Subject"}</span>
            <span>›</span>
            <span>{selectedCourse ? <strong>Course</strong> : "Course"}</span>
            <span>›</span>
            <span>{selectedCourse ? <strong>Question</strong> : "Question"}</span>
          </div>

          <div className="poc-progress-track">
            <div className="poc-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          <p className="helper-text" style={{ textAlign: "center" }}>
            Step {step} of 3
          </p>
        </div>

        {selectedSubject && (
          <div className="poc-panel">
            <div className="poc-section-title">Subject</div>
            <div className="poc-card-title">{selectedSubject.SubjectName}</div>
            <div className="poc-card-subtitle">{selectedSubject.SubjectDescription}</div>
            <button type="button" className="poc-link" onClick={resetToSubjects}>
              Change subject
            </button>
          </div>
        )}

        {selectedCourse && (
          <div className="poc-panel">
            <div className="poc-row">
              <div className="poc-section-title">Course</div>
              {selectedCourseBestScore !== undefined && (
                <div className="poc-card-subtitle" style={{ color: "#fff41d", fontWeight: 700 }}>
                  Best: {selectedCourseBestScore}
                </div>
              )}
            </div>
            <div className="poc-card-title">{selectedCourse.CourseTitle}</div>
            <button type="button" className="poc-link" onClick={resetToCourses}>
              Change course
            </button>
            <button type="button" className="poc-link" onClick={loadLocalProgress}>
              Load saved answers
            </button>
          </div>
        )}

      </div>
    );
  };

  const renderSubjectStep = () => {
    return (
      <>
        <div className="poc-panel">
          <div className="poc-section-title">Choose a subject</div>
          <div className="helper-text">Pick what you want to practice today.</div>
        </div>
        <SubjectsList onSelect={handleSelectSubject} />
      </>
    );
  };

  const renderCourseStep = () => {
    if (!selectedSubject) return null;

    return (
      <>
        <div className="poc-panel">
          <div className="poc-section-title">Choose a course</div>
          <div className="helper-text">Completed courses show your best score.</div>
        </div>
        <CoursesList
          subjectId={selectedSubject.SubjectID}
          completedScoresByCourseId={completedScoresByCourseId}
          onSelect={handleSelectCourse}
        />
      </>
    );
  };

  const renderQuestionStep = () => {
    if (!selectedSubject || !selectedCourse) return null;

    return (
      <>
        <div className="poc-panel">
          <div className="poc-row">
            <div className="poc-section-title">Question</div>
            {questionIds && (
              <div className="poc-card-subtitle">
                {Math.min(currentQuestionIndex + 1, questionIds.length)} / {questionIds.length}
              </div>
            )}
          </div>
          {isLoadingQuestionIds && (
            <div aria-hidden="true" style={{ display: "grid", gap: "0.5rem" }}>
              <div className="skeleton skeleton-text" style={{ width: "55%" }} />
              <div className="skeleton skeleton-text sm" style={{ width: "35%" }} />
            </div>
          )}
        </div>

        {activeQuestionId !== null && (
          <div className="poc-panel" style={{ minHeight: "420px" }}>
            {(isLoadingQuestionDetail || !activeQuestionDetail) && (
              <>
                <div aria-hidden="true" style={{ display: "grid", gap: "0.5rem" }}>
                  <div className="skeleton skeleton-text" style={{ width: "40%" }} />
                </div>
                <div className="input" style={{ height: "auto", padding: "1rem", minHeight: "84px" }}>
                  <div className="skeleton skeleton-text lg" style={{ width: "90%" }} />
                  <div style={{ height: "0.6rem" }} />
                  <div className="skeleton skeleton-text" style={{ width: "75%" }} />
                  <div style={{ height: "0.5rem" }} />
                  <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                </div>
                <div className="field">
                  <label className="field-label">Choose an answer</label>
                  <div className="poc-card-list">
                    {[0, 1, 2, 3].map((idx) => (
                      <button key={idx} type="button" className="poc-card-button" disabled>
                        <div className="skeleton skeleton-text" style={{ width: `${70 - idx * 8}%` }} />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!isLoadingQuestionDetail && activeQuestionDetail && (
              <>
                <div className="input" style={{ height: "auto", padding: "1rem", minHeight: "84px" }}>
                  {activeQuestionDetail.QuestionDescription}
                </div>

                <div className="field">
                  <label className="field-label">Choose an answer</label>
                  <div className="poc-card-list">
                    {activeQuestionDetail.options.map((opt) => {
                      const selected = selectedOptionByQuestionId[activeQuestionId] === opt.OptionID;
                      return (
                        <button
                          key={opt.OptionID}
                          type="button"
                          className={`poc-card-button ${selected ? "is-selected" : ""}`}
                          onClick={() => {
                            const next = {
                              ...selectedOptionByQuestionId,
                              [activeQuestionId]: opt.OptionID,
                            };
                            setSelectedOptionByQuestionId(next);
                            persistLocalProgress(next);
                            setSubmissionResult(null);
                          }}
                        >
                          <div className="poc-card-title">{opt.OptionText}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {questionIds && (
              <div className="poc-row">
                <button
                  type="button"
                  className="poc-link"
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  Prev
                </button>

                {currentQuestionIndex < questionIds.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrentQuestionIndex((i) => Math.min(questionIds.length - 1, i + 1))}
                    disabled={selectedOptionByQuestionId[activeQuestionId] == null}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => submitMutation.mutate()}
                    disabled={
                      submitMutation.isPending ||
                      questionIds.some((qid) => selectedOptionByQuestionId[qid] == null)
                    }
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderMain = () => {
    if (!selectedSubject) return renderSubjectStep();
    if (!selectedCourse) return renderCourseStep();
    return renderQuestionStep();
  };

  return (
    <div className="page-shell" data-name="poc-subjects">
      <div className="page-content">
        {isResultOpen && submissionResult && (
          <div
            className="modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Course result"
            onClick={() => setIsResultOpen(false)}
          >
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="poc-section-title">Course result</h2>
                <button type="button" className="poc-link" onClick={() => setIsResultOpen(false)}>
                  Close
                </button>
              </div>

              <div className="poc-panel" style={{ padding: 0, border: "none", background: "transparent" }}>
                <div className="poc-row">
                  <div className="poc-card-title">
                    Score: {submissionResult.correct}/{submissionResult.total}
                  </div>
                  <div className="poc-card-subtitle" style={{ color: "#fff41d", fontWeight: 700 }}>
                    Best: {submissionResult.best_score}/{submissionResult.total}
                  </div>
                </div>
                <div className="poc-card-subtitle">
                  {submissionResult.improved ? "New personal best!" : "Try again to beat your best score."}
                </div>
              </div>

              <div className="poc-row" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={backToCourses}>
                  Back to courses
                </button>
                <button type="button" className="btn btn-primary" onClick={backToDashboard}>
                  Back to dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="poc-layout">
          {renderSidebar()}
          <div>{renderMain()}</div>
        </div>
      </div>
    </div>
  );
}
