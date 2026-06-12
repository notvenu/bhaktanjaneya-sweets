import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type AlertTone = "error" | "success" | "info";

const TONE_STYLES: Record<
  AlertTone,
  { container: string; icon: string; Icon: typeof AlertCircle }
> = {
  error: {
    container: "border-maroon-200 bg-maroon-50 text-maroon-900",
    icon: "text-maroon-600",
    Icon: AlertCircle,
  },
  success: {
    container: "border-leaf-200 bg-leaf-50 text-leaf-900",
    icon: "text-leaf-600",
    Icon: CheckCircle2,
  },
  info: {
    container: "border-cream-300 bg-cream-50 text-ink-700",
    icon: "text-saffron-600",
    Icon: Info,
  },
};

export function Alert({
  tone = "error",
  title,
  children,
  className = "",
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const styles = TONE_STYLES[tone];
  const Icon = styles.Icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles.container} ${className}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${styles.icon}`} aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5 leading-relaxed" : "leading-relaxed"}>{children}</div>
      </div>
    </div>
  );
}
