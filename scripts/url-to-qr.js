const QRCode = require("qrcode");
const path = require("node:path");

const [, , urlInput, outputInput = "qr-code.png"] = process.argv;

if (!urlInput) {
  console.error("Usage: npm run qr -- <url> [output.png]");
  process.exit(1);
}

let url;

try {
  url = new URL(urlInput);
} catch {
  console.error(`Invalid URL: ${urlInput}`);
  process.exit(1);
}

if (!['http:', 'https:'].includes(url.protocol)) {
  console.error("The URL must start with http:// or https://");
  process.exit(1);
}

const outputPath = path.resolve(outputInput);

QRCode.toFile(outputPath, urlInput, {
  type: "png",
  width: 1024,
  margin: 4,
  errorCorrectionLevel: "H",
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
})
  .then(() => {
    console.log(`QR code created: ${outputPath}`);
    console.log(`Encoded URL: ${urlInput}`);
  })
  .catch((error) => {
    console.error("Could not create QR code:", error.message);
    process.exit(1);
  });
