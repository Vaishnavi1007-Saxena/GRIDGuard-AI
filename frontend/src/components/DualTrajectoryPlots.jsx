import React, { useRef, useEffect } from 'react';

export default function DualTrajectoryPlots({ timeSeries, currentTime, onSeek }) {
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);

  useEffect(() => {
    if (!timeSeries || timeSeries.length === 0) return;

    // ----------------------------------------------------
    // CHART 1: Grid Health & Frequency Response (Image 3 Left)
    // ----------------------------------------------------
    const c1 = chart1Ref.current;
    if (c1) {
      const ctx = c1.getContext('2d');
      const w = c1.width;
      const h = c1.height;
      ctx.clearRect(0, 0, w, h);

      // Dark plot background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Horizontal subtle guide lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      [25, 50, 75].forEach(pct => {
        const py = h - (pct / 100) * (h - 20) - 10;
        ctx.beginPath(); ctx.moveTo(35, py); ctx.lineTo(w - 10, py); ctx.stroke();
      });

      // Axis zero/floor line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(35, h - 10); ctx.lineTo(w - 10, h - 10); ctx.stroke();

      const mapX = (t) => 35 + (t / 300) * (w - 45);

      // 1. Line Loading (%) [Amber/Orange, 2.0px]
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      timeSeries.forEach((pt, i) => {
        const px = mapX(pt.t);
        // Normalized line loading for visual clarity around 60-120%
        const normLoad = Math.max(10, Math.min(95, (pt.lineLoading - 50) * 1.3));
        const py = h - (normLoad / 100) * (h - 24) - 12;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // 2. Frequency Response (Hz) [Blue/Sky, 2.0px]
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      timeSeries.forEach((pt, i) => {
        const px = mapX(pt.t);
        // Normalized freq: nominal 50Hz maps to 50%
        const normFreq = Math.max(10, Math.min(90, ((pt.freq - 48.5) / 3.0) * 100));
        const py = h - (normFreq / 100) * (h - 24) - 12;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // 3. Grid Health (%) [Emerald Green, 2.5px]
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      timeSeries.forEach((pt, i) => {
        const px = mapX(pt.t);
        const normHealth = Math.max(15, Math.min(98, pt.health));
        const py = h - (normHealth / 100) * (h - 24) - 12;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Synchronous White Time Cursor
      const curX = mapX(currentTime);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(curX, 4); ctx.lineTo(curX, h - 4); ctx.stroke();
    }

    // ----------------------------------------------------
    // CHART 2: Power Dispatch vs Demand (MW) (Image 3 Right)
    // ----------------------------------------------------
    const c2 = chart2Ref.current;
    if (c2) {
      const ctx = c2.getContext('2d');
      const w = c2.width;
      const h = c2.height;
      ctx.clearRect(0, 0, w, h);

      // Dark plot background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Horizontal subtle guide lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      [35, 70, 105].forEach(mw => {
        const py = h - (mw / 140) * (h - 20) - 10;
        ctx.beginPath(); ctx.moveTo(35, py); ctx.lineTo(w - 10, py); ctx.stroke();
      });

      const mapX = (t) => 35 + (t / 300) * (w - 45);

      // Total Load / Demand [Red / Rose line, 2.0px]
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      timeSeries.forEach((pt, i) => {
        const px = mapX(pt.t);
        const py = h - (pt.Pload / 140) * (h - 24) - 12;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Total Generation [Cyan curve, 2.0px]
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      timeSeries.forEach((pt, i) => {
        const px = mapX(pt.t);
        const py = h - (pt.Pgen / 140) * (h - 24) - 12;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Battery SOC (%) [Indigo dashed, 1.8px]
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      timeSeries.forEach((pt, i) => {
        const px = mapX(pt.t);
        const py = h - (pt.currentSOC / 100) * (h - 24) - 12;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Synchronous White Time Cursor
      const curX = mapX(currentTime);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(curX, 4); ctx.lineTo(curX, h - 4); ctx.stroke();
    }
  }, [timeSeries, currentTime]);

  const handleCanvasClick = (e, canvasRef) => {
    if (!canvasRef.current || !onSeek) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const w = rect.width;
    const normX = Math.max(0, Math.min(1, (clickX - 35) / (w - 45)));
    const targetT = Math.round(normX * 300);
    onSeek(targetT);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '14px',
      marginTop: '14px'
    }}>
      {/* CHART 1: GRID HEALTH & FREQUENCY RESPONSE */}
      <div style={{
        backgroundColor: '#090e17',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '12px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.4px' }}>
              GRID HEALTH & FREQUENCY RESPONSE
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '9.5px', fontFamily: 'monospace' }}>
            <span style={{ color: '#10b981' }}>● Health (%)</span>
            <span style={{ color: '#38bdf8' }}>● Freq (Hz)</span>
            <span style={{ color: '#f59e0b' }}>● Line Loading (%)</span>
          </div>
        </div>
        <div style={{
          backgroundColor: '#060a12',
          border: '1px solid #141f32',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <canvas
            ref={chart1Ref}
            width={540}
            height={130}
            onClick={(e) => handleCanvasClick(e, chart1Ref)}
            style={{ width: '100%', height: '120px', display: 'block', cursor: 'crosshair' }}
          />
        </div>
      </div>

      {/* CHART 2: POWER DISPATCH VS DEMAND (MW) */}
      <div style={{
        backgroundColor: '#090e17',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '12px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00f0ff', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.4px' }}>
              POWER DISPATCH VS DEMAND (MW)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '9.5px', fontFamily: 'monospace' }}>
            <span style={{ color: '#00f0ff' }}>● Total Gen</span>
            <span style={{ color: '#f43f5e' }}>● Total Load</span>
            <span style={{ color: '#818cf8' }}>┄ Battery SOC</span>
          </div>
        </div>
        <div style={{
          backgroundColor: '#060a12',
          border: '1px solid #141f32',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <canvas
            ref={chart2Ref}
            width={540}
            height={130}
            onClick={(e) => handleCanvasClick(e, chart2Ref)}
            style={{ width: '100%', height: '120px', display: 'block', cursor: 'crosshair' }}
          />
        </div>
      </div>
    </div>
  );
}
