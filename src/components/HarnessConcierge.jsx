import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SALES_EMAIL, TITLE_DESK_URL, VOICE_SESSION_URL } from "../data/site.js";
import { goToContact, useIntake } from "../lib/intake.js";

const WORKLET_PATHS = {
  rawAudioProcessor: "/voice/worklets/rawAudioProcessor.js",
  audioConcatProcessor: "/voice/worklets/audioConcatProcessor.js",
};
const LIBSAMPLERATE_PATH = "/voice/worklets/libsamplerate.worklet.js";

const SECTION_ANCHORS = {
  harnesses: "harnesses",
  cinema: "cinema",
  forge: "forge",
  wealth: "case-study",
  contact: "contact",
};

function base64ToUint8Array(base64) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function loadPublicModule(relPath) {
  const href = new URL(relPath, window.location.origin).href;
  return import(/* @vite-ignore */ href);
}

export default function HarnessConcierge() {
  const { prefill } = useIntake();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [sessionMode, setSessionMode] = useState("idle"); // idle | voice | text
  const [micMuted, setMicMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSimli, setHasSimli] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [textInput, setTextInput] = useState("");
  const [items, setItems] = useState([]);

  const convRef = useRef(null);
  const simliRef = useRef(null);
  const simliReadyRef = useRef(false);
  const pendingAudioRef = useRef([]);
  const simliVideoRef = useRef(null);
  const simliAudioRef = useRef(null);
  const rootRef = useRef(null);
  const transcriptRef = useRef(null);
  const rafRef = useRef(0);
  const speakingRef = useRef(false);

  const pushItem = useCallback((entry) => {
    setItems((prev) => [...prev.slice(-22), { id: `${Date.now()}-${Math.random()}`, ...entry }]);
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [items]);

  const stopMeter = useCallback(() => {
    if (typeof cancelAnimationFrame === "function" && rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    rootRef.current?.style.setProperty("--hl-vc-level", "0");
  }, []);

  const startMeter = useCallback(() => {
    stopMeter();
    const tick = () => {
      const active = convRef.current;
      if (!active) {
        rootRef.current?.style.setProperty("--hl-vc-level", "0");
        return;
      }
      let vol = 0;
      try {
        vol = Number(active.getOutputVolume?.() || 0);
      } catch {
        vol = 0;
      }
      const level = Math.max(0, Math.min(1, speakingRef.current ? Math.max(0.32, vol * 2.2) : vol * 0.6));
      rootRef.current?.style.setProperty("--hl-vc-level", level.toFixed(3));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopMeter]);

  const stopSimli = useCallback(async () => {
    const active = simliRef.current;
    simliRef.current = null;
    simliReadyRef.current = false;
    pendingAudioRef.current = [];
    setHasSimli(false);
    if (simliVideoRef.current) simliVideoRef.current.srcObject = null;
    if (simliAudioRef.current) simliAudioRef.current.srcObject = null;
    if (active) {
      try {
        await active.stop();
      } catch {
        /* already stopped */
      }
    }
  }, []);

  const stopSession = useCallback(async () => {
    const active = convRef.current;
    convRef.current = null;
    speakingRef.current = false;
    setStatus("disconnected");
    setSessionMode("idle");
    setIsSpeaking(false);
    setMicMuted(false);
    stopMeter();
    await stopSimli();
    if (active) {
      try {
        await active.endSession();
      } catch {
        /* already closed */
      }
    }
  }, [stopMeter, stopSimli]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        stopSession();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stopSession]);

  const startSimli = useCallback(
    async (simliConfig) => {
      if (!simliConfig?.sessionToken || !simliVideoRef.current || !simliAudioRef.current) return false;
      try {
        const mod = await loadPublicModule("/voice/simli-client.js");
        if (!mod?.SimliClient) return false;
        const client = new mod.SimliClient(
          simliConfig.sessionToken,
          simliVideoRef.current,
          simliAudioRef.current,
          simliConfig.iceServers || [{ urls: ["stun:stun.l.google.com:19302"] }],
          mod.LogLevel?.ERROR ?? 4,
          simliConfig.transport === "livekit" ? "livekit" : "p2p",
        );
        client.on("speaking", () => {
          speakingRef.current = true;
          setIsSpeaking(true);
        });
        client.on("silent", () => {
          speakingRef.current = false;
          setIsSpeaking(false);
        });
        client.on("stop", () => {
          simliReadyRef.current = false;
          setHasSimli(false);
          try {
            convRef.current?.setVolume?.({ volume: 1 });
          } catch {
            /* ignore */
          }
        });
        simliRef.current = client;
        await client.start();
        if (simliRef.current !== client) {
          try {
            await client.stop();
          } catch {
            /* ignore */
          }
          return false;
        }
        simliReadyRef.current = true;
        setHasSimli(true);
        for (const chunk of pendingAudioRef.current) {
          try {
            client.sendAudioData(chunk);
          } catch {
            /* ignore */
          }
        }
        pendingAudioRef.current = [];
        return true;
      } catch {
        await stopSimli();
        return false;
      }
    },
    [stopSimli],
  );

  const clientTools = useMemo(
    () => ({
      prefillWorkOrder: async ({ requestType, desiredWorkflow } = {}) => {
        prefill({
          requestType: requestType || undefined,
          note: desiredWorkflow ? `${desiredWorkflow}\n` : undefined,
        });
        goToContact();
        pushItem({ kind: "action", text: "Pre-filled the contact form", href: "#contact", linkText: "Review question" });
        return "Pre-filled the product-question form on theharnesslab.com and scrolled the visitor down so they can review and submit it themselves. The Harness Lab sells Title-Desk, AI Landman and Artificial Landman. Every customer uses the same software.";
      },
      openTeardownBooking: async () => {
        pushItem({ kind: "action", text: "Opened Title-Desk", href: TITLE_DESK_URL, linkText: "Try Title-Desk" });
        try {
          window.open(TITLE_DESK_URL, "_blank", "noopener,noreferrer");
        } catch {
          /* link still visible */
        }
        return "There is no booking call. Opened Title-Desk at https://title-desk.com/ — landman title research software. The desktop app is sold by subscription and the hosted web app is paid per run. Every customer uses the same software.";
      },
      focusShowcase: async ({ section } = {}) => {
        const targetId = SECTION_ANCHORS[String(section || "").toLowerCase()] || "forge";
        const node = document.getElementById(targetId);
        if (node) {
          node.scrollIntoView({ behavior: "smooth", block: "start" });
          pushItem({ kind: "action", text: `Scrolled to ${targetId}` });
          return `Scrolled the visitor to the ${targetId} section on theharnesslab.com.`;
        }
        return "Section anchor not found on this page.";
      },
      contactSales: async () => {
        const href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("Product question")}`;
        pushItem({ kind: "action", text: "Direct email to Spencer Teague", href, linkText: SALES_EMAIL });
        try {
          window.location.href = href;
        } catch {
          /* link still visible */
        }
        return `Opened an email draft to Spencer Teague at ${SALES_EMAIL}.`;
      },
    }),
    [prefill, pushItem],
  );

  const startSession = useCallback(
    async ({ textOnly = false } = {}) => {
      setErrorMsg("");
      if (status === "connecting") return false;
      if (convRef.current || simliRef.current) await stopSession();

      setStatus("connecting");
      setSessionMode(textOnly ? "text" : "voice");
      setMicMuted(false);
      speakingRef.current = false;
      setIsSpeaking(false);
      pendingAudioRef.current = [];

      try {
        if (!textOnly) {
          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Microphone access is not available here. You can still type below.");
          }
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          for (const track of stream.getTracks()) track.stop();
        }

        const [res, elMod] = await Promise.all([
          fetch(VOICE_SESSION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(textOnly ? { textOnly: true } : {}),
          }),
          loadPublicModule("/voice/elevenlabs-client.js"),
        ]);

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.signedUrl) {
          throw new Error("Could not connect to the concierge right now. Try again in a moment.");
        }

        const useSimli = !textOnly && Boolean(data.simli?.sessionToken);
        if (useSimli) {
          await startSimli(data.simli);
        }

        const opts = {
          signedUrl: data.signedUrl,
          textOnly,
          clientTools,
          onConnect: () => {
            setStatus("connected");
            if (simliReadyRef.current) {
              try {
                convRef.current?.setVolume?.({ volume: 0 });
              } catch {
                /* ignore */
              }
            }
            if (!textOnly) startMeter();
          },
          onDisconnect: () => {
            convRef.current = null;
            speakingRef.current = false;
            setStatus("disconnected");
            setSessionMode("idle");
            setIsSpeaking(false);
            setMicMuted(false);
            stopMeter();
            stopSimli();
          },
          onModeChange: ({ mode } = {}) => {
            const talking = mode === "speaking";
            speakingRef.current = talking;
            setIsSpeaking(talking);
          },
          onAudio: (base64Audio) => {
            if (!base64Audio || !useSimli) return;
            const bytes = base64ToUint8Array(base64Audio);
            if (simliRef.current && simliReadyRef.current) {
              try {
                simliRef.current.sendAudioData(bytes);
              } catch {
                /* ignore */
              }
            } else if (simliRef.current && pendingAudioRef.current.length < 64) {
              pendingAudioRef.current.push(bytes);
            }
          },
          onInterruption: () => {
            pendingAudioRef.current = [];
            if (simliRef.current && simliReadyRef.current) {
              try {
                simliRef.current.ClearBuffer();
              } catch {
                /* ignore */
              }
            }
          },
          onMessage: (payload) => {
            const text = payload?.message ?? payload?.text ?? "";
            const role = payload?.source === "user" || payload?.role === "user" ? "user" : "agent";
            if (text) pushItem({ kind: "msg", role, text });
          },
          onError: (err) => {
            setErrorMsg(typeof err === "string" ? err : err?.message || "Connection interrupted. Please retry.");
          },
        };

        if (!textOnly) {
          opts.workletPaths = WORKLET_PATHS;
          opts.libsampleratePath = LIBSAMPLERATE_PATH;
        }

        const conv = await elMod.Conversation.startSession(opts);
        convRef.current = conv;
        if (simliReadyRef.current) {
          try {
            conv.setVolume?.({ volume: 0 });
          } catch {
            /* ignore */
          }
        }
        setStatus("connected");
        if (!textOnly) startMeter();
        return true;
      } catch (err) {
        await stopSession();
        setErrorMsg(err?.message || "Could not start the session right now.");
        return false;
      }
    },
    [status, stopSession, startSimli, startMeter, stopMeter, stopSimli, pushItem, clientTools],
  );

  const sendTyped = async (rawText) => {
    const trimmed = String(rawText || "").trim();
    if (!trimmed) return;
    setErrorMsg("");
    if (!convRef.current || status !== "connected") {
      const ok = await startSession({ textOnly: true });
      if (!ok || !convRef.current) return;
    }
    try {
      convRef.current.sendUserMessage(trimmed);
    } catch (err) {
      setErrorMsg(err?.message || "Could not send your message.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    await sendTyped(text);
  };

  const connected = status === "connected";
  const connecting = status === "connecting";
  const statusCopy = connecting
    ? "Connecting to The Harness Lab…"
    : connected && sessionMode === "text"
      ? "Silent text session active"
      : connected
        ? isSpeaking
          ? "Speaking…"
          : micMuted
            ? "Mic muted — type below anytime"
            : "Listening — ask about builds, harnesses, or fit"
        : "Ask Spencer's AI concierge about the products";

  return (
    <aside ref={rootRef} className="hl-vc" aria-label="The Harness Lab Concierge">
      {!open ? (
        <button type="button" className="hl-vc-fab" onClick={() => setOpen(true)} aria-expanded="false">
          <span className="hl-vc-fab-avatar">
            <img src="/avatar/poster.jpg" alt="Spencer Teague AI Concierge" width="48" height="48" decoding="async" />
            <span className="hl-vc-fab-dot" aria-hidden="true" />
          </span>
          <span className="hl-vc-fab-copy">
            <span className="hl-vc-fab-kicker">Ask Spencer AI</span>
            <span className="hl-vc-fab-title">Ask about the products</span>
          </span>
        </button>
      ) : (
        <section className="hl-vc-panel" aria-label="The Harness Lab Engineering Concierge">
          <header className="hl-vc-head">
            <div>
              <h2 className="hl-vc-title">The Harness Lab Concierge</h2>
              <p className="hl-vc-sub">Spencer Teague AI · Live Voice &amp; Text</p>
            </div>
            <button
              type="button"
              className="hl-vc-close"
              onClick={() => {
                stopSession();
                setOpen(false);
              }}
            >
              Close
            </button>
          </header>

          <div className="hl-vc-stage">
            <div
              className={`hl-vc-avatar${connected ? " is-connected" : ""}${isSpeaking ? " is-speaking" : ""}${hasSimli ? " has-simli" : ""}`}
            >
              <div className="hl-vc-ring" aria-hidden="true" />
              <div className="hl-vc-frame">
                <img className="hl-vc-poster" src="/avatar/poster.jpg" alt="Spencer Teague" width="152" height="152" />
                <video
                  className="hl-vc-video hl-vc-idle"
                  src="/avatar/idle.mp4"
                  poster="/avatar/poster.jpg"
                  width="152"
                  height="152"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <video
                  ref={simliVideoRef}
                  className="hl-vc-video hl-vc-simli"
                  width="152"
                  height="152"
                  autoPlay
                  playsInline
                />
                <audio ref={simliAudioRef} autoPlay />
              </div>
            </div>

            <p className="hl-vc-status" role="status" aria-live="polite">
              {statusCopy}
            </p>
            <p className="hl-vc-disclosure">
              AI concierge trained on founder Spencer Teague&apos;s voice &amp; portrait · Leave out passwords or secrets.
            </p>

            {errorMsg ? (
              <p className="hl-vc-error" role="alert">
                {errorMsg}
              </p>
            ) : null}

            <div className="hl-vc-controls">
              {!connected ? (
                <button
                  type="button"
                  className="hl-vc-btn hl-vc-btn-primary"
                  disabled={connecting}
                  onClick={() => startSession({ textOnly: false })}
                >
                  {connecting ? "Starting…" : "Start Voice Conversation"}
                </button>
              ) : (
                <>
                  {sessionMode === "voice" ? (
                    <button
                      type="button"
                      className="hl-vc-btn hl-vc-btn-secondary"
                      onClick={() => {
                        const next = !micMuted;
                        setMicMuted(next);
                        try {
                          convRef.current?.setMicMuted?.(next);
                        } catch {
                          /* ignore */
                        }
                      }}
                    >
                      {micMuted ? "Unmute Mic" : "Mute Mic"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hl-vc-btn hl-vc-btn-secondary"
                      onClick={() => startSession({ textOnly: false })}
                    >
                      Switch to Voice
                    </button>
                  )}
                  <button type="button" className="hl-vc-btn hl-vc-btn-danger" onClick={stopSession}>
                    End
                  </button>
                </>
              )}
            </div>

            {!connected && items.length === 0 ? (
              <div className="hl-vc-chips">
                <button
                  type="button"
                  className="hl-vc-chip"
                  onClick={() => sendTyped("What does Title-Desk do?")}
                >
                  What Title-Desk does
                </button>
                <button
                  type="button"
                  className="hl-vc-chip"
                  onClick={() => sendTyped("Who is the mineral title software for?")}
                >
                  Who it is for
                </button>
                <button
                  type="button"
                  className="hl-vc-chip"
                  onClick={() => sendTyped("How do customers pay for Title-Desk, AI Landman and Artificial Landman?")}
                >
                  How you pay
                </button>
              </div>
            ) : null}
          </div>

          {items.length > 0 ? (
            <div ref={transcriptRef} className="hl-vc-transcript" aria-live="polite">
              {items.map((item) =>
                item.kind === "action" ? (
                  <div key={item.id} className="hl-vc-action">
                    <span>{item.text}</span>
                    {item.href ? (
                      <>
                        {" · "}
                        <a
                          href={item.href}
                          target={/^https?:/i.test(item.href) ? "_blank" : undefined}
                          rel={/^https?:/i.test(item.href) ? "noopener noreferrer" : undefined}
                        >
                          {item.linkText}
                        </a>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <p key={item.id} className={`hl-vc-msg ${item.role === "user" ? "is-user" : "is-agent"}`}>
                    <span className="hl-vc-role">{item.role === "user" ? "You: " : "Harness Lab: "}</span>
                    {item.text}
                  </p>
                ),
              )}
            </div>
          ) : null}

          <form className="hl-vc-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="hl-vc-input">
              Type a question to The Harness Lab Concierge
            </label>
            <input
              id="hl-vc-input"
              className="hl-vc-input"
              type="text"
              maxLength={500}
              autoComplete="off"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Prefer typing? Ask anything…"
            />
            <button type="submit" className="hl-vc-ask" disabled={connecting}>
              Ask
            </button>
          </form>
        </section>
      )}
    </aside>
  );
}
