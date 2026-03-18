import { MapControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function Controls() {
  const { invalidate } = useThree();
  return (
    <MapControls
      makeDefault
      enableRotate={false}
      screenSpacePanning
      zoomSpeed={1.2}
      panSpeed={1}
      onChange={invalidate}
    />
  );
}
