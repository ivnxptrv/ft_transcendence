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

No known browser-specific functional limitations. The following cosmetic differences are expected:

1. **Date picker icon cursor**: Firefox ignores `::-webkit-calendar-picker-indicator`; uses native date picker UI
2. **`<details>` marker**: Firefox controls via `list-style: none` (already applied via `list-none` Tailwind class); Chrome/Edge use `::-webkit-details-marker`
3. **Number input spinners**: Firefox uses `-moz-appearance: number-input`; Chrome/Edge use `::-webkit-inner-spin-button`. The `[appearance:textfield]` utility covers both

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
