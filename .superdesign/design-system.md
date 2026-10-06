# ShotMap — Design System

## 1. Product Context & Architecture
**ShotMap** ("Find the best shot of every place") is a geo-based photography discovery, community ranking, and AI photo critique platform. Photographers explore iconic landmarks and hidden viewpoints on an interactive world map, upload their own shots with location tagging and AI-assisted geolocation, receive multi-metric AI scores (Composition, Lighting, Sharpness, Colors, Visual Quality), and climb the community leaderboard.

### Key Pages & User Flows
1. **General / Home Page (`#`)**:
   - **Navbar**: Sticky blurred header with rotated italic serif `S` brand mark, links (`Explore`, `Places`, `How it works`, `About`), dark/light toggle, notification popover, auth/profile/admin links, and `Upload photo` button.
   - **Hero Section**: Editorial 2-column layout (`43% / 57%`) with monospace eyebrow (`Photo discovery, reimagined`), display headline with italic serif emphasis (`Find the best shot of every place.`), dual CTAs, social proof avatars (`12,400+ photographers exploring`), and framed hero photograph with overlaid location coordinates and orange `AI SCORE 94/100` badge.
   - **01 — Explore the World (`#explore`)**: Search input (`⌘ K`) + filter button over an interactive world map (`InteractiveMap` / Leaflet or custom SVG) with floating active place preview card and map legend footer.
   - **02 — Trending Places (`#places`)**: 4-column grid of landmark cards with rank (`01–04`), AI score overlay, city/country, and photo count.
   - **03 — Community Picks (`#about`)**: Multi-select filter bar (category, type, distance radius, min AI score, sort order) + asymmetric 3-column photo grid (`1.2fr 1fr 1fr`, featured first card taller) with AI score badge, heart button, author avatar, and serif title + pagination.
   - **05 — Community Leaderboard Preview**: Top 5 photographers list with rank (`01–05`), avatar, username, photo count, AI average score, and total likes.
   - **04 — How It Works (`#how`)**: `35% / 65%` editorial split with 3 numbered steps (`01 Find your place`, `02 Upload your shot`, `03 Get your AI score`).
   - **CTA Banner & Footer**: Full-width terracotta orange banner (`Your next great shot is out there.`) + minimal footer.
   - **Modals**: Photo Upload modal (drag-and-drop dropzone, AI location guess + `LocationPicker` autocomplete, title input, authorship checkbox, `Analyze with AI` CTA) and Auth modal (Login / Register / Forgot / Reset password).
2. **Leaderboard Page (`#leaderboard`)**:
   - Dedicated community ranking page showing top photographers in a structured list/table with rank badge, avatar, username, total photos, average AI score, and likes, linking to each photographer's public profile (`#user/:id`).
3. **Admin Panel (`#admin`)**:
   - Restricted moderation & operations dashboard featuring:
     - Header with `Restricted area · SQLite` eyebrow and `Refresh` button.
     - 4 KPI Stat Cards (`Users`, `Photos`, `Places`, `Open reports`).
     - **AI Provider Configuration Card**: Mode (`Test mode` vs `External API`), Endpoint URL, Vision Model name, API Key input, and `Save AI settings` button.
     - **Reports Moderation Table**: Report ID & reason, photo title & reporter username, current status badge, and status dropdown (`open`, `reviewed`, `resolved`, `rejected`).
     - **Users Management Table**: User ID & username, email, role (`admin` / `user`), active/banned/restricted status, and quick moderation actions (`Ban 7d`, `Restrict 7d`, `Delete`).
     - **Recent Photos Moderation Table**: Photo ID & title, author, place name, AI score, likes, and `Delete` action.
4. **Personal Studio / User Dashboard (`#profile`)**:
   - Sidebar + content workspace with 8 tabs: `Overview`, `Photos`, `Places`, `Saved`, `Achievements`, `Statistics`, `Notifications`, `Settings`.
5. **Photo Detail & AI Analysis Page (`#photo/:id`)**:
   - 2-column split (`1.15fr 0.85fr`): large high-res photo on left; title, author link, `LocationPinMap`, large `AI Score` block, 5 progress bars (`Composition`, `Lighting`, `Sharpness`, `Colors`, `Visual quality`), 5-star community rating, favorite toggle, and report drawer on right.
6. **Place Gallery Page (`#place/:id`)**:
   - Landmark overview header with city/country, total photos, average AI score, `Save place` button, and 4-column photo grid.
7. **Public Photographer Profile (`#user/:id`)**:
   - Public portfolio with hero banner (avatar, username, role, Level badge & XP bar), 5 KPI counters, Best Shot highlight, Shots gallery, Places badges, and Achievements cards.

---

## 2. Branding & Visual Identity

### Aesthetic Direction
**Warm Editorial Cartography** — blends fine-art photography magazine typography (tightly tracked `Inter` display headlines paired with italic `Georgia` serif accents and technical `DM Mono` metadata) with tactile botanical/cartographic colors (warm paper, deep forest charcoal ink, terracotta orange, and muted sage green).

### Color Tokens
| Token | Light Mode (`:root`) | Dark Mode (`html[data-theme="dark"]`) | Usage |
| :--- | :--- | :--- | :--- |
| `--paper` | `#f3f3ee` | `#111310` | Primary page background |
| `--surface` | `#ffffff` | `#1b211e` | Cards, tables, inputs, modals |
| `--surface-muted` | `#eef1ec` | `#151b18` | Alternating section backgrounds, sidebar |
| `--surface-raised` | `#fbfcf9` | `#202722` | Elevated headers, admin header, profile banner |
| `--ink` | `#18201d` | `#eceee8` | Primary text, primary buttons (light mode) |
| `--muted` | `#747b76` | `#a2a89b` | Secondary copy, captions, labels |
| `--line` | `#d9ddd6` | `#343a30` | Borders, dividers, table rules |
| `--orange` | `#e85f32` | `#e5a35b` | Brand accent, AI score badges, active states, CTA |
| `--orange-light` | `#f9e4d9` | `#3b3021` | Active sidebar highlight & row hover tint |
| `--green` | `#56716a` | `#41534b` | Avatar backgrounds, map land accents |

### Typography
- **Heading & UI Font**: `'Inter', system-ui, sans-serif`
  - Hero Display `h1`: `clamp(48px, 5.4vw, 78px)`, weight `600`, line-height `0.98`, letter-spacing `-4px`
  - Page `h1`: `48px–55px`, weight `700`, letter-spacing `-2.8px` to `-3px`
  - Section `h2`: `43px`, weight `700`, letter-spacing `-2.5px`
- **Editorial Accent Font**: `Georgia, 'Times New Roman', serif` (`var(--serif)`)
  - Used for `<em>` words inside `h1` and `h2`, photo titles (`.shot-title`),hero image caption title, and the tilted `S` brand mark.
- **Technical Metadata Font**: `'DM Mono', monospace`
  - Used for `.eyebrow` (`10px`, uppercase, `letter-spacing: 1.5px`), AI scores, coordinates, rank numbers (`01`, `02`), and keyboard shortcuts (`⌘ K`).

### Spacing, Borders & Elevation
- **Container Widths**: `1440px` outer sections, `1280px` content container (`5.8%` horizontal padding).
- **Border Radius**:
  - `--radius-sm`: `10px` (buttons, inputs, selects, small tiles)
  - `--radius-md`: `16px` (cards, map container, photo tiles, score blocks)
  - `--radius-lg`: `24px` (modals, detail photo, hero banners)
- **Shadows**:
  - `--shadow-card`: `0 18px 48px rgba(29, 45, 37, .08), 0 2px 8px rgba(29, 45, 37, .04)`
  - Primary Button: `0 8px 18px rgba(24, 32, 29, .12)`

### Motion & Micro-interactions
- Smooth `0.2s ease` transitions on buttons, links, inputs, and cards.
- Card hover lift: `transform: translateY(-4px)` on `.place-card` and `.shot-card`, with inner image scale `transform: scale(1.04)` over `0.35s–0.5s`.
- Primary button hover lift: `transform: translateY(-2px)` with deepened shadow.
