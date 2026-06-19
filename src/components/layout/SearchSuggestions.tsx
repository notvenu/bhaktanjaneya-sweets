"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export function SearchSuggestions({
  value,
  onChange,
  placeholder,
  onSubmit,
  suggestions,
  disabled,
  inputClassName,
  dropdownClassName,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onSubmit: () => void;
  suggestions: readonly string[];
  disabled?: boolean;
  inputClassName?: string;
  dropdownClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    const res = suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 10);
    return res;
  }, [suggestions, value]);

  useEffect(() => {
    function onDocPointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActive(0);
      }
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, []);

  useEffect(() => {
    if (!disabled) setOpen(true);
  }, [disabled]);

  function commit(next: string) {
    onChange(next);
    setOpen(false);
    setActive(0);
    onSubmit();
  }

  return (
    <div ref={rootRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="relative"
      >
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => !disabled && setOpen(true)}
          placeholder={placeholder}
          className={
            "h-11 w-full rounded-full border border-cream-300 bg-cream-100/60 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/40 " +
            (inputClassName ?? "")
          }
          onKeyDown={(e) => {
            if (disabled) return;
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              if (open && filtered[active]) {
                e.preventDefault();
                commit(filtered[active]);
              } else {
                onSubmit();
              }
            } else if (e.key === "Escape") {
              setOpen(false);
              setActive(0);
            }
          }}
        />
      </form>

      {open && !disabled && filtered.length > 0 ? (
        <ul
          role="listbox"
          className={
            "absolute left-0 right-0 z-50 mt-2 max-h-56 overflow-auto overscroll-contain rounded-xl border border-cream-300 bg-white py-1 shadow-card " +
            (dropdownClassName ?? "")
          }
        >
          {filtered.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(s);
              }}
              className={
                "flex cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm " +
                (i === active ? "bg-saffron-500/10 text-maroon-900" : "text-ink-700")
              }
            >
              <span className="truncate">{s}</span>
              {s.toLowerCase() === value.trim().toLowerCase() ? (
                <Check size={15} className="shrink-0 text-leaf-600" />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {/* little hint chevron (optional visual) */}
      <ChevronDown
        size={18}
        className={
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-transform " +
          (open ? "rotate-180" : "rotate-0")
        }
      />
    </div>
  );
}

