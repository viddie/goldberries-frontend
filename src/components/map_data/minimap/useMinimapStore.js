import { create } from "zustand";

const POINT_ZOOM_AREA = 400; // px world-space area around a point when focusing

export const useMinimapStore = create((set) => ({
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
  // contain the current click point are pruned on each click.
  clickedObjects: new Map(),
  selectObject: (data, z, bounds) =>
    set((state) => {
      const next = new Map(state.clickedObjects);
      next.set(data, bounds);
      return { selectedObject: { data, z }, clickedObjects: next };
    }),
  pruneClickedObjects: (point) =>
    set((state) => {
      const next = new Map();
      for (const [entity, b] of state.clickedObjects) {
        if (point.x >= b.minX && point.x <= b.maxX && point.y >= b.minY && point.y <= b.maxY) {
          next.set(entity, b);
        }
      }
      return { clickedObjects: next };
    }),
  clearSelectedObject: () => set({ selectedObject: null, clickedObjects: new Map() }),

  // Debug flags
  showUnhandledEntities: true,
  setShowUnhandledEntities: (v) => set({ showUnhandledEntities: v }),
  showUnhandledTriggers: false,
  setShowUnhandledTriggers: (v) => set({ showUnhandledTriggers: v }),

  // Grid type: "tile" | "pixel" | "none"
  gridType: "tile",
  setGridType: (v) => set({ gridType: v }),
}));
