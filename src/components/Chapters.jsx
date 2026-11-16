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
            numeral="VII"
            eyebrow="Ownership"
            id="ownership-title"
            title={
              <>
                You own <em>all of it.</em>
              </>
            }
          >
            <p>
              Remote delivery. Customer-owned code. No hosted secrets. When the work is done,
              the system lives in your accounts, runs on your machines, and comes with
              everything you need to operate it without us.
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
            numeral="VII·B"
            eyebrow="The movement"
            id="how-title"
            title={
              <>
                Four steps. <em>No works-on-my-machine roulette.</em>
              </>
            }
          >
            <p>
              A short discovery loop, one real example, written acceptance criteria, and tests
              you run yourself. That is how remote work stays honest.
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
          numeral="VIII"
          eyebrow="What we build"
          id="capabilities-title"
          title={
            <>
              Start small. Prove it. <em>Then build what matters.</em>
            </>
          }
        >
          <p>
            Every engagement is custom-scoped on a call, around one real workflow and what
            “done” has to mean for your business. Pick the closest fit and we’ll start your
            brief for you.
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
            <span className="chapter-numeral">IX</span>
            <span>Self-taught. Hands-on. Always building.</span>
          </p>
          <h2 id="about-title">
            Hi, I’m Spencer. <em className="gold-text">I build what’s next.</em>
          </h2>
          <p className="founder-lead">
            I’m a completely self-taught builder who learned by turning ambitious ideas into
            working software.
          </p>
          <p>
            I’m Spencer Teague, founder and lead engineer of The Harness Lab. My work includes
            TitleDesk Agent for oil-and-gas title research, BrandStreams for social media
            workflows, and APEX.BUILD, an AI development platform.
          </p>
          <p>
            I build custom applications and AI harnesses that connect powerful models to real
            tools and systems. What interests me most is the work businesses still do by hand:
            the repeated steps, disconnected applications, and hours spent moving information
            around.
          </p>
          <p>
            The Harness Lab is where I turn that experience into software built for your
            business. You work directly with the person building it.
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
          <p className="inscription">The engineering studio</p>
          <h3>
            Meet <span className="gold-text">theharnesslab.dev</span>
          </h3>
          <p>
            The .dev side is where the engineering lives: verification harnesses, release
            gates, primary-source pipelines, and the tools that automate an entire once-manual
            business.
          </p>
        </div>
        <a className="button button-outline" href={DEV_URL} target="_blank" rel="noopener noreferrer">
          Explore theharnesslab.dev <ArrowUpRight aria-hidden="true" />
        </a>
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
            Human ambition. <span className="gold-text">Extraordinary tools.</span>
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

