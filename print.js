/* =========================================================
   print.js — Epson TM-T28 / TM-T82 / TM-m30 compatible
   SDS Snack 💜
   ========================================================= */

let printer = null;
let printerIP = localStorage.getItem("printerIP") || "";
let deviceObj = null;
let statusBox = null;

/**
 * Utilitas — update status di halaman kasir
 */
function updateStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
  console.log("[PRINT]", msg);
}

/**
 * Inisialisasi koneksi printer Epson ePOS
 */
function connectPrinter(ip) {
  return new Promise((resolve, reject) => {
    if (!ip) return reject("❌ IP Printer belum diatur");

    const epos = new epson.ePOSDevice();
    epos.connect(ip, 8008, (data) => {
      if (data === "OK" || data === "SSL_CONNECT_OK") {
        epos.createDevice(
          "local_printer",
          epos.DEVICE_TYPE_PRINTER,
          { crypto: false, buffer: false },
          (devobj, code) => {
            if (code === "OK") {
              deviceObj = devobj;
              deviceObj.onstatuschange = (st) => console.log("[STATUS]", st);
              deviceObj.onreceive = (res) =>
                console.log("[RECEIVE]", res.success);
              resolve(deviceObj);
            } else {
              reject("Gagal create device printer (" + code + ")");
            }
          }
        );
      } else {
        reject("Koneksi ke printer gagal. Cek IP & jaringan.");
      }
    });
  });
}

/**
 * Fungsi utama cetak struk ke Epson
 */
async function printStrukEpson(data) {
  try {
    statusBox = document.getElementById("status");
    updateStatus("🔄 Menghubungkan ke printer...");

    if (!printerIP) {
      printerIP = prompt("Masukkan IP Printer Epson:");
      if (!printerIP) throw new Error("IP Printer belum diatur.");
      localStorage.setItem("printerIP", printerIP);
    }

    printer = await connectPrinter(printerIP);
    updateStatus("🖨 Terhubung, menyiapkan struk...");

    // format thermal 42 chars per line
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addTextSmooth(true);
    printer.addTextStyle(false, false, true, printer.COLOR_1);
    printer.addText("💜 SDS SNACK 💜\n");
    printer.addText("Toko Kue & Roti\n");
    printer.addText("Jl. Contoh No. 12, Banyuwangi\n");
    printer.addText("-------------------------------\n");
    printer.addText(`Tanggal: ${data.tanggal}\n`);
    printer.addText("-------------------------------\n");
    printer.addTextAlign(printer.ALIGN_LEFT);

    // daftar item
    data.items.forEach((i) => {
      const nama = i.nama.substring(0, 20).padEnd(20, " ");
      const qty = i.qty.toString().padStart(2, " ");
      const harga = i.harga.toLocaleString().padStart(8, " ");
      const total = i.jumlah.toLocaleString().padStart(10, " ");
      printer.addText(`${nama}${qty}x${harga}\n`);
      printer.addTextAlign(printer.ALIGN_RIGHT);
      printer.addText(`Rp ${total}\n`);
      printer.addTextAlign(printer.ALIGN_LEFT);
    });

    printer.addText("-------------------------------\n");
    printer.addTextAlign(printer.ALIGN_RIGHT);
    printer.addTextSize(2, 2);
    printer.addText(`TOTAL: Rp ${data.total.toLocaleString()}\n`);
    printer.addTextSize(1, 1);
    printer.addTextAlign(printer.ALIGN_CENTER);
    printer.addText("-------------------------------\n");
    printer.addText("Terima kasih 💜\n");
    printer.addText("SDS Snack - Fresh Everyday!\n\n");
    printer.addCut(printer.CUT_FEED);
    printer.send();

    updateStatus("✅ Struk berhasil dikirim ke printer!");
  } catch (err) {
    console.error(err);
    updateStatus("⚠️ " + (err.message || err));
    fallbackPrint(data);
  }
}

/**
 * Fallback cetak ke jendela browser
 */
function fallbackPrint(data) {
  const w = window.open("", "PRINT", "width=400,height=600");
  w.document.write(`
  <html><head><title>Struk SDS Snack</title>
  <style>
    body { font-family: 'Consolas', monospace; font-size: 12px; }
    h3 { text-align:center; color:#8067eb; margin-bottom:0; }
    p { text-align:center; margin:2px 0; }
    table { width:100%; border-collapse:collapse; font-size:12px; margin-top:5px; }
    td { padding:2px; }
    tfoot td { border-top:1px solid #999; font-weight:bold; }
  </style></head><body>
  <h3>SDS SNACK 💜</h3>
  <p>Toko Kue & Roti</p>
  <hr>
  <p>${data.tanggal}</p>
  <table>
    ${data.items
      .map(
        (i) =>
          `<tr><td>${i.nama}</td><td>${
            i.qty
          }</td><td>${i.harga.toLocaleString()}</td><td>${i.jumlah.toLocaleString()}</td></tr>`
      )
      .join("")}
    <tfoot><tr><td colspan="3">TOTAL</td><td>Rp ${data.total.toLocaleString()}</td></tr></tfoot>
  </table>
  <p>Terima kasih telah berbelanja 💜</p>
  </body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}
