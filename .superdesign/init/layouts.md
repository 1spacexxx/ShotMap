# ShotMap — Shared Layout Components

---

## 1. Main Landing Page Navbar & Footer (`src/main.jsx`)
- **File Path**: `src/main.jsx` (lines 97 and 106)
- **Description**: Top sticky/blurred navigation bar with rotated italic serif `S` brand mark, section links (`Explore`, `Places`, `How it works`, `About`), theme toggle (`☀`/`☾`), notification bell with badge, auth/profile/admin buttons, and primary `Upload photo` CTA. Footer includes brand mark, tagline, and quick links.

```jsx
{/* Main Landing Navbar (src/main.jsx line 97) */}
<header className="nav">
  <a className="brand" href="#top">
    <span className="brand-mark">S</span>
    <span>Shot<span>Map</span></span>
  </a>
  <nav className={menu ? 'nav-links open' : 'nav-links'}>
    <a href="#explore" onClick={() => setMenu(false)}>Explore</a>
    <a href="#places" onClick={() => setMenu(false)}>Places</a>
    <a href="#how" onClick={() => setMenu(false)}>How it works</a>
    <a href="#about" onClick={() => setMenu(false)}>About</a>
  </nav>
  <div className="nav-actions">
    <button className="theme-toggle" aria-label="Toggle theme" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?'☀':'☾'}</button>
    {user&&<button className="notification-btn" aria-label="Notifications" aria-expanded={showNotifications} onClick={()=>setShowNotifications(v=>!v)}><Bell size={17}/>{unreadCount>0&&<span className="badge">{unreadCount}</span>}</button>}
    <button className="login" onClick={handleLogin}>{user ? user.username : 'Log in'}</button>
    {user&&<>
      <button className="login" onClick={()=>window.location.hash='#profile'}>Profile</button>
      {user.role==='admin'&&<button className="login" onClick={()=>window.location.hash='#admin'}>Admin</button>}
    </>}
    <button className="upload-btn" onClick={() => user ? setShowUpload(true) : setAuthMode('login')}>
      <Upload size={15}/> {user ? 'Upload photo' : 'Log in to upload'}
    </button>
    <button className="menu-btn" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
    {showNotifications&&<Notifications onClose={()=>setShowNotifications(false)} notify={notify}/>}
  </div>
</header>

{/* Main Footer (src/main.jsx line 106) */}
<footer>
  <div className="brand">
    <span className="brand-mark">S</span>
    <span>Shot<span>Map</span></span>
  </div>
  <span>Find beauty. Frame it. Share it.</span>
  <div>
    <a href="#explore">Explore</a>
    <a href="#how">How it works</a>
    <a href="#top">Back to top ↑</a>
  </div>
</footer>
```

---

## 2. Sub-Page `Shell` (`src/main.jsx`)
- **File Path**: `src/main.jsx` (line 36)
- **Description**: Minimal top navigation bar used across sub-pages (`#leaderboard`, `#photo/:id`, `#place/:id`, `#admin`) with brand mark and `Explore` / `Leaderboard` / `Profile` links.

```jsx
function Shell({ children, onHome }) {
  return <>
    <header className="nav">
      <button className="brand" onClick={onHome}>
        <span className="brand-mark">S</span>
        <span>Shot<span>Map</span></span>
      </button>
      <nav className="nav-links">
        <button onClick={onHome}>Explore</button>
        <button onClick={()=>window.location.hash='#leaderboard'}>Leaderboard</button>
        <button onClick={()=>window.location.hash='#profile'}>Profile</button>
      </nav>
    </header>
    {children}
  </>
}
```

---

## 3. `DashboardShell` and `Shell` (`src/dashboard.jsx`)
- **File Path**: `src/dashboard.jsx` (lines 39–40)
- **Description**: Two-column layout (`220px` sidebar + `1fr` content area) wrapped inside top `Shell`. Sidebar renders `ShotMap` wordmark and 8 vertical tab buttons (`Overview`, `Photos`, `Places`, `Saved`, `Achievements`, `Statistics`, `Notifications`, `Settings`).

```jsx
function DashboardShell({children,onHome,onLogin,nav,tab,setTab}) {
  return (
    <Shell onHome={onHome}>
      <main className="dashboard">
        <aside className="dashboard-side">
          <div className="dashboard-brand">Shot<span>Map</span></div>
          {nav.map(x=><button className={tab===x?'active':''} key={x} onClick={()=>setTab(x)}>{x}</button>)}
        </aside>
        {children}
      </main>
    </Shell>
  )
}

function Shell({children,onHome}) {
  return <>
    <header className="nav">
      <button className="brand" onClick={onHome}>
        <span className="brand-mark">S</span>
        <span>Shot<span>Map</span></span>
      </button>
      <nav className="nav-links">
        <button onClick={onHome}>Explore</button>
        <button onClick={()=>window.location.hash='#leaderboard'}>Leaderboard</button>
      </nav>
    </header>
    {children}
  </>
}
```

---

## 4. Public Profile `Shell` (`src/public-profile.jsx`)
- **File Path**: `src/public-profile.jsx` (lines 7–9)
- **Description**: Top navigation bar for public photographer profile pages (`#user/:id`).

```jsx
function Shell({ children, onHome }) {
  return <>
    <header className="nav">
      <button className="brand" onClick={onHome}>
        <span className="brand-mark">S</span>
        <span>Shot<span>Map</span></span>
      </button>
      <nav className="nav-links">
        <button onClick={onHome}>Explore</button>
        <button onClick={() => window.location.hash = '#leaderboard'}>Leaderboard</button>
      </nav>
    </header>
    {children}
  </>
}
```
