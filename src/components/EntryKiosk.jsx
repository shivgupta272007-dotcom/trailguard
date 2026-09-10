import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { TREK_ITEMS, generateEntryId, isBanned } from '../data'

let customIdCounter = 0

export default function EntryKiosk({ onAddEntry, bans }) {
  const [name, setName] = useState('')
  const [govId, setGovId] = useState('')
  const [quantities, setQuantities] = useState(
    Object.fromEntries(TREK_ITEMS.map((item) => [item.id, 0]))
  )
  const [customItems, setCustomItems] = useState([])
  const [customName, setCustomName] = useState('')
  const [customFine, setCustomFine] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [banError, setBanError] = useState(null)

  const totalItems =
    Object.values(quantities).reduce((a, b) => a + b, 0) +
    customItems.reduce((s, c) => s + c.quantity, 0)

  function updateQty(itemId, delta) {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(20, (prev[itemId] || 0) + delta)),
    }))
  }

  function addCustomItem() {
    const trimmed = customName.trim()
    if (!trimmed) return
    const fineVal = parseInt(customFine) || 50
    const id = `custom-${++customIdCounter}`
    setCustomItems((prev) => [...prev, { id, name: trimmed, emoji: '📦', fine: fineVal, quantity: 1 }])
    setCustomName('')
    setCustomFine('')
  }

  function updateCustomQty(id, delta) {
    setCustomItems((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
        .filter((c) => c.quantity > 0)
    )
  }

  function removeCustomItem(id) {
    setCustomItems((prev) => prev.filter((c) => c.id !== id))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !govId.trim() || totalItems === 0) return

    // Check ban
    const ban = isBanned(govId.trim(), bans)
    if (ban) {
      setBanError(ban)
      return
    }

    const entryId = generateEntryId()
    const allItems = [
      ...TREK_ITEMS.filter((item) => quantities[item.id] > 0).map((item) => ({
        ...item,
        quantity: quantities[item.id],
      })),
      ...customItems,
    ]

    const entry = {
      id: entryId,
      name: name.trim(),
      govId: govId.trim(),
      entryTime: new Date().toISOString(),
      items: allItems,
      exitTime: null,
      returnedItems: null,
      fineCharged: 0,
    }

    onAddEntry(entry)
    setSubmitted(entry)
  }

  function handleReset() {
    setName('')
    setGovId('')
    setQuantities(Object.fromEntries(TREK_ITEMS.map((item) => [item.id, 0])))
    setCustomItems([])
    setCustomName('')
    setCustomFine('')
    setSubmitted(null)
    setBanError(null)
  }

  // Ban error screen
  if (banError) {
    return (
      <div className="max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto animate-scale-in">
        <div className="bg-forest-800/60 backdrop-blur-sm rounded-2xl border border-red-500/30 p-5 sm:p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-red-300 mb-2">Entry Restricted</h2>
          <p className="text-forest-300 mb-6 text-lg">
            This ID is temporarily banned from trekking
          </p>

          <div className="bg-red-500/8 rounded-xl p-5 mb-6 border border-red-500/20 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-forest-400 text-sm">ID</span>
              <span className="text-white font-mono text-sm">{banError.govId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-400 text-sm">Reason</span>
              <span className="text-red-300 text-sm text-right max-w-[60%]">{banError.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-400 text-sm">Banned Until</span>
              <span className="text-red-300 font-semibold text-sm">
                {new Date(banError.bannedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-xl bg-forest-600 hover:bg-forest-500 active:bg-forest-400 text-white text-lg font-bold transition-all duration-150 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Success confirmation screen
  if (submitted) {
    return (
      <div className="max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto animate-scale-in">
        <div className="bg-forest-800/60 backdrop-blur-sm rounded-2xl border border-forest-600/30 p-5 sm:p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-forest-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-forest-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-forest-100 mb-2">Entry Registered!</h2>
          <p className="text-forest-300 mb-4 text-lg">
            {submitted.name} — {submitted.items.reduce((s, i) => s + i.quantity, 0)} items logged
          </p>

          {/* Gate Pass with QR Code */}
          <div className="gate-pass-card bg-forest-900/80 rounded-2xl p-6 mb-6 border border-forest-500/30 relative overflow-hidden">
            {/* Dashed ticket edge */}
            <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-forest-600/30" />

            <div className="flex items-center justify-center gap-2 mb-4">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="w-7 h-7 object-contain" />
              <p className="text-xs font-semibold text-forest-400 uppercase tracking-[0.2em]">TrailGuard Gate Pass</p>
            </div>

            {/* QR Code */}
            <div className="inline-block p-3 bg-white rounded-xl mb-4 shadow-lg shadow-forest-950/30">
              <QRCodeSVG
                value={submitted.id}
                size={160}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f2d14"
              />
            </div>

            {/* Entry ID text fallback */}
            <p className="text-2xl sm:text-3xl font-black tracking-[0.15em] text-white font-mono mb-1">{submitted.id}</p>
            <p className="text-xs text-forest-500">Scan QR or enter code at exit gate</p>

            {/* Hiker details */}
            <div className="mt-4 pt-4 border-t border-dashed border-forest-600/30 grid grid-cols-2 gap-2 sm:gap-3 text-left">
              <div>
                <p className="text-[10px] text-forest-600 uppercase tracking-wider">Hiker</p>
                <p className="text-sm text-forest-200 font-medium truncate">{submitted.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-forest-600 uppercase tracking-wider">ID</p>
                <p className="text-sm text-forest-200 font-mono truncate">{submitted.govId}</p>
              </div>
              <div>
                <p className="text-[10px] text-forest-600 uppercase tracking-wider">Items</p>
                <p className="text-sm text-forest-200 font-medium">{submitted.items.reduce((s, i) => s + i.quantity, 0)} items</p>
              </div>
              <div>
                <p className="text-[10px] text-forest-600 uppercase tracking-wider">Entry Time</p>
                <p className="text-sm text-forest-200 font-medium">{new Date(submitted.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            </div>
          </div>

          <div className="print-hide bg-amber-500/8 rounded-xl p-4 mb-6 border border-amber-500/20">
            <p className="text-amber-300 text-sm font-medium">
              ⚠️ Return all items at exit. Missing items will result in a fine and a <strong>30-day trekking ban</strong>.
            </p>
          </div>

          <div className="print-hide grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-4 rounded-xl bg-forest-800 border border-forest-600/30 hover:bg-forest-700 active:bg-forest-600 text-white text-lg font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Pass
            </button>
            <button
              id="entry-new-hiker-btn"
              onClick={handleReset}
              className="w-full py-4 rounded-xl bg-forest-600 hover:bg-forest-500 active:bg-forest-400 text-white text-lg font-bold transition-all duration-150 cursor-pointer"
            >
              Next Hiker
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-forest-100">Entry Registration</h2>
        <p className="text-forest-400 mt-1">Log all items before heading out on the trail</p>
      </div>

      {/* Name & ID fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="hiker-name" className="block text-sm font-semibold text-forest-300 mb-1.5">
            Hiker Name
          </label>
          <input
            id="hiker-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            required
            className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-forest-900/60 border border-forest-600/40 text-white text-lg placeholder:text-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
          />
        </div>
        <div>
          <label htmlFor="hiker-id" className="block text-sm font-semibold text-forest-300 mb-1.5">
            Government ID
          </label>
          <input
            id="hiker-id"
            type="text"
            value={govId}
            onChange={(e) => {
              setGovId(e.target.value)
              setBanError(null)
            }}
            placeholder="e.g. AADHAAR-1234"
            required
            className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-forest-900/60 border border-forest-600/40 text-white text-lg placeholder:text-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Preset item selection */}
      <div className="bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-600/20 overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-forest-700/50">
          <h3 className="text-sm font-semibold text-forest-300 uppercase tracking-wider">Select Items You're Carrying</h3>
        </div>

        <div className="divide-y divide-forest-700/30">
          {TREK_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 transition-colors ${
                quantities[item.id] > 0 ? 'bg-forest-700/20' : ''
              } animate-slide-in delay-${idx + 1}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white truncate">{item.name}</p>
                  <p className="text-sm text-red-400/70">₹{item.fine} fine if not returned</p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => updateQty(item.id, -1)}
                  disabled={quantities[item.id] === 0}
                  aria-label={`Decrease ${item.name}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-forest-700/60 hover:bg-forest-600/60 active:bg-forest-500/60 text-white text-xl font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  −
                </button>
                <span className="w-8 sm:w-10 text-center text-xl font-bold text-white tabular-nums">
                  {quantities[item.id]}
                </span>
                <button
                  type="button"
                  onClick={() => updateQty(item.id, 1)}
                  aria-label={`Increase ${item.name}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-forest-600/80 hover:bg-forest-500/80 active:bg-forest-400/80 text-white text-xl font-bold flex items-center justify-center transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom item add */}
      <div className="bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-600/20 overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-forest-700/50">
          <h3 className="text-sm font-semibold text-forest-300 uppercase tracking-wider">Add Custom Item</h3>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Item name"
              className="w-full sm:flex-1 min-w-0 px-3.5 py-3 rounded-xl bg-forest-900/60 border border-forest-600/40 text-white text-base placeholder:text-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition"
            />
            <input
              type="number"
              value={customFine}
              onChange={(e) => setCustomFine(e.target.value)}
              placeholder="Fine ₹"
              min="1"
              className="w-24 px-3.5 py-3 rounded-xl bg-forest-900/60 border border-forest-600/40 text-white text-base placeholder:text-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition tabular-nums"
            />
            <button
              type="button"
              onClick={addCustomItem}
              disabled={!customName.trim()}
              className="px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-500 active:bg-forest-400 text-white font-bold text-base transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-forest-500 mt-2">Default fine: ₹50 if not specified</p>

          {/* Added custom items */}
          {customItems.length > 0 && (
            <div className="mt-3 space-y-2">
              {customItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-forest-700/20 rounded-xl px-4 py-3 animate-scale-in"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">📦</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-red-400/70">₹{item.fine} fine if not returned</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={() => updateCustomQty(item.id, -1)}
                      aria-label={`Decrease ${item.name}`}
                      className="w-10 h-10 rounded-lg bg-forest-700/60 hover:bg-forest-600/60 text-white text-lg font-bold flex items-center justify-center transition cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-lg font-bold text-white tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCustomQty(item.id, 1)}
                      aria-label={`Increase ${item.name}`}
                      className="w-10 h-10 rounded-lg bg-forest-600/80 hover:bg-forest-500/80 text-white text-lg font-bold flex items-center justify-center transition cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="w-10 h-10 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-lg flex items-center justify-center transition cursor-pointer ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items total bar */}
      <div className="bg-forest-700/40 backdrop-blur-sm rounded-xl border border-forest-500/30 p-3 sm:p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-forest-400 font-medium">Total Items</p>
          <p className="text-2xl font-bold text-white">{totalItems}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-red-400/60 font-medium">All items must be returned at exit</p>
          <p className="text-xs text-red-400/60">Missing items → Fine + 30-day ban</p>
        </div>
      </div>

      {/* Submit */}
      <button
        id="entry-submit-btn"
        type="submit"
        disabled={!name.trim() || !govId.trim() || totalItems === 0}
        className="w-full py-4 sm:py-5 rounded-xl bg-forest-500 hover:bg-forest-400 active:bg-forest-300 active:text-forest-900 text-white text-lg sm:text-xl font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-forest-900/50"
      >
        Register Entry — {totalItems} Item{totalItems !== 1 ? 's' : ''}
      </button>
    </form>
  )
}
