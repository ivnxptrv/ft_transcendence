"use client";

import { useEffect, useRef, useState } from "react";

// A text input that accepts only numeric values and shows a localized error
// message in a floating tooltip above the field when the entered text is not a
// valid number (or is outside the optional min/max range). Replaces the native
// <input type="number">, whose built-in validation popup always renders in the
// browser's UI locale — not the app's. The tooltip mimics the native browser
// validation callout but stays in the app locale. The value is mirrored into a
// hidden <input name={name}> so it still submits inside the surrounding GET
// form; form submission is blocked while a validation error is shown.
export function NumberInput({
  name,
  defaultValue,
  invalidMessage,
  min,
  max,
  className,
}: {
  name: string;
  defaultValue?: string;
  invalidMessage: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [prevDefault, setPrevDefault] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  if (defaultValue !== prevDefault) {
    setPrevDefault(defaultValue);
    setValue(defaultValue ?? "");
  }

  const validate = (v: string): string => {
    if (v === "") return "";
    const n = Number(v);
    if (Number.isNaN(n)) return invalidMessage;
    if (min !== undefined && n < min) return invalidMessage;
    if (max !== undefined && n > max) return invalidMessage;
    return "";
  };

  const currentError = validate(value);

  useEffect(() => {
    const form = inputRef.current?.closest("form");
    if (!form) return;
    const onSubmit = (e: SubmitEvent) => {
      if (currentError) e.preventDefault();
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [currentError]);

  return (
    <div className="relative">
      <input type="hidden" name={name} value={currentError ? "" : value} />
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`${className ?? ""} ${currentError ? "border-red-500" : ""}`}
      />
      {currentError && (
        <div className="pointer-events-none absolute bottom-full left-0 z-40 mb-1.5 whitespace-nowrap rounded-md border border-red-500/30 bg-red-950 px-2 py-1 text-[10px] font-medium text-red-300 shadow-lg">
          {currentError}
          <span className="absolute left-3 top-full -translate-y-1/2 h-1.5 w-1.5 rotate-45 border-b border-r border-red-500/30 bg-red-950" />
        </div>
      )}
    </div>
  );
}
