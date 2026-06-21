"use client";

import { useState } from "react";
import { submitNewOrder } from "@/actions/orders";
import { messageFor } from "@/lib/errors";

export default function NewOrderButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  // One key per compose session: re-clicking Publish (e.g. after a write that
  // looked like it failed) reuses it so the server dedups; a new order gets a
  // fresh key on the next open.
  const [idempotencyKey, setIdempotencyKey] = useState("");

  function handleOpen() {
    setIdempotencyKey(crypto.randomUUID());
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setTitle("");
    setText("");
    setPublished(false);
    setTitleError(null);
    setTextError(null);
    setError(null);
  }

  async function handlePublish() {
    // Hard validation: surface per-field errors on submit attempt rather than
    // greying out the button. Clears as the user types (see onChange handlers).
    const titleEmpty = !title.trim();
    const textEmpty = !text.trim();
    if (titleEmpty) setTitleError("Title is required.");
    if (textEmpty) setTextError("Text is required.");
    if (titleEmpty || textEmpty) return;

    setError(null);
    setTitleError(null);
    setTextError(null);
    setLoading(true);
    setPublished(false);
    const res = await submitNewOrder(title, text, idempotencyKey);
    if (res.ok) {
      setPublished(true);
      setTimeout(() => handleClose(), 1500);
    } else {
      setError(messageFor("interaction.orders", res.error.code));
    }
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="bg-white text-black font-semibold px-4 py-2 rounded-full text-[11px] uppercase tracking-wider hover:bg-zinc-200 transition-colors active:scale-95 cursor-pointer"
      >
        + New order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          />

          {/* Bottom sheet */}
          <div className="relative w-full max-w-2xl mx-auto bg-zinc-900 border-t border-white/10 rounded-t-[2.5rem] px-8 pt-4 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            {/* Grab Handle */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold bg-linear-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                New order
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">
                  Order Title
                </label>
                <input
                  type="text"
                  placeholder="Need advice on moving to Thailand..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError(null);
                  }}
                  className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-all font-sans ${titleError ? "border-red-500/60" : "border-white/10"}`}
                />
                {titleError && <p className="text-xs text-red-400 px-1">{titleError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">
                  Detailed Query
                </label>
                <textarea
                  placeholder="What do you actually want to know? Be specific — the more context you give, the better the match."
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (textError) setTextError(null);
                  }}
                  className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 line-clamp-6 leading-relaxed resize-none h-40 outline-none focus:border-white/20 transition-all font-sans ${textError ? "border-red-500/60" : "border-white/10"}`}
                />
                {textError && <p className="text-xs text-red-400 px-1">{textError}</p>}
              </div>

              <div className="mt-4">
                {error && <p className="text-xs text-red-400">{error}</p>}
                {published ? (
                  <div className="w-full text-center py-4 text-sm font-bold text-emerald-400 animate-in fade-in duration-300">
                    Order published ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handlePublish}
                    className="w-full bg-white text-black rounded-full py-4 text-sm font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-white/5 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle
                            className="opacity-20"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-90"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Publishing…
                      </>
                    ) : (
                      "Publish order"
                    )}
                  </button>
                )}
                <p className="text-[10px] text-zinc-600 text-center mt-4 uppercase tracking-tighter">
                  By publishing, you agree to our terms of service
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
