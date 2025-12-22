import { useEffect, useMemo, useState } from "react";
import { FileText, Lock, Unlock, Download } from "lucide-react";
import type { AxiosError } from "axios";

import type { AuthUser } from "../../feature/auth/api";
import { getLicenseStatus, redeemLicense, requestLicense } from "../../feature/license/api";
import "./ExportPage.css";

interface ExportPageProps {
  user: AuthUser;
  refreshUser: () => Promise<AuthUser | null>;
}

type ExportViewState =
  | { kind: "loading" }
  | { kind: "unlocked" }
  | { kind: "locked"; pendingRequest: boolean }
  | { kind: "error"; message: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const axiosErr = err as AxiosError<{ detail?: string }>;
  return axiosErr?.response?.data?.detail ?? fallback;
};

export function ExportPage({ user, refreshUser }: ExportPageProps) {
  const [view, setView] = useState<ExportViewState>({ kind: "loading" });
  const [licenseCode, setLicenseCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"ok" | "warn">("ok");

  const hasLicense = Boolean(user.License);

  const completedCourseScores = useMemo(() => user.completed_course_scores ?? [], [user.completed_course_scores]);

  const loadStatus = async () => {
    if (hasLicense) {
      setView({ kind: "unlocked" });
      return;
    }

    try {
      const status = await getLicenseStatus();
      if (status.has_license) {
        await refreshUser();
        setView({ kind: "unlocked" });
        return;
      }
      setView({ kind: "locked", pendingRequest: status.pending_request });
    } catch (err) {
      setView({ kind: "error", message: getErrorMessage(err, "Unable to load license status.") });
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLicense]);

  const handleRequestLicense = async () => {
    setSubmitting(true);
    setStatusMessage(null);
    setStatusTone("ok");
    try {
      const res = await requestLicense();
      setStatusTone("ok");
      setStatusMessage(res.detail);
      await loadStatus();
    } catch (err) {
      setStatusTone("warn");
      setStatusMessage(getErrorMessage(err, "Unable to request a license. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeem = async () => {
    if (!licenseCode.trim()) {
      setStatusTone("warn");
      setStatusMessage("License code is required.");
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    setStatusTone("ok");
    try {
      const res = await redeemLicense(licenseCode.trim());
      setStatusTone("ok");
      setStatusMessage(res.detail);
      await refreshUser();
      await loadStatus();
    } catch (err) {
      setStatusTone("warn");
      setStatusMessage(getErrorMessage(err, "Invalid license code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (view.kind === "loading") {
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

  if (view.kind === "error") {
    return (
      <div className="page-shell" data-name="export">
        <div className="page-content">
          <h1 className="page-title">Export</h1>
          <div className="error-box">
            <div className="error-icon" aria-hidden="true">
              !
            </div>
            <div className="error-content">
              <div>{view.message}</div>
              <button type="button" className="btn btn-ghost" onClick={loadStatus}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view.kind === "unlocked") {
    return (
      <div className="page-shell" data-name="export">
        <div className="page-content" style={{ width: "min(720px, 100%)" }}>
          <div className="page-export-header">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>
              <FileText size={40} color="#c3bb1a" />
              <h1 className="page-export-title">Export Certificates</h1>
            </div>
            <p className="page-export-subtitle">Your export feature is unlocked.</p>
          </div>

          {completedCourseScores.length === 0 ? (
            <div className="form-card" style={{ gap: "0.75rem" }}>
              <div className="helper-text" style={{ textAlign: "center" }}>
                You have no completed course scores yet.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {completedCourseScores.map((item) => (
                <div key={item.CourseID} className="page-export-certificate-card">
                  <div className="page-export-certificate-bar" />
                  <div className="page-export-certificate-main">
                    <h3 style={{ fontFamily: "Poppins", fontSize: 26, color: "#ffffff", marginBottom: 8 }}>
                      Course #{item.CourseID}
                    </h3>
                    <div className="page-export-stat-card" style={{ marginBottom: 16 }}>
                      <div style={{ color: "#cccccc", fontSize: 16, marginBottom: 6 }}>Best score</div>
                      <div style={{ color: "#ffffff", fontSize: 22 }}>{item.CourseScore}</div>
                    </div>
                    <button
                      type="button"
                      className="page-export-download-button"
                      onClick={() => {
                        setStatusTone("warn");
                        setStatusMessage("Certificate download is coming soon.");
                      }}
                    >
                      <Download size={20} />
                      Download Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {statusMessage && <div className={`status-text ${statusTone}`}>{statusMessage}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell" data-name="export">
      <div className="page-content" style={{ width: "min(720px, 100%)" }}>
        <div className="page-export-locked-root">
          <div className="page-export-locked-container">
            <div className="page-export-locked-header-bar" />
            <div className="page-export-locked-card">
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div className="page-export-locked-avatar">
                  <Lock size={48} color="#c3bb1a" />
                </div>
                <h2 style={{ fontFamily: "Poppins", fontSize: 32, color: "#ffffff", marginBottom: 12 }}>
                  Unlock Pro Feature
                </h2>
                <p style={{ fontFamily: "Poppins", fontSize: 18, color: "#cccccc" }}>
                  Export certificates of your completed courses.
                </p>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <input
                    type="text"
                    value={licenseCode}
                    onChange={(e) => {
                      setLicenseCode(e.target.value);
                      setStatusMessage(null);
                    }}
                    placeholder="Enter license code"
                    className="page-export-locked-input"
                    disabled={submitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleRedeem();
                      }
                    }}
                  />
                </div>

                {statusMessage && <div className={`status-text ${statusTone}`}>{statusMessage}</div>}

                <button type="button" onClick={handleRedeem} className="page-export-locked-button" disabled={submitting}>
                  <Unlock size={20} />
                  {submitting ? "Unlocking..." : "Unlock Export"}
                </button>

                <div className="page-export-inline-actions">
                  <button
                    type="button"
                    className="page-export-secondary-action"
                    onClick={handleRequestLicense}
                    disabled={submitting}
                  >
                    {view.pendingRequest ? "Resend code" : "Send me a code"}
                  </button>
                  <button
                    type="button"
                    className="page-export-secondary-action"
                    onClick={loadStatus}
                    disabled={submitting}
                  >
                    Refresh
                  </button>
                </div>

                <div className="helper-text" style={{ textAlign: "center" }}>
                  We will email the code to {user.email}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
