"use client";

import { memo, useMemo } from "react";

type WaveformProps = {
  progress: number;
  active?: boolean;
  bars?: number;
};

function WaveformComponent({ progress, active = false, bars = 28 }: WaveformProps) {
  const heights = useMemo(
    () =>
      Array.from({ length: bars }, (_, index) => {
        const wave = Math.sin(index * 0.55) * 0.35 + Math.cos(index * 0.2) * 0.25;
        return 28 + Math.abs(wave) * 72;
      }),
    [bars],
  );

  const filled = Math.round((Math.min(100, Math.max(0, progress)) / 100) * bars);

  return (
    <div
      className="flex h-8 items-end gap-[2px]"
      aria-hidden="true"
      role="presentation"
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className={
            index < filled
              ? "w-[3px] rounded-full bg-gradient-to-t from-cyan to-fuchsia"
              : "w-[3px] rounded-full bg-white/15"
          }
          style={{
            height: `${height}%`,
            opacity: active ? 1 : 0.7,
            transform: active && index < filled ? "scaleY(1.05)" : "scaleY(1)",
            transition: "height 120ms ease, opacity 150ms ease, transform 150ms ease",
          }}
        />
      ))}
    </div>
  );
}

export const Waveform = memo(WaveformComponent);
