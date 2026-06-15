// Point this at your deployed admin portal URL in production
const API_BASE = 'http://localhost:3000'
// Set the gate API key (must match GATE_API_KEY in your .env)
const API_KEY = 'change-me-to-a-long-random-secret'

const arrivals = []
let lastScanned = null
let resultTimeout = null
let currentMode = 'qr'
let currentType = 'arrival'
let html5QrCode = null

document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

// ── Mode toggle ───────────────────────────────────────────────────────────────

function setMode(mode) {
  currentMode = mode
  document.getElementById('btnQR').classList.toggle('active', mode === 'qr')
  document.getElementById('btnRFID').classList.toggle('active', mode === 'rfid')
  document.getElementById('qrSection').classList.toggle('hidden', mode !== 'qr')
  document.getElementById('rfidSection').classList.toggle('hidden', mode !== 'rfid')

  if (mode === 'qr') {
    stopRFID()
    startQR()
  } else {
    stopQR()
    startRFID()
  }
}

function setType(type) {
  currentType = type
  document.getElementById('btnArrival').classList.toggle('active', type === 'arrival')
  document.getElementById('btnDeparture').classList.toggle('active', type === 'departure')
}

// ── QR camera scanner ─────────────────────────────────────────────────────────

function startQR() {
  if (html5QrCode) return
  html5QrCode = new Html5Qrcode('reader')
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decodedText) => handleScan(decodedText),
    () => {}
  ).catch(err => console.warn('QR start failed:', err))
}

function stopQR() {
  if (!html5QrCode) return
  html5QrCode.stop().then(() => { html5QrCode = null }).catch(() => { html5QrCode = null })
}

// ── RFID HID keyboard capture ─────────────────────────────────────────────────
// USB HID RFID readers type the card UID as keyboard input followed by Enter.
// We capture that in a focused hidden input field.

let rfidBuffer = ''
let rfidFlushTimer = null

function startRFID() {
  const input = document.getElementById('rfidInput')
  input.readOnly = false
  input.value = ''
  input.focus()

  input.addEventListener('keydown', onRFIDKeydown)
  input.addEventListener('blur', () => setTimeout(() => input.focus(), 100))
}

function stopRFID() {
  const input = document.getElementById('rfidInput')
  input.readOnly = true
  input.removeEventListener('keydown', onRFIDKeydown)
}

function onRFIDKeydown(e) {
  if (e.key === 'Enter') {
    const cardId = rfidBuffer.trim()
    rfidBuffer = ''
    clearTimeout(rfidFlushTimer)
    document.getElementById('rfidInput').value = ''
    if (cardId) handleScan(cardId)
    return
  }
  if (e.key.length === 1) {
    rfidBuffer += e.key
    // Auto-flush after 100ms of no input (handles readers that don't send Enter)
    clearTimeout(rfidFlushTimer)
    rfidFlushTimer = setTimeout(() => {
      const cardId = rfidBuffer.trim()
      rfidBuffer = ''
      document.getElementById('rfidInput').value = ''
      if (cardId) handleScan(cardId)
    }, 100)
  }
}

// ── Core scan handler ─────────────────────────────────────────────────────────

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
      body: JSON.stringify({ cardId, type: currentType })
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
      arrivals.unshift({
        name: data.student.name,
        studentClass: data.student.studentClass,
        time: data.time,
        type: currentType
      })
      updateLog()
      showResult('success', currentType === 'arrival' ? '✅' : '🚪', data.student.name, data.student.studentClass, data.message)
    }
  } catch {
    showResult('error', '❌', 'Connection Error', '', 'Could not reach server — check your network')
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function showResult(state, icon, name, cls, message) {
  const resultDiv = document.getElementById('result')
  resultDiv.className = `result ${state}`
  document.getElementById('resultIcon').textContent = icon
  document.getElementById('resultName').textContent = name
  document.getElementById('resultClass').textContent = cls
  document.getElementById('resultMessage').textContent = message
  resultDiv.classList.remove('hidden')

  clearTimeout(resultTimeout)
  resultTimeout = setTimeout(() => resultDiv.classList.add('hidden'), 4000)
}

function updateLog() {
  const log = document.getElementById('arrivalLog')
  if (arrivals.length === 0) {
    log.innerHTML = '<div class="empty-log">No arrivals yet</div>'
    return
  }
  log.innerHTML = arrivals.map(a => `
    <div class="log-entry">
      <div>
        <div class="log-name">${a.name}</div>
        <div class="log-class">${a.studentClass}</div>
      </div>
      <div class="log-time">
        <span class="log-type ${a.type}">${a.type === 'arrival' ? '↓ In' : '↑ Out'}</span>
        ${a.time}
      </div>
    </div>
  `).join('')
}

// ── Startup ───────────────────────────────────────────────────────────────────

startQR()
updateLog()
