import { Vector3 } from "three";

export function Arrow({ from, to, depth = 0, color = "white" }) {
  const dir = new Vector3(to.x - from.x, to.y - from.y, 0);
  const length = dir.length();
  dir.normalize();

  const angle = Math.atan2(dir.y, dir.x);

  return (
    <group position={[from.x, from.y, depth]} rotation={[0, 0, angle]}>
      <mesh position={[length / 2, 0, 0]}>
        <boxGeometry args={[length, 2, 1]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[length, 0, depth]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[4, 8, 4]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
