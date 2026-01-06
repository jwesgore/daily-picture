import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/UserContext'
import './NavBar.css'

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

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
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="Profile" />
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