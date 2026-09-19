import React from 'react';
import { Compass, CheckCircle2, ArrowRightCircle, Circle, AlertCircle } from 'lucide-react';

export default function OrchestratorPanel({ state }) {
  const tasks = state?.tasks || [];
  const status = state?.status || 'idle';
  const iteration = state?.iteration || 0;
  const currentTask = state?.current_task || 'Waiting for project requirement';
  const decision = state?.decision || 'None';

  const getStatusColor = (st) => {
    switch (st) {
      case 'approved': return '#10b981';
      case 'building': return '#00f0ff';
      case 'reviewing': return '#f59e0b';
      case 'revision_required': return '#fb923c';
      case 'planning': return '#a855f7';
      case 'completed': return '#38bdf8';
      case 'error': return '#ef4444';
      default: return '#64748b';
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
          <Compass size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px' }}>
            ORCHESTRATOR AGENT
          </h3>
        </div>
        <div style={{
          backgroundColor: `${getStatusColor(status)}20`,
          border: `1px solid ${getStatusColor(status)}`,
          color: getStatusColor(status),
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          {status}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
        {/* Status Metrics Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ backgroundColor: '#080c14', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              ITERATION
            </span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8' }}>
              {iteration} / 3
            </span>
          </div>

          <div style={{ backgroundColor: '#080c14', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              APPROVAL
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: state?.approval_status === 'approved' ? '#10b981' : state?.approval_status === 'not_approved_after_max_iterations' ? '#f59e0b' : '#94a3b8'
            }}>
              {state?.approval_status === 'approved' ? 'VALIDATED' : state?.approval_status === 'not_approved_after_max_iterations' ? 'MAX ITER' : 'PENDING'}
            </span>
          </div>
        </div>

        {/* Current Task */}
        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            CURRENT TASK
          </span>
          <div style={{
            backgroundColor: '#080c14',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #334155',
            fontSize: '12px',
            color: '#e2e8f0',
            lineHeight: '1.4'
          }}>
            {currentTask}
          </div>
        </div>

        {/* Tasks Checklist */}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            ENGINEERING TASKS ({tasks.length})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tasks.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>No tasks assigned yet</div>
            ) : (
              tasks.map((task, idx) => {
                const isDone = task.status === 'completed';
                const isCurrent = task.status === 'in_progress';
                return (
                  <div
                    key={task.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      backgroundColor: isCurrent ? '#032338' : '#080c14',
                      border: isCurrent ? '1px solid #00f0ff' : '1px solid #1e293b',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: isDone ? '#94a3b8' : isCurrent ? '#38bdf8' : '#cbd5e1'
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={14} color="#10b981" />
                    ) : isCurrent ? (
                      <ArrowRightCircle size={14} color="#00f0ff" />
                    ) : (
                      <Circle size={14} color="#475569" />
                    )}
                    <span style={{
                      fontWeight: isCurrent ? '600' : '400',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Decision */}
        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            ORCHESTRATOR DECISION
          </span>
          <div style={{
            backgroundColor: '#080c14',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            fontSize: '12px',
            color: decision.includes('approved') ? '#10b981' : decision.includes('revision') ? '#fb923c' : '#cbd5e1',
            lineHeight: '1.4'
          }}>
            {decision}
          </div>
        </div>
      </div>
    </div>
  );
}
