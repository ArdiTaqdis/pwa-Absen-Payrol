// === SDS SNACK RawBT LAN (Epson TM-T82 TCP Mode) ===
function printStrukRawBT(data) {
  try {
    const ESC = "\x1B";
    const GS = "\x1D";
    const LF = "\x0A";

    // Format ESC/POS basic
    const alignLeft = (t) => ESC + "\x61\x00" + t;
    const alignCenter = (t) => ESC + "\x61\x01" + t;
    const alignRight = (t) => ESC + "\x61\x02" + t;
    const boldOn = () => ESC + "\x45\x01";
    const boldOff = () => ESC + "\x45\x00";

    let text = "";
    text += ESC + "@"; // Initialize printer
    text += alignCenter(boldOn() + "SDS SNACK\n" + boldOff());
    text += alignCenter("Menerima Pesanan Snack Box,\n");
    text += alignCenter("Aneka Kue dan Roti\n");
    text += alignCenter("--------------------------------\n");
    text += alignCenter("Jln Raya Dieng Km 17 Kejajar Wonosobo 56354\n");
    text += alignCenter("Tlp/WA: 0823-2806-6205\n");
    text += alignCenter("--------------------------------\n");
    text += alignLeft("Tanggal: " + data.tanggal + "\n");
    text += alignCenter("--------------------------------\n");

    data.items.forEach((item) => {
      const total = item.harga * item.qty;
      text += alignLeft(
        `${item.nama}\n${
          item.qty
        } x ${item.harga.toLocaleString()} = ${total.toLocaleString()}\n`
      );
    });

    text += alignCenter("--------------------------------\n");
    text += boldOn();
    text += alignRight("TOTAL: Rp " + data.total.toLocaleString() + "\n");
    text += boldOff();
    text += alignCenter("--------------------------------\n");
    text += alignCenter("Terima Kasih 🙏\n");
    text += alignCenter("Selamat Menikmati!\n");
    text += LF.repeat(3);
    text += GS + "V" + "\x00"; // Cut paper

    // Konversi ke base64 untuk dikirim ke RawBT LAN
    const b64 = btoa(unescape(encodeURIComponent(text)));

    // URL RawBT LAN printer
    const url = `rawbt://print?data=${b64}`;

    window.location.href = url;
  } catch (e) {
    alert("❌ Gagal mencetak via RawBT LAN: " + e.message);
  }
}
