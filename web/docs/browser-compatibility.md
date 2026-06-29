# Browser Compatibility

## Supported Browsers

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome (latest) | ✅ Verified | Tested via Playwright Chromium |
| Firefox (latest) | ✅ Verified | Tested via Playwright Firefox |
| Edge (latest) | ✅ Verified | Tested via Playwright (system-installed Edge) |

## Test Results (2026-06-27)

| Browser | Passed | Total |
|---------|--------|-------|
| Chrome (Chromium) | 20 | 20 |
| Firefox | 20 | 20 |
| Edge | 20 | 20 |
| **Total** | **60** | **60** |

All 60 tests run across 3 browser projects using Playwright. Tests cover: login/signup page rendering and interaction, form validation, password visibility toggle, role selection, language-aware redirects, footer navigation, privacy/terms page rendering, keyboard focus, CSS feature support (backdrop-filter, font loading, dark theme), SVG favicon presence, and guest redirect behavior.

## Browser-Specific Fixes Applied

| File | Fix | Affected Browsers |
|------|-----|-------------------|
| `ClientDashboard.tsx:67` | `[&::-webkit-details-marker]:hidden` + `list-none` | Hides `<details>` disclosure triangle in WebKit/Blink; `list-none` handles Firefox |
| `InsiderDashboard.tsx:55` | `[&::-webkit-details-marker]:hidden` + `list-none` | Same fix for insider dashboard |
| `ClientDashboard.tsx:55` | `[&::-webkit-calendar-picker-indicator]:cursor-pointer` | Custom date picker icon cursor in Chrome/Edge |
| `WalletBalanceCard.tsx:131` | `[appearance:textfield]` + `::-webkit-outer/inner-spin-button` | Hides number input spinners cross-browser |

## CSS Features Used

| Feature | Chrome | Firefox | Edge |
|---------|--------|---------|------|
| `backdrop-filter` | ✅ | ✅ | ✅ |
| `color-scheme` (dark) | ✅ | ✅ | ✅ |
| `appearance: textfield` | ✅ | ✅ | ✅ |
| Custom properties (CSS vars) | ✅ | ✅ | ✅ |
| `::webkit-details-marker` | ✅ | N/A (uses `list-style`) | ✅ |
| `::webkit-calendar-picker-indicator` | ✅ | N/A (native behavior) | ✅ |

## Known Limitations

No known browser-specific functional limitations. The following cosmetic differences and caveats are expected:

1. **Date picker icon cursor**: Firefox ignores `::-webkit-calendar-picker-indicator`; uses native date picker UI
2. **`<details>` marker**: Firefox controls via `list-style: none` (already applied via `list-none` Tailwind class); Chrome/Edge use `::-webkit-details-marker`
3. **Number input spinners**: Firefox uses `-moz-appearance: number-input`; Chrome/Edge use `::-webkit-inner-spin-button`. The `[appearance:textfield]` utility covers both

### Firefox BFCache — Stale Pages After Deploy

**Issue:** Firefox's Back-Forward Cache (BFCache) preserves page state in memory when navigating away from or switching tabs. After a server-side deployment (e.g., Docker container rebuild), a previously opened tab may still serve the old HTML without re-requesting the server, even with `Cache-Control: no-store` headers.

**Reproduction (2026-06-28):**
1. Open any page (e.g. `/en/login`) in Firefox
2. Rebuild the web container with code changes that affect the served HTML
3. Refresh the page normally — Firefox BFCache may still serve the old HTML
4. Hard refresh (`Ctrl+Shift+R`) was required to force a fresh server request

**Impact:** Metadata paths (e.g. apple-icon), font configuration updates, or any HTML changes may not take effect in Firefox after a deploy without a hard refresh.

**Status:** Known Firefox behavior, not a bug in our code. If this becomes a concern, consider a middleware response header like `Clear-Site-Data: "cache"` on deploy, or add a build-version meta tag with a mismatch detection script. Investigation deferred pending compatibility testing.

## Running the Tests

```bash
cd web

# Install playwright browsers (one-time)
npx playwright install chromium firefox

# Run all three browser projects
npm run test:e2e

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:edge

# Run with HTML report
npx playwright test --reporter=html
```
