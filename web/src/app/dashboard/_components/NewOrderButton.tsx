"use client";

import { useState } from "react";
import { submitNewOrder } from "@/actions/orders";

export default function NewOrderButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [published, setPublished] = useState(false);

  function handleClose() {
    setOpen(false);
    setTitle("");
    setText("");
    setPublished(false);
  }

  function handlePublish() {
    // TODO: POST /orders { title, text } → returns Order; prepend to orders list in parent
    // submitNewOrder(title, text);
    setPublished(true);
    setTimeout(() => handleClose(), 1500);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold px-1">
                  Detailed Query
                </label>
                <textarea
                  placeholder="What do you actually want to know? Be specific — the more context you give, the better the match."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 line-clamp-6 leading-relaxed resize-none h-40 outline-none focus:border-white/20 transition-all font-sans"
                />
              </div>

              <div className="mt-4">
                {published ? (
                  <div className="w-full text-center py-4 text-sm font-bold text-emerald-400 animate-in fade-in duration-300">
                    Order published ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="w-full bg-white text-black rounded-full py-4 text-sm font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-white/5"
                  >
                    Publish order
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
