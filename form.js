const URL = 'https://script.google.com/macros/s/AKfycbwCfvdu9ouEU-OgZh9UTMEELGs-kbNEfRWnL82lrLXj1Dey5nIklaJcLmIm4DsrYQuV/exec';

document.addEventListener("DOMContentLoaded", () => {
  // Isi otomatis nip dan nama dari localStorage
  const nip = localStorage.getItem('nip') || '';
  const nama = localStorage.getItem('nama') || '';
  document.getElementById('nip').value = nip;
  document.getElementById('nama').value = nama;

  // Tanggal dan Jam
  const now = new Date();
  document.getElementById('tanggal').value = now.toLocaleDateString('id-ID');
  document.getElementById('jam').value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Lokasi (Geolocation)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lon = position.coords.longitude.toFixed(5);
        document.getElementById('lokasi').value = `${lat}, ${lon}`;
      },
      (err) => {
        document.getElementById('lokasi').value = "Tidak tersedia";
      }
    );
  } else {
    document.getElementById('lokasi').value = "Tidak didukung";
  }
});

function kirimAbsen() {
  const loading = document.getElementById('loading');
  loading.style.display = 'flex';

  const data = {
    nip: document.getElementById('nip').value,
    nama: document.getElementById('nama').value,
    tanggal: document.getElementById('tanggal').value,
    jam: document.getElementById('jam').value,
    lokasi: document.getElementById('lokasi').value,
    jenis: document.getElementById('jenis').value,
  };

  // Validasi
  if (!data.nip || !data.nama || !data.jenis || !data.lokasi || data.lokasi === "Tidak tersedia") {
    alert("❌ Data belum lengkap atau lokasi belum tersedia.");
    loading.style.display = 'none';
    return;
  }

  fetch(URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.text())
    .then(res => {
      alert("✅ Absensi berhasil dikirim.");
      loading.style.display = 'none';
      window.location.reload();
    })
    .catch(err => {
      console.error("❌ Gagal kirim:", err);
      alert("❌ Terjadi kesalahan saat mengirim data.");
      loading.style.display = 'none';
    });
}
