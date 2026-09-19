import React, { useState } from 'react';
import { Terminal, Filter } from 'lucide-react';

export default function ActivityLog({ logs = [] }) {
  const [filter, setFilter] = useState('ALL');

  const getAgentColor = (agent) => {
    const a = (agent || '').toLowerCase();
    if (a.includes('orchestrator')) return '#00f0ff';
    if (a.includes('builder')) return '#38bdf8';
    if (a.includes('reviewer')) return '#10b981';
    if (a.includes('user')) return '#f59e0b';
    return '#a855f7';
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    const s = (log.sender || '').toLowerCase();
    const r = (log.receiver || '').toLowerCase();
    return s.includes(filter.toLowerCase()) || r.includes(filter.toLowerCase());
  });

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      height: '240px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        backgroundColor: '#131d33',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="#00f0ff" />
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px' }}>
            REAL-TIME AGENT ACTIVITY LOG ({logs.length} EVENTS)
          </h4>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'ORCHESTRATOR', 'BUILDER', 'REVIEWER'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: '10px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: filter === f ? '#0284c7' : '#1e293b',
                color: filter === f ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div style={{
        flex: 1,
        padding: '12px 16px',
        backgroundColor: '#06090f',
        overflowY: 'auto',
        fontFamily: 'Fira Code, monospace',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#475569', fontStyle: 'italic' }}>
            Waiting for agent communication stream...
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', lineHeight: '1.4' }}>
              <span style={{ color: '#64748b', fontSize: '11px', flexShrink: 0 }}>
                {log.timestamp}
              </span>
              <span style={{
                color: getAgentColor(log.sender),
                fontWeight: '600',
                fontSize: '11px',
                flexShrink: 0
              }}>
                {log.sender} → {log.receiver}:
              </span>
              <span style={{ color: '#e2e8f0' }}>
                {log.action}
              </span>
              {log.details && (
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                  ({log.details})
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
