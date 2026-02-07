import type { TierLevel, TierConfig } from "@/types";

// Tier 等級配置
export const TIER_LEVELS: TierConfig[] = [
  {
    level: "夯",
    label: "夯",
    bgColor: "bg-red-600",
    textColor: "text-white",
    description: "最高評價",
  },
  {
    level: "頂級",
    label: "頂級",
    bgColor: "bg-orange-600",
    textColor: "text-white",
    description: "優秀",
  },
  {
    level: "人上人",
    label: "人上人",
    bgColor: "bg-yellow-600",
    textColor: "text-black",
    description: "良好",
  },
  {
    level: "NPC",
    label: "NPC",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    description: "普通",
  },
  {
    level: "拉完了",
    label: "拉完了",
    bgColor: "bg-green-600",
    textColor: "text-white",
    description: "最低評價",
  },
];

// Tier 等級映射
export const TIER_MAP: Record<TierLevel, TierConfig> = TIER_LEVELS.reduce(
  (acc, config) => {
    acc[config.level] = config;
    return acc;
  },
  {} as Record<TierLevel, TierConfig>,
);

/**
 * 獲取 Tier 配置
 * @param level Tier 等級
 * @returns Tier 配置
 */
export function getTierConfig(level: TierLevel): TierConfig {
  return TIER_MAP[level];
}

/**
 * 獲取默認 Tier（當沒有解析到標記時）
 * @returns 默認 Tier 等級
 */
export function getDefaultTier(): TierLevel {
  return "人上人";
}
