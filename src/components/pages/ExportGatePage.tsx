import { useEffect, useMemo, useState } from "react";
import { FileText, Lock, Unlock } from "lucide-react";
import type { AxiosError } from "axios";

import type { AuthUser } from "../../feature/auth/api";
import type { CertificateMetadata } from "../../feature/cert/types";
import { getLicenseStatus, redeemLicense, requestLicense } from "../../feature/license/api";
import { ExportPage } from "./ExportPage";
import "./ExportPage.css";

interface ExportGatePageProps {
  user: AuthUser;
  refreshUser: () => Promise<AuthUser | null>;
  onNavigateToCert?: () => void;
  onCertificateReady?: (certificate: CertificateMetadata | null) => void;
}

type GateState =
  | { kind: "loading" }
  | { kind: "unlocked" }
  | { kind: "locked"; pendingRequest: boolean; pendingCode: string | null }
  | { kind: "error"; message: string };

const getErrorMessage = (err: unknown, fallback: string): string => {
  const axiosErr = err as AxiosError<{ detail?: string }>;
  return axiosErr?.response?.data?.detail ?? fallback;
};

export function ExportGatePage({ user, refreshUser, onNavigateToCert, onCertificateReady }: ExportGatePageProps) {
  const hasLicense = useMemo(() => Boolean(user.License), [user.License]);
  const [state, setState] = useState<GateState>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"ok" | "warn">("ok");

  const load = async () => {
    if (hasLicense) {
      setState({ kind: "unlocked" });
      return;
    }
    setState({ kind: "loading" });
    setStatusMessage(null);
    try {
      const res = await getLicenseStatus();
      if (res.has_license) {
        await refreshUser();
        setState({ kind: "unlocked" });
        return;
      }
      setState({ kind: "locked", pendingRequest: Boolean(res.pending_request), pendingCode: res.pending_code ?? null });
    } catch {
      setState({ kind: "error", message: "Unable to load license status." });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLicense]);

  const handleRequest = async () => {
    setSubmitting(true);
    setStatusMessage(null);
    setStatusTone("ok");
    try {
      await requestLicense();
      setStatusTone("ok");
      setStatusMessage("License request submitted.");
      await load();
    } catch (err) {
      setStatusTone("warn");
      setStatusMessage(getErrorMessage(err, "Unable to request a license. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeem = async () => {
    if (!code.trim()) {
      setStatusTone("warn");
      setStatusMessage("Please enter a license code.");
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    setStatusTone("ok");
    try {
      await redeemLicense(code.trim());
      setStatusTone("ok");
      setStatusMessage("License redeemed successfully.");
      setCode("");
      await refreshUser();
      await load();
    } catch (err) {
      setStatusTone("warn");
      setStatusMessage(getErrorMessage(err, "Invalid license code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (state.kind === "loading") {
    return (
      <div className="page-shell" data-name="export-gate">
        <div className="page-content" style={{ alignItems: "center" }}>
          <div className="form-card" style={{ width: "min(520px, 100%)" }}>
            <div className="skeleton skeleton-text lg" style={{ width: "55%" }} />
            <div className="skeleton skeleton-text" style={{ width: "85%" }} />
            <div className="skeleton" style={{ height: "160px", width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="page-shell" data-name="export-gate">
        <div className="page-content" style={{ alignItems: "center" }}>
          <div className="form-card" style={{ width: "min(520px, 100%)" }}>
            <h1 className="page-title">Export</h1>
            <div className="status-text warn">{state.message}</div>
            <button type="button" className="btn btn-secondary" onClick={load}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === "unlocked") {
    return <ExportPage user={user} refreshUser={refreshUser} onNavigateToCert={onNavigateToCert} onCertificateReady={onCertificateReady} />;
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
                  Unlock Export
                </h2>
                <p style={{ fontFamily: "Poppins", fontSize: 18, color: "#cccccc" }}>
                  Export certificates of your completed courses.
                </p>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setStatusMessage(null);
                    }}
                    placeholder={state.pendingCode ? `Pending code: ${state.pendingCode}` : "Enter license code"}
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
                    onClick={handleRequest}
                    disabled={submitting}
                  >
                    {state.pendingRequest ? "Resend code" : "Send me a code"}
                  </button>
                  <button
                    type="button"
                    className="page-export-secondary-action"
                    onClick={load}
                    disabled={submitting}
                  >
                    Refresh
                  </button>
                </div>

                <div className="helper-text" style={{ textAlign: "center" }}>
                  We will email the code to {user.email}.
                </div>

                <div className="page-export-header" style={{ marginTop: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <FileText size={22} color="#c3bb1a" />
                    <div className="page-export-subtitle">After unlocking, you can download certificates.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
