import { useTexture } from "@react-three/drei";
import { NearestFilter } from "three";

export function usePixelTexture(input, onLoad) {
  return useTexture(input, (tex) => {
    tex.magFilter = NearestFilter;
    tex.minFilter = NearestFilter;
    tex.generateMipmaps = false;
    if (onLoad) onLoad(tex);
  });
}
