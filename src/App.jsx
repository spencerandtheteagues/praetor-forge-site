import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronRight,
  Code2,
  FileText,
  Layers3,
  Mail,
  Menu,
  Network,
  Pause,
  Phone,
  Play,
  ScanLine,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const INTAKE_URL =
  "https://harness-lab-intake.theharnesslab.workers.dev/api/intake";
const workflows = [
  {
    name: "Documents",
    input: "A folder full of documents",
    steps: ["Read & extract", "Check the details", "Prepare the report"],
    output: "A report ready for review",
    description:
      "Turn scattered PDFs, scans, and spreadsheets into organized information your team can actually use.",
  },
  {
    name: "Operations",
    input: "A new work request",
    steps: ["Understand the job", "Update your systems", "Prepare the handoff"],
    output: "The next step, already prepared",
    description:
      "Connect the handoffs between your inbox, business software, and team so the same details are entered once.",
  },
  {
    name: "Client work",
    input: "A new client enquiry",
    steps: ["Organize the brief", "Create the project", "Draft the response"],
    output: "A client response ready to approve",
    description:
      "Give every enquiry a clear next step, with the context and draft your team needs to respond.",
  },
];

function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#top"
      aria-label="The Harness Lab home"
    >
      <img src="/hermes-mark.png" width="48" height="48" alt="" />
      <span>
        THE HARNESS LAB<small>APPLIED AI & SOFTWARE ENGINEERING</small>
      </span>
    </a>
  );
}

function SignalField({ paused }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame,
      width = 0,
      height = 0,
      visible = true,
      last = 0;
    const points = Array.from({ length: 64 }, (_, i) => ({
      x: ((i * 73 + 19) % 101) / 101,
      y: ((i * 47 + 7) % 97) / 97,
      size: i % 4 === 0 ? 1.4 : 0.65,
    }));
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const paint = (time = 0) => {
      ctx.clearRect(0, 0, width, height);
      points.forEach((p, i) => {
        const x = p.x * width,
          y = p.y * height + Math.sin(time / 4200 + i) * 8;
        ctx.fillStyle = `rgba(231,191,132,${0.2 + (Math.sin(time / 1700 + i) + 1) * 0.22})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (i % 3 === 0) {
          ctx.strokeStyle = "rgba(231,191,132,0.065)";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 50, y - 24);
          ctx.stroke();
        }
      });
    };
    const tick = (time) => {
      if (visible && !document.hidden && time - last > 45) {
        paint(time);
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      paint();
      if (!paused && !media.matches) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(() => {
      resize();
      paint();
    });
    observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(canvas);
    media.addEventListener("change", restart);
    resize();
    restart();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      media.removeEventListener("change", restart);
    };
  }, [paused]);
  return <canvas className="signal-field" ref={canvasRef} aria-hidden="true" />;
}

function WorkflowDemo() {
  const [selected, setSelected] = useState(0),
    [step, setStep] = useState(-1);
  const timers = useRef([]),
    workflow = workflows[selected];
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const choose = (index) => {
    clearTimers();
    setSelected(index);
    setStep(-1);
  };
  const run = () => {
    clearTimers();
    setStep(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(4);
      return;
    }
    for (let i = 1; i <= 4; i++)
      timers.current.push(setTimeout(() => setStep(i), i * 750));
  };
  return (
    <div className="workflow-demo">
      <div className="demo-top">
        <span className="mono">
          <span className="status-dot" /> WORKFLOW EXPLORER
        </span>
        <span className="demo-label">Interactive example</span>
      </div>
      <div
        className="demo-tabs"
        role="group"
        aria-label="Choose a workflow example"
      >
        {workflows.map((item, i) => (
          <button
            key={item.name}
            aria-pressed={selected === i}
            onClick={() => choose(i)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="flow-track">
        <div className={`flow-end ${step >= 0 ? "active" : ""}`}>
          <FileText aria-hidden="true" />
          <span>START WITH</span>
          <strong>{workflow.input}</strong>
        </div>
        <div className="flow-middle">
          {workflow.steps.map((label, i) => (
            <div
              className={`flow-step ${step > i ? "complete" : ""} ${step === i ? "current" : ""}`}
              key={label}
            >
              <span>
                {step > i ? <Check size={14} /> : <span className="step-dot" />}
              </span>
              {label}
              <ChevronRight size={15} aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className={`flow-end result ${step === 4 ? "active" : ""}`}>
          <CheckCheck aria-hidden="true" />
          <span>FINISH WITH</span>
          <strong>{workflow.output}</strong>
        </div>
      </div>
      <div className="demo-bottom">
        <p>{workflow.description}</p>
        <button
          className="button button-small"
          onClick={run}
          disabled={step >= 0 && step < 4}
        >
          {step >= 0 && step < 4 ? (
            <>
              <span className="small-spinner" /> Running example
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />{" "}
              {step === 4 ? "Replay example" : "Run example"}
            </>
          )}
        </button>
      </div>
      <p className="demo-announcement" role="status">
        {step === 4
          ? "Example complete. The result is ready for a person to review."
          : "Illustrates a possible workflow. No files are processed or systems connected."}
      </p>
    </div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [request, setRequest] = useState({
    name: "",
    email: "",
    company: "",
    requestType: "Workflow automation",
    desiredWorkflow: "",
    hp: "",
  });
  const update = (e) =>
    setRequest({ ...request, [e.target.name]: e.target.value });
  const mailto = `mailto:sales@theharnesslab.com?subject=${encodeURIComponent(`Project enquiry: ${request.requestType}`)}&body=${encodeURIComponent(`Name: ${request.name}\nEmail: ${request.email}\nCompany: ${request.company}\n\n${request.desiredWorkflow}`)}`;
  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch(INTAKE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(15000),
      });
      const body = await res.json();
      if (!res.ok || body.ok !== true) throw new Error("Request not confirmed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };
  if (status === "sent")
    return (
      <div className="form-success" role="status">
        <span>
          <Check size={32} />
        </span>
        <h3>Your project is on our radar.</h3>
        <p>
          Thanks for reaching out. We’ll follow up at{" "}
          <strong>{request.email}</strong> to talk through the next step.
        </p>
        <button
          className="text-link"
          onClick={() => {
            setStatus("idle");
            setRequest({ ...request, desiredWorkflow: "" });
          }}
        >
          Share another idea <ArrowRight size={16} />
        </button>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={submit}>
      <h3>What would you like to build?</h3>
      <div className="form-pair">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            value={request.name}
            onChange={update}
            placeholder="Your name"
          />
        </label>
        <label>
          Work email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={160}
            value={request.email}
            onChange={update}
            placeholder="you@company.com"
          />
        </label>
      </div>
      <div className="form-pair">
        <label>
          Company <span className="optional">(optional)</span>
          <input
            name="company"
            autoComplete="organization"
            maxLength={160}
            value={request.company}
            onChange={update}
            placeholder="Company name"
          />
        </label>
        <label>
          I’m interested in
          <select
            name="requestType"
            value={request.requestType}
            onChange={update}
          >
            <option>Workflow automation</option>
            <option>A website or full-stack app</option>
            <option>An AI harness</option>
            <option>Let’s explore an idea</option>
          </select>
        </label>
      </div>
      <label>
        The idea, the bottleneck, or the big ambition
        <textarea
          name="desiredWorkflow"
          required
          rows={4}
          maxLength={700}
          value={request.desiredWorkflow}
          onChange={update}
          placeholder="What does your team do manually today? What would you love your software to do?"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this empty
          <input
            name="hp"
            tabIndex={-1}
            autoComplete="off"
            value={request.hp}
            onChange={update}
          />
        </label>
      </div>
      <button
        className="button button-gold"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending"
          ? "Sending your enquiry…"
          : "Let’s talk about your project"}
        <ArrowUpRight size={18} />
      </button>
      <p className="form-note">
        This sends your details to The Harness Lab so we can reply. Please leave
        out passwords and confidential records.
      </p>
      {status === "error" && (
        <div className="form-error" role="alert">
          We couldn’t confirm delivery. Your details are still here.{" "}
          <a href={mailto}>Open this enquiry in your email app</a>, or call{" "}
          <a href="tel:+16073647772">607-364-7772</a>.
        </div>
      )}
    </form>
  );
}

function ImagePreview({ image, close }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current,
      previous = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="image-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      aria-label={image.alt}
    >
      <button className="dialog-close" onClick={close} aria-label="Close image">
        <X />
      </button>
      <img src={image.src} alt={image.alt} />
      <p>{image.alt}</p>
    </dialog>
  );
}

function App() {
  const menuButtonRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false),
    [paused, setPaused] = useState(false),
    [preview, setPreview] = useState(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const showImage = (src, alt) => setPreview({ src, alt });
  return (
    <div className={`site ${paused ? "motion-paused" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <button
            ref={menuButtonRef}
            className="menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-controls="main-nav"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav
            id="main-nav"
            className={menuOpen ? "nav-open" : ""}
            aria-label="Main navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }
            }}
          >
            <a href="#capabilities" onClick={() => setMenuOpen(false)}>
              What we build
            </a>
            <a href="#work" onClick={() => setMenuOpen(false)}>
              Our work
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              The founder
            </a>
            <a
              className="nav-cta"
              href="#contact"
              onClick={() => setMenuOpen(false)}
            >
              Let’s build <ArrowUpRight size={16} />
            </a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="hero" id="top">
          <SignalField paused={paused} />
          <div className="hero-grid container">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" /> ENGINEERED FOR WHAT’S NEXT
              </div>
              <h1>
                Move beyond
                <br />
                <span className="serif-accent">manual.</span>
              </h1>
              <p className="hero-description">
                Your people have better things to do.
                <br />
                We build the software that gives them time to do it.
              </p>
              <p className="hero-detail">
                AI workflow automation, ambitious websites, full-stack
                applications, and intelligent systems. Built around your
                business. Built to do real work.
              </p>
              <div className="hero-actions">
                <a className="button button-gold" href="#contact">
                  Build what’s next <ArrowUpRight size={19} />
                </a>
                <a className="button button-ghost" href="#work">
                  See our work <ArrowDown size={17} />
                </a>
              </div>
              <div className="hero-footnote">
                <span className="little-line" /> FROM THE BUILDERS OF{" "}
                <a href="#titledesk">
                  TITLEDESK AGENT <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
            <div
              className="hero-art"
              aria-label="The Harness Lab winged emblem surrounded by animated orbital paths"
            >
              <div className="orbital-grid" aria-hidden="true" />
              <div className="orbit orbit-one" aria-hidden="true">
                <i />
              </div>
              <div className="orbit orbit-two" aria-hidden="true">
                <i />
              </div>
              <div className="orbit orbit-three" aria-hidden="true" />
              <div className="emblem-halo" />
              <img
                className="hero-emblem"
                src="/advancedhermes-hero-round.png"
                alt="The Harness Lab winged emblem"
                width="900"
                height="900"
                fetchPriority="high"
              />
              <div className="orbit-label orbit-label-top">
                <span className="label-icon">
                  <Network size={16} />
                </span>
                <span>
                  INTELLIGENCE<span>Connected to your world</span>
                </span>
              </div>
              <div className="orbit-label orbit-label-bottom">
                <span className="label-icon">
                  <Layers3 size={16} />
                </span>
                <span>
                  IDEA → WORKING SYSTEM
                  <span>Engineered by The Harness Lab</span>
                </span>
              </div>
              <span className="art-coordinate mono" aria-hidden="true">
                H / L &nbsp; · &nbsp; APPLIED INTELLIGENCE
              </span>
            </div>
          </div>
          <div className="hero-bottom container">
            <span>HUMAN AMBITION. MACHINE CAPABILITY.</span>
            <button
              className="motion-control"
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? "Resume motion" : "Pause motion"}
            </button>
            <a href="#capabilities" aria-label="Explore what we build">
              <ArrowDown size={17} />
            </a>
          </div>
        </section>

        <section className="capabilities section container" id="capabilities">
          <div className="section-intro reveal">
            <div>
              <p className="eyebrow">WHAT WE BUILD</p>
              <h2>
                Less busywork.
                <br />
                More <span className="text-gold">possibility.</span>
              </h2>
            </div>
            <p>
              The next advantage for your business is software that understands
              the work. We connect capable AI to the tools, information, and
              processes your team uses every day.
            </p>
          </div>
          <div className="capability-grid">
            <article className="capability reveal">
              <div className="capability-art art-workflow" aria-hidden="true">
                <div className="mini-doc doc-back" />
                <div className="mini-doc doc-front">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="mini-path" />
                <span className="mini-result">
                  <CheckCheck />
                </span>
              </div>
              <span className="capability-label">GIVE YOUR TEAM TIME BACK</span>
              <h3>Workflow automation</h3>
              <p>
                Turn repetitive digital tasks into connected workflows. Read
                documents, move information between systems, prepare reports,
                and keep work moving.
              </p>
              <div className="capability-tags">
                <span>Documents & data</span>
                <span>Business operations</span>
              </div>
              <a className="text-link" href="#workflow">
                Explore a workflow <ArrowRight size={16} />
              </a>
            </article>
            <article className="capability reveal">
              <div className="capability-art art-app" aria-hidden="true">
                <div className="mini-browser">
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>
                  <span />
                  <section>
                    <i />
                    <i />
                    <i />
                  </section>
                </div>
                <span className="code-badge">
                  <Code2 size={24} />
                </span>
              </div>
              <span className="capability-label">
                BUILD SOMETHING AMBITIOUS
              </span>
              <h3>Websites & full-stack apps</h3>
              <p>
                Distinctive websites and serious business applications. Customer
                portals, dashboards, databases, payments, and integrations,
                designed as one complete experience.
              </p>
              <div className="capability-tags">
                <span>Custom platforms</span>
                <span>End-to-end builds</span>
              </div>
              <a className="text-link" href="#contact">
                Tell us your idea <ArrowRight size={16} />
              </a>
            </article>
            <article className="capability reveal">
              <div className="capability-art art-harness" aria-hidden="true">
                <div className="harness-ring" />
                <div className="harness-center">
                  <Network size={30} />
                </div>
                <i className="harness-node node-a" />
                <i className="harness-node node-b" />
                <i className="harness-node node-c" />
              </div>
              <span className="capability-label">PUT INTELLIGENCE TO WORK</span>
              <h3>AI harnesses & systems</h3>
              <p>
                The software that lets AI use tools and take action. Connect
                agents to browsers, applications, and infrastructure, with clear
                permissions and human control.
              </p>
              <div className="capability-tags">
                <span>Agents & tools</span>
                <span>System orchestration</span>
              </div>
              <a className="text-link" href="#how">
                See how we build <ArrowRight size={16} />
              </a>
            </article>
          </div>
        </section>

        <section className="workflow-section section" id="workflow">
          <div className="container">
            <div className="workflow-heading reveal">
              <p className="eyebrow">FROM REPETITION TO MOMENTUM</p>
              <h2>
                Imagine the work
                <br />
                already <span className="text-gold">moving.</span>
              </h2>
              <p>
                Choose an example. See how a manual process becomes a connected
                workflow, with your team in control of the result.
              </p>
            </div>
            <div className="reveal">
              <WorkflowDemo />
            </div>
            <div className="workflow-principles">
              <span>
                <ScanLine size={17} /> Built around your process
              </span>
              <span>
                <Network size={17} /> Connected to your tools
              </span>
              <span>
                <ShieldCheck size={17} /> People at the decision points
              </span>
            </div>
          </div>
        </section>

        <section className="work section container" id="work">
          <div className="section-intro reveal">
            <div>
              <p className="eyebrow">BUILT BY THE HARNESS LAB</p>
              <h2>
                Real tools.
                <br />
                <span className="text-gold">Real ambition.</span>
              </h2>
            </div>
            <p>
              Specialized work deserves specialized software. Here are examples
              of what happens when we build around the way someone actually
              works.
            </p>
          </div>
          <article className="project project-titledesk reveal" id="titledesk">
            <div className="project-content">
              <div className="project-kicker">
                <span className="status-dot" /> FEATURED PRODUCT{" "}
                <span>OIL & GAS</span>
              </div>
              <img
                className="titledesk-logo"
                src="/projects/titledesk-logo.webp"
                alt="TitleDesk Agent"
                width="240"
                height="128"
                loading="lazy"
              />
              <h3>
                From stacks of records
                <br />
                to structured research.
              </h3>
              <p>
                TitleDesk Agent brings document reading, title research, and
                report preparation into a desktop workspace for landmen and
                oil-and-gas teams.
              </p>
              <p>
                It is the kind of tool we build: focused on a demanding
                real-world process, helping professionals spend less time
                handling files and more time on the decisions that need them.
              </p>
              <ul className="project-features">
                <li>
                  <Check size={15} /> Local document reading and OCR
                </li>
                <li>
                  <Check size={15} /> Organized, source-linked research
                </li>
                <li>
                  <Check size={15} /> Runsheets and report preparation
                </li>
              </ul>
              <a
                className="button button-gold"
                href="https://title-desk.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore TitleDesk Agent <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="project-visual">
              <div className="window-bar">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <span>TITLEDESK AGENT / WORKSPACE</span>
                <span />
              </div>
              <button
                className="screenshot-button"
                onClick={() =>
                  showImage(
                    "/projects/titledesk-runsheet.webp",
                    "TitleDesk Agent — the runsheet workspace",
                  )
                }
                aria-label="Enlarge TitleDesk Agent screenshot"
              >
                <img
                  src="/projects/titledesk-runsheet.webp"
                  width="1440"
                  height="900"
                  alt="TitleDesk Agent runsheet workspace with source-linked records"
                  loading="lazy"
                />
                <span className="image-expand">
                  <ScanLine size={15} /> Explore the workspace
                </span>
              </button>
              <div className="project-visual-footer">
                <FileText size={15} /> COMPLEX RECORDS <ArrowRight size={16} />{" "}
                CLEARER WORK
              </div>
            </div>
          </article>
          <article className="project project-investor reveal" id="case-study">
            <div className="investor-visual">
              <div className="window-bar">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <span>WEALTH & POWERS OS</span>
                <span />
              </div>
              <button
                className="screenshot-button"
                onClick={() =>
                  showImage(
                    "/case-studies/jayson/screen-4.jpg",
                    "Wealth & Powers OS — investor command center",
                  )
                }
                aria-label="Enlarge investor command center screenshot"
              >
                <img
                  src="/case-studies/jayson/screen-4.jpg"
                  width="1512"
                  height="807"
                  alt="Wealth & Powers OS investor command center"
                  loading="lazy"
                />
                <span className="image-expand">
                  <ScanLine size={15} /> View command center
                </span>
              </button>
              <div className="investor-thumbnails">
                {[
                  ["screen-9.jpg", "Research workspace"],
                  ["screen-6.jpg", "Stock portfolio workspace"],
                  ["screen-10.jpg", "Real estate search workspace"],
                ].map(([file, label]) => (
                  <button
                    key={file}
                    onClick={() =>
                      showImage(
                        `/case-studies/jayson/${file}`,
                        `Wealth & Powers OS — ${label.toLowerCase()}`,
                      )
                    }
                    aria-label={`Enlarge ${label.toLowerCase()}`}
                  >
                    <img
                      src={`/case-studies/jayson/${file}`}
                      alt={label}
                      loading="lazy"
                      width="1512"
                      height="807"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="project-content">
              <div className="project-kicker">
                CLIENT BUILD <span>CUSTOM AI HARNESS</span>
              </div>
              <h3>
                One investor.
                <br />
                One command center.
              </h3>
              <p>
                For private investor Jayson Powers, we built{" "}
                <strong>Wealth & Powers OS</strong>: a custom workspace that
                brings portfolio information, research, and specialized AI tools
                together.
              </p>
              <p>
                The system connects multiple agents and tools around one
                person’s workflow, with review and approval at consequential
                decision points.
              </p>
              <div className="capability-tags">
                <span>Research</span>
                <span>Portfolio visibility</span>
                <span>Human approval</span>
              </div>
              <blockquote>
                “Fast, sharp, and it works exactly the way he said it would.”
                <footer>
                  <img
                    src="/case-studies/jayson/jayson-powers.jpg"
                    alt=""
                    width="38"
                    height="38"
                    loading="lazy"
                  />
                  <span>
                    <strong>Jayson Powers</strong>
                    <small>Private investor · Client testimonial</small>
                  </span>
                </footer>
              </blockquote>
            </div>
          </article>
          <div className="more-work reveal">
            <div className="more-work-heading">
              <span className="eyebrow">MORE FROM THE BUILDER</span>
              <a
                className="text-link"
                href="https://github.com/spencerandtheteagues"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore GitHub <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="more-work-grid">
              <a
                href="https://brandstream.my"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="project-symbol">
                  <Layers3 size={24} />
                </span>
                <div>
                  <span className="capability-label">
                    SOCIAL MEDIA SOFTWARE
                  </span>
                  <h3>BrandStreams</h3>
                  <p>
                    A platform for planning campaigns, creating content, and
                    managing social media workflows.
                  </p>
                  <span className="project-domain">
                    brandstream.my <ArrowUpRight size={13} />
                  </span>
                </div>
              </a>
              <a
                href="https://github.com/spencerandtheteagues/apex-build-platform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="project-symbol">
                  <Code2 size={24} />
                </span>
                <div>
                  <span className="capability-label">
                    AI DEVELOPMENT PLATFORM
                  </span>
                  <h3>APEX.BUILD</h3>
                  <p>
                    A cloud development environment exploring coordinated AI
                    agents, code generation, and model routing.
                  </p>
                  <span className="project-domain">
                    apex-build.dev · View project on GitHub{" "}
                    <ArrowUpRight size={13} />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section className="possibility-band">
          <div className="container reveal">
            <Sparkles size={27} aria-hidden="true" />
            <p>
              AI can now read, reason, write, and use software.
              <br />
              <strong>The opportunity is what you build around it.</strong>
            </p>
            <a
              href="#contact"
              aria-label="Discuss what AI could do for your business"
            >
              <ArrowUpRight size={32} />
            </a>
          </div>
        </section>
        <section className="process section container" id="how">
          <div className="section-intro reveal">
            <div>
              <p className="eyebrow">
                POWERFUL TECHNOLOGY. PRACTICAL DELIVERY.
              </p>
              <h2>
                From “what if”
                <br />
                to <span className="text-gold">working.</span>
              </h2>
            </div>
            <p>
              We start with the work you want to improve. Then we design, build,
              and test a system against that job, with a clear path from first
              conversation to everyday use.
            </p>
          </div>
          <div className="process-grid">
            {[
              [
                "01",
                "Understand the work",
                "Walk us through the process, the friction, and the outcome you want. We find the part worth automating.",
              ],
              [
                "02",
                "Build the right system",
                "We connect the software, models, and tools around a clear scope. You see the work taking shape.",
              ],
              [
                "03",
                "Prove it. Put it to work.",
                "We test real scenarios, define review points, and hand over a system your team can understand and operate.",
              ],
            ].map(([number, title, body]) => (
              <article className="reveal" key={number}>
                <span className="process-number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="founder section container" id="about">
          <div className="founder-photo reveal">
            <img
              src="/spencer-teague.jpg"
              alt="Spencer Teague, founder of The Harness Lab"
              width="1024"
              height="1032"
              loading="lazy"
            />
            <div className="portrait-caption">
              <span>THE PERSON BEHIND THE BUILD</span>
              <span>SPENCER TEAGUE</span>
            </div>
          </div>
          <div className="founder-copy reveal">
            <p className="eyebrow">SELF-TAUGHT. HANDS-ON. ALWAYS BUILDING.</p>
            <h2>
              Hi, I’m Spencer.
              <br />
              <span className="text-gold">I build what’s next.</span>
            </h2>
            <p className="founder-lead">
              I’m a completely self-taught builder who learned by turning
              ambitious ideas into working software.
            </p>
            <p>
              I’m Spencer Teague, founder and lead engineer of The Harness Lab.
              My work includes TitleDesk Agent for oil-and-gas title research,
              BrandStreams for social media workflows, and APEX.BUILD, an AI
              development platform.
            </p>
            <p>
              I build custom applications and AI harnesses that connect powerful
              models to real tools and systems. What interests me most is the
              work businesses still do by hand: the repeated steps, disconnected
              applications, and hours spent moving information around.
            </p>
            <p>
              The Harness Lab is where I turn that experience into software
              built for your business. You work directly with the person
              building it.
            </p>
            <div className="founder-signoff">
              <span>
                Spencer Teague<small>FOUNDER & LEAD ENGINEER</small>
              </span>
              <a
                href="mailto:spencer@theharnesslab.com"
                aria-label="Email Spencer"
              >
                <ArrowUpRight size={23} />
              </a>
            </div>
          </div>
        </section>
        <section className="contact section" id="contact">
          <div className="container contact-grid">
            <div className="contact-copy reveal">
              <p className="eyebrow">
                <span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE
              </p>
              <h2>
                Bring the idea.
                <br />
                Bring the <span className="text-gold">bottleneck.</span>
              </h2>
              <p>
                You don’t need a technical specification. Tell us what you’re
                trying to do, what’s slowing you down, or what you wish existed.
              </p>
              <div className="contact-links">
                <a href="tel:+16073647772">
                  <Phone size={20} />
                  <span>
                    <small>LET’S TALK</small>607-364-7772
                  </span>
                  <ArrowUpRight size={19} />
                </a>
                <a href="mailto:sales@theharnesslab.com">
                  <Mail size={20} />
                  <span>
                    <small>PROJECT ENQUIRIES</small>sales@theharnesslab.com
                  </span>
                  <ArrowUpRight size={19} />
                </a>
                <a href="mailto:spencer@theharnesslab.com">
                  <Mail size={20} />
                  <span>
                    <small>DIRECT TO SPENCER</small>spencer@theharnesslab.com
                  </span>
                  <ArrowUpRight size={19} />
                </a>
              </div>
            </div>
            <div className="reveal">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <div className="footer-top">
          <Brand footer />
          <p>
            Human ambition.
            <br />
            <span>Extraordinary tools.</span>
          </p>
          <a href="#top" className="back-top">
            Back to top <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} The Harness Lab</span>
          <span>Custom software · AI automation · Intelligent systems</span>
          <a href="https://theharnesslab.dev/">
            theharnesslab.dev <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
      {preview && (
        <ImagePreview image={preview} close={() => setPreview(null)} />
      )}
    </div>
  );
}
export default App;
