import { useState, useMemo, useRef, useEffect, useDeferredValue } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  ReferenceLine,
  ComposedChart,
  Area,
} from "recharts";

const SIMULATIONS = 5000;

/* ---------- Historical S&P 500 total returns, 10-yr Treasury bond returns & CPI inflation ---------- */
/* Sources: Shiller/CRSP (stocks, CPI), Damodaran/NYU Stern (10-yr T.Bond), 1926–2025 */
const HISTORICAL_DATA = [
  { year: 1926, ret: 0.1162, bond: 0.0577, cpi: -0.0112 },
  { year: 1927, ret: 0.3749, bond: 0.0450, cpi: -0.0226 },
  { year: 1928, ret: 0.4361, bond: 0.0084, cpi: -0.0116 },
  { year: 1929, ret: -0.0842, bond: 0.0420, cpi: 0.0058 },
  { year: 1930, ret: -0.2490, bond: 0.0454, cpi: -0.0640 },
  { year: 1931, ret: -0.4334, bond: -0.0256, cpi: -0.0932 },
  { year: 1932, ret: -0.0819, bond: 0.0879, cpi: -0.1027 },
  { year: 1933, ret: 0.5399, bond: 0.0186, cpi: 0.0076 },
  { year: 1934, ret: -0.0144, bond: 0.0796, cpi: 0.0152 },
  { year: 1935, ret: 0.4767, bond: 0.0447, cpi: 0.0299 },
  { year: 1936, ret: 0.3392, bond: 0.0502, cpi: 0.0145 },
  { year: 1937, ret: -0.3503, bond: 0.0138, cpi: 0.0286 },
  { year: 1938, ret: 0.3112, bond: 0.0421, cpi: -0.0278 },
  { year: 1939, ret: -0.0041, bond: 0.0441, cpi: 0.0000 },
  { year: 1940, ret: -0.0978, bond: 0.0540, cpi: 0.0071 },
  { year: 1941, ret: -0.1159, bond: -0.0202, cpi: 0.0993 },
  { year: 1942, ret: 0.2034, bond: 0.0229, cpi: 0.0903 },
  { year: 1943, ret: 0.2590, bond: 0.0249, cpi: 0.0296 },
  { year: 1944, ret: 0.1975, bond: 0.0258, cpi: 0.0230 },
  { year: 1945, ret: 0.3644, bond: 0.0380, cpi: 0.0225 },
  { year: 1946, ret: -0.0807, bond: 0.0313, cpi: 0.1813 },
  { year: 1947, ret: 0.0571, bond: 0.0092, cpi: 0.0884 },
  { year: 1948, ret: 0.0550, bond: 0.0195, cpi: 0.0299 },
  { year: 1949, ret: 0.1879, bond: 0.0466, cpi: -0.0207 },
  { year: 1950, ret: 0.3171, bond: 0.0043, cpi: 0.0593 },
  { year: 1951, ret: 0.2402, bond: -0.0030, cpi: 0.0600 },
  { year: 1952, ret: 0.1837, bond: 0.0227, cpi: 0.0075 },
  { year: 1953, ret: -0.0099, bond: 0.0414, cpi: 0.0075 },
  { year: 1954, ret: 0.5262, bond: 0.0329, cpi: -0.0074 },
  { year: 1955, ret: 0.3156, bond: -0.0134, cpi: 0.0037 },
  { year: 1956, ret: 0.0656, bond: -0.0226, cpi: 0.0299 },
  { year: 1957, ret: -0.1078, bond: 0.0680, cpi: 0.0290 },
  { year: 1958, ret: 0.4336, bond: -0.0210, cpi: 0.0176 },
  { year: 1959, ret: 0.1196, bond: -0.0265, cpi: 0.0173 },
  { year: 1960, ret: 0.0047, bond: 0.1164, cpi: 0.0136 },
  { year: 1961, ret: 0.2689, bond: 0.0206, cpi: 0.0067 },
  { year: 1962, ret: -0.0873, bond: 0.0569, cpi: 0.0133 },
  { year: 1963, ret: 0.2280, bond: 0.0168, cpi: 0.0164 },
  { year: 1964, ret: 0.1648, bond: 0.0373, cpi: 0.0097 },
  { year: 1965, ret: 0.1245, bond: 0.0072, cpi: 0.0192 },
  { year: 1966, ret: -0.1006, bond: 0.0291, cpi: 0.0346 },
  { year: 1967, ret: 0.2398, bond: -0.0158, cpi: 0.0304 },
  { year: 1968, ret: 0.1106, bond: 0.0327, cpi: 0.0472 },
  { year: 1969, ret: -0.0850, bond: -0.0501, cpi: 0.0620 },
  { year: 1970, ret: 0.0401, bond: 0.1675, cpi: 0.0557 },
  { year: 1971, ret: 0.1431, bond: 0.0979, cpi: 0.0327 },
  { year: 1972, ret: 0.1898, bond: 0.0282, cpi: 0.0341 },
  { year: 1973, ret: -0.1466, bond: 0.0366, cpi: 0.0871 },
  { year: 1974, ret: -0.2647, bond: 0.0199, cpi: 0.1234 },
  { year: 1975, ret: 0.3720, bond: 0.0361, cpi: 0.0694 },
  { year: 1976, ret: 0.2384, bond: 0.1598, cpi: 0.0486 },
  { year: 1977, ret: -0.0718, bond: 0.0129, cpi: 0.0670 },
  { year: 1978, ret: 0.0656, bond: -0.0078, cpi: 0.0902 },
  { year: 1979, ret: 0.1844, bond: 0.0067, cpi: 0.1329 },
  { year: 1980, ret: 0.3242, bond: -0.0299, cpi: 0.1252 },
  { year: 1981, ret: -0.0491, bond: 0.0820, cpi: 0.0892 },
  { year: 1982, ret: 0.2155, bond: 0.3281, cpi: 0.0383 },
  { year: 1983, ret: 0.2256, bond: 0.0320, cpi: 0.0379 },
  { year: 1984, ret: 0.0627, bond: 0.1373, cpi: 0.0395 },
  { year: 1985, ret: 0.3173, bond: 0.2571, cpi: 0.0380 },
  { year: 1986, ret: 0.1867, bond: 0.2428, cpi: 0.0110 },
  { year: 1987, ret: 0.0525, bond: -0.0496, cpi: 0.0443 },
  { year: 1988, ret: 0.1661, bond: 0.0822, cpi: 0.0442 },
  { year: 1989, ret: 0.3169, bond: 0.1769, cpi: 0.0465 },
  { year: 1990, ret: -0.0310, bond: 0.0624, cpi: 0.0611 },
  { year: 1991, ret: 0.3047, bond: 0.1500, cpi: 0.0306 },
  { year: 1992, ret: 0.0762, bond: 0.0936, cpi: 0.0290 },
  { year: 1993, ret: 0.1008, bond: 0.1421, cpi: 0.0275 },
  { year: 1994, ret: 0.0132, bond: -0.0804, cpi: 0.0267 },
  { year: 1995, ret: 0.3758, bond: 0.2348, cpi: 0.0254 },
  { year: 1996, ret: 0.2296, bond: 0.0143, cpi: 0.0332 },
  { year: 1997, ret: 0.3336, bond: 0.0994, cpi: 0.0170 },
  { year: 1998, ret: 0.2858, bond: 0.1492, cpi: 0.0161 },
  { year: 1999, ret: 0.2104, bond: -0.0825, cpi: 0.0268 },
  { year: 2000, ret: -0.0910, bond: 0.1666, cpi: 0.0339 },
  { year: 2001, ret: -0.1189, bond: 0.0557, cpi: 0.0155 },
  { year: 2002, ret: -0.2210, bond: 0.1512, cpi: 0.0238 },
  { year: 2003, ret: 0.2868, bond: 0.0038, cpi: 0.0188 },
  { year: 2004, ret: 0.1088, bond: 0.0449, cpi: 0.0326 },
  { year: 2005, ret: 0.0491, bond: 0.0287, cpi: 0.0342 },
  { year: 2006, ret: 0.1579, bond: 0.0196, cpi: 0.0254 },
  { year: 2007, ret: 0.0549, bond: 0.1021, cpi: 0.0406 },
  { year: 2008, ret: -0.3700, bond: 0.2010, cpi: 0.0011 },
  { year: 2009, ret: 0.2646, bond: -0.1112, cpi: 0.0272 },
  { year: 2010, ret: 0.1506, bond: 0.0846, cpi: 0.0150 },
  { year: 2011, ret: 0.0211, bond: 0.1604, cpi: 0.0296 },
  { year: 2012, ret: 0.1600, bond: 0.0297, cpi: 0.0174 },
  { year: 2013, ret: 0.3239, bond: -0.0910, cpi: 0.0150 },
  { year: 2014, ret: 0.1369, bond: 0.1075, cpi: 0.0076 },
  { year: 2015, ret: 0.0138, bond: 0.0128, cpi: 0.0073 },
  { year: 2016, ret: 0.1196, bond: 0.0069, cpi: 0.0207 },
  { year: 2017, ret: 0.2183, bond: 0.0280, cpi: 0.0211 },
  { year: 2018, ret: -0.0438, bond: -0.0002, cpi: 0.0191 },
  { year: 2019, ret: 0.3149, bond: 0.0964, cpi: 0.0229 },
  { year: 2020, ret: 0.1840, bond: 0.1133, cpi: 0.0136 },
  { year: 2021, ret: 0.2871, bond: -0.0442, cpi: 0.0704 },
  { year: 2022, ret: -0.1811, bond: -0.1783, cpi: 0.0645 },
  { year: 2023, ret: 0.2629, bond: 0.0388, cpi: 0.0335 },
  { year: 2024, ret: 0.2502, bond: -0.0164, cpi: 0.0289 },
  { year: 2025, ret: 0.1788, bond: 0.0780, cpi: 0.0268 },
];

/* Compute blended stats for a given stock/bond allocation */
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const std = (arr) => {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1));
};

function computeBlendedStats(stockPct) {
  const bondPct = 1 - stockPct;
  const blended = HISTORICAL_DATA.map((d) => stockPct * d.ret + bondPct * d.bond);
  const cpis = HISTORICAL_DATA.map((d) => d.cpi);
  return {
    meanReturn: Math.round(mean(blended) * 100) / 100,
    stdDev: Math.round(std(blended) * 100) / 100,
    inflation: Math.round(mean(cpis) * 200) / 200,
    geometricReturn: Math.round((Math.pow(blended.reduce((p, r) => p * (1 + r), 1), 1 / blended.length) - 1) * 100) / 100,
    startYear: HISTORICAL_DATA[0].year,
    endYear: HISTORICAL_DATA[HISTORICAL_DATA.length - 1].year,
    n: HISTORICAL_DATA.length,
  };
}

const MONO = "'JetBrains Mono', monospace";
const INCOME_PRESETS = [100000, 150000, 200000, 250000, 300000, 400000, 500000];

/* ---------- Seedable PRNG (Mulberry32) ---------- */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianRandom(rng) {
  let u = 0,
    v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/* ---------- Simulation ---------- */
function runSimulation(
  { initialPortfolio, annualWithdrawal, years, meanReturn, stdDev, inflationRate, semiRetireIncome, semiRetireYears },
  rng,
) {
  let balance = initialPortfolio;
  const path = [balance];
  let withdrawal = annualWithdrawal;
  let extraIncome = semiRetireIncome;

  for (let y = 1; y <= years; y++) {
    const r = meanReturn + stdDev * gaussianRandom(rng);
    const netWithdrawal = y <= semiRetireYears ? Math.max(0, withdrawal - extraIncome) : withdrawal;
    balance = balance * (1 + r) - netWithdrawal;
    withdrawal *= 1 + inflationRate;
    if (y <= semiRetireYears) extraIncome *= 1 + inflationRate;

    if (!isFinite(balance) || balance < 0) {
      for (let j = y; j <= years; j++) path.push(0);
      return { path, failed: true, failYear: y };
    }
    path.push(Math.max(0, balance));
  }
  return { path, failed: false, failYear: null };
}

/* ---------- Percentile helpers ---------- */
function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = p * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function computePercentiles(allPaths, years, inflationRate) {
  const data = [];
  for (let y = 0; y <= years; y++) {
    /* Deflate nominal balances to today's dollars */
    const deflator = Math.pow(1 + inflationRate, y);
    const vals = allPaths.map((p) => p[y] / deflator).sort((a, b) => a - b);
    const pct = (p) => percentile(vals, p);
    const p5 = pct(0.05) / 1e6;
    const p10 = pct(0.1) / 1e6;
    const p25 = pct(0.25) / 1e6;
    const p50 = pct(0.5) / 1e6;
    const p75 = pct(0.75) / 1e6;
    const p90 = pct(0.9) / 1e6;
    const p95 = pct(0.95) / 1e6;

    /* Band values for stacked area rendering */
    data.push({
      year: y,
      p5,
      p10,
      p25,
      p50,
      p75,
      p90,
      p95,
      band_5_10: Math.max(0, p10 - p5),
      band_10_25: Math.max(0, p25 - p10),
      band_25_75: Math.max(0, p75 - p25),
      band_75_90: Math.max(0, p90 - p75),
      band_90_95: Math.max(0, p95 - p90),
    });
  }
  return data;
}

/* ---------- Animated Number ---------- */
function AnimatedNumber({ value, suffix = "", decimals = 1 }) {
  const [display, setDisplay] = useState(value);
  const animRef = useRef({ current: value, frame: null });

  useEffect(() => {
    const start = animRef.current.current;
    const diff = value - start;
    if (Math.abs(diff) < 0.001) {
      setDisplay(value);
      animRef.current.current = value;
      return;
    }
    const duration = 280;
    const t0 = performance.now();
    const tick = (now) => {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(current);
      if (progress < 1) {
        animRef.current.frame = requestAnimationFrame(tick);
      } else {
        animRef.current.current = value;
      }
    };
    if (animRef.current.frame) cancelAnimationFrame(animRef.current.frame);
    /* Snap start to current visual position to prevent jumps */
    animRef.current.current = start;
    animRef.current.frame = requestAnimationFrame(tick);
    return () => {
      if (animRef.current.frame) cancelAnimationFrame(animRef.current.frame);
    };
  }, [value]);

  return (
    <>
      {display.toFixed(decimals)}
      {suffix}
    </>
  );
}

/* ---------- Tooltip ---------- */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      style={{
        background: "rgba(8,12,24,0.95)",
        border: "1px solid rgba(99,140,255,0.2)",
        borderRadius: 10,
        padding: "14px 18px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7a99", marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>YEAR {label}</div>
      {[
        { label: "90th Percentile", val: d.p90, color: "#4ade80" },
        { label: "75th Percentile", val: d.p75, color: "#67b5f7" },
        { label: "Median", val: d.p50, color: "#fff" },
        { label: "25th Percentile", val: d.p25, color: "#f0a050" },
        { label: "10th Percentile", val: d.p10, color: "#f87171" },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 3 }}>
          <span style={{ fontSize: 13, color: r.color, opacity: 0.85 }}>{r.label}</span>
          <span style={{ fontSize: 13, color: r.color, fontWeight: 600 }}>${r.val.toFixed(1)}M</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Editable Amount ---------- */
function EditableAmount({ value, onChange, prefix = "$", suffix = "", min = 0, max = Infinity, fontSize = 20, color = "#c8d4e8" }) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState("");
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  const startEdit = () => {
    setTempVal(String(value));
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    const parsed = parseFloat(tempVal);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) onChange(parsed);
    setEditing(false);
  };

  if (editing) {
    return (
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
        {prefix && <span style={{ fontSize, fontWeight: 600, color, fontFamily: MONO }}>{prefix}</span>}
        <input
          ref={inputRef}
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          style={{
            fontSize,
            fontWeight: 600,
            color,
            fontFamily: MONO,
            background: "rgba(90,141,230,0.08)",
            border: "1px solid rgba(90,141,230,0.3)",
            borderRadius: 6,
            padding: "2px 6px",
            outline: "none",
            width: `${Math.max(3, String(tempVal).length + 1)}ch`,
          }}
        />
        {suffix && <span style={{ fontSize, fontWeight: 600, color, fontFamily: MONO }}>{suffix}</span>}
      </span>
    );
  }

  return (
    <span
      onClick={startEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize,
        fontWeight: 600,
        color,
        fontFamily: MONO,
        cursor: "pointer",
        borderBottom: `1px dashed ${hovered ? "rgba(90,141,230,0.6)" : "rgba(90,141,230,0.3)"}`,
        transition: "border-color 0.2s",
      }}
      title="Click to edit"
    >
      {prefix}
      {typeof value === "number" ? value.toLocaleString() : value}
      {suffix}
    </span>
  );
}

/* ---------- Reusable Slider Control ---------- */
function SliderControl({ label, display, color = "#c8d4e8", sub, subColor = "#5a6a88", rangeLabel, min, max, step = 1, value, onChange, style }) {
  return (
    <div style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 16, color: "#96a5be", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 18, color, fontWeight: 600, fontFamily: MONO, transition: "color 0.2s" }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        style={{ marginBottom: 4 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontFamily: MONO }}>
        <span style={{ color: subColor, transition: "color 0.2s" }}>{sub}</span>
        {rangeLabel && <span style={{ color: "#96a5be" }}>{rangeLabel}</span>}
      </div>
    </div>
  );
}

/* ---------- Count-Up Number (runs once on mount) ---------- */
function CountUp({ to, duration = 600 }) {
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const t0 = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * to));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [to, duration]);

  return <>{display.toLocaleString()}</>;
}

/* ---------- Main Component ---------- */
export default function MonteCarloSim() {
  const [portfolio, setPortfolio] = useState(50_000_000);
  const [years, setYears] = useState(40);
  const [annualSpending, setAnnualSpending] = useState(600_000);
  const [stockAllocation, setStockAllocation] = useState(70);
  const [meanReturn, setMeanReturn] = useState(() => computeBlendedStats(0.7).meanReturn);
  const [stdDev, setStdDev] = useState(() => computeBlendedStats(0.7).stdDev);
  const [inflation, setInflation] = useState(() => computeBlendedStats(0.7).inflation);
  const [semiRetireIncome, setSemiRetireIncome] = useState(0);
  const [semiRetireYears, setSemiRetireYears] = useState(5);
  const [semiRetireEnabled, setSemiRetireEnabled] = useState(false);
  const [seed, setSeed] = useState(1);
  const [useHistorical, setUseHistorical] = useState(true);
  const [feeDrag, setFeeDrag] = useState(0.005);
  const [taxRate, setTaxRate] = useState(0.30);
  const [showMethodology, setShowMethodology] = useState(false);

  const historicalStats = useMemo(() => computeBlendedStats(stockAllocation / 100), [stockAllocation]);

  /* Sync market params when historical mode is active and allocation changes */
  useEffect(() => {
    if (useHistorical) {
      setMeanReturn(historicalStats.meanReturn);
      setStdDev(historicalStats.stdDev);
      setInflation(historicalStats.inflation);
    }
  }, [useHistorical, historicalStats]);

  /* Gross withdrawal = spending grossed up for taxes */
  const grossWithdrawal = taxRate < 1 ? annualSpending / (1 - taxRate) : annualSpending;
  const effectiveRate = portfolio > 0 ? grossWithdrawal / portfolio : 0;

  /* Defer heavy computation so sliders stay responsive */
  const deferredPortfolio = useDeferredValue(portfolio);
  const deferredYears = useDeferredValue(years);
  const deferredGrossWithdrawal = useDeferredValue(grossWithdrawal);
  const deferredMean = useDeferredValue(meanReturn);
  const deferredStdDev = useDeferredValue(stdDev);
  const deferredInflation = useDeferredValue(inflation);
  const deferredSemiIncome = useDeferredValue(semiRetireIncome);
  const deferredSemiYears = useDeferredValue(semiRetireYears);
  const deferredFeeDrag = useDeferredValue(feeDrag);

  const results = useMemo(() => {
    const rng = mulberry32(seed * 9999);
    const sims = [];
    let failures = 0;
    const failYears = [];

    for (let i = 0; i < SIMULATIONS; i++) {
      const result = runSimulation(
        {
          initialPortfolio: deferredPortfolio,
          annualWithdrawal: deferredGrossWithdrawal,
          years: deferredYears,
          meanReturn: deferredMean - deferredFeeDrag,
          stdDev: deferredStdDev,
          inflationRate: deferredInflation,
          semiRetireIncome: semiRetireEnabled ? deferredSemiIncome : 0,
          semiRetireYears: semiRetireEnabled ? deferredSemiYears : 0,
        },
        rng,
      );
      sims.push(result);
      if (result.failed) {
        failures++;
        failYears.push(result.failYear);
      }
    }

    const successRate = ((SIMULATIONS - failures) / SIMULATIONS) * 100;
    const percentileData = computePercentiles(
      sims.map((s) => s.path),
      deferredYears,
      deferredInflation,
    );
    const avgFailYear = failYears.length > 0 ? failYears.reduce((a, b) => a + b, 0) / failYears.length : null;
    const medianEnd = percentileData[deferredYears]?.p50 ?? 0;

    /* Nominal (not inflation-adjusted) median for comparison */
    const nominalEndVals = sims.map((s) => s.path[deferredYears]).sort((a, b) => a - b);
    const medianEndNominal = percentile(nominalEndVals, 0.5) / 1e6;

    /* Median among only the surviving simulations (in today's dollars) */
    const endDeflator = Math.pow(1 + deferredInflation, deferredYears);
    let medianSurvivorEnd = medianEnd;
    let medianSurvivorEndNominal = medianEndNominal;
    if (failures > 0 && failures < SIMULATIONS) {
      const survivorEnds = sims.filter((s) => !s.failed).map((s) => s.path[deferredYears]).sort((a, b) => a - b);
      const nominalMedian = percentile(survivorEnds, 0.5);
      medianSurvivorEnd = nominalMedian / endDeflator / 1e6;
      medianSurvivorEndNominal = nominalMedian / 1e6;
    }

    return {
      successRate,
      percentileData,
      failures,
      avgFailYear,
      medianEnd,
      medianEndNominal,
      medianSurvivorEnd,
      medianSurvivorEndNominal,
    };
  }, [deferredPortfolio, deferredYears, deferredGrossWithdrawal, deferredMean, deferredStdDev, deferredInflation, deferredSemiIncome, deferredSemiYears, deferredFeeDrag, semiRetireEnabled, seed]);

  const successNum = results.successRate;

  const riskGrade =
    successNum >= 95
      ? { label: "Very Safe", color: "#4ade80", bg: "rgba(74,222,128,0.08)" }
      : successNum >= 85
        ? { label: "Safe", color: "#67b5f7", bg: "rgba(103,181,247,0.08)" }
        : successNum >= 75
          ? { label: "Moderate Risk", color: "#fbbf24", bg: "rgba(251,191,36,0.08)" }
          : successNum >= 60
            ? { label: "Elevated Risk", color: "#f97316", bg: "rgba(249,115,22,0.08)" }
            : { label: "High Risk", color: "#f87171", bg: "rgba(248,113,113,0.08)" };


  const sectionLabel = {
    fontSize: 13,
    color: "#96a5be",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: MONO,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #060a14 0%, #0c1220 40%, #0a0f1c 100%)",
        color: "#c0c8d8",
        fontFamily: "'Sora', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 6px;
          background: linear-gradient(90deg, #1a2540 0%, #1e2d4a 100%);
          border-radius: 2px; outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          background: radial-gradient(circle at 35% 35%, #8bb4f8, #5a8de6);
          border-radius: 50%; cursor: pointer;
          box-shadow: 0 0 12px rgba(90,141,230,0.4), 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid #0c1220; transition: transform 0.15s ease;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type=range]::-moz-range-thumb {
          width: 20px; height: 20px;
          background: radial-gradient(circle at 35% 35%, #8bb4f8, #5a8de6);
          border-radius: 50%; cursor: pointer; border: 2px solid #0c1220;
        }
        .card {
          background: linear-gradient(135deg, rgba(14,20,36,0.9) 0%, rgba(10,16,30,0.95) 100%);
          border: 1px solid rgba(40,60,100,0.25); border-radius: 16px;
          backdrop-filter: blur(20px);
        }
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(100,160,255,0.03), transparent);
          animation: shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer { 0%, 100% { left: -100%; } 50% { left: 150%; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .toggle-track {
          width: 44px; height: 24px; border-radius: 12px; cursor: pointer;
          transition: background 0.25s ease; position: relative; border: none; padding: 0;
        }
        .toggle-thumb {
          width: 18px; height: 18px; border-radius: 50%; background: #fff;
          position: absolute; top: 3px; transition: left 0.25s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        @media (max-width: 640px) {
          .grid-2col { grid-template-columns: 1fr !important; }
          .hero-flex { flex-direction: column !important; align-items: flex-start !important; }
          .hero-metrics { width: 100% !important; justify-content: space-between !important; }
          .hero-metrics > div { text-align: left !important; }
          .hero-number { font-size: 56px !important; }
          .mobile-container { padding: 24px 16px 32px !important; }
          .mobile-title { font-size: 28px !important; }
          .mobile-card { padding: 20px 18px !important; }
          .mobile-hero { padding: 28px 20px !important; }
          .mobile-hero-metrics {
            gap: 12px 20px !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            justify-items: center !important;
          }
          .mobile-chart { height: 320px !important; }
          .mobile-methodology { padding: 16px 18px !important; }
          .mobile-fees { padding: 12px 14px !important; }
          .mobile-subtitle { font-size: 15px !important; }
        }
      `}</style>

      <div className="mobile-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 56px" }}>
        {/* ───── Header ───── */}
        <div style={{ marginBottom: 44, animation: "fadeIn 0.6s ease-out" }}>
          <h1 className="mobile-title" style={{ fontSize: 42, fontWeight: 700, color: "#edf2fc", lineHeight: 1.15, marginBottom: 10 }}>
            Monte Carlo Portfolio Analysis
          </h1>
          <p className="mobile-subtitle" style={{ fontSize: 17, color: "#96a5be", lineHeight: 1.5 }}>
            <EditableAmount
              value={portfolio / 1e6}
              onChange={(v) => setPortfolio(v * 1e6)}
              prefix="$"
              suffix="M"
              min={1}
              max={500}
              fontSize={17}
              color="#8bb4f8"
            />{" "}
            portfolio {" · "}
            <EditableAmount
              value={years}
              onChange={(v) => setYears(Math.round(v))}
              prefix=""
              suffix=" year"
              min={5}
              max={80}
              fontSize={17}
              color="#8bb4f8"
            />{" "}
            drawdown {" · "}${(annualSpending / 1000).toFixed(0)}K/yr spending · inflation-adjusted
            {semiRetireEnabled && (
              <span>
                {" · "}
                <span style={{ color: "#a78bfa" }}>
                  ${(semiRetireIncome / 1000).toFixed(0)}K/yr income for first {semiRetireYears} yrs
                </span>
              </span>
            )}
          </p>
        </div>

        {/* ───── Portfolio Setup Card ───── */}
        <div className="card mobile-card" style={{ padding: "32px 36px", marginBottom: 20, animation: "fadeIn 0.6s ease-out 0.05s both" }}>
          <div style={{ ...sectionLabel, marginBottom: 22 }}>Portfolio Setup</div>
          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
            <SliderControl
              label="Starting Portfolio" display={`$${(portfolio / 1e6).toFixed(0)}M`}
              sub="$1M" rangeLabel="$100M"
              min={1000000} max={100000000} step={1000000} value={portfolio}
              onChange={(e) => setPortfolio(parseFloat(e.target.value))}
            />
            <SliderControl
              label="Retirement Duration" display={`${years} years`}
              sub="10 yrs" rangeLabel="70 yrs"
              min={10} max={70} step={1} value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
            />
          </div>

          {/* Stock / Bond Allocation */}
          <div style={{ marginBottom: 20 }}>
            <SliderControl
              label="Stock / Bond Allocation"
              display={stockAllocation === 100 ? "100% Stocks" : stockAllocation === 0 ? "100% Bonds" : `${stockAllocation}/${100 - stockAllocation}`}
              color={useHistorical ? "#4ade80" : "#8bb4f8"}
              sub={useHistorical ? `${historicalStats.startYear}–${historicalStats.endYear}: ${Math.round(historicalStats.meanReturn * 100)}% return, ${Math.round(historicalStats.stdDev * 100)}% vol` : `${stockAllocation}% S&P 500 · ${100 - stockAllocation}% 10-yr Treasury`}
              subColor={useHistorical ? "#6aaa7a" : "#5a6a88"}
              min={0} max={100} step={10} value={stockAllocation}
              onChange={(e) => setStockAllocation(parseInt(e.target.value))}
            />
          </div>

          {/* Annual Spending */}
          <div style={{ marginBottom: 20 }}>
            <SliderControl
              label="Annual Spending (after tax)"
              display={`$${(annualSpending / 1000).toFixed(0)}K`}
              color="#8bb4f8"
              sub={`Gross withdrawal: $${(grossWithdrawal / 1000).toFixed(0)}K/yr ($${Math.round(grossWithdrawal / 12000)}K/mo) · ${(effectiveRate * 100).toFixed(1)}% of portfolio`}
              min={100000} max={3000000} step={50000} value={annualSpending}
              onChange={(e) => setAnnualSpending(parseInt(e.target.value))}
            />
          </div>

          {/* Other Income */}
          <div
            style={{
              border: `1px solid ${semiRetireEnabled ? "rgba(167,139,250,0.25)" : "rgba(40,60,100,0.2)"}`,
              borderRadius: 12,
              padding: "16px 20px",
              background: semiRetireEnabled ? "rgba(167,139,250,0.04)" : "transparent",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: semiRetireEnabled ? 16 : 0,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    color: semiRetireEnabled ? "#c4b5fd" : "#7a8aa8",
                    fontWeight: 600,
                    transition: "color 0.3s",
                  }}
                >
                  Other Income
                </div>
                <div style={{ fontSize: 13, color: "#6b7a99", marginTop: 2 }}>Income that offsets withdrawals during early years</div>
              </div>
              <button
                className="toggle-track"
                onClick={() => {
                  if (!semiRetireEnabled && semiRetireIncome === 0) setSemiRetireIncome(250000);
                  setSemiRetireEnabled(!semiRetireEnabled);
                }}
                style={{ background: semiRetireEnabled ? "#7c3aed" : "#1e2740" }}
                aria-label="Toggle other income"
              >
                <div className="toggle-thumb" style={{ left: semiRetireEnabled ? 23 : 3 }} />
              </button>
            </div>

            {semiRetireEnabled && (
              <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <span style={{ fontSize: 14, color: "#96a5be", fontWeight: 500 }}>Annual Income</span>
                    <span style={{ fontSize: 18, color: "#c4b5fd", fontWeight: 600, fontFamily: MONO }}>
                      ${(semiRetireIncome / 1000).toFixed(0)}K/yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={25000}
                    value={semiRetireIncome}
                    onChange={(e) => setSemiRetireIncome(parseFloat(e.target.value))}
                    style={{ marginBottom: 6 }}
                  />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    {INCOME_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setSemiRetireIncome(amt)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: MONO,
                          border: `1px solid ${semiRetireIncome === amt ? "rgba(167,139,250,0.4)" : "rgba(40,60,100,0.2)"}`,
                          background: semiRetireIncome === amt ? "rgba(167,139,250,0.12)" : "rgba(14,20,36,0.6)",
                          color: semiRetireIncome === amt ? "#c4b5fd" : "#5a6a88",
                          transition: "all 0.15s",
                        }}
                      >
                        ${(amt / 1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>
                </div>
                <SliderControl
                  label="Income Duration"
                  display={`First ${semiRetireYears} year${semiRetireYears !== 1 ? "s" : ""}`}
                  color="#c4b5fd"
                  sub="1 year" rangeLabel={`${Math.min(20, years)} years`}
                  min={1} max={Math.min(20, years)} step={1} value={semiRetireYears}
                  onChange={(e) => setSemiRetireYears(parseInt(e.target.value))}
                />
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(167,139,250,0.06)",
                    border: "1px solid rgba(167,139,250,0.12)",
                    fontSize: 14,
                    color: "#a78bfa",
                    lineHeight: 1.6,
                  }}
                >
                  During years 1–{semiRetireYears}: earning <strong>${(semiRetireIncome / 1000).toFixed(0)}K/yr</strong> offsets your{" "}
                  <strong>${(grossWithdrawal / 1000).toFixed(0)}K</strong> gross withdrawal → net draw of only{" "}
                  <strong>${(Math.max(0, grossWithdrawal - semiRetireIncome) / 1000).toFixed(0)}K/yr</strong> from portfolio.
                  {semiRetireIncome >= grossWithdrawal && (
                    <span style={{ color: "#4ade80" }}> Your income fully covers expenses — portfolio grows!</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ───── Market Assumptions ───── */}
        <div className="card mobile-card" style={{ padding: "32px 36px", marginBottom: 20, animation: "fadeIn 0.6s ease-out 0.1s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={sectionLabel}>Market Assumptions</div>
              {useHistorical && (
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 10px", borderRadius: 20,
                    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
                  }}
                >
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", letterSpacing: 0.5, fontFamily: MONO }}>
                    {stockAllocation === 100 ? "S&P 500" : `${stockAllocation}/${100 - stockAllocation} Stock/Bond`} {historicalStats.startYear}–{historicalStats.endYear}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!useHistorical) {
                  setMeanReturn(historicalStats.meanReturn);
                  setStdDev(historicalStats.stdDev);
                  setInflation(historicalStats.inflation);
                }
                setUseHistorical(!useHistorical);
              }}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                fontFamily: MONO, fontWeight: 500, transition: "all 0.2s",
                border: `1px solid ${useHistorical ? "rgba(74,222,128,0.3)" : "rgba(90,141,230,0.25)"}`,
                background: useHistorical ? "rgba(74,222,128,0.08)" : "rgba(90,141,230,0.06)",
                color: useHistorical ? "#4ade80" : "#7ba6ed",
              }}
            >
              {useHistorical ? `Historical (${historicalStats.n}yr)` : "Use Historical"}
            </button>
          </div>
          {useHistorical && (
            <div
              style={{
                marginBottom: 18, padding: "10px 14px", borderRadius: 8,
                background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.1)",
                fontSize: 14, color: "#8abaa0", lineHeight: 1.6,
              }}
            >
              Return, volatility, and inflation are computed from a {stockAllocation === 100 ? "100% S&P 500" : `${stockAllocation}/${100 - stockAllocation} stock/bond`} portfolio
              using historical data for {historicalStats.startYear}–{historicalStats.endYear} ({historicalStats.n} years). Spending, fees, and taxes are independent assumptions.
            </div>
          )}
          <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              {
                label: "Expected Return", value: meanReturn, set: setMeanReturn,
                pctMin: 1, pctMax: 15, pctStep: 1,
                display: `${Math.round(meanReturn * 100)}%`,
                sub: useHistorical ? `actual ${historicalStats.startYear}–${historicalStats.endYear} avg` : "nominal, before inflation",
                color: useHistorical ? "#4ade80" : "#8bb4f8", breaksHistorical: true,
              },
              {
                label: "Market Volatility", value: stdDev, set: setStdDev,
                pctMin: 5, pctMax: 25, pctStep: 1,
                display: `${Math.round(stdDev * 100)}%`,
                sub: useHistorical ? `actual ${historicalStats.startYear}–${historicalStats.endYear} σ` : "annual standard deviation",
                color: useHistorical ? "#4ade80" : "#f0a050", breaksHistorical: true,
              },
              {
                label: "Inflation Rate", value: inflation, set: setInflation,
                pctMin: 1, pctMax: 6, pctStep: 0.5,
                display: `${(inflation * 100).toFixed(1)}%`,
                sub: useHistorical ? `actual ${historicalStats.startYear}–${historicalStats.endYear} CPI avg` : "annual CPI assumption",
                color: useHistorical ? "#4ade80" : "#f0a050", breaksHistorical: true,
              },
            ].map((s, i) => (
              <SliderControl
                key={i}
                label={s.label}
                display={s.display}
                color={s.color}
                sub={s.sub}
                subColor={useHistorical && s.breaksHistorical ? "#6aaa7a" : "#5a6a88"}
                rangeLabel={`${s.pctMin}%–${s.pctMax}%`}
                min={s.pctMin * 10}
                max={s.pctMax * 10}
                step={s.pctStep * 10}
                value={Math.round(s.value * 1000)}
                onChange={(e) => {
                  s.set(parseInt(e.target.value) / 1000);
                  if (s.breaksHistorical) setUseHistorical(false);
                }}
              />
            ))}
          </div>

          {/* Fees & Taxes */}
          <div className="grid-2col mobile-fees" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20, padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(40,60,100,0.2)", background: "rgba(14,20,36,0.4)" }}>
            <SliderControl
              label="Fees & Advisory" display={`${(feeDrag * 100).toFixed(1)}%`} color="#c4a050"
              sub="deducted from returns" rangeLabel="0%–3%"
              min={0} max={30} step={1} value={Math.round(feeDrag * 1000)}
              onChange={(e) => setFeeDrag(parseInt(e.target.value) / 1000)}
            />
            <SliderControl
              label="Effective Tax Rate" display={`${Math.round(taxRate * 100)}%`} color="#c4a050"
              sub="grosses up withdrawals" rangeLabel="0%–40%"
              min={0} max={40} step={5} value={Math.round(taxRate * 100)}
              onChange={(e) => setTaxRate(parseInt(e.target.value) / 100)}
            />
          </div>
        </div>

        {/* ───── Success Rate Hero ───── */}
        <div
          className="shimmer mobile-hero"
          style={{
            padding: "48px 40px",
            marginBottom: 20,
            borderRadius: 20,
            background: `radial-gradient(ellipse at 30% 0%, ${riskGrade.color}08 0%, transparent 60%), linear-gradient(135deg, rgba(14,20,36,0.95) 0%, rgba(10,16,30,0.98) 100%)`,
            border: `1px solid ${riskGrade.color}18`,
            backdropFilter: "blur(20px)",
            animation: "fadeIn 0.6s ease-out 0.2s both",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <span
                className="hero-number"
                style={{
                  fontSize: 112,
                  fontWeight: 800,
                  color: riskGrade.color,
                  lineHeight: 1,
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.03em",
                  textShadow: `0 0 80px ${riskGrade.color}30`,
                }}
              >
                <AnimatedNumber value={results.successRate} suffix="%" />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: riskGrade.color,
                  padding: "5px 16px",
                  borderRadius: 20,
                  background: riskGrade.bg,
                  border: `1px solid ${riskGrade.color}22`,
                  letterSpacing: 0.5,
                }}
              >
                {riskGrade.label}
              </span>
              <span style={{ fontSize: 13, color: "#6b7a99", fontFamily: MONO }}>
                <CountUp to={SIMULATIONS} duration={800} /> simulations
              </span>
              <button
                onClick={() => setSeed((s) => s + 1)}
                style={{
                  padding: "5px 12px", borderRadius: 6,
                  border: "1px solid rgba(90,141,230,0.15)", background: "transparent",
                  color: "#5a7a9a", cursor: "pointer", fontSize: 12, fontFamily: MONO,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#8bb4f8"; e.currentTarget.style.borderColor = "rgba(90,141,230,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#5a7a9a"; e.currentTarget.style.borderColor = "rgba(90,141,230,0.15)"; }}
              >
                ↻
              </button>
            </div>
          </div>
          <div className="mobile-hero-metrics" style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[
              {
                label: "Annual Spending",
                value: `$${(annualSpending / 1000).toFixed(0)}K`,
                sub: `$${Math.round(annualSpending / 12000)}K/mo after tax`,
              },
              {
                label: "Gross Withdrawal",
                value: `$${(grossWithdrawal / 1000).toFixed(0)}K`,
                sub: `${(effectiveRate * 100).toFixed(1)}% rate · +$${Math.round((grossWithdrawal - annualSpending) / 1000)}K tax`,
              },
              {
                label: results.failures > SIMULATIONS * 0.1 ? "Median Real (if survived)" : "Median End (Real)",
                value: `$${(results.failures > SIMULATIONS * 0.1 ? results.medianSurvivorEnd : results.medianEnd).toFixed(1)}M`,
                sub: "today's dollars",
              },
              {
                label: results.failures > SIMULATIONS * 0.1 ? "Median Nominal (if survived)" : "Median End (Nominal)",
                value: `$${(results.failures > SIMULATIONS * 0.1 ? results.medianSurvivorEndNominal : results.medianEndNominal).toFixed(1)}M`,
                sub: results.failures > SIMULATIONS * 0.1 ? `${results.failures} failed` : "future dollars",
              },
            ].map((m, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#6b7a99", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: MONO, marginBottom: 6 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#d0d8e8", fontFamily: MONO }}>{m.value}</div>
                <div style={{ fontSize: 12, color: "#6b7a99", marginTop: 3 }}>{m.sub}</div>
              </div>
            ))}
          </div>
          {results.failures > 0 && (
            <div
              style={{
                marginTop: 24,
                padding: "10px 16px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 16 }}>⚠</span>
              <span style={{ fontSize: 13, color: "#f0a0a0", lineHeight: 1.5 }}>
                {results.failures} of {SIMULATIONS} scenarios ran out of money
                {results.avgFailYear ? ` — average depletion at year ${results.avgFailYear.toFixed(0)}` : ""}.
                {results.medianEnd > 0
                  ? ` Median across all scenarios: $${results.medianEnd.toFixed(1)}M in today's dollars ($${results.medianEndNominal.toFixed(1)}M nominal).`
                  : " More than half of all scenarios ended at $0."
                }
              </span>
            </div>
          )}
        </div>

        {/* ───── Chart ───── */}
        <div style={{ padding: "32px 0 28px", marginBottom: 20, animation: "fadeIn 0.6s ease-out 0.3s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "0 4px", flexWrap: "wrap", gap: 8 }}>
            <div style={sectionLabel}>Portfolio Balance (Today's Dollars)</div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { color: "#4ade80", label: "90th %", dash: true },
                { color: "#ffffff", label: "Median", dash: false },
                { color: "#f87171", label: "10th %", dash: true },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width={16} height={2}>
                    <line x1={0} y1={1} x2={16} y2={1} stroke={l.color} strokeWidth={2} strokeDasharray={l.dash ? "3 2" : "none"} />
                  </svg>
                  <span style={{ fontSize: 12, color: "#96a5be" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mobile-chart" style={{ height: 540 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={results.percentileData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="bandOuter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5a8de6" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#5a8de6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bandMid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5a8de6" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#5a8de6" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="bandInner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5a8de6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#5a8de6" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tick={{ fill: "#5a6a88", fontSize: 12, fontFamily: MONO }}
                axisLine={{ stroke: "rgba(40,60,100,0.2)" }}
                tickLine={false}
                interval={Math.max(1, Math.floor(years / 10) - 1)}
              />
              <YAxis
                tick={{ fill: "#5a6a88", fontSize: 12, fontFamily: MONO }}
                tickFormatter={(v) => `$${v}M`}
                axisLine={{ stroke: "rgba(40,60,100,0.2)" }}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(90,141,230,0.15)", strokeWidth: 1 }} />

              {/* Stacked bands: base=p5, then each successive band stacks on top */}
              <Area type="monotone" dataKey="p5" stackId="bands" stroke="none" fill="transparent" />
              <Area type="monotone" dataKey="band_5_10" stackId="bands" stroke="none" fill="url(#bandOuter)" />
              <Area type="monotone" dataKey="band_10_25" stackId="bands" stroke="none" fill="url(#bandMid)" />
              <Area type="monotone" dataKey="band_25_75" stackId="bands" stroke="none" fill="url(#bandInner)" />
              <Area type="monotone" dataKey="band_75_90" stackId="bands" stroke="none" fill="url(#bandMid)" />
              <Area type="monotone" dataKey="band_90_95" stackId="bands" stroke="none" fill="url(#bandOuter)" />

              <Line type="monotone" dataKey="p90" stroke="#4ade80" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              <Line type="monotone" dataKey="p75" stroke="#67b5f7" strokeWidth={1} strokeOpacity={0.5} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="p50" stroke="#ffffff" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="p25" stroke="#f0a050" strokeWidth={1} strokeOpacity={0.5} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="p10" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              <ReferenceLine y={0} stroke="rgba(248,113,113,0.3)" strokeWidth={1} strokeDasharray="6 4" />
              {semiRetireEnabled && semiRetireYears > 0 && (
                <ReferenceLine
                  x={semiRetireYears}
                  stroke="rgba(167,139,250,0.4)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  label={{
                    value: "Income ends",
                    position: "top",
                    style: { fontSize: 10, fill: "#a78bfa", fontFamily: MONO },
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* ───── Methodology & Caveats ───── */}
        <div className="card mobile-methodology" style={{ padding: "20px 32px", marginBottom: 24, animation: "fadeIn 0.6s ease-out 0.4s both" }}>
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: "8px 0",
            }}
          >
            <span style={sectionLabel}>Methodology & Limitations</span>
            <span style={{ fontSize: 13, color: "#6b7a99", fontFamily: MONO, transition: "transform 0.3s", transform: showMethodology ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
          </button>
          {showMethodology && <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div style={{ fontSize: 14.5, color: "#8a9ab8", lineHeight: 1.75, marginTop: 12 }}>
            <strong style={{ color: "#96a5be" }}>Simulation.</strong>{" "}
            {SIMULATIONS.toLocaleString()} independent scenarios are generated, each producing {years} years of annual portfolio returns
            drawn from a normal distribution with mean {Math.round(meanReturn * 100)}% and standard deviation {Math.round(stdDev * 100)}%.
            Returns are generated using a deterministic pseudo-random number generator (Mulberry32) that produces identical results for a given seed;
            clicking "Run another {SIMULATIONS.toLocaleString()}" changes the seed to produce a fresh batch.
            {feeDrag > 0 && ` An annual fee of ${(feeDrag * 100).toFixed(1)}% is subtracted from the expected return before each year's draw (effective μ = ${Math.round((meanReturn - feeDrag) * 100)}%).`}
            {" "}<strong style={{ color: "#96a5be" }}>Withdrawals.</strong>{" "}
            Your after-tax spending target (${(annualSpending / 1000).toFixed(0)}K) is grossed up by your {Math.round(taxRate * 100)}% effective tax rate,
            producing a gross withdrawal of ${(grossWithdrawal / 1000).toFixed(0)}K in year 1. This gross amount increases by
            {" "}{Math.round(inflation * 100)}% each year to maintain purchasing power.
            {semiRetireEnabled &&
              ` During years 1–${semiRetireYears}, other income of $${(semiRetireIncome / 1000).toFixed(0)}K/yr (also inflation-adjusted) offsets the gross withdrawal, reducing the net portfolio draw.`}
            {" "}Each year, the portfolio grows by the random return, then the net withdrawal is deducted. If the balance hits zero, that scenario is marked as failed
            and the remaining years are recorded at $0.
            {useHistorical && (
              <span>
                {" "}<strong style={{ color: "#96a5be" }}>Historical basis.</strong>{" "}
                When historical mode is active, the return, volatility, and inflation parameters are derived from actual data
                for <span style={{ color: "#4ade80" }}>{historicalStats.startYear}–{historicalStats.endYear}</span> ({historicalStats.n} years).
                Stock returns use S&P 500 total returns with dividends reinvested (Shiller/CRSP data).
                Bond returns use 10-year U.S. Treasury total returns (Damodaran/NYU Stern).
                Inflation uses the U.S. Consumer Price Index.
                {stockAllocation < 100 && ` The ${stockAllocation}/${100 - stockAllocation} blend computes each year's portfolio return as the weighted sum of that year's stock and bond returns, then derives the mean and standard deviation from the resulting series.`}
                {" "}Note: {Math.round(meanReturn * 100)}% is the <em>arithmetic</em> mean of annual returns. Due to volatility drag,
                the compound (geometric) return over this period was ≈{Math.round(historicalStats.geometricReturn * 100)}%, which is what
                a buy-and-hold investor actually earned. The simulation correctly uses the arithmetic mean — compounding random draws
                naturally reproduces the lower geometric outcome.
              </span>
            )}
            {" "}<strong style={{ color: "#96a5be" }}>Chart & balances.</strong>{" "}
            All dollar amounts are shown in today's purchasing power — each year's balance is divided by (1 + inflation)^year to remove the effect of inflation.
            The <span style={{ color: "#5a8de6" }}>blue line</span> shows the median (50th percentile),
            the <span style={{ color: "#4ade80" }}>green dashed line</span> the 90th percentile (favorable markets), and
            the <span style={{ color: "#f87171" }}>red dashed line</span> the 10th percentile (poor markets).
            Shaded bands show the 5th–95th percentile range (outermost), 10th–90th (middle), and 25th–75th interquartile range (innermost).
          </div>
          <div style={{ ...sectionLabel, marginTop: 18, marginBottom: 10 }}>Known Limitations</div>
          <div style={{ fontSize: 14, color: "#96a5be", lineHeight: 1.75 }}>
            <strong style={{ color: "#96a5be" }}>Normal distribution.</strong>{" "}
            Actual stock returns are negatively skewed with fat tails — crashes like 2008 (−37%) occur more frequently than a normal model predicts.
            The model also treats each year as independent, so it cannot produce the volatility clustering seen in real crises (e.g., 1973–74 back-to-back
            losses during 12%+ inflation). These omissions likely make the success rate <em>modestly optimistic</em>.
            {stockAllocation < 100 && (
              <span>
                {" "}<strong style={{ color: "#96a5be" }}>Single distribution.</strong>{" "}
                The stock/bond blend is modeled as a single return distribution, not as two correlated asset classes drawn separately. This means the simulation
                captures the historical blended return profile but does not model rebalancing mechanics, drift between asset classes, or the changing
                correlation between stocks and bonds (which broke down in 2022 when both fell simultaneously).
              </span>
            )}
            {" "}<strong style={{ color: "#96a5be" }}>Fixed withdrawal strategy.</strong>{" "}
            The model uses a constant inflation-adjusted withdrawal — the same approach as the original "4% rule" research. It does not model dynamic strategies
            like guardrails (reducing spending in down markets), required minimum distributions, or variable percentage withdrawals, which can
            meaningfully improve outcomes.
            {" "}<strong style={{ color: "#96a5be" }}>Tax estimate.</strong>{" "}
            The tax rate is a simplified flat rate applied to the gross withdrawal. Actual taxes depend on account type (traditional IRA, Roth, taxable brokerage),
            federal bracket, state of residence, capital gains vs. ordinary income treatment, and may change over a {years}-year horizon.
            {" "}<strong style={{ color: "#96a5be" }}>Timing.</strong>{" "}
            Returns are applied to the full balance before withdrawals each year (end-of-year withdrawal). In practice, retirees withdraw monthly
            throughout the year, which slightly reduces the compounding base.
            {" "}<strong style={{ color: "#96a5be" }}>Not modeled.</strong>{" "}
            Social Security and pension income are not included. If applicable, these could be added as other income streams using the Other Income toggle above.
          </div>
          </div>}
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#4a5a78",
            padding: "0 0 40px",
            fontFamily: MONO,
          }}
        >
          For illustrative purposes only · Not financial advice · Past performance does not guarantee future results
        </div>
      </div>
    </div>
  );
}
