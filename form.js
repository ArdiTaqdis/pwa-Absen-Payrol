const URL = 'https://script.google.com/macros/s/AKfycbzOJrcCx1yeaVxtaZ-DuHuKPFMS28qnzmky2kZmlBEbRgtcNmgHHc81M5mQ_PxULv3R/exec'; // ganti dengan URL WebApp kamu

document.addEventListener("DOMContentLoaded", () => {
  const nip = localStorage.getItem('nip') || '';
  const nama = localStorage.getItem('nama') || '';
  document.getElementById('nip').value = nip;
  document.getElementById('nama').value = nama;

  const now = new Date();
  const tgl = now.toLocaleDateString('id-ID');
  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('tanggal').value = tgl;
  document.getElementById('jam').value = jam;

  const jamInt = now.getHours();
  if (jamInt >= 5 && jamInt < 12) document.getElementById('jenis').value = "Masuk";
  else if (jamInt >= 12 && jamInt <= 23) document.getElementById('jenis').value = "Pulang";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lokasi = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      document.getElementById('lokasi').value = lokasi;
    }, () => {
      document.getElementById('lokasi').value = "Tidak tersedia";
    });
  }
});

function previewFoto() {
  const input = document.getElementById('foto');
  const preview = document.getElementById('preview');
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.src = '';
    preview.style.display = 'none';
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function kirimAbsen() {
  const loading = document.getElementById("loading");
  loading.style.display = "flex";

  try {
    const URL = "https://script.google.com/macros/s/AKfycbx1A9yf1By2XT3Rnk6JMQQKQNEPnIOf2ZVdgyxlcHh7mwuBGj6vLHhHiUttTLLcvFVo/exec";

    const nip = document.getElementById("nip").value;
    const nama = document.getElementById("nama").value;
    const tanggal = document.getElementById("tanggal").value;
    const jam = document.getElementById("jam").value;
    const lokasi = document.getElementById("lokasi").value;
    const jenis = document.getElementById("jenis").value;
    const file = document.getElementById("foto").files[0];

    if (!nip || !nama || !tanggal || !jam || !lokasi || !file) {
      alert("Data belum lengkap.");
      loading.style.display = "none";
      return;
    }

    const fotoBase64 = await toBase64(file);
    const data = { nip, nama, tanggal, jam, lokasi, jenis, foto: fotoBase64 };

    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (result.success) {
      alert("✅ Absen berhasil!");
      window.location.href = "home.html";
    } else {
      throw new Error(result.error || "Gagal kirim.");
    }

  } catch (err) {
    console.error("❌ Gagal:", err);
    alert("❌ Gagal kirim: " + err.message);
  } finally {
    loading.style.display = "none";
  }
}
