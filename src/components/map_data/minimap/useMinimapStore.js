import { create } from "zustand";
import { persist } from "zustand/middleware";

const POINT_ZOOM_AREA = 400; // px world-space area around a point when focusing

export const useMinimapStore = create(
  persist(
    (set) => ({
      // Camera navigation target — set by sidebar, consumed by Controls
      // { x, y, width, height } in projected (R3F) coordinates
      cameraTarget: null,
      navigateToRoom: (room) =>
        set({
          cameraTarget: {
            x: room.x,
            y: -room.y,
            width: room.width,
            height: room.height,
          },
        }),
      navigateToPoint: (x, y) =>
        set({
          cameraTarget: {
            x: x - POINT_ZOOM_AREA / 2,
            y: -(y - POINT_ZOOM_AREA / 2),
            width: POINT_ZOOM_AREA,
            height: POINT_ZOOM_AREA,
          },
        }),
      clearCameraTarget: () => set({ cameraTarget: null }),

      // Selected object — can be an entity or trigger
      // Stores { data, z } where data is the entity/trigger object and z is its render depth
      selectedObject: null,
      // Map of entity → bounds for click-cycling. Entries whose bounds don't
      // contain the current click point are pruned once per native click event.
      clickedObjects: new Map(),
      _lastClickEvent: null,
      selectObject: (data, z, bounds) =>
        set((state) => {
          const next = new Map(state.clickedObjects);
          next.set(data, bounds);
          return { selectedObject: { data, z }, clickedObjects: next };
        }),
      pruneClickedObjects: (point, nativeEvent) =>
        set((state) => {
          // Only prune once per native event to avoid clearing entries mid-chain
          if (nativeEvent && state._lastClickEvent === nativeEvent) return {};
          const next = new Map();
          for (const [entity, b] of state.clickedObjects) {
            if (point.x >= b.minX && point.x <= b.maxX && point.y >= b.minY && point.y <= b.maxY) {
              next.set(entity, b);
            }
          }
          return { clickedObjects: next, _lastClickEvent: nativeEvent };
        }),
      clearSelectedObject: () =>
        set({ selectedObject: null, clickedObjects: new Map(), _lastClickEvent: null }),

      // Settings
      showUnhandledEntities: true,
      setShowUnhandledEntities: (v) => set({ showUnhandledEntities: v }),
      showUnhandledTriggers: false,
      setShowUnhandledTriggers: (v) => set({ showUnhandledTriggers: v }),

      // Debug mode — shows pointer coordinates and axis arrows in the HUD
      debugMode: false,
      setDebugMode: (v) => set({ debugMode: v }),

      // Anti-spoiler mode — hides rooms containing VivHelper/HideRoomInMap
      antiSpoilerMode: true,
      setAntiSpoilerMode: (v) => set({ antiSpoilerMode: v }),

      // Grid type: "tile" | "pixel" | "none"
      gridType: "tile",
      setGridType: (v) => set({ gridType: v }),

      // Shown ignore groups — set of group keys from IgnoreUnhandled that are visible.
      shownIgnoreGroups: new Set(["importantTriggers", "variantTriggers", "miscGameplayTriggers"]),
      toggleIgnoreGroup: (group) =>
        set((state) => {
          const next = new Set(state.shownIgnoreGroups);
          if (next.has(group)) {
            next.delete(group);
          } else {
            next.add(group);
          }
          return { shownIgnoreGroups: next };
        }),
    }),
    {
      name: "minimap-settings",
      partialize: (state) => ({
        showUnhandledEntities: state.showUnhandledEntities,
        showUnhandledTriggers: state.showUnhandledTriggers,
        debugMode: state.debugMode,
        antiSpoilerMode: state.antiSpoilerMode,
        gridType: state.gridType,
        shownIgnoreGroups: state.shownIgnoreGroups,
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Restore shownIgnoreGroups from array back to Set
          if (parsed?.state?.shownIgnoreGroups) {
            parsed.state.shownIgnoreGroups = new Set(parsed.state.shownIgnoreGroups);
          }
          return parsed;
        },
        setItem: (name, value) => {
          // Convert shownIgnoreGroups Set to array for JSON serialization
          const toStore = {
            ...value,
            state: {
              ...value.state,
              shownIgnoreGroups: value.state.shownIgnoreGroups
                ? [...value.state.shownIgnoreGroups]
                : undefined,
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
