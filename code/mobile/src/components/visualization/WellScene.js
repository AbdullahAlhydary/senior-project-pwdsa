// 2D well injection cross-section composed of the small SVG primitives
// in `./scene/*`. Pure render — every dimension is derived from the props
// so swapping inputs at runtime instantly re-paints the scene.
import { Svg } from "react-native-svg";
import Sky from "./scene/Sky";
import Surface from "./scene/Surface";
import Layers from "./scene/Layers";
import Wellbore from "./scene/Wellbore";
import Fractures from "./scene/Fractures";

const ASPECT = 3 / 2; // width / height — matches the reference image proportions

export default function WellScene({
  width,
  injectionPressure,
  reservoirPressure,
  maip,
  flowRate,
  fluidColor,
}) {
  const height = Math.round(width / ASPECT);

  // Static vertical layout — the bands' relative heights are eyeballed
  // from the reference image.
  const skyTop = 0;
  const skyHeight = height * 0.18;
  const groundY = skyHeight;
  const soilTop = groundY;
  const soilHeight = height * 0.22;
  const aquiferTop = soilTop + soilHeight;
  const aquiferHeight = height * 0.06;
  const reservoirTop = aquiferTop + aquiferHeight;
  const reservoirHeight = height - reservoirTop;

  // Wellbore geometry. Derrick anchored at ~12% width to match Surface.js.
  const derrickX = width * 0.12;
  const wellTopY = groundY - 18; // start where the derrick base is
  const elbowY = reservoirTop + reservoirHeight * 0.28;
  const horizontalStart = derrickX + 18;
  const horizontalEnd = width * 0.93;

  const layout = {
    soilTop,
    soilHeight,
    aquiferTop,
    aquiferHeight,
    reservoirTop,
    reservoirHeight,
    derrickX,
    wellTopY,
    elbowY,
    horizontalStart,
    horizontalEnd,
  };

  // Fracture margin = (P_inj - MAIP) / MAIP. Positive = overpressure.
  const margin = maip > 0 ? (injectionPressure - maip) / maip : 0;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Sky width={width} top={skyTop} height={skyHeight} />
      <Surface width={width} groundY={groundY} />
      <Layers width={width} layout={layout} />
      <Wellbore width={width} layout={layout} flowRate={flowRate} fluidColor={fluidColor} />
      <Fractures width={width} layout={layout} margin={margin} fluidColor={fluidColor} />
    </Svg>
  );
}
