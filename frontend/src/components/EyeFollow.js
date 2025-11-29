import React, { useEffect, useRef, useState } from "react";
import './EyeFollow.css';

/**
 * EyeFollow
 * Props:
 *  - closed (boolean)  -> forced closed (true when password focused or has content)
 *  - size (number) optional
 *  - className (string) optional
 *  - blinkIntervalMin/BlinkIntervalMax (seconds) optional to control random blink frequency
 */
export default function EyeFollow({
  closed = false,
  size = 160,
  className = "",
  blinkIntervalMin = 2500,
  blinkIntervalMax = 7000,
}) {
  const ref = useRef(null);
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const smoothRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(null);
  const instanceId = useRef(Math.random()); // unique per instance

  const [pos, setPos] = useState({ x: 0.5, y: 0.5 }); // published pos
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHover, setIsHover] = useState(false);

  // track pointer inside viewport relative to this eye's bounding rect
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bounds = () => el.getBoundingClientRect();

    const onMove = (e) => {
      const r = bounds();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      targetRef.current = { x, y };
    };
    const onEnter = () => setIsHover(true);
    const onLeave = () => setIsHover(false);

    window.addEventListener('mousemove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // smoothing loop
  useEffect(() => {
    const loop = () => {
      // simple lerp smoothing
      const s = smoothRef.current;
      const t = targetRef.current;
      const ease = 0.14; // lower => smoother/slower; 0.14 feels responsive and smooth
      s.x += (t.x - s.x) * ease;
      s.y += (t.y - s.y) * ease;
      setPos({ x: s.x, y: s.y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // periodic blinking (independent)
  useEffect(() => {
    let active = true;
    // initial random offset so eyes don't sync
    const initial = Math.random() * 700 + (instanceId.current * 300);
    let timeoutId;
    const schedule = () => {
      const wait = Math.random() * (blinkIntervalMax - blinkIntervalMin) + blinkIntervalMin;
      timeoutId = setTimeout(() => {
        if (!active) return;
        // don't start a random blink when forced closed
        if (!closed) {
          setIsBlinking(true);
          // random blink length (short or medium for variety)
          const blinkLen = 100 + Math.floor(Math.random() * 200);
          setTimeout(() => setIsBlinking(false), blinkLen);
        }
        schedule();
      }, wait);
    };
    timeoutId = setTimeout(schedule, initial);
    return () => { active = false; clearTimeout(timeoutId); };
  }, [blinkIntervalMin, blinkIntervalMax, closed]);

  // closed state (forced or blink)
  const showClosed = !!closed || isBlinking;

  // compute offsets
  const pupilX = (pos.x - 0.5) * (size * 0.12);
  const pupilY = (pos.y - 0.5) * (size * 0.08);

  // subtle tilt based on mouse hover location
  const tilt = isHover ? (pos.x - 0.5) * 6 : 0;

  return (
    <div
      ref={ref}
      className={`eye-large ${className} ${showClosed ? 'eye--closed' : ''} ${isHover ? 'eye--hover' : ''}`}
      style={{ width: size, height: size, transform: `rotate(${tilt}deg)` }}
      aria-hidden="true"
    >
      <div className="eye-large__shell">
        {!showClosed ? (
          <>
            <div className="eye-large__iris" style={{ transform: `translate(${pupilX}px, ${pupilY}px)` }}>
              <div className="eye-large__pupil" />
            </div>
            <div className="eye-large__shine" />
            <div className="eye-large__sparkles" aria-hidden>
              <span className="sparkle s1" />
              <span className="sparkle s2" />
            </div>
          </>
        ) : (
          // eyelid area morphs to closed
          <div className="eye-large__lid" />
        )}
      </div>
    </div>
  );
}