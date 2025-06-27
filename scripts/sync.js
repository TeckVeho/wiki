#!/usr/bin/env ts-node

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const [owner, repo, sourcePath] = process.argv.slice(2);
if (!owner || !repo || !sourcePath) {
  console.error('❌ Usage: yarn sync <owner> <repo> <path>');
  process.exit(1);
}

(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `clone-${repo}-`));
  const repoUrl = `https://github.com/${owner}/${repo}.git`;

  console.log(`🔄 Cloning ${repoUrl} into ${tmpDir}`);
  execSync(`git clone --depth 1 ${repoUrl} ${tmpDir}`, { stdio: 'inherit' });

  const src = path.join(tmpDir, sourcePath);
  const dest = path.join('docs', repo);

  if (!fs.existsSync(src)) {
    console.error(`❌ Source path not found: ${src}`);
    process.exit(1);
  }

  fs.removeSync(dest);
  fs.copySync(src, dest);

  console.log(`✅ Copied ${src} → ${dest}`);

  fs.removeSync(tmpDir);
  console.log('🧹 Cleaned up temp directory');
})();
