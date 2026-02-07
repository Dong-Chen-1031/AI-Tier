// 預設角色配置
export interface RolePreset {
  name: string;
  description: string;
  tts_model?: string;
  category: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    name: "孫中山",
    description: "中華民國國父，三民主義創始人",
    tts_model: "339a6814818044f7b00161c8e0dd6e35",
    category: "歷史人物",
  },
  {
    name: "蔣中正",
    description: "中華民國總統，國民黨領袖",
    category: "歷史人物",
  },
  {
    name: "魯迅",
    description: "中國現代文學家，批判精神代表",
    category: "文化名人",
  },
  {
    name: "蔡英文",
    description: "中華民國總統，民進黨主席",
    category: "政治人物",
  },
  {
    name: "馬英九",
    description: "中華民國前總統，國民黨前主席",
    category: "政治人物",
  },
  {
    name: "周杰倫",
    description: "華語流行音樂天王",
    category: "娛樂明星",
  },
  {
    name: "李白",
    description: "唐代詩人，浪漫主義詩歌大師",
    category: "文化名人",
  },
];

/**
 * 根據名稱獲取角色預設
 */
export function getRolePreset(name: string): RolePreset | undefined {
  return ROLE_PRESETS.find((preset) => preset.name === name);
}

/**
 * 根據分類獲取角色列表
 */
export function getRolesByCategory(category: string): RolePreset[] {
  return ROLE_PRESETS.filter((preset) => preset.category === category);
}

/**
 * 獲取所有分類
 */
export function getCategories(): string[] {
  return Array.from(new Set(ROLE_PRESETS.map((preset) => preset.category)));
}
