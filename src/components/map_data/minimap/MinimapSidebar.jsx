import { useState } from "react";
import {
  Box,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
} from "@mui/material";

import { extractRooms } from "../MapDataDialog";

/**
 * Renders a tab nav at the top with the tabs: Room List and Collectibles.
 * - Room List: Shows a table of all rooms (scrollable, max height matches the canvas)
 *   - Columns: Room Name, Position (X,Y), Size (Width x Height)
 *   - Has hover feedback, and clicking a row centers the minimap on that room.
 * - Collectibles: Shows a table of all collectibles in the map (scrollable, max height matches the canvas)
 *   - Columns: Collectible Name (Golden Berry, Silver Berry, Strawberry), Position (X,Y), Room Name
 *   - Has hover feedback, and clicking a row centers the minimap on that collectible.
 */
export function MinimapSidebar({ mapData }) {
  const [tab, setTab] = useState("rooms");
  const rooms = extractRooms(mapData);

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
                  onClick={() => console.log("Center on room:", room.name)}
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
