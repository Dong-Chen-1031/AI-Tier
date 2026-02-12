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
  api_endpoints: import.meta.env.VITE_API_ENDPOINT || "http://127.0.0.1:5000",
} as const;
export default config;
