// 應用程式配置常數

const tierList = ["夯", "頂級", "人上人", "NPC", "拉完了"];
const colorList = ["#F00", "#FFBF00", "#FF0", "#FFF2CC", "#FFF"];
const tierMap = Object.fromEntries(
  tierList.map((tier, i) => [tier, colorList[i]]),
);
export const config = {
  tierList: tierList,
  colorList: colorList,
  tierMap: tierMap,
  // API 端點
  LLMs: [
    "google/gemini-2.5-flash",
    "google/gemini-2.0-flash",
    "google/gemini-2.0-flash-lite",
    "google/gemini-2.5-flash-lite",
    "google/gemini-3-flash-preview",
  ],
  api_endpoints: import.meta.env.VITE_API_ENDPOINT || "http://127.0.0.1:8000",
  turnstile_site_key: import.meta.env.VITE_TURNSTILE_SITE_KEY || "",
} as const;
export default config;
