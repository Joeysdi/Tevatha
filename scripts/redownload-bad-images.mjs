/**
 * Re-download the product images that are Wikimedia error HTML pages.
 * Adds Referer header so Wikimedia CDN allows the download.
 * Run: node scripts/redownload-bad-images.mjs
 */
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/products");

// Remaining 39 bad slugs → Wikipedia article titles for REST API lookup
const BAD_SLUGS = {
  "bfg-ko2-265-70r17":           "https://en.wikipedia.org/wiki/Off-road_tire",
  "black-diamond-spot-400-4pk":  "https://en.wikipedia.org/wiki/Headlamp_(outdoor)",
  "door-armor-max":              "https://en.wikipedia.org/wiki/Door_security",
  "frontrunner-wolfpack-pro-4pk":"https://en.wikipedia.org/wiki/Cargo_carrier",
  "gerber-suspension-nxt":       "https://en.wikipedia.org/wiki/Multi-tool",
  "krieger-1100w-inverter":      "https://en.wikipedia.org/wiki/Power_inverter",
  "kwikset-980-deadbolt":        "https://en.wikipedia.org/wiki/Deadbolt",
  "lifestraw-peak-squeeze":      "https://en.wikipedia.org/wiki/LifeStraw",
  "master-lock-6271-6pk":        "https://en.wikipedia.org/wiki/Padlock",
  "master-lock-shrouded":        "https://en.wikipedia.org/wiki/Padlock",
  "mountain-house-30day":        "https://en.wikipedia.org/wiki/Freeze-drying",
  "msr-trailbase":               "https://en.wikipedia.org/wiki/Tent",
  "nar-cat-tourniquet-4pk":      "https://en.wikipedia.org/wiki/Tourniquet",
  "platypus-gravityworks":       "https://en.wikipedia.org/wiki/Gravity_filtration",
  "rothco-paracord-1000ft":      "https://en.wikipedia.org/wiki/Parachute_cord",
  "sagan-xstream-inline":        "https://en.wikipedia.org/wiki/Water_filter",
  "sea-eagle-330-pro":           "https://en.wikipedia.org/wiki/Inflatable_kayak",
  "sol-escape-bivvy-4pk":        "https://en.wikipedia.org/wiki/Space_blanket",
  "streamlight-protac-2lx":      "https://en.wikipedia.org/wiki/Flashlight",
  "streamlight-protac-hlx":      "https://en.wikipedia.org/wiki/Tactical_light",
  "tred-gt-recovery":            "https://en.wikipedia.org/wiki/Off-roading",
  "warn-zeon-10s":               "https://en.wikipedia.org/wiki/Winch",
  "rea-armenia-tavush":          "https://en.wikipedia.org/wiki/Tavush_Province",
  "rea-bolivia-beni":            "https://en.wikipedia.org/wiki/Beni_Department",
  "rea-brazil-minas":            "https://en.wikipedia.org/wiki/Minas_Gerais",
  "rea-colombia-coffee":         "https://en.wikipedia.org/wiki/Coffee_Cultural_Landscape_of_Colombia",
  "rea-georgia-kakheti":         "https://en.wikipedia.org/wiki/Kakheti",
  "rea-indonesia-lombok":        "https://en.wikipedia.org/wiki/Lombok",
  "rea-japan-hokkaido":          "https://en.wikipedia.org/wiki/Hokkaido",
  "rea-jordan-aqaba":            "https://en.wikipedia.org/wiki/Aqaba",
  "rea-kyrgyzstan-issykkul":     "https://en.wikipedia.org/wiki/Issyk-Kul_Region",
  "rea-mexico-oaxaca":           "https://en.wikipedia.org/wiki/Oaxaca",
  "rea-morocco-atlas":           "https://en.wikipedia.org/wiki/Atlas_Mountains",
  "rea-new-zealand-northland":   "https://en.wikipedia.org/wiki/Northland_Region",
  "rea-romania-transylvania":    "https://en.wikipedia.org/wiki/Transylvania",
  "rea-serbia-sumadija":         "https://en.wikipedia.org/wiki/%C5%A0umadija",
  "rea-slovenia-karst":          "https://en.wikipedia.org/wiki/Karst_Plateau",
  "rea-usa-montana":             "https://en.wikipedia.org/wiki/Montana",
  "rea-zambia-southern":         "https://en.wikipedia.org/wiki/Southern_Province%2C_Zambia",
};

// Extract the Wikipedia article title from a Wikipedia URL
function wikiTitle(url) {
  const m = url.match(/wikipedia\.org\/wiki\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Use Wikipedia REST API to get a reliable thumbnail URL
async function fetchWikiThumb(wikiUrl) {
  const title = wikiTitle(wikiUrl);
  if (!title) throw new Error("Not a Wikipedia URL");

  return new Promise((resolve, reject) => {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const req = https.get(apiUrl, {
      headers: { "User-Agent": "TevathaCrawler/1.0 (https://tevatha.com)" },
    }, (res) => {
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          // Prefer originalimage (full size), fall back to thumbnail
          const src = json.originalimage?.source ?? json.thumbnail?.source;
          if (src) resolve(src);
          else reject(new Error("no thumbnail in API response"));
        } catch (e) {
          reject(new Error("JSON parse error"));
        }
      });
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.on("error", reject);
  });
}

function isRealImage(dest) {
  if (!fs.existsSync(dest)) return false;
  const buf = Buffer.alloc(4);
  const fd = fs.openSync(dest, "r");
  fs.readSync(fd, buf, 0, 4, 0);
  fs.closeSync(fd);
  return (buf[0] === 0xFF && buf[1] === 0xD8) || // JPEG
         (buf[0] === 0x89 && buf[1] === 0x50) || // PNG
         (buf[0] === 0x47 && buf[1] === 0x49) || // GIF
         (buf[0] === 0x52 && buf[1] === 0x49);   // WebP (RIFF)
}

async function main() {
  const slugs = Object.keys(BAD_SLUGS);
  const results = { ok: [], failed: [] };

  console.log(`\nRe-downloading ${slugs.length} bad images with Referer header...\n`);

  for (const slug of slugs) {
    const wikiUrl = BAD_SLUGS[slug];

    // Remove existing bad file(s)
    for (const ext of ["jpg", "png", "jpeg", "webp"]) {
      const f = path.join(OUT_DIR, `${slug}.${ext}`);
      if (fs.existsSync(f) && !isRealImage(f)) fs.unlinkSync(f);
    }

    try {
      const imgUrl = await fetchWikiThumb(wikiUrl);
      const clean = imgUrl.split("?")[0];
      const ext = clean.match(/\.(png|jpg|jpeg|webp)$/i)?.[1]?.toLowerCase() ?? "jpg";
      const dest = path.join(OUT_DIR, `${slug}.${ext}`);

      execFileSync("curl", [
        "-sSL", "--max-time", "20",
        "-H", "User-Agent: Mozilla/5.0 (compatible; TevathaCrawler/1.0)",
        "-H", `Referer: ${wikiUrl}`,
        "-o", dest,
        imgUrl,
      ]);

      if (!isRealImage(dest)) {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        throw new Error("Downloaded file is not a real image");
      }

      results.ok.push(slug);
      process.stdout.write(`  ✓  ${slug} → ${ext} (${fs.statSync(dest).size} bytes)\n`);
    } catch (err) {
      results.failed.push({ slug, error: err.message });
      process.stdout.write(`  ✗  ${slug}: ${err.message}\n`);
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n────────────────────────────────────`);
  console.log(`  Fixed   : ${results.ok.length}`);
  console.log(`  Failed  : ${results.failed.length}`);
  if (results.failed.length) {
    console.log(`\nFailed:`);
    results.failed.forEach(({ slug, error }) => console.log(`  - ${slug}: ${error}`));
  }
}

main().catch(console.error);
