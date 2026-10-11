import React, { useState } from 'react';
import { Panel } from '../../design-system/components/Panel';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import {
  Sparkles,
  Cpu,
  Send,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Layers,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

/**
 * AI Operational Copilot & Multi-Agent Intelligence Hub
 */
export function CopilotRail({
  onGenerateSitrep,
  onApplyRecommendation,
  activeIncidents = [],
  responders = [],
}) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      agent: 'Dispatch Optimization Agent',
      confidence: 94,
      text: 'Critical collision detected on NH-16 Bypass. Unit AMB-003 is positioned 1.8 mins away. Recommend immediate ALS dispatch and pre-alerting RIMS Trauma Center.',
      toolCalls: [
        { tool: 'evaluateNearestUnits()', result: 'AMB-003 selected (1.2km, ETA: 1.8m)' },
        { tool: 'checkHospitalTraumaLevel()', result: 'RIMS Srikakulam Level 1 (4 beds open)' },
      ],
      actions: [
        { label: 'Dispatch AMB-003 to NH-16', type: 'dispatch' },
        { label: 'Transmit RIMS Pre-Alert', type: 'prealert' },
      ],
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSendQuery = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsThinking(true);

    setTimeout(() => {
      let aiResponse;
      const lower = userText.toLowerCase();

      if (lower.includes('sitrep') || lower.includes('report') || lower.includes('summary')) {
        aiResponse = {
          sender: 'ai',
          agent: 'Situation Report Agent',
          confidence: 98,
          text: `Sector Srikakulam has ${activeIncidents.length} active incidents. 1 Critical Highway Collision on NH-16, 1 Auto Overturn on Palakonda Rd, 1 Medical Emergency at 7 Road Junction. Fleet utilization is at 67%. RIMS Trauma capacity is stable at 88%.`,
          toolCalls: [
            { tool: 'aggregateSectorMetrics()', result: '3 incidents, 3 units active, 2 hospitals receiving' },
          ],
          actions: [{ label: 'Generate Full SITREP Document', type: 'sitrep' }],
        };
      } else if (lower.includes('hospital') || lower.includes('bed') || lower.includes('rims')) {
        aiResponse = {
          sender: 'ai',
          agent: 'Hospital Intelligence Agent',
          confidence: 92,
          text: 'RIMS Srikakulam has 4 open ER beds and 2 ICU beds. GGH Srikakulam has 8 open ER beds. For severe trauma, RIMS is the primary recommended destination.',
          toolCalls: [{ tool: 'queryEmergencyCapacity()', result: 'RIMS: 88%, GGH: 75%' }],
          actions: [{ label: 'View Hospital Matrix', type: 'hospitals' }],
        };
      } else {
        aiResponse = {
          sender: 'ai',
          agent: 'Risk & Hazard Agent',
          confidence: 91,
          text: `Analyzed scenario query: "${userText}". Secondary risk evaluation indicates no hazardous chemical escalation on NH-16 corridor. Recommended response buffer is optimal.`,
          toolCalls: [
            { tool: 'scanGeofenceHazards()', result: 'Zero toxic plumes detected' },
            { tool: 'checkRoadEvents()', result: 'NH-16 clear, 7 Road Junction slight delay' },
          ],
          actions: [{ label: 'Confirm Safety Buffer', type: 'safe' }],
        };
      }

      setChatHistory((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Copilot Header Card */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(0, 240, 255, 0.06)',
          border: '1px solid var(--border-glow-cyan)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              MULTI-AGENT INTELLIGENCE
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Autonomous Dispatch & Risk Reasoning
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" icon={FileText} onClick={onGenerateSitrep}>
          Export SITREP
        </Button>
      </div>

      {/* Conversation & AI Tool Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingRight: '4px',
        }}
      >
        {chatHistory.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {item.sender === 'user' ? (
              <div
                style={{
                  alignSelf: 'flex-end',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  maxWidth: '85%',
                }}
              >
                {item.text}
              </div>
            ) : (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(8, 14, 22, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                }}
              >
                {/* Agent Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {item.agent}
                  </span>
                  <Badge variant={item.confidence >= 90 ? 'active' : 'warning'}>
                    {item.confidence}% CONFIDENCE
                  </Badge>
                </div>

                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {item.text}
                </p>

                {/* Structured Tool Call Output */}
                {item.toolCalls && item.toolCalls.length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      borderLeft: '2px solid var(--accent-cyan)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Tool Executions:
                    </span>
                    {item.toolCalls.map((tc, tcIdx) => (
                      <div key={tcIdx} className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-mono-cyan)' }}>
                        &gt; {tc.tool} → <span style={{ color: 'var(--text-primary)' }}>{tc.result}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Chips */}
                {item.actions && item.actions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {item.actions.map((act, actIdx) => (
                      <Button
                        key={actIdx}
                        variant="primary"
                        size="sm"
                        onClick={() => onApplyRecommendation && onApplyRecommendation(act)}
                      >
                        {act.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div
            className="mono"
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-mono-cyan)',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Cpu size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
            AI Orchestrator synthesizing multi-agent inputs...
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSendQuery} style={{ display: 'flex', gap: '8px' }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask copilot: 'Summarize sector risks', 'Check ER load'..."
        />
        <Button type="submit" variant="primary" icon={Send}>
          Send
        </Button>
      </form>
    </div>
  );
}
