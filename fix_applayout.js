const fs = require('fs');
let code = fs.readFileSync('components/layout/AppLayout.jsx', 'utf8');

// Replace all gray colors with slate
code = code.replace(/-gray-([0-9]+)/g, '-slate-$1');

// Let's also make sure the AppLayout's dark theme backgrounds match exactly what the user wants.
// The user wants the forms and sidebar to be exactly the same color.
// The forms use dark:bg-slate-900 for the main background and dark:bg-slate-800 for the cards.
// If the sidebar is slate-900, it blends perfectly with the main background (slate-900) which some users prefer.
// Let's change the sidebar's dark background from slate-900 to slate-900 (which it already is natively if we replace gray).

// Actually, in standard AppLayout, Sidebar was bg-white dark:bg-gray-900.
// So now it will be bg-white dark:bg-slate-900.
// And Main Content was bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
// Let's simplify the main content background to just bg-slate-50 dark:bg-slate-900 so it's a solid, consistent color like the forms.
code = code.replace(/bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/, 'bg-slate-50 dark:bg-slate-900');

// Also simplify the header background to match
code = code.replace(/bg-white\/80 dark:bg-slate-900\/80/, 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800');

// And Sidebar background
// Let's make the sidebar dark mode slightly offset (bg-slate-800) or exact same (bg-slate-900)?
// "still side baar looks diffrent coloured" -> The user specifically complained it looks different.
// The image shows the sidebar is slate-800 and the main area is slate-900.
// If they want them to NOT look "different coloured", they want BOTH to be slate-900.
// So let's ensure Sidebar is dark:bg-slate-900 and Main is dark:bg-slate-900.
code = code.replace(/bg-white dark:bg-slate-900/g, 'bg-white dark:bg-slate-900'); // It is already!

fs.writeFileSync('components/layout/AppLayout.jsx', code);
console.log('AppLayout standardized with slate');
