"use client";

import { useEffect, useRef, useState } from "react";

// A fully custom date picker that replaces the native <input type="date"> so the
// placeholder text, display format, and calendar widget are always shown in the
// app's current locale — not the browser's UI language (which Chrome ignores the
// `lang` attribute for). The selected date is mirrored into a hidden
// <input name={name}> as YYYY-MM-DD, so it still submits inside the surrounding
// GET form exactly like a native date input. Closes on outside click or Escape.

const pad = (n: number) => String(n).padStart(2, "0");

type LocaleData = {
  months: string[];
  weekdays: string[]; // 7 entries, Sunday-first
  weekStart: 0 | 1; // 0 = Sunday, 1 = Monday
  placeholder: string;
  format: (y: number, m: number, d: number) => string; // m is 1-indexed
};

const LOCALE_DATA: Record<string, LocaleData> = {
  en: {
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    weekStart: 0,
    placeholder: "MM/DD/YYYY",
    format: (y, m, d) => `${pad(m)}/${pad(d)}/${y}`,
  },
  fr: {
    months: [
      "Janvier", "F\u00e9vrier", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Ao\u00fbt", "Septembre", "Octobre", "Novembre", "D\u00e9cembre",
    ],
    weekdays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    weekStart: 1,
    placeholder: "JJ.MM.AAAA",
    format: (y, m, d) => `${pad(d)}.${pad(m)}.${y}`,
  },
  ru: {
    months: [
      "\u042f\u043d\u0432\u0430\u0440\u044c", "\u0424\u0435\u0432\u0440\u0430\u043b\u044c", "\u041c\u0430\u0440\u0442", "\u0410\u043f\u0440\u0435\u043b\u044c", "\u041c\u0430\u0439", "\u0418\u044e\u043d\u044c",
      "\u0418\u044e\u043b\u044c", "\u0410\u0432\u0433\u0443\u0441\u0442", "\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c", "\u041e\u043a\u0442\u044f\u0431\u0440\u044c", "\u041d\u043e\u044f\u0431\u0440\u044c", "\u0414\u0435\u043a\u0430\u0431\u0440\u044c",
    ],
    weekdays: ["\u0412\u0441", "\u041f\u043d", "\u0412\u0442", "\u0421\u0440", "\u0427\u0442", "\u041f\u0442", "\u0421\u0431"],
    weekStart: 1,
    placeholder: "\u0414\u0414.\u041c\u041c.\u0413\u0413\u0413\u0413",
    format: (y, m, d) => `${pad(d)}.${pad(m)}.${y}`,
  },
  th: {
    months: [
      "\u0e21\u0e01\u0e23\u0e32\u0e04\u0e21", "\u0e01\u0e38\u0e21\u0e20\u0e32\u0e1e\u0e31\u0e19\u0e18\u0e4c", "\u0e21\u0e35\u0e19\u0e32\u0e04\u0e21", "\u0e40\u0e21\u0e29\u0e32\u0e22\u0e19", "\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21", "\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32\u0e22\u0e19",
      "\u0e01\u0e23\u0e01\u0e0e\u0e32\u0e04\u0e21", "\u0e2a\u0e34\u0e07\u0e2b\u0e32\u0e04\u0e21", "\u0e01\u0e31\u0e19\u0e22\u0e32\u0e22\u0e19", "\u0e15\u0e38\u0e25\u0e32\u0e04\u0e21", "\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32\u0e22\u0e19", "\u0e18\u0e31\u0e19\u0e27\u0e32\u0e04\u0e21",
    ],
    weekdays: ["\u0e2d\u0e32", "\u0e08", "\u0e2d", "\u0e1e", "\u0e1e\u0e24", "\u0e28", "\u0e2a"],
    weekStart: 0,
    placeholder: "\u0e27\u0e27/\u0e14\u0e14/\u0e1b\u0e1b\u0e1b\u0e1b",
    format: (y, m, d) => `${pad(d)}/${pad(m)}/${y}`,
  },
};

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Builds a 42-cell grid (6 weeks) for the calendar. Days from the adjacent
// months fill the leading/trailing slots so the grid is always a clean rectangle.
function getCalendarDays(viewMonth: Date, weekStart: 0 | 1): Date[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() - weekStart + 7) % 7;
  const days: Date[] = [];
  for (let i = offset; i > 0; i--) days.push(new Date(year, month, 1 - i));
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length < 42) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return days;
}

export function DatePicker({
  name,
  ariaLabel,
  id,
  defaultValue,
  locale,
  clearLabel,
  className,
}: {
  name: string;
  ariaLabel?: string;
  id?: string;
  defaultValue?: string;
  locale: string;
  clearLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const [viewMonth, setViewMonth] = useState(() => {
    if (defaultValue) {
      const [y, m] = defaultValue.split("-").map(Number);
      if (y && m) return new Date(y, m - 1, 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

  // Sync state when the URL-driven defaultValue changes (e.g. after clicking a
  // "Clear" link). Adjusting state during render (instead of in an effect) is
  // the React-recommended way to mirror a prop into state without extra renders.
  const [prevDefault, setPrevDefault] = useState(defaultValue);
  if (defaultValue !== prevDefault) {
    setPrevDefault(defaultValue);
    setValue(defaultValue ?? "");
    if (defaultValue) {
      const [y, m] = defaultValue.split("-").map(Number);
      if (y && m) setViewMonth(new Date(y, m - 1, 1));
    }
  }

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const l = LOCALE_DATA[locale] ?? LOCALE_DATA.en;
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const displayValue = selectedDate
    ? l.format(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        selectedDate.getDate(),
      )
    : "";

  const days = getCalendarDays(viewMonth, l.weekStart);
  const weekdayHeaders = [
    ...l.weekdays.slice(l.weekStart),
    ...l.weekdays.slice(0, l.weekStart),
  ];

  const selectDate = (d: Date) => {
    setValue(toISODate(d));
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} aria-hidden="true" />
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`${className ?? ""} flex items-center justify-between cursor-pointer`}
      >
        <span className={value ? "text-white" : "text-zinc-600"}>
          {displayValue || l.placeholder}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2 h-3.5 w-3.5 shrink-0 opacity-60"
        >
          <rect x="2.5" y="4" width="11" height="9.5" rx="1.5" />
          <path d="M2.5 6.5h11M5.5 2.5v2M10.5 2.5v2" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-white/10 bg-zinc-900 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
                )
              }
              className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="m10 4-4 4 4 4" />
              </svg>
            </button>
            <span className="text-[12px] font-semibold text-white">
              {l.months[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
                )
              }
              className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="m6 4 4 4-4 4" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {weekdayHeaders.map((wd, i) => (
              <div
                key={i}
                className="py-1 text-center text-[10px] font-medium text-zinc-500"
              >
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              const isCurrentMonth = d.getMonth() === viewMonth.getMonth();
              const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
              const isToday = isSameDay(d, today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDate(d)}
                  className={[
                    "flex h-8 items-center justify-center rounded-lg text-[12px] transition-colors",
                    isSelected
                      ? "bg-white text-black font-bold"
                      : isCurrentMonth
                        ? "text-zinc-300 hover:bg-white/10"
                        : "text-zinc-700 hover:bg-white/5",
                    isToday && !isSelected ? "ring-1 ring-white/20" : "",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {value && clearLabel && (
            <div className="mt-2 border-t border-white/10 pt-2">
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  setOpen(false);
                }}
                className="text-[11px] text-zinc-500 hover:text-white transition-colors"
              >
                {clearLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
