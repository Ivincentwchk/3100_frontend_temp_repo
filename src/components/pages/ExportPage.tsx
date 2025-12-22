import { useEffect, useMemo, useState } from "react";
import { FileText, Download } from "lucide-react";
import type { AxiosError } from "axios";

import type { AuthUser } from "../../feature/auth/api";
import { getSubjects, type Subject } from "../../feature/learning/api";
import "./ExportPage.css";
import { getCertificateStatus, downloadCertificate } from "../../feature/cert/api";
import type { CertificateMetadata, CertificateStatusResponse } from "../../feature/cert/types";

interface ExportPageProps {
  user: AuthUser;
  refreshUser: () => Promise<AuthUser | null>;
  onNavigateToCert?: () => void;
  onCertificateReady?: (certificate: CertificateMetadata | null) => void;
}

type PageState = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready" };

interface SubjectStatus {
  state: "loading" | "ready" | "error";
  data?: CertificateStatusResponse;
  error?: string;
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  const axiosErr = err as AxiosError<{ detail?: string }>;
  return axiosErr?.response?.data?.detail ?? fallback;
};

export function ExportPage({ user, refreshUser, onNavigateToCert, onCertificateReady }: ExportPageProps) {
  const [pageState, setPageState] = useState<PageState>({ kind: "loading" });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [subjectStatuses, setSubjectStatuses] = useState<Record<number, SubjectStatus>>({});
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"ok" | "warn">("ok");

  const completedScoresByCourseId = useMemo(() => {
    const map = new Map<number, number>();
    (user.completed_course_scores ?? []).forEach((item) => {
      map.set(item.CourseID, Number(item.CourseScore));
    });
    return map;
  }, [user.completed_course_scores]);

  const selectedSubject = subjects.find((subject) => subject.SubjectID === selectedSubjectId) ?? null;
  const activeStatus = selectedSubjectId != null ? subjectStatuses[selectedSubjectId] : undefined;
  const activeData = activeStatus?.data;
  const activeCertificate = activeData?.certificate;
  const subjectCompletionInfo = activeData?.subject;
  const subjectName = subjectCompletionInfo?.name ?? selectedSubject?.SubjectName ?? "—";
  const subjectTotalCourses = subjectCompletionInfo?.total_courses;
  const subjectCompletedCourses = subjectCompletionInfo?.completed_courses;

  const loadSubjects = async () => {
    setPageState({ kind: "loading" });
    try {
      const list = await getSubjects();
      setSubjects(list);
      if (list.length > 0) {
            const defaultSubjectId = list[0].SubjectID;
        setSelectedSubjectId(defaultSubjectId);
        await Promise.all(list.map((subject) => loadSubjectStatus(subject.SubjectID)));
      }
      setPageState({ kind: "ready" });
    } catch (err) {
      setPageState({ kind: "error", message: getErrorMessage(err, "Unable to load subjects.") });
    }
  };

  const loadSubjectStatus = async (subjectId: number) => {
    setSubjectStatuses((prev) => ({ ...prev, [subjectId]: { state: "loading" } }));
    try {
      const response = await getCertificateStatus({ subjectId });
      setSubjectStatuses((prev) => ({ ...prev, [subjectId]: { state: "ready", data: response } }));
    } catch (err) {
      setSubjectStatuses((prev) => ({
        ...prev,
        [subjectId]: { state: "error", error: getErrorMessage(err, "Unable to fetch certificate status.") },
      }));
    }
  };

  useEffect(() => {
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSubject = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    if (!subjectStatuses[subjectId]) {
      loadSubjectStatus(subjectId);
    }
    setStatusMessage(null);
  };

  const handleDownload = async () => {
    if (selectedSubjectId == null) return;
    setDownloading(true);
    setStatusMessage(null);
    setStatusTone("ok");
    try {
      const response = await downloadCertificate({ subjectId: selectedSubjectId });
      setSubjectStatuses((prev) => ({ ...prev, [selectedSubjectId]: { state: "ready", data: response } }));
      await refreshUser();
      onCertificateReady?.(response.certificate ?? null);
      setStatusTone("ok");
      setStatusMessage("Certificate ready! Open the viewer to download the PDF.");
    } catch (err) {
      setStatusTone("warn");
      setStatusMessage(getErrorMessage(err, "Unable to generate certificate right now."));
    } finally {
      setDownloading(false);
    }
  };

  if (pageState.kind === "loading") {
    return (
      <div className="page-shell" data-name="export">
        <div className="page-content" style={{ alignItems: "center" }}>
          <div className="form-card" style={{ width: "min(520px, 100%)" }}>
            <div className="skeleton skeleton-text lg" style={{ width: "55%" }} />
            <div className="skeleton skeleton-text" style={{ width: "85%" }} />
            <div className="skeleton" style={{ height: "220px", width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (pageState.kind === "error") {
    return (
      <div className="page-shell" data-name="export">
        <div className="page-content">
          <h1 className="page-title">Export</h1>
          <div className="error-box">
            <div className="error-icon" aria-hidden="true">
              !
            </div>
            <div className="error-content">
              <div>{pageState.message}</div>
              <button type="button" className="btn btn-ghost" onClick={loadSubjects}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderSubjectCard = (subject: Subject) => {
    const subjectId = subject.SubjectID;
    const status = subjectStatuses[subjectId];
    const isActive = subjectId === selectedSubjectId;
    const completed = status?.data?.subject?.completed_courses ?? 0;
    const total = status?.data?.subject?.total_courses ?? "—";
    const eligible = status?.data?.eligible ?? false;

    return (
      <button
        key={subjectId}
        type="button"
        className={`subject-card ${isActive ? "active" : ""}`}
        onClick={() => handleSelectSubject(subjectId)}
      >
        <div className="subject-card-header">
          <div className="subject-card-title">{subject.SubjectName}</div>
          {status?.state === "loading" && <span className="subject-chip">Loading…</span>}
          {status?.state === "error" && <span className="subject-chip subject-chip-warn">Error</span>}
          {status?.state === "ready" && (
            <span className={`subject-chip ${eligible ? "subject-chip-ok" : ""}`}>
              {eligible ? "Ready" : `${completed}/${total}`}
            </span>
          )}
        </div>
        <p className="subject-card-description">{subject.SubjectDescription ?? ""}</p>
      </button>
    );
  };

  const eligibleForDownload = Boolean(activeData?.eligible);
  const completedCourses = activeData?.completed_courses ?? [];

  return (
    <div className="page-shell" data-name="export">
      <div className="page-content" style={{ width: "min(920px, 100%)" }}>
        <div className="page-export-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>
            <FileText size={40} color="#c3bb1a" />
            <h1 className="page-export-title">Certificates</h1>
          </div>
          <p className="page-export-subtitle">Choose a subject to see if you can download its certificate.</p>
        </div>

        <div className="subject-grid">
          {subjects.length === 0 ? (
            <div className="subject-grid-empty">No subjects available yet.</div>
          ) : (
            subjects.map(renderSubjectCard)
          )}
        </div>

        <div className="page-export-stage">
          <div className="page-export-stage-header">
            <div>
              <div className="stage-subject-label">Selected subject</div>
              <h2 className="stage-subject-title">{subjectName}</h2>
              <p className="stage-progress">
                {activeStatus?.state === "loading"
                  ? "Progress: Loading…"
                  : `Progress: ${subjectCompletedCourses ?? 0}/${subjectTotalCourses ?? 0}`}
              </p>
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="page-export-download-button"
                onClick={eligibleForDownload ? handleDownload : undefined}
                disabled={!eligibleForDownload || downloading}
              >
                <Download size={20} />
                {eligibleForDownload ? (downloading ? "Generating..." : "Download certificate") : "Complete subject first"}
              </button>
              {statusMessage && <div className={`status-text ${statusTone}`}>{statusMessage}</div>}
            </div>
          </div>

          <div className="page-export-stage-body">
            <div>
              <div className="stage-section-title">Completed courses</div>
              {completedCourses.length === 0 ? (
                <p className="stage-helper">Finish each course in this subject to unlock the certificate.</p>
              ) : (
                <ul className="stage-course-list">
                  {completedCourses.map((course) => (
                    <li key={course.course_id}>
                      <span>{course.course_title}</span>
                      {completedScoresByCourseId.has(course.course_id) && (
                        <span className="stage-course-score">{completedScoresByCourseId.get(course.course_id)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {activeCertificate && (
              <div className="stage-certificate-summary">
                <div className="stage-section-title">Certificate preview</div>
                <p>Recipient: {activeCertificate.name_en}</p>
                <p>Subject: {activeCertificate.subject_cn ?? activeCertificate.subject_en}</p>
                {activeCertificate.completed_at && (
                  <p>
                    Completed on:{" "}
                    {new Date(activeCertificate.completed_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {onNavigateToCert && (
                  <button type="button" className="link-button" onClick={onNavigateToCert}>
                    Open certificate viewer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
