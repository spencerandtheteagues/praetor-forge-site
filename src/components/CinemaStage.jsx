import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { ChapterHead } from "./ui.jsx";
import { useInView, useMotion } from "../lib/motion.js";
import { CINEMA_CUTS } from "../data/products.js";

// Chapter IV · Studio Cinema. One <video>, three cuts (the walkthrough leads).
// Autoplay is muted and only happens while ≥50% in view, motion is not paused
// and the visitor has not asked for reduced motion. An explicit pause sticks.

const timecode = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export default function CinemaStage() {
  const { paused, reduced, setCinemaPlaying } = useMotion();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const screenRef = useRef(null);
  const videoRef = useRef(null);

  const near = useInView(sectionRef, { rootMargin: "900px 0px" });
  const inView = useInView(screenRef, { threshold: 0.5 }); // ambient autoplay gate
  const visible = useInView(screenRef); // any part on screen

  const [cutIndex, setCutIndex] = useState(0);
  const [armed, setArmed] = useState(false); // stays true once near the viewport
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [userStarted, setUserStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [theater, setTheater] = useState(false);
  const [inlineTheater, setInlineTheater] = useState(false);
  const expanded = theater || inlineTheater;

  const cut = CINEMA_CUTS[cutIndex];

  useEffect(() => {
    if (near) setArmed(true);
  }, [near]);

  const attemptPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.then(() => setBlocked(false)).catch((err) => {
        // AbortError just means a pause() interrupted us; anything else
        // (NotAllowedError, NotSupportedError) needs a visible play button.
        if (err && err.name !== "AbortError") setBlocked(true);
      });
    }
  }, []);

  // Autoplay / pause policy. Ambient (muted) autoplay needs ≥50% in view;
  // a cut the visitor asked for keeps playing while any of it is visible.
  const wantPlay =
    !userPaused && (userStarted ? visible : inView && !paused && !reduced);
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !armed) return;
    if (wantPlay && v.paused) attemptPlay();
    else if (!wantPlay && !v.paused) v.pause();
  }, [wantPlay, armed, cutIndex, attemptPlay]);

  // The global "Pause motion" control stops the film too, even one the visitor
  // started; they can press Play again afterwards.
  useEffect(() => {
    if (!paused) return;
    videoRef.current?.pause();
    setUserStarted(false);
  }, [paused]);

  // Let the medallion yield the GPU while the film plays in view.
  useEffect(() => {
    setCinemaPlaying(playing && visible);
  }, [playing, visible, setCinemaPlaying]);
  useEffect(() => () => setCinemaPlaying(false), [setCinemaPlaying]);

  // Theater = native fullscreen of the whole stage (controls included).
  useEffect(() => {
    const sync = () => setTheater(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Browsers can refuse OS fullscreen. Keep Theater useful inside the viewport,
  // with modal keyboard behavior and the original player/time left intact.
  useEffect(() => {
    if (!inlineTheater) return undefined;
    const stage = stageRef.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    const siblings = [];
    for (let node = stage; node?.parentElement; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && sibling instanceof HTMLElement) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
    }
    document.body.style.overflow = "hidden";
    const controls = () => [...stage.querySelectorAll('button:not([disabled]), input:not([disabled])')]
      .filter(el => el.getClientRects().length);
    stage.querySelector('[aria-label="Exit theater"]')?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setInlineTheater(false);
      } else if (e.key === "Tab") {
        const items = controls();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    stage.addEventListener("keydown", onKey);
    return () => {
      stage.removeEventListener("keydown", onKey);
      siblings.forEach(([el, inert]) => { el.inert = inert; });
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [inlineTheater]);

  const play = () => {
    setUserPaused(false);
    setUserStarted(true);
    setBlocked(false);
    setArmed(true);
    attemptPlay();
  };
  const pause = () => {
    setUserPaused(true);
    setUserStarted(false);
    videoRef.current?.pause();
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) play();
  };
  const seek = (t) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
    setTime(t);
  };
  const jumpTo = (t) => {
    setArmed(true);
    seek(t);
    if (videoRef.current?.paused) play();
  };
  const chooseCut = (index) => {
    if (index === cutIndex) return;
    setCutIndex(index);
    setTime(0);
    setDuration(0);
    setPlaying(false);
    setBlocked(false);
    setUserPaused(false);
    setUserStarted(true); // choosing a cut is an explicit request to watch it
    setArmed(true);
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      setMuted(true);
    }
  };
  const toggleTheater = () => {
    const stage = stageRef.current;
    const v = videoRef.current;
    if (!stage) return;
    if (inlineTheater) {
      setInlineTheater(false);
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    if (stage.requestFullscreen) {
      stage.requestFullscreen().catch(() => setInlineTheater(true));
    } else if (v?.webkitEnterFullscreen) {
      v.webkitEnterFullscreen(); // iOS Safari: video-only fullscreen
    } else {
      setInlineTheater(true);
    }
  };

  const activeChapter = cut.chapters.reduce(
    (acc, ch, i) => (time >= ch.t - 0.05 ? i : acc),
    0,
  );
  const max = duration || 0;

  return (
    <section id="cinema" ref={sectionRef} className="section cinema" aria-labelledby="cinema-title">
      <span id="film" className="anchor-alias" aria-hidden="true" />
      <span id="reel" className="anchor-alias" aria-hidden="true" />
      <div className="container">
        <ChapterHead
          numeral="IV"
          eyebrow="Evidence of what we built · Studio cinema"
          id="cinema-title"
          title={
            <>
              Built in the dark. <em>Proven in production.</em>
            </>
          }
        >
          <p>
            Start with the 3m 44s TitleDesk walkthrough — a sample
            twelve-instrument demonstration from scope check to delivered draft workbook, with
            the run shortened — then the studio showcase and our
            verification-to-handover reel. Sound stays off until you ask for it.
          </p>
        </ChapterHead>

        <div className="cinema-tabs" role="tablist" aria-label="Choose a cut">
          {CINEMA_CUTS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`cinema-tab-${c.id}`}
              aria-selected={i === cutIndex}
              aria-controls="cinema-stage"
              tabIndex={i === cutIndex ? 0 : -1}
              className={`cinema-tab ${i === cutIndex ? "is-active" : ""}`}
              onClick={() => chooseCut(i)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const next =
                  (i + (e.key === "ArrowRight" ? 1 : -1) + CINEMA_CUTS.length) %
                  CINEMA_CUTS.length;
                chooseCut(next);
                document.getElementById(`cinema-tab-${CINEMA_CUTS[next].id}`)?.focus();
              }}
            >
              <span className="cinema-tab-name">{c.tab}</span>
              <span className="cinema-tab-meta mono">{c.meta}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        id="cinema-stage"
        ref={stageRef}
        role={inlineTheater ? "dialog" : "tabpanel"}
        aria-modal={inlineTheater ? true : undefined}
        aria-labelledby={`cinema-tab-${cut.id}`}
        className={`cinema-stage cinema-stage--${cut.shape} ${expanded ? "is-theater" : ""} ${inlineTheater ? "is-theater-fallback" : ""}`}
        style={{ "--ratio": (cut.width / cut.height).toFixed(4) }}
      >
        <div className="cinema-frame bezel">
          {cut.archival ? (
            <span className="cinema-archival inscription">Archival studio promo reel</span>
          ) : null}
          <div
            ref={screenRef}
            className="cinema-screen"
            style={{ aspectRatio: `${cut.width} / ${cut.height}` }}
          >
            <video
              ref={videoRef}
              className="cinema-video"
              src={cut.src}
              poster={cut.poster || undefined}
              width={cut.width}
              height={cut.height}
              preload={armed ? "metadata" : "none"}
              muted
              loop
              playsInline
              aria-label={`${cut.tab}, ${cut.meta}`}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onDurationChange={(e) => setDuration(e.currentTarget.duration)}
              onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            />
            {!playing ? (
              <button
                type="button"
                className={`cinema-bigplay ${blocked ? "is-blocked" : ""}`}
                onClick={play}
                aria-label={`Play ${cut.tab}`}
              >
                <Play aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="cinema-controls">
            <button
              type="button"
              className="cinema-control"
              onClick={playing ? pause : play}
              aria-label={playing ? "Pause film" : "Play film"}
            >
              {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              <span className="cinema-control-label">{playing ? "Pause" : "Play"}</span>
            </button>
            {cut.hasAudio ? (
              <button
                type="button"
                className="cinema-control"
                onClick={toggleMute}
                aria-pressed={!muted}
                aria-label={muted ? "Unmute film" : "Mute film"}
              >
                {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
                <span className="cinema-control-label">{muted ? "Unmute" : "Mute"}</span>
              </button>
            ) : null}
            <input
              className="cinema-scrubber"
              type="range"
              min="0"
              max={max}
              step="0.1"
              value={Math.min(time, max)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              aria-valuetext={`${timecode(time)} of ${timecode(max)}`}
              style={{ "--progress": max ? `${(Math.min(time, max) / max) * 100}%` : "0%" }}
            />
            <span className="cinema-timecode mono" aria-hidden="true">
              {timecode(time)} / {timecode(max)}
            </span>
            <button
              type="button"
              className="cinema-control"
              onClick={toggleTheater}
              aria-pressed={expanded}
              aria-label={expanded ? "Exit theater" : "Theater"}
            >
              {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
              <span className="cinema-control-label">{expanded ? "Exit" : "Theater"}</span>
            </button>
          </div>
        </div>

        <div className="cinema-meta">
          {cut.chapters.length ? (
            <ol className="cinema-chapters" aria-label="Chapters">
              {cut.chapters.map((ch, i) => (
                <li key={ch.t}>
                  <button
                    type="button"
                    className={`cinema-chapter ${i === activeChapter ? "is-active" : ""}`}
                    aria-current={i === activeChapter ? "true" : undefined}
                    onClick={() => jumpTo(ch.t)}
                  >
                    <span className="mono">{timecode(ch.t)}</span>
                    <span>{ch.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}
          <p className="cinema-caption">{cut.caption}</p>
        </div>
      </div>
    </section>
  );
}
