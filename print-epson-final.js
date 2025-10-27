// === SDS SNACK PRINT MODULE - EPSON LAN ===
// Versi 4.0 — Auto Check SDK & Auto Retry Koneksi
// Kompatibel Epson TM-T82 LAN / Wi-Fi
// Dibuat khusus untuk SDS SNACK

window.printStrukEpsonLAN = async function (printerIP, data) {
  // Pastikan SDK Epson siap
  if (typeof epson === "undefined" || !epson.ePOSDevice) {
    console.warn("[EPSON] SDK belum siap. Menunggu 2 detik...");
    document.getElementById("status").textContent =
      "⏳ Menunggu SDK Epson siap...";
    setTimeout(() => {
      printStrukEpsonLAN(printerIP, data);
    }, 2000);
    return;
  }

  try {
    const epos = new epson.ePOSDevice();
    const port = 8008;
    const deviceId = "local_printer";

    console.log(`[EPSON] Menghubungkan ke printer ${printerIP}:${port} ...`);
    const statusElem = document.getElementById("status");
    if (statusElem) statusElem.textContent = "🔄 Menghubungkan printer...";

    epos.connect(printerIP, port, (connectResult) => {
      if (connectResult === "OK" || connectResult === "SSL_CONNECT_OK") {
        console.log("[EPSON] Koneksi sukses!");

        epos.createDevice(
          deviceId,
          epos.DEVICE_TYPE_PRINTER,
          { crypto: false, buffer: false },
          (printer, error) => {
            if (error || !printer) {
              console.error("[EPSON] Gagal membuat device:", error);
              alert("❌ Tidak dapat membuat koneksi ke printer.");
              if (statusElem)
                statusElem.textContent = "❌ Gagal koneksi printer.";
              return;
            }

            const builder = new epson.ePOSBuilder();

            // === HEADER TOKO ===
            builder.addTextAlign(builder.ALIGN_CENTER);
            builder.addText("SDS SNACK\n");
            builder.addText("Menerima Pesanan Snack Box,\n");
            builder.addText("Aneka Kue dan Roti\n");
            builder.addText("Jln Raya Dieng Km 17 Kejajar\n");
            builder.addText("Wonosobo 56354\n");
            builder.addText("Telp/WA: 082328066205\n");
            builder.addText("------------------------------------------\n");

            builder.addTextAlign(builder.ALIGN_LEFT);
            builder.addText(`Tanggal : ${data.tanggal}\n`);
            if (data.namaKasir)
              builder.addText(`Kasir   : ${data.namaKasir}\n`);
            builder.addText("------------------------------------------\n");

            // === ISI ITEM ===
            data.items.forEach((item) => {
              builder.addText(`${item.nama}\n`);
              builder.addText(
                `${item.qty} x ${item.harga.toLocaleString(
                  "id-ID"
                )} = ${item.jumlah.toLocaleString("id-ID")}\n`
              );
            });

            builder.addText("------------------------------------------\n");
            builder.addTextAlign(builder.ALIGN_RIGHT);
            builder.addText(
              `TOTAL : Rp ${data.total.toLocaleString("id-ID")}\n`
            );
            builder.addText("------------------------------------------\n");

            // === FOOTER ===
            builder.addTextAlign(builder.ALIGN_CENTER);
            builder.addText("Terima Kasih\n");
            builder.addText("Selamat Menikmati\n");
            builder.addText("Follow IG: @sdssnack.official\n\n");
            builder.addCut(builder.CUT_FEED);

            // === KIRIM KE PRINTER ===
            console.log("[EPSON] Mengirim struk ke printer...");
            printer.send(builder.toString());
            epos.disconnect();

            console.log("[EPSON] Struk terkirim & koneksi ditutup.");
            if (statusElem)
              statusElem.textContent = "✅ Struk berhasil dicetak.";
          }
        );
      } else {
        console.warn("[EPSON] Gagal koneksi:", connectResult);
        if (statusElem)
          statusElem.textContent =
            "⚠️ Printer tidak merespons, mencoba ulang...";
        // Auto retry
        setTimeout(() => {
          printStrukEpsonLAN(printerIP, data);
        }, 3000);
      }
    });
  } catch (err) {
    console.error("[EPSON ERROR]", err);
    alert("❌ Terjadi error: " + err.message);
    const statusElem = document.getElementById("status");
    if (statusElem) statusElem.textContent = "❌ Error koneksi printer.";
  }
};
