const fs = require('fs');
let code = fs.readFileSync('components/layout/AppLayout.jsx', 'utf8');

const replacements = [
  ['bg-gray-50 dark:bg-gray-900', 'bg-slate-900'],
  ['bg-white dark:bg-gray-900', 'bg-slate-800'],
  ['border-gray-200 dark:border-gray-800', 'border-slate-700'],
  ['text-gray-900 dark:text-white', 'text-white'],
  ['text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-400', 'text-slate-400 hover:bg-slate-700 hover:text-white'],
  ['text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900', 'text-slate-300 hover:bg-slate-700 hover:text-white'],
  ['text-gray-500 group-hover:text-gray-700', 'text-slate-400 group-hover:text-slate-200'],
  ['text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800', 'text-slate-300 hover:bg-slate-700'],
  ['hover:bg-gray-50 dark:hover:bg-gray-800/50', 'hover:bg-slate-700/50'],
  ['text-gray-900 dark:text-white', 'text-white'],
  ['text-gray-500 dark:text-gray-400', 'text-slate-400'],
  ['text-gray-500 hover:text-red-500', 'text-slate-400 hover:text-red-400'],
  ['bg-white/80 dark:bg-gray-900/80', 'bg-slate-800/80'],
  ['hover:bg-gray-100 dark:hover:bg-gray-800', 'hover:bg-slate-700'],
  ['text-gray-600 dark:text-gray-400', 'text-slate-400'],
  ['text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800', 'text-slate-300 hover:bg-slate-700'],
  ['bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800', 'bg-slate-900'],
  ['text-gray-800 dark:text-gray-200', 'text-white'],
  ['text-gray-400 dark:text-gray-500', 'text-slate-500'],
  ['text-[10px] text-gray-400 dark:text-gray-500', 'text-[10px] text-slate-500'],
  ['text-gray-500', 'text-slate-400'],
  ['text-gray-400', 'text-slate-500'],
  ['bg-gray-100', 'bg-slate-700'],
  ['hover:bg-red-50 dark:hover:bg-red-900/20', 'hover:bg-red-500/10']
];

replacements.forEach(([oldStr, newStr]) => {
  code = code.split(oldStr).join(newStr);
});

// For any stragglers:
code = code.replace(/text-gray-[0-9]+/g, 'text-slate-400');
code = code.replace(/bg-gray-[0-9]+/g, 'bg-slate-800');
code = code.replace(/border-gray-[0-9]+/g, 'border-slate-700');

// Fix BluLIMS image block
code = code.replace(/<div className="dark:hidden">[\s\S]*?<\/div>/, '');
code = code.replace(/<div className="hidden dark:block">\s*([\s\S]*?)\s*<\/div>/, '$1');

// Hide theme toggle since we are forcing dark theme anyway
code = code.replace(/\{\/\* Dark Mode Toggle \*\/\}[\s\S]*?\{\/\* Version Info \*\/\}/g, '{/* Version Info */}');

fs.writeFileSync('components/layout/AppLayout.jsx', code);
console.log('AppLayout updated for dark ocean theme!');
