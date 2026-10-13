const fs = require('fs');

function processFile(path) {
  let code = fs.readFileSync(path, 'utf8');

  // Replace text colors
  code = code.replace(/text-white/g, 'text-slate-900 dark:text-white');
  code = code.replace(/text-slate-200/g, 'text-slate-800 dark:text-slate-200');
  code = code.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
  code = code.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
  code = code.replace(/text-slate-500/g, 'text-slate-400 dark:text-slate-500');

  // Replace backgrounds
  // Cards and modals
  code = code.replace(/bg-slate-800\/50/g, 'bg-white dark:bg-slate-800/50');
  code = code.replace(/bg-slate-800/g, 'bg-white dark:bg-slate-800');
  // Main container / Inputs
  code = code.replace(/bg-slate-900\/50/g, 'bg-slate-50 dark:bg-slate-900/50');
  code = code.replace(/bg-slate-900/g, 'bg-slate-50 dark:bg-slate-900');
  // Buttons / Headers
  code = code.replace(/bg-slate-700\/50/g, 'bg-slate-100 dark:bg-slate-700/50');
  code = code.replace(/bg-slate-700/g, 'bg-slate-100 dark:bg-slate-700');
  code = code.replace(/hover:bg-slate-600/g, 'hover:bg-slate-200 dark:hover:bg-slate-600');

  // Replace borders
  code = code.replace(/border-slate-700\/50/g, 'border-slate-200 dark:border-slate-700/50');
  code = code.replace(/border-slate-700/g, 'border-slate-200 dark:border-slate-700');
  code = code.replace(/border-slate-600/g, 'border-slate-300 dark:border-slate-600');
  code = code.replace(/border-slate-500/g, 'border-slate-400 dark:border-slate-500');
  code = code.replace(/hover:border-slate-500/g, 'hover:border-slate-400 dark:hover:border-slate-500');
  
  // Specific fixes
  // Remove duplicate text-slate-900 if text-white replacement nested it
  code = code.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');
  code = code.replace(/bg-slate-50 dark:bg-slate-50 dark:bg-slate-900/g, 'bg-slate-50 dark:bg-slate-900');
  code = code.replace(/bg-white dark:bg-white dark:bg-slate-800/g, 'bg-white dark:bg-slate-800');
  code = code.replace(/bg-slate-100 dark:bg-slate-100 dark:bg-slate-700/g, 'bg-slate-100 dark:bg-slate-700');
  
  // Clean up outer page backgrounds to allow AppLayout to dictate them
  code = code.replace(/min-h-screen bg-slate-50 dark:bg-slate-900 p-6 space-y-6/g, 'min-h-screen p-6 space-y-6');
  code = code.replace(/min-h-screen bg-slate-50 dark:bg-slate-900 p-6/g, 'min-h-screen p-6');

  fs.writeFileSync(path, code);
  console.log('Processed', path);
}

processFile('app/admin/blogs/page.jsx');
processFile('app/admin/gallery/page.jsx');
