const fs = require('fs');
const path = require('path');
const { insertBattle } = require('./db');

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: node import.js "Animal 1" "Animal 2" /path/to/file.html');
  process.exit(1);
}

const [animal1, animal2, filePath] = args;
const resolved = path.resolve(filePath);

if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(1);
}

const html = fs.readFileSync(resolved, 'utf-8');
const result = insertBattle(animal1, animal2, html);

if (result.skipped) {
  console.log(`Skipped (already exists): ${result.slug}`);
} else {
  console.log(`Imported: ${result.slug}`);
}
