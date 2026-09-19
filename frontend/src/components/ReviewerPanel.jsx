import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Check } from 'lucide-react';

export default function ReviewerPanel({ review, iteration, status }) {
  const isApproved = review?.approved || false;
  const severity = (review?.severity || 'none').toLowerCase();
  const issues = review?.issues || [];
  const suggestions = review?.suggestions || [];
  const reason = review?.reason || (review ? 'Audit completed.' : 'Standing by for Builder deliverables...');

  const getSeverityBadge = () => {
    switch (severity) {
      case 'high':
        return { bg: '#ef444420', border: '#ef4444', text: '#ef4444', label: 'HIGH' };
      case 'medium':
        return { bg: '#f59e0b20', border: '#f59e0b', text: '#f59e0b', label: 'MEDIUM' };
      case 'low':
        return { bg: '#38bdf820', border: '#38bdf8', text: '#38bdf8', label: 'LOW' };
      default:
        return { bg: '#10b98120', border: '#10b981', text: '#10b981', label: 'NONE' };
    }
  };

  const badge = getSeverityBadge();

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
          <ShieldCheck size={18} color="#10b981" />
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px' }}>
            REVIEWER AGENT
          </h3>
        </div>
        <div style={{
          backgroundColor: review ? '#10b98120' : '#64748b20',
          border: `1px solid ${review ? '#10b981' : '#64748b'}`,
          color: review ? '#10b981' : '#94a3b8',
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          {review ? 'AUDIT COMPLETED' : 'AWAITING INPUT'}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
        {/* Status Metrics Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{
            backgroundColor: isApproved ? '#064e3b30' : review ? '#7f1d1d30' : '#080c14',
            border: `1px solid ${isApproved ? '#059669' : review ? '#b91c1c' : '#1e293b'}`,
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              APPROVED
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isApproved ? (
                <>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>YES</span>
                </>
              ) : review ? (
                <>
                  <XCircle size={18} color="#ef4444" />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#ef4444' }}>NO</span>
                </>
              ) : (
                <span style={{ fontSize: '13px', color: '#64748b' }}>PENDING</span>
              )}
            </div>
          </div>

          <div style={{
            backgroundColor: '#080c14',
            border: `1px solid ${badge.border}`,
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              SEVERITY
            </span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: badge.text }}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Validation Banner if Approved */}
        {isApproved && (
          <div style={{
            backgroundColor: '#064e3b',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#ecfdf5' }}>
              DESIGN VALIDATED — ALL CONSTRAINTS MET
            </span>
          </div>
        )}

        {/* Issues List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <AlertTriangle size={14} color="#f59e0b" />
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
              IDENTIFIED ISSUES ({issues.length})
            </span>
          </div>

          {issues.length === 0 ? (
            <div style={{
              backgroundColor: '#080c14',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              fontSize: '12px',
              color: isApproved ? '#10b981' : '#64748b',
              fontStyle: isApproved ? 'normal' : 'italic'
            }}>
              {isApproved ? '✓ Zero critical issues identified in current revision.' : 'No audit issues logged.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {issues.map((iss, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#080c14',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{
                      backgroundColor: '#ef444420',
                      color: '#f87171',
                      border: '1px solid #ef444440',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {iss.category}
                    </span>
                    <span style={{ fontSize: '11px', fontFamily: 'Fira Code, monospace', color: '#94a3b8' }}>
                      {iss.location}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', margin: '4px 0', lineHeight: '1.4' }}>
                    {iss.description}
                  </p>
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px' }}>
                    <strong style={{ color: '#00f0ff' }}>Fix: </strong> {iss.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Lightbulb size={14} color="#38bdf8" />
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                ENGINEERING SUGGESTIONS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#080c14',
                    border: '1px solid #1e293b',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#cbd5e1'
                  }}
                >
                  • {sug}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reason / Summary */}
        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            AUDIT DETERMINATION
          </span>
          <div style={{
            backgroundColor: '#080c14',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            fontSize: '12px',
            color: '#cbd5e1',
            lineHeight: '1.4'
          }}>
            {reason}
          </div>
        </div>
      </div>
    </div>
  );
}
