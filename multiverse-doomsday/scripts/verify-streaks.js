// Mirrors computeStreaks / dayIndex from src/hooks/useStats.ts exactly.
const DAY_MS = 86400000;
function dayIndex(ts) { const d = new Date(ts); d.setHours(0,0,0,0); return Math.floor(d.getTime()/DAY_MS); }
function computeStreaks(days) {
  if (days.length === 0) return { current: 0, longest: 0 };
  const unique = [...new Set(days)].sort((a,b)=>a-b);
  let longest = 1, run = 1;
  for (let i=1;i<unique.length;i+=1){ run = unique[i]===unique[i-1]+1 ? run+1 : 1; if (run>longest) longest=run; }
  const today = dayIndex(Date.now());
  const last = unique[unique.length-1];
  if (today - last > 1) return { current: 0, longest };
  let current = 1;
  for (let i=unique.length-1;i>0;i-=1){ if (unique[i]===unique[i-1]+1) current+=1; else break; }
  return { current, longest };
}

const T = dayIndex(Date.now());
const d = (offset) => T + offset;
let fails = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok?'PASS':'FAIL'}  ${name}  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
  if (!ok) fails++;
};

eq('empty', computeStreaks([]), {current:0,longest:0});
eq('single today', computeStreaks([d(0)]), {current:1,longest:1});
eq('single yesterday keeps streak alive', computeStreaks([d(-1)]), {current:1,longest:1});
eq('two days ago is broken', computeStreaks([d(-2)]), {current:0,longest:1});
eq('3 in a row ending today', computeStreaks([d(-2),d(-1),d(0)]), {current:3,longest:3});
eq('duplicates same day collapse', computeStreaks([d(0),d(0),d(0)]), {current:1,longest:1});
eq('gap resets current, keeps longest', computeStreaks([d(-9),d(-8),d(-7),d(-6),d(0)]), {current:1,longest:4});
eq('old long run, nothing recent', computeStreaks([d(-20),d(-19),d(-18)]), {current:0,longest:3});
eq('unsorted input', computeStreaks([d(0),d(-2),d(-1)]), {current:3,longest:3});
eq('run ending yesterday still current', computeStreaks([d(-3),d(-2),d(-1)]), {current:3,longest:3});

console.log(fails===0 ? '\nSTREAKS OK' : `\n${fails} FAILED`);
process.exit(fails?1:0);
