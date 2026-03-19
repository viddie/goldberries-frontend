import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { extractRooms } from "../MapDataDialog";

import { useMinimapStore } from "./useMinimapStore";
import { extractCollectibles, isRoomHidden } from "./entity_definitions";

export function MinimapSidebar({ mapData }) {
  const [tab, setTab] = useState("rooms");
  const allRooms = extractRooms(mapData);
  const allCollectibles = useMemo(() => extractCollectibles(mapData), [mapData]);
  const antiSpoilerMode = useMinimapStore((s) => s.antiSpoilerMode);
  const selectedObject = useMinimapStore((s) => s.selectedObject);

  const rooms = useMemo(
    () => (antiSpoilerMode ? allRooms.filter((r) => !isRoomHidden(r)) : allRooms),
    [allRooms, antiSpoilerMode],
  );
  const collectibles = useMemo(() => {
    if (!antiSpoilerMode) return allCollectibles;
    const hiddenRoomNames = new Set(allRooms.filter((r) => isRoomHidden(r)).map((r) => r.name));
    return allCollectibles.filter((c) => !hiddenRoomNames.has(c.room));
  }, [allRooms, allCollectibles, antiSpoilerMode]);
  const clearSelectedObject = useMinimapStore((s) => s.clearSelectedObject);
  const navigateToRoom = useMinimapStore((s) => s.navigateToRoom);
  const navigateToPoint = useMinimapStore((s) => s.navigateToPoint);

  const handleCollectibleClick = (c) => {
    // Find the room containing the collectible, as its position is needed. the collectible pos is merely an offset.
    const room = rooms.find((r) => r.name === c.room);
    if (!room) return;
    const point = { x: room.x + c.x, y: room.y + c.y };
    navigateToPoint(point.x, point.y);
  };

  if (selectedObject) {
    return <ObjectDetailPanel object={selectedObject.data} onBack={clearSelectedObject} />;
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth" sx={{ mb: 2 }}>
        <Tab value="rooms" label={`Rooms (${rooms.length})`} />
        <Tab value="collectibles" label={`Collectibles (${collectibles.length})`} />
      </Tabs>
      {tab === "rooms" && (
        <TableContainer
          sx={{
            maxHeight: "736px",
            borderRadius: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <TableRow
                  key={room.name}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigateToRoom(room)}
                >
                  <TableCell>{room.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {tab === "collectibles" && (
        <TableContainer
          sx={{
            maxHeight: "736px",
            borderRadius: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Room</TableCell>
                {/* <TableCell>ID</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {collectibles.map((c, i) => (
                <TableRow key={i} hover sx={{ cursor: "pointer" }} onClick={() => handleCollectibleClick(c)}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{c.name}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {c.room}
                  </TableCell>
                  {/* <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{c.id}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

function ObjectDetailPanel({ object, onBack }) {
  const detail = {
    name: object.name,
    attributes: object.attributes,
    ...(object.children && object.children.length > 0 ? { children: object.children } : {}),
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} fontSize="small" fixedWidth />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {object.name}
        </Typography>
      </Box>
      <Box
        component="pre"
        sx={{
          maxHeight: "736px",
          overflow: "auto",
          p: 1.5,
          m: 0,
          borderRadius: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: "0.75rem",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {JSON.stringify(detail, null, 2)}
      </Box>
    </Box>
  );
}
