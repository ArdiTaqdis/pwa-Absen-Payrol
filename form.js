const URL = 'https://script.google.com/macros/s/AKfycbxXXXXX/exec'; // ganti dengan URL WebApp kamu

document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  document.getElementById("tanggal").value = now.toLocaleDateString('id-ID');
  document.getElementById("jam").value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lokasi = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      document.getElementById("lokasi").value = lokasi;
    });
  }

  document.getElementById('foto').addEventListener('change', previewFoto);
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
  }
}

async function kirimAbsen() {
  const loading = document.getElementById("loading");
  loading.style.display = "flex";

  const nip = document.getElementById('nip').value.trim();
  const nama = document.getElementById('nama').value.trim();
  const tanggal = document.getElementById('tanggal').value;
  const jam = document.getElementById('jam').value;
  const jenis = document.getElementById('jenis').value;
  const lokasi = document.getElementById('lokasi').value;
  const fotoFile = document.getElementById('foto').files[0];

  if (!nip || !nama || !lokasi || !fotoFile) {
    alert("⚠️ Lengkapi semua data dan upload foto.");
    loading.style.display = "none";
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    try {
      const base64String = reader.result.split(',')[1];
      const payload = { nip, nama, tanggal, jam, jenis, lokasi, fotoBase64: base64String };

      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        alert("✅ Absensi berhasil dikirim!");
        location.reload();
      } else {
        alert("❌ Gagal: " + (json.error || "Tidak diketahui"));
      }
    } catch (err) {
      alert("❌ Gagal kirim: " + err.message);
    } finally {
      loading.style.display = "none";
    }
  };

  reader.readAsDataURL(fotoFile);
}
