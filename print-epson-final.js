// === SDS SNACK PRINT MODULE - EPSON LAN ===
// Versi stabil 100% tanpa RawBT (langsung ke IP printer)

async function printStrukEpsonLAN(printerIP, data) {
  try {
    const epos = new epson.ePOSDevice();
    const port = 8008;
    const deviceId = "local_printer";

    console.log(`[EPSON] Menghubungkan ke printer ${printerIP}:${port} ...`);

    epos.connect(printerIP, port, (connectResult) => {
      if (connectResult === "OK" || connectResult === "SSL_CONNECT_OK") {
        console.log("[EPSON] Koneksi sukses!");

        epos.createDevice(
          deviceId,
          epos.DEVICE_TYPE_PRINTER,
          { crypto: false, buffer: false },
          (printer, error) => {
            if (error) {
              console.error("[EPSON] Gagal membuat device:", error);
              alert("❌ Tidak dapat membuat koneksi ke printer.");
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

            // === ITEM LIST ===
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

            printer.send(builder.toString());
            epos.disconnect();

            console.log("[EPSON] Struk terkirim dan koneksi ditutup.");
            document.getElementById("status").textContent =
              "✅ Struk berhasil dicetak.";
          }
        );
      } else {
        alert("❌ Gagal konek ke printer. Pastikan IP benar & ePOS aktif.");
        console.error("[EPSON] Gagal koneksi:", connectResult);
        document.getElementById("status").textContent =
          "❌ Printer tidak ditemukan.";
      }
    });
  } catch (err) {
    console.error("[EPSON ERROR]", err);
    alert("❌ Terjadi error: " + err.message);
    document.getElementById("status").textContent = "❌ Error koneksi printer.";
  }
}
