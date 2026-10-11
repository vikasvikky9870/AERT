import { useState } from "react";
import { Sparkles, Send, Bot, User, AlertCircle, ShieldAlert, ArrowRight, CornerDownLeft, Loader2, MapPin } from "lucide-react";
import { queryCopilot } from "../api";

const SAMPLE_QUESTIONS = [
  "Which incident needs attention first?",
  "Why was AMB-002 recommended?",
  "How many suitable ambulances are available?",
  "Which hospital has the best current capacity?",
  "Detect active sector resource shortages",
  "What is the status of NH-16 road delays?",
];

export default function OperationsCopilot({
  onHighlightEntity = null,
  onClose = null,
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Greetings Commander. I am the **AERT Operations Copilot** for Srikakulam District. I inspect live operational telemetry to answer triage questions, explain dispatch recommendations, and detect resource shortages. How can I assist?",
      entities: [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText = null) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await queryCopilot(text);
      const assistantMsg = {
        role: "assistant",
        content: res.answer,
        entities: res.highlight_entities || [],
        disclaimer: res.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If response has highlighted entity, trigger GIS highlight
      if (res.highlight_entities && res.highlight_entities.length > 0 && onHighlightEntity) {
        onHighlightEntity(res.highlight_entities[0]);
      }
    } catch (err) {
      console.error("Copilot query error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to query operations intelligence. Please ensure backend service is active.",
          entities: [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot-container">
      {/* COPILOT HEADER */}
      <div className="copilot-header">
        <div className="copilot-title-group">
          <div className="copilot-avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <h3>AERT Operations Copilot</h3>
            <span className="copilot-sub">Advisory Decision Support // Srikakulam District</span>
          </div>
        </div>
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="copilot-prompt-chips">
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            className="prompt-chip"
            onClick={() => handleSend(q)}
            disabled={loading}
          >
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES STREAM */}
      <div className="copilot-messages-stream">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`copilot-msg ${msg.role === "user" ? "msg-user" : "msg-assistant"}`}
          >
            <div className="msg-icon">
              {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div className="msg-bubble">
              <div className="msg-header">
                <span className="msg-sender">{msg.role === "user" ? "Commander" : "AERT Copilot"}</span>
                <span className="msg-time">{msg.timestamp}</span>
              </div>

              <div className="msg-text" dangerouslySetInnerHTML={{ __html: formatCopilotMarkdown(msg.content) }} />

              {/* CLICKABLE ENTITY CHIPS */}
              {msg.entities && msg.entities.length > 0 && (
                <div className="entity-pills-row">
                  <span className="entity-label">GIS Entities:</span>
                  {msg.entities.map((ent, i) => (
                    <button
                      key={i}
                      className={`entity-pill pill-${ent.type}`}
                      onClick={() => onHighlightEntity && onHighlightEntity(ent)}
                      title={`Highlight ${ent.id} on GIS Map`}
                    >
                      <MapPin size={11} />
                      <span>{ent.id}</span>
                    </button>
                  ))}
                </div>
              )}

              {msg.disclaimer && (
                <div className="msg-disclaimer">
                  <span>ℹ️ {msg.disclaimer}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="copilot-msg msg-assistant">
            <div className="msg-icon"><Bot size={14} /></div>
            <div className="msg-bubble loading-bubble">
              <Loader2 size={16} className="spinner-icon" />
              <span>Analyzing live Srikakulam operational state...</span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <form
        className="copilot-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          placeholder="Ask Copilot: e.g. 'Why was AMB-002 selected?' or 'Check shortages'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="copilot-input-field"
        />
        <button type="submit" className="copilot-send-btn" disabled={loading || !input.trim()}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

function formatCopilotMarkdown(text) {
  if (!text) return "";
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
  return formatted;
}
