// === SDS SNACK PRINT MODULE v3.0 ===
// Versi Final — Tanpa Base64, Tanpa Foto, Aman di Semua RawBT

function line() {
  return "------------------------------------------\n";
}

async function printStrukRawBT(data) {
  try {
    const { items, total, tanggal, namaKasir } = data;
    let text = "";

    // === HEADER TOKO ===
    text += "           SDS SNACK\n";
    text += "  Menerima Pesanan Snack Box,\n";
    text += "     Aneka Kue dan Roti\n";
    text += " Jln Raya Dieng Km 17 Kejajar\n";
    text += "      Wonosobo 56354\n";
    text += "   Telp/WA: 082328066205\n";
    text += line();
    text += `Tanggal : ${tanggal}\n`;
    if (namaKasir) text += `Kasir   : ${namaKasir}\n`;
    text += line();

    // === ITEM LIST ===
    items.forEach((item) => {
      text += `${item.nama}\n`;
      text += `${item.qty} x ${item.harga.toLocaleString(
        "id-ID"
      )} = ${item.jumlah.toLocaleString("id-ID")}\n`;
    });

    text += line();
    text += `TOTAL : Rp ${total.toLocaleString("id-ID")}\n`;
    text += line();

    // === FOOTER ===
    text += "        Terima Kasih\n";
    text += "       Selamat Menikmati\n";
    text += " Follow IG: @sdssnack.official\n";
    text += "\n\n\n\n"; // feed paper keluar

    // === KIRIM KE RAWBT (Mode Text Aman) ===
    const encodedText = encodeURIComponent(text);
    const printUrl = `intent:rawbtprint#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;S.text=${encodedText};end`;

    console.log("[PRINT] Mengirim teks ke RawBT...");
    setTimeout(() => {
      window.location.href = printUrl;
    }, 500); // delay kecil biar Android sempat proses
  } catch (err) {
    alert("❌ Gagal mencetak: " + err.message);
  }
}
