import { useState, useCallback, useMemo } from 'react'
import EntryKiosk from './components/EntryKiosk'
import ExitKiosk from './components/ExitKiosk'
import Dashboard from './components/Dashboard'
import AnimatedTrail from './components/AnimatedTrail'
import { createSampleEntries, createSampleBans } from './data'

const TABS = [
  { id: 'entry', label: 'Entry', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )},
  { id: 'exit', label: 'Exit', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  )},
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )},
]

const BG_IMAGES = {
  entry: '/bg-entry.png',
  exit: '/bg-exit.png',
  dashboard: '/bg-dashboard.png',
}

// Leaf configurations per tab
const LEAVES_CONFIG = {
  entry: [
    { emoji: '🍃', x: '80px', y: '100vh', rot: '360deg', size: '18px', duration: '14s', delay: '0s', left: '10%', top: '-5%' },
    { emoji: '🌿', x: '-60px', y: '100vh', rot: '-200deg', size: '14px', duration: '18s', delay: '4s', left: '70%', top: '-8%' },
    { emoji: '🍃', x: '40px', y: '100vh', rot: '280deg', size: '12px', duration: '16s', delay: '8s', left: '40%', top: '-3%' },
    { emoji: '🍂', x: '-30px', y: '100vh', rot: '400deg', size: '16px', duration: '20s', delay: '2s', left: '85%', top: '-6%' },
    { emoji: '🌿', x: '70px', y: '100vh', rot: '-300deg', size: '10px', duration: '15s', delay: '6s', left: '25%', top: '-4%' },
  ],
  exit: [
    { emoji: '🍂', x: '60px', y: '100vh', rot: '300deg', size: '16px', duration: '16s', delay: '1s', left: '15%', top: '-5%' },
    { emoji: '🍁', x: '-50px', y: '100vh', rot: '-250deg', size: '18px', duration: '19s', delay: '5s', left: '60%', top: '-8%' },
    { emoji: '🍂', x: '30px', y: '100vh', rot: '350deg', size: '12px', duration: '14s', delay: '9s', left: '45%', top: '-3%' },
    { emoji: '🍁', x: '-70px', y: '100vh', rot: '420deg', size: '14px', duration: '22s', delay: '3s', left: '80%', top: '-6%' },
  ],
  dashboard: [
    { emoji: '🌿', x: '50px', y: '100vh', rot: '280deg', size: '14px', duration: '18s', delay: '2s', left: '20%', top: '-5%' },
    { emoji: '🍃', x: '-40px', y: '100vh', rot: '-320deg', size: '12px', duration: '20s', delay: '7s', left: '55%', top: '-7%' },
    { emoji: '🌿', x: '60px', y: '100vh', rot: '380deg', size: '10px', duration: '16s', delay: '4s', left: '75%', top: '-4%' },
  ],
}

function BackgroundScene({ activeTab }) {
  const leaves = LEAVES_CONFIG[activeTab] || []

  return (
    <div className="bg-scene" aria-hidden="true">
      {/* Background images — all preloaded, opacity-toggled */}
      {Object.entries(BG_IMAGES).map(([tab, src]) => (
        <img
          key={tab}
          src={src}
          alt=""
          className="bg-scene-img"
          style={{ opacity: activeTab === tab ? 1 : 0 }}
        />
      ))}

      {/* Dark overlay for readability */}
      <div className="bg-scene-overlay" />

      {/* Vignette */}
      <div className="bg-scene-vignette" />

      {/* Mist at bottom */}
      <div className="mist-layer" />

      {/* Drifting clouds */}
      <div
        className="drifting-cloud"
        style={{
          '--cloud-w': '500px',
          '--cloud-h': '100px',
          '--cloud-opacity': '0.06',
          '--cloud-duration': '45s',
          '--cloud-delay': '0s',
          top: '8%',
        }}
      />
      <div
        className="drifting-cloud"
        style={{
          '--cloud-w': '350px',
          '--cloud-h': '70px',
          '--cloud-opacity': '0.04',
          '--cloud-duration': '55s',
          '--cloud-delay': '15s',
          top: '15%',
        }}
      />
      <div
        className="drifting-cloud"
        style={{
          '--cloud-w': '600px',
          '--cloud-h': '90px',
          '--cloud-opacity': '0.05',
          '--cloud-duration': '60s',
          '--cloud-delay': '30s',
          top: '5%',
        }}
      />

      {/* Sun rays */}
      <div className="sun-ray" style={{ '--ray-angle': '12deg', '--ray-duration': '8s', '--ray-delay': '0s', left: '10%' }} />
      <div className="sun-ray" style={{ '--ray-angle': '-8deg', '--ray-duration': '10s', '--ray-delay': '3s', left: '60%' }} />
      <div className="sun-ray" style={{ '--ray-angle': '20deg', '--ray-duration': '12s', '--ray-delay': '5s', left: '35%' }} />

      {/* Flying birds */}
      <span className="flying-bird" style={{ '--bird-size': '11px', '--bird-duration': '22s', '--bird-delay': '3s', top: '12%', left: '-30px' }}>🐦</span>
      <span className="flying-bird" style={{ '--bird-size': '9px', '--bird-duration': '28s', '--bird-delay': '10s', top: '18%', left: '-30px' }}>🐦</span>
      <span className="flying-bird" style={{ '--bird-size': '13px', '--bird-duration': '25s', '--bird-delay': '18s', top: '9%', left: '-30px' }}>🐦</span>

      {/* Floating leaves — unique per tab */}
      {leaves.map((leaf, i) => (
        <span
          key={`${activeTab}-leaf-${i}`}
          className="floating-leaf"
          style={{
            '--leaf-x': leaf.x,
            '--leaf-y': leaf.y,
            '--leaf-rot': leaf.rot,
            '--leaf-size': leaf.size,
            '--leaf-duration': leaf.duration,
            '--leaf-delay': leaf.delay,
            left: leaf.left,
            top: leaf.top,
          }}
        >
          {leaf.emoji}
        </span>
      ))}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('entry')
  const [entries, setEntries] = useState(createSampleEntries)
  const [bans, setBans] = useState(createSampleBans)

  const addEntry = useCallback((entry) => {
    setEntries((prev) => [...prev, entry])
  }, [])

  const exitEntry = useCallback((entryId, returnedItems, fineCharged) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, exitTime: new Date().toISOString(), returnedItems, fineCharged }
          : e
      )
    )
  }, [])

  const banHiker = useCallback((ban) => {
    setBans((prev) => {
      const filtered = prev.filter((b) => b.govId.toUpperCase() !== ban.govId.toUpperCase())
      return [...filtered, ban]
    })
  }, [])

  return (
    <>
      {/* Animated background scene */}
      <BackgroundScene activeTab={activeTab} />

      {/* Animated dotted trek trail at bottom */}
      <AnimatedTrail />

      <div className="relative z-10 min-h-dvh flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-50 bg-forest-950/60 backdrop-blur-xl border-b border-forest-700/30">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo.png"
                alt="TrailGuard Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-lg"
              />
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white leading-tight">TrailGuard</h1>
                <p className="text-[10px] sm:text-xs text-forest-400 leading-tight hidden sm:block">carry in, carry out</p>
              </div>
            </div>

            {/* Nav tabs */}
            <nav className="flex gap-0.5 sm:gap-1 bg-forest-900/50 backdrop-blur p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-forest-700/20" role="tablist" aria-label="Main navigation">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`nav-${tab.id}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-forest-600/90 text-white shadow-lg shadow-forest-900/40'
                      : 'text-forest-400 hover:text-forest-200 hover:bg-forest-800/40'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div key={activeTab} className="animate-tab-enter">
            {activeTab === 'entry' && <EntryKiosk onAddEntry={addEntry} bans={bans} />}
            {activeTab === 'exit' && <ExitKiosk entries={entries} onExitEntry={exitEntry} onBanHiker={banHiker} />}
            {activeTab === 'dashboard' && <Dashboard entries={entries} bans={bans} />}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-forest-800/30 py-4">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="" className="w-5 h-5 object-contain opacity-40" />
            <span className="text-xs text-forest-600/80">TrailGuard · carry in, carry out 🌿</span>
          </div>
        </footer>
      </div>
    </>
  )
}
