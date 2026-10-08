import type { Review } from "./data";

export const TAXONOMY: { name: string; keywords: RegExp }[] = [
  { name: "Billing & subscriptions", keywords: /billing|subscri|refund|charg|renew|cancel/i },
  { name: "Payment reliability", keywords: /payment|OR-[A-Z]{3}|purchase.*unavailable|upgrade|declin/i },
  { name: "Performance & reliability", keywords: /slow|lag|crash|reliab|latency|stream/i },
  { name: "Model quality & instruction following", keywords: /model|prompt|instruction|hallucin|quality/i },
  { name: "Files & analysis", keywords: /file|csv|attachment|upload|sandbox/i },
];

export const OFFICIAL_SOURCES = [
  { title: "OpenAI Help Center — Billing FAQ", url: "https://help.openai.com/en/articles/9039756-billing-faq" },
  { title: "OpenAI Help Center — How do I request a refund for my ChatGPT subscription?", url: "https://help.openai.com/en/articles/7232895-how-do-i-request-a-refund-for-my-chatgpt-subscription" },
  { title: "OpenAI Help Center — About ChatGPT Pro tiers (optional)", url: "https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers" },
];

export const FEE_BULLETS = [
  "ChatGPT subscriptions can be billed through the web, the Apple App Store, or the Google Play Store.",
  "Subscribing on more than one platform may result in separate charges.",
  "Cancelling stops future renewals; it does not by itself establish refund eligibility for an already-issued charge.",
  "Refund eligibility depends on the plan, the purchase channel, and applicable rights.",
  "For web or Google Play purchases, OpenAI says to contact support while signed into the account associated with the charge.",
  "Apple App Store refunds are requested from Apple.",
];

export const LAST_CHECKED = "08 Oct 2026";
export const FEE_ISSUE = "Subscription charge timing / post-cancellation billing confusion";

const FEE_RX = /cancel|renew|charged|withdrawn|not due|refund|two .*purchases|separate|mystery|unpaid/i;

export type Theme = { name: string; count: number; share: number; reviews: Review[] };

export function classify(r: Review): string {
  const hint = r.theme_hint.trim();
  const exact = TAXONOMY.find((t) => t.name.toLowerCase() === hint.toLowerCase());
  if (exact) return exact.name;
  const blob = `${hint} ${r.review_text} ${r.quote}`;
  return TAXONOMY.find((t) => t.keywords.test(blob))?.name ?? "Other feedback";
}

export function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function analyze(reviews: Review[]) {
  const map = new Map<string, Review[]>();
  reviews.forEach((r) => {
    const k = classify(r);
    map.set(k, [...(map.get(k) ?? []), r]);
  });
  let themes: Theme[] = [...map.entries()]
    .map(([name, rs]) => ({ name, count: rs.length, share: rs.length / reviews.length, reviews: rs }))
    .sort((a, b) => b.count - a.count);
  if (themes.length > 5) {
    const rest = themes.slice(4).flatMap((t) => t.reviews);
    themes = [...themes.slice(0, 4), { name: "Other feedback", count: rest.length, share: rest.length / reviews.length, reviews: rest }];
  }
  const top3 = themes.slice(0, 3);

  const feeEvidence = reviews.filter(
    (r) => classify(r) === "Billing & subscriptions" && FEE_RX.test(`${r.review_text} ${r.quote}`),
  );

  const dates = reviews.map((r) => r.date).filter(Boolean).sort();
  const range = { from: dates[0] ?? "—", to: dates[dates.length - 1] ?? "—" };
  const sourceTypes = [...new Set(reviews.map((r) => r.source_type))];
  const ratings = reviews.map((r) => parseFloat(r.rating)).filter((n) => !isNaN(n));
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // exactly 3 quotes: one per top theme (fallback to remaining reviews)
  const used = new Set<Review>();
  const quotes: Review[] = [];
  top3.forEach((t) => {
    const pick = t.reviews.find((r) => r.quote && !used.has(r));
    if (pick) { used.add(pick); quotes.push(pick); }
  });
  for (const r of reviews) { if (quotes.length >= 3) break; if (r.quote && !used.has(r)) { used.add(r); quotes.push(r); } }

  const pct = (t: Theme) => `${t.count}/${reviews.length}`;
  const summary = `Across ${reviews.length} public feedback records (${range.from} → ${range.to}), the leading themes were ${top3
    .map((t) => `${t.name} (${pct(t)})`)
    .join(", ")}. Money-related friction dominates: users are confused about when and why they were charged, and several cannot complete a purchase at all.`;
  const observation = `Recurring fee confusion: ${FEE_ISSUE}. ${feeEvidence.length} records describe charges after or around cancellation, early renewals, or duplicate charges — users often expect cancellation to reverse a past charge, and are unsure whether Google Play or OpenAI manages the subscription.`;
  const actions = [
    "Add an in-app “Where is my subscription billed?” card showing platform (web / Google Play / App Store) and next renewal date.",
    "Show a cancellation confirmation that states access end date and that cancelling does not automatically refund past charges, with the correct refund path.",
    "Triage Google Play OR-REH-04 / “Purchases are unavailable” failures with Play billing and publish a support article for India users.",
  ];
  const pulseText = [
    summary,
    ...quotes.map((q) => `“${q.quote}” — ${q.source}`),
    observation,
    ...actions,
  ].join(" ");

  return { reviews, themes, top3, feeEvidence, range, sourceTypes, avgRating, quotes, summary, observation, actions, pulseWords: wordCount(pulseText) };
}

export type Analysis = ReturnType<typeof analyze>;

export function sourceList(a: Analysis) {
  const ugc = a.feeEvidence.slice(0, 3).map((r) => ({ title: `${r.source} — ${r.date}`, url: r.source_url, kind: "User-generated evidence" as const }));
  const off = OFFICIAL_SOURCES.map((s) => ({ ...s, kind: "Official source" as const }));
  return [...off, ...ugc].slice(0, 6);
}

export function pulseMarkdown(a: Analysis) {
  return `WEEKLY PRODUCT PULSE — ChatGPT Mobile (India)
Scope: ${a.reviews.length} public feedback records, ${a.range.from} → ${a.range.to}

Summary
${a.summary}

What users said
${a.quotes.map((q) => `• “${q.quote}” — ${q.source} (${q.date})`).join("\n")}

Key observation
${a.observation}

Action ideas
${a.actions.map((x, i) => `${i + 1}. ${x}`).join("\n")}`;
}

export function emailBody(a: Analysis) {
  return `Hi team,

${pulseMarkdown(a)}

CUSTOMER CLARIFICATION — Subscription billing
${FEE_BULLETS.map((b) => `• ${b}`).join("\n")}

Official sources:
${OFFICIAL_SOURCES.slice(0, 2).map((s) => `- ${s.url}`).join("\n")}
Last checked: ${LAST_CHECKED}

Note: Public review evidence is user-generated and may be incomplete; official links are used for fee-policy facts.

— PulseRAG (draft, not sent)`;
}

export const EMAIL_SUBJECT = "Weekly Product Pulse + Customer Clarification — Subscription billing confusion";

export function contextPack(a: Analysis) {
  return {
    dataset_scope: { records: a.reviews.length, date_range: a.range, source_types: a.sourceTypes, ratings_present: a.avgRating !== null },
    top_themes: a.top3.map((t) => ({ theme: t.name, count: t.count })),
    all_themes: a.themes.map((t) => ({ theme: t.name, count: t.count })),
    fee_issue: { label: FEE_ISSUE, evidence_count: a.feeEvidence.length },
    evidence_snippets: a.feeEvidence.map((r) => ({ date: r.date, source: r.source, quote: r.quote, url: r.source_url })),
    source_constraints: [
      "Fee/policy facts may only come from official OpenAI Help Center links.",
      "Public reviews are user-generated; use as evidence of perception, not policy.",
      "Do not fabricate ratings or sentiment scores.",
      "Exactly 3 verbatim quotes; pulse ≤ 250 words; explainer ≤ 6 neutral bullets.",
    ],
    output_schema: {
      weekly_pulse: "{ summary, quotes[3], key_observation, action_ideas[3] }",
      fee_explainer: "{ bullets[<=6], source_links[2], last_checked }",
      mcp_actions: ["append_to_notes_doc", "create_email_draft (no send)"],
    },
  };
}

export function notesPayload(a: Analysis) {
  return {
    date: new Date().toISOString().slice(0, 10),
    top_themes: a.top3.map((t) => t.name),
    weekly_pulse: pulseMarkdown(a),
    identified_fee_issue: FEE_ISSUE,
    explanation_bullets: FEE_BULLETS,
    source_links: sourceList(a).map((s) => s.url),
  };
}
