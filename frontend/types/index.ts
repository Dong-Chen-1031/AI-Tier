// 後端 API 請求類型
export interface TierRequest {
  subject: string;
  role_name?: string;
  role_description?: string | false;
  tier?: string;
  suggestion?: string | null;
  tts?: boolean | null;
  tts_model?: string | null;
  tts_speed?: number | null;
  llm_model?: string | null;
  style?: string | null;
}

// 後端 API 響應類型
export interface TierResponse {
  case_id: string;
}

// Tier 等級類型
export type TierLevel = "夯" | "頂級" | "人上人" | "NPC" | "拉完了";

// Tier 等級配置
export interface TierConfig {
  level: TierLevel;
  label: string;
  bgColor: string;
  textColor: string;
  description: string;
}

// 流式文本狀態
export type StreamState =
  | "idle"
  | "loading"
  | "streaming"
  | "completed"
  | "error";

// 應用程序狀態
export interface AppState {
  mode: "input" | "loading" | "streaming" | "completed";
  caseId: string | null;
  error: string | null;
  currentTier: TierLevel | null;
}

// 文本標記解析結果
export interface ParsedMarker {
  tier: TierLevel;
  position: number;
}
