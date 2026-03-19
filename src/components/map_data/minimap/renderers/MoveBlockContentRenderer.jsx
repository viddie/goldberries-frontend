import { Arrow } from "../Arrow";

const MARGIN_FROM = 2;
const MARGIN_TO = 5;

export function MoveBlockContentRenderer({ entity, def }) {
  const width = entity.attributes.width;
  const height = entity.attributes.height;

  const direction = entity.attributes.direction; // "Up", "Down", "Left", or "Right"
  // Calculate the from and to points relative to the shape center:
  //   from -> 80% towards the edge opposite the direction of movement
  //   to -> 80% towards the edge in the direction of movement
  const from = (() => {
    switch (direction) {
      case "Up":
        return { x: 0, y: -height / 2 + MARGIN_FROM };
      case "Down":
        return { x: 0, y: height / 2 - MARGIN_FROM };
      case "Left":
        return { x: width / 2 - MARGIN_FROM, y: 0 };
      case "Right":
        return { x: -width / 2 + MARGIN_FROM, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  })();
  const to = (() => {
    switch (direction) {
      case "Up":
        return { x: 0, y: height / 2 - MARGIN_TO };
      case "Down":
        return { x: 0, y: -height / 2 + MARGIN_TO };
      case "Left":
        return { x: -width / 2 + MARGIN_TO, y: 0 };
      case "Right":
        return { x: width / 2 - MARGIN_TO, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  })();

  const color = def.color;

  return <Arrow from={from} to={to} depth={0} color={color} thickness={2} />;
}
