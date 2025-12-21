import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import "./SubjectsPage.css";
import chickenImg from "../../../assets/chicken.png";

import {
  getCompletedCourseScores,
  getCourseDetail,
  getQuestionDetail,
  getQuestionIdsByCourse,
  submitCourseAnswers,
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
}

export function SubjectsPage({ onBack, user, onBookmarked }: SubjectsPageProps) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);
  const [isViewingCourseContent, setIsViewingCourseContent] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionByQuestionId, setSelectedOptionByQuestionId] = useState<Record<number, number>>({});
  const [submissionResult, setSubmissionResult] = useState<CourseSubmissionResponse | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const resetAttemptState = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionByQuestionId({});
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

  const setBookmarkedSubjectMutation = useMutation({
    mutationFn: (subjectIdToSet: number) => setBookmarkedSubject(subjectIdToSet),
    onSuccess: () => {
      onBookmarked?.();
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

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedCourse(null);
    setIsViewingCourseContent(false);
    resetAttemptState();

    if (subject.SubjectID) {
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
            Start New lesson
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
            aria-label="Back"
            title="Back"
            className="btn btn-ghost poc-explore-back-button"
            onClick={backToDashboard}
          >
            ←
          </button>
        )}

        <div className="poc-explore-section-row">
          {renderV2SectionHeader("//EXPLORE", "SUBJECTS", 520)}
        </div>
        <SubjectsList onSelect={handleSelectSubject} user={user} onBookmarked={onBookmarked} />
      </>
    );
  };

  const renderCourseStep = () => {
    if (!selectedSubject) return null;

    return (
      <>
        <button
          type="button"
          aria-label="Back"
          title="Back"
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
        <div aria-live="polite" style={{ display: "grid", gap: "1rem" }}>
          <div className="home-course-card" style={{ width: "100%", height: 180 }} data-variant="course-content">
            <div className="home-course-card-bg" />
            <div className="home-course-colorbar" aria-hidden="true" style={{ height: 180, width: 70 }}>
              <div className="home-course-colorbar-yellow" style={{ height: 180, width: 58 }} />
              <div className="home-course-colorbar-gradient" style={{ height: 180, width: 12 }} />
            </div>
            <div className="home-course-colorbar-label" aria-hidden="true" style={{ width: 44 }}>
              <div className="home-course-colorbar-label-text" style={{ fontSize: 16 }}>
                // CONTENT
              </div>
            </div>
            <div className="home-course-icon" aria-hidden="true" style={{ left: 92, top: 22 }}>
              <span className="home-course-icon-mark" style={{ fontSize: 24 }}>
                ⬣
              </span>
            </div>
            <div className="home-course-title" style={{ left: 92, top: 72, width: "calc(100% - 110px)", fontSize: 16 }}>
              Loading...
            </div>
          </div>

          <div className="poc-panel">
            <div className="poc-section-title">Course Content</div>
            <div style={{ marginTop: "0.5rem", display: "grid", gap: "0.75rem" }}>
              <div className="skeleton skeleton-text lg" style={{ width: "70%" }} />
              <div className="skeleton skeleton-text" style={{ width: "55%" }} />
              <div className="skeleton skeleton-text" style={{ width: "85%" }} />
              <div className="skeleton skeleton-text" style={{ width: "90%" }} />
              <div className="skeleton skeleton-text" style={{ width: "60%" }} />
            </div>
            <div className="poc-row" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
              <button type="button" className="poc-link" onClick={resetToCourses}>
                Change course
              </button>
            </div>
          </div>
        </div>
      );
    }

    const paragraphs = courseDetail.Content.split(/\n{2,}/).map((chunk, idx) => (
      <p key={idx} style={{ marginBottom: "1rem", whiteSpace: "pre-line" }}>
        {chunk.trim()}
      </p>
    ));

    const label = String(courseDetail.CourseTitle).split(" ")[0] || "COURSE";

    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="home-course-card" style={{ width: "100%", height: 180 }}>
          <div className="home-course-card-bg" />

          <div className="home-course-colorbar" aria-hidden="true" style={{ height: 180, width: 70 }}>
            <div className="home-course-colorbar-yellow" style={{ height: 180, width: 58 }} />
            <div className="home-course-colorbar-gradient" style={{ height: 180, width: 12 }} />
          </div>

          <div className="home-course-colorbar-label" aria-hidden="true" style={{ width: 44 }}>
            <div className="home-course-colorbar-label-text" style={{ fontSize: 16 }}>
              // {String(label).toUpperCase()}
            </div>
          </div>

          <div className="home-course-icon" aria-hidden="true" style={{ left: 92, top: 22 }}>
            {selectedSubject?.icon_svg_url ? (
              <img
                src={selectedSubject.icon_svg_url}
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
            style={{ left: 92, top: 72, width: "calc(100% - 110px)", fontSize: 16, textAlign: "left" }}
          >
            {courseDetail.CourseTitle}
          </div>

          <div className="helper-text" style={{ position: "absolute", left: 92, top: 96, width: "calc(100% - 110px)" }}>
            {courseDetail.CourseDescription}
          </div>

          <div className="poc-card-subtitle" style={{ position: "absolute", right: 16, top: 16, color: "#fff41d", fontWeight: 700 }}>
            Difficulty: {courseDetail.CourseDifficulty}
          </div>
        </div>

        <div className="poc-panel poc-panel-solid" style={{ width: "100%" }}>
          <div className="poc-section-title">Course Content</div>

          <div style={{ marginTop: "1.25rem", fontSize: "1.1rem", lineHeight: 1.8 }}>{paragraphs}</div>

          <div className="poc-row" style={{ justifyContent: "flex-end", marginTop: "1.5rem", gap: "0.75rem" }}>
            <button type="button" className="poc-link" onClick={resetToCourses}>
              Change course
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setIsViewingCourseContent(false)}>
              Start Practice
            </button>
          </div>
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
    const allQuestionsAnswered =
      !!questionIds && questionIds.length > 0 && questionIds.every((qid) => selectedOptionByQuestionId[qid] != null);

    const primaryLabel = isLastQuestion
      ? submitMutation.isPending
        ? "Submitting..."
        : "Submit answers"
      : "Check answer";

    const handlePrimaryAction = () => {
      if (!questionIds?.length || activeQuestionId == null) return;
      if (isLastQuestion) {
        if (!submitMutation.isPending) {
          submitMutation.mutate();
        }
      } else {
        setCurrentQuestionIndex((i) => Math.min(questionIds.length - 1, i + 1));
      }
    };

    const primaryDisabled = isQuestionBankLoading
      ? true
      : isLastQuestion
        ? submitMutation.isPending || !allQuestionsAnswered
        : activeSelection == null;

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
        return (
          <button
            key={opt.OptionID}
            type="button"
            className={`poc-qa-option ${selected ? "is-selected" : ""}`}
            onClick={() => {
              if (activeQuestionId == null) return;
              const next = {
                ...selectedOptionByQuestionId,
                [activeQuestionId]: opt.OptionID,
              };
              setSelectedOptionByQuestionId(next);
              persistLocalProgress(next);
              setSubmissionResult(null);
            }}
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
              disabled={isQuestionBankLoading || currentQuestionIndex === 0}
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

  const isQuestionMode = Boolean(selectedSubject && selectedCourse && !isViewingCourseContent && !isResultOpen);
  const isResultMode = Boolean(isResultOpen && submissionResult);
  const isFullscreenMode = isQuestionMode || isResultMode;

  return (
    <div
      className={`page-shell poc-explore-root ${isFullscreenMode ? "is-fullscreen-mode" : ""} ${
        isQuestionMode ? "is-qa-mode" : ""
      } ${isResultMode ? "is-result-mode" : ""}`}
      data-name="poc-subjects"
    >
      <div className="page-content">
        <div className={`poc-explore-main-wrapper ${isFullscreenMode ? "is-fullscreen-mode" : ""}`}>
          <div className={`poc-explore-main ${isFullscreenMode ? "is-fullscreen-mode" : ""}`}>{renderMain()}</div>
        </div>
        <img src={chickenImg} alt="" aria-hidden="true" className="poc-explore-chicken" />
      </div>
    </div>
  );
}
