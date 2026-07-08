// Point this at your deployed admin portal URL in production
const API_BASE = 'http://localhost:3000'
// Set the gate API key (must match GATE_API_KEY in your .env)
const API_KEY = 'change-me-to-a-long-random-secret'

// Before this hour it's arrival, at/after it's departure — tune to your school's gate schedule.
const ARRIVAL_CUTOFF_HOUR = 12

let lastScanned = null
let resultTimeout = null
let html5QrCode = null
let checkedInCount = 0
let activeView = 'scan' // 'scan' | 'code'

const scanView = document.getElementById('scanView')
const codeView = document.getElementById('codeView')

// ── Arrival / departure (derived from time of day) ─────────────────────────────

function currentType() {
  return new Date().getHours() < ARRIVAL_CUTOFF_HOUR ? 'arrival' : 'departure'
}

function updateModePill() {
  const type = currentType()
  const pill = document.getElementById('modePill')
  pill.classList.toggle('pill--arrival', type === 'arrival')
  pill.classList.toggle('pill--departure', type === 'departure')
  document.getElementById('modeLabel').textContent = type === 'arrival' ? 'Arrival' : 'Departure'
}

function updateClock() {
  document.getElementById('currentTime').textContent = new Date().toLocaleTimeString('en-GB', {
    hour: 'numeric', minute: '2-digit'
  })
}

updateModePill()
updateClock()
setInterval(() => { updateModePill(); updateClock() }, 30000)

// ── QR camera scanner ───────────────────────────────────────────────────────────

function startQR() {
  if (html5QrCode) return
  html5QrCode = new Html5Qrcode('reader')
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 220, height: 220 } },
    (decodedText) => handleScan(decodedText),
    () => {}
  ).catch(err => console.warn('QR start failed:', err))
}

function stopQR() {
  if (!html5QrCode) return
  try {
    html5QrCode.stop().then(() => { html5QrCode = null }).catch(() => { html5QrCode = null })
  } catch {
    // stop() throws synchronously if the camera never actually started (e.g. permission denied)
    html5QrCode = null
  }
}

// ── View switching (camera scanner vs manual code entry) ───────────────────────

function setActiveView(view) {
  activeView = view
  scanView.classList.toggle('hidden', view !== 'scan')
  codeView.classList.toggle('hidden', view !== 'code')
  // Move focus so screen reader / keyboard users notice the view actually changed.
  document.getElementById(view === 'scan' ? 'scanViewHeading' : 'codeViewHeading').focus()
}

document.getElementById('enterCodeLink').addEventListener('click', () => {
  stopQR()
  resetCodeEntry()
  setActiveView('code')
})

document.getElementById('useScannerLink').addEventListener('click', () => {
  setActiveView('scan')
  startQR()
})

// ── Manual code entry (digit cells + on-screen keypad) ─────────────────────────

const CODE_LENGTH = 6
let codeDigits = []

function renderCodeCells() {
  const cells = document.querySelectorAll('#codeRow .code-cell')
  cells.forEach((cell, i) => { cell.textContent = codeDigits[i] ?? '' })
  document.getElementById('codeContinueBtn').disabled = codeDigits.length !== CODE_LENGTH
}

function resetCodeEntry() {
  codeDigits = []
  renderCodeCells()
}

document.querySelectorAll('.key[data-digit]').forEach(key => {
  key.addEventListener('click', () => {
    if (codeDigits.length >= CODE_LENGTH) return
    codeDigits.push(key.dataset.digit)
    renderCodeCells()
  })
})

document.getElementById('keyBackspace').addEventListener('click', () => {
  codeDigits.pop()
  renderCodeCells()
})

document.getElementById('keyClear').addEventListener('click', resetCodeEntry)

document.getElementById('codeForm').addEventListener('submit', (e) => {
  e.preventDefault()
  if (codeDigits.length !== CODE_LENGTH) return
  const code = codeDigits.join('')
  resetCodeEntry()
  handleScan(code)
})

// ── Core scan handler ────────────────────────────────────────────────────────────

async function handleScan(cardId) {
  if (lastScanned === cardId) return
  lastScanned = cardId
  setTimeout(() => { lastScanned = null }, 3000)

  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ cardId, type: currentType() })
    })

    const data = await res.json()

    if (res.status === 404) {
      showResult('error', '❌', 'Unknown Card', '', `ID not recognised: ${cardId}`)
      return
    }

    if (res.status === 401) {
      showResult('error', '❌', 'Auth Error', '', 'Invalid API key — check configuration')
      return
    }

    if (data.duplicate) {
      showResult('error', '⚠️', data.student.name, data.student.studentClass, data.message)
      return
    }

    if (data.success) {
      checkedInCount++
      document.getElementById('checkedInCount').textContent = checkedInCount
      showResult('success', currentType() === 'arrival' ? '✅' : '🚪', data.student.name, data.student.studentClass, data.message)
    }
  } catch {
    showResult('error', '❌', 'Connection Error', '', 'Could not reach server — check your network')
  }
}

// ── Result overlay ───────────────────────────────────────────────────────────────

function showResult(state, icon, name, cls, message) {
  const resultDiv = document.getElementById('result')
  resultDiv.className = `result ${state}`
  document.getElementById('resultIcon').textContent = icon
  document.getElementById('resultName').textContent = name
  document.getElementById('resultClass').textContent = cls
  document.getElementById('resultMessage').textContent = message
  resultDiv.classList.remove('hidden')
  scanView.classList.add('hidden')
  codeView.classList.add('hidden')

  clearTimeout(resultTimeout)
  resultTimeout = setTimeout(() => {
    resultDiv.classList.add('hidden')
    setActiveView(activeView)
  }, 4000)
}

// ── Startup ───────────────────────────────────────────────────────────────────────

startQR()
