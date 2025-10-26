/* =========================================================
   print-rawbt.js — SDS SNACK 💜
   Versi khusus printer ESC/POS via RawBT (Android)
   ========================================================= */

function printStrukRawBT(data) {
  try {
    if (!data || !data.items || data.items.length === 0) {
      alert("⚠️ Tidak ada item untuk dicetak!");
      return;
    }

    // 💜 Header
    let struk = "";
    struk += center("💜 SDS SNACK 💜") + "\n";
    struk += center("Toko Kue & Roti") + "\n";
    struk += center("Banyuwangi - 2025") + "\n";
    struk += "========================================\n";
    struk += alignLeft(`Tanggal: ${data.tanggal}`) + "\n";
    struk += "----------------------------------------\n";

    // 🧁 Daftar Item
    data.items.forEach((i) => {
      const nama = i.nama.length > 24 ? i.nama.slice(0, 24) : i.nama;
      struk += `${nama}\n`;
      struk += `${padRight(
        i.qty + "x" + i.harga.toLocaleString(),
        20
      )}Rp${padLeft(i.jumlah.toLocaleString(), 10)}\n`;
    });

    struk += "----------------------------------------\n";
    struk +=
      padRight("TOTAL", 20) +
      "Rp" +
      padLeft(data.total.toLocaleString(), 10) +
      "\n";
    struk += "========================================\n";
    struk += center("Terima kasih 💜") + "\n";
    struk += center("Fresh Everyday!") + "\n";
    struk += center("~ SDS Snack ~") + "\n\n\n\n";

    // 🚀 Kirim ke RawBT (Android intent)
    const rawbtURL = "rawbt:print?text=" + encodeURIComponent(struk);
    window.location.href = rawbtURL;

    // ✅ Update status (kalau ada elemen #status di halaman)
    const status = document.getElementById("status");
    if (status) status.textContent = "🖨 Mengirim ke aplikasi RawBT...";
  } catch (err) {
    console.error(err);
    alert("❌ Gagal mencetak via RawBT: " + err.message);
    window.print(); // fallback
  }
}

/* =========================================================
   UTILITAS FORMAT STRUK
   ========================================================= */
function padLeft(str, width) {
  str = str.toString();
  return str.length >= width ? str : " ".repeat(width - str.length) + str;
}

function padRight(str, width) {
  str = str.toString();
  return str.length >= width ? str : str + " ".repeat(width - str.length);
}

function center(str) {
  const width = 40;
  const left = Math.floor((width - str.length) / 2);
  return " ".repeat(left) + str;
}
