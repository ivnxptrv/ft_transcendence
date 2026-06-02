# Favicon Design — Vekko

## What we're building

Two favicon variants based on a two-speech-bubble icon representing the client-query/insider-response mechanic of the platform.

## Icon

Two overlapping speech bubbles — the client bubble (top-left) and the insider bubble (bottom-right) — using the app's warm palette.

SVG viewBox: `0 0 40 36`

```
Client bubble:   rect x=1  y=1  w=22 h=14 rx=4  + tail polygon pointing bottom-left
Insider bubble:  rect x=17 y=19 w=22 h=14 rx=4  + tail polygon pointing bottom-right
```

## Variants

### Dark (primary icon)
- Background: `#0a0a0a` (app dark mode background)
- Client bubble fill: `#faf9f7`
- Insider bubble fill: `#b0a898`
- Delivered as: `app/icon.svg` (static file, no build step)

### Cream (Apple touch icon)
- Background: `#ede9e3` (nav/light-mode background)
- Client bubble fill: `#3a3530`
- Insider bubble fill: `#7a706a`
- Delivered as: `app/apple-icon.tsx` using `ImageResponse` (32×32 PNG, statically generated at build time)

## Next.js 16 file conventions

| File | Convention | Output tag |
|------|-----------|------------|
| `app/icon.svg` | `icon` | `<link rel="icon" type="image/svg+xml" sizes="any">` |
| `app/apple-icon.tsx` | `apple-icon` | `<link rel="apple-touch-icon" sizes="32x32">` |

The existing `app/favicon.ico` (Next.js default) is deleted — `icon.svg` supersedes it for modern browsers.

`apple-icon` file convention only supports `.jpg/.jpeg/.png`, so the cream variant must be generated via `ImageResponse` rather than placed as an SVG.

## Out of scope

- No `.ico` fallback (SVG favicons have >95% browser support)
- No multiple sizes — SVG scales natively; apple-touch-icon at 32×32 is sufficient for this project's scope
