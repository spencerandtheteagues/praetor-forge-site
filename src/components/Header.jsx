import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarCheck, Menu, X } from "lucide-react";
import { CALENDAR_URL, CAL_LINK, CAL_NAMESPACE } from "../data/site.js";

const NAV = [
  { href: "#timeline", numeral: "II", label: "Timeline", ids: ["timeline"] },
  { href: "#trenches", numeral: "III", label: "The grind", ids: ["trenches"] },
  { href: "#cinema", numeral: "IV", label: "Cinema", ids: ["cinema"] },
  { href: "#work", numeral: "V", label: "Our work", ids: ["work"] },
  { href: "#method", numeral: "VI", label: "Method", ids: ["method"] },
  { href: "#our-os", numeral: "VII", label: "Cockpits", ids: ["our-os", "case-study"] },
  { href: "#capabilities", numeral: "IX", label: "Capabilities", ids: ["ownership", "how", "capabilities"] },
  { href: "#about", numeral: "X", label: "The founder", ids: ["about"] },
];

// Cal.com triggers: a real link to the booking page that the deferred embed
// upgrades into a modal once it has loaded (see index.html).
export function CalTrigger({ className = "button button-outline", children, label }) {
  return (
    <a
      className={className}
      href={CALENDAR_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-cal-namespace={CAL_NAMESPACE}
      data-cal-link={CAL_LINK}
      data-cal-config='{"layout":"month_view"}'
      aria-label={label}
      onClick={(e) => {
        if (typeof window !== "undefined" && window.__calReady) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}

export function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? "brand--footer" : ""}`}
      href="#top"
      aria-label="The Harness Lab home"
    >
      <img
        className="brand-emblem"
        src="/brand/harness-lab-copper-marble-512.webp"
        width="512"
        height="512"
        alt=""
      />
      <img
        className="brand-wordmark"
        src="/products/harness-lab-wordmark-640.webp"
        width="640"
        height="90"
        alt=""
      />
    </a>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeHref, setActiveHref] = useState("");
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, y / maxScroll)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const idToHref = new Map();
    NAV.forEach((item) => {
      item.ids.forEach((id) => idToHref.set(id, item.href));
    });
    const visibleIds = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) visibleIds.add(id);
          else visibleIds.delete(id);
        });
        let found = "";
        for (const item of NAV) {
          if (item.ids.some((id) => visibleIds.has(id))) {
            found = item.href;
            break;
          }
        }
        setActiveHref(found);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: 0 },
    );
    idToHref.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}
      style={{ "--scroll-progress": progress.toFixed(4) }}
    >
      <div className="header-inner">
        <Brand />
        <button
          ref={toggleRef}
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-controls="main-nav"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-nav" className={open ? "nav-open" : ""} aria-label="Main navigation">
          <ol className="nav-list">
            {NAV.map((item) => {
              const isCurrent = activeHref === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={isCurrent ? "is-active" : undefined}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={close}
                  >
                    <span className="nav-numeral" aria-hidden="true">
                      {item.numeral}
                    </span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ol>
          <div className="nav-actions">
            <CalTrigger className="button button-outline button-small nav-cal">
              <CalendarCheck aria-hidden="true" /> Book a teardown
            </CalTrigger>
            <a className="button button-gold button-small nav-cta" href="#contact" onClick={close}>
              Let’s build <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
