# 🌿 Trash To Treasure - Hyperlocal Waste Management & Charity Matching Network

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

### 3. Google Gemini AI Analysis & Computer Vision (Server-Side)
*   **Visual Classification (Waste Scanner)**: Upload photo snapshots of floor clutter. Server-side `gemini-2.5-flash` analyzes the waste, returns exact material categories, weight specs, and step-by-step citizen sorting guidelines.
*   **Complaint Form Photo Preview & AI Classification (NEW)**: Residents can attach photos of waste spills, dirty bins, or delayed collections. The form displays a beautiful **thumbnail preview area** for the camera-captured or uploaded image. Residents can then trigger a server-side Gemini AI classification that detects the issue specifics, auto-assigns the complaint category (e.g. `spilt` or `sorting_issue`), outputs severity estimates, confidence ratings, and appends caretaker instructions.
*   **Donation Usability Audit**: Evaluates listed description arrays of citizen donations (such as vintage books or winter food packets). Predicts sanitary condition metrics and directs them to suitable NGO matches.

### 4. Interactive D3.js & Recharts Visualizations (NEW)
*   **30-Day Daily Trends**: High-fidelity Recharts area chart plotting daily volume trends of Wet Waste against Dry Recyclables.
*   **D3.js Monthly Waste Reduction Trends Chart (NEW)**: Mounts a robust, interactive, double-axis chart on the *Live Metrics* tab. Beautifully rendered in native D3.js, it maps **Diverted/Reduced Waste (Kg)** using vertical columns (left axis) against the **Overall Efficiency Rate (%)** using an emerald curve (right axis). Includes rich hovering tooltips, tick alignment, and live state binding to `impactMetrics` and hierarchy multipliers.
*   **D3.js Interactive Floor Map**: A complete floor-plan mapping engine visualizing individual flats, bins, and hot-spots with real-time reactive highlights.

### 5. Robust Caching & Offline Fallback Mode (NEW)
*   To support sanitization workers and citizens during fluctuating internet coverage, the core fetching engine implements a **complete offline caching fallback**.
*   Every successful API retrieval (of portals, notifications, alerts, complaints, donations, and metrics) is written directly into the client's `localStorage` state.
*   If a network connection fails or the server is temporarily unreachable, the application automatically switches to **Offline Cache Mode**. An ambient warnings banner is displayed, and all critical bulletins, collector queues, active alarms, and donation match logs remain fully visible and operational.

### 6. Extended Charity Matching & Pickup Scheduler (NEW)
*   **Direct NGO Claiming Desk**: Dedicated NGO claimant panel allowing registered shelters to claim specific surplus donations.
*   **Schedule Pickup Feature (NEW)**: Extends the `DonationHub` component. Donors or NGO coordinators can select a specific pickup time slot (e.g., *Monday 10:00 AM - 12:00 PM*, etc.) from an interactive scheduling dropdown directly inside the donation item card. The scheduled time slot is saved directly into the donation object, persisted in the server database, and displayed with visual calendar badges in the NGO claims list.

### 7. AI 'Urgent Attention Required' Alerts Banner (NEW)
*   An animated, high-visibility, priority alert banner is positioned directly above the notifications bulletin list inside the `ResidentPanel`.
*   This banner is automatically populated by **AI computer vision analysis of bin images**. When community lobby bins are classified as `Full` (90%) or `Critical` (100% capacity exceeded), the banner aggregates these alerts, prompts residents to hold on further disposal, and alerts caretaking teams for immediate priority emptying.

---

## 📋 Comprehensive Waste & Donation Categories

The application supports strict categorization rules to map specific waste streams and donation items cleanly:

### Waste Streams
*   **Wet Waste (Organic)**: Kitchen scraps, fruit peels, leftover organic food items. Diverted directly to composting vaults.
*   **Dry Waste (Recyclables)**: Cardboard, paper cartons, clean plastic bottles, aluminum beverage cans. Sent to dry sorting centers.
*   **Electronic Waste (E-Waste)**: AA Batteries, old charger cables, depleted cells. Flagged as hazardous; routed to specialized e-recycle vaults.
*   **Hazardous Materials**: Chemically treated materials, broken bulb glass, medical vials. Requiring sanitization protocols.

### Donation Categories
*   **Clothes & Blankets**: Clean woolens, surplus winter wear, old jackets. Paired with local night shelters.
*   **Surplus Food Packets**: Untouched dry goods, canned food, home-cooked meal boxes. Quality-audited via Gemini AI and routed to community kitchens.
*   **Books & Stationery**: School textbooks, novels, storybooks. Matched with municipal library centers and children's shelter schools.
*   **Electronics**: Working computers, keyboards, charger adapters. Given to local NGO education centers.
*   **Others**: Household toys, unused utensils, surplus bags.

---

## ♿ WCAG 2.1 Accessibility Mapping Summary
The application is strictly designed to fulfill several Level AA standards:
1.  **Speech Synthesis Narrator**: Users can hover over any critical element to trigger text-to-speech voicing of titles, warning levels, or collector dispatch steps.
2.  **Color Deficiency Accommodation**: Core CSS classes map values dynamically under four distinct deficiency filters (Protanopia, Deuteranopia, Tritanopia, and Monochromatic High-Contrast), altering SVG renders and layout borders.
3.  **Keyboard and Touch Targets**: Large, padded clickable zones (minimum 44px) with high contrasting borders (solid 2px and 4px black outlines) to support motor and visual impairments.

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
        ├── LeaderboardMetrics.tsx    # Dynamic SVG dashboard visualizers & D3 Monthly Chart
        ├── SupervisorPanel.tsx       # Caretaker announcements and resolved complaints
        ├── CollectorPanel.tsx        # Camera face simulator, floor buttons and Gemini uploads
        ├── ResidentPanel.tsx         # Targeted floor notices, AI Complaint previews, and donations
        └── DonationHub.tsx           # NGO claiming desk, scheduled pickups, and floor plan highlights
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
To bundle client files inside `dist/` and compile the TypeScript backend entry using `esbuild` into a single standalone CommonJS bundle:
```bash
npm run build
npm start
```

---

## 💎 Product Architecture & Ecosystem Integration

### 1. What Everyday Challenge Does This Solve?
Urban residential societies and corporate campuses struggle with two parallel issues: inefficient waste segregation at the source, and a lack of structured pathways to donate functional household items. 
By introducing **ticking countdown timers**, **recharts-driven time-series trend line charts**, and a dedicated, modular **AchievementBadges** gamification engine, this system transforms waste reduction from a chore into a collaborative civic game:
- The countdown timers on donation listings create a **sense of urgency**, encouraging local charities and NGOs to claim items before they expire.
- The 7-day daily waste reduction progress trend charts provide **immediate analytical visibility** to community coordinators and supervisors.
- The modular AchievementBadges system rewards residents with badges such as 'Eco Warrior' (for generous donations), 'Master Recycler' (for consecutive streaks), and 'Civic Sentinel' (for active participation in solving zone spills or issues).

### 2. How the Idea Leverages Existing System Capabilities
Our application leverages its robust pre-existing core:
- **Modular Dashboard Architecture**: Integrates the new Recharts-based daily waste reduction trend directly into the live supervisor and resident metrics layouts.
- **Dynamic Local State & DB Seeding**: Leverages the existing file-based storage and seeded schemas to retrieve, calculate, and award badges based on actual resident histories.
- **Interactive UI Design**: Enhances the robust neo-brutalist custom styling with responsive animations, tooltips, and bouncing badges.

### 3. What New Capability, Workflow, or Value Layer is Introduced
We introduce a powerful new **Stewardship Gamification & Analytical Value Layer**:
- **Urgency Workflows**: Active countdown indicators drive higher engagement and faster pickups.
- **Aesthetic Analytical Insights**: Granular time-series trends allow real-time analysis of organic versus recyclable waste recovery performance.
- **Social Proof & Achievements**: Resident profile recognition incentivizes clean habits and strengthens overall volunteer donation rates.

### 4. How the Idea Strengthens the Overall Ecosystem
By aligning citizens, facility caretakers, and neighborhood NGOs on a single platform, we create strong **network effects**:
- Faster resource claims by NGOs prevent surplus food or clothes from going to waste.
- Enhanced gamification incentives increase daily segregation logs.
- Better data visibility helps community administrators plan more efficient compost and recycling cycles.

### 5. Why Our Architecture is Uniquely Positioned to Enable This Experience
Because our platform natively bridges **real-time hardware sensors simulation**, **server-side AI vision analysis**, and **hyperlocal communication channels** into a single cohesive, accessible (WCAG 2.1) interface. It solves the technical fragmentation that usually dooms smart-city initiatives.

---

*Designed with ❤️ for inclusive, clean, and sustainable hyperlocal neighborhoods.*

App Link: https://ai.studio/apps/04e84d1b-2047-4b47-8bfe-488345090054?fullscreenApplet=true
