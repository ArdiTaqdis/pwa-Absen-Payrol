// SDS Print Bridge v1.0
// Kirim ESC/POS data ke printer Epson LAN via port 9100

import net from "net";
import express from "express";
import os from "os";

const app = express();
app.use(express.text({ type: "*/*" }));
app.use(cors()); // ✅ IZINKAN semua origin (fix CORS)

// IP printer dan port Epson kamu
const PRINTER_IP = "192.168.1.150";
const PRINTER_PORT = 9100;

// Menemukan IP lokal (biar tahu di LAN kamu)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

// Endpoint print
app.post("/print", (req, res) => {
  const data = req.body;
  const client = new net.Socket();

  client.connect(PRINTER_PORT, PRINTER_IP, () => {
    console.log(`[RAW] Terhubung ke printer ${PRINTER_IP}:${PRINTER_PORT}`);
    client.write(data, "binary");
    client.end();
    res.send("✅ Struk berhasil dikirim ke printer (port 9100)");
  });

  client.on("error", (err) => {
    console.error("[RAW] Gagal print:", err.message);
    res.status(500).send("❌ Gagal kirim ke printer: " + err.message);
  });
});

// Jalankan server
const port = 3000;
app.listen(port, () => {
  console.log("🖨️ SDS Print Bridge aktif!");
  console.log(`🌐 Akses: http://${getLocalIP()}:${port}/print`);
  console.log(`➡️ Printer: ${PRINTER_IP}:${PRINTER_PORT}`);
  console.log("Tekan CTRL + C untuk berhenti.");
});
