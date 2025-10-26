/* =========================================================
   print.js — SDS Snack Version 💜
   Integrasi ePOS Printer Epson + fallback window.print()
   ========================================================= */

let printer = null;
let printerIP = localStorage.getItem("printerIP") || "";
let statusBox = null;

/**
 * Inisialisasi printer Epson
 */
function initPrinter(ip) {
  return new Promise((resolve, reject) => {
    if (!ip) return reject("⚠️ IP Printer belum disetel.");

    const url = `http://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=6000`;
    printer = new epson.ePOSDevice();

    printer.connect(ip, 8008, (data) => {
      if (data === "OK" || data === "SSL_CONNECT_OK") {
        printer.createDevice(
          "local_printer",
          printer.DEVICE_TYPE_PRINTER,
          { crypto: false, buffer: false },
          (devobj, code) => {
            if (code === "OK") {
              printer = devobj;
              printer.onreceive = (res) => {
                console.log("[PRINT] Status:", res);
              };
              resolve("✅ Terhubung ke printer Epson");
            } else {
              reject("❌ Gagal membuat device printer. Kode: " + code);
            }
          }
        );
      } else {
        reject("❌ Gagal konek ke printer (cek IP dan jaringan)");
      }
    });
  });
}

/**
 * Cetak struk ke printer Epson
 * @param {Object} data
 */
async function printStrukEpson(data) {
  try {
    statusBox = document.getElementById("status");
    updateStatus("🔄 Menghubungkan ke printer...");

    // pastikan printer IP tersimpan
    if (!printerIP) {
      printerIP = prompt("Masukkan IP Printer Epson:");
      if (!printerIP) throw new Error("IP printer belum diatur.");
      localStorage.setItem("printerIP", printerIP);
    }

    // koneksi printer
    await initPrinter(printerIP);
    updateStatus("🖨 Sedang mencetak struk...");

    // header
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addTextSmooth(true);
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    printer.addText("💜 SDS SNACK 💜\n");
    printer.addText("Toko Kue & Roti\n");
    printer.addText("-------------------------------\n");
    printer.addText(`Tanggal: ${data.tanggal}\n`);
    printer.addTextAlign(printer.ALIGN_LEFT);
    printer.addText("-------------------------------\n");

    // isi item
    data.items.forEach((item) => {
      printer.addText(`${item.nama}\n`);
      printer.addTextRight(
        `${
          item.qty
        } x ${item.harga.toLocaleString()} = Rp ${item.jumlah.toLocaleString()}\n`
      );
    });

    printer.addText("-------------------------------\n");
    printer.addTextAlign(printer.ALIGN_RIGHT);
    printer.addTextSize(2, 2);
    printer.addText(`Total: Rp ${data.total.toLocaleString()}\n`);
    printer.addTextSize(1, 1);
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addText("-------------------------------\n");
    printer.addText("Terima kasih sudah berbelanja 💜\n");
    printer.addText("SDS Snack - Fresh Everyday!\n\n");
    printer.addCut(printer.CUT_FEED);

    printer.send();
    updateStatus("✅ Struk berhasil dikirim ke printer!");
  } catch (err) {
    console.error(err);
    updateStatus(err.message || err);
    fallbackPrint(data);
  }
}

/**
 * Fallback cetak browser (window.print)
 * @param {Object} data
 */
function fallbackPrint(data) {
  console.log("[PRINT] Fallback mode aktif (window.print)");
  const win = window.open("", "PRINT", "height=600,width=400");
  win.document.write(`
    <html><head><title>Struk SDS Snack</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; text-align: center; margin: 20px; }
      h3 { color: #8067eb; margin-bottom: 5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem; }
      th, td { border-bottom: 1px dashed #ccc; padding: 6px; text-align: center; }
      tfoot td { font-weight: bold; border-top: 1px solid #aaa; }
    </style>
    </head><body>
      <h3>💜 SDS SNACK 💜</h3>
      <p><small>Toko Kue & Roti</small></p>
      <hr>
      <p>${data.tanggal}</p>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Total</th></tr></thead>
        <tbody>
          ${data.items
            .map(
              (i) => `
            <tr>
              <td>${i.nama}</td>
              <td>${i.qty}</td>
              <td>${i.harga.toLocaleString()}</td>
              <td>${i.jumlah.toLocaleString()}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr><td colspan="3">TOTAL</td><td>Rp ${data.total.toLocaleString()}</td></tr>
        </tfoot>
      </table>
      <p>Terima kasih telah berbelanja di <b>SDS Snack</b> 💜</p>
      <p><small>Dicetak otomatis - ${data.tanggal}</small></p>
    </body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

/**
 * Update tampilan status di halaman kasir
 */
function updateStatus(msg) {
  if (statusBox) statusBox.textContent = msg;
  else console.log("[PRINT STATUS]", msg);
}
