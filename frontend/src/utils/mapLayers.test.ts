import { describe, it, expect } from "vitest";
import { computeCustomLayerStatus } from "./mapLayers";

describe("computeCustomLayerStatus", () => {
  it("returns None when no name", () => {
    expect(computeCustomLayerStatus(null, false)).toBe("None");
  });

  it("returns Loaded for non-KML/KMZ", () => {
    expect(computeCustomLayerStatus("layer.geojson", false)).toBe("Loaded");
  });

  it("returns Converted when notice is present", () => {
    expect(computeCustomLayerStatus("layer.geojson", true)).toBe("Converted");
  });

  it("returns Converted for KML/KMZ extensions", () => {
    expect(computeCustomLayerStatus("layer.kml", false)).toBe("Converted");
    expect(computeCustomLayerStatus("layer.KMZ", false)).toBe("Converted");
  });
});
