import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, ChevronRight, PlayCircle, RotateCcw } from 'lucide-react';

export default function BlackoutDemo({ demoStages = [], onSelectStage, isApproved }) {
  const [currentStep, setCurrentStep] = useState(0);

  const stages = demoStages.length > 0 ? demoStages : [
    { stage: 1, name: "NORMAL GRID", description: "Grid nominal, generation balances load." },
    { stage: 2, name: "EV SURGE + SOLAR DROP", description: "Compound disturbance causes severe voltage & frequency sag." },
    { stage: 3, name: "AI DETECTS BLACKOUT RISK", description: "LightGBM model detects 89% blackout probability." },
    { stage: 4, name: "FPGA RTL THRESHOLD DETECT", description: "Hardware FSM asserts EV throttle and hospital feeder lockout in 40ns." },
    { stage: 5, name: "PLC SAFETY INTERLOCK", description: "Deterministic Structured Text validates transformer limit and checks BESS SOC >= 20%." },
    { stage: 6, name: "EV REDUCED + BESS INJECTED", description: "EV load throttled; BESS injects 15 MW instantaneous active power." },
    { stage: 7, name: "GRID STABILIZED", description: "Hospital continuously protected. Cascading blackout completely averted." }
  ];

  const handleStepClick = (idx) => {
    setCurrentStep(idx);
    if (onSelectStage) {
      onSelectStage(stages[idx]);
    }
  };

  const handleNext = () => {
    if (currentStep < stages.length - 1) {
      handleStepClick(currentStep + 1);
    }
  };

  const handleReset = () => {
    handleStepClick(0);
  };

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            HACKATHON DEMO: BLACKOUT PREVENTION WALKTHROUGH
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleNext}
            disabled={currentStep >= stages.length - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: currentStep >= stages.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep >= stages.length - 1 ? 0.5 : 1
            }}
          >
            <PlayCircle size={14} /> Next Stage
          </button>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Interactive Step Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '10px',
        marginBottom: '14px'
      }}>
        {stages.map((stg, idx) => {
          const isActive = currentStep === idx;
          const isPassed = currentStep > idx;
          return (
            <React.Fragment key={idx}>
              <div
                onClick={() => handleStepClick(idx)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? '#0284c7' : isPassed ? '#1e293b' : '#080c14',
                  border: `1px solid ${isActive ? '#00f0ff' : isPassed ? '#334155' : '#1e293b'}`,
                  color: isActive ? '#ffffff' : isPassed ? '#cbd5e1' : '#64748b',
                  fontSize: '11px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.3)' : 'none'
                }}
              >
                <span>{idx + 1}.</span> {stg.name}
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight size={14} color="#475569" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Stage Details */}
      <div style={{
        backgroundColor: '#080c14',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
            STAGE {currentStep + 1} OF {stages.length}: {stages[currentStep]?.name}
          </div>
          <div style={{ fontSize: '13px', color: '#e2e8f0' }}>
            {stages[currentStep]?.description}
          </div>
        </div>

        {currentStep === stages.length - 1 && (
          <div style={{
            backgroundColor: '#064e3b',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <CheckCircle2 size={18} color="#34d399" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#a7f3d0' }}>
                🟢 GRID STABLE
              </div>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#ecfdf5' }}>
                BLACKOUT PREVENTED · HOSPITAL SAFE
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
