import { useMemo } from 'react'
import { getEntryStatus, formatTime, formatDate } from '../data'

const STATUS_STYLES = {
  'on-trail': { label: 'On Trail', bg: 'bg-forest-500/15', text: 'text-forest-300', dot: 'bg-forest-400' },
  overdue: { label: 'Overdue', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400 animate-pulse-gentle' },
  exited: { label: 'Exited', bg: 'bg-sky-600/10', text: 'text-sky-100/60', dot: 'bg-sky-600/60' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default function Dashboard({ entries, bans }) {
  const now = new Date()

  const stats = useMemo(() => {
    let onTrail = 0
    let overdue = 0
    let unreturnedItems = 0
    let totalFinesCollected = 0
    let activeBans = 0

    entries.forEach((entry) => {
      const status = getEntryStatus(entry, now)
      if (status === 'on-trail') {
        onTrail++
        entry.items.forEach((item) => {
          unreturnedItems += item.quantity
        })
      } else if (status === 'overdue') {
        overdue++
        entry.items.forEach((item) => {
          unreturnedItems += item.quantity
        })
      }
      if (entry.fineCharged) totalFinesCollected += entry.fineCharged
    })

    bans.forEach((ban) => {
      if (new Date(ban.bannedUntil) > now) activeBans++
    })

    return { onTrail, overdue, hikersOnTrail: onTrail + overdue, unreturnedItems, totalFinesCollected, activeBans }
  }, [entries, bans])

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const sa = getEntryStatus(a, now)
      const sb = getEntryStatus(b, now)
      const order = { overdue: 0, 'on-trail': 1, exited: 2 }
      if (order[sa] !== order[sb]) return order[sa] - order[sb]
      return new Date(b.entryTime) - new Date(a.entryTime)
    })
  }, [entries])

  const activeBansList = useMemo(() => {
    return bans.filter((b) => new Date(b.bannedUntil) > now)
  }, [bans])

  return (
    <div className="max-w-lg sm:max-w-2xl lg:max-w-5xl mx-auto space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-forest-100">Ranger Dashboard</h2>
        <p className="text-forest-400 mt-1">Real-time trail & plastic tracking overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <StatCard
          label="On Trail"
          value={stats.hikersOnTrail}
          accent="text-forest-300"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          accent={stats.overdue > 0 ? 'text-amber-400' : 'text-forest-500'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Unreturned Items"
          value={stats.unreturnedItems}
          accent="text-earth-300"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
        />
        <StatCard
          label="Fines Collected"
          value={`₹${stats.totalFinesCollected}`}
          accent="text-red-400"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <StatCard
          label="Active Bans"
          value={stats.activeBans}
          accent={stats.activeBans > 0 ? 'text-red-400' : 'text-forest-500'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
      </div>

      {/* Active bans */}
      {activeBansList.length > 0 && (
        <div className="bg-red-500/5 backdrop-blur-sm rounded-2xl border border-red-500/20 overflow-hidden">
          <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-red-500/15 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Active Bans</h3>
            <span className="text-sm text-red-500/60">{activeBansList.length} banned</span>
          </div>
          <div className="divide-y divide-red-500/10">
            {activeBansList.map((ban, i) => (
              <div key={`${ban.govId}-${i}`} className="px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{ban.name}</p>
                  <p className="text-red-400/60 text-xs font-mono">{ban.govId}</p>
                  <p className="text-red-400/50 text-xs mt-0.5">{ban.reason}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs text-red-400/60">Banned until</p>
                  <p className="text-sm text-red-300 font-semibold">{formatDate(ban.bannedUntil)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entries table */}
      <div className="bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-600/20 overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-forest-700/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-forest-300 uppercase tracking-wider">All Entries</h3>
          <span className="text-sm text-forest-500">{entries.length} total</span>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-forest-500">
            <p className="text-lg">No entries yet</p>
            <p className="text-sm mt-1">Register hikers from the Entry tab</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="border-b border-forest-700/40">
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Hiker</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Entry ID</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Entry Time</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Items</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold text-forest-500 uppercase tracking-wider">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-700/30">
                {sortedEntries.map((entry) => {
                  const status = getEntryStatus(entry, now)
                  let missingCount = 0
                  if (entry.returnedItems) {
                    entry.items.forEach((item) => {
                      missingCount += item.quantity - (entry.returnedItems[item.id] || 0)
                    })
                  }
                  return (
                    <tr key={entry.id} className={`transition-colors ${status === 'overdue' ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                        <p className="font-semibold text-white text-base">{entry.name}</p>
                        <p className="text-sm text-forest-500">{entry.govId}</p>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                        <span className="font-mono text-sm text-forest-300 bg-forest-900/60 px-2 py-1 rounded">{entry.id}</span>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-sm text-forest-300">{formatTime(entry.entryTime)}</td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {entry.items.map((item) => (
                            <span key={item.id} className="text-base" title={`${item.quantity}× ${item.name}`}>
                              {item.emoji}
                              {item.quantity > 1 && <span className="text-xs text-forest-400 ml-0.5">×{item.quantity}</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                        {status === 'exited' ? (
                          entry.fineCharged > 0 ? (
                            <span className="text-red-400 font-semibold">₹{entry.fineCharged}</span>
                          ) : (
                            <span className="text-forest-400">None ✓</span>
                          )
                        ) : (
                          <span className="text-forest-600">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-forest-700/30">
              {sortedEntries.map((entry) => {
                const status = getEntryStatus(entry, now)
                return (
                  <div key={entry.id} className={`p-3 sm:p-4 ${status === 'overdue' ? 'bg-amber-500/5' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white text-base">{entry.name}</p>
                        <p className="text-sm text-forest-500 font-mono">{entry.id}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-forest-400">{formatTime(entry.entryTime)}</span>
                      <div className="flex gap-1">
                        {entry.items.map((item) => (
                          <span key={item.id} className="text-base" title={`${item.quantity}× ${item.name}`}>
                            {item.emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                    {status === 'exited' && entry.fineCharged > 0 && (
                      <p className="text-red-400 text-sm mt-1 font-medium">
                        Fine: ₹{entry.fineCharged}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div className="bg-forest-800/60 backdrop-blur-sm rounded-xl border border-forest-600/20 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-forest-500">{icon}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${accent} tabular-nums`}>{value}</p>
      <p className="text-sm text-forest-500 font-medium mt-0.5">{label}</p>
    </div>
  )
}
