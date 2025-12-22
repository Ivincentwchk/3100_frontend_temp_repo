import { useEffect, useMemo, useState } from "react";

import type { AuthUser } from "../feature/auth/api";
import { deleteMyProfilePic, getMyProfilePicBlob, uploadMyProfilePic } from "../feature/auth/api";

interface EditProfileModalProps {
  user: AuthUser;
  onClose: () => void;
  onUpdated: () => Promise<void> | void;
}

export function EditProfileModal({ user, onClose, onUpdated }: EditProfileModalProps) {
  const hasPic = Boolean(user.profile?.has_profile_pic);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"ok" | "warn">("ok");

  const displayName = useMemo(() => user.user_name, [user.user_name]);

  useEffect(() => {
    if (!hasPic) {
      setPreviewUrl(null);
      return;
    }

    let isMounted = true;
    let nextUrl: string | null = null;

    const load = async () => {
      try {
        const blob = await getMyProfilePicBlob();
        if (!isMounted) return;
        nextUrl = URL.createObjectURL(blob);
        setPreviewUrl(nextUrl);
      } catch {
        if (!isMounted) return;
        setPreviewUrl(null);
      }
    };

    load();

    return () => {
      isMounted = false;
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [hasPic]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusTone("warn");
      setStatusMessage("Please choose an image file first.");
      return;
    }

    setSubmitting(true);
    setStatusTone("ok");
    setStatusMessage("Updating profile picture...");

    try {
      await uploadMyProfilePic(selectedFile);
      setSelectedFile(null);
      await onUpdated();
      setStatusTone("ok");
      setStatusMessage("Profile picture updated.");
    } catch {
      setStatusTone("warn");
      setStatusMessage("Unable to update profile picture.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setSubmitting(true);
    setStatusTone("ok");
    setStatusMessage("Removing profile picture...");

    try {
      await deleteMyProfilePic();
      setSelectedFile(null);
      await onUpdated();
      setStatusTone("ok");
      setStatusMessage("Profile picture removed.");
    } catch {
      setStatusTone("warn");
      setStatusMessage("Unable to remove profile picture.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit Profile">
      <div className="modal-card edit-profile-modal">
        <div className="modal-header">
          <div>
            <div className="poc-section-title">Edit Profile</div>
            <div className="helper-text">Update profile picture for {displayName}</div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Close
          </button>
        </div>

        <div className="form-card">
          <div className="field">
            <label className="field-label">Profile Picture</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "92px",
                  height: "92px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div aria-hidden="true" className="skeleton" style={{ width: "100%", height: "100%" }} />
                )}
              </div>

              <div style={{ display: "grid", gap: "0.6rem", flex: "1 1 240px" }}>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  disabled={submitting}
                />
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={submitting || !selectedFile}>
                    Upload
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleRemove} disabled={submitting || !hasPic}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          {statusMessage && <div className={`status-text ${statusTone}`}>{statusMessage}</div>}
        </div>
      </div>
    </div>
  );
}
