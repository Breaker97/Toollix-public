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

  // 1. Ecosystem Container
  content = content.replace(
    /className="bg-zinc-950 p-(\d+) (shadow-[^ ]+) rounded-\[([^\]]+)\] sm:rounded-\[([^\]]+)\] space-y-(\d+) relative overflow-hidden group"/g,
    'className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-$1 shadow-xl rounded-[$3] sm:rounded-[$4] space-y-$5 relative overflow-hidden group border border-[#c5a059]/20"'
  );
  
  // Also variations
  content = content.replace(
    /className="bg-zinc-950 p-(\d+) rounded-\[([^\]]+)\] border border-white\/5 (shadow-[^ ]+) relative overflow-hidden/g,
    'className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-$1 rounded-[$2] border border-[#c5a059]/20 shadow-xl relative overflow-hidden'
  );

  // 2. Icon Container
  content = content.replace(
    /className="w-12 h-12 rounded-2xl bg-zinc-900 border border-\[\#c5a059\]\/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"/g,
    'className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"'
  );

  // 3. List Items
  content = content.replace(
    /className="flex items-center justify-between p-(\d+) rounded-2xl bg-white\/5 border border-white\/5 group\/item hover:bg-\[\#c5a059\]\/5 transition-all"/g,
    'className="flex items-center justify-between p-$1 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-[#c5a059]/10 group/item hover:bg-[#c5a059]/5 transition-all"'
  );

  // 4. List Item Text
  content = content.replace(
    /className="text-\[10px\] font-black uppercase tracking-\[0\.15em\] text-white\/60"/g,
    'className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400"'
  );

  // 5. Status text
  content = content.replace(
    /className="text-\[9px\] text-white\/20 font-black uppercase tracking-widest mt-1"/g,
    'className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1"'
  );

  // 6. Text inside manifest hub
  content = content.replace(
    /text-white\/70 selection:bg-\[\#c5a059\]\/40/g,
    'text-zinc-800 dark:text-zinc-200 selection:bg-[#c5a059]/40'
  );

  // 7. Button in manifest hub
  content = content.replace(
    /bg-white text-zinc-950([^>]+)hover:bg-zinc-200/g,
    'bg-[#c5a059] text-white$1hover:bg-[#c5a059]/90'
  );

  // 8. Other elements like generic bg-zinc-950 active buttons
  content = content.replace(
    /\? "bg-zinc-950 text-white shadow-xl scale-\[1\.02\]"/g,
    '? "bg-[#c5a059] text-white shadow-xl scale-[1.02]"'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
});

console.log(`Done. Modified ${modifiedCount} files.`);
