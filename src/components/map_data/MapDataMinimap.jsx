import { Box } from "@mui/material";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";

export function MapDataMinimap() {
  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        borderRadius: 1,
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Canvas orthographic frameloop="demand" camera={{ zoom: 1, position: [0, 0, 100] }}>
        <MapControls makeDefault enableRotate={false} zoomSpeed={1.2} panSpeed={1} />
        <mesh>
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </Canvas>
    </Box>
  );
}
