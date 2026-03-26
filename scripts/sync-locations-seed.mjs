import { access, copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const appRoot = process.cwd();
const sourcePath = path.resolve(appRoot, '../Super Goode/data/locations.json');
const destinationDir = path.resolve(appRoot, 'src/data/seed');
const destinationPath = path.resolve(destinationDir, 'locations.json');

async function main() {
  await access(sourcePath);
  await mkdir(destinationDir, { recursive: true });

  const sourceContents = await readFile(sourcePath, 'utf8');
  JSON.parse(sourceContents);

  await copyFile(sourcePath, destinationPath);

  console.log(`Synced seed data from ${sourcePath} to ${destinationPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
