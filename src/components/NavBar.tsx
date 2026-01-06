import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/UserContext'
import { loadTeamDataById, getPlayerPhotoThumb } from '../utils/teamData'
import './NavBar.css'

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const { user } = useAuth()

  // Memoize the key to prevent effect re-runs on object reference changes
  const avatarKey = useMemo(
    () => `${user?.favorite_team_id}|${user?.favorite_player_id}|${user?.avatar_url}`,
    [user?.favorite_team_id, user?.favorite_player_id, user?.avatar_url]
  )

  useEffect(() => {
    let cancelled = false

    const loadAvatar = async () => {
      if (!user || !user.favorite_team_id || !user.favorite_player_id) {
        setAvatarUrl(user?.avatar_url ?? null)
        return
      }
      try {
        const teamData = await loadTeamDataById(user.favorite_team_id)
        if (cancelled) return
        const thumb = getPlayerPhotoThumb(teamData, user.favorite_player_id)
        setAvatarUrl(thumb ?? user.avatar_url ?? null)
      } catch (err) {
        if (!cancelled) {
          setAvatarUrl(user?.avatar_url ?? null)
        }
      }
    }

    loadAvatar()

    return () => {
      cancelled = true
    }
  }, [avatarKey])

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <a href="/">Daily Picture</a> 
      </div>

      <button
        className="navbar__toggle"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen(!open)}
      >
        <span className={`bar ${open ? 'open' : ''}`}></span>
        <span className={`bar ${open ? 'open' : ''}`}></span>
        <span className={`bar ${open ? 'open' : ''}`}></span>
      </button>

      <ul className={`navbar__links ${open ? 'open' : ''}`}>
        <li><a href="/teams">Meet the Teams</a></li>
        <li><a href="/scoreboard">Scoreboard</a></li>
        <li><a href="/about">About</a></li>
        <li>
          <Link to="/profile" className="navbar__profile-link">
            {user ? (
              <span className="navbar__avatar" aria-label="Profile">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile" />
                  : (user.username?.[0]?.toUpperCase() ?? 'P')}
              </span>
            ) : (
              'Sign In'
            )}
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar