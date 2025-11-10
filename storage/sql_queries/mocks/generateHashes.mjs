// generate_argon2_hashes_from_file.mjs
import fs from "fs/promises";
import argon2 from "argon2";
import path from "path";

const ARGON_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 65536 KiB
  timeCost: 4,
  parallelism: 1,
};

function usage() {
  console.log(`Usage: node ${path.basename(process.argv[1])} <input_file> [output_file]
  <input_file>  : txt file with one password per line
  [output_file] : (optional) default: hashes.txt
Behavior:
  - preserves input line order
  - empty input lines -> empty output lines (positions preserved)
`);
}

async function main() {
  const [, , inputPath, outputPath = "hashes.txt"] = process.argv;
  if (!inputPath) {
    usage();
    process.exit(1);
  }

  // read file
  let content;
  try {
    content = await fs.readFile(inputPath, "utf8");
  } catch (err) {
    console.error("Error reading input file:", err.message);
    process.exit(2);
  }

  // remove BOM if present, split lines preserving empty lines
  if (content.startsWith("\uFEFF")) content = content.slice(1);
  const lines = content.split(/\r?\n/);

  const outLines = [];
  console.log(`Processing ${lines.length} lines from ${inputPath} ...`);

  for (let i = 0; i < lines.length; i++) {
    const pwdLine = lines[i];
    // Preserve blank lines as blank in output
    if (pwdLine === "") {
      outLines.push("");
      continue;
    }

    try {
      // Hash the exact line (no trimming)
      const hash = await argon2.hash(pwdLine, ARGON_OPTIONS);
      outLines.push(hash);
    } catch (err) {
      console.error(`Error hashing line ${i + 1}:`, err.message);
      // To preserve positions, push an empty string or a marker; here we push an empty line
      outLines.push("");
    }

    // optional: tiny progress print each 50 lines
    if ((i + 1) % 50 === 0) {
      console.log(`  - processed ${i + 1}/${lines.length}`);
    }
  }

  // write output joined by single newline
  try {
    await fs.writeFile(outputPath, outLines.join("\n"), "utf8");
    console.log(`✅ Hashes written to ${outputPath}`);
  } catch (err) {
    console.error("Error writing output file:", err.message);
    process.exit(3);
  }
}

main();
