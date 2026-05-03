// Branching fractures rendered along the horizontal wellbore section.
//
// Visibility and severity are driven by the "fracture margin":
//     m = (injection_pressure - MAIP) / MAIP
// Negative margin       -> hide all fractures.
// 0..0.05 (very close)  -> 1-2 small cracks.
// 0.05..0.15            -> 3-4 medium cracks.
// > 0.15                -> 4+ large branching cracks (the failure state
//                          in the reference image).
//
// Branches are deterministic — based on a small fixed seed list — so the
// picture stays stable while the user drags sliders rather than thrashing
// random shapes around.
import { G, Path } from "react-native-svg";

const ANCHORS = [0.18, 0.4, 0.62, 0.84]; // along horizontal section (0..1)

export default function Fractures({ width, layout, margin, fluidColor = "#5BC0F8" }) {
  if (margin <= 0) return null;

  // Pick how many fracture clusters to draw based on margin.
  let count = 1;
  if (margin > 0.05) count = 2;
  if (margin > 0.1) count = 3;
  if (margin > 0.15) count = 4;

  // Branch length scales with margin so the visual "violence" tracks
  // pressure overshoot.
  const intensity = Math.min(1, margin / 0.25);
  const baseLen = 18 + 30 * intensity;

  const { elbowY, horizontalStart, horizontalEnd } = layout;
  const yPipeMid = elbowY + 9; // bottom of the pipe interior
  const xs = ANCHORS.slice(0, count).map(
    (t) => horizontalStart + t * (horizontalEnd - horizontalStart)
  );

  return (
    <G>
      {xs.map((cx, i) => (
        <FractureCluster
          key={i}
          cx={cx}
          yTop={yPipeMid - 8}
          yBot={yPipeMid + 12}
          length={baseLen + (i % 2 === 0 ? 0 : 6)}
          color={fluidColor}
          intensity={intensity}
          flip={i % 2 === 0}
        />
      ))}
    </G>
  );
}

// One fracture is several jagged branches radiating up and down from a
// central seed. Each branch is a polyline with secondary forks.
function FractureCluster({ cx, yTop, yBot, length, color, intensity, flip }) {
  const stroke = 2.5 + 1.5 * intensity;
  const subStroke = stroke * 0.6;

  // Primary branches — directions chosen so the shape resembles tree roots
  // / lightning forking. Each `dir` is a unit-vector cosine/sine pair.
  const dirsTop = flip
    ? [{ dx: -0.35, dy: -1 }, { dx: 0.05, dy: -1 }, { dx: 0.45, dy: -0.95 }]
    : [{ dx: -0.45, dy: -0.95 }, { dx: -0.05, dy: -1 }, { dx: 0.4, dy: -1 }];
  const dirsBot = flip
    ? [{ dx: -0.5, dy: 1 }, { dx: -0.05, dy: 1 }, { dx: 0.4, dy: 0.95 }]
    : [{ dx: -0.4, dy: 0.95 }, { dx: 0.05, dy: 1 }, { dx: 0.45, dy: 1 }];

  return (
    <G>
      {dirsTop.map((d, i) => (
        <Branch
          key={`t-${i}`}
          x={cx}
          y={yTop}
          length={length * (0.7 + 0.3 * ((i + 1) % 3) / 3)}
          dx={d.dx}
          dy={d.dy}
          stroke={stroke}
          subStroke={subStroke}
          color={color}
          intensity={intensity}
        />
      ))}
      {dirsBot.map((d, i) => (
        <Branch
          key={`b-${i}`}
          x={cx}
          y={yBot}
          length={length * (0.7 + 0.3 * ((i + 1) % 3) / 3)}
          dx={d.dx}
          dy={d.dy}
          stroke={stroke}
          subStroke={subStroke}
          color={color}
          intensity={intensity}
        />
      ))}
    </G>
  );
}

// A "branch" is a 3-segment jagged line with two short side forks at 1/3 and
// 2/3 of its length. We compose two SVG paths (main + forks) per branch.
function Branch({ x, y, length, dx, dy, stroke, subStroke, color, intensity }) {
  // Step coords for the main jagged polyline.
  const seg = length / 3;
  const wobble = 4 + 6 * intensity;

  // Main polyline, with small zig/zag perpendicular to the direction.
  const px = -dy; // perpendicular vector
  const py = dx;
  const p1 = [x + dx * seg + px * wobble * 0.5, y + dy * seg + py * wobble * 0.5];
  const p2 = [x + dx * 2 * seg - px * wobble * 0.7, y + dy * 2 * seg - py * wobble * 0.7];
  const p3 = [x + dx * length, y + dy * length];

  const main = `M ${x} ${y} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`;

  // Two short side forks
  const forkLen = seg * 0.7;
  const fA = [
    p1[0] + dx * forkLen * 0.6 + px * forkLen * 0.5,
    p1[1] + dy * forkLen * 0.6 + py * forkLen * 0.5,
  ];
  const fB = [
    p2[0] + dx * forkLen * 0.5 - px * forkLen * 0.6,
    p2[1] + dy * forkLen * 0.5 - py * forkLen * 0.6,
  ];
  const forkA = `M ${p1[0]} ${p1[1]} L ${fA[0]} ${fA[1]}`;
  const forkB = `M ${p2[0]} ${p2[1]} L ${fB[0]} ${fB[1]}`;

  return (
    <G>
      <Path d={main} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" />
      <Path d={forkA} stroke={color} strokeWidth={subStroke} fill="none" strokeLinecap="round" />
      <Path d={forkB} stroke={color} strokeWidth={subStroke} fill="none" strokeLinecap="round" />
    </G>
  );
}
