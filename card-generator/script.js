nlet students = [];

document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      alert('Spreadsheet appears to be empty. Please check your file.');
      return;
    }

    students = rows.map((row, index) => ({
      id: `SCH-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
      name: row['Student Name'] || row['student name'] || row['Name'] || '',
      studentClass: row['Class'] || row['class'] || '',
      phone: String(row['Parent Phone'] || row['parent phone'] || row['Phone'] || ''),
      email: row['Parent Email'] || row['parent email'] || row['Email'] || ''
    }));

    renderPreview();
  };

  reader.readAsArrayBuffer(file);
});


function renderPreview() {
  const preview = document.getElementById('preview');
  const actions = document.getElementById('actions');

  preview.innerHTML = '';
  preview.classList.remove('hidden');
  actions.classList.remove('hidden');

  students.forEach((student) => {
    const card = document.createElement('div');
    card.classList.add('card-preview');

    const name = document.createElement('div');
    name.classList.add('student-name');
    name.textContent = student.name;

    const cls = document.createElement('div');
    cls.classList.add('student-class');
    cls.textContent = student.studentClass;

    const qrContainer = document.createElement('div');
    qrContainer.id = `qr-${student.id}`;

    card.appendChild(name);
    card.appendChild(cls);
    card.appendChild(qrContainer);
    preview.appendChild(card);

    new QRCode(qrContainer, {
      text: student.id,
      width: 80,
      height: 80
    });
  });
}


async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardWidth = 85;
  const cardHeight = 54;
  const marginX = 15;
  const marginY = 15;
  const cols = 2;
  const gap = 10;

  let col = 0;
  let row = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    const x = marginX + col * (cardWidth + gap);
    const y = marginY + row * (cardHeight + gap);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('SCHOOL ARRIVAL PASS', x + cardWidth / 2, y + 6, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(20, 20, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(student.name, x + cardWidth / 2, y + 14, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Class: ${student.studentClass}`, x + cardWidth / 2, y + 20, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(student.id, x + cardWidth / 2, y + 26, { align: 'center' });

    const qrContainer = document.getElementById(`qr-${student.id}`);
    const qrImg = qrContainer.querySelector('img') || qrContainer.querySelector('canvas');

    if (qrImg) {
      let imgData;
      if (qrImg.tagName === 'CANVAS') {
        imgData = qrImg.toDataURL('image/png');
      } else {
        imgData = qrImg.src;
      }
      doc.addImage(imgData, 'PNG', x + cardWidth / 2 - 15, y + 29, 30, 30);
    }

    col++;
    if (col >= cols) {
      col = 0;
      row++;
    }

    if (row * (cardHeight + gap) + cardHeight + marginY > 297 && i < students.length - 1) {
      doc.addPage();
      col = 0;
      row = 0;
    }
  }

  doc.save('student-cards.pdf');
}