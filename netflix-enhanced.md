# Plan: Netflix Enhanced Evolution

## 1. Overview & Objective
Transform the userscript into **Netflix Enhanced** with:
- Zero-latency performance engine (0ms–1ms frame-aligned via `requestAnimationFrame`, eliminate layout thrashing & reflows, O(1) element caching).
- Full rebranding across userscript metadata, floating settings panel, loader, and documentation.
- High-value features inspired by **Enhancer for YouTube**:
  - **Picture-in-Picture (PiP)**: Native control bar button and keyboard shortcut.
  - **Video Filters (Real-time GPU Shaders)**: Brightness, Contrast, and Saturation sliders for enhanced visuals.
  - **Custom Keyboard Shortcuts**: `[` / `]` for granular speed control, `S` for stretch screen toggle, `P` for PiP toggle.
  - **Mousewheel Speed & Volume Control**: Scroll wheel over speed button and horizontal volume slider.
  - **Auto Skip Next Episode Countdown**: Bypass the 10-second end-credit wait and instantly trigger the next episode.

---

## 2. Architecture & Components

### 2.1 Performance Engine (`scheduleFastUpdate`)
- Replace nested `setTimeout` with `requestAnimationFrame` + `isBatchScheduled` microtask queue.
- Fast memoized `<video>` element getter (`cachedVideo && cachedVideo.isConnected`).
- Tag renamed DOM nodes with `el.dataset.nfbEpRenamed` to skip redundant scans in O(1).
- Eliminate `window.getComputedStyle(el)` in `overrideEmotionColors()` in favor of direct CSS selectors (`[style*="229, 9, 20"]:not(.nfb-locked)`).
- Throttle blocker neutralizing (`neutralizeBlockers()`) to run only when relevant without locking up render frames.

### 2.2 Features (Enhancer for YouTube Inspiration)
- **Picture-in-Picture (`tryInjectPipButton`)**:
  - Injects `#nfb-pip-action` button next to stretch/speed buttons.
  - Toggles `video.requestPictureInPicture()` / `document.exitPictureInPicture()`.
- **Video Filters (`applyVideoFilters`)**:
  - Settings: `filters: { brightness: 100, contrast: 100, saturate: 100 }`.
  - Injects CSS filter dynamically on `<video>`: `filter: brightness(...) contrast(...) saturate(...)`.
  - Zero CPU cost (hardware-accelerated GPU compositor).
- **Keyboard Shortcuts (`initKeyboardShortcuts`)**:
  - Listens to `keydown` globally.
  - Ignores keystrokes when typing in inputs/textareas (`e.target.matches('input, textarea, [contenteditable]')`).
  - Shortcuts: `[` (slow down), `]` (speed up), `s` (toggle stretch), `p` (toggle PiP).
- **Mousewheel Speed Control**:
  - Wheel listener on `#nfb-speed-action` increments/decrements speed smoothly.
- **Enhanced Auto-Skip (`checkAutoSkip`)**:
  - Handles intro, recap, and seamless next episode button.

### 2.3 UI Panel Updates
- Update panel title to `⚙️ Netflix Enhanced`.
- Add "Filtros de Vídeo" group in Style tab (Brilho, Contraste, Saturação).
- Add PiP and Atalhos toggles in Features tab.

---

## 3. Files to Update
1. `d:\Programming\TAMPERMONKEY\NETFLIXeditor.js`
2. `d:\Programming\TAMPERMONKEY\NETFLIXeditor.user.js`
3. `d:\Programming\TAMPERMONKEY\NETFLIXeditor`
4. `d:\Programming\TAMPERMONKEY\netflix-loader.user.js`
5. `d:\Programming\TAMPERMONKEY\README.md`

---

## 4. Verification Criteria
- Run `node -c` on all JS files to guarantee zero syntax errors.
- Confirm all existing features (One Piece renamer, persistent playback rate, horizontal volume, stretch screen, bypass) remain 100% operational.
- Verify 1ms/rAF debouncer runs smoothly with 0 frame drops.
