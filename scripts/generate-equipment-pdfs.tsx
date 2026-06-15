/**
 * Generates the branded Equipment Guide + Premium Catalogue PDFs into /public.
 *
 *   npx tsx scripts/generate-equipment-pdfs.tsx [--out <dir>]
 *
 * Default output dir is ./public. Pass --out /tmp to preview without
 * overwriting the live files.
 */

import { writeFileSync } from "fs";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { EquipmentGuide } from "../lib/pdf/EquipmentGuide";
import { PremiumCatalogue } from "../lib/pdf/PremiumCatalogue";

async function main() {
  const outArg = process.argv.indexOf("--out");
  const outDir = outArg !== -1 ? process.argv[outArg + 1] : "public";

  const guide = await renderToBuffer(<EquipmentGuide />);
  writeFileSync(`${outDir}/equipment-guide.pdf`, guide);
  console.log(`✓ ${outDir}/equipment-guide.pdf — ${(guide.length / 1024).toFixed(0)} KB`);

  const catalogue = await renderToBuffer(<PremiumCatalogue />);
  writeFileSync(`${outDir}/premium-catalogue.pdf`, catalogue);
  console.log(`✓ ${outDir}/premium-catalogue.pdf — ${(catalogue.length / 1024).toFixed(0)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
