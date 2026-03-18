import { create } from "zustand";

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
  clearCameraTarget: () => set({ cameraTarget: null }),

  // Selected entity — set by entity click, consumed by sidebar
  selectedEntity: null,
  selectEntity: (entity) => set({ selectedEntity: entity }),
  clearSelectedEntity: () => set({ selectedEntity: null }),
}));
