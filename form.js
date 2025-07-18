// ==================== UTILITAS ====================
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = type === "error" ? "#f44336" : type === "success" ? "#4caf50" : "#333";
  toast.style.color = "#fff";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "6px";
  toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
  toast.style.zIndex = "9999";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function setLoading(isLoading, text = "") {
  const overlay = document.getElementById("overlay");
  const status = document.getElementById("status");
  overlay.style.display = isLoading ? "flex" : "none";
  status.innerText = text;
}


// ==================== LOAD DATA ====================
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

  // Set tanggal
  const now = new Date();
  document.getElementById("tanggal").innerText = now.toLocaleDateString("id-ID");

  // Set jam dan jenis absen
  function updateJam() {
    const now = new Date();
    const jamStr = now.toLocaleTimeString("id-ID", { hour12: false });
    document.getElementById("jam").innerText = jamStr;
    const hour = now.getHours();
    const jenis = (hour >= 5 && hour < 12) ? "Masuk" : "Pulang";
    document.getElementById("jenis").value = jenis;
  }
  updateJam();
  setInterval(updateJam, 1000);

  // Ambil lokasi
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lon = pos.coords.longitude.toFixed(5);
        localStorage.setItem("koordinat", `${lat},${lon}`);

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(res => res.json())
          .then(data => {
            document.getElementById("lokasi").innerText = data.display_name || `${lat}, ${lon}`;
          })
          .catch(() => {
            document.getElementById("lokasi").innerText = `${lat}, ${lon}`;
          });
      },
      () => document.getElementById("lokasi").innerText = "Tidak tersedia"
    );
  } else {
    document.getElementById("lokasi").innerText = "Tidak didukung";
  }
};


// ==================== KIRIM ABSEN ====================
document.getElementById("absenForm").addEventListener("submit", function (e) {
  e.preventDefault();
  setLoading(true, "🚀 Mengirim absensi...");

  const qrCode = document.getElementById("qrResult").textContent.trim();
  if (qrCode !== "001-SDS Snack") {
    setLoading(false);
    showToast("❌ QR Code tidak valid! Silakan scan QR yang benar.", "error");
    document.getElementById("qrResult").textContent = "Belum scan";
    return;
  }

  const nip = document.getElementById("nip").innerText;
  const nama = document.getElementById("nama").innerText;
  const tanggal = document.getElementById("tanggal").innerText;
  const jam = document.getElementById("jam").innerText;
  const jenis = document.getElementById("jenis").value;
  const lokasi = document.getElementById("lokasi").innerText;

  fetch("https://script.google.com/macros/s/AKfycbz-05T8Z2O3Y0Zk2M0P-yiA3yfwiLLMZ5NY6ASMt01ltPaPLclZ_7e6LkeIG2xtKS-A/exec", {
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
      setLoading(true, "✅ Absensi berhasil dikirim.");
      showToast("✅ Absensi berhasil!", "success");
      document.getElementById("absenForm").reset();
      document.getElementById("qrResult").textContent = "Belum scan";
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1500);
    } else {
      setLoading(false);
      showToast("❌ Gagal mengirim absensi.", "error");
    }
  })
  .catch(err => {
    console.error(err);
    setLoading(false);
    showToast("❌ Terjadi kesalahan jaringan.", "error");
  });
});
