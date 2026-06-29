const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app', 'tools'));

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Dark mode zinc-950
  content = content.replace(/dark:bg-zinc-950/g, 'dark:bg-zinc-900');

  // 2. Button with bg-zinc-950 text-white
  content = content.replace(/bg-zinc-950\s+text-white/g, 'bg-[#c5a059] text-white');

  // 3. Button hover state update (e.g. hover:bg-zinc-800)
  content = content.replace(/hover:bg-zinc-800/g, 'hover:bg-[#c5a059]/90');

  // 4. White text with bg-zinc-950 without text-white in same line but obviously dark
  content = content.replace(/bg-zinc-950 dark:bg-white/g, 'bg-[#c5a059] dark:bg-[#c5a059]');

  // 5. Container with border-white/5
  content = content.replace(/bg-zinc-950([^>]+)border-white\/5/g, 'bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900$1border-[#c5a059]/20');

  // 6. Generic bg-zinc-950
  content = content.replace(/bg-zinc-950/g, 'bg-white dark:bg-zinc-900');

  // 7. Fix any double classes that might have been created
  content = content.replace(/bg-white dark:bg-zinc-900\/(\d+)/g, 'bg-white/$1 dark:bg-zinc-900/$1');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
});

console.log(`Done. Modified ${modifiedCount} files.`);
