"use client";

import { useEffect, useRef, useState } from "react";

// A fully custom dropdown that replaces the native <select> so the option list
// matches our design (no OS-drawn popup / blue highlight). The chosen value is
// mirrored into a hidden <input name={name}>, so it still submits inside the
// surrounding GET form exactly like a native select. Closes on outside click
// or Escape; the selected row carries our own check-mark highlight.
type Option = { value: string; label: string };

const THEME = {
  dark: {
    trigger:
      "flex w-full items-center justify-between bg-white/[0.06] border border-white/10 rounded-xl pl-3.5 pr-3 py-2.5 text-[13px] text-white outline-none transition-colors hover:border-white/20 focus:border-white/30 cursor-pointer",
    menu: "absolute left-0 right-0 top-full z-30 mt-1.5 rounded-xl border border-white/10 bg-zinc-900 p-1 shadow-xl",
    option:
      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-zinc-300 cursor-pointer transition-colors hover:bg-white/10",
    optionSelected: "bg-white/10 text-white",
  },
  light: {
    trigger:
      "flex w-full items-center justify-between bg-white border border-zinc-300 rounded-xl pl-3.5 pr-3 py-2.5 text-[13px] text-zinc-700 outline-none transition-colors hover:border-zinc-400 focus:border-zinc-500 cursor-pointer",
    menu: "absolute left-0 right-0 top-full z-30 mt-1.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl",
    option:
      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-zinc-600 cursor-pointer transition-colors hover:bg-zinc-100",
    optionSelected: "bg-zinc-100 text-zinc-900",
  },
} as const;

export function Select({
  name,
  defaultValue,
  options,
  theme = "dark",
}: {
  name: string;
  defaultValue?: string;
  options: Option[];
  theme?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const ref = useRef<HTMLDivElement>(null);

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

  const t = THEME[theme];
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={t.trigger}
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-2 h-3.5 w-3.5 shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" className={t.menu}>
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setValue(o.value);
                    setOpen(false);
                  }}
                  className={`${t.option} ${isSelected ? t.optionSelected : ""}`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && (
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2 h-3.5 w-3.5 shrink-0"
                    >
                      <path d="m13.5 4.5-7 7L3 8" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
