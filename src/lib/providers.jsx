import { useMemo, useState } from "react";
import { MotionContext, usePrefersReducedMotion } from "./motion.js";
import { IntakeContext, useIntakeState } from "./intake.js";

// State lives in these providers (not in App) so typing in the contact form or
// toggling motion re-renders only context consumers, not the whole page.
export function MotionProvider({ children }) {
  const [paused, setPaused] = useState(false);
  const [cinemaPlaying, setCinemaPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const value = useMemo(
    () => ({ paused, setPaused, reduced, cinemaPlaying, setCinemaPlaying }),
    [paused, reduced, cinemaPlaying],
  );
  return (
    <MotionContext.Provider value={value}>
      <MotionShell paused={paused}>{children}</MotionShell>
    </MotionContext.Provider>
  );
}

function MotionShell({ paused, children }) {
  return <div className={`site ${paused ? "motion-paused" : ""}`}>{children}</div>;
}

export function IntakeProvider({ children }) {
  const state = useIntakeState();
  const { request, setRequest, update, toggleProblem, prefill, reset, pulse } = state;
  const value = useMemo(
    () => ({ request, setRequest, update, toggleProblem, prefill, reset, pulse }),
    [request, setRequest, update, toggleProblem, prefill, reset, pulse],
  );
  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
}
