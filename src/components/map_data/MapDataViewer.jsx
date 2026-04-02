import { Box, Typography } from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Text, useProgress } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, NearestFilter } from "three";

import { extractRooms } from "./MapDataDialog";
import { Controls, EntityListRenderer, ViewerSidebar, MouseWorldPos } from "./viewer";
import { ViewerSettings } from "./viewer/ViewerSettings";
import { TileGrid } from "./viewer/TileGrid";
import { useViewerStore } from "./viewer/useViewerStore";
import { LAYERS, isRoomHidden } from "./viewer/entity_definitions";

export function MapDataViewer({ mapData, campaign, map, initialRoom, onRoomNavigate }) {
  const allRooms = extractRooms(mapData);
  const antiSpoilerMode = useViewerStore((s) => s.antiSpoilerMode);
  const debugMode = useViewerStore((s) => s.debugMode);
  const rooms = useMemo(
    () => (antiSpoilerMode ? allRooms.filter((r) => !isRoomHidden(r)) : allRooms),
    [allRooms, antiSpoilerMode],
  );
  const bounds = getEnclosingBounds(rooms);
  const clearSelectedObject = useViewerStore((s) => s.clearSelectedObject);
  const navigateToRoom = useViewerStore((s) => s.navigateToRoom);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const initialFocusDone = useRef(false);

  const {
    active: texturesLoading,
    progress: textureProgress,
    loaded: texturesLoaded,
    total: texturesTotal,
  } = useProgress();
  const texturesReady = canvasReady && !texturesLoading && textureProgress >= 100;
  const allReady = canvasReady && texturesReady && fontsReady;

  const defaultZoom = 1;
  const defaultPosition = [0, 0, 100];

  const handlePointerMissed = useCallback(() => {
    clearSelectedObject();
  }, [clearSelectedObject]);

  // Focus the initial room (by name) or the first room once everything has loaded
  useEffect(() => {
    if (allReady && !initialFocusDone.current && rooms.length > 0) {
      initialFocusDone.current = true;
      const targetRoom = initialRoom ? rooms.find((r) => r.name === initialRoom) : null;
      navigateToRoom(targetRoom ?? rooms[0]);
    }
  }, [allReady, rooms, navigateToRoom, initialRoom]);

  const handleCreated = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleFontSync = useCallback(() => {
    setFontsReady(true);
  }, []);

  const loadingLabel = !canvasReady
    ? "Initializing..."
    : !texturesReady
      ? `Loading textures... ${texturesLoaded}/${texturesTotal}`
      : !fontsReady
        ? "Loading labels..."
        : "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        height: { md: "calc(100vh - 130px)" },
        minHeight: 300,
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: 300 },
          flexShrink: 0,
          order: { xs: 1, md: 0 },
          maxHeight: { xs: "50svh", md: "unset" },
          overflow: "hidden",
          minHeight: { md: 0 },
        }}
      >
        <ViewerSidebar mapData={mapData} onRoomNavigate={onRoomNavigate} />
      </Box>
      <Box
        sx={{
          flex: { md: 1 },
          minWidth: 0,
          height: { xs: "70svh", md: "auto" },
          minHeight: { md: 0 },
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        {!allReady && <ViewerLoadingOverlay label={loadingLabel} />}
        <ViewerSettings />
        <Canvas
          style={{ visibility: allReady ? "visible" : "hidden" }}
          orthographic
          frameloop="demand"
          camera={{ zoom: defaultZoom, position: defaultPosition }}
          onPointerMissed={handlePointerMissed}
          onCreated={handleCreated}
        >
          <Controls />
          {debugMode && <MouseWorldPos />}
          <TileGrid />
          <Suspense fallback={null}>
            <FontSentinel onReady={handleFontSync} />
            {rooms.map((room) => (
              <RoomRenderer key={room.name} room={room} />
            ))}
          </Suspense>
        </Canvas>
      </Box>
    </Box>
  );
}

function ViewerLoadingOverlay({ label }) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#272727",
      }}
    >
      <Typography variant="body1" color="white">
        {label}
      </Typography>
    </Box>
  );
}

function FontSentinel({ onReady }) {
  const called = useRef(false);
  const handleSync = useCallback(() => {
    if (!called.current) {
      called.current = true;
      onReady();
    }
  }, [onReady]);

  return (
    <Text position={[0, 0, -9999]} fontSize={1} onSync={handleSync} visible={false}>
      .
    </Text>
  );
}

const CULL_SIMPLE_SHAPES_AT_ZOOM = 0.2;
const CULL_BATCHED_ENTITIES_AT_ZOOM = 0.02;

function RoomRenderer({ room }) {
  const [contentsVisible, setContentsVisible] = useState(true);
  const [simpleShapesVisible, setSimpleShapesVisible] = useState(true);
  const [batchedEntitiesVisible, setBatchedEntitiesVisible] = useState(true);
  const visibleRef = useRef(true);
  const simpleVisibleRef = useRef(true);
  const batchedVisibleRef = useRef(true);
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

    const batchedVisible = camera.zoom >= CULL_BATCHED_ENTITIES_AT_ZOOM;
    if (batchedVisible !== batchedVisibleRef.current) {
      batchedVisibleRef.current = batchedVisible;
      setBatchedEntitiesVisible(batchedVisible);
    }
  });
  //#endregion

  const tilesTexture = useMemo(() => {
    if (!room.solidsText) return null;

    const rows = room.solidsText.split("\n");
    const tileRows = Math.ceil(room.height / 8);
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
  }, [room.solidsText, room.width, room.height]);

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
            batchedEntitiesVisible={batchedEntitiesVisible}
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
