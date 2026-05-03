// Sky band — pale blue with a couple of stylized clouds.
// Drawn in SVG so the cloud silhouettes look smooth on every device.
import { Circle, Ellipse, G, Rect } from "react-native-svg";

export default function Sky({ width, top, height }) {
  return (
    <G>
      <Rect x={0} y={top} width={width} height={height} fill="#9DD7FB" />
      <Cloud cx={width * 0.18} cy={top + height * 0.45} scale={1} />
      <Cloud cx={width * 0.62} cy={top + height * 0.32} scale={0.7} />
      <Cloud cx={width * 0.85} cy={top + height * 0.55} scale={0.9} />
    </G>
  );
}

function Cloud({ cx, cy, scale = 1 }) {
  // Three overlapping ellipses produce a fluffy silhouette without paths.
  const w = 28 * scale;
  const h = 12 * scale;
  return (
    <G>
      <Ellipse cx={cx} cy={cy} rx={w} ry={h} fill="#FFFFFF" opacity={0.95} />
      <Circle cx={cx - w * 0.6} cy={cy - h * 0.2} r={h * 1.1} fill="#FFFFFF" />
      <Circle cx={cx + w * 0.55} cy={cy - h * 0.1} r={h * 1.0} fill="#FFFFFF" />
      <Circle cx={cx + w * 0.05} cy={cy - h * 0.6} r={h * 1.2} fill="#FFFFFF" />
    </G>
  );
}
