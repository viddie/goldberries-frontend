import { Box, Grid } from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Text } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, NearestFilter } from "three";

import { extractRooms } from "./MapDataDialog";
import { Controls, EntityListRenderer, MinimapSidebar, MouseWorldPos } from "./minimap";
import { MinimapSettings } from "./minimap/MinimapSettings";
import { TileGrid } from "./minimap/TileGrid";
import { useMinimapStore } from "./minimap/useMinimapStore";
import { LAYERS, isRoomHidden } from "./minimap/entity_definitions";

export function MapDataMinimap({ mapData, campaign, map }) {
  const allRooms = extractRooms(mapData);
  const antiSpoilerMode = useMinimapStore((s) => s.antiSpoilerMode);
  const debugMode = useMinimapStore((s) => s.debugMode);
  const rooms = useMemo(
    () => (antiSpoilerMode ? allRooms.filter((r) => !isRoomHidden(r)) : allRooms),
    [allRooms, antiSpoilerMode],
  );
  const bounds = getEnclosingBounds(rooms);
  const clearSelectedObject = useMinimapStore((s) => s.clearSelectedObject);
  const navigateToRoom = useMinimapStore((s) => s.navigateToRoom);
  const [ready, setReady] = useState(false);
  const initialFocusDone = useRef(false);

  const defaultZoom = 1;
  const defaultPosition = [0, 0, 100];

  const handlePointerMissed = useCallback(() => {
    clearSelectedObject();
  }, [clearSelectedObject]);

  // Focus the first room once the canvas has rendered
  useEffect(() => {
    if (ready && !initialFocusDone.current && rooms.length > 0) {
      initialFocusDone.current = true;
      navigateToRoom(rooms[0]);
    }
  }, [ready, rooms, navigateToRoom]);

  const handleCreated = useCallback(() => {
    setReady(true);
  }, []);

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
            position: "relative",
          }}
        >
          <MinimapSettings />
          <Canvas
            orthographic
            frameloop="demand"
            camera={{ zoom: defaultZoom, position: defaultPosition }}
            onPointerMissed={handlePointerMissed}
            onCreated={handleCreated}
          >
            <Controls />
            {debugMode && <MouseWorldPos />}
            <TileGrid />
            {!ready && (
              <Text
                position={[0, 0, LAYERS.UI]}
                fontSize={24}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                Loading...
              </Text>
            )}
            {rooms.map((room) => (
              <RoomRenderer key={room.name} room={room} />
            ))}
          </Canvas>
        </Box>
      </Grid>
    </Grid>
  );
}

const CULL_SIMPLE_SHAPES_AT_ZOOM = 0.15;

function RoomRenderer({ room }) {
  const [contentsVisible, setContentsVisible] = useState(true);
  const [simpleShapesVisible, setSimpleShapesVisible] = useState(true);
  const visibleRef = useRef(true);
  const simpleVisibleRef = useRef(true);
  const name = room.name;
  const bounds = {
    x: room.x,
    y: -room.y,
    width: room.width,
    height: room.height,
  };

  //#region Room culling
  useFrame(({ camera, size }) => {
    const halfW = size.width / (2 * camera.zoom);
    const halfH = size.height / (2 * camera.zoom);

    const isVisible =
      bounds.x + bounds.width >= camera.position.x - halfW &&
      bounds.x <= camera.position.x + halfW &&
      bounds.y >= camera.position.y - halfH &&
      bounds.y - bounds.height <= camera.position.y + halfH;

    if (isVisible !== visibleRef.current) {
      visibleRef.current = isVisible;
      setContentsVisible(isVisible);
    }

    const shapesVisible = camera.zoom >= CULL_SIMPLE_SHAPES_AT_ZOOM;
    if (shapesVisible !== simpleVisibleRef.current) {
      simpleVisibleRef.current = shapesVisible;
      setSimpleShapesVisible(shapesVisible);
    }
  });
  //#endregion

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
      {/* Room outline always renders (cheap, auto frustum-culled) */}
      <mesh position={[bounds.width / 2, -bounds.height / 2, LAYERS.BACKGROUND]}>
        <planeGeometry args={[bounds.width, bounds.height]} />
        <meshBasicMaterial color="black" transparent opacity={0.2} />
        <Edges linewidth={2} scale={1} threshold={15} color="white" />
      </mesh>
      {/* Only render expensive content when room is in viewport */}
      {contentsVisible && (
        <>
          {tilesTexture && (
            <mesh position={[bounds.width / 2, -bounds.height / 2, LAYERS.SOLIDS]}>
              <planeGeometry args={[bounds.width, bounds.height]} />
              <meshBasicMaterial map={tilesTexture} transparent />
            </mesh>
          )}
          <Text position={[5, -5, LAYERS.UI]} fontSize={18} anchorX="left" anchorY="top" color="white">
            {name}
          </Text>
          <EntityListRenderer
            entities={room.entities}
            triggers={room.triggers}
            simpleShapesVisible={simpleShapesVisible}
          />
        </>
      )}
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
