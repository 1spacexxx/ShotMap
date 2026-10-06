# ShotMap — Extractable Components

## Layout Components

### 1. `MainNavbar`
- Source: `src/main.jsx` (line 97)
- Category: `layout`
- Description: Main top navigation bar with brand mark (`S` + `ShotMap`), section links (`Explore`, `Places`, `How it works`, `About`), theme toggle, notifications bell, auth/profile/admin links, and `Upload photo` primary CTA.
- Extractable props: `activeItem` (string, default: `"explore"`), `isLoggedIn` (boolean, default: `true`), `isAdmin` (boolean, default: `false`), `username` (string, default: `"Maya Chen"`), `unreadCount` (number, default: `2`)
- Hardcoded: Brand mark `S` styling, nav item labels, upload CTA icon & styling, CSS classes.

### 2. `SubPageShell`
- Source: `src/main.jsx` (line 36) / `src/dashboard.jsx` (line 40) / `src/public-profile.jsx` (line 7)
- Category: `layout`
- Description: Shared header bar for sub-pages (`#leaderboard`, `#admin`, `#photo/:id`, `#place/:id`, `#user/:id`, `#profile`) with brand mark and `Explore`, `Leaderboard`, `Profile` navigation links.
- Extractable props: `activePage` (string, default: `"explore"`)
- Hardcoded: Brand mark `S`, link labels (`Explore`, `Leaderboard`, `Profile`), header container styles.

### 3. `DashboardSidebar`
- Source: `src/dashboard.jsx` (line 39)
- Category: `layout`
- Description: Left sidebar navigation for Personal Studio (`#profile`) with `ShotMap` wordmark and 8 section buttons (`Overview`, `Photos`, `Places`, `Saved`, `Achievements`, `Statistics`, `Notifications`, `Settings`).
- Extractable props: `activeTab` (string, default: `"Overview"`)
- Hardcoded: Brand wordmark, 8 navigation tab names, active/hover styles.

### 4. `SiteFooter`
- Source: `src/main.jsx` (line 106)
- Category: `layout`
- Description: Page footer with `ShotMap` brand mark, tagline `"Find beauty. Frame it. Share it."`, and anchor links (`Explore`, `How it works`, `Back to top ↑`).
- Extractable props: none (static layout component)
- Hardcoded: Brand mark, tagline, footer links.

---

## Basic Components

### 5. `Avatar`
- Source: `src/avatar.jsx`
- Category: `basic`
- Description: Circular user avatar with image or 2-letter uppercase initials fallback.
- Extractable props: `username` (string, default: `"MC"`), `avatarUrl` (string, default: `""`)
- Hardcoded: Circle border radius, fallback green background (`var(--green)`), typography.

### 6. `ScoreBadge`
- Source: `src/main.jsx` (line 35)
- Category: `basic`
- Description: AI score readout (`94/100`) used in hero, photo detail, and cards.
- Extractable props: `value` (number, default: `94`), `large` (boolean, default: `false`)
- Hardcoded: `/100` suffix, monospace/display typography.
