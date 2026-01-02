export function computeCustomLayerStatus(name: string | null, hasKmlNotice: boolean): "None" | "Loaded" | "Converted" {
  if (!name) return "None";
  const lower = name.toLowerCase();
  if (hasKmlNotice || lower.endsWith(".kml") || lower.endsWith(".kmz")) return "Converted";
  return "Loaded";
}
