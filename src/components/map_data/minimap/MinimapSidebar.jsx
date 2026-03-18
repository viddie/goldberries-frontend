import { useState } from "react";
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

/**
 * Renders a tab nav at the top with the tabs: Room List and Collectibles.
 * When an important entity is clicked on the minimap, switches to an entity detail panel.
 *
 * - Room List: Shows a table of all rooms (scrollable, max height matches the canvas)
 *   - Columns: Room Name
 *   - Has hover feedback, and clicking a row centers the minimap on that room.
 * - Collectibles: Shows a table of all collectibles in the map (scrollable, max height matches the canvas)
 * - Entity Detail: Shows all attributes and children of the selected entity as JSON.
 */
export function MinimapSidebar({ mapData }) {
  const [tab, setTab] = useState("rooms");
  const rooms = extractRooms(mapData);
  const selectedEntity = useMinimapStore((s) => s.selectedEntity);
  const clearSelectedEntity = useMinimapStore((s) => s.clearSelectedEntity);
  const navigateToRoom = useMinimapStore((s) => s.navigateToRoom);

  if (selectedEntity) {
    return <EntityDetailPanel entity={selectedEntity} onBack={clearSelectedEntity} />;
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth" sx={{ mb: 2 }}>
        <Tab value="rooms" label={`Rooms (${rooms.length})`} />
        <Tab value="collectibles" label="Collectibles" />
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
    </Box>
  );
}

function EntityDetailPanel({ entity, onBack }) {
  const detail = {
    name: entity.name,
    attributes: entity.attributes,
    ...(entity.children && entity.children.length > 0 ? { children: entity.children } : {}),
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} fontSize="small" fixedWidth />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {entity.name}
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
