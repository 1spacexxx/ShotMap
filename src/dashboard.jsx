import React, { useEffect, useMemo, useState } from 'react'
import { Avatar } from './avatar.jsx'
import { LayoutGrid, Image as ImageIcon, MapPin, Heart, Trophy, BarChart3, Bell, Settings as SettingsIcon, Sparkles, ChevronLeft, Search, ArrowUpRight, Trash2, Shield, Camera, Users } from 'lucide-react'

const fallback = id => `https://commons.wikimedia.org/wiki/Special:FilePath/${['Prague_Charles_Bridge_2021_11.jpg','Tour_Eiffel_Wikimedia_Commons.jpg','Sagrada_Familia_01.jpg','Colosseum_in_Rome,_Italy_-_April_2007.jpg'][((Number(id || 1) - 1) % 4 + 4) % 4]}?width=1600`

const navIcons = {
  Overview: LayoutGrid,
  Photos: ImageIcon,
  Places: MapPin,
  Saved: Heart,
  Achievements: Trophy,
  Statistics: BarChart3,
  Notifications: Bell,
  Settings: SettingsIcon
}

export function Dashboard({ api, onHome, onLogin, notify, theme, setTheme }) {
  const [tab, setTab] = useState('Overview')
  const [data, setData] = useState(null)
  const [photos, setPhotos] = useState([])
  const [places, setPlaces] = useState([])
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('created_at')
  const [minScore, setMinScore] = useState('0')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [profile, stats, mine, myPlaces, notices] = await Promise.all([
        api('/profile'), api('/me/statistics'), api(`/me/photos?sort=${sort}&min_score=${minScore}`), api('/me/places'), api('/me/notifications')
      ])
      setData({...profile, stats: stats.statistics}); setPhotos(mine.photos); setPlaces(myPlaces.places); setNotifications(notices.notifications)
      return profile
    } catch (e) { setError(e.message || 'Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [sort, minScore])

  const quickLogin = async (email, password) => {
    try {
      const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      if (res.token) {
        localStorage.setItem('shotmap_token', res.token)
        window.dispatchEvent(new CustomEvent('shotmap:profile-updated', { detail: { user: res.user } }))
        notify?.(`Welcome, ${res.user.username}`)
        await load()
      }
    } catch (e) { notify?.(e.message) }
  }

  const remove = async id => { if (!window.confirm('Delete this photo?')) return; try { await api(`/photos/${id}`, {method:'DELETE'}); await load(); notify('Photo deleted') } catch (e) { notify(e.message) } }
  const markRead = async id => { try { await api(`/notifications/${id}/read`, {method:'PATCH'}); setNotifications(items => items.map(x => x.id === id ? {...x, read_at: new Date().toISOString()} : x)) } catch (e) { notify(e.message) } }
  const markAllRead = async () => { try { await api('/notifications/read', {method:'POST'}); setNotifications(items => items.map(x => ({...x, read_at: x.read_at || new Date().toISOString()}))); notify('All notifications marked read') } catch (e) { notify(e.message) } }
  const best = useMemo(() => photos.reduce((a, b) => (b.ai_score > (a?.ai_score || -1) ? b : a), null), [photos])
  const unreadCount = useMemo(() => notifications.filter(n => !n.read_at).length, [notifications])
  const nav = ['Overview','Photos','Places','Saved','Achievements','Statistics','Notifications','Settings']

  if (loading && !data) return <DashboardShell onHome={onHome} onLogin={onLogin} nav={nav} tab={tab} setTab={setTab} unreadCount={unreadCount} theme={theme} setTheme={setTheme}><div className="dashboard-skeleton"><i/><i/><i/><i/></div></DashboardShell>
  if (error && !data) return (
    <DashboardShell onHome={onHome} onLogin={onLogin} nav={nav} tab={tab} setTab={setTab} unreadCount={unreadCount} theme={theme} setTheme={setTheme}>
      <div className="dashboard-error studio-login-gate">
        <div className="eyebrow"><span className="dot"/> Personal studio</div>
        <h1>Sign in to your Studio</h1>
        <p className="muted">{error}</p>
        <div className="studio-quick-auth">
          <button type="button" className="primary" onClick={() => quickLogin('demo@shotmap.local', 'demo123')}>
            ⚡ Quick sign in (Photographer)
          </button>
          <button type="button" className="outline-btn" onClick={() => quickLogin('admin@shotmap.local', 'admin123')}>
            <Shield size={14}/> Quick sign in (Admin)
          </button>
          {error.toLowerCase().includes('login') || error.toLowerCase().includes('auth')
            ? <button className="outline-btn" onClick={onLogin}>Log in manually</button>
            : <button className="outline-btn" onClick={load}>Try again</button>}
          <button className="text-btn" onClick={onHome}>Back to explore</button>
        </div>
      </div>
    </DashboardShell>
  )

  const content = tab === 'Photos'
    ? <Photos photos={photos} sort={sort} setSort={setSort} minScore={minScore} setMinScore={setMinScore} remove={remove}/>
    : tab === 'Places'
    ? <Places places={places}/>
    : tab === 'Saved'
    ? <Saved data={data}/>
    : tab === 'Achievements'
    ? <Achievements items={data.achievements}/>
    : tab === 'Statistics'
    ? <Statistics stats={data.stats}/>
    : tab === 'Notifications'
    ? <Notifications items={notifications} markRead={markRead} markAllRead={markAllRead}/>
    : tab === 'Settings'
    ? <Settings theme={theme} setTheme={setTheme} notify={notify} api={api} data={data} onSaved={load}/>
    : <Overview data={data} photos={photos} best={best} setTab={setTab}/>

  return (
    <DashboardShell onHome={onHome} nav={nav} tab={tab} setTab={setTab} unreadCount={unreadCount} theme={theme} setTheme={setTheme}>
      <section className="dashboard-content">
        <header className="dashboard-top">
          <div>
            <div className="eyebrow"><span className="dot"/> Personal studio</div>
            <h1>{tab}</h1>
          </div>
          <div className="dashboard-top-actions">
            {data?.user?.id && (
              <button className="outline-btn" onClick={() => window.location.hash = `#user/${data.user.id}`}>
                Public portfolio <ArrowUpRight size={14}/>
              </button>
            )}
            {data?.user?.role === 'admin' && (
              <button className="outline-btn" onClick={() => window.location.hash = '#admin'}>
                <Shield size={14}/> Admin panel
              </button>
            )}
            <button className="outline-btn" onClick={load}>Refresh</button>
          </div>
        </header>
        {content}
      </section>
    </DashboardShell>
  )
}

function DashboardShell({children,onHome,onLogin,nav,tab,setTab,unreadCount,theme,setTheme}) {
  return (
    <Shell onHome={onHome} theme={theme} setTheme={setTheme}>
      <main className="dashboard">
        <aside className="dashboard-side">
          <div className="dashboard-brand">Shot<span>Map</span> <small className="studio-tag">STUDIO</small></div>
          {nav.map(x => {
            const Icon = navIcons[x] || LayoutGrid
            return (
              <button className={tab===x?'active':''} key={x} onClick={()=>setTab(x)}>
                <span className="dash-nav-item"><Icon size={16}/> {x}</span>
                {x === 'Notifications' && unreadCount > 0 && <em className="dash-nav-badge">{unreadCount}</em>}
              </button>
            )
          })}
        </aside>
        {children}
      </main>
    </Shell>
  )
}

function Shell({children,onHome,theme,setTheme}) {
  return (
    <>
      <header className="nav sub-nav">
        <button className="brand" onClick={onHome}><span className="brand-mark">S</span><span>Shot<span>Map</span></span></button>
        <nav className="nav-links sub-nav-links">
          <button onClick={onHome}>Explore</button>
          <button onClick={()=>window.location.hash='#leaderboard'}>Leaderboard</button>
          <button className="active-nav" onClick={()=>window.location.hash='#profile'}>Profile</button>
          <button onClick={()=>window.location.hash='#admin'}>Admin</button>
        </nav>
        <div className="nav-actions">
          {setTheme && (
            <button className="theme-toggle" aria-label="Toggle theme" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>
              {theme==='dark'?'☀':'☾'}
            </button>
          )}
          <button className="outline-btn" onClick={onHome}><ChevronLeft size={14}/> Back to map</button>
        </div>
      </header>
      {children}
      <nav className="mobile-bottom-dock" aria-label="Mobile quick navigation">
        <button type="button" onClick={onHome}><MapPin size={16}/><span>Map</span></button>
        <button type="button" onClick={()=>window.location.hash='#leaderboard'}><Trophy size={16}/><span>Leaders</span></button>
        <button type="button" className="dock-upload-btn" onClick={onHome}><Camera size={16}/><span>Shoot</span></button>
        <button type="button" className="active" onClick={()=>window.location.hash='#profile'}><Users size={16}/><span>Studio</span></button>
        <button type="button" onClick={()=>window.location.hash='#admin'}><Shield size={16}/><span>Admin</span></button>
      </nav>
    </>
  )
}

function Overview({data,photos,best,setTab}) {
  const nextXp = (data.stats.level || 1) * 250
  const xpProgress = Math.min(100, Math.round(((data.stats.xp || 0) % 250) / 250 * 100))

  return (
    <>
      <div className="dashboard-profile">
        <Avatar user={data.user} className="profile-avatar"/>
        <div className="dashboard-profile-info">
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <h2>{data.user.username}</h2>
            <span className="studio-level-pill"><Sparkles size={12}/> Level {data.stats.level}</span>
          </div>
          <p className="muted">Member since {new Date(data.user.created_at).toLocaleDateString()} · {data.user.role === 'admin' ? 'Administrator' : 'Verified Photographer'}</p>
          <div className="studio-xp-bar-wrap">
            <div className="studio-xp-bar"><em style={{width:`${xpProgress}%`}}/></div>
            <small>{data.stats.xp} / {nextXp} XP to Level {(data.stats.level || 1) + 1}</small>
          </div>
        </div>
        <div className="dashboard-profile-actions">
          <button className="outline-btn" onClick={()=>setTab('Photos')}>Manage photos</button>
          <button className="outline-btn" onClick={()=>setTab('Settings')}>Edit profile</button>
        </div>
      </div>

      <div className="dashboard-stats">
        {[
          ['Photos',data.stats.photos],
          ['Likes',data.stats.likes],
          ['AI Score',data.stats.average_ai],
          ['Places',data.stats.places],
          ['Achievements',data.stats.achievements],
          ['XP',data.stats.xp],
          ['Level',data.stats.level]
        ].map(([label,value])=>(
          <div key={label}><small>{label}</small><b>{value}</b></div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card best-shot">
          <div className="card-label">Best shot</div>
          {best ? (
            <button onClick={()=>window.location.hash=`#photo/${best.id}`}>
              <img src={best.image_url||fallback(best.id)} alt={best.title}/>
              <div className="best-shot-footer">
                <div>
                  <strong>{best.title}</strong>
                  <span>{best.place_name || 'Featured location'} · <Heart size={12} color="var(--orange)"/> {best.likes||0} likes</span>
                </div>
                <b className="best-shot-score">AI {best.ai_score}</b>
              </div>
            </button>
          ) : (
            <p className="muted">Upload your first photo to unlock AI critique insights.</p>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-label">Photography performance</div>
          {[
            ['Composition','composition'],
            ['Lighting','lighting'],
            ['Sharpness','sharpness'],
            ['Colors','colors'],
            ['Visual Quality','visual_quality']
          ].map(([label,key])=>(
            <div className="skill" key={key}>
              <span>{label}</span>
              <b>{data.stats[key]}</b>
              <i><em style={{width:`${data.stats[key]}%`}}/></i>
            </div>
          ))}
          <div className="studio-coaching-callout">
            <Sparkles size={15} color="var(--orange)"/>
            <span>Strongest skill: <b>{data.stats.strongest}</b>. Focus on <b>{data.stats.weakest}</b> on your next shoot to boost your overall rating.</span>
          </div>
        </div>
      </div>
    </>
  )
}

function Photos({photos,sort,setSort,minScore,setMinScore,remove}) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    if (!q.trim()) return photos
    const lower = q.trim().toLowerCase()
    return photos.filter(p => `${p.title} ${p.place_name || ''}`.toLowerCase().includes(lower))
  }, [photos, q])

  return (
    <>
      <div className="dashboard-filters">
        <div className="search" style={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:999,padding:'8px 14px'}}>
          <Search size={14}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search your shots..."/>
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="created_at">Newest</option>
          <option value="ai_score">Highest AI Score</option>
          <option value="likes">Most Likes</option>
          <option value="community_score">Community Rating</option>
        </select>
        <select value={minScore} onChange={e=>setMinScore(e.target.value)}>
          <option value="0">All scores</option>
          <option value="90">90+</option>
          <option value="80">80+</option>
          <option value="70">70+</option>
        </select>
      </div>
      <div className="dashboard-gallery">
        {filtered.map(p=>(
          <article key={p.id} className="studio-photo-card">
            <button onClick={()=>window.location.hash=`#photo/${p.id}`}>
              <img loading="lazy" src={p.image_url||fallback(p.id)} alt={p.title}/>
              <b>AI {p.ai_score}</b>
            </button>
            <div className="studio-photo-meta">
              <div>
                <strong>{p.title}</strong>
                <span><MapPin size={11}/> {p.place_name||'Unknown place'} · ♥ {p.likes||0} likes</span>
              </div>
              <button className="delete-link" onClick={()=>remove(p.id)} title="Delete photo"><Trash2 size={13}/> Delete</button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length&&<p className="muted">No photos match this filter.</p>}
    </>
  )
}

function Places({places}) {
  if (!places?.length) return <p className="muted">No places visited or saved yet.</p>
  return (
    <div className="dashboard-place-list">
      {places.map(p=>(
        <button key={p.id} onClick={()=>window.location.hash=`#place/${p.id}`}>
          <div>
            <b>{p.name}</b>
            <span><MapPin size={12}/> {p.city}, {p.country}</span>
          </div>
          <em>{p.photos} photos · ★ AI {p.average_score}</em>
        </button>
      ))}
    </div>
  )
}

function Saved({data}) {
  return (
    <>
      <h2>Saved photos</h2>
      {data.favorites?.length ? (
        <div className="dashboard-gallery" style={{marginBottom:32}}>
          {data.favorites.map(p=>(
            <article key={p.id} className="studio-photo-card">
              <button onClick={()=>window.location.hash=`#photo/${p.id}`}>
                <img src={p.image_url||fallback(p.id)} alt={p.title || 'Saved photo'}/>
                <b>AI {p.ai_score}</b>
              </button>
              {p.title && <strong style={{padding:'6px 4px 0'}}>{p.title}</strong>}
            </article>
          ))}
        </div>
      ) : <p className="muted" style={{marginBottom:28}}>You haven't saved any photos to favorites yet.</p>}
      <h2>Saved places</h2>
      <Places places={data.saved_places}/>
    </>
  )
}

function Achievements({items}) {
  return (
    <div className="dashboard-achievements">
      {items.map(a=>(
        <article key={a.id}>
          <strong>{a.icon}</strong>
          <b>{a.name}</b>
          <span>{a.description}</span>
          <em>Unlocked · +50 XP</em>
        </article>
      ))}
      {!items.length&&<p className="muted">Your achievements will appear here.</p>}
    </div>
  )
}

function Statistics({stats}) {
  return (
    <div className="dashboard-card statistics-card">
      <div className="card-label">AI Telemetry Breakdown</div>
      <h2>Your Photography</h2>
      {[
        ['Composition','composition'],
        ['Lighting','lighting'],
        ['Sharpness','sharpness'],
        ['Colors','colors'],
        ['Visual Quality','visual_quality']
      ].map(([label,key])=>(
        <div className="skill" key={key}>
          <span>{label}</span>
          <b>{stats[key]}</b>
          <i><em style={{width:`${stats[key]}%`}}/></i>
        </div>
      ))}
      <div className="studio-coaching-callout" style={{marginTop:18}}>
        <Sparkles size={15} color="var(--orange)"/>
        <p className="muted" style={{margin:0}}>Strongest skill: <b>{stats.strongest}</b>. Focus on <b>{stats.weakest}</b> to improve.</p>
      </div>
    </div>
  )
}

function Notifications({items,markRead,markAllRead}) {
  const unread = items.filter(n => !n.read_at).length
  return (
    <>
      {unread > 0 && (
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
          <button className="outline-btn" onClick={markAllRead}>Mark all {unread} read</button>
        </div>
      )}
      <div className="dashboard-notices">
        {items.map(n=>(
          <button className={n.read_at?'read':''} key={n.id} onClick={()=>markRead(n.id)}>
            <b>{n.type}</b>
            <span>{n.message}</span>
            <small>{new Date(n.created_at).toLocaleString()}</small>
          </button>
        ))}
        {!items.length&&<p className="muted">No notifications yet.</p>}
      </div>
    </>
  )
}

function Settings({theme,setTheme,notify,api,data,onSaved}) {
  const [username,setUsername] = useState(data.user.username)
  const [avatar,setAvatar] = useState(data.user.avatar_url || '')
  const [saving,setSaving] = useState(false)
  const [reading,setReading] = useState(false)
  const [error,setError] = useState('')
  const [status,setStatus] = useState('')
  useEffect(() => { setUsername(data.user.username); setAvatar(data.user.avatar_url || '') }, [data.user.username, data.user.avatar_url])
  const changed = username !== data.user.username || avatar !== (data.user.avatar_url || '')
  const clearFeedback = () => { setError(''); setStatus('') }
  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next); localStorage.setItem('shotmap_theme',next); document.documentElement.dataset.theme = next
    try { await api('/me/settings',{method:'PUT',body:JSON.stringify({theme:next,public_profile:true,show_city:true,show_activity:true,allow_ratings:true})}); notify('Theme saved') }
    catch(e) { notify(e.message) }
  }
  const pick = e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    clearFeedback()
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) { setError('Choose a JPG, PNG or WebP image.'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Avatar must be 2 MB or smaller.'); return }
    setReading(true)
    const reader = new FileReader()
    reader.onload = () => { setAvatar(String(reader.result)); setReading(false); setStatus('Preview ready. Save profile to publish your avatar.') }
    reader.onerror = () => { setReading(false); setError('Could not read this image. Please choose another file.') }
    reader.onabort = () => setReading(false)
    reader.readAsDataURL(file)
  }
  const save = async e => {
    e.preventDefault()
    if (saving || reading) return
    clearFeedback()
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) { setError('Use 3–32 letters, numbers or underscores for your username.'); return }
    setSaving(true)
    try {
      const payload = { username }
      // Do not resubmit a stored /uploads URL on a username-only edit.
      if (avatar !== (data.user.avatar_url || '')) payload.avatar_url = avatar
      const result = await api('/profile',{method:'PUT',body:JSON.stringify(payload)})
      setAvatar(result.user.avatar_url || '')
      setUsername(result.user.username)
      window.dispatchEvent(new CustomEvent('shotmap:profile-updated', { detail: { user: result.user } }))
      const refreshed = await onSaved()
      setStatus(refreshed ? 'Profile saved. Your avatar is now visible on your profile and leaderboard.' : 'Profile saved, but the dashboard could not refresh. Try Refresh.')
      notify('Profile saved')
    } catch(e) { setError(e.message || 'Could not save your profile. Please try again.') }
    finally { setSaving(false) }
  }
  return <div className="dashboard-card settings-card">
    <h2>Appearance</h2><button className="outline-btn" onClick={toggleTheme}>{theme==='dark'?'Switch to light mode':'Switch to dark mode'}</button>
    <h2>Profile</h2><p className="muted">Make your profile yours. Your avatar follows you across the community.</p>
    <form onSubmit={save} aria-busy={saving || reading} style={{display:'grid',gap:18}}>
      <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap',padding:18,border:'1px solid var(--line)',borderRadius:18}}>
        <Avatar user={{username,avatar_url:avatar}} className="profile-avatar" style={{width:88,height:88}}/>
        <div style={{flex:'1 1 200px'}}><strong>{username || 'Your avatar'}</strong><p id="avatar-help" className="muted">JPG, PNG or WebP · up to 2 MB · cropped to a circle</p>
          <label className="settings-label">Choose avatar<input className="settings-file" aria-describedby="avatar-help" type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} disabled={saving || reading}/></label>
          {avatar !== (data.user.avatar_url || '') && <button type="button" className="text-btn" disabled={saving || reading} onClick={()=>{setAvatar(data.user.avatar_url || ''); clearFeedback()}}>Undo avatar change</button>}
        </div>
      </div>
      <label className="settings-label">Username<input className="auth-input" value={username} onChange={e=>{setUsername(e.target.value); clearFeedback()}} minLength={3} maxLength={32} required pattern="[a-zA-Z0-9_]{3,32}" aria-describedby="username-help" disabled={saving || reading}/></label>
      <small id="username-help" className="muted">3–32 letters, numbers or underscores.</small>
      {error && <p className="error-box" role="alert">{error}</p>}
      <p className="muted" role="status" aria-live="polite" style={{margin:0}}>{reading ? 'Preparing avatar preview…' : saving ? 'Saving your profile…' : status || (changed ? 'You have unsaved changes.' : 'Your profile is up to date.')}</p>
      <button className="primary" type="submit" disabled={saving || reading || !changed} style={{justifySelf:'start',opacity:saving || reading || !changed ? .6 : 1}}>{saving?'Saving…':'Save profile'}</button>
    </form>
  </div>
}
