import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080510;
    --panel: #0c0817;
    --card: #100c1e;
    --border: #1e1535;
    --border2: #2a1d4a;
    --text: #e8e2f4;
    --dim: #5a4d80;
    --dimmer: #2e204a;
    --vio: #a855f7;
    --vio2: #7c3aed;
    --vio3: #c084fc;
    --pink: #ec4899;
    --blue: #60a5fa;
    --teal: #2dd4bf;
    --green: #4ade80;
    --amber: #fbbf24;
    --orange: #fb923c;
    --red: #f87171;
    --cyan: #22d3ee;
  }

  body { background: var(--bg); }

  .wrap {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 60% 40% at 50% -5%, rgba(168,85,247,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 30% 20% at 80% 20%, rgba(236,72,153,0.05) 0%, transparent 50%);
    padding: 32px 16px 64px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* ── HEADER ── */
  .hdr {
    text-align: center;
    margin-bottom: 40px;
  }
  .hdr-chip {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid rgba(168,85,247,0.35);
    background: rgba(168,85,247,0.07);
    border-radius: 100px;
    padding: 5px 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.14em; color: var(--vio);
    margin-bottom: 18px;
  }
  .hdr-chip span { width:6px;height:6px;border-radius:50%;background:var(--vio);animation:blink 1.8s infinite; }
  .hdr h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(30px, 5vw, 58px);
    font-weight: 800; letter-spacing: -0.04em; line-height: 1.05;
    color: var(--text); margin-bottom: 10px;
  }
  .hdr h1 em { color: var(--vio); font-style: normal; }
  .hdr p {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px; color: var(--dim); letter-spacing: 0.05em;
  }

  /* ── LAYER BAND ── */
  .layer-band {
    display: flex; align-items: center; gap: 12px;
    margin: 28px 0 12px;
  }
  .layer-pill {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.12em; font-weight: 600;
    padding: 5px 14px; border-radius: 100px;
    white-space: nowrap;
  }
  .vio-pill  { background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.35); color:var(--vio); }
  .blue-pill { background:rgba(96,165,250,0.1); border:1px solid rgba(96,165,250,0.35); color:var(--blue); }
  .teal-pill { background:rgba(45,212,191,0.1); border:1px solid rgba(45,212,191,0.35); color:var(--teal); }
  .grn-pill  { background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.35); color:var(--green); }
  .amb-pill  { background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.35); color:var(--amber); }
  .pk-pill   { background:rgba(236,72,153,0.1); border:1px solid rgba(236,72,153,0.35); color:var(--pink); }
  .layer-line { flex:1; height:1px; background: var(--border2); }

  /* ── STEP LABEL ── */
  .step-lbl { display:flex;align-items:center;gap:8px;margin:0 0 8px; }
  .step-num {
    width:22px;height:22px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;
    background:var(--card);border:1px solid var(--border2);color:var(--dim);flex-shrink:0;
  }
  .step-lbl span { font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.1em;color:var(--dim);text-transform:uppercase; }

  /* ── GRID ── */
  .grid { display:grid; gap:8px; margin-bottom:4px; }
  .g2 { grid-template-columns: 1fr 1fr; }
  .g3 { grid-template-columns: 1fr 1fr 1fr; }
  .g4 { grid-template-columns: repeat(4,1fr); }

  /* ── CARD ── */
  .c {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 13px 14px;
    position: relative;
    transition: border-color 0.2s, transform 0.2s;
    overflow: hidden;
  }
  .c::before {
    content:''; position:absolute; inset:0; border-radius:10px;
    opacity:0; transition:opacity 0.2s;
    background: radial-gradient(ellipse at 30% 30%, var(--glow-color,rgba(168,85,247,0.08)), transparent 70%);
  }
  .c:hover { transform:translateY(-2px); }
  .c:hover::before { opacity:1; }

  .c.vi { --glow-color:rgba(168,85,247,0.12); border-color:rgba(168,85,247,0.25); }
  .c.bl { --glow-color:rgba(96,165,250,0.12); border-color:rgba(96,165,250,0.25); }
  .c.tl { --glow-color:rgba(45,212,191,0.12); border-color:rgba(45,212,191,0.25); }
  .c.gr { --glow-color:rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.25); }
  .c.am { --glow-color:rgba(251,191,36,0.12); border-color:rgba(251,191,36,0.25); }
  .c.or { --glow-color:rgba(251,146,60,0.12); border-color:rgba(251,146,60,0.25); }
  .c.pk { --glow-color:rgba(236,72,153,0.12); border-color:rgba(236,72,153,0.25); }
  .c.cy { --glow-color:rgba(34,211,238,0.12); border-color:rgba(34,211,238,0.25); }

  .c-ico { font-size:20px; margin-bottom:7px; display:block; }
  .c-ttl { font-size:12.5px;font-weight:700;margin-bottom:4px;letter-spacing:-0.01em; }
  .vi .c-ttl { color:var(--vio); }
  .bl .c-ttl { color:var(--blue); }
  .tl .c-ttl { color:var(--teal); }
  .gr .c-ttl { color:var(--green); }
  .am .c-ttl { color:var(--amber); }
  .or .c-ttl { color:var(--orange); }
  .pk .c-ttl { color:var(--pink); }
  .cy .c-ttl { color:var(--cyan); }

  .c-dsc { font-size:10.5px;line-height:1.55;color:var(--dim);font-family:'IBM Plex Mono',monospace; }

  /* ── TAGS ── */
  .tags { display:flex;flex-wrap:wrap;gap:4px;margin-top:8px; }
  .tag { font-family:'IBM Plex Mono',monospace;font-size:9px;padding:2px 7px;border-radius:4px;border:1px solid; }
  .vi .tag { color:var(--vio);border-color:rgba(168,85,247,0.3);background:rgba(168,85,247,0.07); }
  .bl .tag { color:var(--blue);border-color:rgba(96,165,250,0.3);background:rgba(96,165,250,0.07); }
  .tl .tag { color:var(--teal);border-color:rgba(45,212,191,0.3);background:rgba(45,212,191,0.07); }
  .gr .tag { color:var(--green);border-color:rgba(74,222,128,0.3);background:rgba(74,222,128,0.07); }
  .am .tag { color:var(--amber);border-color:rgba(251,191,36,0.3);background:rgba(251,191,36,0.07); }
  .or .tag { color:var(--orange);border-color:rgba(251,146,60,0.3);background:rgba(251,146,60,0.07); }
  .pk .tag { color:var(--pink);border-color:rgba(236,72,153,0.3);background:rgba(236,72,153,0.07); }
  .cy .tag { color:var(--cyan);border-color:rgba(34,211,238,0.3);background:rgba(34,211,238,0.07); }

  /* ── ARROW ── */
  .arr { display:flex;flex-direction:column;align-items:center;padding:2px 0; }
  .arr-bar { width:2px;height:18px;background:linear-gradient(to bottom,var(--border2),transparent); }
  .arr-head { color:var(--dimmer);font-size:12px;line-height:1;margin-top:-2px; }
  .arr-lbl { font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--dim);letter-spacing:0.06em;margin-top:2px; }

  /* ── PROTOCOL BOX ── */
  .proto-box {
    background: linear-gradient(135deg, rgba(168,85,247,0.06), rgba(96,165,250,0.04));
    border: 1px solid rgba(168,85,247,0.25);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 4px;
    position: relative;
    overflow: hidden;
  }
  .proto-box::before {
    content:''; position:absolute;top:0;left:0;right:0;height:1px;
    background: linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent);
  }
  .proto-inner { display:flex;gap:10px;align-items:center;flex-wrap:wrap; }
  .proto-badge {
    font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;
    padding:4px 10px;border-radius:6px;
    background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.35);
    color:var(--vio);white-space:nowrap;
  }
  .proto-arrow { color:var(--dimmer);font-size:14px; }
  .proto-desc { font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--dim); }

  /* ── PRIM CARD ── */
  .prim { display:flex;flex-direction:column;gap:6px; }
  .prim-ttl {
    font-family:'IBM Plex Mono',monospace;font-size:9.5px;
    letter-spacing:0.1em;text-transform:uppercase;
    text-align:center;padding:5px 10px;border-radius:6px;
    font-weight:600;
  }
  .prim-ttl.vi { color:var(--vio);background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2); }
  .prim-ttl.bl { color:var(--blue);background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.2); }
  .prim-ttl.gr { color:var(--green);background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2); }

  /* ── LIFECYCLE ── */
  .lifecycle {
    display:flex;gap:0;margin-bottom:4px;border:1px solid var(--border2);
    border-radius:10px;overflow:hidden;
  }
  .lc-step {
    flex:1;padding:14px 12px;position:relative;
    border-right:1px solid var(--border2);
  }
  .lc-step:last-child { border-right:none; }
  .lc-step::after {
    content:'→';position:absolute;right:-10px;top:50%;transform:translateY(-50%);
    color:var(--dimmer);font-size:14px;z-index:1;
  }
  .lc-step:last-child::after { display:none; }
  .lc-num {
    font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;
    color:var(--vio);letter-spacing:0.08em;margin-bottom:6px;
  }
  .lc-ttl { font-size:11.5px;font-weight:700;color:var(--vio3);margin-bottom:4px; }
  .lc-dsc { font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--dim);line-height:1.4; }
  .lc-tag {
    display:inline-block;margin-top:6px;
    font-family:'IBM Plex Mono',monospace;font-size:8.5px;
    padding:2px 6px;border-radius:4px;
    background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);
    color:var(--vio);
  }

  /* ── LEGEND ── */
  .legend {
    margin-top:28px;background:var(--panel);
    border:1px solid var(--border2);border-radius:12px;padding:18px;
  }
  .legend-ttl { font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.12em;color:var(--dim);text-transform:uppercase;margin-bottom:12px; }
  .legend-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px; }
  .legend-item { display:flex;align-items:flex-start;gap:8px; }
  .l-dot { width:8px;height:8px;border-radius:2px;flex-shrink:0;margin-top:3px; }
  .l-text { font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--dim);line-height:1.4; }
  .l-text strong { display:block;margin-bottom:1px; }

  @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }
  @media(max-width:640px){
    .g2,.g3,.g4{grid-template-columns:1fr;}
    .lifecycle{flex-direction:column;}
    .lc-step{border-right:none;border-bottom:1px solid var(--border2);}
    .lc-step::after{content:'↓';right:auto;left:50%;transform:translateX(-50%);bottom:-12px;top:auto;}
  }
`;

function Arr({ label }) {
  return (
    <div className="arr">
      <div className="arr-bar" />
      <div className="arr-head">▼</div>
      {label && <div className="arr-lbl">{label}</div>}
    </div>
  );
}

function StepLabel({ n, text }) {
  return (
    <div className="step-lbl">
      <div className="step-num">{n}</div>
      <span>{text}</span>
    </div>
  );
}

function Card({ ico, ttl, dsc, tags, color = "vi", style }) {
  return (
    <div className={`c ${color}`} style={style}>
      {ico && <span className="c-ico">{ico}</span>}
      <div className="c-ttl">{ttl}</div>
      <div className="c-dsc">{dsc}</div>
      {tags && <div className="tags">{tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}
    </div>
  );
}

export default function MCPDiagram() {
  return (
    <>
      <style>{css}</style>
      <div className="wrap">

        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-chip"><span />MCP ARCHITECTURE · ANTHROPIC 2024</div>
          <h1>Model Context<br /><em>Protocol</em></h1>
          <p>Universal open standard · LLM ↔ tools · JSON-RPC 2.0 · USB-C for AI</p>
        </div>

        {/* ═══ LAYER 1: WHAT IS MCP ═══ */}
        <div className="layer-band">
          <div className="layer-pill vio-pill">⚡ OVERVIEW</div>
          <div className="layer-line" />
        </div>

        <div className="proto-box" style={{marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--vio)',marginBottom:8}}>What is MCP?</div>
          <div className="c-dsc" style={{marginBottom:12}}>
            An open protocol by Anthropic (Nov 2024) that standardizes how AI models connect to external tools, data sources, and services. Like USB-C for AI — one protocol, infinite integrations. Replaces bespoke per-tool function calling with a universal, interoperable, multi-server interface.
          </div>
          <div className="proto-inner">
            <span className="proto-badge">JSON-RPC 2.0</span>
            <span className="proto-arrow">→</span>
            <span className="proto-badge">stdio / SSE / HTTP</span>
            <span className="proto-arrow">→</span>
            <span className="proto-badge">stateful sessions</span>
            <span className="proto-arrow">→</span>
            <span className="proto-badge">open standard</span>
            <span className="proto-arrow">→</span>
            <span className="proto-badge">language agnostic</span>
          </div>
        </div>

        <Arr label="architecture layers" />

        {/* ═══ LAYER 2: HOST ═══ */}
        <div className="layer-band">
          <div className="layer-pill vio-pill">① HOST LAYER — MCP Client Applications</div>
          <div className="layer-line" />
        </div>

        <StepLabel n="1" text="HOST APPLICATIONS — embed MCP client, manage server connections" />
        <div className="grid g3">
          <Card ico="💬" ttl="AI Chat & IDE Tools" color="vi"
            dsc="Claude.ai, Claude Code, Cursor, VS Code Copilot, Zed. Embeds MCP client, renders tool results in conversation, shows approval UI."
            tags={["Claude.ai","Claude Code","Cursor","VS Code"]} />
          <Card ico="🤖" ttl="Agentic Frameworks" color="bl"
            dsc="LangChain, LlamaIndex, AutoGen, CrewAI, Semantic Kernel. Orchestrates multi-step tool calls, plans across MCP servers."
            tags={["LangChain","AutoGen","CrewAI","LlamaIndex"]} />
          <Card ico="🖥️" ttl="Custom Applications" color="tl"
            dsc="Your own app embedding the Anthropic SDK. Full control over server whitelist, auth scopes, permission policies."
            tags={["SDK","self-hosted","custom","policy-control"]} />
        </div>

        <Arr label="↕ JSON-RPC 2.0 messages" />

        {/* ═══ LAYER 3: TRANSPORT ═══ */}
        <div className="layer-band">
          <div className="layer-pill blue-pill">② TRANSPORT LAYER — Protocol Wire Format</div>
          <div className="layer-line" />
        </div>

        <StepLabel n="2" text="TRANSPORT MECHANISMS" />
        <div className="grid g3">
          <Card ico="🔌" ttl="stdio Transport" color="bl"
            dsc="Host spawns server as local subprocess. Communicates via stdin/stdout pipes. Zero-latency, zero-network. Used by Claude Desktop & Claude Code for local tools."
            tags={["local","subprocess","stdin/stdout","zero-latency","Claude Desktop"]} />
          <Card ico="📡" ttl="SSE Transport (HTTP)" color="cy"
            dsc="Server-Sent Events over HTTPS. Bidirectional: POST for requests, SSE stream for responses. Supports TLS, auth headers. Remote/cloud-hosted MCP servers."
            tags={["remote","SSE","HTTPS","TLS","auth-headers"]} />
          <Card ico="🌐" ttl="Streamable HTTP (2025)" color="tl"
            dsc="Stateless variant introduced in 2025 spec. Single HTTP endpoint, JSON streaming. Easier to proxy, load-balance, and deploy serverless."
            tags={["stateless","JSON stream","serverless","load-balanced","2025 spec"]} />
        </div>

        <Arr label="capability negotiation" />

        {/* ═══ LAYER 4: PRIMITIVES ═══ */}
        <div className="layer-band">
          <div className="layer-pill teal-pill">③ MCP PRIMITIVES — What Servers Expose</div>
          <div className="layer-line" />
        </div>

        <StepLabel n="3" text="THREE CORE PRIMITIVES" />
        <div className="grid g3">
          <div className="prim">
            <div className="prim-ttl vi">🛠️ TOOLS — LLM-Callable Functions</div>
            <Card color="vi" ttl="Executable Actions"
              dsc="JSON Schema-defined functions the LLM autonomously decides to invoke. Side-effect-ful (write, create, send). Async-safe. Human-in-loop approval gates. Examples: run_sql_query, create_github_issue, send_email, web_search, execute_code."
              tags={["LLM-callable","JSON schema","async","side-effects","approval"]} />
          </div>
          <div className="prim">
            <div className="prim-ttl bl">📚 RESOURCES — Read-Only Data</div>
            <Card color="bl" ttl="Data Sources via URI"
              dsc="Identified by URI scheme (file://, db://, s3://). Read-only snapshots for context injection. LLM reads but cannot mutate. Versioned. Examples: file contents, DB rows, API responses, knowledge base docs."
              tags={["read-only","URI","versioned","file://","db://","s3://"]} />
          </div>
          <div className="prim">
            <div className="prim-ttl gr">📝 PROMPTS — Reusable Templates</div>
            <Card color="gr" ttl="Structured Workflows"
              dsc="Pre-built prompt templates with typed arguments. Server defines reusable interaction patterns. Consistent, reproducible LLM workflows. Example: summarize_ticket(id=42), draft_pr_description(branch='feat/x')."
              tags={["templates","typed args","reusable","server-defined","consistent"]} />
          </div>
        </div>

        <Arr label="server implementations" />

        {/* ═══ LAYER 5: SERVER ECOSYSTEM ═══ */}
        <div className="layer-band">
          <div className="layer-pill grn-pill">④ MCP SERVER ECOSYSTEM</div>
          <div className="layer-line" />
        </div>

        <StepLabel n="4" text="AVAILABLE SERVER CATEGORIES" />
        <div className="grid g4" style={{marginBottom:4}}>
          <Card ico="📁" ttl="File System" color="am"
            dsc="Local files, S3, Google Drive, OneDrive, Dropbox. Scoped path ACL. Read + write with approval."
            tags={["file://","S3","GDrive","scoped ACL"]} />
          <Card ico="🗃️" ttl="Databases" color="tl"
            dsc="PostgreSQL, SQLite, BigQuery, MongoDB, Redis. Schema-aware. Parameterized SQL. Read+write modes."
            tags={["Postgres","SQLite","BigQuery","MongoDB"]} />
          <Card ico="🔗" ttl="SaaS & APIs" color="vi"
            dsc="GitHub, Jira, Slack, Gmail, Salesforce, Linear, Notion. OAuth 2.1 per-service. Full CRUD exposed as tools."
            tags={["GitHub","Slack","Jira","Salesforce","OAuth"]} />
          <Card ico="🌍" ttl="Web & Browser" color="bl"
            dsc="Brave Search, Puppeteer, Playwright. Live web fetch, DOM interaction, screenshots, form automation."
            tags={["Brave","Playwright","Puppeteer","screenshot","live-web"]} />
          <Card ico="🧠" ttl="Memory / KV" color="pk"
            dsc="Persistent key-value store across sessions. Entity memory graphs (mem0, Zep). Long-term user/project memory."
            tags={["persistent","KV","entity graph","mem0","Zep","cross-session"]} />
          <Card ico="🖥️" ttl="System & Shell" color="or"
            dsc="Bash execution, process control, Docker, kubectl, git. Full dev environment automation for agentic coding."
            tags={["bash","docker","kubectl","git","automation"]} />
          <Card ico="🔍" ttl="RAG as MCP Tool" color="cy"
            dsc="Vector DBs (Pinecone, Chroma, Weaviate) wrapped as MCP servers. LLM calls semantic_search() on-demand. Best-of-both-worlds pattern."
            tags={["Pinecone","Chroma","semantic_search","RAG+MCP"]} />
          <Card ico="📊" ttl="Analytics & BI" color="gr"
            dsc="Metabase, Looker, Redash, Grafana. Query dashboards, pull metrics, export charts via tool calls."
            tags={["Metabase","Looker","Grafana","metrics","charts"]} />
        </div>

        <Arr label="security & auth enforcement" />

        {/* ═══ LAYER 6: SECURITY ═══ */}
        <div className="layer-band">
          <div className="layer-pill amb-pill">⑤ SECURITY, AUTH & SAMPLING</div>
          <div className="layer-line" />
        </div>

        <StepLabel n="5" text="SECURITY MODEL" />
        <div className="grid g4">
          <Card ico="🔑" ttl="OAuth 2.1" color="am"
            dsc="Per-server OAuth flows with PKCE. Token scoping & refresh. Human consent UI for sensitive tool calls. Revoke at any time."
            tags={["OAuth 2.1","PKCE","scopes","consent UI","revoke"]} />
          <Card ico="🛡️" ttl="Permission Model" color="or"
            dsc="Tool-level + resource-level ACL. Per-host server allowlist / denylist. Sandboxed subprocess execution. User approval gates."
            tags={["ACL","allowlist","denylist","sandbox","approval gate"]} />
          <Card ico="🔄" ttl="Sampling" color="vi"
            dsc="Server requests LLM inference back through the host. Server-side AI logic without embedding model API keys. Privacy-preserving pattern."
            tags={["server→LLM","nested inference","no-key","privacy"]} />
          <Card ico="📋" ttl="Audit & Logging" color="tl"
            dsc="Full tool-call trace per session. Input/output logging. Compliance, debugging, and replay capabilities. Immutable audit trail."
            tags={["trace","audit log","compliance","replay","immutable"]} />
        </div>

        <Arr label="session lifecycle" />

        {/* ═══ LAYER 7: LIFECYCLE ═══ */}
        <div className="layer-band">
          <div className="layer-pill pk-pill">⑥ SESSION LIFECYCLE & MESSAGE FLOW</div>
          <div className="layer-line" />
        </div>

        <StepLabel n="6" text="4-PHASE MCP SESSION" />
        <div className="lifecycle">
          {[
            { step:"01", ttl:"Initialize", dsc:"Client→Server handshake. Negotiate protocol version. Exchange capability manifests. Establish session ID.", tag:"initialize request/response" },
            { step:"02", ttl:"Discover", dsc:"tools/list · resources/list · prompts/list. LLM receives full capability catalog with JSON schemas and descriptions.", tag:"tools/list · resources/list" },
            { step:"03", ttl:"Invoke", dsc:"LLM decides → tools/call request → server executes action → returns structured result → LLM reasons on output.", tag:"tools/call · async exec" },
            { step:"04", ttl:"Multi-turn", dsc:"Chained tool calls. Parallel tool execution. Human-in-loop pause & resume. Full stateful conversation memory.", tag:"chained · parallel · stateful" },
          ].map(s => (
            <div key={s.step} className="lc-step">
              <div className="lc-num">STEP {s.step}</div>
              <div className="lc-ttl">{s.ttl}</div>
              <div className="lc-dsc">{s.dsc}</div>
              <span className="lc-tag">{s.tag}</span>
            </div>
          ))}
        </div>

        {/* ═══ LEGEND ═══ */}
        <div className="legend">
          <div className="legend-ttl">MCP vs Alternatives</div>
          <div className="legend-grid">
            {[
              ["#a855f7","MCP (open protocol)","Multi-server, stateful, language-agnostic, discoverable, interoperable across any host"],
              ["#22d3ee","Function Calling","LLM-native, single provider, stateless, vendor-specific, no multi-server discovery"],
              ["#4ade80","OpenAI Plugins (deprecated)","REST-based, no standardized schema, provider-locked, retired 2024"],
              ["#fbbf24","LangChain Tools","Framework-coupled, Python-first, not interoperable across different host applications"],
              ["#fb923c","RAG + MCP pattern","RAG retrieval wrapped as MCP Tool — LLM triggers semantic_search on-demand"],
              ["#ec4899","Agentic MCP","LLM chains 10+ tool calls, spawns sub-agents, each using separate MCP servers"],
            ].map(([c, t, d]) => (
              <div key={t} className="legend-item">
                <div className="l-dot" style={{background:c}} />
                <div className="l-text"><strong style={{color:c}}>{t}</strong>{d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
