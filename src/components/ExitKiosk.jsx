import { useState, useMemo } from 'react'
import { BAN_DURATION_DAYS } from '../data'

export default function ExitKiosk({ entries, onExitEntry, onBanHiker }) {
  const [entryIdInput, setEntryIdInput] = useState('')
  const [foundEntry, setFoundEntry] = useState(null)
  const [returned, setReturned] = useState({})
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  function handleLookup(e) {
    e.preventDefault()
    const id = entryIdInput.trim().toUpperCase()
    if (!id) return

    const entry = entries.find((e) => e.id === id)
    if (!entry) {
      setError('Entry ID not found. Please check and try again.')
      setFoundEntry(null)
      return
    }
    if (entry.exitTime) {
      setError('This entry has already been checked out.')
      setFoundEntry(null)
      return
    }

    setError('')
    setFoundEntry(entry)
    // Initialize all as fully returned (optimistic)
    const init = {}
    entry.items.forEach((item) => {
      init[item.id] = item.quantity
    })
    setReturned(init)
  }

  function updateReturned(itemId, delta, maxQty) {
    setReturned((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(maxQty, (prev[itemId] || 0) + delta)),
    }))
  }

  const totals = useMemo(() => {
    if (!foundEntry) return null
    let totalItems = 0
    let returnedItems = 0
    let totalFine = 0
    const missing = []

    foundEntry.items.forEach((item) => {
      const ret = returned[item.id] || 0
      const miss = item.quantity - ret
      totalItems += item.quantity
      returnedItems += ret
      if (miss > 0) {
        totalFine += miss * item.fine
        missing.push({ ...item, missed: miss })
      }
    })

    return { totalItems, returnedItems, totalFine, missing }
  }, [foundEntry, returned])

  function handleCheckout() {
    if (!foundEntry || !totals) return
    const returnedMap = {}
    foundEntry.items.forEach((item) => {
      returnedMap[item.id] = returned[item.id] || 0
    })

    const fineCharged = totals.totalFine
    onExitEntry(foundEntry.id, returnedMap, fineCharged)

    // Ban if any items missing
    if (totals.missing.length > 0) {
      const missingDesc = totals.missing
        .map((m) => `${m.missed}× ${m.name}`)
        .join(', ')
      onBanHiker({
        govId: foundEntry.govId,
        name: foundEntry.name,
        bannedUntil: new Date(Date.now() + BAN_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        bannedOn: new Date().toISOString(),
        reason: `Not returned: ${missingDesc}`,
      })
    }

    setSummary({
      entry: foundEntry,
      ...totals,
      wasBanned: totals.missing.length > 0,
    })
    setFoundEntry(null)
  }

  function handleReset() {
    setEntryIdInput('')
    setFoundEntry(null)
    setReturned({})
    setError('')
    setSummary(null)
  }

  // Summary screen
  if (summary) {
    const allReturned = summary.returnedItems === summary.totalItems
    return (
      <div className="max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto animate-scale-in">
        <div className="bg-forest-800/60 backdrop-blur-sm rounded-2xl border border-forest-600/30 p-5 sm:p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${
            allReturned ? 'bg-forest-500/20' : 'bg-red-500/15'
          }`}>
            {allReturned ? (
              <svg className="w-10 h-10 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-forest-100 mb-1">
            {allReturned ? '🌿 Perfect! All Items Returned' : 'Items Missing — Fine Charged'}
          </h2>
          <p className="text-forest-400 mb-6 text-lg">{summary.entry.name}</p>

          {/* Stats row */}
          <div className={`grid ${allReturned ? 'grid-cols-1' : 'grid-cols-2'} gap-3 mb-6`}>
            <div className="bg-forest-900/60 rounded-xl p-3 sm:p-4 border border-forest-600/20">
              <p className="text-sm text-forest-400">Items Returned</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {summary.returnedItems}<span className="text-lg text-forest-500">/{summary.totalItems}</span>
              </p>
            </div>
            {!allReturned && (
              <div className="bg-red-500/8 rounded-xl p-3 sm:p-4 border border-red-500/20">
                <p className="text-sm text-red-400">Fine Charged</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-400 mt-1">₹{summary.totalFine}</p>
              </div>
            )}
          </div>

          {/* Missing items detail */}
          {summary.missing.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Missing Items</p>
              {summary.missing.map((m) => (
                <div key={m.id} className="flex justify-between items-center py-1.5">
                  <span className="text-base text-red-100/80">
                    {m.emoji} {m.missed}× {m.name}
                  </span>
                  <span className="text-red-400 font-semibold">₹{m.missed * m.fine}</span>
                </div>
              ))}
            </div>
          )}

          {/* Ban notice */}
          {summary.wasBanned && (
            <div className="bg-red-500/8 border border-red-500/25 rounded-xl p-3 sm:p-4 mb-6 animate-scale-in">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <div className="text-left">
                  <p className="text-red-300 font-bold text-base">30-Day Trekking Ban Applied</p>
                  <p className="text-red-400/80 text-sm mt-1">
                    Government ID <span className="font-mono">{summary.entry.govId}</span> is restricted from all trekking activities for {BAN_DURATION_DAYS} days due to unreturned items.
                  </p>
                </div>
              </div>
            </div>
          )}

          {allReturned && (
            <div className="bg-forest-500/10 border border-forest-500/20 rounded-xl p-4 mb-6">
              <p className="text-forest-300 text-lg font-medium">
                🎉 Thank you for keeping the trail clean!
              </p>
            </div>
          )}

          <button
            id="exit-next-hiker-btn"
            onClick={handleReset}
            className="w-full py-4 rounded-xl bg-forest-600 hover:bg-forest-500 active:bg-forest-400 text-white text-lg font-bold transition-all duration-150 cursor-pointer"
          >
            Process Next Hiker
          </button>
        </div>
      </div>
    )
  }

  // Checkout screen — reviewing items
  if (foundEntry) {
    return (
      <div className="max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto space-y-5 animate-fade-in-up">
        <div className="text-center mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-forest-100">Verify Returned Items</h2>
          <p className="text-forest-400 mt-1">
            {foundEntry.name} — <span className="font-mono text-forest-300">{foundEntry.id}</span>
          </p>
        </div>

        <div className="bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-600/20 overflow-hidden">
          <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-forest-700/50">
            <h3 className="text-sm font-semibold text-forest-300 uppercase tracking-wider">
              Adjust quantity for returned items
            </h3>
          </div>

          <div className="divide-y divide-forest-700/30">
            {foundEntry.items.map((item, idx) => {
              const ret = returned[item.id] || 0
              const isPartial = ret < item.quantity
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 transition-colors animate-slide-in delay-${Math.min(idx + 1, 5)} ${
                    isPartial ? 'bg-red-500/5' : 'bg-forest-700/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white truncate">{item.name}</p>
                      <p className="text-sm text-forest-400">
                        Carried: {item.quantity} · <span className="text-red-400/70">₹{item.fine} fine each</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={() => updateReturned(item.id, -1, item.quantity)}
                      disabled={ret === 0}
                      aria-label={`Decrease returned ${item.name}`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-forest-700/60 hover:bg-forest-600/60 active:bg-forest-500/60 text-white text-xl font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      −
                    </button>
                    <span className={`w-8 sm:w-10 text-center text-xl font-bold tabular-nums ${
                      isPartial ? 'text-red-400' : 'text-forest-300'
                    }`}>
                      {ret}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateReturned(item.id, 1, item.quantity)}
                      disabled={ret >= item.quantity}
                      aria-label={`Increase returned ${item.name}`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-forest-600/80 hover:bg-forest-500/80 active:bg-forest-400/80 text-white text-xl font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary bar */}
        {totals && (
          <div className="bg-forest-700/40 backdrop-blur-sm rounded-xl border border-forest-500/30 p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-forest-400 font-medium">Returned</span>
              <span className="text-white font-bold text-lg">{totals.returnedItems}/{totals.totalItems} items</span>
            </div>
            {totals.totalFine > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-medium">Fine</span>
                  <span className="text-red-400 font-bold text-lg">₹{totals.totalFine}</span>
                </div>
                <p className="text-xs text-red-400/60 pt-1 border-t border-forest-700/30">
                  ⚠️ Missing items will result in fine + 30-day trekking ban
                </p>
              </>
            )}
            {totals.totalFine === 0 && (
              <p className="text-xs text-forest-400 pt-1 border-t border-forest-700/30">
                ✓ All items accounted for — no fine
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="py-3.5 sm:py-4 rounded-xl bg-forest-800/60 border border-forest-600/30 hover:bg-forest-700/60 text-forest-300 text-base sm:text-lg font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="exit-checkout-btn"
            type="button"
            onClick={handleCheckout}
            className={`py-3.5 sm:py-4 rounded-xl text-white text-base sm:text-lg font-bold transition-all duration-150 cursor-pointer shadow-lg shadow-forest-900/50 ${
              totals && totals.totalFine > 0
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-400'
                : 'bg-forest-500 hover:bg-forest-400 active:bg-forest-300 active:text-forest-900'
            }`}
          >
            {totals && totals.totalFine > 0 ? `Checkout & Charge ₹${totals.totalFine}` : 'Complete Checkout'}
          </button>
        </div>
      </div>
    )
  }

  // Lookup / scanner screen
  return (
    <form onSubmit={handleLookup} className="max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      <div className="text-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-forest-100">Exit Gate Scanner</h2>
        <p className="text-forest-400 mt-1">Scan gate pass QR code or enter ID manually</p>
      </div>

      {/* Scanner viewfinder */}
      <div className="bg-forest-900/70 rounded-2xl border border-forest-600/20 p-4 sm:p-6 relative overflow-hidden">
        {/* Animated scan line */}
        <div className="absolute inset-x-6 top-6 bottom-6 pointer-events-none">
          <div className="w-full h-0.5 bg-forest-400/60 shadow-[0_0_12px_2px_rgba(74,222,128,0.3)] animate-scan-line" />
        </div>

        {/* Viewfinder corners */}
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto mb-5">
          {/* Top-left corner */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-forest-400 rounded-tl-md" />
          {/* Top-right corner */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-forest-400 rounded-tr-md" />
          {/* Bottom-left corner */}
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-forest-400 rounded-bl-md" />
          {/* Bottom-right corner */}
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-forest-400 rounded-br-md" />

          {/* QR icon placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-forest-600/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>
          </div>
        </div>

        <p className="text-center text-sm text-forest-500 mb-1">Position QR code inside the frame</p>
        <p className="text-center text-xs text-forest-600">(Simulated scanner — enter code below)</p>
      </div>

      {/* Manual entry fallback */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 flex items-center justify-center -translate-y-1/2">
          <span className="bg-forest-900 px-3 text-xs text-forest-500 font-medium uppercase tracking-wider">or enter manually</span>
        </div>
        <div className="pt-4">
          <input
            id="exit-entry-id"
            type="text"
            value={entryIdInput}
            onChange={(e) => {
              setEntryIdInput(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="e.g. TG-A7KM3R"
            required
            autoComplete="off"
            className="w-full px-5 py-3.5 sm:py-4 rounded-xl bg-forest-900/60 border border-forest-600/40 text-white text-xl sm:text-2xl font-mono text-center tracking-widest placeholder:text-forest-600 placeholder:text-lg placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-scale-in">
          <p className="text-red-400 font-medium text-center">{error}</p>
        </div>
      )}

      <button
        id="exit-lookup-btn"
        type="submit"
        disabled={!entryIdInput.trim()}
        className="w-full py-4 sm:py-5 rounded-xl bg-forest-500 hover:bg-forest-400 active:bg-forest-300 active:text-forest-900 text-white text-lg sm:text-xl font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-forest-900/50 flex items-center justify-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        </svg>
        Verify Gate Pass
      </button>
    </form>
  )
}
