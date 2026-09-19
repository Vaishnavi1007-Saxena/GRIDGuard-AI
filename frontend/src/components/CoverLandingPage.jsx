import React, { useState } from 'react';
import { ArrowRight, Zap, Shield, Sparkles, ChevronRight, Activity, Cpu } from 'lucide-react';

export default function CoverLandingPage({ onSelectPage }) {
  const [hoveredPage, setHoveredPage] = useState(null);

  const pages = [
    {
      id: 'twin',
      num: '01',
      title: 'Fault & Digital Twin City',
      badge: '2D Twin & Faults',
      color: '#0ea5e9',
      desc: 'Smart city topology, manual fault deck & dual trajectories.',
      icon: '🏙️'
    },
    {
      id: 'matrix',
      num: '02',
      title: 'The Matrix',
      badge: 'AI Predictive ML',
      color: '#a855f7',
      desc: 'Random Forest risk heatmap & 1-click prescriptive mitigation.',
      icon: '🧠'
    },
    {
      id: 'team',
      num: '03',
      title: 'Engineering Team',
      badge: 'Project Builders',
      color: '#34d399',
      desc: 'Meet the 4 core engineers behind GridGuard AI.',
      icon: '👥'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(300px, 360px) 1fr',
      gap: '24px',
      minHeight: '74vh',
      alignItems: 'stretch',
      paddingBottom: '20px'
    }}>
      
      {/* ---------------- LEFT SIDE: PAGE POINTERS DIRECTORY ---------------- */}
      <div style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle glow accent */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '-30px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }} />

        <div>
          {/* Section Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 10px #38bdf8'
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              color: '#38bdf8',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              System Navigation Pointers
            </span>
          </div>

          <h3 style={{
            fontSize: '17px',
            fontWeight: '800',
            color: '#f8fafc',
            margin: '0 0 4px 0',
            letterSpacing: '-0.3px'
          }}>
            Module Directory
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px 0' }}>
            Click any pointer to launch that module:
          </p>

          {/* 4 Clean Page Pointers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pages.map((p) => {
              const isHover = hoveredPage === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPage(p.id)}
                  onMouseEnter={() => setHoveredPage(p.id)}
                  onMouseLeave={() => setHoveredPage(null)}
                  style={{
                    backgroundColor: isHover ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.7)',
                    border: `1px solid ${isHover ? p.color : 'rgba(148, 163, 184, 0.15)'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isHover ? 'translateX(6px)' : 'none',
                    boxShadow: isHover ? `0 6px 20px -6px ${p.color}40` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontFamily: 'Fira Code, monospace',
                        fontWeight: '800',
                        color: p.color,
                        backgroundColor: `${p.color}15`,
                        border: `1px solid ${p.color}35`,
                        borderRadius: '4px',
                        padding: '2px 6px'
                      }}>
                        {p.num}
                      </span>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '800',
                          color: isHover ? '#ffffff' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{p.icon}</span> {p.title}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {p.badge}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      color: isHover ? p.color : '#64748b',
                      transition: 'all 0.2s ease',
                      transform: isHover ? 'translateX(3px)' : 'none'
                    }}>
                      <ArrowRight size={18} />
                    </div>
                  </div>

                  <p style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    margin: '6px 0 0 0',
                    lineHeight: '1.4'
                  }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ---------------- CENTER / MAIN AREA: JUST THE TITLE GRIDGUARD AI ---------------- */}
      <div style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Futuristic glowing backdrop */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
          
          {/* Subtle Top Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            padding: '4px 14px',
            marginBottom: '20px'
          }}>
            <Sparkles size={13} color="#38bdf8" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.8px' }}>
              AUTONOMOUS CYBER-PHYSICAL GRID DEFENSE
            </span>
          </div>

          {/* MAIN CENTER TITLE (JUST THE TITLE OF THE PROJECT) */}
          <h1 style={{
            fontSize: '68px',
            fontWeight: '900',
            margin: '0 0 12px 0',
            letterSpacing: '-2px',
            lineHeight: '1',
            background: 'linear-gradient(135deg, #ffffff 20%, #38bdf8 65%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 20px rgba(56, 189, 248, 0.25))'
          }}>
            GridGuard AI
          </h1>

          {/* Clean Subtitle Tagline */}
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#94a3b8',
            margin: '0 0 32px 0',
            letterSpacing: '0.2px'
          }}>
            Self-Healing Smart City Microgrid & Critical Life-Safety Protection
          </p>

          {/* Quick Action Navigation Buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
            <button
              onClick={() => onSelectPage('twin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Zap size={16} /> Launch: 1. Fault & Digital Twin City <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onSelectPage('matrix')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#c084fc',
                border: '1px solid #a855f7',
                borderRadius: '8px',
                padding: '12px 22px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🧠</span> Open: 2. The Matrix
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
