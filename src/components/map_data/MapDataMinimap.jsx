import { Box, Grid } from "@mui/material";
import { Canvas } from "@react-three/fiber";
import { Edges, Text } from "@react-three/drei";
import { useMemo } from "react";
import { CanvasTexture, NearestFilter } from "three";

import { extractRooms } from "./MapDataDialog";
import { Controls, EntityListRenderer, MinimapSidebar, MouseWorldPos } from "./minimap";

export const LAYERS = {
  BACKGROUND: 0,
  SOLIDS: 10,
  ENTITIES: 20,
  IMPORTANT_ENTITIES: 30,
  UI: 50,
};

export function MapDataMinimap({ mapData, campaign, map }) {
  const rooms = extractRooms(mapData);
  const bounds = getEnclosingBounds(rooms);

  const defaultZoom = 1;
  const defaultPosition = [0, 0, 100];

  return (
    <Grid container spacing={2}>
      <Grid item md={2} display={{ xs: "none", md: "block" }}>
        <MinimapSidebar mapData={mapData} />
      </Grid>
      <Grid item xs={12} md={10}>
        <Box
          sx={{
            width: "100%",
            height: 800,
            borderRadius: 1,
            overflow: "hidden",
            backgroundColor: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Canvas orthographic frameloop="always" camera={{ zoom: defaultZoom, position: defaultPosition }}>
            <Controls />
            <MouseWorldPos />
            {rooms.map((room) => (
              <RoomRenderer key={room.name} room={room} />
            ))}
          </Canvas>
        </Box>
      </Grid>
    </Grid>
  );
}

function RoomRenderer({ room }) {
  const name = room.name;
  const bounds = {
    x: room.x,
    y: -room.y,
    width: room.width,
    height: room.height,
  };

  const tilesTexture = useMemo(() => {
    if (!room.solidsText) return null;

    const rows = room.solidsText.split("\n");
    const tileRows = rows.length;
    const tileCols = Math.ceil(room.width / 8);

    // Create an off-screen canvas
    const canvas = document.createElement("canvas");
    canvas.width = tileCols;
    canvas.height = tileRows;
    const ctx = canvas.getContext("2d");

    // Draw the pixels (1 pixel per tile)
    for (let r = 0; r < tileRows; r++) {
      const row = rows[r] || "";
      for (let c = 0; c < tileCols; c++) {
        const ch = row[c] || "0";
        ctx.fillStyle = ch !== "0" && ch !== "" ? "#b0b0b0" : "#00000000";
        ctx.fillRect(c, r, 1, 1);
      }
    }

    const texture = new CanvasTexture(canvas);
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.flipY = true;

    return texture;
  }, [room.solidsText, room.width]);

  return (
    <group position={[bounds.x, bounds.y, 0]}>
      {tilesTexture && (
        <mesh position={[bounds.width / 2, -bounds.height / 2, LAYERS.SOLIDS]}>
          <planeGeometry args={[bounds.width, bounds.height]} />
          <meshBasicMaterial map={tilesTexture} transparent opacity={0.8} />
        </mesh>
      )}
      <mesh>
        <circleGeometry args={[5]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[bounds.width / 2, -bounds.height / 2, LAYERS.BACKGROUND]}>
        <planeGeometry args={[bounds.width, bounds.height]} />
        <meshBasicMaterial color="black" transparent opacity={0.2} />
        <Edges linewidth={2} scale={1} threshold={15} color="white" />
      </mesh>
      <Text position={[5, -5, LAYERS.UI]} fontSize={18} anchorX="left" anchorY="top" color="white">
        {name}
      </Text>
      <EntityListRenderer entities={room.entities} />
    </group>
  );
}

//#region Utils
function getEnclosingBounds(rooms) {
  if (rooms.length === 0) return { x: 0, y: 0, width: 100, height: 100 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rooms.forEach((room) => {
    minX = Math.min(minX, room.x);
    minY = Math.min(minY, room.y);
    maxX = Math.max(maxX, room.x + room.width);
    maxY = Math.max(maxY, room.y + room.height);
  });

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function projectCelestePoint(point) {
  return { x: point.x, y: -point.y };
}
export function unprojectCelestePoint(point) {
  return { x: point.x, y: -point.y };
}
//#endregion
