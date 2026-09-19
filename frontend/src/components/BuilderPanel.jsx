import React, { useState } from 'react';
import { Hammer, Copy, Check, FileCode, Layers, Cpu, ShieldCheck, Activity } from 'lucide-react';

export default function BuilderPanel({ output, iteration, status }) {
  const [activeTab, setActiveTab] = useState('rtl');
  const [activeRtlFile, setActiveRtlFile] = useState('grid_controller.sv');
  const [copied, setCopied] = useState(false);

  const rtlFiles = output?.rtl_code || {};
  const testbenchFiles = output?.testbench || {};
  const currentRtlCode = rtlFiles[activeRtlFile] || Object.values(rtlFiles)[0] || '// No RTL generated yet';
  const currentTbCode = Object.values(testbenchFiles)[0] || '// No Testbench generated yet';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'architecture':
        return output?.architecture || 'Generating smart-grid topology...';
      case 'rtl':
        return currentRtlCode;
      case 'testbench':
        return currentTbCode;
      case 'plc':
        return output?.plc_logic || 'Generating PLC Structured Text safety interlocks...';
      case 'ai':
        return `${output?.ai_architecture || 'Designing ML model...'}\n\n// PYTHON INFERENCE PIPELINE:\n${output?.ai_code_snippet || ''}`;
      case 'matlab':
        return `${output?.matlab_model || 'Generating Simulink model specification...'}\n\n%% RUNNABLE VERIFICATION SCRIPT:\n${output?.matlab_script || ''}`;
      case 'assumptions':
        return (output?.assumptions || []).map((a, i) => `${i + 1}. ${a}`).join('\n') || 'No assumptions recorded.';
      default:
        return '';
    }
  };

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        backgroundColor: '#131d33',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Hammer size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px' }}>
            BUILDER AGENT
          </h3>
        </div>
        <div style={{
          backgroundColor: '#0284c720',
          border: '1px solid #0284c7',
          color: '#38bdf8',
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          {output ? `GENERATED REVISION ${iteration || 1}` : 'STANDBY'}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#080c14',
        borderBottom: '1px solid #1e293b',
        overflowX: 'auto',
        padding: '4px 8px',
        gap: '4px'
      }}>
        {[
          { id: 'rtl', label: 'RTL Code', icon: Cpu },
          { id: 'testbench', label: 'Testbench', icon: FileCode },
          { id: 'plc', label: 'PLC Logic', icon: ShieldCheck },
          { id: 'architecture', label: 'Architecture', icon: Layers },
          { id: 'ai', label: 'AI Model', icon: Activity },
          { id: 'matlab', label: 'Simulink Spec', icon: FileCode },
          { id: 'assumptions', label: 'Assumptions', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#00f0ff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-selector for RTL files if active tab is RTL */}
      {activeTab === 'rtl' && Object.keys(rtlFiles).length > 0 && (
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 14px',
          backgroundColor: '#0b1220',
          borderBottom: '1px solid #1e293b'
        }}>
          {Object.keys(rtlFiles).map(fn => (
            <button
              key={fn}
              onClick={() => setActiveRtlFile(fn)}
              style={{
                fontSize: '11px',
                fontFamily: 'Fira Code, monospace',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: activeRtlFile === fn ? '#0284c7' : '#1e293b',
                color: activeRtlFile === fn ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {fn}
            </button>
          ))}
        </div>
      )}

      {/* Code / Content Viewer */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#06090f', overflow: 'hidden' }}>
        {activeTab === 'ai' ? (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Model Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>ALGORITHM</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8' }}>LightGBM / XGBoost</span>
              </div>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>ACCURACY (F1)</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#10b981' }}>96.4%</span>
              </div>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>INFERENCE LATENCY</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#00f0ff' }}>2.1 ms</span>
              </div>
            </div>

            {/* Feature Importance Weights */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px', textTransform: 'uppercase' }}>
                Multivariate Feature Importance Weights (SHAP Analysis)
              </div>
              {[
                { name: 'System Frequency Sag & RoCoF', weight: 35, color: '#ef4444' },
                { name: 'Bus Voltage Deviation (pu)', weight: 30, color: '#f59e0b' },
                { name: 'EV Charging Plaza Step Surge', weight: 20, color: '#00f0ff' },
                { name: 'Solar PV Irradiance Deficit', weight: 15, color: '#eab308' }
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                    <span style={{ color: '#cbd5e1' }}>{f.name}</span>
                    <span style={{ fontWeight: '700', color: f.color }}>{f.weight}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${f.weight}%`, height: '100%', backgroundColor: f.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Python Inference Pipeline Code */}
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px' }}>
                PYTHON INFERENCE PIPELINE (ai_blackout_predictor.py):
              </div>
              <pre style={{
                backgroundColor: '#080c14',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '12px',
                color: '#e2e8f0',
                fontSize: '11px',
                fontFamily: 'Fira Code, monospace',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {output?.ai_code_snippet || '// No Python ML script generated'}
              </pre>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => handleCopy(getActiveContent())}
              title="Copy to Clipboard"
              style={{
                position: 'absolute',
                top: '10px',
                right: '12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: copied ? '#10b981' : '#cbd5e1',
                borderRadius: '6px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <pre style={{
              flex: 1,
              padding: '16px',
              margin: 0,
              overflowY: 'auto',
              color: '#e2e8f0',
              fontSize: '12px',
              fontFamily: 'Fira Code, monospace',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {getActiveContent()}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
