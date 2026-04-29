import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Clash+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #05070f;
    --panel: #090d1a;
    --card: #0d1220;
    --border: #1a2035;
    --border2: #232d48;
    --text: #e2e8f4;
    --dim: #4a5580;
    --dimmer: #2a3050;
    --cyan: #00e5ff;
    --cyan2: #0099cc;
    --blue: #3b82f6;
    --teal: #14b8a6;
    --amber: #f59e0b;
    --orange: #f97316;
    --green: #22c55e;
    --violet: #8b5cf6;
    --pink: #ec4899;
    --red: #ef4444;
  }

  body { background: var(--bg); }

  .wrap {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 60% 40% at 50% -10%, rgba(0,229,255,0.07) 0%, transparent 60%),
      linear-gradient(180deg, transparent 60%, rgba(0,229,255,0.02) 100%);
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
    border: 1px solid rgba(0,229,255,0.25);
    background: rgba(0,229,255,0.05);
    border-radius: 100px;
    padding: 5px 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.14em; color: var(--cyan);
    margin-bottom: 18px;
  }
  .hdr-chip span { width:6px;height:6px;border-radius:50%;background:var(--cyan);animation:blink 1.8s infinite; }
  .hdr h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(30px, 5vw, 58px);
    font-weight: 800; letter-spacing: -0.04em; line-height: 1.05;
    color: var(--text); margin-bottom: 10px;
  }
  .hdr h1 em { color: var(--cyan); font-style: normal; }
  .hdr p {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px; color: var(--dim); letter-spacing: 0.05em;
  }

  /* ── PHASE BAND ── */
  .phase-band {
    display: flex; align-items: center; gap: 12px;
    margin: 28px 0 12px;
  }
  .phase-pill {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 0.12em; font-weight: 600;
    padding: 5px 14px; border-radius: 100px;
    white-space: nowrap;
  }
  .phase-pill.off { background: rgba(249,115,22,0.1); border:1px solid rgba(249,115,22,0.35); color: var(--orange); }
  .phase-pill.on  { background: rgba(34,197,94,0.1);  border:1px solid rgba(34,197,94,0.35);  color: var(--green); }
  .phase-line { flex:1; height:1px; background: var(--border2); }

  /* ── STEP LABEL ── */
  .step-lbl {
    display: flex; align-items: center; gap: 8px;
    margin: 0 0 8px;
  }
  .step-num {
    width:22px;height:22px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:600;
    background: var(--card); border:1px solid var(--border2); color:var(--dim);
    flex-shrink:0;
  }
  .step-lbl span {
    font-family:'IBM Plex Mono',monospace;font-size:10px;
    letter-spacing:0.1em;color:var(--dim);text-transform:uppercase;
  }

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
    background: radial-gradient(ellipse at 30% 30%, var(--glow-color,rgba(0,229,255,0.08)), transparent 70%);
  }
  .c:hover { transform:translateY(-2px); }
  .c:hover::before { opacity:1; }

  .c.cy { --glow-color:rgba(0,229,255,0.1); border-color:rgba(0,229,255,0.2); }
  .c.am { --glow-color:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.2); }
  .c.gr { --glow-color:rgba(34,197,94,0.1);  border-color:rgba(34,197,94,0.2); }
  .c.vi { --glow-color:rgba(139,92,246,0.1); border-color:rgba(139,92,246,0.2); }
  .c.or { --glow-color:rgba(249,115,22,0.1); border-color:rgba(249,115,22,0.2); }
  .c.pk { --glow-color:rgba(236,72,153,0.1); border-color:rgba(236,72,153,0.2); }
  .c.tl { --glow-color:rgba(20,184,166,0.1); border-color:rgba(20,184,166,0.2); }
  .c.bl { --glow-color:rgba(59,130,246,0.1); border-color:rgba(59,130,246,0.2); }

  .c-ico { font-size:20px; margin-bottom:7px; display:block; }
  .c-ttl {
    font-size:12.5px; font-weight:700; margin-bottom:4px; letter-spacing:-0.01em;
  }
  .cy .c-ttl { color:var(--cyan); }
  .am .c-ttl { color:var(--amber); }
  .gr .c-ttl { color:var(--green); }
  .vi .c-ttl { color:var(--violet); }
  .or .c-ttl { color:var(--orange); }
  .pk .c-ttl { color:var(--pink); }
  .tl .c-ttl { color:var(--teal); }
  .bl .c-ttl { color:var(--blue); }

  .c-dsc {
    font-size:10.5px; line-height:1.55; color: var(--dim);
    font-family:'IBM Plex Mono',monospace;
  }

  /* ── TAGS ── */
  .tags { display:flex;flex-wrap:wrap;gap:4px;margin-top:8px; }
  .tag {
    font-family:'IBM Plex Mono',monospace;font-size:9px;
    padding:2px 7px;border-radius:4px;border:1px solid;
  }
  .cy .tag { color:var(--cyan);border-color:rgba(0,229,255,0.3);background:rgba(0,229,255,0.06); }
  .am .tag { color:var(--amber);border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.06); }
  .gr .tag { color:var(--green);border-color:rgba(34,197,94,0.3);background:rgba(34,197,94,0.06); }
  .vi .tag { color:var(--violet);border-color:rgba(139,92,246,0.3);background:rgba(139,92,246,0.06); }
  .or .tag { color:var(--orange);border-color:rgba(249,115,22,0.3);background:rgba(249,115,22,0.06); }
  .pk .tag { color:var(--pink);border-color:rgba(236,72,153,0.3);background:rgba(236,72,153,0.06); }
  .tl .tag { color:var(--teal);border-color:rgba(20,184,166,0.3);background:rgba(20,184,166,0.06); }
  .bl .tag { color:var(--blue);border-color:rgba(59,130,246,0.3);background:rgba(59,130,246,0.06); }

  /* ── ARROW ── */
  .arr {
    display:flex;flex-direction:column;align-items:center;
    padding:2px 0; gap:0;
  }
  .arr-bar { width:2px;height:18px;background:linear-gradient(to bottom,var(--border2),transparent); }
  .arr-head { color:var(--dimmer);font-size:12px;line-height:1;margin-top:-2px; }
  .arr-lbl {
    font-family:'IBM Plex Mono',monospace;font-size:9px;
    color:var(--dim);letter-spacing:0.06em;margin-top:2px;
  }

  /* ── SPLIT LABEL ── */
  .split-hdr {
    text-align:center;
    font-family:'IBM Plex Mono',monospace;font-size:9.5px;
    letter-spacing:0.1em;text-transform:uppercase;
    padding:5px 10px;border-radius:6px 6px 0 0;
    margin-bottom:4px;
  }
  .split-hdr.off { color:var(--orange);background:rgba(249,115,22,0.07);border:1px solid rgba(249,115,22,0.2);border-bottom:none; }
  .split-hdr.on  { color:var(--green); background:rgba(34,197,94,0.07); border:1px solid rgba(34,197,94,0.2); border-bottom:none; }

  /* ── WIDE CARD (full-width) ── */
  .c-wide {
    background:var(--card);border:1px solid var(--border);
    border-radius:10px;padding:14px 18px;margin-bottom:4px;
    display:flex;gap:14px;align-items:flex-start;
  }
  .c-wide-ico { font-size:28px;flex-shrink:0; }
  .c-wide-body {}
  .c-wide-ttl { font-size:13px;font-weight:700;margin-bottom:4px; }
  .c-wide-dsc { font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--dim);line-height:1.5; }

  /* ── LEGEND ── */
  .legend {
    margin-top:28px;background:var(--panel);
    border:1px solid var(--border2);border-radius:12px;padding:18px;
  }
  .legend-ttl {
    font-family:'IBM Plex Mono',monospace;font-size:10px;
    letter-spacing:0.12em;color:var(--dim);text-transform:uppercase;margin-bottom:12px;
  }
  .legend-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px; }
  .legend-item { display:flex;align-items:flex-start;gap:8px; }
  .l-dot { width:8px;height:8px;border-radius:2px;flex-shrink:0;margin-top:3px; }
  .l-text { font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--dim);line-height:1.4; }
  .l-text strong { display:block;margin-bottom:1px; }

  @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }

  @media(max-width:640px){
    .g2,.g3,.g4{grid-template-columns:1fr;}
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

function Card({ ico, ttl, dsc, tags, color = "cy", style }) {
  return (
    <div className={`c ${color}`} style={style}>
      {ico && <span className="c-ico">{ico}</span>}
      <div className="c-ttl">{ttl}</div>
      <div className="c-dsc">{dsc}</div>
      {tags && (
        <div className="tags">
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  );
}

export default function RAGDiagram() {
  return (
    <>
      <style>{css}</style>
      <div className="wrap">

        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-chip"><span />RAG ARCHITECTURE · 2025</div>
          <h1>Retrieval-Augmented<br /><em>Generation</em></h1>
          <p>End-to-end pipeline · offline indexing + online query · hybrid search</p>
        </div>

        {/* ═══════════════ OFFLINE PHASE ═══════════════ */}
        <div className="phase-band">
          <div className="phase-pill off">⚙️ OFFLINE — INDEXING PIPELINE</div>
          <div className="phase-line" />
        </div>

        {/* STEP 1: DATA SOURCES */}
        <StepLabel n="1" text="DATA SOURCES — Ingestion" />
        <div className="grid g4">
          <Card ico="📄" ttl="Documents" color="or"
            dsc="PDFs, DOCX, HTML, Markdown, TXT. Static knowledge base files."
            tags={["structured","static","batch"]} />
          <Card ico="🌐" ttl="Web / URLs" color="cy"
            dsc="Crawled pages, sitemaps, REST APIs. Live or scheduled ingestion."
            tags={["scraped","dynamic","sitemap"]} />
          <Card ico="🗄️" ttl="Databases" color="gr"
            dsc="SQL, NoSQL, S3 data lakes. Schema-aware extraction pipelines."
            tags={["SQL","NoSQL","S3","tabular"]} />
          <Card ico="💬" ttl="Streams / SaaS" color="am"
            dsc="Slack, Confluence, Notion, emails. Real-time or webhook-triggered."
            tags={["Slack","Notion","webhook","real-time"]} />
        </div>

        <Arr label="parse · clean · normalize" />

        {/* STEP 2: CHUNKING */}
        <StepLabel n="2" text="CHUNKING STRATEGIES" />
        <div className="grid g4">
          <Card ico="✂️" ttl="Fixed-Size Chunks" color="or"
            dsc="Split by token/char count. Overlap window (e.g. 50 tok) prevents boundary loss. Simple, fast, naive."
            tags={["512 tokens","50 overlap","fast"]} />
          <Card ico="📐" ttl="Semantic Chunking" color="cy"
            dsc="Split on meaning-shift detected via sentence embeddings. Context-aware boundaries, no arbitrary cuts."
            tags={["NLP-based","meaning-shift","smart"]} />
          <Card ico="🌳" ttl="Hierarchical (RAPTOR)" color="vi"
            dsc="Parent-child tree: full doc → section → paragraph → sentence. Multi-granular retrieval."
            tags={["RAPTOR","parent-child","multi-level"]} />
          <Card ico="🧩" ttl="Agentic / Contextual" color="gr"
            dsc="LLM determines chunk boundaries on-demand. Anthropic Contextual Retrieval prepends context to each chunk."
            tags={["LLM-guided","contextual","dynamic"]} />
        </div>

        <Arr label="embed each chunk" />

        {/* STEP 3: EMBEDDINGS */}
        <StepLabel n="3" text="EMBEDDING MODELS" />
        <div className="grid g3">
          <Card ico="🔬" ttl="Dense Embeddings" color="cy"
            dsc="OpenAI text-embedding-3-large (3072d), Cohere embed-v3, Jina v3, BGE-M3, GTE-large. High-dim semantic vector per chunk."
            tags={["cosine sim","3072-dim","semantic","OpenAI","Cohere"]} />
          <Card ico="⚡" ttl="Sparse / BM25" color="am"
            dsc="TF-IDF, BM25, SPLADE. Inverted-index token frequency. Precise on rare terms, codes, proper nouns. Fast lexical match."
            tags={["BM25","TF-IDF","SPLADE","lexical","exact"]} />
          <Card ico="🔀" ttl="Hybrid / ColBERT" color="tl"
            dsc="Late-interaction: per-token embeddings, MaxSim scoring between query tokens and doc tokens. Best of both worlds."
            tags={["ColBERT","MaxSim","multi-vector","state-of-art"]} />
        </div>

        <Arr label="index into vector store + keyword index" />

        {/* STEP 4: VECTOR DBs */}
        <StepLabel n="4" text="STORAGE LAYER — Vector DBs + Keyword Index" />
        <div className="grid g4">
          <Card ico="🟣" ttl="Pinecone" color="vi"
            dsc="Managed serverless. Namespaces, metadata filters, hybrid search. Multi-region, ANN at scale."
            tags={["managed","serverless","namespaces","ANN"]} />
          <Card ico="🔵" ttl="Chroma" color="bl"
            dsc="Local-first, embeddable. Persistent + in-memory. Ideal for dev, edge, local RAG with Ollama."
            tags={["OSS","local","dev-friendly","embedded"]} />
          <Card ico="🟢" ttl="Weaviate" color="gr"
            dsc="GraphQL API, multi-modal vectors, built-in hybrid search (BM25 + vector). Modules for CLIP, BERT."
            tags={["multi-modal","hybrid-native","GraphQL"]} />
          <Card ico="🟡" ttl="Qdrant / Milvus" color="am"
            dsc="Qdrant: Rust-based, HNSW, payload indexing. Milvus: distributed, IVF_FLAT. High-throughput prod workloads."
            tags={["HNSW","IVF","Rust","distributed","prod"]} />
        </div>

        {/* ═══════════════ ONLINE PHASE ═══════════════ */}
        <div className="phase-band" style={{marginTop:36}}>
          <div className="phase-pill on">⚡ ONLINE — QUERY PIPELINE</div>
          <div className="phase-line" />
        </div>

        {/* STEP 5: QUERY IN */}
        <StepLabel n="5" text="USER QUERY" />
        <div className="c cy" style={{marginBottom:4,padding:"14px 18px",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:26}}>💬</span>
          <div>
            <div className="c-ttl">Incoming User Query</div>
            <div className="c-dsc">Natural language question, optionally with conversation history (multi-turn). May carry implicit intent, ambiguity, or references requiring resolution.</div>
            <div className="tags" style={{marginTop:8}}>
              <span className="tag">natural language</span>
              <span className="tag">multi-turn</span>
              <span className="tag">session context</span>
            </div>
          </div>
        </div>

        <Arr label="transform & route" />

        {/* STEP 6: QUERY TRANSFORMATION */}
        <StepLabel n="6" text="QUERY UNDERSTANDING & TRANSFORMATION" />
        <div className="grid g3">
          <Card ico="🔄" ttl="Query Rewriting" color="cy"
            dsc="HyDE: generate hypothetical answer, embed it as query. Step-back prompting for abstract queries. Sub-question decomposition for multi-hop."
            tags={["HyDE","step-back","sub-questions","multi-hop"]} />
          <Card ico="🗺️" ttl="Query Routing" color="or"
            dsc="Intent classifier decides: vector DB, SQL DB, knowledge graph, or direct LLM answer. Metadata-aware routing."
            tags={["intent","routing","classifier","multi-index"]} />
          <Card ico="💬" ttl="History Condensation" color="gr"
            dsc="Compress multi-turn chat to standalone question. Resolve coreferences ('it', 'that'). Maintain session window."
            tags={["coreference","condense","follow-up","standalone"]} />
        </div>

        <Arr label="parallel hybrid retrieval" />

        {/* STEP 7: RETRIEVAL */}
        <StepLabel n="7" text="HYBRID RETRIEVAL — Parallel Execution" />
        <div className="grid g2" style={{marginBottom:4}}>
          <div>
            <div className="split-hdr on">🔵 SEMANTIC SEARCH</div>
            <Card ico="🧲" ttl="ANN Vector Search" color="cy"
              dsc="Embed query → cosine / dot-product similarity over stored embeddings. HNSW graph traversal approximates nearest neighbors. Returns top-K semantically similar chunks. Handles paraphrase, synonyms, concept-level matching."
              tags={["cosine","HNSW","top-K","semantic","ANN"]} />
          </div>
          <div>
            <div className="split-hdr off">🟡 KEYWORD SEARCH</div>
            <Card ico="🔑" ttl="BM25 Inverted Index" color="am"
              dsc="Token frequency scoring. Inverted index lookup for exact terms, codes, names, numbers. Elasticsearch / Lucene / Typesense backend. Handles rare tokens dense models miss entirely."
              tags={["BM25","TF-IDF","inverted-idx","exact","Elasticsearch"]} />
          </div>
        </div>

        <Arr label="merge ranked lists" />

        {/* STEP 8: RERANK */}
        <StepLabel n="8" text="FUSION + RE-RANKING + FILTERING" />
        <div className="grid g3">
          <Card ico="🔗" ttl="RRF Score Fusion" color="tl"
            dsc="Reciprocal Rank Fusion: merges semantic + keyword ranked lists without score normalization. position-based weighting, robust to score scale mismatch."
            tags={["RRF","rank fusion","no-norm","robust"]} />
          <Card ico="🏆" ttl="Cross-Encoder Re-rank" color="vi"
            dsc="Cohere Rerank v3, BGE Re-ranker, FlashRank. Full query↔document cross-attention. Scores top-N → selects top-M for LLM context window."
            tags={["Cohere Rerank","BGE","cross-attn","top-M"]} />
          <Card ico="🛡️" ttl="Guards & Filtering" color="or"
            dsc="Metadata filters (date, source, role ACL). Relevance score threshold cutoff. PII detection & stripping. Duplicate deduplication."
            tags={["metadata","ACL","threshold","PII","dedup"]} />
        </div>

        <Arr label="assemble prompt context" />

        {/* STEP 9: GENERATION */}
        <StepLabel n="9" text="CONTEXT ASSEMBLY & LLM GENERATION" />
        <div className="grid g3">
          <Card ico="📋" ttl="Prompt Assembly" color="cy"
            dsc="Re-rank chunks into prompt. System prompt + ranked context + user query. Lost-in-middle mitigation: place key chunks at start/end. Dynamic context window management."
            tags={["system prompt","rank-ordered","context window","lost-in-middle"]} />
          <Card ico="🤖" ttl="LLM Generation" color="vi"
            dsc="GPT-4o, Claude 3.7, Gemini 1.5 Pro, Llama 3.1. Streaming output with inline citations. Grounded strictly on retrieved context to minimize hallucination."
            tags={["GPT-4o","Claude","Gemini","streaming","citations","grounded"]} />
          <Card ico="✅" ttl="Evaluation & Post-process" color="gr"
            dsc="RAGAS: faithfulness, answer relevancy, context recall. NLI-based hallucination detection. Source attribution. Answer caching for repeated queries."
            tags={["RAGAS","faithfulness","NLI","attribution","cache"]} />
        </div>

        {/* LEGEND */}
        <div className="legend">
          <div className="legend-ttl">RAG Pattern Evolution</div>
          <div className="legend-grid">
            {[
              ["#00e5ff","Naive RAG","Embed → retrieve → generate. No rewrite, no rerank."],
              ["#f97316","Advanced RAG","Query transform + hybrid search + cross-encoder rerank."],
              ["#22c55e","Modular RAG","Plug-and-play components: swap retrievers, rankers, generators."],
              ["#8b5cf6","Agentic RAG","LLM decides when & what to retrieve; multi-step tool calls."],
              ["#f59e0b","Self-RAG","LLM critiques its own retrieval quality, re-retrieves if poor."],
              ["#ec4899","GraphRAG","Entity extraction → knowledge graph → graph traversal + RAG."],
              ["#14b8a6","RAPTOR","Hierarchical doc tree with recursive summarization for multi-level retrieval."],
              ["#3b82f6","Contextual Retrieval","Each chunk prefixed with BM25+semantic context by Anthropic."],
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
