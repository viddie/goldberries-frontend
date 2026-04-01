import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Plane, Vector3 } from "three";
import { Hud, OrthographicCamera, Text } from "@react-three/drei";

import { unprojectCelestePoint } from "../MapDataViewer";

import { Arrow } from "./Arrow";

const targetVec = new Vector3();
const plane = new Plane(new Vector3(0, 0, 1), 0);

export function MouseWorldPos() {
  const textRef = useRef();

  // Use 'pointer' instead of 'mouse'
  const { viewport, raycaster, camera, pointer, size } = useThree();

  useFrame(() => {
    // 2. Update raycaster from the pointer (-1 to +1 coordinates)
    raycaster.setFromCamera(pointer, camera);

    // 3. Find where the ray hits the Z=0 plane
    raycaster.ray.intersectPlane(plane, targetVec);

    if (textRef.current) {
      // 4. Update the text string
      const unprojected = unprojectCelestePoint({ x: targetVec.x, y: targetVec.y });
      textRef.current.text = `X: ${Math.round(unprojected.x)}, Y: ${Math.round(unprojected.y)}`;
    }
  });

  return (
    <Hud>
      <OrthographicCamera
        makeDefault
        left={-size.width / 2}
        right={size.width / 2}
        top={size.height / 2}
        bottom={-size.height / 2}
        near={-1000}
        far={1000}
      />
      <Text
        position={[-size.width / 2 + 5, size.height / 2 - 30, 0]}
        ref={textRef}
        fontSize={20}
        color="yellow"
        anchorX="left"
        anchorY="bottom"
      >
        0, 0
      </Text>

      {/* Small arrows to indicate X and Y directions, with labels */}
      <group position={[-size.width / 2 + 15, size.height / 2 - 40, 0]}>
        <Arrow from={{ x: 0, y: 0 }} to={{ x: 50, y: 0 }} color="red" thickness={2} />
        <Text position={[55, 0, 0]} fontSize={12} color="red" anchorX="left" anchorY="middle">
          X
        </Text>
        <Arrow from={{ x: 0, y: 0 }} to={{ x: 0, y: -50 }} color="green" thickness={2} />
        <Text position={[0, -55, 0]} fontSize={12} color="green" anchorX="center" anchorY="top">
          Y
        </Text>
      </group>
    </Hud>
  );
}
