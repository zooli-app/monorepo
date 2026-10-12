// Shared Tailwind preset for every Zooli web app.
// Usage in an app's tailwind.config.(js|ts):
//   const zooliPreset = require('@zooli/tokens/tailwind.preset');
//   module.exports = { presets: [zooliPreset], content: [...] };
const tokens = require('./src/tokens.json');

// Flatten a {step: hex} object into Tailwind's expected shape (already is one).
function ramp(name) {
  return tokens[name];
}

const neutralGray = {
  50: tokens.paper['50'],
  100: tokens.paper['100'],
  200: tokens.line['200'],
  300: tokens.ink['300'],
  400: tokens.ink['400'],
  500: tokens.ink['500'],
  600: tokens.ink['600'] || tokens.ink['500'],
  700: tokens.ink['700'],
  800: tokens.ink['800'] || tokens.ink['700'],
  900: tokens.ink['900'],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        violet: ramp('violet'),
        gold: ramp('gold'),
        leaf: ramp('leaf'),
        sky: ramp('sky'),
        maroon: ramp('maroon'),
        gray: neutralGray,
        // Aliases: any component still written with Tailwind's stock palette
        // names (purple/amber/emerald/blue/green/orange/indigo) automatically
        // lands on the Zooli brand ramp instead — no per-file find/replace needed.
        purple: ramp('violet'),
        amber: ramp('gold'),
        emerald: ramp('leaf'),
        blue: ramp('sky'),
        green: ramp('leaf'),
        orange: ramp('gold'),
        indigo: ramp('violet'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'Baloo 2', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '24px',
        pill: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(26, 21, 48, 0.06), 0 1px 1px rgba(26, 21, 48, 0.04)',
        md: '0 8px 24px rgba(46, 16, 101, 0.10)',
        lg: '0 20px 48px rgba(46, 16, 101, 0.16)',
        'card-hover': '0 14px 30px rgba(91, 33, 182, 0.18)',
      },
    },
  },
};
