# 🌿 CommunityEco - Hyperlocal Waste Management & Charity Matching Network

An inclusive, WCAG 2.1 compliance-rated, full-stack application for managing household waste collection floor-by-floor and matching citizen resource surplus (clothing, blank books, food canisters) with neighborhood shelters. 

Designed specifically for **apartments**, **corporate campuses**, and **universities** to maximize local accountability and support zero-landfill milestones.

---

## 🚀 Key Technological Enhancements

### 1. Inclusive Biocentric Login & Voice Assistance (WCAG 2.1)
*   **Facial Scanner Simulation**: An interactive camera-linked scanner allows illiterate or non-reading floor sweeper/collectors to authenticate with a single facial scan overlay.
*   **Screen Narrator**: Integrated text-to-speech engine speaks actions, lists, and floor numbers aloud when hovered or activated, eliminating reading barriers.
*   **WCAG Chromatic Mappings**: Natural visual filters to shift color palettes towards safer ranges for Protanopia, Deuteranopia, Tritanopia, or High-Contrast Monochromacy.

### 2. Multi-Sector Facility Dashboards
*   Create and manage distinctive dashboards for residential towers, corporate blocks, and universities.
*   Track progress levels floor-by-floor with real-time status updates: `Dispatched Alert` ➡️ `Collecting` ➡️ `Completed`.
*   Generate targeted community warnings which instantly trigger push alert banners on affected floor resident panels.

### 3. Google Gemini AI Analysis (Server-Side)
*   **Visual Classification**: Upload photo snapshots of floor clutter. Server-side `gemini-3.5-flash` analyzes the waste, returns exact material categories, weight specs, and step-by-step citizen sorting guidelines.
*   **Donation Usability Audit**: Evaluates listed description arrays of citizen donations (such as vintage books or winter coats). Predicts sanitary condition metrics and directs them to suitable NGO matches.

### 4. Direct Charity Match Hub
*   Direct donor-to-NGO matching pipeline with verified quantity verification and automated safety compliance checks.

---

## 📂 Logical Directory Tree

```text
/
├── server.ts                  # Core full-stack Express.js server entry (Vite middleware sync)
├── data-store.json            # Persistent JSON file DB (pre-loaded with realistic initial states)
├── package.json               # Development task scripts & dependency bundles
├── metadata.json              # Frame permissions (camera coordinates) and model aliases
├── server/
│   └── db.ts                  # File-based database managers and dynamic metric aggregators
└── src/
    ├── main.tsx               # Client bootstrap entry
    ├── index.css              # Global Tailwinds and WCAG hue-shift matrices
    ├── types.ts               # Shared TypeScript configurations
    ├── App.tsx                # Central coordinator and view router
    └── components/
        ├── AccessibilityControls.tsx # Colour shifts and SpeechSynthesis hooks
        ├── LeaderboardMetrics.tsx    # Dynamic SVG dashboard visualizers 
        ├── SupervisorPanel.tsx       # Caretaker announcements and resolved complaints
        ├── CollectorPanel.tsx        # Camera face simulator, floor buttons and Gemini uploads
        ├── ResidentPanel.tsx         # Targeted floor notices, ticket forms, and donations
        └── DonationHub.tsx           # NGO claiming desk and matching logs
```

---

## 🛠️ Installation & Active Running

The repository automatically binds server assets on Port `3000` via automated nginx proxy rules.

### Development Mode (Full-Stack Hot-Sync)
To boot both the Express.js API routers and the React Vite client middleware simultaneously:
```bash
npm run dev
```

### Production Build & Standalone Boot
To bundle client files inside `dist/` and compile the TypeScript backend entry using `esbuild` into a single standalone CommonJS Common bundle:
```bash
npm run build
npm start
```

---

## 📈 Aggregated Environmental Metrics Formula
*   **Landfill Diverted Ratio**: Calculates total composted or recycled dry volumes relative to gross sweeps (Baseline target metrics maintain a $92\%$ diversion rating).
*   **Carbon Offset Equivalences**: Average of $0.43 \text{ Kg CO}_2$ footprint saved per Kg of waste categorized and diverted correctly.
*   **Participation Rating**: Ratio of active logins or alerts published relative to flat count.

*Designed with ❤️ for inclusive, clean, and sustainable hyperlocal neighborhoods.*
