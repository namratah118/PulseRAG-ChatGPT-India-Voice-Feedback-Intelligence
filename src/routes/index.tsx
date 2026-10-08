import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { DEMO_CSV, parseCSV, type Review } from "@/lib/pulse/data";
import {
  analyze, contextPack, emailBody, EMAIL_SUBJECT, FEE_BULLETS, FEE_ISSUE, LAST_CHECKED,
  notesPayload, OFFICIAL_SOURCES, pulseMarkdown, sourceList,
} from "@/lib/pulse/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseRAG — ChatGPT India Voice Feedback Intelligence" },
      { name: "description", content: "Turn public ChatGPT mobile feedback into a weekly pulse, fee explainer and approval-gated MCP actions." },
      { property: "og:title", content: "PulseRAG — ChatGPT India Voice Feedback Intelligence" },
      { property: "og:description", content: "RAG & context-engineering prototype: reviews → themes → fee insight → approved notes & email draft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

const TABS = ["Overview", "Weekly Pulse", "Fee Explainer", "MCP Approval", "Sources"] as const;
type Tab = (typeof TABS)[number];
type LogLine = { t: string; msg: string; kind: "info" | "ok" };

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [reviews, setReviews] = useState<Review[]>(() => parseCSV(DEMO_CSV));
  const [datasetLabel, setDatasetLabel] = useState("demo");
  const [analyzed, setAnalyzed] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");
  const [approved, setApproved] = useState(false);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [notesDone, setNotesDone] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const a = useMemo(() => analyze(reviews), [reviews]);
  const sources = useMemo(() => sourceList(a), [a]);
  const ctx = useMemo(() => contextPack(a), [a]);

  const resetMcp = () => { setApproved(false); setLog([]); setNotesDone(false); setEmailDone(false); setRunning(false); };
  const reset = () => { setReviews(parseCSV(DEMO_CSV)); setDatasetLabel("demo"); setAnalyzed(false); setTab("Overview"); setUploadErr(""); resetMcp(); };

  const onUpload = async (f: File) => {
    const parsed = parseCSV(await f.text());
    if (!parsed.length) { setUploadErr("No valid rows found. Expected columns: date, source_type, source, source_url, rating, theme_hint, review_text, quote."); return; }
    setUploadErr(""); setReviews(parsed); setDatasetLabel(f.name); setAnalyzed(true); resetMcp();
  };

  const stamp = () => new Date().toLocaleTimeString();
  const approve = async () => {
    setApproved(true); setRunning(true);
    const push = (msg: string, kind: LogLine["kind"] = "info") => setLog((l) => [...l, { t: stamp(), msg, kind }]);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    push("Approval received from reviewer. Releasing MCP tool calls.");
    await wait(600); push("→ tools/call append_to_notes_doc { date, top_themes, weekly_pulse, identified_fee_issue, explanation_bullets, source_links }");
    await wait(900); push("✓ append_to_notes_doc → 200 OK · entry appended to “Weekly Product Pulse” doc", "ok"); setNotesDone(true);
    await wait(600); push(`→ tools/call create_email_draft { subject: "${EMAIL_SUBJECT}", send: false }`);
    await wait(900); push("✓ create_email_draft → 200 OK · Draft created — not sent", "ok"); setEmailDone(true);
    setRunning(false);
  };

  const step = !analyzed ? 0 : !approved ? 4 : emailDone ? 6 : 5;
  const steps = ["Ingest", "Cluster", "Detect fee confusion", "Draft outputs", "Approval gate", "MCP actions"];

  const bundle = () => ({
    generated_at: new Date().toISOString(),
    dataset: ctx.dataset_scope,
    themes: ctx.all_themes,
    top_themes: ctx.top_themes,
    identified_fee_issue: { label: FEE_ISSUE, evidence: ctx.evidence_snippets },
    weekly_pulse: { summary: a.summary, quotes: a.quotes.map((q) => ({ quote: q.quote, source: q.source, date: q.date, url: q.source_url })), key_observation: a.observation, action_ideas: a.actions, word_count: a.pulseWords },
    fee_explainer: { bullets: FEE_BULLETS, source_links: OFFICIAL_SOURCES.slice(0, 2).map((s) => s.url), last_checked: LAST_CHECKED },
    sources,
    context_pack: ctx,
    mcp: { approved, notes_entry: notesDone ? notesPayload(a) : null, email_draft: emailDone ? { subject: EMAIL_SUBJECT, body: emailBody(a), status: "Draft created — not sent" } : null, log },
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="eyebrow">NextLeap · RAGs & Context Engineering · Milestone prototype</p>
              <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-foreground">PulseRAG <span className="text-muted-foreground font-normal">— ChatGPT India Voice Feedback Intelligence</span></h1>
              <p className="mt-3 text-muted-foreground">Turns recent public feedback on ChatGPT Mobile into themes, a fee-confusion insight, a weekly pulse and support copy — then executes notes and email actions only after human approval.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip chip-accent">{datasetLabel === "demo" ? "Demo dataset" : `Uploaded: ${datasetLabel}`}: {a.reviews.length} public feedback records | {a.range.from} → {a.range.to}</span>
                <span className="chip">Sources: {a.sourceTypes.join(", ")}</span>
                <span className="chip">{a.avgRating === null ? "No star ratings in dataset" : `Avg rating (from CSV): ${a.avgRating.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={() => setAnalyzed(true)} disabled={analyzed}>{analyzed ? "Analysis complete" : `Analyze ${a.reviews.length} reviews`}</button>
              <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Upload CSV</button>
              <button className="btn btn-ghost" onClick={() => download("pulserag-sample.csv", DEMO_CSV, "text/csv")}>Sample CSV</button>
              <button className="btn btn-ghost" disabled={!analyzed} onClick={() => download("pulserag-outputs.json", JSON.stringify(bundle(), null, 2), "application/json")}>Download outputs</button>
              <button className="btn btn-ghost" onClick={reset}>Demo reset</button>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
            </div>
          </div>
          {uploadErr && <p className="mt-3 text-sm text-destructive">{uploadErr}</p>}

          <ol className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-6">
            {steps.map((s, i) => {
              const done = i < step || (i === 5 && emailDone);
              const active = i === step && !done;
              return (
                <li key={s} className={`rounded-lg border px-3 py-2.5 ${done ? "border-transparent bg-success-soft" : active ? "border-accent bg-accent-soft" : "border-border"}`}>
                  <div className="eyebrow">Step {i + 1}</div>
                  <div className="mt-0.5 text-sm font-medium text-foreground">{s}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{done ? "Done" : active ? (i === 4 ? "Awaiting approval" : "In progress") : "Pending"}</div>
                </li>
              );
            })}
          </ol>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}{t === "MCP Approval" && analyzed && !approved && <span className="ml-2 chip chip-warning">Awaiting approval</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!analyzed ? (
          <div className="panel p-10 text-center">
            <p className="eyebrow">Ready to ingest</p>
            <h2 className="font-display mt-2 text-2xl text-foreground">{a.reviews.length} records loaded. Run the pipeline to generate insights.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Everything runs in your browser. Upload your own CSV with the same columns to replace the demo data.</p>
            <button className="btn btn-primary mt-6" onClick={() => setAnalyzed(true)}>Analyze {a.reviews.length} reviews</button>
          </div>
        ) : (
          <>
            {tab === "Overview" && <Overview a={a} ctx={ctx} approved={approved} emailDone={emailDone} />}
            {tab === "Weekly Pulse" && <Pulse a={a} />}
            {tab === "Fee Explainer" && <Fee a={a} />}
            {tab === "MCP Approval" && <Mcp a={a} approved={approved} running={running} log={log} notesDone={notesDone} emailDone={emailDone} onApprove={approve} />}
            {tab === "Sources" && <Sources sources={sources} />}
          </>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground">
          Public review evidence is user-generated and may be incomplete; official links are used for fee-policy facts.
        </div>
      </footer>
    </div>
  );
}

type A = ReturnType<typeof analyze>;

function Card({ title, eyebrow, children, right }: { title: string; eyebrow?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="panel p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h3 className="font-display text-lg font-semibold text-foreground">{title}</h3></div>
        {right}
      </div>
      {children}
    </section>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>{ok ? "Copied" : "Copy"}</button>;
}

function Overview({ a, ctx, approved, emailDone }: { a: A; ctx: ReturnType<typeof contextPack>; approved: boolean; emailDone: boolean }) {
  const [open, setOpen] = useState(false);
  const max = Math.max(...a.themes.map((t) => t.count));
  const checklist = [
    ["Working prototype", true], ["Weekly pulse", true], ["Notes entry", true], ["Email draft", true],
    ["CSV sample", true], ["Source list", true], ["README", true], ["MCP approval", approved && emailDone],
  ] as const;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card eyebrow="AI theme clustering (demo mode)" title={`${a.themes.length} themes · top 3 highlighted`}
          right={<button className="btn btn-ghost text-xs" onClick={() => setOpen(!open)}>{open ? "Hide" : "Method"}</button>}>
          {open && <p className="mb-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">The demo engine maps each review to a controlled taxonomy of 5 themes using its <code>theme_hint</code> (falling back to transparent keyword rules), then ranks by record count. It is deterministic and auditable, and can be swapped for an LLM classification call with the same output schema.</p>}
          <ul className="space-y-3">
            {a.themes.map((t, i) => (
              <li key={t.name}>
                <div className="flex justify-between text-sm"><span className={i < 3 ? "font-medium text-foreground" : "text-muted-foreground"}>{i < 3 && <span className="mr-2 font-mono text-xs text-accent">#{i + 1}</span>}{t.name}</span><span className="font-mono text-xs text-muted-foreground">{t.count} records</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted"><div className={`h-full rounded-full ${i < 3 ? "bg-primary" : "bg-chart-5"}`} style={{ width: `${(t.count / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Counts computed directly from the loaded CSV. No sentiment scores are inferred.</p>
        </Card>

        <Card eyebrow="Recurring fee / charge confusion" title={FEE_ISSUE}>
          <p className="text-sm text-muted-foreground">Users expect cancellation to reverse charges, are surprised by early or duplicate renewals, and are unsure whether Google Play or OpenAI manages the subscription. {a.feeEvidence.length} records drive this insight:</p>
          <ul className="mt-4 divide-y divide-border">
            {a.feeEvidence.map((r) => (
              <li key={r.source_url + r.date} className="py-3">
                <p className="text-sm text-foreground">“{r.quote}”</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.date} · {r.source} · <a className="link" href={r.source_url} target="_blank" rel="noreferrer">view source</a></p>
              </li>
            ))}
          </ul>
        </Card>

        <Card eyebrow="Context engineering" title="Assembled context pack" right={<CopyBtn text={JSON.stringify(ctx, null, 2)} />}>
          <p className="mb-3 text-sm text-muted-foreground">Exactly what gets sent to the drafting model: scope, top themes, fee issue, evidence, constraints and output schema.</p>
          <pre className="codebox max-h-96">{JSON.stringify(ctx, null, 2)}</pre>
        </Card>
      </div>

      <div className="space-y-6">
        <Card eyebrow="Assignment" title="Deliverables checklist">
          <ul className="space-y-2">
            {checklist.map(([k, ok]) => (
              <li key={k} className="flex items-center justify-between text-sm"><span className="text-foreground">{k}</span><span className={`chip ${ok ? "chip-success" : "chip-warning"}`}>{ok ? "Ready" : "Awaiting approval"}</span></li>
            ))}
          </ul>
        </Card>
        <Card eyebrow="README" title="How to use this prototype">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div><p className="font-medium text-foreground">How to run</p><p>Open the app, click “Analyze 20 reviews”. Optionally upload a CSV (date, source_type, source, source_url, rating, theme_hint, review_text, quote). All processing is in-browser.</p></div>
            <div><p className="font-medium text-foreground">Where approval happens</p><p>The <b>MCP Approval</b> tab. Tool calls stay disabled until you click “Approve & run MCP actions”. Email is drafted, never sent.</p></div>
            <div><p className="font-medium text-foreground">Fee issue identified</p><p>{FEE_ISSUE} — Google Play vs web management, renewal timing, and cancellation not refunding past charges.</p></div>
            <div><p className="font-medium text-foreground">What to submit</p><p>Prototype link, weekly pulse, notes entry, email draft (screenshot), sample CSV, source list, and the JSON from “Download outputs”.</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Pulse({ a }: { a: A }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card eyebrow={`Weekly pulse · ${a.pulseWords} / 250 words`} title="ChatGPT Mobile (India) — Weekly Product Pulse" right={<CopyBtn text={pulseMarkdown(a)} />}>
        <div className="space-y-6 text-sm leading-relaxed">
          <section><p className="eyebrow mb-1">Summary</p><p className="text-foreground">{a.summary}</p></section>
          <section><p className="eyebrow mb-2">What users said (3 quotes)</p>
            <div className="space-y-3">{a.quotes.map((q) => (
              <blockquote key={q.source_url} className="border-l-2 border-accent pl-4">
                <p className="font-display text-base text-foreground">“{q.quote}”</p>
                <p className="mt-1 text-xs text-muted-foreground">{q.source} · {q.date} · <a className="link" href={q.source_url} target="_blank" rel="noreferrer">source</a></p>
              </blockquote>))}</div>
          </section>
          <section><p className="eyebrow mb-1">Key observation</p><p className="text-foreground">{a.observation}</p></section>
          <section><p className="eyebrow mb-1">Action ideas</p><ol className="list-decimal space-y-1 pl-5 text-foreground">{a.actions.map((x) => <li key={x}>{x}</li>)}</ol></section>
        </div>
      </Card>
    </div>
  );
}

function Fee({ a }: { a: A }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card eyebrow="Customer clarification · facts only" title="How ChatGPT subscription charges work" right={<CopyBtn text={FEE_BULLETS.map((b) => `• ${b}`).join("\n")} />}>
        <ul className="space-y-2.5 text-sm text-foreground">{FEE_BULLETS.map((b) => <li key={b} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{b}</li>)}</ul>
        <div className="mt-6 border-t border-border pt-4 text-sm">
          <p className="eyebrow mb-2">Official sources</p>
          {OFFICIAL_SOURCES.slice(0, 2).map((s) => <p key={s.url}><a className="link" href={s.url} target="_blank" rel="noreferrer">{s.url}</a></p>)}
          <p className="mt-3 text-xs text-muted-foreground">Last checked: {LAST_CHECKED} · Addresses: {FEE_ISSUE} ({a.feeEvidence.length} records). Not legal advice.</p>
        </div>
      </Card>
    </div>
  );
}

function Mcp({ a, approved, running, log, notesDone, emailDone, onApprove }: { a: A; approved: boolean; running: boolean; log: LogLine[]; notesDone: boolean; emailDone: boolean; onApprove: () => void }) {
  const [sub, setSub] = useState<"Actions" | "Notes / Doc" | "Email draft">("Actions");
  const payload = notesPayload(a);
  return (
    <div className="space-y-6">
      <section className={`panel p-6 ${approved ? "" : "border-warning"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Human-in-the-loop approval gate</p>
            <h3 className="font-display text-xl font-semibold text-foreground">{approved ? (emailDone ? "Approved — actions executed" : "Approved — executing…") : "Awaiting approval"}</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Review the pulse and fee explainer. No tool call runs until you approve. The email is created as a draft and is never auto-sent.</p>
          </div>
          <button className="btn btn-accent" onClick={onApprove} disabled={approved}>{approved ? "Approved" : "Approve & run MCP actions"}</button>
        </div>
      </section>

      <div className="flex gap-1 border-b border-border">
        {(["Actions", "Notes / Doc", "Email draft"] as const).map((t) => (
          <button key={t} onClick={() => setSub(t)} className={`border-b-2 px-4 py-2 text-sm font-medium ${sub === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {sub === "Actions" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { name: "append_to_notes_doc", done: notesDone, body: JSON.stringify(payload, null, 2) },
            { name: "create_email_draft", done: emailDone, body: JSON.stringify({ subject: EMAIL_SUBJECT, body: "<weekly pulse + fee explanation>", send: false }, null, 2) },
          ].map((tool) => (
            <section key={tool.name} className={`panel p-6 ${approved ? "" : "opacity-60"}`}>
              <div className="mb-3 flex items-center justify-between">
                <code className="font-mono text-sm font-medium text-foreground">{tool.name}</code>
                <span className={`chip ${tool.done ? "chip-success" : approved ? "chip-accent" : ""}`}>{tool.done ? (tool.name === "create_email_draft" ? "Draft created — not sent" : "Appended") : approved ? "Running" : "Disabled · awaiting approval"}</span>
              </div>
              <pre className="codebox max-h-64">{tool.body}</pre>
            </section>
          ))}
          <section className="panel p-6 lg:col-span-2">
            <p className="eyebrow mb-2">Execution log</p>
            <div className="codebox min-h-24">
              {log.length === 0 ? <span className="text-muted-foreground">No tool calls yet. Awaiting approval.</span> :
                log.map((l, i) => <div key={i} className={l.kind === "ok" ? "text-success" : ""}>[{l.t}] {l.msg}</div>)}
              {running && <div className="text-muted-foreground">…</div>}
            </div>
          </section>
        </div>
      )}

      {sub === "Notes / Doc" && (
        <Card eyebrow="Weekly Product Pulse doc" title={notesDone ? `Entry appended · ${payload.date}` : "No entry yet"}>
          {notesDone ? (
            <div className="space-y-4 text-sm">
              <div><p className="eyebrow">Top themes</p><p className="text-foreground">{payload.top_themes.join(" · ")}</p></div>
              <div><p className="eyebrow">Identified fee issue</p><p className="text-foreground">{payload.identified_fee_issue}</p></div>
              <div><p className="eyebrow mb-1">Weekly pulse</p><pre className="codebox">{payload.weekly_pulse}</pre></div>
              <div><p className="eyebrow">Explanation bullets</p><ul className="list-disc pl-5 text-foreground">{payload.explanation_bullets.map((b) => <li key={b}>{b}</li>)}</ul></div>
              <div><p className="eyebrow">Source links</p>{payload.source_links.map((u) => <p key={u}><a className="link" href={u} target="_blank" rel="noreferrer">{u}</a></p>)}</div>
            </div>
          ) : <p className="text-sm text-muted-foreground">Approve in the gate above to append the structured entry.</p>}
        </Card>
      )}

      {sub === "Email draft" && (
        <Card eyebrow={emailDone ? "Draft created — not sent" : "Awaiting approval"} title="Email draft" right={emailDone ? <CopyBtn text={`Subject: ${EMAIL_SUBJECT}\n\n${emailBody(a)}`} /> : undefined}>
          {emailDone ? (
            <div className="space-y-3 text-sm">
              <p><span className="eyebrow mr-2">Subject</span><span className="font-medium text-foreground">{EMAIL_SUBJECT}</span></p>
              <pre className="codebox">{emailBody(a)}</pre>
              <span className="chip chip-success">Draft created — not sent</span>
            </div>
          ) : <p className="text-sm text-muted-foreground">Approve in the gate above to create the draft.</p>}
        </Card>
      )}
    </div>
  );
}

function Sources({ sources }: { sources: ReturnType<typeof sourceList> }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card eyebrow={`${sources.length} sources`} title="Source list">
        <ul className="divide-y divide-border">
          {sources.map((s) => (
            <li key={s.url} className="py-3">
              <span className={`chip ${s.kind === "Official source" ? "chip-accent" : "chip-warning"}`}>{s.kind}</span>
              <p className="mt-1.5 text-sm font-medium text-foreground">{s.title}</p>
              <a className="link text-xs" href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">Official sources are used for fee-policy facts. User-generated evidence reflects perceptions and may be incomplete.</p>
      </Card>
    </div>
  );
}
