import { create } from 'zustand';

interface AeroTwinState {
  // Global App State
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // 3D Viewer State
  cameraMode: "orbit" | "dollhouse" | "walkthrough" | "floorplan" | "drone" | "room";
  setCameraMode: (mode: "orbit" | "dollhouse" | "walkthrough" | "floorplan" | "drone" | "room") => void;
  
  viewMode: "architectural" | "structural" | "furnished";
  setViewMode: (mode: "architectural" | "structural" | "furnished") => void;

  sunHour: number;
  setSunHour: (hour: number) => void;

  activeFloor: string;
  setActiveFloor: (floor: string) => void;

  focusedRoom: string | undefined;
  setFocusedRoom: (room?: string) => void;

  // Live Layers Toggle State
  activeLayers: Record<string, boolean>;
  toggleLayer: (layer: string) => void;
  setLayers: (layers: Record<string, boolean>) => void;
}

export const useAeroTwinStore = create<AeroTwinState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  cameraMode: "orbit",
  setCameraMode: (mode) => set({ cameraMode: mode }),

  viewMode: "architectural",
  setViewMode: (mode) => set({ viewMode: mode }),

  sunHour: 12,
  setSunHour: (hour) => set({ sunHour: hour }),

  activeFloor: "all",
  setActiveFloor: (floor) => set({ activeFloor: floor }),

  focusedRoom: undefined,
  setFocusedRoom: (room) => set({ focusedRoom: room }),

  activeLayers: {
    architectural: true,
    structural: true,
    electrical: false,
    plumbing: false,
    hvac: false,
    furniture: true,
    lighting: true,
    landscaping: true,
    safety: false,
    cost: false,
    materials: true,
    progress: true
  },
  toggleLayer: (layer) => set((state) => ({ 
    activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] } 
  })),
  setLayers: (layers) => set({ activeLayers: layers })
}));
