import { Vector3 } from "three";

export function Arrow({ from, to, depth = 0, color = "white", thickness = 1, opacity = 1 }) {
  const dir = new Vector3(to.x - from.x, to.y - from.y, 0);
  const length = dir.length();
  dir.normalize();

  const angle = Math.atan2(dir.y, dir.x);

  return (
    <group position={[from.x, from.y, depth]} rotation={[0, 0, angle]}>
      <mesh position={[length / 2, 0, 0]}>
        <boxGeometry args={[length, thickness, thickness]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh position={[length, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[thickness * 2, thickness * 4, 4]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}
