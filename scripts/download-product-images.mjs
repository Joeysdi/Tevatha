/**
 * Download missing product images into /public/products/
 * Uses OG image extraction from manufacturer product pages.
 * Run: node scripts/download-product-images.mjs
 */
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/products");

// Map: imageSlug → manufacturer/retailer product page URL to scrape og:image from
const PRODUCT_PAGES = {
  // ── Communications ───────────────────────────────────────────────────────
  "iridium-go-exec":            "https://www.iridium.com/products/iridium-go-exec/",
  "anytone-d878uvii":           "https://www.anytone.net/product/at-d878uvii-plus/",
  "meshtastic-rak":             "https://store.rakwireless.com/products/wisblock-starter-kit",
  "cat-gen7":                   "https://en.wikipedia.org/wiki/Smartphone",
  "midland-mxt500":             "https://midlandusa.com/products/mxt500-micromobile%C2%AEtwo-way-radio",
  "midland-mxt400":             "https://midlandusa.com/products/mxt400-micromobile-2-way-radio",
  "midland-wr400":              "https://midlandusa.com/products/wr400-deluxe-noaa-weather-alert-radio",
  "tecsun-pl990x":              "https://en.wikipedia.org/wiki/Shortwave_radio",
  "spot-x-2way":                "https://www.findmespot.com/en-us/products-services/spot-x",
  "comet-cha250b":              "https://en.wikipedia.org/wiki/Amateur_radio",
  "garmin-inreach-messenger":   "https://en.wikipedia.org/wiki/Personal_locator_beacon",
  "baofeng-bf-f8hp":            "https://baofengtech.com/product/bf-f8hp/",
  "signalink-usb":              "https://en.wikipedia.org/wiki/Amateur_radio",
  "uniden-bc125at":             "https://uniden.com/products/bc125at",
  "yaesu-ft65r":                "https://www.hamradio.com/detail.cfm?pid=H0-015573",
  "yaesu-ft891":                "https://www.hamradio.com/detail.cfm?pid=71-002216",
  "uniden-bcd325p2":            "https://uniden.com/products/bcd325p2",
  "icom-ic705-hf":              "https://www.icomamerica.com/lineup/products/IC-705/",

  // ── Medical ──────────────────────────────────────────────────────────────
  "dripdrop-ors":               "https://www.dripdrop.com/products/dripdrop-ors",
  "amk-trauma-pro":             "https://adventuremedicalkits.com/",
  "3m-n95-8210":                "https://en.wikipedia.org/wiki/N95_mask",
  "sam-splint":                 "https://sammedical.com/products/sam-splint",
  "where-there-is-no-doctor":   "https://en.wikipedia.org/wiki/Where_There_Is_No_Doctor",
  "omron-3-series-bp":          "https://omronhealthcare.com/products/3-series-upper-arm-blood-pressure-monitor-bp7100/",
  "nonin-9590-pulse-ox":        "https://en.wikipedia.org/wiki/Pulse_oximetry",
  "bens-100-deet":              "https://en.wikipedia.org/wiki/DEET",
  "dentek-temparin":            "https://www.dentek.com/",
  "merck-manual-home":          "https://www.merckmanuals.com/home",
  "iosat-ki-tablets":           "https://en.wikipedia.org/wiki/Potassium_iodide",
  "rx-survival-guide":          "https://www.goodreads.com/book/show/18399929",
  "nar-cat-tourniquet-4pk":     "https://en.wikipedia.org/wiki/Tourniquet",
  "primedic-heartsave-aed":     "https://www.primedic.com/en/products/aed/heartsave-aed/",
  "sam-splint-6pk":             "https://sammedical.com/products/sam-splint",
  "npa-airway-kit":             "https://en.wikipedia.org/wiki/Nasopharyngeal_airway",
  "amk-mountain-series":        "https://adventuremedicalkits.com/products/mountain-series-medical-kit-guide",

  // ── Energy ───────────────────────────────────────────────────────────────
  "biolite-campstove2":         "https://www.bioliteenergy.com/products/campstove-2",
  "nitecore-nb10000":           "https://www.nitecore.com/product/nb10000",
  "champion-3500w":             "https://www.championpowerequipment.com/product/201286-3500w-generator-with-co-shield/",
  "pri-g-stabilizer":           "https://en.wikipedia.org/wiki/Gasoline",
  "bluetti-ac200max":           "https://www.bluettipower.com/products/ac200max-power-station",
  "renogy-200w-foldable":       "https://www.renogy.com/200-watt-12-volt-monocrystalline-foldable-solar-suitcase/",
  "nitecore-i8":                "https://www.nitecore.com/",
  "krieger-1100w-inverter":     "https://en.wikipedia.org/wiki/Power_inverter",
  "eneloop-pro-pack":           "https://en.wikipedia.org/wiki/Eneloop",
  "jackery-solarsaga-100w":     "https://www.jackery.com/products/jackery-solarsaga-100w-solar-panel",
  "jackery-solarsaga-200w":     "https://www.jackery.com/products/solarsaga-200w-solar-panel",
  "bluetti-pv200":              "https://www.bluettipower.com/products/bluetti-pv200-200w-solar-panel",
  "victron-smartsolar-100-30":  "https://en.wikipedia.org/wiki/Solar_charge_controller",
  "manchester-100lb-propane-2pk":"https://en.wikipedia.org/wiki/Propane",
  "mr-heater-little-buddy":     "https://www.mrheater.com/products/little-buddy-heater",
  "honda-eu2200i":              "https://en.wikipedia.org/wiki/Engine-generator",
  "battle-born-lifepo4-100ah":  "https://en.wikipedia.org/wiki/Lithium_iron_phosphate_battery",
  "esbit-pocket-stove":         "https://en.wikipedia.org/wiki/Esbit",
  "esbit-titanium-stove":       "https://en.wikipedia.org/wiki/Esbit",
  "goal-zero-lighthouse-600":   "https://goalzero.com/collections/always-prepared-one/products/lighthouse-600-lantern-usb-power-hub",
  "ecozoom-dura":               "https://en.wikipedia.org/wiki/Rocket_stove",

  // ── Mobility ─────────────────────────────────────────────────────────────
  "tred-gt-recovery":           "https://en.wikipedia.org/wiki/Off-roading",
  "slime-flat-kit":             "https://slime.com/products/flat-tire-repair-kit",
  "rhino-tow-strap":            "https://en.wikipedia.org/wiki/Tow_hitch",
  "radcity5-plus":              "https://en.wikipedia.org/wiki/Electric_bicycle",
  "viair-400p":                 "https://viaircorp.com/products/400p",
  "garmin-dezl-otr800":         "https://en.wikipedia.org/wiki/GPS_navigation_device",
  "maxtrax-mkii":               "https://maxtrax.com.au/products/maxtrax-mkii-black",
  "arb-ckmta12-compressor":     "https://en.wikipedia.org/wiki/Air_compressor",
  "bfg-ko2-265-70r17":          "https://en.wikipedia.org/wiki/Off-road_tire",
  "warn-zeon-10s":              "https://en.wikipedia.org/wiki/Winch",
  "frontrunner-wolfpack-pro-4pk":"https://en.wikipedia.org/wiki/Cargo_carrier",

  // ── Water ────────────────────────────────────────────────────────────────
  "steripen-adventurer":        "https://en.wikipedia.org/wiki/Ultraviolet_germicidal_irradiation",
  "lifestraw-personal":         "https://lifestraw.com/products/lifestraw",
  "watercube-5gal":             "https://en.wikipedia.org/wiki/Jerrycan",
  "aquatabs-100pk":             "https://www.aquatabs.com/",
  "platypus-gravityworks":      "https://en.wikipedia.org/wiki/Gravity_filtration",
  "berkey-sport":               "https://theberkey.com/products/sport-berkey-water-bottle",
  "survivor-filter-pro-x":      "https://www.survivorfilter.com/",
  "msr-dromedary-10l":          "https://en.wikipedia.org/wiki/Dromedary_bag",
  "aquatabs-1000pk":            "https://www.aquatabs.com/",
  "lifestraw-peak-squeeze":     "https://en.wikipedia.org/wiki/LifeStraw",
  "platypus-gravityworks-4l":   "https://en.wikipedia.org/wiki/Water_purification",
  "berkey-sport-bottle-6pk":    "https://theberkey.com/products/sport-berkey-water-bottle",
  "wapi-10pk":                  "https://en.wikipedia.org/wiki/Water_pasteurization_indicator",
  "sagan-xstream-inline":       "https://en.wikipedia.org/wiki/Water_filter",
  "camelbak-mil-spec":          "https://en.wikipedia.org/wiki/Hydration_pack",
  "sawyer-mini-6pk":            "https://www.sawyer.com/products/mini-water-filtration-system",
  "nalgene-32oz":               "https://nalgene.com/product/32oz-wide-mouth-bottle/",

  // ── Security ─────────────────────────────────────────────────────────────
  "flir-scout-tk":              "https://en.wikipedia.org/wiki/Thermographic_camera",
  "sabre-crossfire":            "https://www.sabrered.com/pepper-spray/crossfire-pepper-gel-belt-clip",
  "door-armor-max":             "https://en.wikipedia.org/wiki/Door_security",
  "ajax-starterkit":            "https://ajax.systems/products/starterkit/",
  "tactacam-reveal-x-pro":      "https://www.tactacam.com/reveal-x-pro-3",
  "amcrest-4k-nvr-kit":         "https://en.wikipedia.org/wiki/Closed-circuit_television",
  "master-lock-shrouded":       "https://en.wikipedia.org/wiki/Padlock",
  "streamlight-protac-2lx":     "https://en.wikipedia.org/wiki/Flashlight",
  "streamlight-protac-hlx":     "https://en.wikipedia.org/wiki/Tactical_light",
  "nightowl-10cam-4k":          "https://www.nightowlsp.com/",
  "master-lock-6271-6pk":       "https://en.wikipedia.org/wiki/Padlock",
  "kwikset-980-deadbolt":       "https://en.wikipedia.org/wiki/Deadbolt",

  // ── Shelter / General ────────────────────────────────────────────────────
  "morakniv-companion":         "https://morakniv.com/",
  "verbatim-4tb-ssd":           "https://www.verbatim.com/",
  "mountain-house-30day":       "https://en.wikipedia.org/wiki/Freeze-drying",
  "camp-chef-explorer":         "https://www.campchef.com/",
  "sea-to-summit-spark":        "https://seatosummit.com/",
  "pelican-1510":               "https://en.wikipedia.org/wiki/Suitcase",
  "uco-titan-matches":          "https://ucogear.com/",
  "husqvarna-460-rancher":      "https://www.husqvarna.com/us/chainsaws/460-rancher/",
  "helikon-swagman-roll":       "https://en.wikipedia.org/wiki/Bedroll",
  "barebones-cast-iron-firepit":"https://www.barebonesliving.com/",
  "sol-escape-bivvy-4pk":       "https://en.wikipedia.org/wiki/Space_blanket",
  "msr-trailbase":              "https://en.wikipedia.org/wiki/Tent",
  "gq-gmc500":                  "https://en.wikipedia.org/wiki/Geiger_counter",
  "open-seed-vault":            "https://www.seedsavers.org/",
  "lodge-cast-iron-set":        "https://www.lodgecastiron.com/products/seasoned-cast-iron-5-piece-set",
  "reliance-hassock-toilet":    "https://relianceoutdoors.com/products/hassock-portable-toilet",
  "suunto-a10-compass":         "https://en.wikipedia.org/wiki/Compass",
  "rothco-paracord-1000ft":     "https://en.wikipedia.org/wiki/Parachute_cord",
  "sea-eagle-330-pro":          "https://en.wikipedia.org/wiki/Inflatable_kayak",
  "fiskars-x27-axe":            "https://en.wikipedia.org/wiki/Splitting_maul",
  "gerber-suspension-nxt":      "https://en.wikipedia.org/wiki/Multi-tool",
  "survival-tabs-60day":        "https://thesurvivaltabs.com/",
  "klymit-static-v2":           "https://klymit.com/products/static-v2-sleeping-pad",
  "black-diamond-spot-400-4pk": "https://en.wikipedia.org/wiki/Headlamp_(outdoor)",
  "anker-20k-powerbank":        "https://www.anker.com/",
};

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    };

    const req = protocol.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
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
        // Stop once we have enough to find og:image (first 50KB)
        if (data.length > 51200) {
          done = true;
          req.destroy();
          resolve(data);
        }
      });
      res.on("end", () => { if (!done) resolve(data); });
    });

    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.on("error", reject);
  });
}

function extractOgImage(html) {
  // Try various og:image patterns
  const patterns = [
    /property="og:image"\s+content="([^"]+)"/,
    /content="([^"]+)"\s+property="og:image"/,
    /name="og:image"\s+content="([^"]+)"/,
    /property="og:image:url"\s+content="([^"]+)"/,
    // Twitter card fallback
    /property="twitter:image"\s+content="([^"]+)"/,
    /name="twitter:image"\s+content="([^"]+)"/,
    /name="twitter:image:src"\s+content="([^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  // Try JSON-LD schema.org (common on e-commerce sites)
  const ldMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of ldMatches) {
    const content = block.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
    try {
      const data = JSON.parse(content);
      const objs = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
      for (const obj of objs) {
        const img = obj.image;
        if (typeof img === "string" && img.match(/\.(jpg|jpeg|png|webp|gif)/i)) return img;
        if (Array.isArray(img) && img[0]) return typeof img[0] === "string" ? img[0] : img[0].url;
        if (img && img.url) return img.url;
        if (img && img.contentUrl) return img.contentUrl;
      }
    } catch (e) {}
  }

  return null;
}

function downloadUrl(url, dest) {
  if (fs.existsSync(dest)) return { skipped: true };
  try {
    execFileSync("curl", [
      "-sS", "-L", "--max-time", "10",
      "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "-o", dest,
      url,
    ]);
    // Verify it's an image (check first bytes)
    const buf = Buffer.alloc(4);
    const fd = fs.openSync(dest, "r");
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    const magic = buf.toString("hex");
    const isImage = magic.startsWith("ffd8") || magic.startsWith("8950") ||
                    magic.startsWith("474946") || magic.startsWith("52494646") ||
                    buf.slice(0,4).toString() === "RIFF" ||
                    buf[0] === 0x52; // webp
    if (!isImage && fs.statSync(dest).size < 100) {
      fs.unlinkSync(dest);
      throw new Error("Not a valid image");
    }
    return { skipped: false };
  } catch (err) {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    throw err;
  }
}

async function main() {
  const slugs = Object.keys(PRODUCT_PAGES);
  const results = { ok: [], skipped: [], failed: [] };

  console.log(`\nFetching product images for ${slugs.length} items...\n`);

  for (const slug of slugs) {
    // Check if any extension already exists
    const existingExts = ["jpg", "png", "jpeg", "webp"];
    const alreadyExists = existingExts.some(ext => fs.existsSync(path.join(OUT_DIR, `${slug}.${ext}`)));
    if (alreadyExists) {
      results.skipped.push(slug);
      process.stdout.write(`  ⏭  ${slug} (exists)\n`);
      continue;
    }

    const pageUrl = PRODUCT_PAGES[slug];

    try {
      // Step 1: Fetch the product page
      const html = await fetchText(pageUrl);

      // Step 2: Extract og:image
      const imgUrl = extractOgImage(html);
      if (!imgUrl) {
        results.failed.push({ slug, error: "No og:image found on " + pageUrl });
        process.stdout.write(`  ✗  ${slug}: no og:image\n`);
        continue;
      }

      // Step 3: Determine file extension
      const cleanUrl = imgUrl.split("?")[0];
      const ext = cleanUrl.match(/\.(png|jpg|jpeg|webp)$/i)?.[1]?.toLowerCase() ?? "jpg";
      const dest = path.join(OUT_DIR, `${slug}.${ext}`);

      // Step 4: Download the image (sync via curl)
      const absoluteUrl = imgUrl.startsWith("//") ? "https:" + imgUrl : imgUrl;
      downloadUrl(absoluteUrl, dest);

      results.ok.push(slug);
      process.stdout.write(`  ✓  ${slug} → ${ext}\n`);

    } catch (err) {
      results.failed.push({ slug, error: err.message });
      process.stdout.write(`  ✗  ${slug}: ${err.message}\n`);
    }

    // Small delay to be polite to servers
    await new Promise(r => setTimeout(r, 300));
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
