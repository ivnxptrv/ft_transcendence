"use client";

import { useState } from "react";

export default function NewOrderButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");

  function handleClose() {
    setOpen(false);
    setTitle("");
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ fontSize: 11, background: "#e4e4e4", color: "#0f0f0f" }}
        className="font-medium px-3 py-1.5 rounded-full"
      >
        + New request
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 40,
            }}
          />

          {/* Bottom sheet */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#161616",
              border: "0.5px solid #2a2a2a",
              borderRadius: "16px 16px 0 0",
              padding: "20px 20px 32px",
              zIndex: 50,
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 16 }}
            >
              <span style={{ fontSize: 14, color: "#e4e4e4", fontWeight: 500 }}>
                New request
              </span>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#555",
                  fontSize: 18,
                  cursor: "pointer",
                  lineHeight: 1,
                  fontFamily: "inherit",
                }}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: "0.5px solid #2a2a2a",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                color: "#e4e4e4",
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
                marginBottom: 8,
              }}
            />
            <textarea
              placeholder="What do you actually want to know? Be specific — the more context you give, the better the match."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: "0.5px solid #2a2a2a",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                color: "#e4e4e4",
                lineHeight: 1.6,
                resize: "none",
                height: 110,
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
                marginBottom: 14,
              }}
            />
            <button
              type="button"
              style={{
                width: "100%",
                background: "#e4e4e4",
                color: "#0f0f0f",
                border: "none",
                borderRadius: 20,
                padding: "11px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Publish request
            </button>
          </div>
        </>
      )}
    </>
  );
}
