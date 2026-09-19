import React from 'react';

export default function Topology2DMap({ activeFaults, selectedAssetId, onSelectAsset }) {
  const isStressed = (key) => activeFaults && activeFaults[key];

  // Distinct Color Hierarchy:
  // - Hospital: Royal Electric Purple / Violet (#a855f7) - completely unique from all other 7 blocks and faults!
  // - Faults & Disturbances: Universal Alarm Red (#ef4444)
  // - Substation: Electric Cyan (#00f0ff)
  // - Solar: Emerald Green (#10b981)
  // - Wind & Water: Sky Blue (#38bdf8 / #0ea5e9)
  // - EV Charging: Amber / Gold (#f59e0b)
  // - Nominal Flow Rays: Electric Cyan (#0ea5e9)
  const HOSPITAL_COLOR = '#a855f7';
  const HOSPITAL_BG = '#3b0764';
  const HOSPITAL_BORDER = '#9333ea';
  const FAULT_RED = '#ef4444';
  const FAULT_BG = '#450a0a';
  const NOMINAL_CYAN = '#0ea5e9';

  // Asset configurations matching the digital twin schematic
  const nodes = [
    {
      id: 'residential',
      label: 'RESIDENTIAL',
      mw: '25 MW',
      type: 'houses',
      faultKey: null,
      x: 105,
      y: 45
    },
    {
      id: 'commercial',
      label: 'COMMERCIAL',
      mw: '15 MW',
      type: 'box',
      faultKey: null,
      x: 95,
      y: 155
    },
    {
      id: 'hospital',
      label: '+ HOSPITAL',
      sub: '8 MW [PRIORITY]',
      type: 'hospital',
      isProtected: true,
      faultKey: null,
      x: 88,
      y: 255
    },
    {
      id: 'datacenter',
      label: 'DATA CENTER',
      mw: '10 MW',
      type: 'box',
      faultKey: 'datacenter',
      x: 185,
      y: 255
    },
    {
      id: 'solar',
      label: 'SOLAR FARM',
      mw: isStressed('solar') ? '12.0 MW' : '35.0 MW',
      type: 'solar',
      faultKey: 'solar',
      x: 115,
      y: 320
    },
    {
      id: 'substation',
      label: 'SUBSTATION',
      sub: '100 MW',
      type: 'substation',
      x: 285,
      y: 260
    },
    {
      id: 'bess',
      label: 'BESS (BATTERY)',
      sub: isStressed('battery') ? '0.0 MW (Trip)' : 'Discharge +15.0 MW',
      type: 'battery',
      faultKey: 'battery',
      x: 285,
      y: 175
    },
    {
      id: 'wind',
      label: 'WIND FARM',
      sub: isStressed('wind') ? '10.0 MW' : '20.0 MW',
      type: 'wind',
      faultKey: 'wind',
      x: 380,
      y: 320
    },
    {
      id: 'industrial',
      label: 'INDUSTRIAL',
      mw: isStressed('industrial') ? '45 MW' : '30 MW',
      type: 'box',
      faultKey: 'industrial',
      x: 465,
      y: 90
    },
    {
      id: 'ev',
      label: '⚡ EV CHARGING',
      mw: isStressed('ev') ? '25 MW' : '7 MW',
      type: 'ev',
      faultKey: 'ev',
      x: 465,
      y: 165
    },
    {
      id: 'water',
      label: 'WATER PLANT',
      mw: '5 MW',
      type: 'box',
      faultKey: null,
      x: 465,
      y: 255
    }
  ];

  return (
    <div style={{
      backgroundColor: '#090e17',
      borderRadius: '8px',
      padding: '12px 14px',
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes dashRays {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes dashFastRays {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .ray-line-nominal {
          stroke-dasharray: 6, 4;
          animation: dashRays 1.4s linear infinite;
        }
        .ray-line-hospital {
          stroke-dasharray: 6, 4;
          animation: dashRays 1.6s linear infinite;
        }
        .ray-line-stressed {
          stroke-dasharray: 5, 3;
          animation: dashFastRays 0.45s linear infinite;
        }
      `}</style>

      {/* SVG Canvas Map */}
      <svg viewBox="0 0 540 365" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '350px' }}>
        <defs>
          <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.45)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* City Street Grid Background */}
        <rect width="540" height="365" fill="#070c14" />
        <rect width="540" height="365" fill="url(#cityGrid)" />

        {/* City Blocks (Thick Slate Roads) */}
        <line x1="20" y1="95" x2="520" y2="95" stroke="#141f32" strokeWidth="8" />
        <line x1="20" y1="215" x2="520" y2="215" stroke="#141f32" strokeWidth="8" />
        <line x1="175" y1="15" x2="175" y2="350" stroke="#141f32" strokeWidth="8" />
        <line x1="395" y1="15" x2="395" y2="350" stroke="#141f32" strokeWidth="8" />

        {/* ---------------- POWER FLOW RAYS (RADIATING FROM SUBSTATION x=285, y=260) ---------------- */}
        
        {/* Ray to Residential (x=105, y=70) - Nominal Cyan */}
        <path
          d="M 270 245 L 140 100 L 105 75"
          fill="none"
          stroke={NOMINAL_CYAN}
          strokeWidth="2.5"
          className="ray-line-nominal"
        />

        {/* Ray to Commercial (x=95, y=155) - Nominal Cyan */}
        <path
          d="M 270 250 L 165 215 L 140 175"
          fill="none"
          stroke={NOMINAL_CYAN}
          strokeWidth="2.5"
          className="ray-line-nominal"
        />

        {/* Ray to Hospital (x=88, y=255) - Dedicated Protected Royal Purple Feeder */}
        <path
          d="M 250 260 L 145 260"
          fill="none"
          stroke={HOSPITAL_COLOR}
          strokeWidth="3.5"
          className="ray-line-hospital"
        />

        {/* Ray to Data Center (x=185, y=255) - Red if Stressed, Cyan if Nominal */}
        <path
          d="M 250 260 L 225 260"
          fill="none"
          stroke={isStressed('datacenter') ? FAULT_RED : NOMINAL_CYAN}
          strokeWidth={isStressed('datacenter') ? 3.5 : 2.5}
          className={isStressed('datacenter') ? 'ray-line-stressed' : 'ray-line-nominal'}
        />

        {/* Ray to BESS (x=285, y=175) - Red if Stressed, Cyan/Sky if Nominal */}
        <path
          d="M 285 240 L 285 198"
          fill="none"
          stroke={isStressed('battery') ? FAULT_RED : '#38bdf8'}
          strokeWidth={isStressed('battery') ? 3.5 : 2.5}
          className={isStressed('battery') ? 'ray-line-stressed' : 'ray-line-nominal'}
        />

        {/* Ray to Industrial (x=465, y=90) - Red if Stressed, Cyan if Nominal */}
        <path
          d="M 315 245 L 420 150 L 440 115"
          fill="none"
          stroke={isStressed('industrial') ? FAULT_RED : NOMINAL_CYAN}
          strokeWidth={isStressed('industrial') ? 3.5 : 2.5}
          className={isStressed('industrial') ? 'ray-line-stressed' : 'ray-line-nominal'}
        />

        {/* Ray to EV Charging (x=465, y=165) - Red if Stressed, Cyan if Nominal */}
        <path
          d="M 315 250 L 415 215 L 430 185"
          fill="none"
          stroke={isStressed('ev') ? FAULT_RED : NOMINAL_CYAN}
          strokeWidth={isStressed('ev') ? 3.5 : 2.5}
          className={isStressed('ev') ? 'ray-line-stressed' : 'ray-line-nominal'}
        />

        {/* Ray to Water Plant (x=465, y=255) - Nominal Cyan */}
        <path
          d="M 320 260 L 425 260"
          fill="none"
          stroke={NOMINAL_CYAN}
          strokeWidth="2.5"
          className="ray-line-nominal"
        />

        {/* Solar Farm Inflow to Substation - Red if Stressed, Emerald if Nominal */}
        <path
          d="M 175 320 L 260 320 L 275 280"
          fill="none"
          stroke={isStressed('solar') ? FAULT_RED : '#10b981'}
          strokeWidth={isStressed('solar') ? 3.5 : 2.5}
          className={isStressed('solar') ? 'ray-line-stressed' : 'ray-line-nominal'}
        />

        {/* Wind Farm Inflow to Substation - Red if Stressed, Cyan if Nominal */}
        <path
          d="M 350 320 L 300 320 L 290 280"
          fill="none"
          stroke={isStressed('wind') ? FAULT_RED : '#00f0ff'}
          strokeWidth={isStressed('wind') ? 3.5 : 2.5}
          className={isStressed('wind') ? 'ray-line-stressed' : 'ray-line-nominal'}
        />

        {/* ---------------- ASSET NODES ---------------- */}

        {/* 1. RESIDENTIAL */}
        <g onClick={() => onSelectAsset(nodes[0])} style={{ cursor: 'pointer' }}>
          <text x="105" y="24" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
            RESIDENTIAL
          </text>
          {[0, 1, 2, 3, 4].map(idx => (
            <rect
              key={idx}
              x={50 + idx * 23}
              y={32}
              width={18}
              height={18}
              rx="3"
              fill={selectedAssetId === 'residential' ? '#0c4a6e' : '#131b2e'}
              stroke={selectedAssetId === 'residential' ? '#00f0ff' : '#475569'}
              strokeWidth="1.5"
            />
          ))}
          <text x="105" y="65" fill="#94a3b8" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            25 MW
          </text>
        </g>

        {/* 2. COMMERCIAL */}
        <g onClick={() => onSelectAsset(nodes[1])} style={{ cursor: 'pointer' }}>
          <rect
            x="50"
            y="132"
            width="90"
            height="46"
            rx="6"
            fill={selectedAssetId === 'commercial' ? '#0c4a6e' : '#131b2e'}
            stroke={selectedAssetId === 'commercial' ? '#00f0ff' : '#475569'}
            strokeWidth="1.5"
          />
          <text x="95" y="152" fill="#f8fafc" fontSize="10.5" fontWeight="bold" textAnchor="middle">
            COMMERCIAL
          </text>
          <text x="95" y="167" fill="#94a3b8" fontSize="9" textAnchor="middle">
            15 MW
          </text>
        </g>

        {/* 3. HOSPITAL - DISTINCT ROYAL ELECTRIC PURPLE / VIOLET BLOCK (#a855f7) */}
        <g onClick={() => onSelectAsset(nodes[2])} style={{ cursor: 'pointer' }}>
          {/* Glowing Purple Protective Ring */}
          <rect
            x="45"
            y="232"
            width="86"
            height="54"
            rx="8"
            fill="none"
            stroke={HOSPITAL_COLOR}
            strokeWidth="1.5"
            opacity="0.8"
          >
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect
            x="48"
            y="235"
            width="80"
            height="48"
            rx="6"
            fill={HOSPITAL_BG}
            stroke={HOSPITAL_COLOR}
            strokeWidth="2.5"
          />
          <text x="88" y="254" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">
            + HOSPITAL
          </text>
          <text x="88" y="271" fill="#e9d5ff" fontSize="8" fontWeight="bold" textAnchor="middle">
            8 MW [PRIORITY]
          </text>
        </g>

        {/* 4. DATA CENTER - ALARM RED WHEN VENTING FAULT */}
        <g onClick={() => onSelectAsset(nodes[3])} style={{ cursor: 'pointer' }}>
          {isStressed('datacenter') && (
            <rect x="139" y="232" width="86" height="54" rx="8" fill="none" stroke={FAULT_RED} strokeWidth="2.5">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            </rect>
          )}
          <rect
            x="142"
            y="235"
            width="80"
            height="48"
            rx="6"
            fill={isStressed('datacenter') ? FAULT_BG : selectedAssetId === 'datacenter' ? '#0c4a6e' : '#131b2e'}
            stroke={selectedAssetId === 'datacenter' ? '#00f0ff' : isStressed('datacenter') ? FAULT_RED : '#475569'}
            strokeWidth={isStressed('datacenter') ? 2 : 1.5}
          />
          <text x="182" y="255" fill={isStressed('datacenter') ? '#fca5a5' : '#f8fafc'} fontSize="10" fontWeight="bold" textAnchor="middle">
            DATA CENTER
          </text>
          <text x="182" y="271" fill={isStressed('datacenter') ? '#ef4444' : '#94a3b8'} fontSize="8.5" textAnchor="middle">
            {isStressed('datacenter') ? '22 MW (Spike)' : '10 MW'}
          </text>
        </g>

        {/* 5. SOLAR FARM - ALARM RED WHEN VENTING FAULT */}
        <g onClick={() => onSelectAsset(nodes[4])} style={{ cursor: 'pointer' }}>
          {isStressed('solar') && (
            <rect x="45" y="299" width="146" height="44" rx="6" fill="none" stroke={FAULT_RED} strokeWidth="2">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            </rect>
          )}
          <rect
            x="48"
            y="302"
            width="140"
            height="38"
            rx="4"
            fill={isStressed('solar') ? FAULT_BG : selectedAssetId === 'solar' ? '#064e3b' : '#06261a'}
            stroke={isStressed('solar') ? FAULT_RED : '#10b981'}
            strokeWidth={isStressed('solar') ? 2 : 1.5}
          />
          {/* 4 solar panels */}
          {[0, 1, 2, 3].map(idx => (
            <rect
              key={idx}
              x={55 + idx * 18}
              y={309}
              width={13}
              height={14}
              rx="2"
              fill={isStressed('solar') ? '#7f1d1d' : '#0d563a'}
              stroke={isStressed('solar') ? '#ef4444' : '#34d399'}
              strokeWidth="0.8"
            />
          ))}
          <text x="100" y="333" fill={isStressed('solar') ? '#fca5a5' : '#6ee7b7'} fontSize="9" fontWeight="bold" textAnchor="start">
            SOLAR FARM
          </text>
          <text x="180" y="325" fill={isStressed('solar') ? '#f87171' : '#a7f3d0'} fontSize="8.5" fontFamily="monospace" textAnchor="end">
            {isStressed('solar') ? '12.0 MW (Drop)' : '35.0 MW'}
          </text>
        </g>

        {/* 6. SUBSTATION (Central Cyan Hub) */}
        <g onClick={() => onSelectAsset(nodes[5])} style={{ cursor: 'pointer' }}>
          <rect
            x="245"
            y="240"
            width="80"
            height="42"
            rx="6"
            fill="#082f49"
            stroke="#00f0ff"
            strokeWidth="2.5"
          />
          <text x="285" y="258" fill="#ffffff" fontSize="10.5" fontWeight="900" textAnchor="middle">
            SUBSTATION
          </text>
          <text x="285" y="273" fill="#38bdf8" fontSize="8.5" fontWeight="bold" textAnchor="middle">
            100 MW
          </text>
        </g>

        {/* 7. BESS (BATTERY) - ALARM RED WHEN VENTING FAULT */}
        <g onClick={() => onSelectAsset(nodes[6])} style={{ cursor: 'pointer' }}>
          {isStressed('battery') && (
            <rect x="236" y="150" width="98" height="48" rx="8" fill="none" stroke={FAULT_RED} strokeWidth="2.5">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            </rect>
          )}
          <rect
            x="240"
            y="154"
            width="90"
            height="40"
            rx="6"
            fill={isStressed('battery') ? FAULT_BG : selectedAssetId === 'bess' ? '#0c4a6e' : '#082f49'}
            stroke={isStressed('battery') ? FAULT_RED : selectedAssetId === 'bess' ? '#00f0ff' : '#0284c7'}
            strokeWidth={isStressed('battery') ? 2.5 : 2}
          />
          <text x="285" y="171" fill={isStressed('battery') ? '#fca5a5' : '#e0f2fe'} fontSize="9.5" fontWeight="bold" textAnchor="middle">
            BESS (BATTERY)
          </text>
          <text x="285" y="185" fill={isStressed('battery') ? '#ef4444' : '#38bdf8'} fontSize="8" fontFamily="monospace" textAnchor="middle">
            {isStressed('battery') ? '0.0 MW (Trip)' : 'Discharge +15.0 MW'}
          </text>
        </g>

        {/* 8. WIND FARM - ALARM RED WHEN VENTING FAULT */}
        <g onClick={() => onSelectAsset(nodes[7])} style={{ cursor: 'pointer' }}>
          {isStressed('wind') && (
            <rect x="337" y="299" width="126" height="44" rx="6" fill="none" stroke={FAULT_RED} strokeWidth="2">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            </rect>
          )}
          <rect
            x="340"
            y="302"
            width="120"
            height="38"
            rx="4"
            fill={isStressed('wind') ? FAULT_BG : selectedAssetId === 'wind' ? '#0c4a6e' : '#0a192f'}
            stroke={isStressed('wind') ? FAULT_RED : '#0284c7'}
            strokeWidth={isStressed('wind') ? 2 : 1.5}
          />
          {[0, 1, 2].map(idx => (
            <g key={idx} transform={`translate(${352 + idx * 16}, 324)`}>
              <line x1="0" y1="0" x2="0" y2="-12" stroke={isStressed('wind') ? '#ef4444' : '#38bdf8'} strokeWidth="1.5" />
              <circle cx="0" cy="-12" r="2" fill={isStressed('wind') ? '#ef4444' : '#38bdf8'} />
              <line x1="0" y1="-12" x2="4" y2="-15" stroke={isStressed('wind') ? '#ef4444' : '#38bdf8'} strokeWidth="1" />
              <line x1="0" y1="-12" x2="-4" y2="-15" stroke={isStressed('wind') ? '#ef4444' : '#38bdf8'} strokeWidth="1" />
            </g>
          ))}
          <text x="408" y="320" fill={isStressed('wind') ? '#fca5a5' : '#bae6fd'} fontSize="9" fontWeight="bold" textAnchor="middle">
            WIND FARM
          </text>
          <text x="408" y="333" fill={isStressed('wind') ? '#ef4444' : '#38bdf8'} fontSize="8" fontFamily="monospace" textAnchor="middle">
            {isStressed('wind') ? '10.0 MW (Stall)' : '20.0 MW'}
          </text>
        </g>

        {/* 9. INDUSTRIAL - ALARM RED WHEN VENTING FAULT */}
        <g onClick={() => onSelectAsset(nodes[8])} style={{ cursor: 'pointer' }}>
          {isStressed('industrial') && (
            <rect x="418" y="56" width="98" height="68" rx="8" fill="none" stroke={FAULT_RED} strokeWidth="2.5">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            </rect>
          )}
          <rect
            x="422"
            y="60"
            width="90"
            height="60"
            rx="6"
            fill={isStressed('industrial') ? FAULT_BG : selectedAssetId === 'industrial' ? '#0c4a6e' : '#131b2e'}
            stroke={selectedAssetId === 'industrial' ? '#00f0ff' : isStressed('industrial') ? FAULT_RED : '#475569'}
            strokeWidth={isStressed('industrial') ? 2 : 1.5}
          />
          <text x="467" y="88" fill={isStressed('industrial') ? '#fca5a5' : '#f8fafc'} fontSize="10.5" fontWeight="bold" textAnchor="middle">
            INDUSTRIAL
          </text>
          <text x="467" y="105" fill={isStressed('industrial') ? '#ef4444' : '#94a3b8'} fontSize="9" textAnchor="middle">
            {isStressed('industrial') ? '45 MW (Surge)' : '30 MW'}
          </text>
        </g>

        {/* 10. EV CHARGING - ALARM RED WHEN VENTING FAULT */}
        <g onClick={() => onSelectAsset(nodes[9])} style={{ cursor: 'pointer' }}>
          {isStressed('ev') && (
            <rect x="418" y="138" width="98" height="52" rx="8" fill="none" stroke={FAULT_RED} strokeWidth="2.5">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            </rect>
          )}
          <rect
            x="422"
            y="142"
            width="90"
            height="44"
            rx="6"
            fill={isStressed('ev') ? FAULT_BG : selectedAssetId === 'ev' ? '#0c4a6e' : '#131b2e'}
            stroke={isStressed('ev') ? FAULT_RED : selectedAssetId === 'ev' ? '#00f0ff' : '#f59e0b'}
            strokeWidth={isStressed('ev') ? 2.5 : 2}
          />
          <text x="467" y="162" fill={isStressed('ev') ? '#fca5a5' : '#fef08a'} fontSize="10" fontWeight="bold" textAnchor="middle">
            ⚡ EV CHARGING
          </text>
          <text x="467" y="177" fill={isStressed('ev') ? '#ef4444' : '#fde047'} fontSize="8.5" textAnchor="middle">
            {isStressed('ev') ? '25 MW (+18MW)' : '7 MW'}
          </text>
        </g>

        {/* 11. WATER PLANT */}
        <g onClick={() => onSelectAsset(nodes[10])} style={{ cursor: 'pointer' }}>
          <rect
            x="422"
            y="235"
            width="90"
            height="46"
            rx="6"
            fill={selectedAssetId === 'water' ? '#0c4a6e' : '#131b2e'}
            stroke={selectedAssetId === 'water' ? '#00f0ff' : '#0284c7'}
            strokeWidth="1.5"
          />
          <text x="467" y="255" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
            WATER PLANT
          </text>
          <text x="467" y="271" fill="#94a3b8" fontSize="8.5" textAnchor="middle">
            5 MW
          </text>
        </g>
      </svg>

      {/* Card Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid #141f32',
        fontSize: '10.5px',
        color: '#64748b'
      }}>
        <span>💡 Tip: Hospital is uniquely highlighted in Royal Purple (100% Protected). Active faults vent in Alarm Red.</span>
        <span style={{ color: '#00f0ff', fontWeight: 'bold', cursor: 'pointer' }}>Click to Inspect</span>
      </div>
    </div>
  );
}
