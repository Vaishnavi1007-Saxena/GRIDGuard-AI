import React, { useState } from 'react';
import { Play, Sparkles, Zap, ShieldAlert, Cpu } from 'lucide-react';

const PRESETS = [
  {
    label: "EV Surge + Solar Drop",
    icon: Zap,
    text: "Design a system that detects potential blackouts caused by EV charging surges and solar generation drops, predicts grid instability, and automatically protects critical loads such as hospitals."
  },
  {
    label: "Hospital Feeder Priority",
    icon: ShieldAlert,
    text: "Build a smart-city grid protection controller that prioritizes hospital critical load bus during sudden generation loss, executes automated EV fleet throttling, and dispatches battery storage."
  },
  {
    label: "Transformer Thermal Overload",
    icon: Cpu,
    text: "Create an FPGA and PLC protection system that monitors substation transformer winding temperature and loading, prevents cascade thermal tripping, and sheds non-critical industrial feeders."
  }
];

export default function RequirementInput({ onSubmit, isLoading }) {
  const [requirement, setRequirement] = useState(PRESETS[0].text);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requirement.trim() && !isLoading) {
      onSubmit(requirement.trim());
    }
  };

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#00f0ff" />
          <h2 style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '0.5px', color: '#e2e8f0', textTransform: 'uppercase' }}>
            Smart-Grid Problem Specification
          </h2>
        </div>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Describe requirement in natural language
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g. Design a system that detects potential blackouts caused by EV charging surges and solar generation drops..."
          rows={3}
          style={{
            width: '100%',
            backgroundColor: '#080c14',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#f8fafc',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            resize: 'vertical',
            outline: 'none',
            marginBottom: '14px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center', marginRight: '4px' }}>
              Quick Presets:
            </span>
            {PRESETS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRequirement(p.text)}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={13} color="#38bdf8" />
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isLoading || !requirement.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isLoading ? '#475569' : '#0284c7',
              backgroundImage: isLoading ? 'none' : 'linear-gradient(135deg, #0284c7 0%, #00f0ff 100%)',
              color: '#04101d',
              fontWeight: '700',
              fontSize: '13px',
              letterSpacing: '0.5px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: isLoading ? 'none' : '0 0 15px rgba(0, 240, 255, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <Play size={16} fill="#04101d" />
            {isLoading ? 'ORCHESTRATING AGENTS...' : 'BUILD PROJECT'}
          </button>
        </div>
      </form>
    </div>
  );
}
