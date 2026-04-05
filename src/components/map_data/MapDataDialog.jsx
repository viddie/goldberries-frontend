import {
  Box,
  InputAdornment,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { faInfoCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getQueryData, useGetMapData } from "../../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "../basic";

import { MapDataViewer } from "./MapDataViewer";
import { isRoomHidden } from "./viewer/entity_definitions";
import { useViewerStore } from "./viewer/useViewerStore";

export function MapDataDialog({ mapId, binPath, campaignId, initialRoom, onRoomNavigate }) {
  const query = useGetMapData(mapId, { campaignId, binPath });
  const mapData = getQueryData(query);
  const antiSpoilerMode = useViewerStore((s) => s.antiSpoilerMode);

  const rooms = useMemo(() => {
    if (!mapData) return [];
    const allRooms = extractRooms(mapData);
    return antiSpoilerMode ? allRooms.filter((r) => !isRoomHidden(r)) : allRooms;
  }, [mapData, antiSpoilerMode]);

  return (
    <Stack spacing={2}>
      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}

      {mapData && (
        <>
          {/* Map Viewer */}
          <MapDataViewer mapData={mapData} initialRoom={initialRoom} onRoomNavigate={onRoomNavigate} />

          {/* Room List */}
          <RoomListSection rooms={rooms} />
        </>
      )}
    </Stack>
  );
}

//#region Room List
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function filterBySearch(items, search) {
  if (!search) return items;
  const lower = search.toLowerCase();
  return items.filter((item) => item.name.toLowerCase().includes(lower));
}

function RoomListSection({ rooms }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.map_data.rooms" });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 1000);

  if (rooms.length === 0) return null;

  const selectedRoom = selectedIndex !== null ? rooms[selectedIndex] : null;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {t("title", { count: rooms.length })}
        </Typography>
        <TextField
          size="small"
          placeholder={t("search_placeholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faSearch} size="sm" style={{ opacity: 0.5 }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 200 }}
        />
      </Stack>
      <Stack direction="row" gap={2} alignItems="flex-start">
        <TableContainer
          sx={{
            width: "fit-content",
            flexShrink: 0,
            borderRadius: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("col_name")}</TableCell>
                <TableCell>{t("col_position")}</TableCell>
                <TableCell>{t("col_size")}</TableCell>
                <TableCell align="right">{t("col_entities")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room, index) => (
                <TableRow
                  key={index}
                  hover
                  selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {room.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                      {room.x}, {room.y}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                      {room.width}×{room.height}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{filterBySearch(room.entities, search).length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedRoom && (
          <RoomDetailsPanel room={selectedRoom} search={search} marginTop={selectedIndex * 33} />
        )}
      </Stack>
    </Box>
  );
}
//#endregion

//#region Room Details Panel
function RoomDetailsPanel({ room, search, marginTop }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.map_data.room_details" });
  const [tab, setTab] = useState("entities");

  const filteredEntities = useMemo(() => filterBySearch(room.entities, search), [room.entities, search]);
  const filteredTriggers = useMemo(() => filterBySearch(room.triggers, search), [room.triggers, search]);

  marginTop = Math.max(0, marginTop - 300);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        mt: `${marginTop}px`,
        borderRadius: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-around"
        sx={{ p: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <SolidTilesCanvas solidsText={room.solidsText} roomWidth={room.width} roomHeight={room.height} />
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ minHeight: 36 }}>
        <Tab label={t("tab_entities")} value="entities" sx={{ minHeight: 36, py: 0 }} />
        <Tab label={t("tab_triggers")} value="triggers" sx={{ minHeight: 36, py: 0 }} />
      </Tabs>
      <Box sx={{ p: 1 }}>
        {tab === "entities" && <EntitiesTab entities={filteredEntities} />}
        {tab === "triggers" && <TriggersTab triggers={filteredTriggers} />}
      </Box>
    </Box>
  );
}

function EntitiesTab({ entities }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.map_data.room_details" });

  if (entities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        {t("no_entities")}
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("col_name")}</TableCell>
            <TableCell>{t("col_position")}</TableCell>
            <TableCell width={1}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map((e, i) => (
            <EntityRow key={i} entity={e} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function EntityRow({ entity }) {
  const { x, y, ...rest } = entity.attributes;
  // Remove id and position from extra attributes
  const { id: _id, ...extra } = rest;
  const hasExtra = Object.keys(extra).length > 0;

  const tooltipContent = hasExtra
    ? Object.entries(extra)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join("\n")
    : "";

  return (
    <TableRow>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
          {entity.name}
        </Typography>
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {x ?? "?"}, {y ?? "?"}
        </Typography>
      </TableCell>
      <TableCell>
        {hasExtra && (
          <Tooltip
            title={
              <span style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.75rem" }}>
                {tooltipContent}
              </span>
            }
            arrow
          >
            <span style={{ display: "inline-flex", cursor: "help", opacity: 0.6 }}>
              <FontAwesomeIcon icon={faInfoCircle} size="sm" />
            </span>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}

function TriggersTab({ triggers }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map_data.map_data.room_details" });

  if (triggers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        {t("no_triggers")}
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("col_name")}</TableCell>
            <TableCell>{t("col_position")}</TableCell>
            <TableCell>{t("col_size")}</TableCell>
            <TableCell width={1}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {triggers.map((e, i) => (
            <TriggerRow key={i} trigger={e} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TriggerRow({ trigger }) {
  const { x, y, width, height, ...rest } = trigger.attributes;
  const { id: _id, ...extra } = rest;
  const hasExtra = Object.keys(extra).length > 0;

  const tooltipContent = hasExtra
    ? Object.entries(extra)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join("\n")
    : "";

  return (
    <TableRow>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
          {trigger.name}
        </Typography>
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {x ?? "?"}, {y ?? "?"}
        </Typography>
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {width ?? "?"}×{height ?? "?"}
        </Typography>
      </TableCell>
      <TableCell>
        {hasExtra && (
          <Tooltip
            title={
              <span style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.75rem" }}>
                {tooltipContent}
              </span>
            }
            arrow
          >
            <span style={{ display: "inline-flex", cursor: "help", opacity: 0.6 }}>
              <FontAwesomeIcon icon={faInfoCircle} size="sm" />
            </span>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}

function SolidTilesCanvas({ solidsText, roomWidth, roomHeight, scale = 4 }) {
  const canvasRef = useRef(null);
  const TILE_SIZE = 8;

  // Room dimensions in pixels; each tile is 8px in Celeste
  const tilesWide = Math.ceil(roomWidth / TILE_SIZE);
  const tilesHigh = Math.ceil(roomHeight / TILE_SIZE);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !solidsText) return;

    const rows = solidsText.split("\n");
    const tileRows = tilesHigh;
    const tileCols = tilesWide;

    canvas.width = tileCols * scale;
    canvas.height = tileRows * scale;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < tileRows; r++) {
      const row = rows[r] || "";
      for (let c = 0; c < tileCols; c++) {
        const ch = c < row.length ? row[c] : "0";
        if (ch !== "0" && ch !== "") {
          ctx.fillStyle = "#b0b0b0";
        } else {
          ctx.fillStyle = "#1a1a2e";
        }
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }, [solidsText, tilesWide, tilesHigh]);

  useEffect(() => {
    draw();
  }, [draw]);

  if (!solidsText) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        No solid tile data available.
      </Typography>
    );
  }

  return (
    <Box>
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: "pixelated",
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </Box>
  );
}
//#endregion

//#region Data extraction utilities
const fillerRoomEntities = new Set(["player", "VivHelper/InterRoomSpawner"]);
export function extractRooms(mapData) {
  const levelsNode = mapData.children?.find((c) => c.name === "levels");
  if (!levelsNode) return [];

  return levelsNode.children
    .filter((level) => {
      // Filter out filler rooms (rooms without a player entity)
      const entitiesNode = level.children?.find((c) => c.name === "entities");
      return entitiesNode?.children?.some((e) => fillerRoomEntities.has(e.name)) ?? false;
    })
    .map((level) => {
      const attr = level.attributes || {};
      const entitiesNode = level.children?.find((c) => c.name === "entities");
      const triggersNode = level.children?.find((c) => c.name === "triggers");
      const solidsNode = level.children?.find((c) => c.name === "solids");

      const entities = entitiesNode?.children ?? [];
      const triggers = triggersNode?.children ?? [];
      const solidsText = solidsNode?.attributes?.innerText ?? null;

      return {
        name: attr.name ?? "?",
        x: attr.x ?? 0,
        y: attr.y ?? 0,
        width: attr.width ?? 0,
        height: attr.height ?? 0,
        entityCount: entities.length,
        entities,
        triggers,
        solidsText,
      };
    });
}

//#endregion
