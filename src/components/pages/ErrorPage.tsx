import type { ReactNode } from "react";
import chickenImg from "../../assets/chicken.png";
import "./ErrorPage.css";

type ErrorCode = 400 | 401 | 403 | 404 | 500 | number | string;

interface ErrorPageProps {
  code?: ErrorCode;
  title?: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const DEFAULT_COPY: Record<number, { title: string; description: string }> = {
  400: {
    title: "Bad Request",
    description: "Something about that request confused our coop. Please try again.",
  },
  401: {
    title: "Unauthorized",
    description: "You need to sign in before peeking into this course.",
  },
  403: {
    title: "Forbidden",
    description: "This nest is private. Check your access or contact support.",
  },
  404: {
    title: "Page not found",
    description: "We searched the whole barn but couldn’t find what you were looking for.",
  },
  500: {
    title: "Server error",
    description: "Our systems hit a snag. Please try again in a moment.",
  },
};

export function ErrorPage({ code, title, description, onAction, actionLabel }: ErrorPageProps) {
  const numericCode = typeof code === "string" ? Number(code) : code;
  const fallbackCopy = Number.isFinite(numericCode ?? NaN) ? DEFAULT_COPY[numericCode as number] : undefined;
  const resolvedTitle = title ?? fallbackCopy?.title ?? "Something went wrong";
  const resolvedDescription =
    description ?? fallbackCopy?.description ?? "We hit an unexpected issue. Please try again in a moment.";

  return (
    <div className="error-page-shell">
      <div className="error-page-card">
        <div className="error-page-image-wrap" aria-hidden="true">
          <img src={chickenImg} alt="" className="error-page-image" />
        </div>

        <div className="error-page-content">
          <p className="error-page-code" aria-label="Error status code">
            {code ?? "Error"}
          </p>
          <h1 className="error-page-title">{resolvedTitle}</h1>
          <p className="error-page-description">{resolvedDescription}</p>

          {onAction && (
            <button type="button" className="error-page-action" onClick={onAction}>
              {actionLabel ?? "Back to safety"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
