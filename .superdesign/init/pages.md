# ShotMap — Page Dependency Trees

## 1. `#` (Home / General Page)
Entry: `src/main.jsx` (`App` component, lines 47–117)
Dependencies:
- `src/styles.css`
  - `src/polish.css`
- `src/tile-map.jsx` (`MapView` as `InteractiveMap`)
  - `src/tile-map.css`
- `src/avatar.jsx` (`Avatar`)
- `src/location-picker.jsx` (`LocationPicker`)
- `src/main.jsx` (`Score`, `Notifications`)

## 2. `#leaderboard` (Leaderboard Page)
Entry: `src/main.jsx` (`LeaderboardPage` component, line 37)
Dependencies:
- `src/main.jsx` (`Shell`)
- `src/avatar.jsx` (`Avatar`)
- `src/styles.css`
  - `src/polish.css`

## 3. `#admin` (Admin Panel)
Entry: `src/main.jsx` (`AdminPage` component, line 46)
Dependencies:
- `src/main.jsx` (`Shell`)
- `src/styles.css`
  - `src/polish.css`

## 4. `#profile` (Personal Studio / User Dashboard)
Entry: `src/dashboard.jsx` (`Dashboard` component, lines 6–116)
Dependencies:
- `src/dashboard.jsx` (`DashboardShell`, `Shell`, `Overview`, `Photos`, `Places`, `Saved`, `Achievements`, `Statistics`, `Notifications`, `Settings`)
- `src/avatar.jsx` (`Avatar`)
- `src/styles.css`
  - `src/polish.css`

## 5. `#photo/:id` (Photo Analysis & Detail Page)
Entry: `src/main.jsx` (`PhotoPage` component, line 38)
Dependencies:
- `src/main.jsx` (`Shell`, `Score`)
- `src/world-map.jsx` (`LocationPinMap`)
  - `src/world-map.css`
- `src/styles.css`
  - `src/polish.css`

## 6. `#place/:id` (Place Gallery Page)
Entry: `src/main.jsx` (`PlacePage` component, line 39)
Dependencies:
- `src/main.jsx` (`Shell`)
- `src/styles.css`
  - `src/polish.css`

## 7. `#user/:id` (Public Photographer Profile Page)
Entry: `src/public-profile.jsx` (`PublicProfilePage` component, lines 13–98)
Dependencies:
- `src/public-profile.jsx` (`Shell`)
- `src/avatar.jsx` (`Avatar`)
- `src/styles.css`
  - `src/polish.css`
