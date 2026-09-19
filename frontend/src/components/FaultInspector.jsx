import React from 'react';
import { AlertOctagon, ShieldAlert, Cpu, CheckCircle2, Zap } from 'lucide-react';

export default function FaultInspector({ selectedAsset, activeFaults, onToggleFault, onRestoreNominal, onClose }) {
  if (!selectedAsset) return null;

  const isFaulted = activeFaults[selectedAsset.faultKey] || false;

  return (
    <div style={{
      backgroundColor: '#0a0f1d',
      border: `1px solid ${isFaulted ? '#ef4444' : '#0284c7'}`,
      borderRadius: '10px',
      padding: '16px',
      color: '#e2e8f0',
      boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
      position: 'relative',
      marginBottom: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '10px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color={isFaulted ? '#ef4444' : '#00f0ff'} />
          <div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#f8fafc' }}>
              {selectedAsset.name}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px', fontFamily: 'monospace' }}>
              Feeder {selectedAsset.feeder} • Nominal: {selectedAsset.rating}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: isFaulted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: isFaulted ? '#f87171' : '#34d399',
            border: `1px solid ${isFaulted ? '#ef4444' : '#10b981'}`
          }}>
            {isFaulted ? 'FAULT ACTIVE (MANUAL)' : 'NOMINAL (HEALTHY)'}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid of Sections: Why, Impact, AI Action */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '14px' }}>
        {/* Section 1: Root Cause Analysis */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '6px' }}>
            <AlertOctagon size={14} /> WHY IS IT HAPPENING? (ROOT CAUSE)
          </div>
          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.45', margin: 0 }}>
            {selectedAsset.rootCause || "Asset operating within design thermal tolerances."}
          </p>
        </div>

        {/* Section 2: Electrical Physical Impact */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px' }}>
            <ShieldAlert size={14} /> ELECTRICAL PHYSICAL IMPACT
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>• Frequency Impact: <span style={{ color: isFaulted ? '#ef4444' : '#10b981' }}>{selectedAsset.freqImpact || "Δ 0.00 Hz (50.00 Hz)"}</span></div>
            <div>• Voltage Sag: <span style={{ color: isFaulted ? '#f59e0b' : '#10b981' }}>{selectedAsset.voltImpact || "Δ 0.000 pu (1.000 pu)"}</span></div>
            <div>• Line Loading: <span style={{ color: isFaulted ? '#ef4444' : '#cbd5e1' }}>{selectedAsset.loadingImpact || "70.0% (Normal)"}</span></div>
            <div>• BESS Buffer: <span style={{ color: '#00f0ff' }}>{selectedAsset.bessImpact || "Standby (Zero Dispatch)"}</span></div>
          </div>
        </div>

        {/* Section 3: Guard AI Automated Actions */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#10b981', marginBottom: '6px' }}>
            <Cpu size={14} /> GUARD AI AUTOMATED ACTION
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.45' }}>
            <div>• BESS command: <span style={{ color: '#00f0ff' }}>{selectedAsset.aiBess || "Dynamic spinning reserve armed"}</span></div>
            <div>• Demand-response: <span style={{ color: '#f59e0b' }}>{selectedAsset.aiDr || "Feeders balanced"}</span></div>
            <div>• Safety interlock: <span style={{ color: '#10b981' }}>{selectedAsset.aiPlc || "Hospital shedding-lock verified"}</span></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
        {selectedAsset.faultKey && (
          <button
            onClick={() => onToggleFault(selectedAsset.faultKey)}
            style={{
              backgroundColor: isFaulted ? '#1e293b' : '#dc2626',
              border: `1px solid ${isFaulted ? '#334155' : '#ef4444'}`,
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isFaulted ? '⚡ Remove / Clear Fault' : '⚡ Inject Contingency Fault'}
          </button>
        )}
        <button
          onClick={onRestoreNominal}
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #10b981',
            color: '#34d399',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Restore All to Nominal
        </button>
      </div>
    </div>
  );
}
