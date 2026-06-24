import * as fs from "fs";
import * as path from "path";

async function globalTeardown() {
  const downloadDir = path.resolve(__dirname, "../downloads");
  if (!fs.existsSync(downloadDir)) {
    return;
  }

  const files = fs.readdirSync(downloadDir);
  if (files.length === 0) {
    return;
  }

  for (const file of files) {
    fs.unlinkSync(path.join(downloadDir, file));
  }
  console.log("All files in the downloads folder have been deleted.");
}

export default globalTeardown;
