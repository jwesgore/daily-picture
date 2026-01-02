import React, { useState } from 'react'
import './NavBar.css'

const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false)

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
        <li><a href="/">Home</a></li>
        <li><a href="/gallery">Meet the Teams</a></li>
        <li><a href="/scoreboard">Scoreboard</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  )
}

export default NavBar