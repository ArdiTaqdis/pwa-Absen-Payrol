const URL = 'https://script.google.com/macros/s/AKfycbzqeOs5tlgoGE5FgYRconhexD48qxbLg6hRd0G4tTvjvsicYl0v8boDw0d9CioX7nk/exec';

document.addEventListener("DOMContentLoaded", () => {
  const nip = localStorage.getItem('nip') || '';
  const nama = localStorage.getItem('nama') || '';
  document.getElementById('nip').value = nip;
  document.getElementById('nama').value = nama;

  const now = new Date();
  document.getElementById('tanggal').value = now.toLocaleDateString('id-ID');
  document.getElementById('jam').value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const jamInt = now.getHours();
  document.getElementById('jenis').value = (jamInt >= 5 && jamInt < 12) ? "Masuk" : "Pulang";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lokasi = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      document.getElementById('lokasi').value = lokasi;
    }, () => {
      document.getElementById('lokasi').value = "Tidak tersedia";
    });
  }

  // Preview foto otomatis
  document.getElementById('foto').addEventListener('change', () => {
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
  });
});

async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // full base64 string
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function kirimAbsen() {
  const tombol = document.querySelector("button");
  const loading = document.getElementById("loading");
  tombol.disabled = true;
  loading.style.display = "flex";

  try {
    const nip = document.getElementById("nip").value;
    const nama = document.getElementById("nama").value;
    const tanggal = document.getElementById("tanggal").value;
    const jam = document.getElementById("jam").value;
    const lokasi = document.getElementById("lokasi").value;
    const jenis = document.getElementById("jenis").value;

    const file = document.getElementById("foto").files[0];
    let foto = "";
    if (file) foto = await toBase64(file);

    const payload = { nip, nama, tanggal, jam, lokasi, jenis, foto };

    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
