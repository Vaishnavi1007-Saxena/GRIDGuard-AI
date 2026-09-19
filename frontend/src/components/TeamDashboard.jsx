import React from 'react';
import { Users, Sparkles } from 'lucide-react';

export default function TeamDashboard() {
  const team = [
    {
      id: 'vaishnavi',
      name: 'Vaishnavi Saxena',
      avatarColor: '#38bdf8',
      initials: 'VS'
    },
    {
      id: 'shruti',
      name: 'Shruti Shukla',
      avatarColor: '#a855f7',
      initials: 'SS'
    },
    {
      id: 'ananya',
      name: 'Ananya Tripathi',
      avatarColor: '#34d399',
      initials: 'AT'
    },
    {
      id: 'priyanshi',
      name: 'Priyanshi Purohit',
      avatarColor: '#fbbf24',
      initials: 'PP'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(56, 189, 248, 0.15) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '24px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              borderRadius: '6px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.8px'
            }}>
              PROJECT TEAM
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
            GridGuard AI Team
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '12px',
          padding: '10px 18px'
        }}>
          <Users size={20} color="#38bdf8" />
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>4 Members</div>
        </div>
      </div>

      {/* 4 Team Member Cards Grid (ONLY NAMES, NOTHING BELOW) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {team.map((member) => (
          <div
            key={member.id}
            style={{
              backgroundColor: '#0a0f1d',
              border: `1px solid rgba(148, 163, 184, 0.18)`,
              borderRadius: '16px',
              padding: '28px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Avatar Circle */}
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: `${member.avatarColor}15`,
              border: `1px solid ${member.avatarColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '900',
              color: member.avatarColor,
              fontFamily: 'Fira Code, monospace',
              flexShrink: 0
            }}>
              {member.initials}
            </div>

            {/* ONLY THE NAME */}
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                {member.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
