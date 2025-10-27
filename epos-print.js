/* =====================================================
   EPSON ePOS SDK - Offline Simplified Version (58mm Ready)
   Compatible: Epson TM-T82/T88 via LAN (port 8008)
   Author: SDS Snack System
   ===================================================== */

var epson = epson || {};

// =====================================================
// ePOSDevice (simulasi koneksi printer)
// =====================================================
epson.ePOSDevice = function () {
  this.DEVICE_TYPE_PRINTER = "printer";
  this.DEVICE_TYPE_SCANNER = "scanner";
  this.Connected = false;
  console.log("[EpsonSDK] Initialized");
};

epson.ePOSDevice.prototype.connect = function (ip, port, callback) {
  console.log(`[EPSON] Connecting to ${ip}:${port} ...`);
  setTimeout(() => {
    this.Connected = true;
    callback("OK");
  }, 600);
};

epson.ePOSDevice.prototype.createDevice = function (id, type, opt, callback) {
  console.log(`[EPSON] createDevice ${id}`);
  setTimeout(() => {
    const printer = {
      send: async (data) => {
        console.log("[EPSON] Sending ESC/POS data to printer...");
        try {
          await fetch(
            `http://${localStorage.getItem("printerIP")}:8008/epson/posprint`,
            {
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: data,
            }
          );
          console.log("[EPSON] ✅ Data sent successfully!");
        } catch (e) {
          console.error("[EPSON] ❌ Print failed:", e);
        }
      },
    };
    callback(printer, null);
  }, 400);
};

epson.ePOSDevice.prototype.disconnect = function () {
  console.log("[EPSON] Disconnected from printer.");
};

// =====================================================
// ePOSBuilder (membangun format teks ESC/POS)
// =====================================================
epson.ePOSBuilder = function () {
  this.content = "";
  this.Aling_LEFT = 0;
  this.Aling_CENTER = 1;
  this.Aling_RIGHT = 2;
  this.Cut_FULL = 0;
  console.log("[EpsonSDK] Builder ready");
};

// === ALIGNMENT ===
epson.ePOSBuilder.prototype.addTextAlign = function (val) {
  if (val === this.Aling_LEFT) this.content += "\x1B\x61\x00";
  if (val === this.Aling_CENTER) this.content += "\x1B\x61\x01";
  if (val === this.Aling_RIGHT) this.content += "\x1B\x61\x02";
  return this;
};

// === TEXT ===
epson.ePOSBuilder.prototype.addText = function (text) {
  this.content += text;
  return this;
};

// === TEXT SIZE ===
epson.ePOSBuilder.prototype.addTextSize = function (width, height) {
  const n = (width - 1) * 16 + (height - 1);
  this.content += "\x1D\x21" + String.fromCharCode(n);
  return this;
};

// === TEXT STYLE ===
epson.ePOSBuilder.prototype.addTextStyle = function (style) {
  if (style === "bold") this.content += "\x1B\x45\x01"; // Bold on
  else if (style === "underline")
    this.content += "\x1B\x2D\x01"; // Underline on
  else if (style === "normal") this.content += "\x1B\x45\x00\x1B\x2D\x00"; // Reset
  return this;
};

// === LINE ===
epson.ePOSBuilder.prototype.addLine = function () {
  this.content += "--------------------------------\n";
  return this;
};

// === CUT ===
epson.ePOSBuilder.prototype.addCut = function (val) {
  if (val === this.Cut_FULL) this.content += "\x1D\x56\x00";
  return this;
};

// === FEED ===
epson.ePOSBuilder.prototype.addEnd = function () {
  this.content += "\n\n\n";
  return this;
};

// === RETURN OUTPUT ===
epson.ePOSBuilder.prototype.toString = function () {
  return this.content;
};

// === DEBUG LOG ===
console.log(
  "%c[EpsonSDK] ePOSBuilder loaded ✓",
  "color: purple; font-weight: bold"
);
