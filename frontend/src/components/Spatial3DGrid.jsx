import React, { useRef, useEffect, useState } from 'react';

export default function Spatial3DGrid({ telemetry, activeFaults, onSelectNode }) {
  const canvasRef = useRef(null);
  const [rotX, setRotX] = useState(0.52);
  const [rotY, setRotY] = useState(-0.62);
  const [zoom, setZoom] = useState(1.15);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const t = telemetry || {
    freq: 49.98,
    volt: 0.98,
    health: 98,
    status: 'NORMAL',
    lineLoading: 70,
    Pgen: 100,
    Pload: 100
  };

  const faults = activeFaults || {};

  // 12 Realistic City Infrastructure Nodes
  const cityNodes = {
    generator: {
      id: 'generator', name: 'Main Power Plant (CCGT 850 MW)', zone: 'Generation',
      sign: 'MAIN GRID / GENERATOR', x: -115, y: 0, z: -75, color: '#00f0ff'
    },
    towers: {
      id: 'towers', name: '220 kV Lattice Transmission Towers', zone: 'Transmission',
      sign: '220 kV TRANSMISSION', x: -80, y: 0, z: -45, color: '#38bdf8'
    },
    substation: {
      id: 'substation', name: 'Central 220kV / 11kV Substation', zone: 'Substation',
      sign: '11 kV SUBSTATION', x: -48, y: 0, z: -18, color: '#00f0ff'
    },
    transformer: {
      id: 'transformer', name: 'Main Step-Down Transformer T1', zone: 'Substation Core',
      sign: 'TRANSFORMER T1', x: -40, y: 0, z: -10, color: '#0284c7'
    },
    hospital: {
      id: 'hospital', name: 'City General Hospital & Emergency Center', zone: 'Critical Healthcare',
      sign: 'HOSPITAL / EMERGENCY', x: 80, y: 0, z: -12, color: '#10b981', isProtected: true
    },
    pharmacy: {
      id: 'pharmacy', name: 'PharmaCare 24/7 Medical Store', zone: 'Commercial Healthcare',
      sign: 'PHARMACY 24/7', x: 38, y: 0, z: 28, color: '#10b981'
    },
    residential: {
      id: 'residential', name: 'Residential Neighborhood & Smart Meters', zone: 'Residential',
      sign: 'RESIDENTIAL DISTRICT', x: 84, y: 0, z: 50, color: '#38bdf8'
    },
    industrial: {
      id: 'industrial', name: 'Heavy Industrial Manufacturing Complex', zone: 'Industrial',
      sign: 'INDUSTRIAL ZONE', x: -72, y: 0, z: 62, color: '#f59e0b'
    },
    datacenter: {
      id: 'datacenter', name: 'Hyperscale AI GPU Data Center', zone: 'High-Tech Compute',
      sign: 'AI DATA CENTER', x: 25, y: 0, z: 68, color: '#818cf8'
    },
    solar: {
      id: 'solar', name: 'Grid-Scale Solar Photovoltaic Farm', zone: 'Renewable Solar',
      sign: 'SOLAR PV FARM', x: -95, y: 0, z: 15, color: '#eab308'
    },
    wind: {
      id: 'wind', name: 'Coastal Wind Turbine Farm', zone: 'Renewable Wind',
      sign: 'COASTAL WIND FARM', x: -115, y: 0, z: 45, color: '#38bdf8'
    },
    bess: {
      id: 'bess', name: 'BESS Battery Energy Storage Plaza', zone: 'Storage',
      sign: 'BESS / ENERGY STORAGE', x: -18, y: 0, z: -70, color: '#10b981'
    },
    evPlaza: {
      id: 'evPlaza', name: 'Ultra-Fast EV Fast-Charging Hub', zone: 'Electromobility',
      sign: 'EV CHARGING PLAZA', x: 65, y: 0, z: -70, color: '#00f0ff'
    }
  };

  const setCameraPreset = (p) => {
    switch (p) {
      case 'overview':    setRotX(0.52); setRotY(-0.62); setZoom(1.15); setSelectedNodeId(null); break;
      case 'substation':  setRotX(0.40); setRotY(-0.35); setZoom(1.9); setSelectedNodeId('substation'); break;
      case 'transformer': setRotX(0.35); setRotY(-0.25); setZoom(2.4); setSelectedNodeId('transformer'); break;
      case 'hospital':    setRotX(0.42); setRotY(-1.10); setZoom(1.9); setSelectedNodeId('hospital'); break;
      case 'pharmacy':    setRotX(0.35); setRotY(-0.95); setZoom(2.2); setSelectedNodeId('pharmacy'); break;
      case 'residential': setRotX(0.45); setRotY(-1.25); setZoom(1.8); setSelectedNodeId('residential'); break;
      case 'industrial':  setRotX(0.42); setRotY(0.20);  setZoom(1.8); setSelectedNodeId('industrial'); break;
      case 'datacenter':  setRotX(0.40); setRotY(-0.80); setZoom(2.0); setSelectedNodeId('datacenter'); break;
      case 'ev':          setRotX(0.40); setRotY(-1.35); setZoom(2.0); setSelectedNodeId('evPlaza'); break;
      case 'solar':       setRotX(0.45); setRotY(0.40);  setZoom(1.9); setSelectedNodeId('solar'); break;
      case 'wind':        setRotX(0.42); setRotY(0.55);  setZoom(1.9); setSelectedNodeId('wind'); break;
      case 'bess':        setRotX(0.38); setRotY(-0.15); setZoom(2.1); setSelectedNodeId('bess'); break;
      case 'street':      setRotX(0.12); setRotY(-0.55); setZoom(2.5); break;
      default: break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let flowOffset = 0;
    let smokePuff = 0;
    let windBladeAngle = 0;

    const vehicles = [
      { x: -50, z: 0, dx: 0.75, dz: 0, color: '#38bdf8', isAmbulance: false },
      { x: 30, z: 0, dx: -0.85, dz: 0, color: '#ef4444', isAmbulance: false },
      { x: 0, z: -45, dx: 0, dz: 0.7, color: '#f59e0b', isAmbulance: false },
      { x: 0, z: 35, dx: 0, dz: -0.9, color: '#ffffff', isAmbulance: true },
      { x: 45, z: 14, dx: -0.55, dz: 0, color: '#10b981', isAmbulance: false },
      { x: -35, z: 12, dx: 0.65, dz: 0, color: '#a855f7', isAmbulance: false },
      { x: -70, z: 45, dx: 0.4, dz: 0, color: '#f59e0b', isTruck: true } // Industrial cargo truck
    ];

    const pedestrians = [
      { x: 18, z: 18, dx: 0.22, color: '#38bdf8' },
      { x: 30, z: 18, dx: -0.20, color: '#f43f5e' },
      { x: 42, z: 28, dx: 0.25, color: '#10b981' },
      { x: 78, z: 8, dx: 0.22, color: '#e2e8f0' }
    ];

    function project(x, y, z) {
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = zoom * 1.35 * (canvas.width / 720);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 15;

      return { x: cx + x1 * scale, y: cy - y2 * scale, depth: z2 };
    }

    function drawBox3D(x, y, z, w, h, d, fill, stroke) {
      const t1 = project(x - w/2, y + h, z - d/2);
      const t2 = project(x + w/2, y + h, z - d/2);
      const t3 = project(x + w/2, y + h, z + d/2);
      const t4 = project(x - w/2, y + h, z + d/2);

      const p2 = project(x + w/2, y, z - d/2);
      const p3 = project(x + w/2, y, z + d/2);
      const p4 = project(x - w/2, y, z + d/2);

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke || 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;

      // Top
      ctx.beginPath();
      ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Front
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Right
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    function drawPitchedRoof3D(x, y, z, w, h, d, fill) {
      const b1 = project(x - w/2, y, z - d/2);
      const b2 = project(x + w/2, y, z - d/2);
      const b3 = project(x + w/2, y, z + d/2);
      const b4 = project(x - w/2, y, z + d/2);

      const ridge1 = project(x - w/2, y + h, z);
      const ridge2 = project(x + w/2, y + h, z);

      ctx.fillStyle = fill;
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(b4.x, b4.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(ridge2.x, ridge2.y); ctx.lineTo(ridge1.x, ridge1.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(ridge2.x, ridge2.y); ctx.lineTo(ridge1.x, ridge1.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    function drawSignBoard3D(x, y, z, text, bgColor, textColor = '#ffffff') {
      const p = project(x, y, z);
      ctx.font = 'bold 8.5px sans-serif';
      const tw = ctx.measureText(text).width + 8;
      ctx.fillStyle = bgColor;
      ctx.fillRect(p.x - tw / 2, p.y - 7, tw, 14);
      ctx.strokeStyle = '#ffffffaa';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - tw / 2, p.y - 7, tw, 14);
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(text, p.x, p.y + 3);
    }

    function drawWindTurbine(x, z, angle) {
      const pBase = project(x, 0, z);
      const pHub = project(x, 24, z);

      // Tower
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(pBase.x, pBase.y); ctx.lineTo(pHub.x, pHub.y); ctx.stroke();

      // Hub
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(pHub.x, pHub.y, 3, 0, Math.PI * 2); ctx.fill();

      // 3 Blades
      for (let b = 0; b < 3; b++) {
        const rad = angle + (b * 2 * Math.PI) / 3;
        const bx = pHub.x + Math.sin(rad) * 16 * zoom;
        const by = pHub.y - Math.cos(rad) * 16 * zoom;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(pHub.x, pHub.y); ctx.lineTo(bx, by); ctx.stroke();
      }
    }

    function drawTree(x, z) {
      const pBase = project(x, 0, z);
      const pMid = project(x, 3, z);
      const pTop = project(x, 6.5, z);

      ctx.strokeStyle = '#4a2e18';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(pBase.x, pBase.y); ctx.lineTo(pMid.x, pMid.y); ctx.stroke();

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(pTop.x, pTop.y, 6.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawLatticeTower(x, z) {
      const p0 = project(x, 0, z);
      const pTop = project(x, 26, z);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(pTop.x, pTop.y); ctx.stroke();

      const armL1 = project(x - 9, 16, z);
      const armR1 = project(x + 9, 16, z);
      ctx.beginPath(); ctx.moveTo(armL1.x, armL1.y); ctx.lineTo(armR1.x, armR1.y); ctx.stroke();

      const armL2 = project(x - 6, 22, z);
      const armR2 = project(x + 6, 22, z);
      ctx.beginPath(); ctx.moveTo(armL2.x, armL2.y); ctx.lineTo(armR2.x, armR2.y); ctx.stroke();
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isCritical = t.status === 'CRITICAL' || t.health < 70;
      const isWarning = t.status === 'WARNING' || t.health < 90;
      const powerColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#00f0ff';
      const flowSpeed = isCritical ? 2.8 : isWarning ? 2.0 : 1.2;

      // 1. Terrain Base
      drawBox3D(0, -0.5, 0, 270, 0.4, 270, '#0c1a10', '#132c1b');

      // 2. Asphalt Roads & Markings
      drawBox3D(0, 0, 0, 250, 0.15, 16, '#0f172a', '#1e293b');
      drawBox3D(0, 0, 0, 16, 0.15, 250, '#0f172a', '#1e293b');
      drawBox3D(35, 0, 22, 10, 0.15, 80, '#0f172a', '#1e293b');
      drawBox3D(35, 0, 62, 80, 0.15, 10, '#0f172a', '#1e293b');
      drawBox3D(-35, 0, 22, 10, 0.15, 75, '#0f172a', '#1e293b');

      // Dashed lines
      for (let rx = -110; rx <= 110; rx += 14) {
        const p1 = project(rx - 3, 0.2, 0);
        const p2 = project(rx + 3, 0.2, 0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }

      // Trees
      [[-25, -20], [-15, -22], [15, -20], [25, -22], [20, 18], [20, 32], [-20, 18], [-20, 32], [65, 20], [95, 20]].forEach(p => drawTree(p[0], p[1]));

      // Traffic
      vehicles.forEach(v => {
        v.x += v.dx; v.z += v.dz;
        if (v.x > 120) v.x = -120; if (v.x < -120) v.x = 120;
        if (v.z > 120) v.z = -120; if (v.z < -120) v.z = 120;

        const w = v.isAmbulance ? 6.5 : v.isTruck ? 8.5 : 4.8;
        const h = v.isTruck ? 3.4 : 2.4;
        drawBox3D(v.x, 0.3, v.z, w, h, 3.2, v.color, '#334155');

        if (v.isAmbulance) {
          const pAmb = project(v.x, 3.5, v.z);
          ctx.fillStyle = (Date.now() % 350 < 175) ? '#ef4444' : '#38bdf8';
          ctx.beginPath(); ctx.arc(pAmb.x, pAmb.y, 4.5, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Pedestrians
      pedestrians.forEach(p => {
        p.x += p.dx;
        if (p.x > 88) p.x = 12; if (p.x < 12) p.x = 88;
        const pPed = project(p.x, 1.4, p.z || 18);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(pPed.x, pPed.y, 2.2, 0, Math.PI * 2); ctx.fill();
      });

      // 3. Physical Glowing Power Lines
      flowOffset = (flowOffset + 0.022 * flowSpeed) % 1;
      const lines = [
        { from: cityNodes.generator, to: cityNodes.towers },
        { from: cityNodes.towers, to: cityNodes.substation },
        { from: cityNodes.substation, to: cityNodes.transformer },
        { from: cityNodes.transformer, to: cityNodes.hospital, color: '#10b981' },
        { from: cityNodes.transformer, to: cityNodes.pharmacy },
        { from: cityNodes.transformer, to: cityNodes.residential },
        { from: cityNodes.transformer, to: cityNodes.industrial, color: faults.industrial ? '#ef4444' : powerColor },
        { from: cityNodes.transformer, to: cityNodes.datacenter, color: faults.datacenter ? '#ef4444' : '#818cf8' },
        { from: cityNodes.transformer, to: cityNodes.evPlaza, color: faults.ev ? '#ef4444' : powerColor },
        { from: cityNodes.solar, to: cityNodes.substation, color: faults.solar ? '#ef4444' : '#eab308' },
        { from: cityNodes.wind, to: cityNodes.substation, color: faults.wind ? '#ef4444' : '#38bdf8' },
        { from: cityNodes.bess, to: cityNodes.substation, color: faults.battery ? '#ef4444' : '#10b981' }
      ];

      lines.forEach(l => {
        const pA = project(l.from.x, 12, l.from.z);
        const pB = project(l.to.x, 12, l.to.z);
        const c = l.color || powerColor;

        ctx.strokeStyle = c;
        ctx.lineWidth = 2.8;
        ctx.shadowColor = c;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
        ctx.shadowBlur = 0;

        for (let i = 0; i < 2; i++) {
          const off = (flowOffset + i * 0.5) % 1;
          const px = pA.x + (pB.x - pA.x) * off;
          const py = pA.y + (pB.y - pA.y) * off;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
        }
      });

      // 4. Grounded Architectural 3D Objects with Building Signage
      // Main Generator
      drawBox3D(cityNodes.generator.x, 0, cityNodes.generator.z, 36, 18, 22, '#1e293b', '#00f0ff');
      drawBox3D(cityNodes.generator.x + 14, 0, cityNodes.generator.z, 8, 8, 8, '#0284c7', '#38bdf8');
      drawBox3D(cityNodes.generator.x - 8, 18, cityNodes.generator.z - 4, 8, 14, 8, '#475569', '#94a3b8');
      drawBox3D(cityNodes.generator.x + 8, 18, cityNodes.generator.z - 4, 8, 14, 8, '#475569', '#94a3b8');
      drawSignBoard3D(cityNodes.generator.x, 22, cityNodes.generator.z, 'MAIN GRID / GENERATOR 850MW', '#0369a1');

      // Lattice Towers
      drawLatticeTower(cityNodes.towers.x, cityNodes.towers.z);
      drawLatticeTower(cityNodes.towers.x + 16, cityNodes.towers.z + 12);

      // Central Substation
      drawBox3D(cityNodes.substation.x, 0, cityNodes.substation.z, 28, 0.3, 24, '#334155', '#475569');
      drawBox3D(cityNodes.substation.x - 8, 0, cityNodes.substation.z, 4, 16, 18, '#64748b', '#cbd5e1');
      drawBox3D(cityNodes.substation.x + 8, 0, cityNodes.substation.z, 8, 6, 12, '#1e293b', '#38bdf8');
      drawSignBoard3D(cityNodes.substation.x, 18, cityNodes.substation.z, 'CENTRAL 11kV SUBSTATION', '#0284c7');

      // Transformer T1
      const xfmrCol = t.lineLoading > 100 ? '#ef4444' : t.lineLoading > 80 ? '#f59e0b' : '#0284c7';
      drawBox3D(cityNodes.transformer.x, 0, cityNodes.transformer.z, 9, 8, 7, xfmrCol, '#00f0ff');
      drawBox3D(cityNodes.transformer.x - 5.5, 0, cityNodes.transformer.z, 2, 6.5, 6.5, '#1e293b', '#0284c7');
      drawBox3D(cityNodes.transformer.x + 5.5, 0, cityNodes.transformer.z, 2, 6.5, 6.5, '#1e293b', '#0284c7');
      drawBox3D(cityNodes.transformer.x, 8, cityNodes.transformer.z - 1, 3.5, 2.8, 3.5, '#475569', '#38bdf8');

      // Hospital & Helipad
      drawBox3D(cityNodes.hospital.x, 0, cityNodes.hospital.z, 34, 28, 26, '#f8fafc', '#10b981');
      drawBox3D(cityNodes.hospital.x + 14, 0, cityNodes.hospital.z - 3, 14, 12, 14, '#e2e8f0', '#10b981');
      drawBox3D(cityNodes.hospital.x + 18, 0, cityNodes.hospital.z - 3, 8, 0.4, 12, '#ef4444', '#f8fafc');

      const pCross = project(cityNodes.hospital.x, 30, cityNodes.hospital.z);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pCross.x - 10, pCross.y - 3, 20, 6);
      ctx.fillRect(pCross.x - 3, pCross.y - 10, 6, 20);

      const pPad = project(cityNodes.hospital.x, 28.2, cityNodes.hospital.z);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(pPad.x, pPad.y, 14 * zoom, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('H', pPad.x - 4, pPad.y + 4);
      drawSignBoard3D(cityNodes.hospital.x, 34, cityNodes.hospital.z, 'HOSPITAL & EMERGENCY (PROTECTED)', '#065f46');

      // Pharmacy & Green Cross
      drawBox3D(cityNodes.pharmacy.x, 0, cityNodes.pharmacy.z, 16, 11, 14, '#064e3b', '#10b981');
      drawBox3D(cityNodes.pharmacy.x, 8, cityNodes.pharmacy.z + 5, 15, 0.4, 4, '#10b981', '#34d399');
      const pPharm = project(cityNodes.pharmacy.x, 13, cityNodes.pharmacy.z);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(pPharm.x - 6, pPharm.y - 2, 12, 4);
      ctx.fillRect(pPharm.x - 2, pPharm.y - 6, 4, 12);
      drawSignBoard3D(cityNodes.pharmacy.x, 15, cityNodes.pharmacy.z, 'PHARMACY 24/7', '#047857');

      // Residential Houses with Pitched Roofs
      const rHouses = [
        { x: cityNodes.residential.x - 14, z: cityNodes.residential.z - 12 },
        { x: cityNodes.residential.x + 12, z: cityNodes.residential.z - 12 },
        { x: cityNodes.residential.x - 14, z: cityNodes.residential.z + 12 },
        { x: cityNodes.residential.x + 12, z: cityNodes.residential.z + 12 }
      ];
      rHouses.forEach(h => {
        drawBox3D(h.x, 0, h.z, 14, 8, 14, '#e2e8f0', '#94a3b8');
        drawPitchedRoof3D(h.x, 8, h.z, 15, 6, 15, '#b91c1c');
        drawBox3D(h.x, 0.05, h.z, 18, 0.1, 18, '#166534', '#15803d');
      });
      drawSignBoard3D(cityNodes.residential.x, 18, cityNodes.residential.z, 'RESIDENTIAL DISTRICT', '#1e3a5f');

      // Industrial Heavy Complex
      drawBox3D(cityNodes.industrial.x, 0, cityNodes.industrial.z, 36, 18, 26, '#334155', '#94a3b8');
      drawBox3D(cityNodes.industrial.x + 12, 18, cityNodes.industrial.z - 6, 5, 18, 5, '#475569', '#cbd5e1');
      smokePuff = (smokePuff + 0.15) % 25;
      const pSmoke = project(cityNodes.industrial.x + 12, 36 + smokePuff, cityNodes.industrial.z - 6);
      ctx.fillStyle = `rgba(226, 232, 240, ${(25 - smokePuff) / 40})`;
      ctx.beginPath(); ctx.arc(pSmoke.x, pSmoke.y, 4 + smokePuff * 0.4, 0, Math.PI * 2); ctx.fill();
      drawSignBoard3D(cityNodes.industrial.x, 22, cityNodes.industrial.z, 'INDUSTRIAL ZONE (30 MW)', '#854d0e');

      // Hyperscale AI Data Center (PDF addition!)
      drawBox3D(cityNodes.datacenter.x, 0, cityNodes.datacenter.z, 28, 14, 20, '#1e1b4b', '#818cf8');
      drawBox3D(cityNodes.datacenter.x - 6, 14, cityNodes.datacenter.z, 6, 4, 6, '#312e81', '#a5b4fc'); // Liquid cooling tower
      drawSignBoard3D(cityNodes.datacenter.x, 18, cityNodes.datacenter.z, 'AI DATA CENTER (GPU CLUSTER)', '#4338ca');

      // Solar Arrays
      for (let s = -14; s <= 14; s += 9) {
        drawBox3D(cityNodes.solar.x + s, 0, cityNodes.solar.z, 7, 3, 20, '#0f172a', '#eab308');
      }
      drawSignBoard3D(cityNodes.solar.x, 10, cityNodes.solar.z, 'SOLAR PV FARM (35 MW)', '#a16207');

      // Coastal Wind Turbines (PDF addition!)
      windBladeAngle += 0.05;
      drawWindTurbine(cityNodes.wind.x - 8, cityNodes.wind.z - 8, windBladeAngle);
      drawWindTurbine(cityNodes.wind.x + 8, cityNodes.wind.z + 8, windBladeAngle + 1.2);
      drawSignBoard3D(cityNodes.wind.x, 26, cityNodes.wind.z, 'WIND FARM (20 MW)', '#0284c7');

      // BESS Containers
      const bCol = isCritical ? '#0284c7' : '#064e3b';
      drawBox3D(cityNodes.bess.x - 9, 0, cityNodes.bess.z, 8, 12, 18, bCol, '#10b981');
      drawBox3D(cityNodes.bess.x + 9, 0, cityNodes.bess.z, 8, 12, 18, bCol, '#10b981');
      drawSignBoard3D(cityNodes.bess.x, 16, cityNodes.bess.z, 'BESS STORAGE (50 MWh)', '#065f46');

      // EV Plaza Canopy & Cars
      drawBox3D(cityNodes.evPlaza.x, 0, cityNodes.evPlaza.z, 34, 10, 22, '#0c4a6e', '#38bdf8');
      drawBox3D(cityNodes.evPlaza.x, 10, cityNodes.evPlaza.z, 36, 1.2, 24, '#0369a1', '#38bdf8');
      for (let evX = -10; evX <= 10; evX += 10) {
        drawBox3D(cityNodes.evPlaza.x + evX, 0.4, cityNodes.evPlaza.z, 4.5, 2.2, 3.2, evX === 0 ? '#10b981' : '#ef4444', '#ffffff');
      }
      drawSignBoard3D(cityNodes.evPlaza.x, 15, cityNodes.evPlaza.z, 'EV FAST-CHARGING PLAZA', '#0369a1');

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [rotX, rotY, zoom, selectedNodeId, t, faults]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    setRotY(r => r + dx * 0.007);
    setRotX(r => Math.max(0.12, Math.min(1.25, r + dy * 0.007)));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => isDraggingRef.current = false;

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.7, Math.min(3.2, z - e.deltaY * 0.0015)));
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let closest = null;
    let minDist = 45;

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const scale = zoom * 1.35 * (canvas.width / 720);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 15;

    Object.values(cityNodes).forEach(node => {
      const x1 = node.x * cosY - node.z * sinY;
      const z1 = node.x * sinY + node.z * cosY;
      const y2 = 10 * cosX - z1 * sinX;
      const scrX = (cx + x1 * scale) / (canvas.width / rect.width);
      const scrY = (cy - y2 * scale) / (canvas.height / rect.height);

      const d = Math.hypot(clickX - scrX, clickY - scrY);
      if (d < minDist) {
        minDist = d;
        closest = node;
      }
    });

    if (closest) {
      setSelectedNodeId(closest.id);
      if (onSelectNode) onSelectNode(closest);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '430px', backgroundColor: '#070b12' }}>
      <canvas
        ref={canvasRef}
        width={1000}
        height={430}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        style={{ width: '100%', height: '100%', cursor: 'grab', display: 'block' }}
      />

      {/* Top-Left Live Physical Telemetry */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '12px',
        backgroundColor: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(6px)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '8px 14px',
        fontSize: '11px',
        fontFamily: 'Fira Code, monospace',
        color: '#cbd5e1',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '3px' }}>⚡ 3D SPATIAL TELEMETRY</div>
        <div>V_bus: <span style={{ color: t.volt < 0.95 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{t.volt.toFixed(3)} pu</span></div>
        <div>Freq:  <span style={{ color: t.freq < 49.5 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{t.freq.toFixed(2)} Hz</span></div>
        <div>Xfmr:  <span style={{ color: t.lineLoading > 90 ? '#ef4444' : '#f8fafc', fontWeight: 'bold' }}>{t.lineLoading.toFixed(0)}%</span></div>
        <div>Health: <span style={{ color: t.health < 70 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{t.health.toFixed(1)}%</span></div>
      </div>

      {/* Top-Right Hospital Protection Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '12px',
        backgroundColor: 'rgba(6, 78, 59, 0.92)',
        backdropFilter: 'blur(6px)',
        border: '1px solid #10b981',
        borderRadius: '8px',
        padding: '8px 14px',
        fontSize: '11px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '700',
        color: '#a7f3d0',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }}></span>
        🏥 HOSPITAL FEEDER: PROTECTED (100% ONLINE)
      </div>

      {/* Bottom Camera Preset Toolbar */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '4px',
        backgroundColor: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(6px)',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '4px 8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold', marginRight: '4px' }}>📹 PRESETS:</span>
          <button onClick={() => setCameraPreset('overview')} style={presetBtnStyle}>Overview</button>
          <button onClick={() => setCameraPreset('substation')} style={presetBtnStyle}>Substation</button>
          <button onClick={() => setCameraPreset('transformer')} style={presetBtnStyle}>Xfmr T1</button>
          <button onClick={() => setCameraPreset('hospital')} style={presetBtnStyle}>Hospital</button>
          <button onClick={() => setCameraPreset('pharmacy')} style={presetBtnStyle}>Pharmacy</button>
          <button onClick={() => setCameraPreset('residential')} style={presetBtnStyle}>Residential</button>
          <button onClick={() => setCameraPreset('industrial')} style={presetBtnStyle}>Industrial</button>
          <button onClick={() => setCameraPreset('datacenter')} style={presetBtnStyle}>Data Center</button>
          <button onClick={() => setCameraPreset('ev')} style={presetBtnStyle}>EV Plaza</button>
          <button onClick={() => setCameraPreset('solar')} style={presetBtnStyle}>Solar</button>
          <button onClick={() => setCameraPreset('wind')} style={presetBtnStyle}>Wind</button>
          <button onClick={() => setCameraPreset('bess')} style={presetBtnStyle}>BESS</button>
          <button onClick={() => setCameraPreset('street')} style={presetBtnStyle}>🚶 Street</button>
        </div>

        <div style={{ fontSize: '10px', color: '#64748b' }}>
          Click Object to Inspect | Drag to Orbit | Scroll to Zoom
        </div>
      </div>
    </div>
  );
}

const presetBtnStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  color: '#e2e8f0',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '10px',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};
