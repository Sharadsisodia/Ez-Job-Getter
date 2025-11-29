import React, { useEffect, useState } from "react";
import EyeFollow from "./EyeFollow";
import "./EyePair.css";

export default function EyePair({ cover = false, size = 220, gap = 18, className = "" }) {
  const eyeSize = Math.round(size * 0.42); // two eyes inside container
  const containerWidth = eyeSize * 2 + gap + 24;

  const [leftCover, setLeftCover] = useState(false);
  const [rightCover, setRightCover] = useState(false);

  // When cover toggles, add a small staggered timing so hands & eyelids don't move exactly together
  useEffect(() => {
    let t1, t2;
    if (cover) {
      t1 = setTimeout(() => setLeftCover(true), 70);
      t2 = setTimeout(() => setRightCover(true), 140);
    } else {
      // uncover in opposite order, with small delay
      t1 = setTimeout(() => setRightCover(false), 40);
      t2 = setTimeout(() => setLeftCover(false), 80);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [cover]);

  return (
    <div
      className={`eye-pair ${cover ? "eye-pair--cover" : ""} ${className}`}
      style={{ width: containerWidth }}
      aria-hidden="true"
    >
      <div className={`hand hand-left ${leftCover ? "hand--cover" : ""}`} />
      <div className="eyes" style={{ gap }}>
        <div className="eye-slot">
          <EyeFollow closed={leftCover} size={eyeSize} />
        </div>
        <div className="eye-slot">
          <EyeFollow closed={rightCover} size={eyeSize} />
        </div>
      </div>
      <div className={`hand hand-right ${rightCover ? "hand--cover" : ""}`} />
    </div>
  );
}