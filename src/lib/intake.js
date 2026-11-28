import { createContext, useCallback, useContext, useState } from "react";
import { DEFAULT_REQUEST_TYPE } from "../data/site.js";

// Field keys mirror intake-worker/src/index.ts FIELDS (+ problems, hp).
// Max lengths equal the Worker's clip limits so nothing is silently truncated.
// There is deliberately NO `budget` key (verify-redesign.mjs asserts its absence).
export const FIELD_LIMITS = {
  name: 120,
  email: 160,
  company: 160,
  role: 120,
  website: 200,
  requestType: 80,
  urgency: 60,
  callWindow: 160,
  approvalPath: 80,
  infrastructure: 300,
  currentStack: 500,
  desiredWorkflow: 700,
  failureDetails: 700,
  successCriteria: 500,
  accessPlan: 400,
};

export const EMPTY_REQUEST = {
  name: "",
  email: "",
  company: "",
  requestType: DEFAULT_REQUEST_TYPE,
  desiredWorkflow: "",
  role: "",
  website: "",
  urgency: "",
  approvalPath: "",
  infrastructure: "",
  currentStack: "",
  problems: [],
  failureDetails: "",
  successCriteria: "",
  accessPlan: "",
  callWindow: "",
  hp: "",
};

const STORAGE_KEY = "hl-contact-prefill";

function rememberContact(request) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(request));
  } catch {
    /* private mode */
  }
}

export function takeRememberedContact() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export const IntakeContext = createContext(null);

export function useIntake() {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error("useIntake must be used inside IntakeContext");
  return ctx;
}

// Owned by App; provided to every section so products, tiers and the fault
// ledger can prefill the contact form ("closed loop").
export function useIntakeState() {
  const [request, setRequest] = useState(EMPTY_REQUEST);
  const [pulse, setPulse] = useState(0); // increments on every external prefill

  const update = useCallback((key, value) => {
    setRequest((r) => {
      const next = { ...r, [key]: value };
      rememberContact(next);
      return next;
    });
  }, []);

  const toggleProblem = useCallback((problem) => {
    setRequest((r) => {
      const next = {
        ...r,
        problems: r.problems.includes(problem)
          ? r.problems.filter((p) => p !== problem)
          : [...r.problems, problem],
      };
      rememberContact(next);
      return next;
    });
    setPulse((n) => n + 1);
  }, []);

  // prefill({ requestType, product, note }) — product context is written into
  // desiredWorkflow because the Worker drops unknown keys.
  const prefill = useCallback(({ requestType, product, note } = {}) => {
    setRequest((r) => {
      const next = { ...r };
      if (requestType) next.requestType = requestType;
      const prefix = product ? `Product interest: ${product} — ` : note || "";
      if (prefix && !r.desiredWorkflow.startsWith(prefix)) {
        next.desiredWorkflow = (prefix + r.desiredWorkflow).slice(
          0,
          FIELD_LIMITS.desiredWorkflow,
        );
      }
      rememberContact(next);
      return next;
    });
    setPulse((n) => n + 1);
  }, []);

  const reset = useCallback((keep = {}) => {
    setRequest({ ...EMPTY_REQUEST, ...keep });
  }, []);

  return { request, setRequest, update, toggleProblem, prefill, reset, pulse };
}

// Scroll to the contact cockpit and focus the name field once the scroll lands.
export function goToContact() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/contact") {
    window.location.assign("/contact/");
    return;
  }
  const target = document.getElementById("contact");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    document.getElementById("field-name")?.focus({ preventScroll: true });
  }, 700);
}
