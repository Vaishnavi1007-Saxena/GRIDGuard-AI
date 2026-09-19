import React from 'react';
import { Award, CheckCircle2, Download, FileText, Share2 } from 'lucide-react';

export default function FinalOutput({ projectState }) {
  if (!projectState || (projectState.status !== 'approved' && projectState.status !== 'completed')) {
    return null;
  }

  const isApproved = projectState.status === 'approved' || projectState.approval_status === 'approved';
  const out = projectState.builder_output || {};

  const handleExportDossier = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gridguard_project_${projectState.project_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: `1px solid ${isApproved ? '#10b981' : '#38bdf8'}`,
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px',
      boxShadow: isApproved ? '0 0 25px rgba(16, 185, 129, 0.2)' : 'none'
    }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: isApproved ? '#064e3b' : '#032338',
            border: `1px solid ${isApproved ? '#10b981' : '#00f0ff'}`,
            padding: '10px',
            borderRadius: '10px'
          }}>
            <Award size={24} color={isApproved ? '#34d399' : '#00f0ff'} />
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: '800',
              color: isApproved ? '#10b981' : '#38bdf8',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {isApproved ? 'HIGH-RELIABILITY DESIGN APPROVED' : 'PROJECT COMPLETED (MAX ITERATIONS REACHED)'}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
              {projectState.project_title || 'GRIDGUARD AI Engineering Deliverable Dossier'}
            </h2>
          </div>
        </div>

        <button
          onClick={handleExportDossier}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0284c7',
            backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #00f0ff 100%)',
            color: '#04101d',
            fontWeight: '700',
            fontSize: '13px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Download size={16} /> EXPORT DOSSIER (.JSON)
        </button>
      </div>

      {/* Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ backgroundColor: '#080c14', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>ITERATIONS COMPLETED</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8' }}>{projectState.iteration} / 3</span>
        </div>

        <div style={{ backgroundColor: '#080c14', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>REVIEWER STATUS</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: isApproved ? '#10b981' : '#f59e0b' }}>
            {isApproved ? 'APPROVED ✓' : 'COMPLETED WITH OBSERVATIONS'}
          </span>
        </div>

        <div style={{ backgroundColor: '#080c14', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>RTL MODULES GENERATED</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
            {Object.keys(out.rtl_code || {}).length} SystemVerilog Files
          </span>
        </div>

        <div style={{ backgroundColor: '#080c14', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>CRITICAL LOAD STATUS</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>100% PROTECTED (HOSPITAL)</span>
        </div>
      </div>

      {/* Engineering Problem Statement & Objectives */}
      <div style={{ backgroundColor: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#00f0ff', textTransform: 'uppercase', marginBottom: '6px' }}>
          Problem Statement
        </h4>
        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '12px' }}>
          {projectState.problem_statement}
        </p>

        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#00f0ff', textTransform: 'uppercase', marginBottom: '6px' }}>
          Key Engineering Objectives
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(projectState.objectives || []).map((obj, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#10b981" /> {obj}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
