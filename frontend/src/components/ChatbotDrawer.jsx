import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, X, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX,
  AlertTriangle, Shield, CheckCircle2, Play, RefreshCw, GraduationCap, FileText,
  Sliders, ArrowRight, Zap
} from 'lucide-react';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { BotTools } from '../services/botToolRegistry';

export default function ChatbotDrawer({
  projectId = 'smart-grid-digital-twin',
  telemetry,
  activeFaults,
  onToggleFault,
  onClearAllFaults,
  onResetTime
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('copilot'); // 'copilot', 'teaching', 'planner'
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      mode: 'copilot',
      text: "👋 Hello! I am **GRIDGUARD AI Bot**, your unified smart-grid autonomous assistant.\n\nI can **diagnose live grid telemetry**, generate **emergency response plans**, explain electrical physics in **Teaching Mode**, and execute **voice or natural-language grid commands**.\n\nHow can I assist the power grid right now?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const messagesEndRef = useRef(null);

  // Proactive Warning Monitor
  useEffect(() => {
    if (!telemetry) return;

    if (telemetry.lineLoading > 85.0) {
      setActiveAlert({
        level: 'WARNING',
        text: `Transformer & line loading has reached ${telemetry.lineLoading.toFixed(1)}%! Grid thermal stress is escalating.`
      });
    } else if (Math.abs(telemetry.freq - 50.0) > 0.35) {
      setActiveAlert({
        level: 'CRITICAL',
        text: `System frequency has deviated to ${telemetry.freq.toFixed(2)} Hz (Δ ${(telemetry.freq - 50.0).toFixed(2)} Hz)! BESS dynamic stabilization required.`
      });
    } else {
      setActiveAlert(null);
    }
  }, [telemetry]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Voice Speech-to-Text Toggle
  const handleToggleVoice = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setVoiceTranscript('');
    } else {
      setIsListening(true);
      setVoiceTranscript('Listening to your voice...');
      speechService.startListening(
        (interim) => {
          setVoiceTranscript(interim);
        },
        (final) => {
          setVoiceTranscript(final);
          setInput(final);
          setIsListening(false);
          handleSend(final);
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
          setVoiceTranscript('');
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  // Text-to-Speech Playback
  const handleSpeak = (text) => {
    speechService.speak(text);
  };

  // Dispatch Query
  const handleSend = async (textToSend, overrideMode) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const currentMode = overrideMode || mode;
    const userMsg = { id: Date.now(), sender: 'user', text: query, mode: currentMode };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // 1. Check client-side command parser first for immediate structured action confirmation
    const localCmd = BotTools.parseNaturalCommand(query);
    if (localCmd) {
      setLoading(false);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        mode: currentMode,
        text: `⚡ **Structured Scenario Command Prepared**\n\n**Action**: \`${localCmd.action}\`\n**Description**: ${localCmd.description}\n**Safety Interlock**: ${localCmd.safetyNote}`,
        actionConfirmation: localCmd
      };
      setMessages(prev => [...prev, botMsg]);
      if (autoSpeak) handleSpeak(`Scenario command prepared for ${localCmd.title}. Please confirm execution.`);
      return;
    }

    // 2. Query backend LLM & tool-calling service
    try {
      const liveSnapshot = {
        frequency: telemetry?.freq || 50.0,
        voltage: telemetry?.volt || 1.0,
        Pload: telemetry?.Pload || 100.0,
        Pgen: telemetry?.Pgen || 85.0,
        Psolar: telemetry?.Psolar || 20.0,
        Pwind: telemetry?.Pwind || 15.0,
        currentSOC: telemetry?.currentSOC || 70.0,
        Pbatt: telemetry?.Pbatt || 0.0,
        lineLoading: telemetry?.lineLoading || 71.4,
        health: telemetry?.health || 100.0,
        status: telemetry?.status || 'NORMAL',
        activeFaults: activeFaults || {}
      };

      const res = await api.sendChat(projectId, query, currentMode, liveSnapshot);
      const replyText = res.reply || 'No response received from GRIDGUARD AI Bot.';

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        mode: res.mode || currentMode,
        text: replyText,
        actionConfirmation: res.action_confirmation || null
      };

      setMessages(prev => [...prev, botMsg]);
      if (autoSpeak) handleSpeak(replyText);
    } catch (err) {
      // Offline fallback: Use deterministic ground-truth generator
      let fallbackText = '';
      if (currentMode === 'planner' || query.toLowerCase().includes('what should we do')) {
        fallbackText = `### 🚨 AI Emergency Response Plan\n\n#### 1. 📊 Observed Data\n* **Frequency**: \`${telemetry?.freq.toFixed(2) || '50.00'} Hz\`\n* **Line Loading**: \`${telemetry?.lineLoading.toFixed(1) || '71.4'}%\`\n* **Hospital Priority Feeder**: \`8.0 MW (Locked & Protected)\`\n\n#### 2. 🧠 AI Analysis\nGrid capacity under dynamic stress. BESS buffer actively managing synthetic inertia.\n\n#### 3. 🛡️ Recommended Action\n1. Discharge BESS at +18 MW.\n2. Throttle non-critical EV chargers by 25%.\n3. Verify Hospital Feeder 1 remains 100% protected and shedding-immune.`;
      } else if (currentMode === 'teaching' || query.toLowerCase().includes('why did the frequency decrease')) {
        fallbackText = `### 🎓 Teaching Mode: Frequency Droop\n\n**Analogy**: Think of the grid like a **multi-person bicycle**.\nWhen demand increases suddenly, the hill gets steeper. Without extra pedaling power, the pedals slow down—that slowing down is the frequency drop from 50.00 Hz down to \`${telemetry?.freq.toFixed(2) || '50.00'} Hz\`. BESS battery storage acts like an electric motor assisting the pedals instantaneously!`;
      } else {
        fallbackText = `**GRIDGUARD AI Bot (Ground-Truth Diagnostics)**:\n* **System Frequency**: \`${telemetry?.freq.toFixed(2) || '50.00'} Hz\` (Nominal: 50.00 Hz)\n* **Line Loading**: \`${telemetry?.lineLoading.toFixed(1) || '71.4'}%\`\n* **Grid Health**: \`${telemetry?.health.toFixed(1) || '100.0'}%\`\n* **Hospital Feeder**: \`100% Safe (Deterministic PLC Trip Inhibit Active)\`\n\nAsk for an **Emergency Plan**, switch to **Teaching Mode**, or command: *"Increase EV demand by 40%"*.`;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', mode: currentMode, text: fallbackText }]);
      if (autoSpeak) handleSpeak(fallbackText);
    } finally {
      setLoading(false);
    }
  };

  // Execute Confirmed Simulation Command
  const handleExecuteAction = (action) => {
    if (!action) return;

    if (action.action === 'reset_simulation') {
      if (onResetTime) onResetTime();
      if (onClearAllFaults) onClearAllFaults();
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: `✅ **Action Executed**: Digital twin simulation clock has been reset to \`t = 0s\` and all active disturbances have been cleared to nominal.`
      }]);
      return;
    }

    const faultKey = action.faultKey || action.payload?.faultKey;
    if (faultKey && onToggleFault) {
      onToggleFault(faultKey);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: `✅ **Action Executed**: Applied **${action.title || faultKey.toUpperCase()}** on the digital twin. Observed telemetry and dual trajectory canvas curves have updated live.`
      }]);
    }
  };

  return (
    <>
      {/* Floating Action Launcher Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '22px',
          right: '24px',
          backgroundColor: '#0284c7',
          backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #00f0ff 100%)',
          color: '#04101d',
          fontWeight: '900',
          fontSize: '12.5px',
          padding: '11px 18px',
          borderRadius: '50px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 0 25px rgba(0, 240, 255, 0.45)',
          zIndex: 9999,
          transition: 'transform 0.15s ease'
        }}
      >
        <Bot size={18} color="#04101d" />
        <span>GRIDGUARD AI Bot</span>
        {activeAlert && (
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            display: 'inline-block'
          }} />
        )}
      </button>

      {/* Slide-over Control Center Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '76px',
          right: '24px',
          width: '460px',
          maxWidth: 'calc(100vw - 32px)',
          height: '620px',
          maxHeight: 'calc(100vh - 100px)',
          backgroundColor: '#090e17',
          border: '1px solid #1e293b',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 50px rgba(0, 0, 0, 0.8)',
          zIndex: 10000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#0c1220',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                padding: '6px',
                borderRadius: '8px',
                border: '1px solid #00f0ff'
              }}>
                <Bot size={20} color="#00f0ff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: '#f8fafc', margin: 0 }}>
                    GRIDGUARD AI Bot
                  </h4>
                  <span style={{
                    fontSize: '9px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    LIVE
                  </span>
                </div>
                <p style={{ fontSize: '10.5px', color: '#38bdf8', margin: '2px 0 0 0' }}>
                  Unified Copilot • Planner • Tutor • Voice Assistant
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Voice auto-speak toggle */}
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                title={autoSpeak ? 'Voice auto-playback enabled' : 'Voice auto-playback muted'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: autoSpeak ? '#00f0ff' : '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 3 Unified Mode Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            backgroundColor: '#070b13',
            borderBottom: '1px solid #1e293b',
            padding: '3px 6px'
          }}>
            {[
              { id: 'copilot', label: 'Grid Copilot', icon: <Bot size={13} /> },
              { id: 'teaching', label: 'Teaching Mode', icon: <GraduationCap size={13} /> },
              { id: 'planner', label: 'Emergency Plan', icon: <Shield size={13} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: mode === tab.id ? '#1e293b' : 'transparent',
                  color: mode === tab.id ? (tab.id === 'teaching' ? '#f59e0b' : tab.id === 'planner' ? '#f87171' : '#38bdf8') : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Proactive Warning Banner (Feature B) */}
          {activeAlert && (
            <div style={{
              backgroundColor: activeAlert.level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
              borderBottom: `1px solid ${activeAlert.level === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10.5px',
              color: activeAlert.level === 'CRITICAL' ? '#fca5a5' : '#fde047'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={13} />
                <span>{activeAlert.text}</span>
              </div>
              <button
                onClick={() => handleSend('What should we do to mitigate this alert?', 'planner')}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '9.5px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Plan Response
              </button>
            </div>
          )}

          {/* Quick Action Chips based on active mode */}
          <div style={{
            padding: '6px 10px',
            backgroundColor: '#070b13',
            borderBottom: '1px solid #141f32',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto'
          }}>
            {(mode === 'teaching' ? [
              "Why did the frequency decrease?",
              "What is transformer overload?",
              "Why does reducing EV charging help?",
              "How does battery support stabilize the grid?"
            ] : mode === 'planner' ? [
              "What should we do right now?",
              "Generate emergency mitigation plan",
              "Verify hospital feeder immunity",
              "Execute load-shedding response"
            ] : [
              "Why is the grid under stress?",
              "What is the current frequency?",
              "What happened? (Event Summary)",
              "Increase EV demand by 40%",
              "Reset the simulation"
            ]).map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                disabled={loading}
                style={{
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#cbd5e1',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={9} color="#00f0ff" />
                {qp}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            padding: '12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#060a12'
          }}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    backgroundColor: isUser ? '#0284c7' : '#0c1220',
                    color: isUser ? '#ffffff' : '#f1f5f9',
                    border: `1px solid ${isUser ? '#0284c7' : '#1e293b'}`,
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '11.5px',
                    lineHeight: '1.5',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '9.5px',
                    color: isUser ? '#e0f2fe' : '#38bdf8',
                    fontWeight: '700'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {isUser ? <User size={12} /> : <Bot size={12} />}
                      <span>{isUser ? 'YOU' : 'GRIDGUARD AI BOT'}</span>
                      {m.mode && (
                        <span style={{
                          fontSize: '8.5px',
                          color: '#94a3b8',
                          backgroundColor: '#070b13',
                          padding: '1px 4px',
                          borderRadius: '3px'
                        }}>
                          {m.mode}
                        </span>
                      )}
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleSpeak(m.text)}
                        title="Read aloud"
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Render Message Markdown */}
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {m.text}
                  </div>

                  {/* Interactive Action Confirmation Card (Feature 5 & D) */}
                  {m.actionConfirmation && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#070b13',
                      border: '1px solid #f97316',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Zap size={14} color="#f97316" />
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fed7aa' }}>
                          {m.actionConfirmation.title || 'Execute Simulation Scenario?'}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 6px 0', fontSize: '10px', color: '#cbd5e1' }}>
                        {m.actionConfirmation.description || m.actionConfirmation.confirmation_prompt}
                      </p>
                      <div style={{ fontSize: '9.5px', color: '#34d399', marginBottom: '8px' }}>
                        🛡️ {m.actionConfirmation.safetyNote || m.actionConfirmation.safety_status}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleExecuteAction(m.actionConfirmation)}
                          style={{
                            backgroundColor: '#ea580c',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '10.5px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Play size={11} fill="#ffffff" /> Confirm & Execute
                        </button>
                        <button
                          onClick={() => setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Action cancelled by operator.' }])}
                          style={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            color: '#cbd5e1',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '10.5px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#0c1220',
                color: '#38bdf8',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                fontStyle: 'italic',
                border: '1px solid #1e293b'
              }}>
                GRIDGUARD AI is analyzing live digital twin telemetry...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Transcript Bar (when recording) */}
          {isListening && (
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#1a1005',
              borderTop: '1px solid #f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10.5px',
              color: '#fed7aa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ea580c',
                  animation: 'pulse 1s infinite'
                }} />
                <span>{voiceTranscript || 'Speak now...'}</span>
              </div>
              <button
                onClick={handleToggleVoice}
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '10px' }}
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Bar with Voice & Send Controls */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '8px 10px',
              backgroundColor: '#0c1220',
              borderTop: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isListening ? 'Stop voice recording' : 'Speak to GRIDGUARD AI Bot'}
              style={{
                backgroundColor: isListening ? '#ea580c' : '#1e293b',
                border: `1px solid ${isListening ? '#f97316' : '#334155'}`,
                borderRadius: '8px',
                padding: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isListening ? <MicOff size={15} color="#ffffff" /> : <Mic size={15} color="#38bdf8" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'teaching'
                  ? 'Ask concept: "Why did the frequency decrease?"...'
                  : mode === 'planner'
                  ? 'Ask response: "What should we do?"...'
                  : 'Ask question or command: "Increase EV demand by 40%"...'
              }
              style={{
                flex: 1,
                backgroundColor: '#070b13',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#f8fafc',
                fontSize: '11.5px',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.4 : 1
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
