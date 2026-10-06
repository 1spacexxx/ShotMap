# ShotMap — Routes & Navigation Structure

Routing is hash-based (`window.location.hash`) managed inside `App` in `src/main.jsx`.

## Route Table

| Hash Route | Component | Source File | Layout Used | Summary |
| :--- | :--- | :--- | :--- | :--- |
| `` (empty) / `#top` / `#explore` / `#places` / `#how` / `#about` | `App` (Home / General Page) | `src/main.jsx` | Main `.nav` + `<footer>` | Editorial hero with featured photo & AI score, interactive world map with floating selected-place card (`#explore`), 4-column trending places grid (`#places`), filterable community picks photo grid (`#about`), top-5 leaderboard preview, 3-step "How it works" (`#how`), orange CTA banner, plus Upload & Auth modals. |
| `#leaderboard` | `LeaderboardPage` | `src/main.jsx` | `Shell` + `.sub-page.leaderboard-page` | Full community ranking table listing top photographers with rank number, avatar, username, photo count, average AI score, and total likes. Clicking a row navigates to `#user/:id`. |
| `#admin` | `AdminPage` | `src/main.jsx` | `Shell` + `.sub-page.admin-page` | Restricted admin panel with 4 KPI stat cards (`Users`, `Photos`, `Places`, `Open reports`), AI Provider settings card (mode, endpoint, model, API key), Moderation Reports list with status selector, Users management table (`Ban 7d`, `Restrict 7d`, `Delete`), and Recent Photos moderation table. |
| `#profile` | `Dashboard` | `src/dashboard.jsx` | `DashboardShell` (`Shell` + `.dashboard-side`) | Personal Studio with 8 tabs: `Overview` (profile card, 7 stat tiles, Best Shot card, Photography Performance skill bars), `Photos`, `Places`, `Saved`, `Achievements`, `Statistics`, `Notifications`, `Settings` (theme toggle, avatar upload, username edit). |
| `#photo/:id` | `PhotoPage` | `src/main.jsx` | `Shell` + `.sub-page.detail-grid` | Two-column photo analysis view: large photo on left; title, author link, `LocationPinMap`, large orange AI score block, 5 AI metric bars (`Composition`, `Lighting`, `Sharpness`, `Colors`, `Visual quality`), 5-star community rating, favorite button, and report form on right. |
| `#place/:id` | `PlacePage` | `src/main.jsx` | `Shell` + `.sub-page` | Place gallery header with city/country, photo count, average AI score, save place button, and 4-column photo grid. |
| `#user/:id` | `PublicProfilePage` | `src/public-profile.jsx` | `Shell` + `.sub-page.profile-page` | Public photographer profile with back-to-leaderboard button, hero card (avatar, username, role, Level & XP progress bar), 5 stat cards, Best Shot showcase, Shots gallery, Places list, and Achievements grid. |

---

## Router Implementation (`src/main.jsx` lines 86–96)

```jsx
const [route,setRoute]=useState(window.location.hash)
React.useEffect(()=>{
  const f=()=>setRoute(window.location.hash);
  const openLogin=()=>{window.location.hash='';setAuthMode('login')};
  window.addEventListener('hashchange',f);
  window.addEventListener('shotmap:login',openLogin);
  return()=>{
    window.removeEventListener('hashchange',f);
    window.removeEventListener('shotmap:login',openLogin)
  }
},[])
const goHome=()=>{window.location.hash='';window.scrollTo(0,0)}
if(route.startsWith('#photo/'))return <PhotoPage id={route.split('/')[1]} onHome={goHome} notify={notify}/>
if(route.startsWith('#place/'))return <PlacePage id={route.split('/')[1]} onHome={goHome} notify={notify}/>
if(route.startsWith('#user/'))return <PublicProfilePage id={route.split('/')[1]} onHome={goHome} api={api} currentUser={user} notify={notify}/>
if(route==='#leaderboard')return <LeaderboardPage onHome={goHome}/>
if(route==='#profile')return <Dashboard api={api} onHome={goHome} onLogin={()=>{window.location.hash='';setAuthMode('login')}} notify={notify} theme={theme} setTheme={setTheme}/>
if(route==='#admin' && user?.role!=='admin')return <Shell onHome={goHome}><main className="sub-page"><h1>Admin access required</h1><p className="muted">Sign in with an administrator account.</p><button className="primary" onClick={()=>setAuthMode('login')}>Log in</button></main></Shell>;
if(route==='#admin')return <AdminPage onHome={goHome} notify={notify}/>
```
