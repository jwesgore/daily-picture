import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import NavBar from './components/nav/NavBar'
import Home from './pages/Home'
import Teams from './pages/Teams'
import TeamPage from './components/Teams/TeamPage'
import PlayerPage from './components/Players/PlayerPage'
import Scoreboard from './pages/Scoreboard'
import About from './pages/About'
import Profile from './pages/Profile'


function App() {
  return (
    <UserProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/player/:playerId" element={<PlayerPage />} />
          <Route path="/teams/:teamName" element={<TeamPage />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App