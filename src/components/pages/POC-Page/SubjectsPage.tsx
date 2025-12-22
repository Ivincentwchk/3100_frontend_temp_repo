import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import "./SubjectsPage.css";
import "./POC.css";

import {
  getCompletedCourseScores,
  getCourseDetail,
  getQuestionDetail,
  getQuestionIdsByCourse,
  submitCourseAnswers,
  verifyOption,
  type CourseDetail,
  type CourseListItem,
  type CourseSubmissionResponse,
  type CompletedCourseScore,
  type QuestionDetail,
  type Subject,
} from "../../../feature/learning/api";
import { setBookmarkedSubject } from "../../../feature/auth/api";
import { CoursesList } from "./CoursesList";
import { SubjectsList } from "./SubjectsList";

interface SubjectsPageProps {
  onBack?: () => void;
  user?: import("../../../feature/auth/api").AuthUser;
  onBookmarked?: () => void;
  autoSelectSubjectId?: number;
  onAutoSelectHandled?: () => void;
}

const TOTAL_QUESTIONS_PER_COURSE = 5;

export function SubjectsPage({ onBack, user, onBookmarked, autoSelectSubjectId, onAutoSelectHandled }: SubjectsPageProps) {
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);
  const [isViewingCourseContent, setIsViewingCourseContent] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionByQuestionId, setSelectedOptionByQuestionId] = useState<Record<number, number>>({});
  const [verifiedQuestionById, setVerifiedQuestionById] = useState<Record<number, { optionId: number; correct: boolean }>>(
    {}
  );
  const [submissionResult, setSubmissionResult] = useState<CourseSubmissionResponse | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const resetAttemptState = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionByQuestionId({});
    setVerifiedQuestionById({});
    setSubmissionResult(null);
  };

  const clearLocalProgress = () => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
  };

  const resetToSubjects = () => {
    setSelectedSubject(null);
    setSelectedCourse(null);
    setIsViewingCourseContent(false);
    resetAttemptState();
  };

  const resetToCourses = () => {
    setSelectedCourse(null);
    setIsViewingCourseContent(false);
    resetAttemptState();
  };

  const backToCourses = () => {
    setIsResultOpen(false);
    resetToCourses();
  };

  const startNewLesson = () => {
    setIsResultOpen(false);
    clearLocalProgress();
    resetAttemptState();
  };

  const backToDashboard = () => {
    setIsResultOpen(false);
    onBack?.();
  };

  const courseId = selectedCourse?.CourseID ?? null;

  const storageKey = courseId ? `course_progress:${courseId}` : null;

  const { data: completedScores } = useQuery<CompletedCourseScore[]>({
    queryKey: ["completedCourseScores"],
    queryFn: getCompletedCourseScores,
    staleTime: 60_000,
  });

  const handleBookmarkedCascade = useCallback(() => {
    onBookmarked?.();
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [onBookmarked, queryClient]);

  const invalidateProgressQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["completedCourseScores"] });
  }, [queryClient]);

  const setBookmarkedSubjectMutation = useMutation({
    mutationFn: (subjectIdToSet: number) => setBookmarkedSubject(subjectIdToSet),
    onSuccess: () => {
      handleBookmarkedCascade();
    },
  });

  const completedScoresByCourseId = useMemo(() => {
    const map: Record<number, number> = {};
    (completedScores ?? []).forEach((item) => {
      map[item.CourseID] = item.CourseScore;
    });
    return map;
  }, [completedScores]);

  const { data: questionIds, isLoading: isLoadingQuestionIds } = useQuery<number[]>({
    queryKey: ["questionIds", courseId],
    queryFn: () => getQuestionIdsByCourse(courseId as number),
    enabled: courseId !== null,
    staleTime: 60_000,
  });

  const { data: courseDetail, isLoading: isLoadingCourseDetail } = useQuery<CourseDetail>({
    queryKey: ["courseDetail", courseId],
    queryFn: () => getCourseDetail(courseId as number),
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

  const verifyAnswerMutation = useMutation({
    mutationFn: async ({ questionId, optionId }: { questionId: number; optionId: number }) => {
      const response = await verifyOption(optionId);
      return { questionId, optionId, correct: response.correct };
    },
    onSuccess: ({ questionId, optionId, correct }) => {
      setVerifiedQuestionById((prev) => ({
        ...prev,
        [questionId]: { optionId, correct },
      }));
    },
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
      invalidateProgressQueries();
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

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedCourse(null);
    setIsViewingCourseContent(false);
    resetAttemptState();

    if (subject.SubjectID != null) {
      setBookmarkedSubjectMutation.mutate(subject.SubjectID);
    }
  };

  const handleSelectCourse = (course: CourseListItem) => {
    setSelectedCourse(course);
    setIsViewingCourseContent(true);
    resetAttemptState();
  };

  const renderV2SectionHeader = (prefixText: string, title: string, width = 305) => {
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

  const renderResultPage = () => {
    if (!selectedSubject || !selectedCourse || !submissionResult) return null;

    const total = submissionResult.total || 0;
    const correct = submissionResult.correct || 0;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="poc-result-layout">
        <section className="poc-result-left">
          <button type="button" className="poc-result-back" onClick={backToCourses}>
            ← Back
          </button>

          <div className="poc-result-course-title">{selectedCourse.CourseTitle}</div>
          <div className="poc-result-course-desc">{courseDetail?.CourseDescription ?? ""}</div>

          <button type="button" className="poc-result-primary" onClick={startNewLesson}>
            Start New Quiz
          </button>
        </section>

        <section className="poc-result-right">
          <div className="poc-result-metric">
            <div className="poc-result-metric-label">Score</div>
            <div className="poc-result-metric-value">
              {correct}⭐
            </div>
          </div>

          <div className="poc-result-metric">
            <div className="poc-result-metric-label">Accuracy</div>
            <div className="poc-result-metric-value">{accuracy}%</div>
          </div>
        </section>
      </div>
    );
  };

  const renderSubjectStep = () => {
    return (
      <>
        {onBack && (
          <button
            type="button"
            aria-label="Back to home"
            title="Back to home"
            className="btn btn-ghost poc-explore-back-button"
            onClick={backToDashboard}
          >
            ←
          </button>
        )}

        <div className="poc-explore-section-row">
          {renderV2SectionHeader("//EXPLORE", "SUBJECTS", 520)}
        </div>
        <SubjectsList
          onSelect={handleSelectSubject}
          user={user}
          onBookmarked={onBookmarked}
          autoSelectSubjectId={autoSelectSubjectId}
          onAutoSelect={onAutoSelectHandled}
        />
      </>
    );
  };

  const renderCourseStep = () => {
    if (!selectedSubject) return null;

    return (
      <>
        <button
          type="button"
          aria-label="Back to subjects"
          title="Back to subjects"
          className="btn btn-ghost poc-explore-back-button"
          onClick={resetToSubjects}
        >
          ←
        </button>

        <CoursesList
          subjectId={selectedSubject.SubjectID}
          subjectName={selectedSubject.SubjectName}
          subjectIconUrl={selectedSubject.icon_svg_url}
          completedScoresByCourseId={completedScoresByCourseId}
          onSelect={handleSelectCourse}
        />
      </>
    );
  };

  const renderCourseContentPage = () => {
    if (!selectedCourse) return null;

    if (isLoadingCourseDetail || !courseDetail) {
      return (
        <div className="poc-course-content-root" aria-live="polite">
          <div className="poc-course-content-stats-row">
            <div className="poc-course-content-stat">
              <div className="poc-course-content-stat-label">Best Score</div>
              <div className="poc-course-content-stat-value">--</div>
            </div>
            <div className="poc-course-content-stat">
              <div className="poc-course-content-stat-label">Best Accuracy</div>
              <div className="poc-course-content-stat-value">—%</div>
            </div>
          </div>

          <div className="poc-course-content-layout">
            <section className="poc-course-content-left">
              <div className="poc-course-content-left-label">// CONTENT</div>
              <div className="poc-course-content-left-title">Loading...</div>
              <div className="poc-course-content-left-desc">
                <div className="skeleton skeleton-text" style={{ width: "70%", height: 18 }} />
                <div className="skeleton skeleton-text" style={{ width: "55%", height: 18 }} />
              </div>
              <div className="poc-course-content-left-actions">
                <button type="button" className="poc-link" onClick={resetToCourses}>
                  Change course
                </button>
              </div>
            </section>

            <section className="poc-course-content-right">
              <div className="poc-course-content-right-header">
                <div className="poc-section-title">Course Content</div>
              </div>
              <div className="poc-course-content-right-body">
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div className="skeleton skeleton-text lg" style={{ width: "70%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "55%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "85%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "90%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                </div>
              </div>
            </section>
          </div>
        </div>
      );
    }

    const paragraphs = courseDetail.Content.split(/\n{2,}/).map((chunk, idx) => (
      <p key={idx} style={{ marginBottom: "1rem", whiteSpace: "pre-line" }}>
        {chunk.trim()}
      </p>
    ));

    const bestScore = courseId != null ? completedScoresByCourseId[courseId] : undefined;
    const bestAccuracy =
      bestScore != null ? Math.min(100, Math.max(0, Math.round((bestScore / TOTAL_QUESTIONS_PER_COURSE) * 100))) : null;

    return (
      <div className="poc-course-content-root">
        <div className="poc-course-content-stats-row">
          <div className="poc-course-content-stat">
            <div className="poc-course-content-stat-label">Best Score</div>
            <div className="poc-course-content-stat-value">{bestScore != null ? `${bestScore}⭐` : "--"}</div>
          </div>
          <div className="poc-course-content-stat">
            <div className="poc-course-content-stat-label">Best Accuracy</div>
            <div className="poc-course-content-stat-value">{bestAccuracy != null ? `${bestAccuracy}%` : "—%"}</div>
          </div>
        </div>

        <div className="poc-course-content-layout">
          <section className="poc-course-content-left">
            <div className="poc-course-content-left-label">// {selectedSubject?.SubjectName?.toUpperCase() ?? "CONTENT"}</div>
            <div className="poc-course-content-left-title">{courseDetail.CourseTitle}</div>
            <div className="poc-course-content-left-meta">Difficulty: {courseDetail.CourseDifficulty}</div>
            <div className="poc-course-content-left-desc">{courseDetail.CourseDescription}</div>
            <div className="poc-course-content-left-actions">
              <button type="button" className="poc-link" onClick={resetToCourses}>
                Change course
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setIsViewingCourseContent(false)}>
                Start Quiz
              </button>
            </div>
          </section>

          <section className="poc-course-content-right">
            <div className="poc-course-content-right-header">
              <div className="poc-section-title">Course Content</div>
            </div>
            <div className="poc-course-content-right-body">{paragraphs}</div>
          </section>
        </div>
      </div>
    );
  };

  const renderQuestionStep = () => {
    if (!selectedSubject || !selectedCourse) return null;

    const isQuestionBankLoading = isLoadingQuestionIds && (!questionIds || (questionIds as number[]).length === 0);
    const totalQuestions = questionIds?.length ?? 0;
    const currentQuestionNumber = totalQuestions ? Math.min(currentQuestionIndex + 1, totalQuestions) : 0;
    const progressPercent = totalQuestions ? (currentQuestionNumber / totalQuestions) * 100 : 0;
    const isLastQuestion = totalQuestions ? currentQuestionIndex === totalQuestions - 1 : false;
    const activeSelection = activeQuestionId != null ? selectedOptionByQuestionId[activeQuestionId] : undefined;
    const currentVerification = activeQuestionId != null ? verifiedQuestionById[activeQuestionId] : null;
    const allQuestionsVerified =
      !!questionIds && questionIds.length > 0 && questionIds.every((qid) => verifiedQuestionById[qid]?.optionId != null);
    const pendingVerifyQuestionId = verifyAnswerMutation.variables?.questionId;
    const isVerifyingCurrentQuestion = verifyAnswerMutation.isPending && pendingVerifyQuestionId === activeQuestionId;

    const primaryLabel = currentVerification
      ? isLastQuestion
        ? submitMutation.isPending
          ? "Submitting..."
          : "Finish lesson"
        : "Next question"
      : isVerifyingCurrentQuestion
        ? "Checking..."
        : "Check answer";

    const handlePrimaryAction = () => {
      if (!questionIds?.length || activeQuestionId == null) return;

      if (!currentVerification) {
        if (activeSelection == null || isVerifyingCurrentQuestion) return;
        verifyAnswerMutation.mutate({
          questionId: activeQuestionId,
          optionId: activeSelection,
        });
        return;
      }

      if (isLastQuestion) {
        if (!submitMutation.isPending && allQuestionsVerified) {
          submitMutation.mutate();
        }
      } else {
        setCurrentQuestionIndex((i) => Math.min(questionIds.length - 1, i + 1));
      }
    };

    const primaryDisabled = isQuestionBankLoading
      ? true
      : !currentVerification
        ? activeSelection == null || isVerifyingCurrentQuestion
        : isLastQuestion
          ? submitMutation.isPending || !allQuestionsVerified
          : false;

    const handleQuitLesson = () => {
      resetToCourses();
    };

    const renderOptionButtons = () => {
      if (isLoadingQuestionDetail || !activeQuestionDetail || activeQuestionId == null) {
        return [0, 1, 2, 3].map((idx) => (
          <button key={idx} type="button" className="poc-qa-option is-loading" disabled>
            <div className="skeleton skeleton-text" style={{ width: "60%" }} />
          </button>
        ));
      }

      return activeQuestionDetail.options.map((opt) => {
        const selected = selectedOptionByQuestionId[activeQuestionId] === opt.OptionID;
        const isLocked = Boolean(currentVerification);
        const isCorrectSelection = Boolean(
          currentVerification?.correct && currentVerification.optionId === opt.OptionID
        );
        const isIncorrectSelection = Boolean(
          currentVerification && !currentVerification.correct && currentVerification.optionId === opt.OptionID
        );
        return (
          <button
            key={opt.OptionID}
            type="button"
            className={`poc-qa-option ${selected ? "is-selected" : ""} ${
              isCorrectSelection ? "is-correct" : ""
            } ${isIncorrectSelection ? "is-incorrect" : ""} ${isLocked ? "is-locked" : ""}`}
            onClick={() => {
              if (activeQuestionId == null || isLocked) return;
              const next = {
                ...selectedOptionByQuestionId,
                [activeQuestionId]: opt.OptionID,
              };
              setSelectedOptionByQuestionId(next);
              persistLocalProgress(next);
              setSubmissionResult(null);
            }}
            disabled={isLocked || isVerifyingCurrentQuestion}
            aria-pressed={selected}
          >
            {opt.OptionText}
          </button>
        );
      });
    };

    const questionTextContent = isLoadingQuestionDetail || !activeQuestionDetail ? (
      <div className="skeleton skeleton-text lg" style={{ width: "90%" }} />
    ) : (
      <p>{activeQuestionDetail.QuestionDescription}</p>
    );

    return (
      <div className="poc-qa-layout">
        <section className="poc-qa-question-panel">
          <button type="button" className="poc-qa-quit" onClick={handleQuitLesson}>
            ✕ Quit lesson
          </button>

          <div className="poc-qa-course-meta">
            <div className="poc-qa-course-label">// {selectedSubject.SubjectName?.toUpperCase() ?? "QUESTION"}</div>
            <div className="poc-qa-course-title">{selectedCourse.CourseTitle}</div>
            <div className="poc-qa-progress-label">
              {totalQuestions ? `Question ${currentQuestionNumber}/${totalQuestions}` : "Loading questions..."}
            </div>
            <div className="poc-qa-progress-track" aria-hidden="true">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="poc-qa-question-text">{questionTextContent}</div>
        </section>

        <section className="poc-qa-answer-panel">
          <div className="poc-qa-options">{renderOptionButtons()}</div>

          <div className="poc-qa-controls">
            <button
              type="button"
              className="poc-qa-prev"
              onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              disabled={isQuestionBankLoading || currentQuestionIndex === 0 || isVerifyingCurrentQuestion}
            >
              ← Prev
            </button>

            <button
              type="button"
              className="poc-qa-submit"
              onClick={handlePrimaryAction}
              disabled={primaryDisabled}
            >
              {primaryLabel}
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderMain = () => {
    if (!selectedSubject) return renderSubjectStep();
    if (!selectedCourse) return renderCourseStep();
    if (isViewingCourseContent) return renderCourseContentPage();
    if (isResultOpen && submissionResult) return renderResultPage();
    return renderQuestionStep();
  };

  const isCourseContentMode = Boolean(selectedSubject && selectedCourse && isViewingCourseContent);
  const isQuestionMode = Boolean(selectedSubject && selectedCourse && !isViewingCourseContent && !isResultOpen);
  const isResultMode = Boolean(isResultOpen && submissionResult);
  const isFullscreenMode = isQuestionMode || isResultMode || isCourseContentMode;

  return (
    <div
      className={`page-shell poc-explore-root ${isFullscreenMode ? "is-fullscreen-mode" : ""} ${
        isQuestionMode ? "is-qa-mode" : ""
      } ${isResultMode ? "is-result-mode" : ""} ${isCourseContentMode ? "is-course-content-mode" : ""}`}
      data-name="poc-subjects"
    >
      <div className="page-content">
        <div className={`poc-explore-main-wrapper ${isFullscreenMode ? "is-fullscreen-mode" : ""}`}>
          <div className={`poc-explore-main ${isFullscreenMode ? "is-fullscreen-mode" : ""}`}>{renderMain()}</div>
        </div>
      </div>
    </div>
  );
}
