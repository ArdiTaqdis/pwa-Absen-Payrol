// === SDS SNACK PRINT MODULE (RAW MODE) ===
// Versi Profesional - RawBT Binary (Base64 ESC/POS)

function escAlign(n) {
  return [0x1b, 0x61, n]; // ESC a n (0=left,1=center,2=right)
}

function textLine(str = "") {
  return new TextEncoder().encode(str + "\n");
}

function line() {
  return new TextEncoder().encode(
    "------------------------------------------\n"
  );
}

// 🔥 KONVERSI Uint8Array -> Base64
function toBase64(uint8array) {
  let binary = "";
  uint8array.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

async function printStrukRawBT(data) {
  try {
    const { items, total, tanggal } = data;

    // Buat array buffer penampung ESC/POS
    let chunks = [];

    // === HEADER TOKO ===
    chunks.push(new Uint8Array(escAlign(1))); // center
    chunks.push(textLine("SDS SNACK"));
    chunks.push(textLine("Menerima Pesanan Snack Box,"));
    chunks.push(textLine("Aneka Kue dan Roti"));
    chunks.push(textLine("Jln Raya Dieng Km 17 Kejajar"));
    chunks.push(textLine("Wonosobo 56354"));
    chunks.push(textLine("Telp/WA: 082328066205"));
    chunks.push(line());
    chunks.push(new Uint8Array(escAlign(0))); // left
    chunks.push(textLine(`Tanggal : ${tanggal}`));
    chunks.push(line());

    // === ISI ITEM ===
    items.forEach((item) => {
      chunks.push(textLine(item.nama));
      chunks.push(
        textLine(
          `${item.qty} x ${item.harga.toLocaleString(
            "id-ID"
          )} = ${item.jumlah.toLocaleString("id-ID")}`
        )
      );
    });

    chunks.push(line());
    chunks.push(new Uint8Array(escAlign(2))); // right
    chunks.push(textLine(`TOTAL: Rp ${total.toLocaleString("id-ID")}`));
    chunks.push(line());

    // === FOOTER ===
    chunks.push(new Uint8Array(escAlign(1))); // center
    chunks.push(textLine("Terima Kasih"));
    chunks.push(textLine("Selamat Menikmati"));
    chunks.push(textLine("Follow IG: @sdssnack.official"));
    chunks.push(textLine("\n\n\n\n"));

    // === CUT KERTAS (ESC i) ===
    chunks.push(new Uint8Array([0x1d, 0x56, 0x00]));

    // Gabungkan semua byte
    const allBytes = new Uint8Array(
      chunks.reduce((acc, b) => acc + b.length, 0)
    );
    let offset = 0;
    chunks.forEach((b) => {
      allBytes.set(b, offset);
      offset += b.length;
    });

    // Encode ke Base64
    const base64Data = toBase64(allBytes);

    // === KIRIM KE RAWBT (MODE RAW) ===
    const printUrl = `intent:rawbtprint#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;S.raw=${base64Data};end`;

    console.log("[PRINT] Sending RAW ESC/POS data to RawBT...");
    setTimeout(() => {
      window.location.href = printUrl;
    }, 500);
  } catch (err) {
    alert("❌ Gagal mencetak via RawBT: " + err.message);
  }
}
