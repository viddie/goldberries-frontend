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
 * Text wrapped in curly braces like "{LockBlock}" is treated as a single block on one line
 * (braces are stripped in the output).
 * Example: "floatySpaceBlock" → "floaty\nSpace\nBlock"
 */
function splitOnCapitals(name) {
  const simpleName = name.includes("/") ? name.split("/").pop() : name;
  // Extract curly-brace blocks, split the rest on camelCase, then restore blocks
  const blocks = [];
  const withPlaceholders = simpleName.replace(/\{([^}]*)\}/g, (_, inner) => {
    blocks.push(inner);
    return `\u200B${blocks.length - 1}\u200B`;
  });
  const split = withPlaceholders.replace(/([a-z0-9])([A-Z])/g, "$1\n$2");
  return split.replace(/\u200B(\d+)\u200B/g, (_, i) => "\n" + blocks[Number(i)]);
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

//#region Shape descriptors
/**
 * Shape descriptors define how shapes are composed from primitive sub-shapes.
 * Each descriptor receives (attr, def, resolve) and returns:
 *
 * ShapeInfo = {
 *   parts: Part[]                    — primitives to render
 *   labelArea: { w, h, cx, cy }     — text sizing/placement relative to entity position
 *   centerAnchored: boolean          — if true, position = (attr.x, -attr.y), ignoring def offset
 * }
 *
 * Part = { type: "rect", w, h, cx, cy } | { type: "circle", radius, cx, cy }
 * cx, cy are center positions relative to entity position in R3F coordinates (Y-up).
 */

/**
 * Converts a Celeste Hitbox(w, h, offsetX, offsetY) definition (top-left offset, Y-down)
 * to a R3F rect part (center-positioned, Y-up).
 */
function hitboxToPart(w, h, offsetX, offsetY) {
  return { type: "rect", w, h, cx: offsetX + w / 2, cy: -(offsetY + h / 2) };
}

function anchorOffset(anchorX, anchorY, w, h) {
  const ox = anchorX === "center" ? 0 : anchorX === "right" ? -w / 2 : w / 2;
  const oy = anchorY === "center" ? 0 : anchorY === "bottom" ? h / 2 : -h / 2;
  return [ox, oy];
}

const SHAPE_DESCRIPTORS = {
  box: (attr, def, r) => {
    const w = r(def.width, attr, attr.width > 0 ? attr.width : 8);
    const h = r(def.height, attr, attr.height > 0 ? attr.height : 8);
    const aX = r(def.anchorX, attr, "left");
    const aY = r(def.anchorY, attr, "top");
    const [cx, cy] = anchorOffset(aX, aY, w, h);
    return {
      parts: [{ type: "rect", w, h, cx, cy }],
      labelArea: { w, h, cx, cy },
      centerAnchored: false,
    };
  },
  circle: (attr, def, r) => {
    const w = r(def.width, attr, attr.width > 0 ? attr.width : 8);
    const h = r(def.height, attr, attr.height > 0 ? attr.height : 8);
    const radius = r(def.radius, attr, Math.min(w, h) / 2);
    return {
      parts: [{ type: "circle", radius, cx: 0, cy: 0 }],
      labelArea: { w: radius * 2, h: radius * 2, cx: 0, cy: 0 },
      centerAnchored: false,
    };
  },
  spinner: (attr, def, r) => {
    const w = r(def.width, attr, 16);
    const h = r(def.height, attr, 4);
    const radius = r(def.radius, attr, 6);
    const offset = r(def.offset, attr, undefined);
    const ox = offset?.[0] ?? -8;
    const oy = offset?.[1] ?? -3;
    return {
      parts: [{ type: "circle", radius, cx: 0, cy: 0 }, hitboxToPart(w, h, ox, oy)],
      labelArea: { w: radius * 2, h: radius * 2, cx: 0, cy: 0 },
      centerAnchored: true,
    };
  },
  seeker: () => {
    const parts = [
      hitboxToPart(12, 8, -6, -2), // attack
      hitboxToPart(16, 6, -8, -8), // bounce
    ];
    const bounds = computePartsBounds(parts);
    return {
      parts,
      labelArea: {
        w: bounds.maxX - bounds.minX,
        h: bounds.maxY - bounds.minY,
        cx: (bounds.minX + bounds.maxX) / 2,
        cy: (bounds.minY + bounds.maxY) / 2,
      },
      centerAnchored: true,
    };
  },
  theo: () => {
    const parts = [
      hitboxToPart(8, 10, -4, -10), // base collider
      hitboxToPart(16, 22, -8, -16), // pickup collider
    ];
    const bounds = computePartsBounds(parts);
    return {
      parts,
      labelArea: {
        w: bounds.maxX - bounds.minX,
        h: bounds.maxY - bounds.minY,
        cx: (bounds.minX + bounds.maxX) / 2,
        cy: (bounds.minY + bounds.maxY) / 2,
      },
      centerAnchored: true,
    };
  },
  jelly: () => {
    const parts = [
      hitboxToPart(8, 10, -4, -10), // base collider
      hitboxToPart(20, 22, -10, -16), // pickup collider
    ];
    const bounds = computePartsBounds(parts);
    return {
      parts,
      labelArea: {
        w: bounds.maxX - bounds.minX,
        h: bounds.maxY - bounds.minY,
        cx: (bounds.minX + bounds.maxX) / 2,
        cy: (bounds.minY + bounds.maxY) / 2,
      },
      centerAnchored: true,
    };
  },
  car: () => {
    const parts = [
      hitboxToPart(25, 4, -15, -17),
      hitboxToPart(19, 4, 8, -11),
      hitboxToPart(42, 16, -15, -17),
    ];
    const bounds = computePartsBounds(parts);
    return {
      parts,
      labelArea: {
        w: bounds.maxX - bounds.minX,
        h: bounds.maxY - bounds.minY,
        cx: (bounds.minX + bounds.maxX) / 2,
        cy: (bounds.minY + bounds.maxY) / 2,
      },
      centerAnchored: true,
    };
  },
  fish: () => {
    const parts = [
      hitboxToPart(12, 10, -6, -5),
      hitboxToPart(14, 12, -7, -7),
      { type: "halfCircle", radius: 32, cx: 0, cy: -5, side: "bottom" },
    ];
    const bounds = computePartsBounds(parts);
    return {
      parts,
      labelArea: {
        w: bounds.maxX - bounds.minX,
        h: bounds.maxY - bounds.minY,
        cx: (bounds.minX + bounds.maxX) / 2,
        cy: (bounds.minY + bounds.maxY) / 2,
      },
      centerAnchored: true,
    };
  },
};

/**
 * Computes the axis-aligned bounding box of a set of shape parts.
 */
function computePartsBounds(parts) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const part of parts) {
    if (part.type === "halfCircle") {
      const isH = part.side === "left" || part.side === "right";
      const fullW = isH ? part.radius : part.radius * 2;
      const fullH = isH ? part.radius * 2 : part.radius;
      const oX = part.side === "right" ? 0 : part.side === "left" ? -part.radius : -part.radius;
      const oY = part.side === "bottom" ? -part.radius : part.side === "top" ? 0 : -part.radius;
      minX = Math.min(minX, part.cx + oX);
      maxX = Math.max(maxX, part.cx + oX + fullW);
      minY = Math.min(minY, part.cy + oY);
      maxY = Math.max(maxY, part.cy + oY + fullH);
    } else {
      const halfW = part.type === "circle" ? part.radius : part.w / 2;
      const halfH = part.type === "circle" ? part.radius : part.h / 2;
      minX = Math.min(minX, part.cx - halfW);
      maxX = Math.max(maxX, part.cx + halfW);
      minY = Math.min(minY, part.cy - halfH);
      maxY = Math.max(maxY, part.cy + halfH);
    }
  }
  return { minX, maxX, minY, maxY };
}
//#endregion

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
const _worldPos = new Vector3();

function SimpleShape({ entity, def }) {
  const [hovered, setHovered] = useState(false);
  const selectObject = useMinimapStore((s) => s.selectObject);
  const isSelected = useMinimapStore((s) => s.selectedObject?.data === entity);
  const mainGroupRef = useRef();

  const attr = entity.attributes;
  const color = resolve(def.color, attr, "white");
  const outline = resolve(def.outline, attr, undefined);
  const baseOpacity = resolve(def.opacity, attr, 0.08);
  const nameOverride = resolve(def.name, attr, undefined);
  const offset = resolve(def.offset, attr, undefined);
  const depth = resolve(def.depth, attr, LAYERS.ENTITIES);
  const shapeName = resolve(def.shape, attr, "box");

  // Resolve shape descriptor — produces parts, labelArea, centerAnchored
  const shapeInfo = useMemo(
    () => (SHAPE_DESCRIPTORS[shapeName] ?? SHAPE_DESCRIPTORS.box)(attr, def, resolve),
    [shapeName, attr, def],
  );

  const { parts, labelArea, centerAnchored } = shapeInfo;
  const opacity = isSelected || hovered ? HIGHLIGHT_OPACITY : baseOpacity;
  const outlineOpacity = isSelected ? 1 : hovered ? 0.6 : 0.3;

  const displayName = useMemo(
    () => splitOnCapitals(nameOverride ?? entity.name),
    [nameOverride, entity.name],
  );

  // Center-anchored shapes use raw entity position, others apply def offset
  const x = attr.x + (centerAnchored ? 0 : (offset?.[0] ?? 0));
  const y = -attr.y + (centerAnchored ? 0 : offset ? -offset[1] : 0);

  // Font sizing from label area
  const effectiveSize = Math.min(labelArea.w, labelArea.h);
  const lines = displayName.split("\n");
  const longestLine = Math.max(...lines.map((l) => l.length));
  const maxFontByWidth = (labelArea.w * 0.75) / Math.max(longestLine * 0.6, 1);
  const maxFontByHeight = (labelArea.h * 0.75) / Math.max(lines.length, 1);
  const fontSize = Math.min(maxFontByWidth, maxFontByHeight, effectiveSize * 0.75);

  // Click bounds computed from shape parts
  const shapeBounds = useMemo(() => computePartsBounds(parts), [parts]);

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
      // Compute bounds in world space from the entity group origin, not the individual
      // mesh (which is offset by part.cx/cy and would double-count the part offset).
      mainGroupRef.current.getWorldPosition(_worldPos);
      const bounds = {
        minX: _worldPos.x + shapeBounds.minX,
        maxX: _worldPos.x + shapeBounds.maxX,
        minY: _worldPos.y + shapeBounds.minY,
        maxY: _worldPos.y + shapeBounds.maxY,
      };
      selectObject(entity, depth, bounds);
    },
    [entity, selectObject, depth, shapeBounds],
  );

  //#region Node path
  const nodes = useMemo(() => {
    if (!entity.children) return [];
    return entity.children.filter((c) => c.name === "node");
  }, [entity.children]);

  // Center positions for arrow connections: [entityCenter, node1Center, node2Center, ...]
  const pathPositions = useMemo(() => {
    const mainCenter = { x: x + labelArea.cx, y: y + labelArea.cy };
    const nodePositions = nodes.map((node) => ({
      x: node.attributes.x + (centerAnchored ? 0 : (offset?.[0] ?? 0)) + labelArea.cx,
      y: -node.attributes.y + (centerAnchored ? 0 : offset ? -offset[1] : 0) + labelArea.cy,
    }));
    return [mainCenter, ...nodePositions];
  }, [x, y, labelArea, centerAnchored, nodes, offset]);

  const NODE_OPACITY_FACTOR = 0.4;
  const nodeOpacity = opacity * NODE_OPACITY_FACTOR;
  const nodeOutlineOpacity = outlineOpacity * NODE_OPACITY_FACTOR;
  //#endregion

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
        const nx = node.attributes.x + (centerAnchored ? 0 : (offset?.[0] ?? 0));
        const ny = -node.attributes.y + (centerAnchored ? 0 : offset ? -offset[1] : 0);
        return (
          <group key={i} position={[nx, ny, depth]}>
            <ShapeMesh
              parts={parts}
              color={color}
              outline={outline}
              opacity={nodeOpacity}
              outlineOpacity={nodeOutlineOpacity}
            />
          </group>
        );
      })}

      {/* Main shape */}
      <group ref={mainGroupRef} position={[x, y, depth]}>
        <ShapeMesh
          parts={parts}
          color={color}
          outline={outline}
          opacity={opacity}
          outlineOpacity={outlineOpacity}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={onClick}
        />
        {def.renderer ? (
          <group position={[labelArea.cx, labelArea.cy, 0.1]}>
            <def.renderer entity={entity} def={def} />
          </group>
        ) : displayName ? (
          <Text
            position={[labelArea.cx, labelArea.cy, 0.1]}
            fontSize={fontSize}
            color={color}
            anchorX="center"
            anchorY="middle"
            maxWidth={labelArea.w - 1}
            textAlign="center"
          >
            {displayName}
          </Text>
        ) : null}
      </group>
    </group>
  );
}

//#region Shape rendering helpers
/**
 * Renders a list of shape parts (rects and circles) generically.
 * Event handlers are forwarded to all interactive meshes.
 */
export function ShapeMesh({ parts, color, outline, opacity, outlineOpacity, ...events }) {
  return (
    <group>
      {parts.map((part, i) =>
        part.type === "halfCircle" ? (
          <HalfCirclePart
            key={i}
            part={part}
            color={color}
            opacity={opacity}
            outlineOpacity={outlineOpacity}
            events={events}
          />
        ) : part.type === "circle" ? (
          <group key={i} position={[part.cx, part.cy, 0]}>
            <mesh {...events}>
              <circleGeometry args={[part.radius, CIRCLE_SEGMENTS]} />
              <meshBasicMaterial color={color} transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <ringGeometry args={[part.radius - 0.5, part.radius, CIRCLE_SEGMENTS]} />
              <meshBasicMaterial color={color} transparent opacity={outlineOpacity} />
            </mesh>
          </group>
        ) : (
          <group key={i}>
            <mesh position={[part.cx, part.cy, 0]} {...events}>
              <planeGeometry args={[part.w, part.h]} />
              <meshBasicMaterial color={color} transparent opacity={opacity} />
            </mesh>
            <RectOutline
              width={part.w}
              height={part.h}
              centerX={part.cx}
              centerY={part.cy}
              color={color}
              outline={outline ?? "solid"}
              outlineOpacity={outlineOpacity}
            />
          </group>
        ),
      )}
    </group>
  );
}
//#endregion

//#region Outline helpers
const HALF_CIRCLE_SEGMENTS = 32;

function halfCircleRotation(side) {
  // circleGeometry draws the top half by default (arc from 0 to PI)
  // we rotate to get the desired side
  if (side === "bottom") return Math.PI;
  if (side === "left") return Math.PI / 2;
  if (side === "right") return -Math.PI / 2;
  return 0; // top
}

function HalfCirclePart({ part, color, opacity, outlineOpacity, events }) {
  const rotation = halfCircleRotation(part.side);
  const ringGeo = useMemo(() => {
    const inner = part.radius - 0.5;
    const outer = part.radius;
    const geo = new BufferGeometry();
    const positions = [];
    for (let i = 0; i < HALF_CIRCLE_SEGMENTS; i++) {
      const a1 = (i / HALF_CIRCLE_SEGMENTS) * Math.PI;
      const a2 = ((i + 1) / HALF_CIRCLE_SEGMENTS) * Math.PI;
      // outer edge quad
      positions.push(
        Math.cos(a1) * inner,
        Math.sin(a1) * inner,
        0,
        Math.cos(a1) * outer,
        Math.sin(a1) * outer,
        0,
        Math.cos(a2) * outer,
        Math.sin(a2) * outer,
        0,
        Math.cos(a1) * inner,
        Math.sin(a1) * inner,
        0,
        Math.cos(a2) * outer,
        Math.sin(a2) * outer,
        0,
        Math.cos(a2) * inner,
        Math.sin(a2) * inner,
        0,
      );
    }
    // flat edge (diameter line)
    const hw = 0.25;
    positions.push(
      -part.radius,
      -hw,
      0,
      part.radius,
      -hw,
      0,
      part.radius,
      hw,
      0,
      -part.radius,
      -hw,
      0,
      part.radius,
      hw,
      0,
      -part.radius,
      hw,
      0,
    );
    geo.setAttribute("position", new Float32BufferAttribute(new Float32Array(positions), 3));
    return geo;
  }, [part.radius]);

  return (
    <group position={[part.cx, part.cy, 0]} rotation={[0, 0, rotation]}>
      <mesh {...events}>
        <circleGeometry args={[part.radius, HALF_CIRCLE_SEGMENTS, 0, Math.PI]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, 0.05]} geometry={ringGeo}>
        <meshBasicMaterial color={color} transparent opacity={outlineOpacity} />
      </mesh>
    </group>
  );
}
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
