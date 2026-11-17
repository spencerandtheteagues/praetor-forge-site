import { ArrowRight, ArrowUpRight, CalendarCheck, Github, Mail } from "lucide-react";
import { ChapterHead, Picture } from "./ui.jsx";
import { Brand, CalTrigger } from "./Header.jsx";
import { BUILT_FOR, DELIVERABLES, ENGAGEMENTS, PROCESS } from "../data/narrative.js";
import {
  DEV_URL,
  GITHUB_URL,
  PHONE_DISPLAY,
  SALES_EMAIL,
  SERVICE_PAGES,
  SPENCER_EMAIL,
} from "../data/site.js";
import { goToContact, useIntake } from "../lib/intake.js";

/* ------------------------------------------------------------------------ */
/* VII · Ownership vault + process                                           */
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
            numeral="IX"
            eyebrow="Customer ownership · Zero hostageware"
            id="ownership-title"
            title={
              <>
                You own <em>every damn line.</em>
              </>
            }
          >
            <p>
              Remote delivery. Customer-owned Git repositories. Zero hosted secrets.
              When the build finishes, the software lives in your accounts, runs on
              your machines, and ships with the tests and runbook to operate it
              without us.
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
        </div>
      </section>

      <section className="section process" id="how" aria-labelledby="how-title">
        <span id="process" className="anchor-alias" aria-hidden="true" />
        <div className="container">
          <ChapterHead
            numeral="IX·B"
            eyebrow="How we actually work"
            id="how-title"
            title={
              <>
                Four stages. <em>Zero quit until it passes.</em>
              </>
            }
          >
            <p>
              We tear into your ugliest real workflow, build inside a repo you own,
              hammer every failure mode until real data passes automated smoke tests,
              and hand you the keys.
            </p>
          </ChapterHead>
          <ol className="movement">
            {PROCESS.map((item) => (
              <li key={item.step} className="escapement">
                <div className="escapement-head">
                  <svg className="escapement-wheel" viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx="32" cy="32" r="27" className="escapement-outer-ring" />
                    <circle cx="32" cy="32" r="20" />
                    {Array.from({ length: 15 }, (_, i) => (
                      <path
                        key={i}
                        d="M32 6 L35 12 L29 12 Z"
                        transform={`rotate(${i * 24} 32 32)`}
                      />
                    ))}
                    <circle cx="32" cy="32" r="7" className="arbor-ring" />
                    <circle cx="32" cy="32" r="3.5" className="arbor" />
                  </svg>
                  <span className="escapement-step mono">Stage {item.step}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <p className="escapement-artifact">
                  <span className="mono">Verified artifact</span>
                  <strong>{item.artifact}</strong>
                </p>
              </li>
            ))}
          </ol>
          <div className="built-for" id="who">
            <div className="built-for-head">
              <h3 className="inscription">Built for</h3>
              <p className="mono">Operations where accuracy and ownership matter</p>
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
/* VIII · Capabilities / engagements (no prices — scoped on the call)        */
/* ------------------------------------------------------------------------ */
export function Capabilities() {
  const { prefill } = useIntake();
  return (
    <section className="section capabilities" id="capabilities" aria-labelledby="capabilities-title">
      <span id="services" className="anchor-alias" aria-hidden="true" />
      <div className="container">
        <ChapterHead
          numeral="X"
          eyebrow="What we take on"
          id="capabilities-title"
          title={
            <>
              Tear it down. Prove it. <em>Build it to last.</em>
            </>
          }
        >
          <p>
            Every engagement is custom-scoped directly with Spencer around one real
            bottleneck and what “working in production” actually requires. Pick the
            closest fit to pre-fill your Work Order below.
          </p>
        </ChapterHead>
        <ol className="engagements">
          {ENGAGEMENTS.map((tier, idx) => (
            <li key={tier.name} className={`engagement ${tier.cal ? "engagement--entry" : ""}`}>
              <div className="engagement-top">
                <span className="engagement-numeral" aria-hidden="true">
                  {tier.numeral}
                </span>
                <span className="engagement-tag mono">
                  {tier.cal
                    ? "Entry point · 20 min"
                    : idx === 1
                      ? "Diagnostic wedge"
                      : idx === 5
                        ? "Continuous care"
                        : "Custom build"}
                </span>
              </div>
              <h3>{tier.name}</h3>
              <p>{tier.summary}</p>
              <ul className="engagement-includes">
                {tier.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="engagement-foot">
                <p className="engagement-scope mono">Scoped on the call</p>
                {tier.cal ? (
                  <CalTrigger className="button button-gold button-small engagement-action">
                    <CalendarCheck aria-hidden="true" /> Book the teardown
                  </CalTrigger>
                ) : (
                  <button
                    type="button"
                    className="button button-outline button-small engagement-action"
                    onClick={() => {
                      prefill({ requestType: tier.requestType });
                      goToContact();
                    }}
                  >
                    Scope this <ArrowRight aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="service-pages">
          <div className="service-pages-head">
            <p className="inscription">Go deeper</p>
            <span className="mono">Dedicated practice specifications</span>
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
          <figcaption className="mono">The person behind the build · Spencer Teague</figcaption>
        </figure>
        <div className="founder-copy">
          <p className="chapter-eyebrow">
            <span className="chapter-numeral">XI</span>
            <span>Completely self-taught · 3,850+ commits · Zero quit</span>
          </p>
          <h2 id="about-title">
            Hi, I’m Spencer. <span className="gold-3d">I ground the hard builds out.</span>
          </h2>
          <p className="founder-lead">
            I’m a completely self-taught builder who learned the only way that sticks:
            staying in the chair through every broken build, edge case, and 3 a.m. bug
            until ambitious ideas turn into working production software.
          </p>
          <p>
            I’m Spencer Teague, founder and lead engineer of The Harness Lab. Taking
            TitleDesk Agent from an offline desktop tool to live online county runs on
            Title-Desk and Artificial Landman took 5.5 straight months of non-stop work
            across 1,662 commits and 305+ git branches. Evolving MyAIMediaMgr into
            BrandStreams took even longer — nine architectural generations and 932+
            commits since V8.1 alone — alongside 1,064 commits building APEX.BUILD.
          </p>
          <p>
            Most software projects fail not because the idea was wrong, but because the
            builder quit the third time reality punched the prototype in the mouth. I
            don’t quit. When a courthouse scan is crooked, an index row is missing, or a
            model hallucinates a mineral fraction, I build the harness, the fallback,
            and the verification gate until it works.
          </p>
          <p>
            At The Harness Lab, there is no account-manager telephone game. You work
            directly with the engineer writing, testing, and handing over your system.
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
            <li>
              <a className="text-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Github aria-hidden="true" /> github.com/spencerandtheteagues
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
          alt="The Harness Lab engineering studio emblem in black marble"
          width="1024"
          height="1024"
        />
        <div>
          <p className="inscription">Black marble seal · Engineering foundry</p>
          <h3>
            Meet <span className="gold-3d">theharnesslab.dev</span>
          </h3>
          <p>
            White Carrara marble with gold circuit wires is our flagship{" "}
            <strong>theharnesslab.com</strong> company seal; black Nero Marquina marble
            is <strong>theharnesslab.dev</strong> — our R&amp;D foundry where we built{" "}
            <strong>Perihelion Loop</strong> by fusing{" "}
            <strong>Andrej Karpathy&rsquo;s keep-or-revert loop</strong> and typed DAGs
            with a fail-closed sandbox fabric atop open-source{" "}
            <strong>cloudroom.dev</strong> to create, fix, and no-copy reverse-engineer
            software at verified quality.
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
              <a href={`mailto:${SPENCER_EMAIL}`}>{SPENCER_EMAIL}</a>
            </li>
            <li>
              <span>{PHONE_DISPLAY}</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="inscription">Services</p>
          <ul>
            {SERVICE_PAGES.map((page) => (
              <li key={page.href}>
                <a href={page.href}>{page.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="inscription">Studio</p>
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
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href="#top">Back to top</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 The Harness Lab · theharnesslab.com</span>
        <span>Custom software · AI automation · Intelligent systems</span>
        <span>The first call is for fit and scope — never for credentials.</span>
      </div>
    </footer>
  );
}

