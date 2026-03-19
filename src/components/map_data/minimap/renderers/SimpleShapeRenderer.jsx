import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { Text } from "@react-three/drei";

import { Arrow } from "../Arrow";
import { useMinimapStore } from "../useMinimapStore";
import { LAYERS } from "../entity_definitions";

/**
 * Splits an entity name on camelCase boundaries into multiple lines.
 * Handles mod prefixes like "CollabUtils2/SilverBerry" by taking only the part after "/".
 * Only splits before a capital letter when preceded by a lowercase letter or digit,
 * so "(Refill)" stays on one line and "SMWTrack" stays on one line.
 * Example: "floatySpaceBlock" → "floaty\nSpace\nBlock"
 */
function splitOnCapitals(name) {
  const simpleName = name.includes("/") ? name.split("/").pop() : name;
  return simpleName.replace(/([a-z0-9])([A-Z])/g, "$1\n$2");
}

/**
 * Resolves a def property: if it's a function, call it with the entity's attributes;
 * otherwise return the raw value. Falls back to `fallback` if the result is undefined.
 */
function resolve(value, attributes, fallback) {
  if (typeof value === "function") {
    return value(attributes) ?? fallback;
  }
  return value ?? fallback;
}

const _worldPos = new Vector3();

export function SimpleShapeRenderer({ entities, def }) {
  return (
    <>
      {entities.map((e, i) => (
        <SimpleShape key={i} entity={e} def={def} />
      ))}
    </>
  );
}

const HIGHLIGHT_OPACITY = 0.3;
const CIRCLE_SEGMENTS = 32;

function SimpleShape({ entity, def }) {
  const [hovered, setHovered] = useState(false);
  const selectObject = useMinimapStore((s) => s.selectObject);
  const isSelected = useMinimapStore((s) => s.selectedObject?.data === entity);

  const attr = entity.attributes;
  const w = resolve(def.width, attr, attr.width > 0 ? attr.width : 8);
  const h = resolve(def.height, attr, attr.height > 0 ? attr.height : 8);
  const color = resolve(def.color, attr, "white");
  const outline = resolve(def.outline, attr, undefined);
  const baseOpacity = resolve(def.opacity, attr, 0.08);
  const nameOverride = resolve(def.name, attr, undefined);
  const offset = resolve(def.offset, attr, undefined);
  const depth = resolve(def.depth, attr, LAYERS.ENTITIES);
  const anchorX = resolve(def.anchorX, attr, "left");
  const anchorY = resolve(def.anchorY, attr, "top");
  const shape = resolve(def.shape, attr, "box");
  const radius = resolve(def.radius, attr, Math.min(w, h) / 2);

  const isCircle = shape === "circle";
  const opacity = isSelected || hovered ? HIGHLIGHT_OPACITY : baseOpacity;
  const outlineOpacity = isSelected ? 1 : hovered ? 0.6 : 0.3;

  const displayName = useMemo(
    () => splitOnCapitals(nameOverride ?? entity.name),
    [nameOverride, entity.name],
  );

  const x = attr.x + (offset?.[0] ?? 0);
  const y = -attr.y + (offset ? -offset[1] : 0);

  // Compute mesh offset based on anchor props
  // Circles are always center-anchored on both axes
  const meshOffsetX = isCircle ? 0 : anchorX === "center" ? 0 : anchorX === "right" ? -w / 2 : w / 2;
  const meshOffsetY = isCircle ? 0 : anchorY === "center" ? 0 : anchorY === "bottom" ? h / 2 : -h / 2;

  const effectiveSize = isCircle ? radius * 2 : Math.min(w, h);
  // Scale font to fit: shorter names get proportionally larger text
  const lines = displayName.split("\n");
  const longestLine = Math.max(...lines.map((l) => l.length));
  const maxFontByWidth = ((isCircle ? radius * 2 : w) * 0.75) / Math.max(longestLine * 0.6, 1);
  const maxFontByHeight = ((isCircle ? radius * 2 : h) * 0.75) / Math.max(lines.length, 1);
  const fontSize = Math.min(maxFontByWidth, maxFontByHeight, effectiveSize * 0.75);

  const onPointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);

  const onPointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const onClick = useCallback(
    (e) => {
      const store = useMinimapStore.getState();
      // Prune previously clicked objects that don't overlap with this click position (once per native event)
      store.pruneClickedObjects(e.point, e.nativeEvent);
      // If this entity was already visited in the current cycle, skip it
      if (useMinimapStore.getState().clickedObjects.has(entity)) return;

      e.stopPropagation();
      // Compute bounds in world space to match world-space e.point used by pruneClickedObjects
      e.object.getWorldPosition(_worldPos);
      const halfW = isCircle ? radius : w / 2;
      const halfH = isCircle ? radius : h / 2;
      const bounds = {
        minX: _worldPos.x - halfW,
        maxX: _worldPos.x + halfW,
        minY: _worldPos.y - halfH,
        maxY: _worldPos.y + halfH,
      };
      selectObject(entity, depth, bounds);
    },
    [entity, selectObject, depth, w, h, radius, isCircle],
  );

  //#region Node path
  const nodes = useMemo(() => {
    if (!entity.children) return [];
    return entity.children.filter((c) => c.name === "node");
  }, [entity.children]);

  // Center positions for arrow connections: [entityCenter, node1Center, node2Center, ...]
  const pathPositions = useMemo(() => {
    const mainCenter = { x: x + meshOffsetX, y: y + meshOffsetY };
    const nodePositions = nodes.map((node) => ({
      x: node.attributes.x + (offset?.[0] ?? 0) + meshOffsetX,
      y: -node.attributes.y + (offset ? -offset[1] : 0) + meshOffsetY,
    }));
    return [mainCenter, ...nodePositions];
  }, [x, y, meshOffsetX, meshOffsetY, nodes, offset]);

  const NODE_OPACITY_FACTOR = 0.4;
  const nodeOpacity = opacity * NODE_OPACITY_FACTOR;
  const nodeOutlineOpacity = outlineOpacity * NODE_OPACITY_FACTOR;
  //#endregion

  const shapeProps = { shape: isCircle ? "circle" : "box", w, h, radius, color, outline };

  return (
    <group>
      {/* Arrows connecting entity to nodes — rendered first so they are behind shapes */}
      {pathPositions.length > 1 &&
        pathPositions
          .slice(1)
          .map((pos, i) => (
            <Arrow
              key={i}
              from={pathPositions[i]}
              to={pos}
              depth={depth - 1}
              color={color}
              opacity={nodeOpacity}
            />
          ))}

      {/* Node ghost shapes */}
      {nodes.map((node, i) => {
        const nx = node.attributes.x + (offset?.[0] ?? 0);
        const ny = -node.attributes.y + (offset ? -offset[1] : 0);
        return (
          <group key={i} position={[nx, ny, depth]}>
            <ShapeMesh
              {...shapeProps}
              offsetX={meshOffsetX}
              offsetY={meshOffsetY}
              opacity={nodeOpacity}
              outlineOpacity={nodeOutlineOpacity}
            />
          </group>
        );
      })}

      {/* Main shape */}
      <group position={[x, y, depth]}>
        <ShapeMesh
          {...shapeProps}
          offsetX={meshOffsetX}
          offsetY={meshOffsetY}
          opacity={opacity}
          outlineOpacity={outlineOpacity}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={onClick}
        />
        {def.renderer ? (
          <group position={[meshOffsetX, meshOffsetY, 0.1]}>
            <def.renderer entity={entity} def={def} />
          </group>
        ) : (
          <Text
            position={[meshOffsetX, meshOffsetY, 0.1]}
            fontSize={fontSize}
            color={color}
            anchorX="center"
            anchorY="middle"
            maxWidth={(isCircle ? radius * 2 : w) - 1}
            textAlign="center"
          >
            {displayName}
          </Text>
        )}
      </group>
    </group>
  );
}

//#region Shape rendering helpers
export function ShapeMesh({
  shape,
  w,
  h,
  radius,
  color,
  outline,
  offsetX,
  offsetY,
  opacity,
  outlineOpacity,
  ...events
}) {
  if (shape === "circle") {
    return (
      <group position={[offsetX, offsetY, 0]}>
        <mesh {...events}>
          <circleGeometry args={[radius, CIRCLE_SEGMENTS]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <ringGeometry args={[radius - 0.5, radius, CIRCLE_SEGMENTS]} />
          <meshBasicMaterial color={color} transparent opacity={outlineOpacity} />
        </mesh>
      </group>
    );
  }

  return (
    <>
      <mesh position={[offsetX, offsetY, 0]} {...events}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <RectOutline
        width={w}
        height={h}
        centerX={offsetX}
        centerY={offsetY}
        color={color}
        outline={outline ?? "solid"}
        outlineOpacity={outlineOpacity}
      />
    </>
  );
}
//#endregion

//#region Outline helpers
const DASH_STYLES = {
  dashed: { dashSize: 4, gapSize: 3 },
  dotted: { dashSize: 1, gapSize: 2 },
};

function RectOutline({ width, height, centerX, centerY, color, outline, outlineOpacity }) {
  const lineRef = useRef();

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const hw = width / 2;
    const hh = height / 2;
    const positions = new Float32Array([
      centerX - hw,
      centerY + hh,
      0,
      centerX + hw,
      centerY + hh,
      0,
      centerX + hw,
      centerY - hh,
      0,
      centerX - hw,
      centerY - hh,
      0,
      centerX - hw,
      centerY + hh,
      0,
    ]);
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [width, height, centerX, centerY]);

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
    }
  }, [geometry]);

  const isSolid = outline === "solid";
  const style = DASH_STYLES[outline] ?? DASH_STYLES.dashed;

  return (
    <line ref={lineRef} geometry={geometry}>
      {isSolid ? (
        <lineBasicMaterial color={color} transparent opacity={outlineOpacity} />
      ) : (
        <lineDashedMaterial
          color={color}
          dashSize={style.dashSize}
          gapSize={style.gapSize}
          transparent
          opacity={outlineOpacity}
        />
      )}
    </line>
  );
}
//#endregion
