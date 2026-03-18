import { useEffect, useRef } from "react";
import { Matrix4, Quaternion, Vector3 } from "three";

const _matrix = new Matrix4();
const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();

export function InstancedPlane({ entries, texture }) {
  const meshRef = useRef();
  const count = entries.length;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < count; i++) {
      const { x, y, z, scaleX, scaleY } = entries[i];
      _position.set(x, y, z);
      _scale.set(scaleX, scaleY, 1);
      _matrix.compose(_position, _quaternion, _scale);
      mesh.setMatrixAt(i, _matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [entries, count]);

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} key={count} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent />
    </instancedMesh>
  );
}
