# PulseRAG Insights

Build a polished, production-looking single-page web app called “PulseRAG — ChatGPT India Voice Feedback Intelligence”.

This is a NextLeap product-management assignment prototype for “RAGs & Context Engineering”. The product selected in Milestone 1 is ChatGPT Mobile Voice adoption in India. The app must simulate an end-to-end AI workflow that turns recent public reviews into actionable product insights and support communication.

IMPORTANT: Use the exact demo dataset below as the initial dataset. Include a visible “Demo dataset: 20 public feedback records | 2026-06-07 → 2026-09-17” badge and allow CSV upload so the evaluator can replace it. Do NOT claim these are App Store ratings if they are public forum/community records.

DATASET COLUMNS: date,source_type,source,source_url,rating,theme_hint,review_text,quote
Rows:
2026-06-07,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/439729499,,Billing & subscriptions,"User reported a ChatGPT Plus charge through Google Play, then cancelled the subscription the same day and asked for a refund.","I canceled the sbscription on the same day after noticing the charge"
2026-06-14,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/441728591,,Billing & subscriptions,"User said ChatGPT Go was cancelled before renewal, but a Google Play payment still went through and the paid access did not activate.","I canceled my ChatGPT Go subscription on May 31, but was still charged."
2026-06-19,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/443160642,,Billing & subscriptions,"User reported two ChatGPT subscription purchases attached to different Google accounts and asked whether both charges were valid.","Both purchases were charged to the same bank account"
2026-06-28,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/445758932,,Billing & subscriptions,"User described a mystery ChatGPT subscription charge on a family card and could not locate an active subscription in accessible Google accounts.","My mother's credit card has been charged A$33.99 for a Google ChatGPT subscription"
2026-07-10,Reddit,r/googleplay,https://www.reddit.com/r/googleplay/comments/1uskm53/issue_regarding_payment_history/,,Billing & subscriptions,"User noticed Google Play withdrawing the ChatGPT Go renewal several days before the expected date and did not receive a matching Play notification.","Google had withdrawn money from my bank to pay for it, even though it was still not due yet"
2026-07-12,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/450359415,,Billing & subscriptions,"User said they accidentally subscribed to ChatGPT Go, cancelled immediately, and requested a refund for the ₹1,499 charge.","They charged rs. 1499"
2026-07-15,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/451118279,,Payment reliability,"User could not complete a ChatGPT Plus purchase on Google Play because payment returned error OR-REH-04.","My ChatGPT subscription failed. I received the error code OR-REH-04."
2026-07-21,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/453404035,,Billing & subscriptions,"User accidentally purchased ChatGPT Go for ₹399 and asked for a refund after not using the subscription.","Please refund ₹399 and cancel it."
2026-07-24,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/454112528,,Payment reliability,"User reported being unable to upgrade an existing ChatGPT subscription from Plus to Pro.","I can't upgrade my ChatGPT subscription from Plus to Pro"
2026-07-14,Reddit,r/ChatGPTcomplaints,https://www.reddit.com/r/ChatGPTcomplaints/comments/1uw21zt/is_anyone_else_having_issues_with_the_new_chatgpt/,,Performance & reliability,"User said the new mobile app felt extremely slow, with older chats harder to find; another commenter reported voice-to-text problems requiring restarts.","everything feels extremely slow"
2026-07-20,Reddit,r/ChatGPT,https://www.reddit.com/r/ChatGPT/comments/1v1p1ez/my_experience_with_the_latest_models/,,Model quality & instruction following,"Paid user compared newer models and said one model often ignored system prompts and required repeated review/fix cycles for coding work.","doesn't follow the system prompt or tool guidance very well"
2026-08-12,Public forum archive,ChatGPT Disaster / archived public post,https://chatgptdisaster.com/accounts.html,,Billing & subscriptions,"Archived public account reports describe a payment succeeding at the bank while the OpenAI account was marked unpaid/void and downgraded.","My Plus payment went through successfully on my bank's end"
2026-08-18,Reddit,r/ChatGPTPro,https://www.reddit.com/r/ChatGPTPro/comments/1vrsezq/fresh_chatgpt_chats_are_fast_established_ones_now/,,Performance & reliability,"User reported established and Project chats becoming dramatically slower and less reliable, with long waits, streaming failures, and retries.","Established ChatGPT conversations have suddenly become dramatically slower and much less reliable."
2026-09-01,Reddit,r/OpenAI,https://www.reddit.com/r/OpenAI/comments/1w4ipus/csv_files_cannot_be_analyzed_01092026/,,Files & analysis,"User reported that CSV attachments uploaded successfully but could not be accessed for analysis, suggesting an attachment-to-sandbox issue.","attachments upload successfully and appear in the conversation, but the corresponding sandbox files are missing"
2026-09-02,Reddit,r/ChatGPT,https://www.reddit.com/r/ChatGPT/comments/1w53lt1/openai_ads_manager_charged_me_100_after_i_just/,,Billing & subscriptions,"OpenAI Ads Manager user saw a roughly $100 deduction during setup and later learned it was described as a temporary authorization hold.","I noticed ₹9,903 (~$100) was deducted from my bank account by OpenAI."
2026-09-02,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/464358098,,Payment reliability,"User trying to subscribe to ChatGPT Plus repeatedly received payment error OR-REH-04 on Google Play.","I'm trying to subscribe to ChatGPT Plus but keep getting the error code OR-REH-04"
2026-09-03,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/464770886,,Payment reliability,"User said the official ChatGPT Android app showed “Purchases are unavailable” and the Google Play payment window never opened.","Purchases are unavailable."
2026-09-11,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/466565469,,Billing & subscriptions,"User with an active Pro subscription said it was accidentally cancelled in Google Play and no resubscribe/renew option was available.","there is no “Resubscribe,” “Renew,” or similar option available"
2026-09-17,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/468145188,,Billing & subscriptions,"User requested a refund for a ChatGPT Plus purchase because an expected video-generation capability was unavailable to them.","I purchased the subscription because I expected to use video generation"
2026-09-17,Google Play Community,Google Play Community,https://support.google.com/googleplay/thread/468119857,,Payment reliability,"User reported repeated payment failures for ChatGPT Plus through Google Pay with OR-REH-04 and OR-HDT-16.","The issue occurs repeatedly, even though my payment method is active"

ANALYSIS REQUIREMENTS:
- Max 5 themes. Use deterministic, transparent theme clustering from theme_hint, but display it as “AI theme clustering (demo mode)” and show an expandable “method” note that the demo engine maps each review to a controlled taxonomy and can be swapped for an LLM call.
- Top 3 themes for this dataset should be: Billing & subscriptions, Payment reliability, Performance & reliability.
- Identify one recurring fee/charge confusion connected directly to reviews: “Subscription charge timing / post-cancellation billing confusion” (especially Google Play/web platform management, renewal timing, and cancellation not automatically refunding past charges).
- Make the insight evidence traceable: show the specific reviews driving the fee issue with links.
- Include exactly 3 real-user quotes in the weekly pulse.
- Weekly pulse <=250 words. Include summary, 3 quotes, key observation, 3 action ideas.
- Fee explainer <=6 bullets, neutral/facts-only, with 2 official OpenAI source links, plus “Last checked: 08 Oct 2026”.
- Source list should show 4–6 URLs. Clearly label user-generated evidence vs official sources.
- Add a “Context engineering” panel showing the assembled context pack: dataset scope, top themes, fee issue, evidence snippets, source constraints, output schema. Include a copy button.
- Add a “Pipeline” stepper: Ingest → Cluster → Detect fee confusion → Draft outputs → Approval gate → MCP actions.
- Approval gate is the most important interaction. Before clicking approval, MCP actions MUST be disabled. Show “Awaiting approval”. On approval, simulate two tool calls with an execution log:
  1) append_to_notes_doc payload containing date, top_themes, weekly_pulse, identified_fee_issue, explanation_bullets, source_links
  2) create_email_draft with subject “Weekly Product Pulse + Customer Clarification — Subscription billing confusion” and a body containing the pulse plus fee explanation.
- No auto-send. Show status “Draft created — not sent”.
- Provide a “Notes / Doc” tab that shows the appended structured entry after approval.
- Provide an “Email draft” tab that shows the exact subject and body after approval.
- Add a “Demo reset” control.
- Add a “Download outputs” control that exports a JSON bundle of the structured outputs.
- CSV uploader should parse and re-run analysis in browser without needing a backend.
- Use a refined, modern PM analytics aesthetic: deep ink/navy typography, off-white canvas, crisp cards, subtle teal/blue accent, restrained shadows, thin dividers, generous spacing. Avoid gaudy dashboards.
- Desktop-first but responsive.
- Include a footer disclaimer: “Public review evidence is user-generated and may be incomplete; official links are used for fee-policy facts.”
- Avoid fabricating ratings. Don’t imply quantitative sentiment unless computed directly from the uploaded CSV.

DEFAULT OFFICIAL SOURCES:
https://help.openai.com/en/articles/9039756-billing-faq
https://help.openai.com/en/articles/7232895-how-do-i-request-a-refund-for-my-chatgpt-subscription
Optional third official source:
https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers

DEFAULT FEE EXPLAINER FACTS:
- ChatGPT subscriptions can be billed through the web, Apple App Store, or Google Play Store.
- Subscriptions on more than one platform may result in separate charges.
- Cancelling stops future renewals; it does not by itself establish refund eligibility for an already-issued charge.
- Refund eligibility depends on the plan, purchase channel, and applicable rights.
- For web/Google Play, OpenAI says to contact support while signed into the account associated with the charge.
- Apple App Store refunds are requested from Apple.
Keep wording factual and avoid legal overclaiming.

Make the first screen immediately understandable: title, one-sentence purpose, dataset scope, and an “Analyze 20 reviews” primary button. Use tabs: Overview, Weekly Pulse, Fee Explainer, MCP Approval, Sources.

Also include a small “assignment checklist” card showing all deliverables: working prototype, weekly pulse, notes entry, email draft, CSV sample, source list, README. Show each as Ready after demo data is loaded; “MCP approval” should become Ready only after approval.

Need a README panel inside the app with: How to run, Where approval happens, What fee issue was identified, and what to submit.

Do not require authentication.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pulserag-chatgpt-india-voice-feedback.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4cebce99-7803-4a74-83eb-2d7080d6e124).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
