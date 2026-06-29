const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('app/tools/**/*.tsx');
let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if we already imported getGuestId
  if (content.includes('getGuestId')) continue;

  let hasChanges = false;
  
  // Replace fetch calls
  // e.g. fetch("/api/tools/pdf/split", { method: "POST", body: fd });
  // to fetch("/api/tools/pdf/split", { method: "POST", headers: { "x-guest-id": getGuestId() }, body: fd });
  
  // Need to be careful. Some fetches might be multiline.
  const fetchRegex = /(fetch\([\s\S]*?\{)([\s\S]*?)(\})/g;
  let newContent = content.replace(fetchRegex, (match, prefix, body, suffix) => {
    // Only apply to our api/tools calls
    if (!match.includes('"/api/tools/') && !match.includes('`/api/tools/')) {
        return match;
    }
    hasChanges = true;
    
    // Check if headers exist
    if (body.includes('headers:')) {
      // Just append correctly, a bit riskier, maybe simply replace:
      // headers: { "Content-Type": ... }
      // -> headers: { "x-guest-id": getGuestId(), "Content-Type": ... }
      let headerBlockRegex = /(headers:\s*\{)([^}]*)(\})/;
      let modifiedBody = body.replace(headerBlockRegex, (m, hPrefix, hBody, hSuffix) => {
         return `${hPrefix} "x-guest-id": getGuestId(), ${hBody}${hSuffix}`;
      });
      return `${prefix}${modifiedBody}${suffix}`;
    } else {
      return `${prefix} headers: { "x-guest-id": getGuestId() },${body}${suffix}`;
    }
  });

  if (hasChanges) {
    // Add import
    const importRegex = /(import[\s\S]*?from ["'][^"']+["'];\n)(?!import)/;
    newContent = newContent.replace(importRegex, match => {
       return `${match}import { getGuestId } from "@/components/GuestSessionProvider";\n`;
    });
    
    // Fallback if no imports found (unlikely in page.tsx)
    if (!newContent.includes('import { getGuestId }')) {
      newContent = 'import { getGuestId } from "@/components/GuestSessionProvider";\n' + newContent;
    }

    fs.writeFileSync(file, newContent, 'utf8');
    updatedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Updated ${updatedCount} files.`);
