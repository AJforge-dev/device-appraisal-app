import React, { useState, useMemo } from 'react';
import { Smartphone, Laptop, ScanLine, Sparkles, AlertTriangle, RotateCcw, CircleCheck } from 'lucide-react';

const PHONE_DB = [
  { key: 'iphone15', name: 'iPhone 15 (128GB)', price: 79900, ram: 6, storage: 128 },
  { key: 'iphone14', name: 'iPhone 14 (128GB)', price: 69900, ram: 6, storage: 128 },
  { key: 'iphone13', name: 'iPhone 13 (128GB)', price: 59900, ram: 4, storage: 128 },
  { key: 'iphonese', name: 'iPhone SE 2022 (64GB)', price: 43900, ram: 4, storage: 64 },
  { key: 's23', name: 'Samsung Galaxy S23 (256GB)', price: 74999, ram: 8, storage: 256 },
  { key: 's22', name: 'Samsung Galaxy S22 (128GB)', price: 62999, ram: 8, storage: 128 },
  { key: 'a54', name: 'Galaxy A54 (128GB)', price: 38999, ram: 8, storage: 128 },
  { key: 'op11', name: 'OnePlus 11 (256GB)', price: 56999, ram: 16, storage: 256 },
  { key: 'pixel8', name: 'Google Pixel 8 (128GB)', price: 75999, ram: 8, storage: 128 },
  { key: 'rn12', name: 'Redmi Note 12 (128GB)', price: 18999, ram: 6, storage: 128 },
  { key: 'custom-phone', name: 'Other / custom phone', price: 0, ram: 6, storage: 128 },
];

const LAPTOP_DB = [
  { key: 'mba-m2', name: 'MacBook Air M2 (256GB)', price: 114900, ram: 8, storage: 256 },
  { key: 'mbp-m2', name: 'MacBook Pro M2 (256GB)', price: 129900, ram: 8, storage: 256 },
  { key: 'mba-m1', name: 'MacBook Air M1 (256GB)', price: 92900, ram: 8, storage: 256 },
  { key: 'xps13', name: 'Dell XPS 13 (512GB)', price: 110000, ram: 16, storage: 512 },
  { key: 'pavilion', name: 'HP Pavilion 15', price: 65000, ram: 8, storage: 512 },
  { key: 'thinkpad', name: 'Lenovo ThinkPad E14', price: 70000, ram: 8, storage: 512 },
  { key: 'rog', name: 'Asus ROG Strix', price: 120000, ram: 16, storage: 512 },
  { key: 'aspire7', name: 'Acer Aspire 7', price: 58000, ram: 8, storage: 512 },
  { key: 'hp15s', name: 'HP 15s', price: 45000, ram: 8, storage: 256 },
  { key: 'ideapad', name: 'Lenovo IdeaPad Slim 3', price: 40000, ram: 8, storage: 256 },
  { key: 'custom-laptop', name: 'Other / custom laptop', price: 0, ram: 8, storage: 256 },
];

function ticketId() {
  return 'AP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function DeviceAppraisal() {
  const [deviceType, setDeviceType] = useState('phone');
  const [detected, setDetected] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [tid] = useState(ticketId());
  const [today] = useState(() => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));

  const db = deviceType === 'phone' ? PHONE_DB : LAPTOP_DB;

  const [form, setForm] = useState({
    modelKey: db[0].key,
    customName: '',
    customBasePrice: '',
    years: '1.5',
    storageGB: String(db[0].storage),
    ramGB: String(db[0].ram),
    batteryHealth: '85',
    screenCondition: 'flawless',
    bodyCondition: 'like-new',
    issues: { touch: false, camera: false, port: false, speaker: false, mic: false, wifi: false },
    accessories: true,
  });

  const [result, setResult] = useState(null);

  const selectedModel = db.find((d) => d.key === form.modelKey) || db[0];
  const isCustom = selectedModel.price === 0;

  function switchDeviceType(type) {
    const newDb = type === 'phone' ? PHONE_DB : LAPTOP_DB;
    setDeviceType(type);
    setForm((f) => ({
      ...f,
      modelKey: newDb[0].key,
      storageGB: String(newDb[0].storage),
      ramGB: String(newDb[0].ram),
    }));
    setResult(null);
  }

  function onModelChange(key) {
    const m = db.find((d) => d.key === key);
    setForm((f) => ({
      ...f,
      modelKey: key,
      storageGB: m.price === 0 ? f.storageGB : String(m.storage),
      ramGB: m.price === 0 ? f.ramGB : String(m.ram),
    }));
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleIssue(key) {
    setForm((f) => ({ ...f, issues: { ...f.issues, [key]: !f.issues[key] } }));
  }

  function runScan() {
    setScanning(true);
    setDetected(null);
    setTimeout(() => {
      try {
        const ua = navigator.userAgent || '';
        let os = 'Unknown';
        if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Mac OS X/i.test(ua)) os = 'macOS';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        const cores = navigator.hardwareConcurrency || null;
        const ram = navigator.deviceMemory || null;
        const w = window.screen ? window.screen.width : null;
        const h = window.screen ? window.screen.height : null;
        const dpr = window.devicePixelRatio || 1;

        setDetected({
          os,
          cores,
          ram,
          resolution: w && h ? `${w}×${h} @ ${dpr}x` : 'Unavailable',
        });

        if (ram) {
          setForm((f) => ({ ...f, ramGB: String(ram) }));
        }
      } catch (e) {
        setDetected({ error: true });
      }
      setScanning(false);
    }, 700);
  }

  function calculate() {
    const basePrice = isCustom ? parseFloat(form.customBasePrice) || 0 : selectedModel.price;
    const baseRAM = isCustom ? parseFloat(form.ramGB) || 1 : selectedModel.ram;
    const baseStorage = isCustom ? parseFloat(form.storageGB) || 1 : selectedModel.storage;
    const years = Math.max(0, parseFloat(form.years) || 0);

    const ageFactor = Math.max(0.1, 0.85 * Math.pow(0.68, years));
    const afterAge = basePrice * ageFactor;

    const batteryHealth = Math.min(100, Math.max(0, parseFloat(form.batteryHealth) || 0));
    const batteryFactor = 0.75 + (batteryHealth / 100) * 0.25;

    const screenMap = { flawless: 1.0, minor: 0.93, visible: 0.85, cracked: 0.55 };
    const screenFactor = screenMap[form.screenCondition];

    const bodyMap = { 'like-new': 1.0, light: 0.95, heavy: 0.85, damaged: 0.75 };
    const bodyFactor = bodyMap[form.bodyCondition];

    const issueCount = Object.values(form.issues).filter(Boolean).length;
    const issuesFactor = Math.max(0.5, 1 - issueCount * 0.06);

    const actualRAM = parseFloat(form.ramGB) || baseRAM;
    const actualStorage = parseFloat(form.storageGB) || baseStorage;
    let specAdj = ((actualStorage - baseStorage) / baseStorage) * 0.15 + ((actualRAM - baseRAM) / baseRAM) * 0.1;
    specAdj = Math.max(-0.2, Math.min(0.2, specAdj));

    const accessoryBonus = form.accessories ? 0.03 : 0;

    const totalFactor = batteryFactor * screenFactor * bodyFactor * issuesFactor * (1 + specAdj) * (1 + accessoryBonus);
    const finalValue = Math.max(0, afterAge * totalFactor);

    let grade = 'D — Needs repair';
    let gradeTone = 'red';
    if (totalFactor >= 0.85) { grade = 'A — Excellent'; gradeTone = 'green'; }
    else if (totalFactor >= 0.7) { grade = 'B — Good'; gradeTone = 'green'; }
    else if (totalFactor >= 0.55) { grade = 'C — Fair'; gradeTone = 'amber'; }

    setResult({
      basePrice, afterAge, ageFactor, batteryFactor, screenFactor, bodyFactor,
      issuesFactor, issueCount, specAdj, accessoryBonus, totalFactor, finalValue,
      grade, gradeTone,
      low: finalValue * 0.9, high: finalValue * 1.1,
    });
  }

  const canCalculate = isCustom ? parseFloat(form.customBasePrice) > 0 : true;

  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)', fontFamily: 'var(--font-body)', color: 'var(--ink)' }} className="w-full p-4 sm:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        :root {
          --ink: #1C2B2A;
          --paper: #E9ECE7;
          --stock: #F7F5EC;
          --amber: #C97A1A;
          --teal: #1F6F78;
          --green: #2F8F6E;
          --red: #B8433A;
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'IBM Plex Sans', sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
        }
        .disp { font-family: var(--font-display); }
        .mono { font-family: var(--font-mono); }
        .ticket {
          background: var(--stock);
          border: 1px solid rgba(28,43,42,0.15);
          border-radius: 10px;
          position: relative;
        }
        .perf {
          border-top: 2px dashed rgba(28,43,42,0.25);
          position: relative;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
        }
        .perf::before, .perf::after {
          content: '';
          position: absolute;
          top: -10px;
          width: 20px; height: 20px;
          background: var(--paper);
          border-radius: 50%;
        }
        .perf::before { left: -11px; }
        .perf::after { right: -11px; }
        .stamp {
          transform: rotate(-6deg);
          border: 3px solid currentColor;
          border-radius: 8px;
          display: inline-block;
          padding: 0.35rem 0.9rem;
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .field-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(28,43,42,0.6);
          display: block;
          margin-bottom: 0.3rem;
        }
        input[type="text"], input[type="number"], select {
          width: 100%;
          background: white;
          border: 1px solid rgba(28,43,42,0.2);
          border-radius: 6px;
          padding: 0.55rem 0.7rem;
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--ink);
        }
        input:focus, select:focus, button:focus-visible {
          outline: 2px solid var(--teal);
          outline-offset: 1px;
        }
        .pill-btn {
          border: 1px solid rgba(28,43,42,0.2);
          border-radius: 999px;
          padding: 0.5rem 1rem;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          background: white;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pill-btn.active {
          background: var(--ink);
          color: var(--stock);
          border-color: var(--ink);
        }
        .toggle-type {
          background: white;
          border: 1px solid rgba(28,43,42,0.2);
          border-radius: 8px;
          padding: 0.6rem 1.1rem;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .toggle-type.active {
          background: var(--teal);
          color: white;
          border-color: var(--teal);
        }
        .line-item {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          padding: 0.3rem 0;
          border-bottom: 1px dotted rgba(28,43,42,0.15);
        }
        .btn-primary {
          background: var(--amber);
          color: white;
          font-family: var(--font-display);
          font-weight: 600;
          border-radius: 8px;
          padding: 0.75rem 1.25rem;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .btn-primary:hover { opacity: 0.92; }
        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          padding: 0.25rem 0;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="field-label">Resale appraisal · not a guarantee of sale price</span>
            <h1 className="disp text-2xl sm:text-3xl font-bold">Device Appraisal Ticket</h1>
          </div>
          <div className="mono text-xs text-right opacity-60">
            <div>Ticket {tid}</div>
            <div>{today}</div>
          </div>
        </div>

        <div className="ticket p-5 sm:p-7">
          {/* Device type toggle */}
          <div className="flex gap-3 mb-6">
            <button className={`toggle-type ${deviceType === 'phone' ? 'active' : ''}`} onClick={() => switchDeviceType('phone')}>
              <Smartphone size={16} /> Phone
            </button>
            <button className={`toggle-type ${deviceType === 'laptop' ? 'active' : ''}`} onClick={() => switchDeviceType('laptop')}>
              <Laptop size={16} /> Laptop
            </button>
          </div>

          {/* Auto-detect */}
          <div className="mb-6">
            <span className="field-label">Step 1 · Auto-detect (optional)</span>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="pill-btn flex items-center gap-2" onClick={runScan} disabled={scanning}>
                <ScanLine size={14} /> {scanning ? 'Scanning…' : 'Scan this device'}
              </button>
              <span className="text-xs opacity-60">Reads what your browser exposes. Won't get exact model or battery health — fill those in manually below.</span>
            </div>
            {detected && !detected.error && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 mono text-xs">
                <div className="p-2 bg-white rounded border border-black/10">OS<br /><b>{detected.os}</b></div>
                <div className="p-2 bg-white rounded border border-black/10">CPU cores<br /><b>{detected.cores || 'n/a'}</b></div>
                <div className="p-2 bg-white rounded border border-black/10">RAM (approx)<br /><b>{detected.ram ? detected.ram + ' GB' : 'n/a in this browser'}</b></div>
                <div className="p-2 bg-white rounded border border-black/10">Screen<br /><b>{detected.resolution}</b></div>
              </div>
            )}
            {detected && detected.error && (
              <div className="mt-3 text-xs flex items-center gap-2" style={{ color: 'var(--red)' }}>
                <AlertTriangle size={14} /> Couldn't read device info in this browser — enter specs manually.
              </div>
            )}
          </div>

          {/* Manual form */}
          <div>
            <span className="field-label">Step 2 · Model & specs</span>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Model</label>
                <select value={form.modelKey} onChange={(e) => onModelChange(e.target.value)}>
                  {db.map((d) => (
                    <option key={d.key} value={d.key}>{d.name}</option>
                  ))}
                </select>
              </div>
              {isCustom && (
                <div>
                  <label className="field-label">Original / launch price (₹)</label>
                  <input type="number" placeholder="e.g. 50000" value={form.customBasePrice} onChange={(e) => updateForm('customBasePrice', e.target.value)} />
                </div>
              )}
              <div>
                <label className="field-label">Age (years, decimals ok)</label>
                <input type="number" step="0.1" value={form.years} onChange={(e) => updateForm('years', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Storage (GB)</label>
                <input type="number" value={form.storageGB} onChange={(e) => updateForm('storageGB', e.target.value)} />
              </div>
              <div>
                <label className="field-label">RAM (GB)</label>
                <input type="number" value={form.ramGB} onChange={(e) => updateForm('ramGB', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Battery health % (from device settings)</label>
                <input type="number" min="0" max="100" value={form.batteryHealth} onChange={(e) => updateForm('batteryHealth', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Screen condition</label>
                <select value={form.screenCondition} onChange={(e) => updateForm('screenCondition', e.target.value)}>
                  <option value="flawless">Flawless</option>
                  <option value="minor">Minor scratches</option>
                  <option value="visible">Visible scratches</option>
                  <option value="cracked">Cracked / damaged</option>
                </select>
              </div>
              <div>
                <label className="field-label">Body condition</label>
                <select value={form.bodyCondition} onChange={(e) => updateForm('bodyCondition', e.target.value)}>
                  <option value="like-new">Like new</option>
                  <option value="light">Light wear</option>
                  <option value="heavy">Heavy wear</option>
                  <option value="damaged">Dents / damage</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="field-label">Functional issues (check any that apply)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4">
                {Object.keys(form.issues).map((k) => (
                  <label key={k} className="checkbox-row">
                    <input type="checkbox" checked={form.issues[k]} onChange={() => toggleIssue(k)} />
                    <span className="capitalize">{k === 'wifi' ? 'Wi-Fi' : k}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <label className="checkbox-row">
                <input type="checkbox" checked={form.accessories} onChange={() => updateForm('accessories', !form.accessories)} />
                <span>Original box + charger included</span>
              </label>
            </div>

            <button className="btn-primary mt-6" onClick={calculate} disabled={!canCalculate}>
              Generate appraisal
            </button>
            {!canCalculate && <div className="text-xs mt-2" style={{ color: 'var(--red)' }}>Enter an original price for custom devices.</div>}
          </div>

          {/* Result */}
          {result && (
            <div className="perf">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <span className="field-label">Estimated resale value</span>
                  <div className="disp text-3xl sm:text-4xl font-bold" style={{ color: 'var(--teal)' }}>
                    {formatINR(result.low)} – {formatINR(result.high)}
                  </div>
                </div>
                <div className="stamp" style={{ color: result.gradeTone === 'green' ? 'var(--green)' : result.gradeTone === 'amber' ? 'var(--amber)' : 'var(--red)' }}>
                  {result.grade}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8">
                <div>
                  <span className="field-label mb-2 block">Line items</span>
                  <div className="line-item"><span>Original price</span><span>{formatINR(result.basePrice)}</span></div>
                  <div className="line-item"><span>Age depreciation ({form.years} yrs)</span><span>×{result.ageFactor.toFixed(2)} → {formatINR(result.afterAge)}</span></div>
                  <div className="line-item"><span>Battery health ({form.batteryHealth}%)</span><span>×{result.batteryFactor.toFixed(2)}</span></div>
                  <div className="line-item"><span>Screen condition</span><span>×{result.screenFactor.toFixed(2)}</span></div>
                  <div className="line-item"><span>Body condition</span><span>×{result.bodyFactor.toFixed(2)}</span></div>
                  <div className="line-item"><span>Functional issues ({result.issueCount})</span><span>×{result.issuesFactor.toFixed(2)}</span></div>
                  <div className="line-item"><span>Storage/RAM adjustment</span><span>{result.specAdj >= 0 ? '+' : ''}{(result.specAdj * 100).toFixed(0)}%</span></div>
                  <div className="line-item"><span>Accessories bonus</span><span>+{(result.accessoryBonus * 100).toFixed(0)}%</span></div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className="field-label mb-2 block">Notes</span>
                  <div className="flex items-start gap-2 text-xs mb-2 opacity-80">
                    <CircleCheck size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--green)' }} />
                    <span>This is a formula-based estimate from launch price, age decay, and condition — a good starting anchor for pricing, not a live market quote.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs mb-2 opacity-80">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--amber)' }} />
                    <span>For a live-market number, cross-check this range against a few real listings for the same model/condition on OLX, Cashify, or eBay before pricing it.</span>
                  </div>
                  <button className="pill-btn flex items-center gap-2 mt-2" onClick={() => setResult(null)}>
                    <RotateCcw size={12} /> Clear result
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs opacity-50 mt-4 mono">
          <Sparkles size={12} className="inline mb-0.5" /> All figures illustrative — adjust the model database for your exact market.
        </div>
      </div>
    </div>
  );
}
