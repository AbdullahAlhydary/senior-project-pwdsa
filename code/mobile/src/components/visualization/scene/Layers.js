// Subsurface geological bands — top brown soil, blue aquifer, dark-brown
// reservoir. Speckles are added to break the flat fill and approximate the
// "infographic flat-vector" art style from the reference image.
import { Circle, G, Rect } from "react-native-svg";

export default function Layers({ width, layout }) {
  const { soilTop, soilHeight, aquiferTop, aquiferHeight, reservoirTop, reservoirHeight } = layout;
  return (
    <G>
      <Rect x={0} y={soilTop} width={width} height={soilHeight} fill="#7E4A2C" />
      {/* Soil speckles */}
      {SPECKLES_TOP.map((p, i) => (
        <Circle
          key={`st-${i}`}
          cx={p.x * width}
          cy={soilTop + p.y * soilHeight}
          r={p.r}
          fill={p.dark ? "#5A311A" : "#A56A40"}
          opacity={0.85}
        />
      ))}
      <Rect x={0} y={aquiferTop} width={width} height={aquiferHeight} fill="#3FA0E0" />
      {/* Aquifer wave highlights */}
      <Rect
        x={0}
        y={aquiferTop + aquiferHeight * 0.25}
        width={width}
        height={2}
        fill="#FFFFFF"
        opacity={0.35}
      />
      <Rect
        x={0}
        y={aquiferTop + aquiferHeight * 0.7}
        width={width}
        height={1.5}
        fill="#FFFFFF"
        opacity={0.25}
      />
      <Rect x={0} y={reservoirTop} width={width} height={reservoirHeight} fill="#3F2613" />
      {/* Reservoir speckles */}
      {SPECKLES_BOT.map((p, i) => (
        <Circle
          key={`sr-${i}`}
          cx={p.x * width}
          cy={reservoirTop + p.y * reservoirHeight}
          r={p.r}
          fill={p.dark ? "#1F1108" : "#5A361B"}
          opacity={0.85}
        />
      ))}
    </G>
  );
}

// Pseudo-random but stable speckle positions. Hard-coded so the picture
// looks the same across renders even though we never re-seed Math.random.
const SPECKLES_TOP = [
  { x: 0.07, y: 0.15, r: 4, dark: true },
  { x: 0.15, y: 0.65, r: 3, dark: false },
  { x: 0.27, y: 0.4, r: 5, dark: true },
  { x: 0.42, y: 0.18, r: 3, dark: false },
  { x: 0.55, y: 0.55, r: 4, dark: true },
  { x: 0.68, y: 0.3, r: 3, dark: false },
  { x: 0.82, y: 0.7, r: 4.5, dark: true },
  { x: 0.93, y: 0.22, r: 3, dark: false },
];
const SPECKLES_BOT = [
  { x: 0.04, y: 0.6, r: 5, dark: true },
  { x: 0.14, y: 0.25, r: 4, dark: false },
  { x: 0.22, y: 0.78, r: 5, dark: true },
  { x: 0.34, y: 0.45, r: 3, dark: false },
  { x: 0.45, y: 0.18, r: 4, dark: true },
  { x: 0.6, y: 0.62, r: 5, dark: false },
  { x: 0.74, y: 0.3, r: 3, dark: true },
  { x: 0.86, y: 0.7, r: 4.5, dark: false },
  { x: 0.95, y: 0.42, r: 3, dark: true },
];
