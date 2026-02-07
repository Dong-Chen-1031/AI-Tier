import type { TierLevel, ParsedMarker } from "@/types";

// 正則表達式匹配 [夯]、[頂級]、[人上人]、[NPC]、[拉完了]
const TIER_MARKER_REGEX = /\[(夯|頂級|人上人|NPC|拉完了)\]/g;

/**
 * 解析文本中的 Tier 標記
 * @param text 要解析的文本
 * @returns 解析出的標記數組
 */
export function parseMarkers(text: string): ParsedMarker[] {
  const markers: ParsedMarker[] = [];
  let match;

  // 重置正則表達式狀態
  TIER_MARKER_REGEX.lastIndex = 0;

  while ((match = TIER_MARKER_REGEX.exec(text)) !== null) {
    markers.push({
      tier: match[1] as TierLevel,
      position: match.index,
    });
  }

  return markers;
}

/**
 * 從文本中移除 Tier 標記
 * @param text 原始文本
 * @returns 移除標記後的文本
 */
export function removeMarkers(text: string): string {
  return text.replace(TIER_MARKER_REGEX, "");
}

/**
 * 檢查文本中是否包含 Tier 標記
 * @param text 要檢查的文本
 * @returns 是否包含標記
 */
export function hasMarkers(text: string): boolean {
  TIER_MARKER_REGEX.lastIndex = 0;
  return TIER_MARKER_REGEX.test(text);
}

/**
 * 獲取最後一個標記
 * @param text 文本內容
 * @returns 最後一個標記，如果沒有則返回 null
 */
export function getLastMarker(text: string): TierLevel | null {
  const markers = parseMarkers(text);
  if (markers.length === 0) return null;
  return markers[markers.length - 1].tier;
}
