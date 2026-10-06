import React, { useEffect, useState } from 'react'
import { Avatar } from './avatar.jsx'
import { Trophy, MapPin, Heart, Sparkles, ChevronLeft, Share2 } from 'lucide-react'

function Shell({ children, onHome }) {
  return (
    <>
      <header className="nav">
        <button className="brand" onClick={onHome}><span className="brand-mark">S</span><span>Shot<span>Map</span></span></button>
        <nav className="nav-links">
          <button onClick={onHome}>Explore</button>
          <button onClick={() => window.location.hash = '#leaderboard'}>Leaderboard</button>
          <button onClick={() => window.location.hash = '#profile'}>Profile</button>
        </nav>
        <div className="nav-actions">
          <button className="outline-btn" onClick={onHome}><ChevronLeft size={14}/> Back to map</button>
        </div>
      </header>
      {children}
    </>
  )
}

const fallback = id => `https://commons.wikimedia.org/wiki/Special:FilePath/${['Prague_Charles_Bridge_2021_11.jpg','Tour_Eiffel_Wikimedia_Commons.jpg','Sagrada_Familia_01.jpg','Colosseum_in_Rome,_Italy_-_April_2007.jpg'][((Number(id || 1) - 1) % 4 + 4) % 4]}?width=1600`

export function PublicProfilePage({ id, onHome, api, currentUser, notify }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true); setError('')
    try { setData(await api(`/profile?id=${id}`)) }
    catch (e) { setError(e.message || 'Profile unavailable') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])

  if (loading) return <Shell onHome={onHome}><main className="sub-page profile-page"><div className="profile-skeleton"><i/><i/><i/></div></main></Shell>
  if (error) return <Shell onHome={onHome}><main className="sub-page profile-page"><div className="profile-error"><h1>Profile unavailable</h1><p>{error}</p><button className="primary" onClick={load}>Try again</button><button className="text-btn" onClick={onHome}>Back to explore</button></div></main></Shell>

  const { user, statistics: s, photos, places, achievements } = data
  const isSelf = currentUser?.id === user.id
  const best = photos?.[0]
  const nextLevel = s.level * 250
  const progress = Math.min(100, Math.round(((s.xp % 250) / 250) * 100))

  const copyProfileLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => notify?.('Portfolio link copied')).catch(() => notify?.('Could not copy link'))
  }

  return (
    <Shell onHome={onHome}>
      <main className="sub-page profile-page">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:12}}>
          <button className="text-btn profile-back" style={{margin:0}} onClick={() => window.location.hash = '#leaderboard'}><ChevronLeft size={15}/> Leaderboard</button>
          <div style={{display:'flex',gap:10}}>
            <button className="outline-btn" onClick={copyProfileLink}><Share2 size={14}/> Share portfolio</button>
            {isSelf && <button className="primary" onClick={() => window.location.hash = '#profile'}>Open Studio</button>}
          </div>
        </div>

        <section className="profile-hero">
          <Avatar user={user} className="profile-hero-avatar"/>
          <div className="profile-hero-main">
            <div className="eyebrow"><span className="dot"/> {isSelf ? 'Your public portfolio' : 'Verified photographer'}</div>
            <h1>{user.username}</h1>
            <p className="muted">Member since {new Date(user.created_at).toLocaleDateString()} · {user.role === 'admin' ? 'Administrator' : 'Community Photographer'}</p>
          </div>
          <div className="profile-level">
            <small>Level</small><b>{s.level}</b>
            <span className="level-bar"><em style={{ width: `${progress}%` }}/></span>
            <small>{s.xp} / {nextLevel} XP</small>
          </div>
        </section>

        <section className="profile-stats">
          {[['Photos', s.photos],['Avg AI score', s.average_score || 0],['Likes', s.likes],['Places', s.places],['Achievements', s.achievements]].map(([label, value]) => (
            <div key={label}><b>{value}</b><small>{label}</small></div>
          ))}
        </section>

        {best && <section className="profile-best">
          <div className="card-label">Highest Rated Capture</div>
          <button onClick={() => window.location.hash = `#photo/${best.id}`}>
            <img src={best.image_url || fallback(best.id)} alt={best.title}/>
            <span className="profile-best-meta"><strong>{best.title}</strong><em><Sparkles size={12}/> AI {best.ai_score}/100 · <Heart size={12}/> {best.likes || 0} likes</em></span>
          </button>
        </section>}

        <section className="profile-section">
          <div className="section-head compact">
            <div>
              <div className="eyebrow">{isSelf ? 'Your photos' : 'Curated gallery by ' + user.username}</div>
              <h2>Published <em>shots.</em></h2>
            </div>
          </div>
          {photos?.length ? <div className="profile-gallery">
            {photos.map(p => <article key={p.id}>
              <button onClick={() => window.location.hash = `#photo/${p.id}`}>
                <img loading="lazy" src={p.image_url || fallback(p.id)} alt={p.title}/>
                <b>AI {p.ai_score}</b>
              </button>
              <strong>{p.title}</strong>
              {p.place_name && <small className="muted" style={{display:'block',marginTop:3,fontSize:11}}><MapPin size={11}/> {p.place_name}</small>}
            </article>)}
          </div> : <p className="muted">No photos yet.</p>}
        </section>

        {places?.length ? <section className="profile-section">
          <div className="section-head compact"><div><div className="eyebrow">Footprint</div><h2>Where they <em>shoot.</em></h2></div><MapPin size={22} color="var(--orange)"/></div>
          <div className="profile-places">
            {places.map(p => <button key={p.id} onClick={() => window.location.hash = `#place/${p.id}`}>
              <b>{p.name}</b><span>{p.city ? p.city + ', ' : ''}{p.country}</span>
            </button>)}
          </div>
        </section> : null}

        {achievements?.length ? <section className="profile-section">
          <div className="section-head compact"><div><div className="eyebrow">Milestones</div><h2>Unlocked <em>awards.</em></h2></div><Trophy size={22} color="var(--orange)"/></div>
          <div className="profile-achievements">
            {achievements.map(a => <article key={a.id}><strong>{a.icon}</strong><b>{a.name}</b><span>{a.description}</span></article>)}
          </div>
        </section> : null}
      </main>
    </Shell>
  )
}
