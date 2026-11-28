import { ArrowRight, ArrowUpRight, Mail, Star } from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import Raised from "./Raised.jsx";
import { Brand } from "./Header.jsx";
import { BUILT_FOR, DELIVERABLES, ENGAGEMENTS, PROCESS } from "../data/narrative.js";
import { JAYSON } from "../data/wealth.js";
import { DEV_URL, PHONE_DISPLAY, SALES_EMAIL, SERVICE_PAGES, SPENCER_EMAIL, LEGAL_NAME, SOS_FILE_NO } from "../data/site.js";

/* ------------------------------------------------------------------------ */
/* VII · Ownership vault + streamlined engagement process                    */
/* ------------------------------------------------------------------------ */
export function Ownership() {
  return (
    <>
      <section className="section ownership" id="ownership" aria-labelledby="ownership-title">
        <span id="proof" className="anchor-alias" aria-hidden="true" />
        <span id="outcomes" className="anchor-alias" aria-hidden="true" />
        <div className="vault-plate" aria-hidden="true">
          <Picture
            srcSet="/plates/sovereign-vault-2k.webp 1920w, /plates/sovereign-vault-4k.webp 3840w"
            sizes="100vw"
            fallback="/plates/sovereign-vault-2k.webp"
            alt=""
            width="1920"
            height="1080"
          />
          <svg className="vault-ring" viewBox="0 0 200 200">
            {Array.from({ length: 60 }, (_, i) => (
              <line
                key={i}
                x1="100"
                y1={i % 5 === 0 ? 4 : 7}
                x2="100"
                y2="12"
                transform={`rotate(${i * 6} 100 100)`}
              />
            ))}
          </svg>
        </div>
        <div className="container ownership-inner">
          <ChapterHead
            numeral="VII"
            eyebrow="The products · Who owns the code · Who it's for"
            id="ownership-title"
            title={
              <>
                One product line. <em>Every customer.</em>
              </>
            }
          >
            <p>
              The Harness Lab builds and sells automation products for the oil and
              gas land and mineral title industry. Spencer Teague wrote the software.
              The Harness Lab LLC owns the code and IP. Every customer uses the same
              software, paid per run or by subscription.
            </p>
          </ChapterHead>
          <ol className="deliverables">
            {DELIVERABLES.map(([title, body], i) => (
              <li key={title}>
                <span className="deliverable-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <div className="process-strip" id="how">
            <span id="process" className="anchor-alias" aria-hidden="true" />
            <header className="process-strip-head">
              <p className="inscription">How a run works</p>
              <h3 id="how-title" className="r3d-title r3d-sub">
                <Raised>
                  Four stages. <span className="gold-3d">The same software every time.</span>
                </Raised>
              </h3>
            </header>
            <ol className="process-steps">
              {PROCESS.map((item) => (
                <li key={item.step}>
                  <span className="process-step-num mono">Stage {item.step}</span>
                  <strong>{item.title}</strong>
                  <span className="process-step-body">{item.body}</span>
                  <span className="process-step-artifact mono">{item.artifact}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="built-for" id="who">
            <div className="built-for-head">
              <h3 className="inscription">Who runs it</h3>
              <p className="mono">Oil and gas land and mineral title teams</p>
            </div>
            <ul>
              {BUILT_FOR.map((item, idx) => (
                <li key={item}>
                  <span className="built-for-index mono" aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* VII·B · Capabilities / engagements (no prices — scoped on the call)        */
/* ------------------------------------------------------------------------ */
export function Capabilities() {
  return (
    <section className="section capabilities" id="capabilities" aria-labelledby="capabilities-title">
      <span id="services" className="anchor-alias" aria-hidden="true" />
      <div className="container">
        <ChapterHead
          numeral="VII·B"
          eyebrow="Products for sale"
          id="capabilities-title"
          title={
            <>
              Title-Desk. AI Landman. <em>Artificial Landman.</em>
            </>
          }
        >
          <p>
            Every customer uses the same software, paid per run or by subscription.
            Spencer Teague wrote it. The Harness Lab LLC owns the code and IP.
          </p>
        </ChapterHead>
        <ol className="engagements">
          {ENGAGEMENTS.map((tier) => (
            <li key={tier.name} className="engagement engagement--entry">
              <div className="engagement-top">
                <span className="engagement-numeral" aria-hidden="true">
                  {tier.numeral}
                </span>
                <span className="engagement-tag mono">{tier.tag}</span>
              </div>
              <h3>{tier.name}</h3>
              <p>{tier.summary}</p>
              <ul className="engagement-includes">
                {tier.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="engagement-foot">
                <p className="engagement-scope mono">{tier.note}</p>
                <a
                  className="button button-gold button-small engagement-action"
                  href={tier.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tier.cta} <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ol>
        <div className="service-pages">
          <div className="service-pages-head">
            <p className="inscription">Product notes</p>
            <span className="mono">The same software, explained</span>
          </div>
          <ul>
            {SERVICE_PAGES.map((page, idx) => (
              <li key={page.href}>
                <a className="service-page-card" href={page.href}>
                  <span className="service-page-index mono" aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="service-page-label">{page.label}</span>
                  <ArrowRight aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* IX · Founder + .dev engineering studio                                    */
/* ------------------------------------------------------------------------ */
export function Founder() {
  return (
    <section className="section founder" id="about" aria-labelledby="about-title">
      <span id="studio" className="anchor-alias" aria-hidden="true" />
      <div className="container founder-grid">
        <figure className="founder-portrait">
          <div className="portrait-bezel">
            <Picture
              srcSet="/spencer-teague-640.webp 640w, /spencer-teague.webp 1024w"
              sizes="(min-width: 1024px) 34vw, 86vw"
              fallback="/spencer-teague.jpg"
              alt="Spencer Teague, founder and lead engineer of The Harness Lab"
              width="1024"
              height="1032"
            />
          </div>
          <figcaption className="mono">Spencer Teague · San Angelo, Texas</figcaption>
        </figure>
        <div className="founder-copy">
          <p className="chapter-eyebrow">
            <span className="chapter-numeral">VII·C</span>
            <span>The founder · San Angelo, Texas · Completely self-taught · 3,900+ commits</span>
          </p>
          <h2 id="about-title" className="r3d-title">
            <Raised>
              Hi, I’m Spencer. <span className="gold-3d">I wrote the software.</span>
            </Raised>
          </h2>
          <p className="founder-lead">
            I’m a completely self-taught builder who learned the only way that sticks:
            staying in the chair through every broken build, edge case, and 3 a.m. bug
            until the title products held up on real county records.
          </p>
          <p>
            I’m Spencer Teague, founder of The Harness Lab, in San Angelo, Texas. I
            wrote the software. The Harness Lab LLC owns the code and IP. Taking
            Title-Desk Agent from an offline desktop workstation to live online Texas
            county runs on Title-Desk, Artificial Landman and AI Landman took four
            straight months from August through November 2026 across 1,662 commits and
            305+ git branches. BrandStreams and APEX.BUILD are earlier products: nine
            generations and 1,364 commits for BrandStreams, and five months and 1,064
            commits for APEX.BUILD.
          </p>
          <p>
            When a courthouse scan is crooked, an index row is missing, or a model
            misreads a mineral fraction, the product gets another check until the chain
            of title, the runsheet, the ownership and the net mineral acres hold.
          </p>
          <p>
            Every customer uses that same software, paid per run or by subscription.
            Questions come straight to me at {SPENCER_EMAIL}.
          </p>
          <div className="founder-signoff">
            <span className="signature">Spencer Teague</span>
            <span className="mono">Founder &amp; Lead Engineer</span>
          </div>
          <ul className="founder-links">
            <li>
              <a className="text-link" href={`mailto:${SPENCER_EMAIL}`}>
                <Mail aria-hidden="true" /> {SPENCER_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container studio-band" id="engineering-studio">
        <Picture
          className="studio-emblem"
          srcSet="/brand/harness-lab-black-marble-512.webp 512w, /brand/harness-lab-black-marble.webp 1024w"
          sizes="(min-width: 768px) 220px, 160px"
          fallback="/brand/harness-lab-black-marble.png"
          alt="The Harness Lab engineering foundry emblem in black marble"
          width="1024"
          height="1024"
        />
        <div>
          <p className="inscription">Black marble seal · Engineering foundry</p>
          <h3 className="r3d-title r3d-sub">
            <Raised>
              Meet <span className="gold-3d">theharnesslab.dev</span>
            </Raised>
          </h3>
          <p>
            White Carrara marble with gold circuit wires is our flagship{" "}
            <strong>theharnesslab.com</strong> company seal; black Nero Marquina marble
            is <strong>theharnesslab.dev</strong> — our R&amp;D foundry where we built{" "}
            <strong>Perihelion Loop</strong> by fusing{" "}
            <strong>Andrej Karpathy&rsquo;s keep-or-revert loop</strong> and typed DAGs
            with a fail-closed sandbox fabric atop open-source{" "}
            <strong>cloudroom.dev</strong> to create, fix, and carry out no-copy
            reverse-engineering at verified quality.
          </p>
        </div>
        <div className="studio-band-actions">
          <a
            className="button button-gold button-small"
            href="https://theharnesslab.dev/#perihelion-loop"
            target="_blank"
            rel="noopener noreferrer"
          >
            Perihelion Loop on .dev <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="button button-outline button-small" href={DEV_URL} target="_blank" rel="noopener noreferrer">
            Explore theharnesslab.dev <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* One-line client pull-quote echoed right before the close                  */
/* ------------------------------------------------------------------------ */
export function ClosingQuote() {
  return (
    <section className="closing-quote" aria-label="Review">
      <div className="container">
        <figure className="closing-quote-figure">
          <p className="closing-quote-stars" aria-label="Five out of five stars">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} aria-hidden="true" />
            ))}
          </p>
          <blockquote>
            <p>“Fast, sharp, and it works exactly the way he said it would.”</p>
          </blockquote>
          <figcaption className="mono">
            {JAYSON.name} · {JAYSON.role} · Five-star review
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Footer signature and studio links                                         */
/* ------------------------------------------------------------------------ */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand footer />
          <p>
            We push the edge of possible. <span className="gold-3d">And we never quit.</span>
          </p>
          <ul className="footer-signature" aria-label="The Harness Lab online">
            <li><a href="https://theharnesslab.com/">theharnesslab.com <ArrowUpRight aria-hidden="true" /></a></li>
            <li><a href={DEV_URL} target="_blank" rel="noopener noreferrer">theharnesslab.dev <ArrowUpRight aria-hidden="true" /></a></li>
            <li><a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL} <Mail aria-hidden="true" /></a></li>
          </ul>
        </div>
        <div>
          <p className="inscription">Contact</p>
          <ul>
            <li>
              <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>
            </li>
            <li>
              <span>{PHONE_DISPLAY}</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="inscription">Products</p>
          <ul>
            {SERVICE_PAGES.map((page) => (
              <li key={page.href}>
                <a href={page.href}>{page.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="inscription">Engineering</p>
          <ul>
            <li>
              <a href="#perihelion-loop">Perihelion Loop</a>
            </li>
            <li>
              <a
                href="https://theharnesslab.dev/#perihelion-loop"
                target="_blank"
                rel="noopener noreferrer"
              >
                Perihelion on .dev
              </a>
            </li>
            <li>
              <a href={DEV_URL} target="_blank" rel="noopener noreferrer">
                theharnesslab.dev
              </a>
            </li>
            <li>
              <a href="#top">Back to top</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © 2026 {LEGAL_NAME}, a Texas limited liability company · Texas SOS File No. {SOS_FILE_NO}
        </span>
        <span>Mineral title software · Title-Desk · AI Landman · Artificial Landman</span>
        <span>Every customer uses the same software.</span>
      </div>
      <nav className="container footer-legal" aria-label="Legal">
        <a href="/legal/">Legal notice</a>
        <a href="/legal/terms/">Website terms</a>
        <a href="/legal/privacy/">Privacy policy</a>
        <a href="/legal/client-terms/">Order terms</a>
      </nav>
    </footer>
  );
}

