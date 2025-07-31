const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const cors = require("cors");
const Jimp = require("jimp");

const app = express();
const upload = multer();

app.use(cors());

function cleanName(line) {
  const badSuffixes = [
    "TT",
    "IT",
    "FT",
    "RT",
    "11",
    "II",
    "]",
    "[",
    "|",
    "\\",
    "/",
    "}",
    "{",
    "-",
    "™",
    '"',
    "'",
  ];

  // Remove known suffixes (only if they’re at the end)
  const parts = line.trim().split(" ");

  while (parts.length > 0) {
    const last = parts[parts.length - 1];
    if (
      badSuffixes.includes(last) ||
      /^[^A-Za-z]+$/.test(last) || // symbols
      (last.length <= 2 && /[^aeiou]/i.test(last)) // 1–2 letter consonant chunks
    ) {
      parts.pop();
    } else {
      break;
    }
  }

  return parts.join(" ");
}

function calculateAge(dob) {
  // dob in yyyy-mm-dd
  const [year, month, day] = dob.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }
  return age;
}

function parseMyKadText(text) {
  const raw = text;

  // Step 1: Clean lines
  let lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && /[A-Za-z0-9]/.test(l));

  const bannedKeywords = [
    "KAD",
    "PENGENALAN",
    "ISLAM",
    "LELAKI",
    "PEREMPUAN",
    "MYKAD",
    "MWkKade",
    "ox op",
    "SID",
  ];
  lines = lines.filter((line) => {
    const symbolsRatio =
      line.replace(/[A-Za-z0-9\s]/g, "").length / line.length || 0;
    const hasTooManySymbols = symbolsRatio > 0.3;
    const hasBanned = bannedKeywords.some((kw) =>
      line.toUpperCase().includes(kw)
    );
    return !hasTooManySymbols && !hasBanned;
  });

  // Step 2: Extract NRIC
  const nricMatch = text.match(/\b\d{6}-\d{2}-\d{4}\b|\b\d{12}\b/);
  const nric = nricMatch ? nricMatch[0].replace(/-/g, "") : "";

  // Step 3: Extract DOB from NRIC
  let dob = "";
  if (nric.length >= 6) {
    const yy = nric.slice(0, 2);
    const mm = nric.slice(2, 4);
    const dd = nric.slice(4, 6);
    const year = parseInt(yy, 10);
    dob = `${year > 30 ? "19" : "20"}${yy}-${mm}-${dd}`;
  }

  // Step 4: Extract Name
  const nameLines = lines.filter((l) => /^[A-Z\s]+$/.test(l));
  const rawName = nameLines.sort((a, b) => b.length - a.length)[0] || "";
  const fullName = cleanName(rawName);

  let firstName = "",
    lastName = "";
  if (fullName) {
    const parts = fullName.split(" ");
    firstName = parts[0];
    lastName = parts.slice(1).join(" ");
  }

  // Step 5: Word list (optional)
  const words = lines.flatMap((l) => l.split(/\s+/)).filter(Boolean);

  return {
    raw,
    lines,
    words,
    nric,
    dob,
    fullName,
    firstName,
    lastName,
  };
}

async function preprocessImage(buffer) {
  const image = await Jimp.read(buffer);

  image
    .grayscale()
    .contrast(1)
    .resize(image.bitmap.width * 2, image.bitmap.height * 2);

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    const { buffer } = req.file;
    const cleanBuffer = await preprocessImage(buffer);

    const {
      data: { text },
    } = await Tesseract.recognize(cleanBuffer, "eng", {
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ",
      preserve_interword_spaces: 1,
    });

    const extracted = parseMyKadText(text);

    if (extracted.dob) {
      const age = calculateAge(extracted.dob);
      if (age < 18) {
        return res.status(400).json({
          error: "User is under 18 years old.",
          underage: true,
        });
      }
    }

    res.json({
      text,
      ...extracted,
    });
  } catch (err) {
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

app.listen(4000, () => {
  console.log("🚀 OCR server running on http://localhost:4000");
});
