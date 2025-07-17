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
        document.getElementById("lokasi").innerText = `${lat}, ${lon}`;
      },
      () => {
        document.getElementById("lokasi").innerText = "Tidak tersedia";
      }
    );
  } else {
    document.getElementById("lokasi").innerText = "Tidak didukung";
  }
};

// Ambil foto dan simpan base64
function ambilFoto() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";

  input.onchange = function () {
    const file = input.files[0];
    if (!file) return;

    // Validasi ukuran file sebelum dikompres
    if (!validateSizeBeforeCompress(file)) return;

    // Kompres dan simpan ke localStorage, lalu tampilkan preview
    compressAndSaveImage(file, "previewFoto", "fotoAbsen");
  };

  input.click();
}


// Kirim absensi
document.getElementById("absenForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nip = document.getElementById("nip").innerText;
  const nama = document.getElementById("nama").innerText;
  const tanggal = document.getElementById("tanggal").innerText;
  const jam = document.getElementById("jam").innerText;
  const jenis = document.getElementById("jenis").value;
  const lokasi = document.getElementById("lokasi").innerText;
  const fotoBase64 = localStorage.getItem("fotoAbsen");

  if (!fotoBase64) {
    alert("Derang foto mesti 😂😂");
    return;
  }

  if (lokasi === "Tidak tersedia" || lokasi === "Tidak didukung") {
    alert("Ampun Kesupen, GPS Lokasi di Aktifaken");
    return;
  }

  document.getElementById("status").innerText = "Mengirim data...";
  document.getElementById("overlay").style.display = "flex";

  fetch("https://script.google.com/macros/s/AKfycbxmWqn8n94JC9xXYe-Lh6l6Ra0dIEV85snEQWZ3z5zMy_lZSy0NqOxUHI4-pdkDKxkU/exec", {
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
      foto: fotoBase64
    })
  })
    .then(res => res.json())
    .then(res => {
      if (res.status === "success") {
        document.getElementById("status").innerText = "✅ Absensi berhasil dikirim.";
        localStorage.removeItem("fotoAbsen");
        document.getElementById("absenForm").reset();
        document.getElementById("previewFoto").innerHTML = `<span>📸 Foto akan tampil di sini</span>`;
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
