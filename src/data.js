// Preset trek items with fine amounts (charged only if not returned)
export const TREK_ITEMS = [
  { id: 'energy-bar', name: 'Energy Bar Wrapper', emoji: '🍫', fine: 50 },
  { id: 'pet-bottle', name: 'PET Bottle', emoji: '🧴', fine: 100 },
  { id: 'wet-wipes', name: 'Wet Wipes Pack', emoji: '🧻', fine: 50 },
  { id: 'chips-packet', name: 'Chips Packet', emoji: '🍟', fine: 50 },
  { id: 'chocolate-wrapper', name: 'Chocolate Wrapper', emoji: '🍬', fine: 30 },
]

// Generate a short unique alphanumeric Entry ID
export function generateEntryId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'TG-'
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

// Ban duration in days
export const BAN_DURATION_DAYS = 30

// Threshold hours after which an entry is "overdue"
export const OVERDUE_HOURS = 6

// Compute status for a hiker entry
export function getEntryStatus(entry, now = new Date()) {
  if (entry.exitTime) return 'exited'
  const hoursElapsed = (now - new Date(entry.entryTime)) / (1000 * 60 * 60)
  if (hoursElapsed > OVERDUE_HOURS) return 'overdue'
  return 'on-trail'
}

// Format a date for display
export function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) +
    ', ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// Format a date (date only)
export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Check if a govId is currently banned
export function isBanned(govId, bans, now = new Date()) {
  const ban = bans.find((b) => b.govId.toUpperCase() === govId.toUpperCase())
  if (!ban) return null
  if (new Date(ban.bannedUntil) > now) return ban
  return null // ban expired
}

// Pre-populated sample entries for demo
export function createSampleEntries() {
  const now = Date.now()
  return [
    {
      id: 'TG-A7KM3R',
      name: 'Priya Sharma',
      govId: 'AADHAAR-8842',
      entryTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      items: [
        { ...TREK_ITEMS[0], quantity: 2 },
        { ...TREK_ITEMS[1], quantity: 1 },
        { ...TREK_ITEMS[3], quantity: 1 },
      ],
      exitTime: null,
      returnedItems: null,
      fineCharged: 0,
    },
    {
      id: 'TG-B3NP7W',
      name: 'Rahul Deshmukh',
      govId: 'DL-MH12-9031',
      entryTime: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      items: [
        { ...TREK_ITEMS[1], quantity: 2 },
        { ...TREK_ITEMS[2], quantity: 1 },
        { ...TREK_ITEMS[4], quantity: 3 },
      ],
      exitTime: null,
      returnedItems: null,
      fineCharged: 0,
    },
    {
      id: 'TG-C9XL4T',
      name: 'Ananya Iyer',
      govId: 'PAN-BXPI4921K',
      entryTime: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      items: [
        { ...TREK_ITEMS[0], quantity: 1 },
        { ...TREK_ITEMS[1], quantity: 1 },
        { ...TREK_ITEMS[2], quantity: 1 },
        { ...TREK_ITEMS[3], quantity: 2 },
        { ...TREK_ITEMS[4], quantity: 1 },
      ],
      exitTime: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      returnedItems: {
        'energy-bar': 1,
        'pet-bottle': 1,
        'wet-wipes': 1,
        'chips-packet': 2,
        'chocolate-wrapper': 0,
      },
      fineCharged: 30,
    },
  ]
}

// Sample bans
export function createSampleBans() {
  const now = Date.now()
  return [
    {
      govId: 'PAN-BXPI4921K',
      name: 'Ananya Iyer',
      bannedUntil: new Date(now + 29 * 24 * 60 * 60 * 1000).toISOString(),
      reason: '1 item not returned (Chocolate Wrapper)',
      bannedOn: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
    },
  ]
}
