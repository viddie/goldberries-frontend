import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { ShaderMaterial } from "three";

import { useViewerStore } from "./useViewerStore";

const vertexShader = `
varying vec2 vWorldPos;
void main() {
  // Transform to world position
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xy;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = `
varying vec2 vWorldPos;
uniform float uGridSize;
uniform float uLineWidth;
uniform vec3 uColor;
uniform float uOpacity;

void main() {
  vec2 grid = abs(fract(vWorldPos / uGridSize - 0.5) - 0.5);
  vec2 line = grid / fwidth(vWorldPos / uGridSize);
  float minLine = min(line.x, line.y);
  float alpha = 1.0 - min(minLine, 1.0);
  gl_FragColor = vec4(uColor, alpha * uOpacity);
}
`;

const GRID_SIZES = { tile: 8.0, pixel: 1.0 };

export function TileGrid() {
  const { camera } = useThree();
  const gridType = useViewerStore((s) => s.gridType);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uGridSize: { value: GRID_SIZES[gridType] ?? 8.0 },
          uLineWidth: { value: 1.0 },
          uColor: { value: [1.0, 1.0, 1.0] },
          uOpacity: { value: 0.06 },
        },
        transparent: true,
        depthWrite: false,
      }),
    [gridType],
  );

  if (gridType === "none") return null;

  // Make the grid plane large enough to always cover the viewport
  const size = 1000000;

  return (
    <mesh position={[camera.position.x, camera.position.y, -1]} material={material}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}
