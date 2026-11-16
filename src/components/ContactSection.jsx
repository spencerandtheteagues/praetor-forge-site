import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  ChevronDown,
  ClipboardCheck,
  Copy,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { ChapterHead } from "./ui.jsx";
import { CalTrigger } from "./Header.jsx";
import { useIntake, FIELD_LIMITS } from "../lib/intake.js";
import { buildBrief, buildMailto, buildPayload, copyText, FIELD_LABELS } from "../lib/brief.js";
import { scanRequest } from "../lib/secretGuard.js";
import {
  INTAKE_URL,
  PHONE_DISPLAY,
  PHONE_HREF,
  REQUEST_TYPES,
  SALES_EMAIL,
  SPENCER_EMAIL,
} from "../data/site.js";
import { FAILURES } from "../data/narrative.js";

const PROBLEM_TAGS = FAILURES.map((f) => f.tag);

const URGENCY = ["Exploring for now", "This quarter", "This month", "It’s broken right now"];
const APPROVAL = [
  "I decide",
  "I decide with a partner",
  "An owner or manager signs off",
  "A committee or board",
  "Not sure yet",
];

const ERROR_COPY = {
  invalid: "Our intake service couldn’t accept the form as sent. Check your name and email, then try again.",
  rate: "Too many enquiries have come from this connection in the last minute. Wait a minute, then try again.",
  server: "Our intake service didn’t confirm delivery.",
  network: "We couldn’t reach our intake service. Check your connection, then try again.",
  timeout: "Our intake service took too long to answer, so we can’t confirm delivery.",
};

const STATUS_LINE = {
  idle: "Draft · not sent",
  sending: "Transmitting…",
  sent: "Received · on our radar",
  error: "Held · delivery not confirmed",
};

// Legacy deep links: #intake?product=X, #contact?tier=Y, ?product=X#contact.
const TIER_MAP = [
  [/teardown|fit|call|free/i, "Free teardown & fit call"],
  [/care|ongoing|retainer|support/i, "Ongoing care"],
  [/audit|security|reliab/i, "Reliability & security audit"],
  [/harness|agent/i, "An AI harness"],
  [/site|web|app|full/i, "A website or full-stack app"],
  [/autom|workflow/i, "Workflow automation"],
];
const PREFILL_KEYS = ["product", "tier", "type", "requestType"];

function cleanParam(value) {
  return Array.from(String(value || ""))
    .filter((c) => c.charCodeAt(0) > 31 && c.charCodeAt(0) !== 127 && c !== "<" && c !== ">")
    .join("")
    .trim()
    .slice(0, 80);
}

function requestTypeFor(raw) {
  const value = cleanParam(raw);
  if (!value) return null;
  const exact = REQUEST_TYPES.find((t) => t.toLowerCase() === value.toLowerCase());
  if (exact) return exact;
  return TIER_MAP.find(([re]) => re.test(value))?.[1] || null;
}

export default function ContactSection() {
  const { request, update, toggleProblem, prefill, pulse } = useIntake();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorKind, setErrorKind] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmedSig, setConfirmedSig] = useState("");
  const [guardNudge, setGuardNudge] = useState(false);
  const [copyState, setCopyState] = useState("idle"); // idle | copied | selected
  const [mailCopied, setMailCopied] = useState(false);
  const [flashedPulse, setFlashedPulse] = useState(0); // last pulse whose animation finished

  const successRef = useRef(null);
  const ideaRef = useRef(null);
  const guardRef = useRef(null);
  const previewRef = useRef(null);
  const returnToIdea = useRef(false);

  useEffect(() => {
    setReady(true);
  }, []);

  // Prefill from a legacy deep link once, then tidy the URL.
  useEffect(() => {
    const { hash, search, pathname } = window.location;
    const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
    const params = new URLSearchParams(search);
    new URLSearchParams(hashQuery).forEach((value, key) => params.set(key, value));
    const product = cleanParam(params.get("product"));
    const typeParam = params.get("tier") || params.get("type") || params.get("requestType");
    const requestType = requestTypeFor(typeParam);
    if (!product && !typeParam) return;
    const note =
      !requestType && cleanParam(typeParam) ? `Engagement interest: ${cleanParam(typeParam)} — ` : undefined;
    prefill({ product: product || undefined, requestType: requestType || undefined, note });
    PREFILL_KEYS.forEach((key) => params.delete(key));
    const rest = params.toString();
    window.history.replaceState(null, "", `${pathname}${rest ? `?${rest}` : ""}#contact`);
    document.getElementById("contact")?.scrollIntoView({ block: "start" });
  }, [prefill]);

  useEffect(() => {
    if (status === "sent") {
      successRef.current?.focus();
    } else if (status === "idle" && returnToIdea.current) {
      returnToIdea.current = false;
      ideaRef.current?.focus();
    }
  }, [status]);

  const scan = useMemo(() => scanRequest(request), [request]);
  const hasSecrets = scan.hits.length > 0;
  const confirmed = hasSecrets && confirmedSig === scan.signature;
  const blocked = hasSecrets && !confirmed;
  const secretFields = new Set(scan.hits.map((h) => h.field));

  const preview = useMemo(() => buildBrief(request, { redact: true }), [request]);
  const shareText = useMemo(
    () => buildBrief(request, { redact: !confirmed, blank: "" }),
    [request, confirmed],
  );
  const mailto = useMemo(() => buildMailto(request, { redact: !confirmed }), [request, confirmed]);

  const onField = (e) => {
    update(e.target.name, e.target.value);
    if (copyState !== "idle") setCopyState("idle");
  };

  const fieldProps = (name) => ({
    id: `field-${name}`,
    name,
    value: request[name] ?? "",
    onChange: onField,
    maxLength: FIELD_LIMITS[name],
    "aria-describedby": secretFields.has(name) ? "secret-guard" : undefined,
    className: secretFields.has(name) ? "has-secret" : undefined,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || status === "sending") return;
    if (blocked) {
      setGuardNudge(true);
      guardRef.current?.focus();
      return;
    }
    setStatus("sending");
    setErrorKind(null);
    let res;
    let body = null;
    try {
      res = await fetch(INTAKE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(request)),
        signal:
          typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
            ? AbortSignal.timeout(15000)
            : undefined,
      });
      body = await res.json().catch(() => null);
    } catch (err) {
      setErrorKind(err?.name === "TimeoutError" || err?.name === "AbortError" ? "timeout" : "network");
      setStatus("error");
      return;
    }
    if (res.ok && body?.ok === true) {
      setStatus("sent");
      return;
    }
    setErrorKind(
      res.status === 400 || res.status === 413 ? "invalid" : res.status === 429 ? "rate" : "server",
    );
    setStatus("error");
  };

  const shareAnother = () => {
    update("desiredWorkflow", "");
    setErrorKind(null);
    returnToIdea.current = true;
    setStatus("idle");
  };

  const copyBrief = async () => {
    if (await copyText(shareText)) {
      setCopyState("copied");
      return;
    }
    // Fallback: select the visible Work Order so the user can copy it by hand.
    const node = previewRef.current;
    const selection = window.getSelection?.();
    if (node && selection) {
      setPreviewOpen(true);
      selection.selectAllChildren(node);
      setCopyState("selected");
    }
  };

  const onMailClick = () => {
    if (!mailto.overflow) return;
    copyText(mailto.text).then(setMailCopied);
  };

  // Gold pulse on external prefill; removed once played so showing a hidden
  // preview later (mobile toggle, resize) does not replay it.
  const showFlash = pulse > 0 && pulse !== flashedPulse;
  const endFlash = () => setFlashedPulse(pulse);

  const problems = [
    ...PROBLEM_TAGS,
    ...request.problems.filter((p) => !PROBLEM_TAGS.includes(p)),
  ];
  const extraCount =
    ["role", "website", "urgency", "approvalPath", "infrastructure", "currentStack", "failureDetails", "successCriteria", "accessPlan", "callWindow"].filter(
      (k) => request[k],
    ).length + request.problems.length;

  return (
    <section id="contact" className="section contact">
      <span id="intake" className="anchor-alias" aria-hidden="true" />
      <div className="container">
        <ChapterHead
          numeral="XI"
          eyebrow="Intake · Direct to Spencer Teague"
          title={
            <>
              Bring us the problem <em>nobody else could finish.</em>
            </>
          }
        >
          <p>
            Tell us what’s manual, fragile, or stuck after someone else’s prototype hit a
            wall. Your Work Order assembles live on the right as you type, and Spencer
            replies directly.
          </p>
        </ChapterHead>

        <div className="contact-grid">
          <div className="contact-main">
            {status === "sent" ? (
              <div className="contact-success" role="status">
                <span className="contact-success-mark" aria-hidden="true">
                  <Check size={28} />
                </span>
                <h3 ref={successRef} tabIndex={-1}>
                  Your project is on our radar.
                </h3>
                <p>
                  Thanks for the detail. We’ll reply to{" "}
                  <strong>{request.email.trim()}</strong> to talk through the next step.
                </p>
                <button type="button" className="button button-outline" onClick={shareAnother}>
                  Share another idea <ArrowRight aria-hidden="true" />
                </button>
              </div>
            ) : (
              <form className="contact-form" method="post" onSubmit={submit}>
                <fieldset disabled={!ready}>
                  <p className="contact-required">
                    Name, email and the idea are required. Everything else is optional.
                  </p>
                  <div className="contact-pair">
                    <div className="contact-field">
                      <label htmlFor="field-name">Your name</label>
                      <input {...fieldProps("name")} autoComplete="name" required placeholder="Jane Rivera" />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="field-email">Work email</label>
                      <input
                        {...fieldProps("email")}
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@yourfirm.com"
                      />
                    </div>
                  </div>
                  <div className="contact-pair">
                    <div className="contact-field">
                      <label htmlFor="field-company">
                        Company <span className="contact-optional">(optional)</span>
                      </label>
                      <input {...fieldProps("company")} autoComplete="organization" placeholder="Firm or team" />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="field-requestType">What should we build?</label>
                      <select
                        id="field-requestType"
                        name="requestType"
                        value={request.requestType}
                        onChange={onField}
                      >
                        {REQUEST_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                        {!REQUEST_TYPES.includes(request.requestType) && request.requestType ? (
                          <option value={request.requestType}>{request.requestType}</option>
                        ) : null}
                      </select>
                    </div>
                  </div>
                  <div className="contact-field">
                    <label htmlFor="field-desiredWorkflow">The idea, the bottleneck, or the big ambition</label>
                    <textarea
                      {...fieldProps("desiredWorkflow")}
                      ref={ideaRef}
                      required
                      rows={5}
                      placeholder="What does your team do by hand today? What should the software do instead?"
                    />
                    <span className="contact-count mono" aria-hidden="true">
                      {request.desiredWorkflow.length} / {FIELD_LIMITS.desiredWorkflow}
                    </span>
                  </div>

                  <div className="contact-drawer">
                    <button
                      type="button"
                      className="contact-drawer-toggle"
                      aria-expanded={detailsOpen}
                      aria-controls="contact-details"
                      onClick={() => setDetailsOpen((o) => !o)}
                    >
                      <span>Add system &amp; architecture details</span>
                      {extraCount ? <span className="contact-drawer-count mono">{extraCount} added</span> : null}
                      <ChevronDown aria-hidden="true" className="contact-drawer-chevron" />
                    </button>
                    <div id="contact-details" className="contact-details" hidden={!detailsOpen}>
                      <div className="contact-pair">
                        <div className="contact-field">
                          <label htmlFor="field-role">Your role</label>
                          <input {...fieldProps("role")} autoComplete="organization-title" placeholder="Owner, ops lead, CTO…" />
                        </div>
                        <div className="contact-field">
                          <label htmlFor="field-website">Website or repository</label>
                          <input {...fieldProps("website")} type="text" inputMode="url" autoComplete="url" placeholder="example.com" />
                        </div>
                      </div>
                      <div className="contact-pair">
                        <div className="contact-field">
                          <label htmlFor="field-urgency">How urgent is it?</label>
                          <select id="field-urgency" name="urgency" value={request.urgency} onChange={onField}>
                            <option value="">Choose one</option>
                            {URGENCY.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="contact-field">
                          <label htmlFor="field-approvalPath">Who approves the work?</label>
                          <select id="field-approvalPath" name="approvalPath" value={request.approvalPath} onChange={onField}>
                            <option value="">Choose one</option>
                            {APPROVAL.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="contact-field">
                        <label htmlFor="field-infrastructure">Where it runs today</label>
                        <input {...fieldProps("infrastructure")} placeholder="Cloud, a VPS, on-prem servers, a single laptop…" />
                      </div>
                      <div className="contact-field">
                        <label htmlFor="field-currentStack">Current tools and stack</label>
                        <textarea {...fieldProps("currentStack")} rows={3} placeholder="Spreadsheets, CRM, languages, AI providers, scripts…" />
                      </div>
                      <div className="contact-chips" role="group" aria-labelledby="contact-chips-label">
                        <p id="contact-chips-label" className="contact-chips-label">
                          Symptoms you’re seeing
                        </p>
                        <div className="contact-chip-row">
                          {problems.map((p) => {
                            const on = request.problems.includes(p);
                            return (
                              <button
                                key={p}
                                type="button"
                                className="contact-chip"
                                aria-pressed={on}
                                onClick={() => toggleProblem(p)}
                              >
                                {on ? <Check aria-hidden="true" /> : null}
                                {p}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="contact-field">
                        <label htmlFor="field-failureDetails">What breaks, and how often?</label>
                        <textarea {...fieldProps("failureDetails")} rows={3} />
                      </div>
                      <div className="contact-field">
                        <label htmlFor="field-successCriteria">What would success look like?</label>
                        <textarea {...fieldProps("successCriteria")} rows={3} />
                      </div>
                      <div className="contact-field">
                        <label htmlFor="field-accessPlan">How could we get access safely?</label>
                        <textarea
                          {...fieldProps("accessPlan")}
                          rows={2}
                          placeholder="Describe it. Never paste keys or passwords here."
                        />
                      </div>
                      <div className="contact-field">
                        <label htmlFor="field-callWindow">Best time for a call</label>
                        <input {...fieldProps("callWindow")} placeholder="Weekday mornings, Central time" />
                      </div>
                    </div>
                  </div>

                  <div className="contact-honeypot" aria-hidden="true">
                    <label htmlFor="field-hp">Leave this empty</label>
                    <input
                      id="field-hp"
                      name="hp"
                      tabIndex={-1}
                      autoComplete="off"
                      value={request.hp}
                      onChange={onField}
                    />
                  </div>

                  <div className={`secret-guard${hasSecrets ? " is-active" : ""}${guardNudge && blocked ? " is-nudged" : ""}`}>
                    <div id="secret-guard" role="status">
                      {hasSecrets ? (
                        <p ref={guardRef} tabIndex={-1}>
                          <ShieldAlert aria-hidden="true" />
                          <span>
                            This looks like a credential:{" "}
                            {scan.hits
                              .map((h) => `${h.labels.join(", ")} in ${FIELD_LABELS[h.field] || h.field}`)
                              .join("; ")}
                            . We’ve redacted it in the preview, but the form would still send it.{" "}
                            {confirmed ? "Confirmed: you can send." : "Remove it, or confirm it isn’t a secret."}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    {hasSecrets ? (
                      <label className="secret-guard-confirm">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          onChange={(e) => {
                            setConfirmedSig(e.target.checked ? scan.signature : "");
                            setGuardNudge(false);
                          }}
                        />
                        This is not a secret
                      </label>
                    ) : null}
                  </div>

                  <button className="button button-gold contact-submit" type="submit" disabled={status === "sending"}>
                    {status === "sending" ? "Sending your enquiry…" : "Let’s talk about your project"}
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                  <p className="contact-note">
                    This sends your details to The Harness Lab so we can reply. Please leave out passwords
                    and confidential records.
                  </p>

                  {status === "error" ? (
                    <div className="contact-error" role="alert">
                      <p>
                        <strong>{ERROR_COPY[errorKind] || ERROR_COPY.server}</strong> Everything you typed
                        is still here.
                      </p>
                      <p>
                        <a href={mailto.href} onClick={onMailClick}>
                          Open this enquiry in your email app
                        </a>
                        {mailto.overflow
                          ? mailCopied
                            ? " (your full brief is on your clipboard; paste it into the email)"
                            : " (your brief is long, so the link copies it to your clipboard first)"
                          : ""}
                        , or call {PHONE_DISPLAY}.
                      </p>
                    </div>
                  ) : null}
                </fieldset>
              </form>
            )}
          </div>

          <aside className="work-order-col" aria-label="Work order preview">
            <button
              type="button"
              className="work-order-toggle"
              aria-expanded={previewOpen}
              aria-controls="work-order"
              onClick={() => setPreviewOpen((o) => !o)}
            >
              {showFlash ? (
                <span key={`t${pulse}`} className="work-order-flash" aria-hidden="true" onAnimationEnd={endFlash} />
              ) : null}
              Review your brief
              <ChevronDown aria-hidden="true" />
            </button>
            <div id="work-order" className="work-order" data-open={previewOpen ? "true" : "false"}>
              {showFlash ? (
                <span key={pulse} className="work-order-flash" aria-hidden="true" onAnimationEnd={endFlash} />
              ) : null}
              <div className="work-order-head">
                <span className="work-order-heading"><span className="mono">The Harness Lab · Project dossier</span><span className="inscription">Work order</span></span>
                <span className={`work-order-status mono is-${status}`}>{STATUS_LINE[status]}</span>
              </div>
              <div className="work-order-register mono">
                <span>Prepared for <strong>{request.company.trim() || request.name.trim() || "Your next build"}</strong></span>
                <span>{request.problems.length} selected control{request.problems.length === 1 ? "" : "s"}</span>
              </div>
              <pre ref={previewRef} className="work-order-body mono">
                {preview}
              </pre>
              <div className="work-order-foot">
                <button type="button" className="button button-ghost button-small" onClick={copyBrief} disabled={!ready}>
                  {copyState === "copied" ? <ClipboardCheck aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  Copy brief
                </button>
                <span className="work-order-copy-note mono" role="status">
                  {copyState === "copied"
                    ? "Copied."
                    : copyState === "selected"
                      ? "Selected. Press ⌘C or Ctrl+C to copy."
                      : ""}
                </span>
              </div>
            </div>
            <CalTrigger className="contact-booking" label="Book a 20-minute teardown call">
              <span className="contact-booking-icon"><CalendarCheck aria-hidden="true" /></span>
              <span className="contact-booking-copy">
                <span className="mono">Prefer a conversation?</span>
                <strong>Book a 20-minute teardown call</strong>
                <span>One workflow. A clear next step. Directly with Spencer.</span>
              </span>
              <ArrowUpRight className="contact-booking-arrow" aria-hidden="true" />
            </CalTrigger>
          </aside>
        </div>

        <div className="contact-rail">
          <a className="contact-rail-item" href={PHONE_HREF}>
            <Phone aria-hidden="true" />
            <span>
              <span className="contact-rail-label inscription">Call</span>
              {PHONE_DISPLAY}
            </span>
          </a>
          <a className="contact-rail-item" href={`mailto:${SALES_EMAIL}`}>
            <Mail aria-hidden="true" />
            <span>
              <span className="contact-rail-label inscription">New projects</span>
              {SALES_EMAIL}
            </span>
          </a>
          <a className="contact-rail-item" href={`mailto:${SPENCER_EMAIL}`}>
            <Mail aria-hidden="true" />
            <span>
              <span className="contact-rail-label inscription">Spencer directly</span>
              {SPENCER_EMAIL}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
