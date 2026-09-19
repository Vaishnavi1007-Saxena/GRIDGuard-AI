import React from 'react';
import { GitCommit, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function IterationTimeline({ history = [], currentIteration = 1, currentStatus = 'planning' }) {
  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <GitCommit size={18} color="#00f0ff" />
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          ENGINEERING ITERATION TIMELINE (MAX 3 ITERATIONS)
        </h4>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[1, 2, 3].map((iterNum) => {
          const rec = history.find(h => h.iteration === iterNum);
          const isCurrent = currentIteration === iterNum && !rec;
          const isPassed = !!rec;
          const isApproved = rec?.review_status === 'approved';

          let borderColor = '#1e293b';
          let bgColor = '#080c14';
          let badgeText = 'PENDING';
          let badgeColor = '#64748b';

          if (isApproved) {
            borderColor = '#10b981';
            bgColor = '#064e3b20';
            badgeText = 'APPROVED';
            badgeColor = '#10b981';
          } else if (rec && !isApproved) {
            borderColor = '#ef4444';
            bgColor = '#7f1d1d20';
            badgeText = `REVISION REQ (${rec.issues_count} ISSUES)`;
            badgeColor = '#ef4444';
          } else if (isCurrent) {
            borderColor = '#00f0ff';
            bgColor = '#032338';
            badgeText = 'ACTIVE IN PROGRESS';
            badgeColor = '#00f0ff';
          }

          return (
            <React.Fragment key={iterNum}>
              <div style={{
                flex: 1,
                minWidth: '220px',
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                    Iteration {iterNum}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: badgeColor,
                    backgroundColor: `${badgeColor}20`,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {badgeText}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
                  {isApproved ? (
                    <CheckCircle2 size={14} color="#10b981" />
                  ) : rec ? (
                    <XCircle size={14} color="#ef4444" />
                  ) : isCurrent ? (
                    <AlertTriangle size={14} color="#00f0ff" />
                  ) : (
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #475569' }} />
                  )}
                  <span>
                    {isApproved
                      ? 'Design Validated by Reviewer'
                      : rec
                      ? `${rec.issues_count} issues flagged (Severity: ${rec.severity})`
                      : isCurrent
                      ? 'Agents collaborating on deliverables...'
                      : 'Waiting for previous cycle'}
                  </span>
                </div>
              </div>

              {iterNum < 3 && (
                <ArrowRight size={18} color="#475569" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
