import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";

import { extractRooms } from "../MapDataDialog";
import { CollectibleChip } from "../../goldberries";

import { useViewerStore } from "./useViewerStore";
import { extractCollectibles, extractUnhandledEntities, isRoomHidden } from "./entity_definitions";

const UNHANDLED_PAGE_SIZE = 50;

export function ViewerSidebar({ mapData, onRoomNavigate }) {
  const [tab, setTab] = useState("rooms");
  const [unhandledPage, setUnhandledPage] = useState(0);
  const allRooms = extractRooms(mapData);
  const allCollectibles = useMemo(() => extractCollectibles(mapData), [mapData]);
  const antiSpoilerMode = useViewerStore((s) => s.antiSpoilerMode);
  const debugMode = useViewerStore((s) => s.debugMode);
  const selectedObject = useViewerStore((s) => s.selectedObject);

  const rooms = useMemo(
    () => (antiSpoilerMode ? allRooms.filter((r) => !isRoomHidden(r)) : allRooms),
    [allRooms, antiSpoilerMode],
  );
  const collectibles = useMemo(() => {
    if (!antiSpoilerMode) return allCollectibles;
    const hiddenRoomNames = new Set(allRooms.filter((r) => isRoomHidden(r)).map((r) => r.name));
    return allCollectibles.filter((c) => !hiddenRoomNames.has(c.room));
  }, [allRooms, allCollectibles, antiSpoilerMode]);
  const unhandled = useMemo(() => extractUnhandledEntities(rooms), [rooms]);
  const clearSelectedObject = useViewerStore((s) => s.clearSelectedObject);
  const selectObject = useViewerStore((s) => s.selectObject);
  const navigateToRoom = useViewerStore((s) => s.navigateToRoom);
  const navigateToPoint = useViewerStore((s) => s.navigateToPoint);

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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        variant="fullWidth"
        sx={{ mb: 2, flexShrink: 0 }}
      >
        <Tab value="rooms" label={`Rooms (${rooms.length})`} />
        <Tab value="collectibles" label={`Collectibles (${collectibles.length})`} />
        {debugMode && <Tab value="unhandled" label={`Unhandled (${unhandled.length})`} />}
      </Tabs>
      {tab === "rooms" && (
        <TableContainer
          sx={{
            flex: 1,
            overflow: "auto",
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
                  onClick={() => {
                    navigateToRoom(room);
                    onRoomNavigate?.(room.name);
                  }}
                >
                  <TableCell sx={{ wordBreak: "break-all" }}>{room.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {tab === "collectibles" && (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}>
          <CollectibleChipsSummary collectibles={collectibles} />
          <TableContainer
            sx={{
              flex: 1,
              overflow: "auto",
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
                  <TableRow
                    key={i}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleCollectibleClick(c)}
                  >
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{c.name}</TableCell>
                    <TableCell sx={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {c.room}
                    </TableCell>
                    {/* <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{c.id}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {tab === "unhandled" && debugMode && (
        <UnhandledEntitiesTab
          unhandled={unhandled}
          page={unhandledPage}
          onPageChange={setUnhandledPage}
          onNavigate={(entry, event) => {
            navigateToPoint(entry.x, entry.y);
            if (event.ctrlKey) {
              selectObject(entry.entity, 0, {
                minX: entry.x,
                maxX: entry.x,
                minY: entry.y,
                maxY: entry.y,
              });
            }
          }}
        />
      )}
    </Box>
  );
}

function CollectibleChipsSummary({ collectibles }) {
  const summary = useMemo(() => {
    const counts = {};
    for (const item of collectibles) {
      if (!item.formValue) continue;
      const key = `${item.formValue}:${item.formVariant || ""}`;
      counts[key] = counts[key] || { collectibleId: item.formValue, variantId: item.formVariant, count: 0 };
      counts[key].count++;
    }
    return Object.values(counts);
  }, [collectibles]);

  if (summary.length === 0) return null;

  return (
    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
      {summary.map((s) => (
        <CollectibleChip
          key={`${s.collectibleId}:${s.variantId || ""}`}
          collectibleId={s.collectibleId}
          variantId={s.variantId}
          count={String(s.count)}
        />
      ))}
    </Stack>
  );
}

function UnhandledEntitiesTab({ unhandled, page, onPageChange, onNavigate }) {
  const pageItems = useMemo(
    () => unhandled.slice(page * UNHANDLED_PAGE_SIZE, (page + 1) * UNHANDLED_PAGE_SIZE),
    [unhandled, page],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}>
      <TableContainer
        sx={{
          flex: 1,
          overflow: "auto",
          borderRadius: 1,
          backgroundColor: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map((entry, i) => (
              <TableRow
                key={`${entry.type}-${entry.name}-${i}`}
                hover
                sx={{ cursor: "pointer" }}
                onClick={(e) => onNavigate(entry, e)}
              >
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CopyNameButton name={entry.name} />
                    {entry.name}
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {entry.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={unhandled.length}
        page={page}
        onPageChange={(e, newPage) => onPageChange(newPage)}
        rowsPerPage={UNHANDLED_PAGE_SIZE}
        rowsPerPageOptions={[UNHANDLED_PAGE_SIZE]}
        sx={{ ".MuiTablePagination-toolbar": { minHeight: 36 }, flexShrink: 0 }}
      />
    </Box>
  );
}

function CopyNameButton({ name }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip title={copied ? "Copied!" : "Copy name"} arrow>
      <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25 }}>
        <FontAwesomeIcon
          icon={copied ? faCheck : faCopy}
          style={{ fontSize: "0.7rem", color: copied ? "#4caf50" : "rgba(255,255,255,0.5)" }}
        />
      </IconButton>
    </Tooltip>
  );
}

function ObjectDetailPanel({ object, onBack }) {
  const detail = {
    name: object.name,
    attributes: object.attributes,
    ...(object.children && object.children.length > 0 ? { children: object.children } : {}),
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexShrink: 0 }}>
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
          flex: 1,
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
