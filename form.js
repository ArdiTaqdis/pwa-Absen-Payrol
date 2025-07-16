const URL = 'https://script.google.com/macros/s/AKfycbyNiGjiDsx79Q_59psH8NrnfqJNZPyeFNaxYJqVw7AU16X4h66H2Xb2DH-HWjS6ZDWj/exec';

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

async function kirimAbsen() {
  const loading = document.getElementById("loading");
  const tombol = document.querySelector("button");
  tombol.disabled = true;
  loading.style.display = "flex";

  try {
    const nip = document.getElementById("nip").value;
    const nama = document.getElementById("nama").value;
    const tanggal = document.getElementById("tanggal").value;
    const jam = document.getElementById("jam").value;
    const lokasi = document.getElementById("lokasi").value;
    const jenis = document.getElementById("jenis").value;

    if (!nip || !nama || !tanggal || !jam || !lokasi) {
      alert("❌ Data belum lengkap.");
      return;
    }

    const formData = new FormData();
    formData.append("nip", nip);
    formData.append("nama", nama);
    formData.append("tanggal", tanggal);
    formData.append("jam", jam);
    formData.append("lokasi", lokasi);
    formData.append("jenis", jenis);

    const res = await fetch(URL, {
      method: "POST",
      body: formData
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
    tombol.disabled = false;
  }
}
