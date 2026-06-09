// Mock student database (later this comes from AWS)
const students = {
  'SCH-2026-0001': { name: 'Amara Okafor', studentClass: 'JSS 1A' },
  'SCH-2026-0002': { name: 'Chidi Nwosu', studentClass: 'JSS 2B' },
  'SCH-2026-0003': { name: 'Fatima Bello', studentClass: 'JSS 3C' }
};

const arrivals = [];
let lastScanned = null;
let resultTimeout = null;

// Set today's date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Start QR scanner
const html5QrCode = new Html5Qrcode('reader');

html5QrCode.start(
  { facingMode: 'environment' },
  { fps: 10, qrbox: { width: 250, height: 250 } },
  onScanSuccess,
  onScanError
);

function onScanSuccess(decodedText) {
  // Prevent duplicate scans within 3 seconds
  if (lastScanned === decodedText) return;
  lastScanned = decodedText;
  setTimeout(() => { lastScanned = null; }, 3000);

  const student = students[decodedText];
  const resultDiv = document.getElementById('result');
  const resultIcon = document.getElementById('resultIcon');
  const resultName = document.getElementById('resultName');
  const resultClass = document.getElementById('resultClass');
  const resultMessage = document.getElementById('resultMessage');

  if (student) {
    // Check if already scanned today
    const alreadyIn = arrivals.find(a => a.id === decodedText);

    if (alreadyIn) {
      resultDiv.className = 'result error';
      resultIcon.textContent = '⚠️';
      resultName.textContent = student.name;
      resultClass.textContent = student.studentClass;
      resultMessage.textContent = `Already scanned at ${alreadyIn.time}`;
    } else {
      const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      arrivals.unshift({ id: decodedText, name: student.name, studentClass: student.studentClass, time });

      resultDiv.className = 'result success';
      resultIcon.textContent = '✅';
      resultName.textContent = student.name;
      resultClass.textContent = student.studentClass;
      resultMessage.textContent = `Arrived at ${time} — parent notified`;

      updateLog();
    }
  } else {
    resultDiv.className = 'result error';
    resultIcon.textContent = '❌';
    resultName.textContent = 'Unknown Card';
    resultClass.textContent = '';
    resultMessage.textContent = `ID not recognised: ${decodedText}`;
  }

  resultDiv.classList.remove('hidden');

  // Hide result after 4 seconds
  clearTimeout(resultTimeout);
  resultTimeout = setTimeout(() => {
    resultDiv.classList.add('hidden');
  }, 4000);
}

function onScanError() {
  // Silently ignore scan errors
}

function updateLog() {
  const log = document.getElementById('arrivalLog');

  if (arrivals.length === 0) {
    log.innerHTML = '<div class="empty-log">No arrivals yet</div>';
    return;
  }

  log.innerHTML = arrivals.map(a => `
    <div class="log-entry">
      <div>
        <div class="log-name">${a.name}</div>
        <div class="log-class">${a.studentClass}</div>
      </div>
      <div class="log-time">${a.time}</div>
    </div>
  `).join('');
}

// Init empty log
updateLog();