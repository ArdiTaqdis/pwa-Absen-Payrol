// === SDS SNACK PRINT MODULE ===
// Versi Profesional - Cetak Langsung ke RawBT (Epson TM-T82)

// Fungsi posisi teks
function alignLeft(text) {
  return "\x1B\x61\x00" + text; // ESC a 0 (left)
}
function alignCenter(text) {
  return "\x1B\x61\x01" + text; // ESC a 1 (center)
}
function alignRight(text) {
  return "\x1B\x61\x02" + text; // ESC a 2 (right)
}
function line() {
  return "------------------------------------------\n";
}

async function printStrukRawBT(data) {
  try {
    const { printerIP, items, total, tanggal } = data;

    let text = "";

    // === HEADER TOKO ===
    text += alignCenter("SDS SNACK\n");
    text += alignCenter("Menerima Pesanan Snack Box,\n");
    text += alignCenter("Aneka Kue dan Roti\n");
    text += alignCenter("Jln Raya Dieng Km 17 Kejajar\n");
    text += alignCenter("Wonosobo 56354\n");
    text += alignCenter("Telp/WA: 082328066205\n");
    text += line();
    text += alignLeft(`Tanggal : ${tanggal}\n`);
    text += line();

    // === ISI ITEM ===
    items.forEach((item) => {
      text += `${item.nama}\n${
        item.qty
      } x ${item.harga.toLocaleString()} = ${item.jumlah.toLocaleString()}\n`;
    });

    text += line();
    text += alignRight(`TOTAL: Rp ${total.toLocaleString()}\n`);
    text += line();

    // === FOOTER ===
    text += alignCenter("Terima Kasih\n");
    text += alignCenter("Selamat Menikmati\n");
    text += alignCenter("Follow IG: @sdssnack.official\n\n\n\n");

    // === KIRIM KE RAWBT ===
    const printUrl = `intent:rawbtprint#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;S.text=${encodeURIComponent(
      text
    )};end`;
    window.location.href = printUrl;
  } catch (err) {
    alert("❌ Gagal mencetak via RawBT: " + err.message);
  }
}
