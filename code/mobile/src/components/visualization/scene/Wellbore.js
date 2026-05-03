// Vertical casing pipe + 90° elbow + horizontal section, filled with the
// injected fluid. Bubble count + opacity scale with the chosen flow rate.
import { Circle, G, Path, Rect } from "react-native-svg";

const PIPE_OUTER_W = 18; // outer width of the casing
const PIPE_INNER_W = 11; // inner fluid column

export default function Wellbore({ width, layout, flowRate, fluidColor = "#5BC0F8" }) {
  const { wellTopY, elbowY, horizontalEnd, derrickX } = layout;
  const x = derrickX;

  // Casing (gray) — drawn as 2 stacked rectangles + a curved elbow path.
  const casingFill = "#1A2330";

  // Fluid (light blue) — same outline but narrower.
  const fluidPad = (PIPE_OUTER_W - PIPE_INNER_W) / 2;

  return (
    <G>
      {/* Vertical casing */}
      <Rect
        x={x - PIPE_OUTER_W / 2}
        y={wellTopY}
        width={PIPE_OUTER_W}
        height={elbowY - wellTopY}
        fill={casingFill}
      />
      {/* Elbow casing — quarter-circle */}
      <Path
        d={elbowPath(
          x - PIPE_OUTER_W / 2,
          elbowY,
          PIPE_OUTER_W,
          elbowY - wellTopY === 0 ? 1 : 1
        )}
        fill={casingFill}
      />
      {/* Horizontal casing */}
      <Rect
        x={x + PIPE_OUTER_W / 2}
        y={elbowY + PIPE_OUTER_W / 2}
        width={horizontalEnd - (x + PIPE_OUTER_W / 2)}
        height={PIPE_OUTER_W}
        fill={casingFill}
      />

      {/* Fluid column inside the pipe */}
      <Rect
        x={x - PIPE_INNER_W / 2}
        y={wellTopY}
        width={PIPE_INNER_W}
        height={elbowY - wellTopY}
        fill={fluidColor}
      />
      <Path
        d={elbowPath(
          x - PIPE_INNER_W / 2,
          elbowY,
          PIPE_INNER_W,
          1
        )}
        fill={fluidColor}
      />
      <Rect
        x={x + PIPE_INNER_W / 2}
        y={elbowY + fluidPad + (PIPE_OUTER_W - PIPE_INNER_W) / 2}
        width={horizontalEnd - (x + PIPE_INNER_W / 2)}
        height={PIPE_INNER_W}
        fill={fluidColor}
      />

      {/* Bubbles in the fluid — count scales with flow rate */}
      {bubbles(x, wellTopY, elbowY, horizontalEnd, flowRate)}
    </G>
  );
}

// Build the quarter-circle "elbow" SVG path. Drawn around the corner so the
// outer wall hugs the radius and the inner wall is just inset.
function elbowPath(leftX, elbowY, w, scale) {
  // Outer corner radius matches `w + ${PIPE_OUTER_W/2}` for visual weight.
  const r = w * 1.0 * scale;
  const startX = leftX;
  const startY = elbowY;
  const turnX = leftX + r + w;
  const turnY = elbowY + r + w;
  return [
    `M ${startX} ${startY}`,
    `L ${startX + w} ${startY}`,
    `A ${r} ${r} 0 0 1 ${turnX} ${turnY}`,
    `L ${turnX} ${turnY - w}`,
    `A ${r - w} ${r - w} 0 0 0 ${startX + w} ${startY + w}`,
    `L ${startX} ${startY + w}`,
    "Z",
  ].join(" ");
}

function bubbles(x, topY, elbowY, horizontalEnd, flowRate) {
  // Pretend `flowRate` 0..3000 maps to 0..18 bubbles.
  const n = Math.max(0, Math.min(20, Math.round(flowRate / 180)));
  const out = [];
  for (let i = 0; i < n; i++) {
    // Distribute roughly half along the vertical section and half along
    // the horizontal section.
    if (i % 2 === 0) {
      const t = (i / n + 0.05) % 1;
      out.push(
        <Circle
          key={`bv-${i}`}
          cx={x + (i % 4 === 0 ? -2.5 : 2.5)}
          cy={topY + t * (elbowY - topY)}
          r={1.5}
          fill="#FFFFFF"
          opacity={0.85}
        />
      );
    } else {
      const t = (i / n + 0.1) % 1;
      out.push(
        <Circle
          key={`bh-${i}`}
          cx={x + 12 + t * (horizontalEnd - (x + 12))}
          cy={elbowY + 9 + (i % 3 === 0 ? -2 : 2)}
          r={1.5}
          fill="#FFFFFF"
          opacity={0.85}
        />
      );
    }
  }
  return out;
}
