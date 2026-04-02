/**
 * Download REA listing images into /public/products/
 * Uses Wikipedia og:image (CC-licensed landscape photos) for each region.
 * Run: node scripts/download-rea-images.mjs
 */
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/products");

// Map: imageSlug → Wikipedia article URL for that region
const REA_PAGES = {
  // ── Europe — Northern ────────────────────────────────────────────────────
  "rea-sweden-norrland":       "https://en.wikipedia.org/wiki/Norrland",
  "rea-denmark-jutland":       "https://en.wikipedia.org/wiki/Jutland",
  "rea-ireland-connaught":     "https://en.wikipedia.org/wiki/Connacht",
  "rea-uk-scotland":           "https://en.wikipedia.org/wiki/Scottish_Highlands",
  "rea-estonia-saaremaa":      "https://en.wikipedia.org/wiki/Saaremaa",
  "rea-latvia-latgale":        "https://en.wikipedia.org/wiki/Latgale",
  "rea-lithuania-dzukija":     "https://en.wikipedia.org/wiki/Dz%C5%ABkija_National_Park",

  // ── Europe — Western / Central ───────────────────────────────────────────
  "rea-austria-styria":        "https://en.wikipedia.org/wiki/Styria",
  "rea-austria-burgenland":    "https://en.wikipedia.org/wiki/Burgenland",
  "rea-germany-bavaria":       "https://en.wikipedia.org/wiki/Bavaria",
  "rea-france-auvergne":       "https://en.wikipedia.org/wiki/Auvergne_(region)",
  "rea-spain-extremadura":     "https://en.wikipedia.org/wiki/Extremadura",
  "rea-italy-abruzzo":         "https://en.wikipedia.org/wiki/Abruzzo",
  "rea-greece-epirus":         "https://en.wikipedia.org/wiki/Epirus_(region)",
  "rea-czech-bohemia":         "https://en.wikipedia.org/wiki/Bohemia",
  "rea-slovenia-karst":        "https://en.wikipedia.org/wiki/Karst_Plateau",
  "rea-slovakia-tatras":       "https://en.wikipedia.org/wiki/Tatra_Mountains",
  "rea-croatia-dalmatia":      "https://en.wikipedia.org/wiki/Dalmatia",

  // ── Europe — Eastern ─────────────────────────────────────────────────────
  "rea-poland-mazury":         "https://en.wikipedia.org/wiki/Masuria",
  "rea-hungary-baranya":       "https://en.wikipedia.org/wiki/Baranya_County",
  "rea-romania-transylvania":  "https://en.wikipedia.org/wiki/Transylvania",
  "rea-bulgaria-rhodope":      "https://en.wikipedia.org/wiki/Rhodopes",
  "rea-serbia-sumadija":       "https://en.wikipedia.org/wiki/%C5%A0umadija",
  "rea-montenegro-highlands":  "https://en.wikipedia.org/wiki/Montenegro",

  // ── North America ─────────────────────────────────────────────────────────
  "rea-usa-montana":           "https://en.wikipedia.org/wiki/Montana",
  "rea-canada-quebec":         "https://en.wikipedia.org/wiki/Quebec",
  "rea-mexico-oaxaca":         "https://en.wikipedia.org/wiki/Oaxaca",

  // ── Central America / Caribbean ──────────────────────────────────────────
  "rea-belize-cayo":           "https://en.wikipedia.org/wiki/Cayo_District",

  // ── South America ─────────────────────────────────────────────────────────
  "rea-brazil-minas":          "https://en.wikipedia.org/wiki/Minas_Gerais",
  "rea-argentina-mendoza":     "https://en.wikipedia.org/wiki/Mendoza_Province",
  "rea-colombia-coffee":       "https://en.wikipedia.org/wiki/Coffee_Cultural_Landscape_of_Colombia",
  "rea-peru-andes":            "https://en.wikipedia.org/wiki/Andes",
  "rea-ecuador-andes":         "https://en.wikipedia.org/wiki/Ecuador",
  "rea-paraguay-interior":     "https://en.wikipedia.org/wiki/Paraguay",
  "rea-bolivia-beni":          "https://en.wikipedia.org/wiki/Beni_Department",

  // ── East Asia ─────────────────────────────────────────────────────────────
  "rea-japan-hokkaido":        "https://en.wikipedia.org/wiki/Hokkaido",

  // ── Southeast Asia ────────────────────────────────────────────────────────
  "rea-thailand-chiangmai":    "https://en.wikipedia.org/wiki/Chiang_Mai_Province",
  "rea-malaysia-sabah":        "https://en.wikipedia.org/wiki/Sabah",
  "rea-cambodia-kampot":       "https://en.wikipedia.org/wiki/Kampot_Province",
  "rea-vietnam-dalat":         "https://en.wikipedia.org/wiki/%C4%90%C3%A0_L%E1%BA%A1t",
  "rea-philippines-palawan":   "https://en.wikipedia.org/wiki/Palawan",
  "rea-indonesia-lombok":      "https://en.wikipedia.org/wiki/Lombok",

  // ── Central Asia / Caucasus ───────────────────────────────────────────────
  "rea-georgia-kakheti":       "https://en.wikipedia.org/wiki/Kakheti",
  "rea-armenia-tavush":        "https://en.wikipedia.org/wiki/Tavush_Province",
  "rea-kyrgyzstan-issykkul":   "https://en.wikipedia.org/wiki/Issyk-Kul_Region",

  // ── Middle East ───────────────────────────────────────────────────────────
  "rea-oman-interior":         "https://en.wikipedia.org/wiki/Ad_Dakhiliyah_Governorate",
  "rea-jordan-aqaba":          "https://en.wikipedia.org/wiki/Aqaba",

  // ── Africa ────────────────────────────────────────────────────────────────
  "rea-namibia-central":       "https://en.wikipedia.org/wiki/Namibia",
  "rea-botswana-rural":        "https://en.wikipedia.org/wiki/Botswana",
  "rea-zambia-southern":       "https://en.wikipedia.org/wiki/Southern_Province%2C_Zambia",
  "rea-tanzania-highland":     "https://en.wikipedia.org/wiki/Tanzania",
  "rea-kenya-laikipia":        "https://en.wikipedia.org/wiki/Laikipia_County",
  "rea-morocco-atlas":         "https://en.wikipedia.org/wiki/Atlas_Mountains",
  "rea-rwanda-kivu":           "https://en.wikipedia.org/wiki/Lake_Kivu",
  "rea-southafrica-karoo":     "https://en.wikipedia.org/wiki/Karoo",

  // ── Pacific ───────────────────────────────────────────────────────────────
  "rea-fiji-vanua-levu":       "https://en.wikipedia.org/wiki/Vanua_Levu",
  "rea-vanuatu-espiritu":      "https://en.wikipedia.org/wiki/Espiritu_Santo_(island)",
  "rea-new-zealand-northland": "https://en.wikipedia.org/wiki/Northland_Region",
  "rea-australia-queensland":  "https://en.wikipedia.org/wiki/Queensland",
};

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TevathaCrawler/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    };

    const req = protocol.get(url, options, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        if (location) {
          const redirectUrl = location.startsWith("http") ? location : new URL(location, url).href;
          fetchText(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = "";
      let done = false;
      res.on("data", (chunk) => {
        if (done) return;
        data += chunk;
        if (data.length > 51200) {
          done = true;
          req.destroy();
          resolve(data);
        }
      });
      res.on("end", () => { if (!done) resolve(data); });
    });

    req.setTimeout(12000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.on("error", reject);
  });
}

function extractOgImage(html) {
  const patterns = [
    /property="og:image"\s+content="([^"]+)"/,
    /content="([^"]+)"\s+property="og:image"/,
    /name="og:image"\s+content="([^"]+)"/,
    /property="og:image:url"\s+content="([^"]+)"/,
    /property="twitter:image"\s+content="([^"]+)"/,
    /name="twitter:image"\s+content="([^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function downloadUrl(url, dest) {
  if (fs.existsSync(dest)) return { skipped: true };
  try {
    execFileSync("curl", [
      "-sS", "-L", "--max-time", "15",
      "-H", "User-Agent: Mozilla/5.0 (compatible; TevathaCrawler/1.0)",
      "-o", dest,
      url,
    ]);
    // Verify it's an image by checking file size
    if (fs.statSync(dest).size < 500) {
      fs.unlinkSync(dest);
      throw new Error("Response too small (likely error page)");
    }
    return { skipped: false };
  } catch (err) {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    throw err;
  }
}

async function main() {
  const slugs = Object.keys(REA_PAGES);
  const results = { ok: [], skipped: [], failed: [] };

  console.log(`\nFetching REA landscape images for ${slugs.length} regions...\n`);

  for (const slug of slugs) {
    const existingExts = ["jpg", "png", "jpeg", "webp"];
    const alreadyExists = existingExts.some(ext =>
      fs.existsSync(path.join(OUT_DIR, `${slug}.${ext}`))
    );
    if (alreadyExists) {
      results.skipped.push(slug);
      process.stdout.write(`  ⏭  ${slug} (exists)\n`);
      continue;
    }

    const pageUrl = REA_PAGES[slug];

    let downloaded = false;
    for (let attempt = 1; attempt <= 3 && !downloaded; attempt++) {
      try {
        const html = await fetchText(pageUrl);
        const imgUrl = extractOgImage(html);

        if (!imgUrl) {
          results.failed.push({ slug, error: "No og:image on " + pageUrl });
          process.stdout.write(`  ✗  ${slug}: no og:image\n`);
          break;
        }

        const cleanUrl = imgUrl.split("?")[0];
        const ext = cleanUrl.match(/\.(png|jpg|jpeg|webp)$/i)?.[1]?.toLowerCase() ?? "jpg";
        const dest = path.join(OUT_DIR, `${slug}.${ext}`);

        const absoluteUrl = imgUrl.startsWith("//") ? "https:" + imgUrl : imgUrl;
        downloadUrl(absoluteUrl, dest);

        results.ok.push(slug);
        process.stdout.write(`  ✓  ${slug} → ${ext}\n`);
        downloaded = true;

      } catch (err) {
        if (err.message.includes("429") && attempt < 3) {
          const wait = attempt * 4000;
          process.stdout.write(`  ↻  ${slug}: rate limited, waiting ${wait/1000}s...\n`);
          await new Promise(r => setTimeout(r, wait));
        } else {
          results.failed.push({ slug, error: err.message });
          process.stdout.write(`  ✗  ${slug}: ${err.message}\n`);
          break;
        }
      }
    }

    await new Promise(r => setTimeout(r, 2500));
  }

  console.log(`\n────────────────────────────────────`);
  console.log(`  Downloaded : ${results.ok.length}`);
  console.log(`  Skipped    : ${results.skipped.length} (already exist)`);
  console.log(`  Failed     : ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log(`\nFailed slugs:`);
    results.failed.forEach(({ slug, error }) => console.log(`  - ${slug}: ${error}`));
  }
}

main().catch(console.error);
