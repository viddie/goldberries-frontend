import { Text } from "@react-three/drei";

/**
 * Custom content renderer for large background entities (fakeWall, blockField, exitBlock).
 * Renders the entity name as tiny text in the top-left corner instead of centered,
 * keeping these large shapes visually unobtrusive.
 */
export function LargeBlockContentRenderer({ entity, def }) {
  const w = entity.attributes.width > 0 ? entity.attributes.width : 8;
  const h = entity.attributes.height > 0 ? entity.attributes.height : 8;
  const color = typeof def.color === "function" ? def.color(entity.attributes) : (def.color ?? "white");

  const name = typeof def.name === "function" ? def.name(entity.attributes) : (def.name ?? entity.name);

  const fontSize = Math.min(6, Math.min(w, h) * 0.4);
  const padding = 2;

  return (
    <Text
      position={[-w / 2 + padding, h / 2 - padding, 0]}
      fontSize={fontSize}
      color={color}
      anchorX="left"
      anchorY="top"
      maxWidth={w - padding * 2}
      textAlign="left"
    >
      {name}
    </Text>
  );
}
