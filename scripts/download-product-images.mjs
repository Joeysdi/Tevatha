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

// Map: imageSlug → manufacturer product page URL to scrape og:image from
const PRODUCT_PAGES = {
  // ── Communications ───────────────────────────────────────────────────────
  "iridium-go-exec":          "https://www.iridium.com/products/iridium-go-exec/",
  "anytone-d878uvii":         "https://www.anytone.net/product/at-d878uvii-plus/",
  "meshtastic-rak":           "https://store.rakwireless.com/products/wisblock-starter-kit",
  "cat-gen7":                 "https://www.catphones.com/en-us/phones/cat-s75-smartphone/",
  "midland-mxt500":           "https://www.midlandusa.com/product/mxt500/",
  "tecsun-pl990x":            "https://www.tecsunradios.com/store/product/tecsun-pl-990x/",
  "spot-x-2way":              "https://www.findmespot.com/en-us/products/spot-x",
  "comet-cha250b":            "https://www.cometantenna.com/amateur-radio/product/cha250b/",
  "garmin-inreach-messenger": "https://www.garmin.com/en-US/p/843975",
  "midland-wr400":            "https://www.midlandusa.com/product/wr400/",
  "yaesu-ft891":              "https://www.yaesu.com/indexvS.cfm?cmd=DisplayProducts&ProdCatID=102&encProdID=DF4DB262968932E2091C6B9AB2E06894",
  "baofeng-bf-f8hp":          "https://baofengtech.com/product/bf-f8hp/",
  "signalink-usb":            "https://www.tigertronics.com/slusbmain.htm",
  "uniden-bc125at":           "https://www.uniden.com/pages/bc125at",
  "yaesu-ft65r":              "https://www.yaesu.com/indexVS.cfm?cmd=DisplayProducts&ProdCatID=104&encProdID=94B36494DB3A3EAE86FA39B484B6CE6E",
  "midland-mxt400":           "https://www.midlandusa.com/product/mxt400/",
  "uniden-bcd325p2":          "https://www.uniden.com/pages/bcd325p2",
  "icom-ic705-hf":            "https://www.icomamerica.com/en/products/amateur/hf/ic705/default.aspx",

  // ── Medical ──────────────────────────────────────────────────────────────
  "dripdrop-ors":             "https://www.dripdrop.com/products/dripdrop-ors",
  "amk-trauma-pro":           "https://www.adventuremedicalkits.com/products/trauma-pak-pro",
  "3m-n95-8210":              "https://www.3m.com/3M/en_US/p/d/v000057030/",
  "sam-splint":               "https://sammedical.com/products/sam-splint",
  "where-there-is-no-doctor": "https://hesperian.org/books-and-resources/where-there-is-no-doctor/",
  "omron-3-series-bp":        "https://omronhealthcare.com/products/3-series-upper-arm-blood-pressure-monitor-bp7100/",
  "nonin-9590-pulse-ox":      "https://www.nonin.com/products/9590/",
  "bens-100-deet":            "https://benslabs.com/collections/insect-repellent/products/100-deet",
  "dentek-temparin":          "https://www.dentek.com/products/dental-cement-and-repair/temparin-max-lost-filling-and-loose-cap-repair",
  "merck-manual-home":        "https://www.merckmanuals.com/home",
  "iosat-ki-tablets":         "https://www.anbex.com/iosat.html",
  "rx-survival-guide":        "https://www.amazon.com/dp/0989215903",
  "nar-cat-tourniquet-4pk":   "https://www.narescue.com/combat-application-tourniquet-c-a-t",
  "primedic-heartsave-aed":   "https://www.primedic.com/en/products/aed/heartsave-aed/",
  "sam-splint-6pk":           "https://sammedical.com/products/sam-splint",
  "npa-airway-kit":           "https://www.bound-tree.com/nasopharyngeal-airway-kit",
  "amk-mountain-series":      "https://www.adventuremedicalkits.com/products/mountain-series-mountaineer",

  // ── Energy ───────────────────────────────────────────────────────────────
  "biolite-campstove2":       "https://www.bioliteenergy.com/products/campstove-2",
  "nitecore-nb10000":         "https://www.nitecore.com/product/nb10000",
  "champion-3500w":           "https://www.championpowerequipment.com/product/3500-watt-portable-generator-100233/",
  "pri-g-stabilizer":         "https://pri-products.com/products/pri-g-gasoline-treatment/",
  "bluetti-ac200max":         "https://www.bluettipower.com/products/ac200max",
  "renogy-200w-foldable":     "https://www.renogy.com/200-watt-foldable-solar-suitcase/",
  "nitecore-i8":              "https://www.nitecore.com/product/i8",
  "krieger-1100w-inverter":   "https://www.kriegerproducts.com/product/1100-watt-power-inverter/",
  "eneloop-pro-pack":         "https://www.panasonic.com/global/consumer/eneloop/product/hrxxuwxbe.html",
  "jackery-solarsaga-100w":   "https://www.jackery.com/products/jackery-solarsaga-100w-solar-panel",
  "jackery-solarsaga-200w":   "https://www.jackery.com/products/jackery-solarsaga-200w-solar-panel",
  "bluetti-pv200":            "https://www.bluettipower.com/products/pv200-solar-panel",
  "victron-smartsolar-100-30":"https://www.victronenergy.com/solar-charge-controllers/smartsolar-mppt-75-10-75-15-100-15-100-20",
  "manchester-100lb-propane-2pk":"https://www.manchestertank.com/propane-cylinders/vertical-cylinders/",
  "mr-heater-little-buddy":   "https://www.mrheater.com/products/little-buddy-heater",
  "honda-eu2200i":            "https://powerequipment.honda.com/generators/models/eu2200i",
  "battle-born-lifepo4-100ah":"https://battlebornbatteries.com/product/12v-100ah-lifepo4-deep-cycle-battery/",
  "esbit-pocket-stove":       "https://www.esbit.net/en/stoves-burners/pocket-stove/",
  "esbit-titanium-stove":     "https://www.esbit.net/en/stoves-burners/titanium-alcohol-stove/",
  "goal-zero-lighthouse-600": "https://www.goalzero.com/products/lighthouse-600-lantern",
  "ecozoom-dura":             "https://ecozoom.com/products/ecozoom-dura/",

  // ── Mobility ─────────────────────────────────────────────────────────────
  "tred-gt-recovery":         "https://www.tredpro.com/products/tred-gt",
  "slime-flat-kit":           "https://www.slime.com/products/slime-flat-tire-repair-kit",
  "rhino-tow-strap":          "https://www.rhinousastore.com/collections/tow-straps",
  "radcity5-plus":            "https://www.radpowerbikes.com/products/radcity-plus-electric-bike",
  "viair-400p":               "https://www.viair.com/viair-4000-400p-portable-compressor-kit/",
  "garmin-dezl-otr800":       "https://www.garmin.com/en-US/p/695956",
  "maxtrax-mkii":             "https://www.maxtrax.com.au/products/maxtrax-mkii",
  "arb-ckmta12-compressor":   "https://www.arbusa.com/on-board-air/compressors/twin-motor-compressor/",
  "bfg-ko2-265-70r17":        "https://www.bfgoodrichtires.com/tires/all-terrain-t-a-ko2",
  "warn-zeon-10s":            "https://www.warn.com/zeon-series-winches",
  "frontrunner-wolfpack-pro-4pk":"https://www.frontrunneroutfitters.com/wolfpack-pro-cargo-system/",

  // ── Water ────────────────────────────────────────────────────────────────
  "steripen-adventurer":      "https://www.steripen.com/adventurer-opti/",
  "lifestraw-personal":       "https://lifestraw.com/products/lifestraw",
  "watercube-5gal":           "https://waterbrick.com/product/waterbrick-standard-3-5-gallon/",
  "aquatabs-100pk":           "https://aquatabs.com/water-purification-tablets/",
  "platypus-gravityworks":    "https://platy.com/filtration/gravityworks-water-filter-system/06953805.html",
  "berkey-sport":             "https://www.berkeyfilters.com/sport-berkey-filter-water-bottle/",
  "survivor-filter-pro-x":   "https://survivorfilter.com/products/pro-x",
  "msr-dromedary-10l":        "https://www.msrgear.com/water-storage/dromedary-bags/10L-dromedary-bag/11840.html",
  "aquatabs-1000pk":          "https://aquatabs.com/water-purification-tablets/",
  "lifestraw-peak-squeeze":   "https://lifestraw.com/products/lifestraw-peak-series-squeeze",
  "platypus-gravityworks-4l": "https://platy.com/filtration/gravityworks-water-filter-system/06953805.html",
  "berkey-sport-bottle-6pk":  "https://www.berkeyfilters.com/sport-berkey-filter-water-bottle/",
  "wapi-10pk":                "https://www.amazon.com/dp/B007GE5JDA",
  "sagan-xstream-inline":     "https://saganlife.com/products/xstream-inline-water-filter",
  "camelbak-mil-spec":        "https://www.camelbak.com/collections/military-hydration",
  "sawyer-mini-6pk":          "https://sawyer.com/products/sawyer-mini-water-filtration-system/",
  "nalgene-32oz":             "https://nalgene.com/products/32oz-wide-mouth-water-bottle/",

  // ── Security ─────────────────────────────────────────────────────────────
  "flir-scout-tk":            "https://www.flir.com/products/scout-tk/",
  "sabre-crossfire":          "https://sabresafety.com/collections/pepper-spray/products/crossfire-gel",
  "door-armor-max":           "https://www.armor-concepts.com/door-armor-max",
  "ajax-starterkit":          "https://ajax.systems/products/starterkit/",
  "tactacam-reveal-x-pro":    "https://www.tactacam.com/products/reveal-x-pro",
  "amcrest-4k-nvr-kit":       "https://amcrest.com/ip-cameras-security-systems/nvr-systems.html",
  "master-lock-shrouded":     "https://www.masterlock.com/products/shackle-locks",
  "streamlight-protac-2lx":   "https://www.streamlight.com/en-us/family/protac-2l-x.html",
  "streamlight-protac-hlx":   "https://www.streamlight.com/en-us/family/protac-hl-x.html",
  "nightowl-10cam-4k":        "https://nightowlsp.com/products/wired-security-systems",
  "master-lock-6271-6pk":     "https://www.masterlock.com/products/combination-padlocks",
  "kwikset-980-deadbolt":     "https://www.kwikset.com/products/deadbolts/980-deadbolt",

  // ── Shelter / General ────────────────────────────────────────────────────
  "morakniv-companion":       "https://www.morakniv.se/en/product/companion-stainless/",
  "verbatim-4tb-ssd":         "https://www.verbatim.com/prod/ssd/",
  "mountain-house-30day":     "https://mountainhouse.com/collections/emergency-food-supply/products/mountain-house-30-day-emergency-food-supply",
  "camp-chef-explorer":       "https://www.campchef.com/shop/stoves/outdoor-cookers/explorer-two-burner-stove/",
  "sea-to-summit-spark":      "https://seatosummit.com/products/spark-sleeping-bag/",
  "pelican-1510":             "https://www.pelican.com/us/en/product/cases/carry-on-case/1510/",
  "uco-titan-matches":        "https://ucogear.com/products/titan-matches",
  "husqvarna-460-rancher":    "https://www.husqvarna.com/us/chainsaws/460-rancher/",
  "helikon-swagman-roll":     "https://www.helikon-tex.com/swagman-roll.html",
  "barebones-cast-iron-firepit":"https://barebonesliving.com/products/cast-iron-fire-pit",
  "sol-escape-bivvy-4pk":     "https://www.surviveoutdoorslonger.com/escape-bivvy",
  "msr-trailbase":            "https://www.msrgear.com/tents/trailbase-tent/",
  "gq-gmc500":                "https://www.gqelectronicsllc.com/comersus/store/comersus_viewItem.asp?idProduct=5632",
  "open-seed-vault":          "https://www.seedsavers.org/",
  "lodge-cast-iron-set":      "https://www.lodgecastiron.com/",
  "reliance-hassock-toilet":  "https://www.relianceproducts.com/hassock-toilet.html",
  "suunto-a10-compass":       "https://www.suunto.com/en-US/Products/compasses/suunto-a-10/suunto-a-10/",
  "rothco-paracord-1000ft":   "https://www.rothco.com/product/30850",
  "sea-eagle-330-pro":        "https://www.seaeagle.com/330-pro",
  "fiskars-x27-axe":          "https://www.fiskars.com/en-us/products/outdoor/axes-and-hatchets/x27-super-splitting-axe-36/",
  "gerber-suspension-nxt":    "https://www.gerbergear.com/en-us/shop/multi-tools/suspension-nxt-multi-tool/",
  "survival-tabs-60day":      "https://thesurvivaltabs.com/products/60-day-food-supply",
  "klymit-static-v2":         "https://klymit.com/products/static-v2-sleeping-pad",
  "black-diamond-spot-400-4pk":"https://www.blackdiamondequipment.com/en_US/product/spot-400-headlamp/",
  "anker-20k-powerbank":      "https://www.anker.com/products/powercore-20100",
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

    req.setTimeout(6000, () => { req.destroy(); reject(new Error("Timeout")); });
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
