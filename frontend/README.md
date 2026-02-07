# 從夯到拉 AI 銳評 - 前端

這是一個基於 React + TypeScript + Tailwind CSS + shadcn/ui 的現代化 AI 銳評應用前端。

## 技術棧

- **React 19** - 使用最新的 React 版本
- **TypeScript** - 類型安全的開發體驗
- **Tailwind CSS 4** - 現代化的 CSS 框架
- **shadcn/ui** - 高質量的 UI 組件庫
- **Framer Motion** - 流暢的動畫效果
- **Vite** - 快速的建置工具
- **Bun** - 高性能的 JavaScript 運行時

## 功能特性

### 已實現功能

✅ **輸入表單** - 完整的表單驗證和錯誤處理
- 必填欄位：評價對象、扮演者
- 可選欄位：角色描述、預設等級、風格、建議
- 進階選項：TTS 模型、TTS 速度、LLM 模型（可摺疊）
- 角色預設庫（孫中山、蔣中正、魯迅等）

✅ **Tier List 視覺化** - 五個等級的動態展示
- 夯（紅色）- 最高評價
- 頂級（橙色）- 優秀
- 人上人（黃色）- 良好
- NPC（灰色）- 普通
- 拉完了（綠色）- 最低評價

✅ **流式文本顯示** - 實時顯示 AI 生成的銳評內容
- 逐字打字機效果
- 自動解析和移除標記（[夯]、[頂級] 等）
- 自動滾動到最新內容

✅ **動畫效果**
- SubjectCard 使用 Framer Motion 實現平滑移動動畫
- 當解析到標記時，卡片從待評區移動到對應等級
- 等級區域高亮效果

✅ **音頻同步播放** - TTS 音頻與文本同步
- 自動播放音頻
- 錯誤處理（音頻失敗時仍顯示文本）

✅ **響應式設計**
- 桌面版（≥1024px）：橫向排列
- 平板版（768-1023px）：垂直堆疊
- 移動版（<768px）：簡化 UI

✅ **錯誤處理**
- API 調用失敗提示
- 網絡中斷重連機制
- 音頻加載失敗降級處理

## 項目結構

```
frontend/
├── components/           # React 組件
│   ├── ui/              # shadcn UI 基礎組件
│   ├── TierBoard.tsx    # Tier List 主視覺化面板
│   ├── SubjectCard.tsx  # 銳評對象卡片（帶動畫）
│   ├── StreamingText.tsx # 流式文本顯示
│   └── InputForm.tsx    # 輸入表單
├── hooks/               # 自定義 React Hooks
│   ├── useStreamText.ts # 文本流處理
│   ├── useAudioStream.ts # 音頻流處理
│   └── useTierAnimation.ts # 動畫控制
├── utils/               # 工具函數
│   ├── api.ts          # API 調用封裝
│   ├── parseMarkers.ts # 標記解析
│   └── tierLevels.ts   # 等級配置
├── types/               # TypeScript 類型定義
│   └── index.ts
├── config/              # 配置文件
│   ├── constants.ts    # 常量配置
│   └── roles.ts        # 角色預設庫
├── pages/               # 頁面組件
│   └── home.tsx        # 主頁面
└── src/lib/             # 工具庫
    └── utils.ts        # Tailwind 工具函數
```

## 開發指南

### 安裝依賴

```bash
bun install
```

### 啟動開發服務器

```bash
bun dev
```

應用將在 `http://127.0.0.1:3000` 啟動。

### 建置生產版本

```bash
bun run build
```

### 預覽生產版本

```bash
bun run preview
```

## 使用說明

1. **輸入階段**
   - 填寫評價對象（必填）
   - 選擇預設角色或自定義扮演者（必填）
   - 可選填寫角色描述、風格、建議等
   - 點擊「進階選項」可配置 TTS 和 LLM 參數

2. **生成階段**
   - 提交後顯示加載動畫
   - API 調用成功後進入串流階段

3. **串流階段**
   - TierBoard 顯示五個等級區域
   - SubjectCard 初始在待評區
   - 文本逐字顯示，音頻同步播放
   - 當文本中出現標記（如 [夯]）時，卡片自動移動到對應等級

4. **完成階段**
   - 顯示「重新評價」按鈕
   - 點擊可返回輸入階段開始新的評價

## 樣式規範

### 必須遵守的規則

1. **使用 CSS 變數而非寫死色碼**
   - ✅ `bg-background`, `text-foreground`, `border-border`
   - ❌ `bg-[#242424]`, `text-[#ffffff]`

2. **少用固定像素值**
   - ✅ `p-4`, `gap-6`, `text-lg`
   - ❌ `p-[16px]`, `gap-[24px]`, `text-[18px]`

3. **僅支持深色模式**
   - 所有顏色已配置為深色模式
   - 不需要使用 `dark:` 前綴

## API 端點

前端與後端的交互通過以下 API 端點：

- `POST /tier` - 創建銳評，返回 `case_id`
- `GET /text/{case_id}` - 獲取流式文本
- `GET /tts/{case_id}` - 獲取 TTS 音頻

## 自定義配置

### 修改 API 端點

編輯 `config/constants.ts`：

```typescript
export const config = {
  api_endpoints: "http://127.0.0.1:8000", // 修改為你的後端地址
} as const;
```

### 添加新角色預設

編輯 `config/roles.ts`：

```typescript
export const ROLE_PRESETS: RolePreset[] = [
  {
    name: "新角色",
    description: "角色描述",
    tts_model: "模型ID（可選）",
    category: "分類",
  },
  // ... 其他角色
];
```

### 修改 Tier 等級配置

編輯 `utils/tierLevels.ts` 來修改等級顏色、標籤等。

## 故障排除

### 構建錯誤

如果遇到路徑別名問題，確保以下文件配置一致：
- `tsconfig.json`
- `tsconfig.app.json`
- `vite.config.ts`

### 音頻播放失敗

音頻播放失敗不會影響文本顯示，應用會顯示錯誤提示但繼續運行。

### 動畫卡頓

確保使用了 Framer Motion 的 `layoutId` 屬性實現共享佈局動畫。

## 進階功能（待實現）

- 歷史記錄（使用 localStorage）
- 分享功能（生成分享鏈接）
- 截圖功能（導出為圖片）
- 多語言支持

## License

MIT
