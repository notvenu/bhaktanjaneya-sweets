import { ApiError } from "./client";

const STATUS_MESSAGES: Record<number, { title: string; message: string }> = {
  400: {
    title: "Invalid request",
    message: "Please review the information you entered and try again.",
  },
  401: {
    title: "Session expired",
    message: "Please log in again to continue.",
  },
  403: {
    title: "Access denied",
    message: "You don't have permission to perform this action.",
  },
  404: {
    title: "Not found",
    message: "We couldn't find what you were looking for. It may have been removed or moved.",
  },
  409: {
    title: "Action unavailable",
    message: "This action isn't available for the current state. Refresh the page and try again.",
  },
  422: {
    title: "Validation failed",
    message: "Some of the details provided aren't valid. Please check and try again.",
  },
  429: {
    title: "Too many attempts",
    message: "Please wait a moment before trying again.",
  },
  500: {
    title: "Server error",
    message: "Something went wrong on our end. Please try again in a few minutes.",
  },
  502: {
    title: "Service unavailable",
    message: "Our service is temporarily unavailable. Please try again shortly.",
  },
  503: {
    title: "Service unavailable",
    message: "Our service is temporarily unavailable. Please try again shortly.",
  },
};

export interface ErrorDetails {
  title: string;
  message: string;
  hint?: string;
}

function parseApiPayload(error: ApiError): { message?: string; hint?: string } {
  const data = error.data as { error?: string; message?: string; hint?: string } | undefined;
  return {
    message: data?.error ?? data?.message ?? error.message,
    hint: data?.hint,
  };
}

/** Structured, production-ready error copy for UI alerts. */
export function getErrorDetails(
  error: unknown,
  context?: string,
  fallbackMessage = "Something went wrong. Please try again.",
): ErrorDetails {
  if (error instanceof ApiError) {
    const { message: raw, hint } = parseApiPayload(error);
    const trimmed = raw?.trim();

    if (trimmed && trimmed !== "Forbidden" && trimmed !== "An unexpected error occurred") {
      return {
        title: context ?? STATUS_MESSAGES[error.status]?.title ?? "Something went wrong",
        message: trimmed,
        hint,
      };
    }

    if (error.status === 403 || trimmed === "Forbidden") {
      return {
        title: context ?? "Order not completed",
        message:
          "We couldn't complete your request due to a permissions issue. Please log in again or contact us for help.",
        hint: "If this keeps happening, try signing out and back in.",
      };
    }

    const statusCopy = STATUS_MESSAGES[error.status];
    return {
      title: context ?? statusCopy?.title ?? "Something went wrong",
      message: statusCopy?.message ?? fallbackMessage,
      hint,
    };
  }

  if (error instanceof Error && error.message.trim()) {
    return {
      title: context ?? "Something went wrong",
      message: error.message.trim(),
    };
  }

  return {
    title: context ?? "Something went wrong",
    message: fallbackMessage,
  };
}

/** Single-line message for compact UI (toasts, inline hints). */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const details = getErrorDetails(error, undefined, fallback);
  return details.hint ? `${details.message} ${details.hint}` : details.message;
}
