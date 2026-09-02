/**
 * Guards the styling rule this app now depends on.
 *
 * NativeWind's native runtime wraps registered components and rebuilds their
 * `style` prop. With cssInterop registered on Animated.View, inline styles on
 * animated components were silently dropped **on device only** — the web build
 * renders through real CSS and never showed it. That cost three rounds of
 * "it works here, not on my phone": a transparent bottom sheet, screen titles
 * jammed under the status bar, and an intro whose figure, credit and letterbox
 * bars all lost their absolute positioning.
 *
 * The app is now styled entirely through `style`. This check keeps it that way,
 * because no browser test can catch the regression.
 */
const { execSync } = require('child_process');
const fs = require('fs');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures += 1;
};

const grep = (pattern) => {
  try {
    return execSync(`grep -rn "${pattern}" --include=*.tsx --include=*.ts app src`, {
      encoding: 'utf8',
    }).trim().split('\n').filter(Boolean);
  } catch {
    return []; // grep exits 1 when nothing matches
  }
};

const classNames = grep('className=');
check('no className in app code', classNames.length === 0, classNames.slice(0, 5).join(' | '));

const interop = grep('cssInterop');
check('no cssInterop registrations', interop.length === 0, interop.slice(0, 3).join(' | '));

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
check('nativewind not installed', !deps.nativewind);
check('tailwindcss not installed', !deps.tailwindcss);

for (const file of ['global.css', 'tailwind.config.js']) {
  check(`${file} removed`, !fs.existsSync(file));
}

const babel = fs.readFileSync('babel.config.js', 'utf8');
check('babel has no nativewind preset', !babel.includes('nativewind'));

const metro = fs.readFileSync('metro.config.js', 'utf8');
check('metro has no nativewind wrapper', !metro.includes('NativeWind'));

console.log(failures === 0 ? '\nSTYLING OK' : `\n${failures} FAILURES`);
process.exit(failures ? 1 : 0);
