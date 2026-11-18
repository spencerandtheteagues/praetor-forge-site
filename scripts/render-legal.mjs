// Renders the legal pages into public/legal/**/index.html.
//
// One source for every legal page, so the entity name, file number and notice
// address can never drift between them. Runs as part of `npm run build`; the
// rendered files are also committed so the pages exist even without a build.
//
//   node scripts/render-legal.mjs
//
// Facts below are from the Texas Comptroller's public franchise-tax record for
// THE HARNESS LAB LLC (read 2026-11-18) and the SOS Certificate of Filing:
// file number 806765129 (the Comptroller zero-pads it to 0806765129), effective
// 08/25/2026, status ACTIVE, member-managed. Never put a home address
// in this file: the notice address is the company's mailing address of record.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const ENTITY = {
  legalName: "The Harness Lab LLC",
  short: "The Harness Lab",
  kind: "Texas limited liability company",
  sosFile: "806765129",
  formed: "August 25, 2026",
  formedIso: "2026-08-25",
  base: "San Angelo, Texas",
  noticeAddress: "5900 Balcones Drive, Suite 100, Austin, Texas 78731",
  legalEmail: "sales@theharnesslab.com",
  salesEmail: "sales@theharnesslab.com",
  phone: "607-364-7772",
  venue: "Tom Green County, Texas",
};

const EFFECTIVE = "November 18, 2026";
const EFFECTIVE_ISO = "2026-11-18";
const E = ENTITY;
const mail = (a) => `<a href="mailto:${a}">${a}</a>`;

export const LEGAL_LINE =
  `© 2026 ${E.legalName}, a ${E.kind} · Texas SOS File No. ${E.sosFile}`;

const footer = `
  <footer>
    <nav aria-label="Legal">
      <a href="/legal/">Legal notice</a>
      <a href="/legal/terms/">Website terms</a>
      <a href="/legal/privacy/">Privacy policy</a>
      <a href="/legal/client-terms/">Client services terms</a>
      <a href="/">theharnesslab.com</a>
    </nav>
    <p>${LEGAL_LINE}. Questions: ${mail(E.legalEmail)}</p>
  </footer>`;

const style = `
  <style>
    .legal-meta { color: var(--muted); font-size: 0.92rem; margin-top: -6px; }
    .legal-toc { margin: 26px 0 8px; padding: 16px 20px; border: 1px solid rgba(226,184,118,.2); background: var(--surface); }
    .legal-toc ol { margin: 6px 0 0; padding-left: 22px; columns: 2 260px; column-gap: 32px; }
    .legal-toc li { break-inside: avoid; margin: 0; padding: 3px 0; }
    .legal-facts { width: 100%; border-collapse: collapse; margin: 18px 0 8px; font-size: 0.97rem; }
    .legal-facts th, .legal-facts td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid rgba(226,184,118,.16); }
    .legal-facts th { width: 36%; color: var(--gold); font-weight: 600; }
    .conspicuous { margin: 18px 0; padding: 16px 18px; border: 1px solid var(--gold); background: rgba(226,184,118,.07); font-weight: 700; text-transform: uppercase; letter-spacing: .01em; line-height: 1.6; }
    main section { scroll-margin-top: 24px; }
    main h2 { margin-top: 44px; }
    @media (max-width: 520px) { .legal-facts th, .legal-facts td { display: block; width: 100%; padding: 6px 0; } .legal-facts th { border-bottom: 0; padding-top: 14px; } }
  </style>`;

function page({ slug, title, crumb, description, intro, sections }) {
  const url = `https://theharnesslab.com/legal/${slug ? slug + "/" : ""}`;
  const toc = sections.length > 3
    ? `<nav class="legal-toc" aria-label="Contents"><strong>Contents</strong><ol>${sections
        .map((s) => `<li><a href="#${s.id}">${s.h}</a></li>`)
        .join("")}</ol></nav>`
    : "";
  const body = sections
    .map((s) => `\n    <section id="${s.id}" aria-labelledby="${s.id}-h">\n      <h2 id="${s.id}-h">${s.h}</h2>\n      ${s.body.trim()}\n    </section>`)
    .join("\n");
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#page`,
    url,
    name: `${title} | ${E.legalName}`,
    description,
    dateModified: EFFECTIVE_ISO,
    isPartOf: { "@id": "https://theharnesslab.com/#website" },
    publisher: { "@id": "https://theharnesslab.com/#organization" },
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} | ${E.legalName}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index,follow">
  <meta name="theme-color" content="#000000">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"></noscript>
  <link rel="stylesheet" href="/services.css">${style}
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header>
    <a class="brand" href="/"><img src="/brand/harness-lab-copper-marble-512.webp" alt="" width="42" height="42">THE HARNESS LAB</a>
    <nav aria-label="Primary"><a href="/#work">Selected work</a><a href="/#contact">Project intake</a><a href="/legal/">Legal</a></nav>
  </header>
  <main id="main">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">The Harness Lab</a> <span aria-hidden="true">/</span> ${slug ? `<a href="/legal/">Legal</a> <span aria-hidden="true">/</span> ` : ""}<span>${crumb}</span></nav>
    <p class="eyebrow">${E.legalName} · ${E.kind}</p>
    <h1>${title}</h1>
    <p class="legal-meta">Effective ${EFFECTIVE}. Last updated ${EFFECTIVE}.</p>
    ${intro.trim()}
    ${toc}
${body}
  </main>
${footer}
</body>
</html>
`;
}

// ---------------------------------------------------------------- Legal notice
const notice = page({
  slug: "",
  title: "Legal notice and company information",
  crumb: "Legal",
  description: `${E.legalName} is a ${E.kind}, Texas SOS File No. ${E.sosFile}. Company details, legal documents and how to send a legal notice.`,
  intro: `<p class="lead">${E.short} is the trade name of ${E.legalName}, a ${E.kind}. Every product and service offered on this website, on theharnesslab.dev, on title-desk.com, on desktop.title-desk.com and on artificiallandman.io is offered by ${E.legalName}.</p>`,
  sections: [
    {
      id: "company",
      h: "Company details",
      body: `
      <table class="legal-facts">
        <tr><th scope="row">Legal name</th><td>${E.legalName}</td></tr>
        <tr><th scope="row">Entity type</th><td>Limited liability company, formed under the Texas Business Organizations Code</td></tr>
        <tr><th scope="row">State of formation</th><td>Texas</td></tr>
        <tr><th scope="row">Texas Secretary of State file number</th><td>${E.sosFile} (the Texas Comptroller displays it as 0${E.sosFile})</td></tr>
        <tr><th scope="row">Formed</th><td>${E.formed}</td></tr>
        <tr><th scope="row">Based in</th><td>${E.base}</td></tr>
        <tr><th scope="row">Mailing address for legal notices</th><td>${E.legalName}, ${E.noticeAddress}</td></tr>
        <tr><th scope="row">Email</th><td>${mail(E.salesEmail)} (new projects, legal, privacy, contracts and security)</td></tr>
      </table>
      <p>The company's registration can be checked in the public records of the Texas Secretary of State and the Texas Comptroller of Public Accounts under file number ${E.sosFile}.</p>`,
    },
    {
      id: "names",
      h: "Names and products we operate",
      body: `
      <p>${E.legalName} does business as <strong>The Harness Lab</strong> and offers the following products and services under its own name:</p>
      <ul>
        <li><strong>The Harness Lab</strong> — custom software, workflow automation, websites, internal tools and AI systems built for business clients (theharnesslab.com and theharnesslab.dev).</li>
        <li><strong>Title-Desk</strong> and <strong>Title-Desk Agent</strong> (the Title-Desk desktop app) — Texas mineral title research software and a hosted examination service for independent landmen and abstractors (title-desk.com and desktop.title-desk.com).</li>
        <li><strong>Artificial Landman</strong> — a hosted Texas mineral title examination platform for land teams, brokerages and operators (artificiallandman.io).</li>
      </ul>
      <p>When you deal with any of these names, you are dealing with ${E.legalName}.</p>`,
    },
    {
      id: "contracts",
      h: "Who you contract with",
      body: `
      <p>Every proposal, statement of work, work order, invoice, licence and subscription is made by ${E.legalName} as the contracting party. No member, manager, employee, contractor or agent of the company is a party to any of them in a personal capacity, and none of them is personally liable for the company's obligations.</p>
      <p>Only a written agreement signed or accepted on behalf of ${E.legalName} binds the company. Nothing on our websites, in a demo, a sample, a case study, a social media post or a conversation is an offer, a guarantee or a promise of any result. Custom work is governed by our <a href="/legal/client-terms/">Client Services Terms</a>; Title-Desk and Artificial Landman are governed by the terms published on their own websites.</p>`,
    },
    {
      id: "advice",
      h: "No legal, title or professional advice",
      body: `
      <p>${E.legalName} is a software company. It is not a law firm, an abstract company, a title insurance company, a surveyor or an accounting firm. Nothing we publish or deliver is legal, title, tax, accounting, investment or other professional advice, and nothing we deliver is a title opinion, an abstract of title or a survey. Work that requires a licensed professional must be reviewed by one.</p>`,
    },
    {
      id: "documents",
      h: "Legal documents",
      body: `
      <ul>
        <li><a href="/legal/terms/">Website Terms of Use</a> — rules for using our websites and sending us an enquiry.</li>
        <li><a href="/legal/privacy/">Privacy Policy</a> — what we collect through our websites and email, and what we do with it.</li>
        <li><a href="/legal/client-terms/">Client Services Terms</a> — the standard terms for custom software, automation and website work.</li>
        <li><a href="https://title-desk.com/legal/terms" rel="noopener">Title-Desk Terms of Service</a>, <a href="https://title-desk.com/legal/privacy" rel="noopener">Title-Desk Privacy Policy</a>, and <a href="https://desktop.title-desk.com/" rel="noopener">Title-Desk Agent</a>.</li>
        <li><a href="https://artificiallandman.io/legal/terms" rel="noopener">Artificial Landman terms</a>.</li>
      </ul>`,
    },
    {
      id: "trademarks",
      h: "Trademarks and copyright",
      body: `
      <p>The Harness Lab, Title-Desk, Title-Desk Agent, Artificial Landman, Perihelion, the winged medallion emblem and related names and logos are trademarks of ${E.legalName}. Website text, graphics, code and media are © 2026 ${E.legalName} unless another owner is named. Other names and logos belong to their owners; their appearance on our websites does not mean they endorse us.</p>
      <p>If you believe material on one of our websites infringes your copyright or trademark, write to ${mail(E.legalEmail)} with the material, its location, the right you hold and your contact details. We will review it promptly.</p>`,
    },
    {
      id: "notices",
      h: "How to send a legal notice",
      body: `
      <p>Send legal notices to ${E.legalName} by email to ${mail(E.legalEmail)} with "Legal notice" in the subject line, and by mail or courier to ${E.legalName}, ${E.noticeAddress}. A notice is effective when received at both. Service of legal process may also be made on the company's registered agent as listed in the records of the Texas Secretary of State.</p>`,
    },
  ],
});

// ---------------------------------------------------------------- Website terms
const terms = page({
  slug: "terms",
  title: "Website Terms of Use",
  crumb: "Website terms",
  description: `Terms for using theharnesslab.com and theharnesslab.dev, the websites of ${E.legalName}, a ${E.kind}.`,
  intro: `<p class="lead">These terms are an agreement between you and ${E.legalName}, a ${E.kind} (“${E.short}”, “we”, “us”). They apply when you use theharnesslab.com or theharnesslab.dev or send us an enquiry through them. By using either website you accept these terms. If you do not accept them, do not use the websites.</p>`,
  sections: [
    {
      id: "scope",
      h: "What these terms cover",
      body: `
      <p>These terms cover the websites only. Custom work we do for a client is governed by a signed proposal or statement of work and our <a href="/legal/client-terms/">Client Services Terms</a>. Title-Desk and Artificial Landman are governed by the terms on their own websites. Our <a href="/legal/privacy/">Privacy Policy</a> explains how we handle personal information.</p>
      <p>Our websites and services are offered for business purposes. If you use them for a company or other organisation, you confirm that you may accept these terms on its behalf.</p>`,
    },
    {
      id: "information",
      h: "Website content is general information",
      body: `
      <p>The websites describe our work and how we approach it. Their content is general information. It is not an offer, a quote, a guarantee or professional advice, and it may be incomplete or out of date.</p>
      <p>Case studies, demonstrations, sample runs, screenshots, timelines, benchmarks and project histories describe particular work under particular conditions. They are not a promise that your project will produce the same result, cost the same or take the same time. Any prices, ranges or package descriptions on the websites are indications only; the price for a project is the one stated in a signed proposal or statement of work.</p>`,
    },
    {
      id: "enquiries",
      h: "Enquiries and the project intake form",
      body: `
      <p>Sending an enquiry, filling in the project intake form or booking a call does not create a contract, an engagement or a client relationship, and does not oblige either of us to go further. We are engaged only when a proposal or statement of work is signed or accepted on behalf of ${E.legalName}.</p>
      <p><strong>Do not send passwords, API keys, private keys, access tokens, payment card numbers, government identification numbers or confidential client or employer records in an enquiry.</strong> Describe the problem and use redacted examples. We handle what you send as our Privacy Policy describes, but until we have signed an agreement with you we take on no duty of confidentiality for business information in an enquiry.</p>
      <p>If you send us ideas, suggestions or feedback that you did not ask us to keep confidential, we may use them without obligation to you. We may independently develop work that resembles an idea you send us.</p>
      <p>You confirm that the information you send is accurate and that you have the right to share it with us.</p>`,
    },
    {
      id: "use",
      h: "Acceptable use",
      body: `
      <p>You agree not to:</p>
      <ul>
        <li>break the law, or infringe anyone's rights, through the websites;</li>
        <li>probe, scan or test the websites or our systems for vulnerabilities, or interfere with or overload them, without our prior written permission;</li>
        <li>send spam, malware or automated submissions through the intake form;</li>
        <li>scrape or copy the websites at scale, or reuse our text, code, designs or media except as these terms allow;</li>
        <li>impersonate anyone or misrepresent your connection with anyone; or</li>
        <li>use the websites to build a competing product or to train an AI model on our content.</li>
      </ul>
      <p>We may block access, reject submissions or report misuse at our discretion. If you find a security issue, report it to ${mail(E.legalEmail)} and give us a reasonable time to fix it before disclosing it.</p>`,
    },
    {
      id: "ip",
      h: "Our content",
      body: `
      <p>The websites and their content — including text, code, designs, graphics, video, the medallion emblem and our names and logos — belong to ${E.legalName} or its licensors and are protected by intellectual property law. You may view the websites and share links to them for your own business evaluation. Any other use needs our written permission.</p>`,
    },
    {
      id: "third-party",
      h: "Other websites and services",
      body: `
      <p>The websites link to and load services run by others, such as the Cal.com booking tool and Google Fonts. Those services are governed by their own terms and privacy policies, and we are not responsible for them, for their content or for their availability.</p>`,
    },
    {
      id: "disclaimer",
      h: "Disclaimer of warranties",
      body: `
      <p class="conspicuous">The websites and all of their content are provided “as is” and “as available”. To the fullest extent permitted by law, ${E.legalName} disclaims all warranties, express or implied, including the implied warranties of merchantability, fitness for a particular purpose, title, non-infringement and accuracy. We do not warrant that the websites will be available, uninterrupted, secure or free of errors or harmful components, or that any information on them is complete or current.</p>`,
    },
    {
      id: "liability",
      h: "Limitation of liability",
      body: `
      <p class="conspicuous">To the fullest extent permitted by law, ${E.legalName} and its members, managers, employees, contractors and agents will not be liable for any indirect, incidental, special, consequential, exemplary or punitive damages, or for any loss of profits, revenue, business, goodwill or data, arising out of or relating to the websites or these terms, and their total liability for all claims arising out of or relating to the websites or these terms will not exceed one hundred U.S. dollars (US$100). These limits apply to every theory of liability, including contract, tort, strict liability and statute, and they apply even if the loss or damage is caused in whole or in part by the negligence of ${E.legalName} or of any of those persons, and even if we were told the loss was possible.</p>
      <p>Nothing in these terms limits liability that cannot be limited under applicable law.</p>`,
    },
    {
      id: "indemnity",
      h: "Your responsibility for misuse",
      body: `
      <p>You will defend, indemnify and hold harmless ${E.legalName} and its members, managers, employees, contractors and agents against any third-party claim, and any resulting loss, liability, cost or expense (including reasonable attorneys' fees), to the extent it arises from your breach of these terms, your misuse of the websites or information you send us that you had no right to send.</p>`,
    },
    {
      id: "law",
      h: "Governing law and disputes",
      body: `
      <p>These terms are governed by the laws of the State of Texas, without regard to its conflict-of-law rules. Any dispute arising out of or relating to the websites or these terms must be brought only in the state courts located in ${E.venue}, or in the United States District Court for the Northern District of Texas, San Angelo Division, and you and we consent to the jurisdiction of and venue in those courts.</p>
      <p class="conspicuous">To the fullest extent permitted by law, you and ${E.legalName} each knowingly and voluntarily waive any right to a trial by jury in any dispute arising out of or relating to the websites or these terms.</p>
      <p>Any claim arising out of or relating to the websites or these terms must be brought within two years after it arises, unless applicable law requires a longer period.</p>`,
    },
    {
      id: "general",
      h: "General",
      body: `
      <p>We may change these terms by posting a new version on this page with a new effective date. The version in effect when you use the websites applies to that use. If any part of these terms is unenforceable, it will be enforced to the extent possible and the rest stays in effect. Our failure to enforce a term is not a waiver of it. You may not assign these terms; we may assign them to a successor to our business. These terms, with the Privacy Policy, are the whole agreement between you and us about the websites.</p>
      <p>Questions about these terms: ${mail(E.legalEmail)}.</p>`,
    },
  ],
});

// ---------------------------------------------------------------- Privacy
const privacy = page({
  slug: "privacy",
  title: "Privacy Policy",
  crumb: "Privacy policy",
  description: `How ${E.legalName} collects, uses and shares personal information through theharnesslab.com, theharnesslab.dev and email.`,
  intro: `<p class="lead">This policy explains how ${E.legalName}, a ${E.kind} (“${E.short}”, “we”, “us”), handles personal information collected through theharnesslab.com, theharnesslab.dev and our business email. Title-Desk and Artificial Landman have their own privacy policies, published on their websites, which govern those services.</p>`,
  sections: [
    {
      id: "collect",
      h: "What we collect",
      body: `
      <p><strong>Information you give us.</strong> When you use the project intake form we receive what you enter: your name, email address and company, and if you choose to provide them, your role, website or repository, the kind of project, urgency, who approves the work, where your systems run, your current tools, a description of the work, what breaks, what success looks like, how access could be arranged and a good time for a call. When you email or call us, we receive your message and contact details. When you book a call, the booking tool passes us your name, email address, the time you chose and anything you write in the booking form.</p>
      <p><strong>Information collected automatically.</strong> Like any website, ours are delivered by hosting providers that receive your IP address, browser and device type, the pages requested and the time of the request, and keep short-term server logs. Our intake service uses your IP address to limit repeated submissions and block abuse. We do not use analytics, advertising cookies, tracking pixels or session-recording tools on these websites, and we do not set cookies of our own.</p>
      <p><strong>Information from third-party services the page loads.</strong> Our pages load fonts from Google Fonts and the Cal.com booking tool from Cal.com. Your browser contacts those providers directly, so they receive your IP address and browser information, and Cal.com may use its own cookies or local storage to run its booking tool. Their privacy policies govern that information.</p>
      <p>The intake form checks your text in your own browser for things that look like passwords or keys and warns you before you send it. Please do not send that kind of information anyway.</p>`,
    },
    {
      id: "use",
      h: "How we use it",
      body: `
      <ul>
        <li>to reply to you, understand your project, prepare a proposal and schedule calls;</li>
        <li>to perform and manage work you engage us for, including invoicing and support;</li>
        <li>to keep our websites and systems secure and to prevent spam and abuse;</li>
        <li>to keep business records and meet our legal, tax and accounting obligations; and</li>
        <li>to establish, exercise or defend legal claims.</li>
      </ul>
      <p>We do not sell personal information, we do not share it for targeted advertising, and we do not use what you send through the intake form to train AI models. We will not add you to a marketing mailing list without your consent, and any marketing email we send will include a way to unsubscribe.</p>`,
    },
    {
      id: "share",
      h: "Who we share it with",
      body: `
      <p>We share personal information only as needed with the service providers that run our business, each for its own role:</p>
      <ul>
        <li>Cloudflare, which runs our intake service;</li>
        <li>Resend, which delivers intake submissions to us by email;</li>
        <li>our email providers (Namecheap Private Email and Google), which host our mailboxes;</li>
        <li>GitHub, which hosts our websites;</li>
        <li>Cal.com, which runs call booking; and</li>
        <li>if you become a client, the payment, accounting and software providers we use to deliver and bill the work.</li>
      </ul>
      <p>We may also disclose information when the law requires it, to protect our rights, property or safety or that of others, or as part of a merger, sale, financing or reorganisation of our business, in which case the information remains subject to this policy's protections. We share information for any other purpose only with your consent.</p>`,
    },
    {
      id: "keep",
      h: "How long we keep it",
      body: `
      <p>We keep personal information for as long as we need it for the purposes above, including the life of any client relationship and the periods our legal, tax and record-keeping obligations require. After that we delete it or keep it in a form that no longer identifies you. Copies in backups are deleted on the backups' normal schedule.</p>`,
    },
    {
      id: "security",
      h: "Security",
      body: `
      <p>We use reasonable administrative, technical and physical safeguards to protect personal information, including encrypted connections and access limited to the people who need it. No method of transmission or storage is completely secure, and we cannot guarantee absolute security. Email in particular is not a secure channel for sensitive information.</p>`,
    },
    {
      id: "choices",
      h: "Your choices and rights",
      body: `
      <p>You can ask us to tell you what personal information we hold about you, to correct it, to give you a copy, or to delete it, and you can opt out of any marketing email. Write to ${mail(E.legalEmail)} with "Privacy request" in the subject line. We may need to confirm your identity before acting, and we may keep information the law requires or allows us to keep.</p>
      <p>Depending on where you live, state privacy laws, including the Texas Data Privacy and Security Act, may give you additional rights. We will respond to requests as those laws require. If we decline a request, you may appeal by replying to our decision with "Appeal" in the subject line, and we will tell you the result of the appeal in writing.</p>`,
    },
    {
      id: "children",
      h: "Children",
      body: `
      <p>Our websites and services are for businesses and adults. They are not directed to children, and we do not knowingly collect personal information from anyone under 18. If you believe a child has sent us personal information, tell us and we will delete it.</p>`,
    },
    {
      id: "location",
      h: "Where information is processed",
      body: `
      <p>We are based in the United States, and our service providers may process information in the United States and other countries. If you contact us from outside the United States, you understand that your information will be processed in the United States.</p>`,
    },
    {
      id: "changes",
      h: "Changes and contact",
      body: `
      <p>We may update this policy by posting a new version on this page with a new effective date. If a change materially affects how we use information we already hold, we will tell you before it applies to that information.</p>
      <p>Privacy questions and requests: ${mail(E.legalEmail)}, or by mail to ${E.legalName}, ${E.noticeAddress}.</p>`,
    },
  ],
});

// ---------------------------------------------------------------- Client terms
const client = page({
  slug: "client-terms",
  title: "Client Services Terms",
  crumb: "Client services terms",
  description: `Standard terms of ${E.legalName}, a ${E.kind}, for custom software, workflow automation, AI systems, website and care-plan work.`,
  intro: `<p class="lead">These terms apply to the custom work ${E.legalName}, a ${E.kind} (“${E.short}”, “we”, “us”), does for a business client (“Client”, “you”): custom software, workflow automation, AI systems and harnesses, websites, integrations, internal tools, audits and ongoing care plans. They form part of every proposal, statement of work, work order, quote and invoice we issue (each an “Order”). An Order and these terms together are the “Agreement”.</p>`,
  sections: [
    {
      id: "agreement",
      h: "How the Agreement is formed",
      body: `
      <p>An Order is accepted, and the Agreement formed, when you sign or accept it in writing, pay any part of it, or ask us to start the work it describes, whichever happens first. The version of these terms in effect on the date of the Order applies to it, unless the Order names a different version.</p>
      <p>If an Order conflicts with these terms, these terms control, except where the Order expressly states that it overrides a named section of these terms. Terms in your purchase orders, vendor forms, portals or emails do not apply, even if we sign or accept them, unless we agree in a signed writing that expressly says so.</p>
      <p>You confirm that you are acquiring the services for business purposes and that the person accepting an Order may bind you.</p>`,
    },
    {
      id: "parties",
      h: "Who the parties are",
      body: `
      <p>${E.legalName} is the only party providing services under the Agreement. Its members, managers, employees, contractors and agents are not parties to it and are not personally liable under it. You agree to bring any claim arising out of or relating to the Agreement or the services only against ${E.legalName}, and not against any of those individuals personally.</p>`,
    },
    {
      id: "services",
      h: "Scope, changes and schedule",
      body: `
      <p>We will perform the services described in the Order. Anything the Order does not list is out of scope. Either of us may propose a change. A change takes effect only when both of us agree to it in writing, including by email, stating what changes and any effect on price, schedule and acceptance criteria.</p>
      <p>Estimates of time, effort and cost are good-faith estimates, not fixed commitments, unless the Order states a fixed fee. Schedules depend on you meeting your responsibilities on time. If you are late, or the work turns out to depend on facts that differ from what you told us, the schedule moves and any extra effort is chargeable as a change.</p>
      <p>We decide how to perform the services, including which tools, AI models and subcontractors to use. We remain responsible for work our subcontractors perform under the Agreement.</p>`,
    },
    {
      id: "client",
      h: "Your responsibilities",
      body: `
      <p>You will:</p>
      <ul>
        <li>give us timely access, information, decisions and feedback, and name a person who can make decisions for you;</li>
        <li>make sure information and materials you give us are accurate and that you have every right, licence and consent needed for us to use them for the work;</li>
        <li>keep your own credentials, API keys and secrets in systems you control, create limited and revocable access for us, and revoke it when the work ends;</li>
        <li>keep current backups of your data and systems before we work on them;</li>
        <li>obtain and pay for any third-party accounts, licences, hosting, AI model usage and other services the work needs, unless the Order says we will; and</li>
        <li>comply with the laws that apply to your business and to your use of anything we deliver, including privacy, consumer-protection, employment, financial and professional-licensing laws, and any duty to tell your own customers that AI or automation is used.</li>
      </ul>
      <p>We are not responsible for delay, failure or cost caused by your failure to meet these responsibilities, by your systems or third-party services, or by instructions you give us.</p>`,
    },
    {
      id: "fees",
      h: "Fees, payment and taxes",
      body: `
      <p>You will pay the fees and expenses in the Order. Unless the Order says otherwise: deposits are due before work starts; invoices are due within fifteen days of the invoice date; and fees are in U.S. dollars. A deposit is earned when we begin work and is not refundable, except as the Order expressly provides.</p>
      <p>Third-party costs we incur for you with your approval, such as software licences, hosting, AI model usage, record copies and travel, are billed at cost in addition to our fees unless the Order includes them.</p>
      <p>If you dispute an invoice, tell us in writing within fifteen days of receiving it, describing the dispute, and pay the undisputed part on time. Undisputed amounts not paid when due bear a late charge of 1.5% per month or the highest rate the law allows, whichever is lower, from the due date until paid. If any amount is more than fifteen days overdue, we may suspend work after giving you written notice. You will reimburse our reasonable costs of collecting overdue amounts, including attorneys' fees.</p>
      <p>Fees do not include taxes. You will pay all sales, use, value-added and similar taxes on the services and deliverables, other than taxes on our net income. If we are required to collect a tax, we will add it to the invoice. Nothing in the Agreement requires either of us to charge, contract for or receive interest above the amount the law allows; any excess is cancelled automatically and, if paid, credited to the principal or refunded.</p>`,
    },
    {
      id: "acceptance",
      h: "Delivery and acceptance",
      body: `
      <p>When we deliver a deliverable, you will review it against the acceptance criteria in the Order. A deliverable is accepted on the earliest of: your written acceptance; your use of it in production or in your business; or ten business days after delivery, unless within that time you give us a written list of the specific ways it fails to meet the acceptance criteria. We will correct those failures and redeliver, and the same review process applies to the corrected deliverable. Minor issues that do not prevent a deliverable from meeting the acceptance criteria do not delay acceptance, and we will correct them in the normal course.</p>`,
    },
    {
      id: "ownership",
      h: "Ownership and licences",
      body: `
      <p><strong>Your materials.</strong> You keep ownership of the data, documents, content, systems and other materials you give us. You grant us a non-exclusive licence to use them only to perform the services.</p>
      <p><strong>Deliverables.</strong> When you have paid in full all fees and expenses due under an Order, we assign to you our rights in the code, configuration, prompts, documentation and other materials we create specifically for you and deliver under that Order (“Client Deliverables”), except our Pre-existing Materials. Until then, you may use Client Deliverables only to evaluate them, and that permission ends if you do not pay.</p>
      <p><strong>Our Pre-existing Materials.</strong> We keep all rights in the software, libraries, frameworks, harnesses, templates, tools, methods, know-how and other materials we owned or developed before or independently of the Order, or develop for general use, including improvements to them (“Pre-existing Materials”). To the extent Pre-existing Materials are built into a Client Deliverable, we grant you, on payment in full, a perpetual, non-exclusive, royalty-free licence to use, copy and modify them as part of that deliverable for your own business. You may not sell, license or distribute Pre-existing Materials on their own.</p>
      <p><strong>Third-party and open-source components.</strong> Components owned by others, including open-source software and AI models and services, are provided under their owners' licences and terms, which you agree to follow.</p>
      <p><strong>General knowledge.</strong> Nothing in the Agreement stops us from using the general skills, ideas and experience we gain, or from doing similar work for others, so long as we do not use your Confidential Information.</p>
      <p><strong>References.</strong> Unless you tell us in writing not to, we may name you as a client and describe the work in general terms that do not disclose your Confidential Information.</p>`,
    },
    {
      id: "ai",
      h: "AI, automation and professional judgement",
      body: `
      <p>Systems that use AI models produce probabilistic output. It can be wrong, incomplete, inconsistent or biased, including when the system is working as designed, and it can change when a model provider changes its model. We design for verification and human review, but we do not guarantee that any AI output is accurate, or that any model, provider, price or feature will remain available. Model providers' own terms apply to their services.</p>
      <p>You are responsible for reviewing outputs, for the decisions you make and actions you take with anything we deliver, and for keeping a qualified person in control of any decision that affects legal rights, money, property, health, employment, credit, housing or insurance. We are not a law firm, title company, abstractor, surveyor, accounting firm or other licensed professional, and nothing we deliver is legal, title, tax, financial or other professional advice or a title opinion. Work in a licensed field must be reviewed by a qualified professional before anyone relies on it.</p>`,
    },
    {
      id: "security",
      h: "Security and data",
      body: `
      <p>We will use reasonable measures to protect your data and access while it is in our possession, use it only to perform the services, and on request at the end of the work return or delete it, except copies we must keep by law and copies in routine backups until they expire. If we learn of unauthorised access to your data in our possession, we will tell you without undue delay and cooperate reasonably in your response.</p>
      <p>You remain responsible for the security of your own systems, accounts and environments, including after handoff. No system is completely secure, and we do not guarantee that any system, including one we build or audit, will be free of vulnerabilities or safe from attack. An audit or review reports on what we examined at that time, by the methods described; it is not a certification.</p>
      <p>If the work involves personal information that you control, you are responsible for having a lawful basis and giving any required notices, and we will process it only on your instructions.</p>`,
    },
    {
      id: "confidentiality",
      h: "Confidentiality",
      body: `
      <p>“Confidential Information” means non-public information one of us discloses to the other in connection with the Agreement that is marked confidential or that a reasonable person would understand to be confidential, including your data and our pricing, methods and Pre-existing Materials. It does not include information that is or becomes public through no fault of the recipient, that the recipient already knew or independently developed, or that it receives lawfully from someone else without a duty of confidence.</p>
      <p>The recipient will use the other's Confidential Information only for the Agreement, protect it with at least reasonable care, and share it only with people and subcontractors who need it for the Agreement and are bound by similar duties. It may disclose Confidential Information when the law requires, after giving notice where lawful. These duties last for three years after the Agreement ends, and for as long as the information remains a trade secret.</p>`,
    },
    {
      id: "warranty",
      h: "Our limited warranty",
      body: `
      <p>We warrant that we will perform the services in a professional and workmanlike manner consistent with generally accepted industry practice. If you tell us in writing within ninety days after a service is performed or a deliverable is delivered that we breached this warranty, describing the breach, we will re-perform the affected services. If we cannot do so within a reasonable time, you may end the affected Order and recover the fees you paid for the non-conforming services. <strong>This is your only remedy, and our only obligation, for breach of this warranty.</strong></p>
      <p>The warranty does not apply to problems caused by your materials, instructions, systems or changes, by third-party services or components, by AI model behaviour, or by use other than as documented.</p>
      <p class="conspicuous">Except for the express warranty in this section, the services and all deliverables are provided “as is”. To the fullest extent permitted by law, ${E.legalName} disclaims all other warranties, express, implied or statutory, including the implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy and good and workmanlike performance beyond the express warranty above, and any warranty arising from a course of dealing or usage of trade. We do not warrant that any deliverable will be error-free, uninterrupted or secure, will achieve any business result, revenue or saving, or that AI output will be accurate.</p>`,
    },
    {
      id: "liability",
      h: "Limitation of liability",
      body: `
      <p class="conspicuous">To the fullest extent permitted by law: (a) neither party will be liable for any indirect, incidental, special, consequential, exemplary or punitive damages, or for any loss of profits, revenue, business, goodwill, data or use, or the cost of substitute services, arising out of or relating to the Agreement or the services; and (b) the total liability of ${E.legalName}, and of its members, managers, employees, contractors and agents together, for all claims arising out of or relating to the Agreement or the services will not exceed the fees you actually paid under the Order giving rise to the claim during the twelve months before the event giving rise to the claim. These limits apply to every theory of liability, including contract, warranty, tort, strict liability and statute, and they apply even if the loss or damage is caused in whole or in part by the negligence of ${E.legalName} or of any of those persons, and even if the possibility of the loss was known. These limits do not apply to your obligation to pay fees, to your indemnity obligations, to either party's infringement or misappropriation of the other's intellectual property, or to liability that cannot be limited under applicable law.</p>
      <p>The fees reflect this allocation of risk, and we would not provide the services without it.</p>`,
    },
    {
      id: "indemnity",
      h: "Your indemnity",
      body: `
      <p class="conspicuous">You will defend, indemnify and hold harmless ${E.legalName} and its members, managers, employees, contractors and agents from and against every third-party claim, demand, suit or proceeding, and every resulting loss, liability, damage, fine, cost and expense, including reasonable attorneys' fees, arising out of or relating to: (a) your materials or data, or our use of them as the Agreement permits; (b) your use, deployment or modification of any deliverable, or any decision or action you or anyone acting for you takes based on a deliverable or its output, including AI output; (c) your instructions, systems or third-party services; (d) your violation of law or of a third party's rights; or (e) your breach of the Agreement. This indemnity applies even if the claim or loss is caused in part by the negligence of ${E.legalName} or of any person indemnified, but it does not apply to the extent a court finally determines the loss was caused by the gross negligence or wilful misconduct of the person seeking indemnity.</p>
      <p>The person seeking indemnity will tell you promptly about the claim, let you control the defence with counsel reasonably acceptable to it, and cooperate at your expense. You may not settle a claim in a way that admits fault by, or imposes an obligation on, an indemnified person without its written consent.</p>`,
    },
    {
      id: "term",
      h: "Term, suspension and termination",
      body: `
      <p>Each Order lasts until its services are complete, unless ended earlier under this section. Care plans and other recurring services renew for successive periods of the same length unless either of us gives notice of non-renewal at least fifteen days before the end of the current period.</p>
      <p>Either of us may end an Order for convenience on fifteen days' written notice. Either of us may end an Order immediately by written notice if the other materially breaches it and does not cure the breach within ten days after written notice, or becomes insolvent or the subject of bankruptcy proceedings. We may suspend services immediately if continuing would break the law, would expose us to liability, or if your systems or use threaten the security of our systems or anyone else's.</p>
      <p>When an Order ends for any reason, you will pay for all services performed and expenses incurred up to the end date, and for any non-cancellable commitments made for you. Deposits remain non-refundable except as the Order provides. The sections on fees, ownership (subject to payment), confidentiality, the warranty disclaimer, limitation of liability, indemnity, disputes and general terms survive.</p>`,
    },
    {
      id: "relationship",
      h: "Independent contractor",
      body: `
      <p>We are an independent contractor. Nothing in the Agreement creates a partnership, joint venture, employment, agency or fiduciary relationship, and neither of us may bind the other. We are responsible for our own taxes, and our personnel are not your employees.</p>`,
    },
    {
      id: "force",
      h: "Events beyond our control",
      body: `
      <p>Neither of us is liable for delay or failure, other than a failure to pay, caused by events beyond its reasonable control, including outages, changes or discontinuance of third-party cloud, hosting, payment or AI model services, internet or power failures, cyberattacks, natural disasters, epidemics, government action, labour disputes and illness or incapacity of key personnel. The affected party will tell the other promptly and resume as soon as it reasonably can.</p>`,
    },
    {
      id: "disputes",
      h: "Governing law and disputes",
      body: `
      <p>The Agreement is governed by the laws of the State of Texas, without regard to its conflict-of-law rules. Before starting a lawsuit, the party with a dispute will give the other written notice describing it, and senior representatives will try in good faith to resolve it for thirty days; either party may seek urgent injunctive relief at any time. Any lawsuit arising out of or relating to the Agreement or the services must be brought only in the state courts located in ${E.venue}, or in the United States District Court for the Northern District of Texas, San Angelo Division, and both parties consent to the jurisdiction of and venue in those courts.</p>
      <p class="conspicuous">Each party knowingly, voluntarily and intentionally waives any right to a trial by jury in any lawsuit arising out of or relating to the Agreement or the services.</p>
      <p>Any claim arising out of or relating to the Agreement or the services must be brought within two years after it arises, unless applicable law requires a longer period. In any lawsuit to enforce the Agreement, the prevailing party may recover its reasonable attorneys' fees and costs.</p>`,
    },
    {
      id: "general",
      h: "General",
      body: `
      <p><strong>Notices.</strong> Legal notices must be in writing and sent by email and by mail or courier to the addresses in the Order; notices to us go to ${mail(E.legalEmail)} and ${E.legalName}, ${E.noticeAddress}. Routine communications may be by email.</p>
      <p><strong>Assignment.</strong> You may not assign the Agreement without our written consent. We may assign it to an affiliate or to a successor to our business.</p>
      <p><strong>Entire agreement and changes.</strong> The Agreement is the whole agreement between us about its subject and replaces all earlier proposals, statements and understandings, including anything on our websites or in our marketing. It may be amended only in a writing that both parties sign or accept. We may update these terms for future Orders by posting a new version; Orders already accepted keep the version that applied to them.</p>
      <p><strong>Other terms.</strong> If any provision is unenforceable, it will be enforced to the maximum extent permitted and the rest of the Agreement stays in effect. A failure or delay in enforcing a provision is not a waiver. There are no third-party beneficiaries, except that our members, managers, employees, contractors and agents may enforce the provisions that protect them. Headings are for convenience. “Including” means “including without limitation”. The Agreement may be signed electronically and in counterparts.</p>
      <p>Questions about these terms: ${mail(E.legalEmail)}.</p>`,
    },
  ],
});

const PAGES = {
  "public/legal/index.html": notice,
  "public/legal/terms/index.html": terms,
  "public/legal/privacy/index.html": privacy,
  "public/legal/client-terms/index.html": client,
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [rel, html] of Object.entries(PAGES)) {
    const out = join(ROOT, rel);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log(`legal: wrote ${rel} (${html.length} bytes)`);
  }
}
