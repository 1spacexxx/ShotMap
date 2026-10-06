import React, { useState } from 'react'

export function Avatar({ user, className = '', style, ...props }) {
  const [failedSource, setFailedSource] = useState(null)
  const username = typeof user?.username === 'string' ? user.username.trim() : ''
  const source = typeof user?.avatar_url === 'string' ? user.avatar_url.trim() : ''
  const words = username.split(/\s+/).filter(Boolean)
  const initials = (words.length > 1 ? words[0][0] + words[words.length - 1][0] : username.slice(0, 2)).toUpperCase() || '?'
  return <span
    {...props}
    className={className}
    role="img"
    aria-label={username ? `${username}'s avatar` : 'User avatar'}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', borderRadius: '50%', ...(!className ? { width: 40, height: 40, background: 'var(--green, #315b4d)', color: '#fff' } : {}), ...style }}
  >
    {source && source !== failedSource ? <img key={source} src={source} alt="" onError={() => setFailedSource(source)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : initials}
  </span>
}

export default Avatar
