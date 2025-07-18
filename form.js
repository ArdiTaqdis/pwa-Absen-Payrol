function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

window.onload = function () {
  const nip = getQueryParam("nip");
  const nama = getQueryParam("nama");

  if (!nip || !nama) {
    alert("Data tidak lengkap. Silakan login ulang.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nip").innerText = nip;
  document.getElementById("nama").innerText = decodeURIComponent(nama);

  localStorage.setItem("nipLogin", nip);

  const now = new Date();
  document.getElementById("tanggal").innerText = now.toLocaleDateString("id-ID");
  updateJam();
  setInterval(updateJam, 1000);

  function updateJam() {
    const now = new Date();
    const jamStr = now.toLocaleTimeString("id-ID", { hour12: false });
    document.getElementById("jam").innerText = jamStr;

    const hour = now.getHours();
    const jenis = (hour >= 5 && hour < 12) ? "Masuk" : "Pulang";
    document.getElementById("jenis").value = jenis;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lon = pos.coords.longitude.toFixed(5);
        localStorage.setItem("koordinat", `${lat},${lon}`);

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(response => response.json())
          .then(data => {
            const alamat = data.display_name || `${lat}, ${lon}`;
            document.getElementById("lokasi").innerText = alamat;
          })
          .catch(() => {
            document.getElementById("lokasi").innerText = `${lat}, ${lon}`;
          });
      },
      () => {
        document.getElementById("lokasi").innerText = "Tidak tersedia";
      }
    );
  } else {
    document.getElementById("lokasi").innerText = "Tidak didukung";
  }
};

// Kirim absensi
document.getElementById("absenForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nip = document.getElementById("nip").innerText;
  const nama = document.getElementById("nama").innerText;
  const tanggal = document.getElementById("tanggal").innerText;
  const jam = document.getElementById("jam").innerText;
  const jenis = document.getElementById("jenis").value;
  const lokasi = document.getElementById("lokasi").innerText;
  const qrCode = localStorage.getItem("qrCodeLokasi");

  if (!qrCode || qrCode === "Belum scan") {
    alert("QR Code belum discan!");
    return;
  }

  if (lokasi === "Tidak tersedia" || lokasi === "Tidak didukung") {
    alert("Ampun Kesupen, GPS Lokasi di Aktifaken");
    return;
  }

  document.getElementById("status").innerText = "Mengirim data...";
  document.getElementById("overlay").style.display = "flex";

  fetch("https://script.google.com/macros/s/AKfycbwWMfPtJdx2ki5bpA1-wZuy6yxEbffnsIi4tWb7UFzQSQw1IS-OYC8NVP8Vwt5sNnN2/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "kirimAbsen",
      nip,
      nama,
      tanggal,
      jam,
      jenis,
      lokasi,
      qrCode
    })
  })
    .then(res => res.json())
    .then(res => {
      if (res.status === "success") {
        document.getElementById("status").innerText = "✅ Absensi berhasil dikirim.";
        localStorage.removeItem("qrCodeLokasi");
        document.getElementById("qrResult").textContent = "Belum scan";
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1500);
      } else {
        document.getElementById("status").innerText = "❌ Gagal mengirim absensi.";
        document.getElementById("overlay").style.display = "none";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("status").innerText = "❌ Terjadi kesalahan saat mengirim.";
      document.getElementById("overlay").style.display = "none";
    });
});
