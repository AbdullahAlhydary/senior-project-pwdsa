// Surface infrastructure — green ground line, oil derrick + storage tanks
// rendered as flat black silhouettes to match the reference docx image.
import { G, Path, Rect } from "react-native-svg";

export default function Surface({ width, groundY }) {
  // Grass band — a thin solid stripe so the upper soil layer reads as
  // "underground".
  const grassH = 6;
  // Derrick is anchored at ~12% from the left.
  const derrickX = width * 0.12;
  // Tanks placed on the right ~75-90% region.
  const tankX = width * 0.72;

  return (
    <G>
      <Rect x={0} y={groundY - grassH} width={width} height={grassH} fill="#46B458" />
      <Derrick x={derrickX} groundY={groundY - grassH} />
      <Tank x={tankX} groundY={groundY - grassH} />
      <Tank x={tankX + 60} groundY={groundY - grassH} />
    </G>
  );
}

// Stylized triangular oil derrick + small foundation house with windows.
function Derrick({ x, groundY }) {
  // Derrick triangle dimensions.
  const baseW = 50;
  const apexY = groundY - 80;
  const left = x - baseW / 2;
  const right = x + baseW / 2;

  // Three crossbars give the triangle some structure.
  const crossbars = [0.3, 0.55, 0.8].map((t) => {
    const yL = groundY - 80 * (1 - t);
    return { x1: left + (baseW * t) / 2, y1: yL, x2: right - (baseW * t) / 2, y2: yL };
  });

  return (
    <G>
      {/* Base building */}
      <Rect x={x - 30} y={groundY - 18} width={60} height={18} fill="#0E1320" />
      {/* Two windows */}
      <Rect x={x - 22} y={groundY - 13} width={8} height={6} fill="#FBE26B" />
      <Rect x={x - 8} y={groundY - 13} width={8} height={6} fill="#FBE26B" />
      <Rect x={x + 6} y={groundY - 13} width={8} height={6} fill="#FBE26B" />
      <Rect x={x + 20} y={groundY - 13} width={6} height={6} fill="#FBE26B" />
      {/* Triangle outline as 2 thick legs */}
      <Path
        d={`M ${left} ${groundY - 18} L ${x} ${apexY} L ${right} ${groundY - 18} Z`}
        fill="none"
        stroke="#0E1320"
        strokeWidth={3}
      />
      {crossbars.map((c, i) => (
        <Path
          key={i}
          d={`M ${c.x1} ${c.y1} L ${c.x2} ${c.y2}`}
          stroke="#0E1320"
          strokeWidth={2.2}
        />
      ))}
      {/* Mast tip */}
      <Rect x={x - 1.5} y={apexY - 8} width={3} height={8} fill="#0E1320" />
    </G>
  );
}

function Tank({ x, groundY }) {
  // A simple cylindrical silhouette: bottom rectangle + top half-ellipse.
  return (
    <G>
      <Rect x={x} y={groundY - 36} width={50} height={36} fill="#0E1320" rx={3} ry={3} />
      <Path
        d={`M ${x} ${groundY - 36} Q ${x + 25} ${groundY - 50} ${x + 50} ${groundY - 36}`}
        fill="#0E1320"
      />
    </G>
  );
}
