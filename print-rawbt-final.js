// === SDS SNACK Print via RawBT (with Logo) ===
// Buatan khusus buat sistem kasir SDS Snack 💜
// Kompatibel dengan Epson TM-T82 (ESC/POS TCP & RawBT)

function printStrukRawBT(data) {
  try {
    const ESC = "\x1B";
    const GS = "\x1D";

    // === Helper ESC/POS Command ===
    const alignLeft = (txt) => ESC + "\x61\x00" + txt;
    const alignCenter = (txt) => ESC + "\x61\x01" + txt;
    const alignRight = (txt) => ESC + "\x61\x02" + txt;
    const boldOn = () => ESC + "\x45\x01";
    const boldOff = () => ESC + "\x45\x00";

    // === Logo SDS Snack (base64 PNG) ===
    const logoBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAABfklEQVR4nO3cMQ0AIAzAsIF/52gJuqLr4XqQs7AHHz4AAADgK+HICAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAX8ZfAL2ggAA4OwB3Z4AAAAASUVORK5CYII=";

    // === ESC/POS Header Logo ===
    let text = "";
    text += alignCenter(boldOn());
    text += "\x1C\x70\x01\x00"; // Command for image (RawBT compatible)
    text += boldOff();
    text += "\n";

    // === HEADER ===
    text += alignCenter(boldOn() + "SDS SNACK\n");
    text += boldOff();
    text += alignCenter("Menerima Pesanan Snack Box,\n");
    text += alignCenter("Aneka Kue dan Roti\n");
    text += alignCenter("--------------------------------\n");
    text += alignCenter("Jln Raya Dieng Km 17 Kejajar Wonosobo 56354\n");
    text += alignCenter("Tlp/WA: 0823-2806-6205\n");
    text += alignCenter("--------------------------------\n");
    text += alignLeft("Tanggal : " + data.tanggal + "\n");
    text += alignCenter("--------------------------------\n");

    // === ITEM LIST ===
    data.items.forEach((item) => {
      const total = item.harga * item.qty;
      text += alignLeft(
        `${item.nama}\n${
          item.qty
        } x ${item.harga.toLocaleString()}  = ${total.toLocaleString()}\n`
      );
    });
    text += alignCenter("--------------------------------\n");

    // === TOTAL ===
    text += boldOn();
    text += alignRight("TOTAL: Rp " + data.total.toLocaleString() + "\n");
    text += boldOff();
    text += alignCenter("--------------------------------\n");

    // === FOOTER ===
    text += alignCenter("Terima Kasih 🙏\n");
    text += alignCenter("Selamat Menikmati!\n");
    text += alignCenter("Follow IG: @sdssnack.official\n");
    text += "\n\n\n";
    text += GS + "V" + "\x00"; // ✅ ESC/POS Partial Cut

    // === Send to RawBT ===
    const printData = encodeURIComponent(text);
    const intentURL = `intent:rawbtprint#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;S.text=${printData};end`;

    window.location.href = intentURL;
  } catch (err) {
    alert("❌ Gagal mencetak via RawBT: " + err.message);
  }
}
