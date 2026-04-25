"use client";

import { type ReactNode } from "react";

export function FieldInput({
  name,
  type = "text",
  placeholder,
  autocomplete,
  value,
  onChange,
  required,
}: {
  name: string;
  type?: string;
  placeholder: string;
  autocomplete?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      autoComplete={autocomplete ?? "off"}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-all font-sans"
    />
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-white text-black rounded-full py-3 text-sm font-semibold hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer font-sans"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-transparent text-zinc-400 border border-white/10 rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer font-sans"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-transparent text-zinc-500 text-xs py-2 hover:text-white transition-colors cursor-pointer font-sans"
    >
      {children}
    </button>
  );
}

export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-zinc-500 text-xs mb-6 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-sans"
    >
      ← {label}
    </button>
  );
}
