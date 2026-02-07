# Plan: 前端 Tier List 銳評 UI 完整實現

這是一個「從夯到拉」AI 銳評應用的前端重構計劃。目前 [home.tsx](frontend/pages/home.tsx) 僅有測試代碼，需要實現完整的 Tier List UI、表單輸入、文本標記解析、動畫效果、音頻控制等功能。核心挑戰是：(1) 解析串流文本中的 `[夯]` 等標記並觸發動畫 (2) 實現對象圖標移動到相應等級的視覺效果 (3) 同步文本顯示與音頻播放 (4) 提供友好的使用者體驗和錯誤處理。

## 🎨 技術棧要求

**重要提醒：本項目已配置以下技術棧，所有組件必須使用：**

- **Tailwind CSS** - 所有樣式使用 Tailwind utility classes，已配置在 [index.css](frontend/index.css)
- **shadcn/ui** - UI 組件庫，使用 `bunx shadcn@latest add <component>` 安裝所需組件
- **Framer Motion** - 動畫庫（用於 SubjectCard 移動動畫）
- **React 19** + **TypeScript**
- **tw-animate-css** - Tailwind 動畫擴展（已安裝）

**禁止事項：**

- ❌ 不使用傳統 CSS/SCSS 文件編寫樣式
- ❌ 不使用其他 UI 組件庫（如 Material-UI、Ant Design）
- ❌ 不在 [index.css](frontend/index.css) 以外添加新的 CSS 文件
- ❌ 不實現淺色模式（僅支持深色模式）
- ❌ 音頻播放控制器（如播放/暫停、進度條）不需要實現，僅需在文本串流過程中同步播放音頻

## 🎨 樣式規範

**重要：必須遵守的樣式編寫規則**

### 1. **使用 CSS 變數而非寫死色碼**

[index.css](frontend/index.css) 已定義完整的設計令牌，**必須優先使用這些變數**：

```css
/* 使用 Tailwind 的語義化顏色類 */
bg-background      /* 而非 bg-[#242424] */
text-foreground    /* 而非 text-[#ffffff] */
bg-card           /* 而非 bg-[#333333] */
bg-primary        /* 而非 bg-[#000000] */
border-border     /* 而非 border-[#cccccc] */
```

**禁止範例：**

```tsx
❌ className="bg-[#242424] text-[#ffffff]"
❌ style={{ backgroundColor: '#242424' }}
```

**正確範例：**

```tsx
✅ className="bg-background text-foreground"
✅ className="bg-card text-card-foreground"
```

### 2. **少用固定像素值（px）**

優先使用 Tailwind 的間距系統和相對單位：

```css
/* 優先使用 Tailwind 間距 */
p-4, m-8, gap-6    /* 而非 p-[16px], m-[32px] */
w-full, h-screen   /* 而非 w-[100%], h-[100vh] */
text-lg, text-xl   /* 而非 text-[18px] */
space-y-4          /* 而非固定 margin */
```

**例外情況：** 只在必須精確控制尺寸時使用 px（如圖標大小 `w-[18px]`）

### 3. **僅支持深色模式**

- 不需要使用 `dark:` 前綴（因為只有深色模式）
- 直接使用 `.dark` 類定義的變數值
- 所有顏色變數已經是深色模式配置

**需要安裝的 shadcn 組件：**

開始實現前，請依照需求安裝 shadcn 組件

**需要安裝的其他依賴：**

```bash
bun add framer-motion
```

**Steps**

### **階段一：核心 UI 組件建立**

1. **TierBoard 組件** - Tier List 主視覺化面板
   - 在 [frontend/components/](frontend/components/) 創建 `TierBoard.tsx`
   - 渲染五個等級區域（夯/頂級/人上人/NPC/拉完了）參考 [從夯到拉.png](frontend/assets/從夯到拉.png) 的視覺設計
   - 使用 **Tailwind CSS Grid/Flex** 佈局實現，響應式設計（使用 `gap-4`、`p-6` 等而非固定 px）
   - 每個等級區域使用 shadcn `Card` 組件作為容器
   - 等級標籤使用 shadcn `Badge` 組件
   - 配色使用 Tailwind 的顏色系統，可以使用16進位色碼：
     - 夯：
     - 頂級：
     - 人上人：
     - NPC：
     - 拉完了：
   - 卡片背景使用 `bg-card`，邊框使用 `border-border`

2. **SubjectCard 組件** - 銳評對象的可視化卡片
   - 在 [frontend/components/](frontend/components/) 創建 `SubjectCard.tsx`
   - 使用 shadcn `Card` 組件作為基礎
   - 顯示 `subject` 名稱（使用 Tailwind 字體樣式）和測試圖片（[loader.svg](frontend/assets/loader.svg)）
   - 使用 **Framer Motion** 的 `motion.div` 包裹，實現從待評區到目標等級的平滑移動動畫
   - 動畫配置：`layoutId` 實現共享佈局動畫，`transition={{ duration: 1.5, type: "spring" }}`

3. **InputForm 組件** - 使用者輸入表單
   - 在 [frontend/components/](frontend/components/) 創建 `InputForm.tsx`
   - 使用 shadcn 組件：`Input`、`Label`、`Button`、`Select`、`Textarea`
   - 必填欄位：`subject`（要評價的對象）、`role_name`（扮演者）
   - 可選欄位：`role_description`、`tier`、`style`、`suggestion`
   - 進階選項使用 shadcn `Collapsible` 組件實現摺疊/展開：`tts_model`、`tts_speed`、`llm_model`
   - 表單驗證和提交邏輯，提交按鈕加入 loading 狀態

4. **StreamingText 組件** - 銳評文本顯示區
   - 在 [frontend/components/](frontend/components/) 創建 `StreamingText.tsx`
   - 使用 shadcn `Card` 作為容器，Tailwind 樣式美化文字顯示
   - 接收文本串流並逐字顯示（打字機效果，使用 Tailwind 動畫類）
   - 解析並過濾 `[夯]`、`[頂級]` 等標記（不顯示給使用者）
   - 將解析出的標記通過 callback 通知父組件觸發動畫
   - 使用 `useRef` + `scrollIntoView` 滾動到最新內容

### **階段二：狀態管理與業務邏輯**

6. **建立自定義 Hooks**
   - 在 [frontend/](frontend/) 創建 `hooks/` 目錄
   - `useStreamText.ts` - 處理 `/text/{case_id}` 的串流邏輯
   - `useAudioStream.ts` - 處理 `/tts/{case_id}` 的音頻加載
   - `useTierAnimation.ts` - 管理標記解析和動畫觸發
   - 統一錯誤處理和 loading 狀態

7. **類型定義**
   - 在 [frontend/](frontend/) 創建 `types/` 目錄
   - 定義 `TierRequest`、`TierLevel`、`StreamState` 等 TypeScript 接口
   - 與後端 [main.py](backend/main.py#L29-L42) 的 `TierRequest` 保持一致

8. **工具函數**
   - 在 [frontend/](frontend/) 創建 `utils/` 目錄
   - `parseMarkers.ts` - 正則解析文本中的 `[夯]` 等標記
   - `tierLevels.ts` - 定義五個等級的常量和映射
   - `api.ts` - 封裝 API 調用邏輯

### **階段三：[home.tsx](frontend/pages/home.tsx) 主頁面重構**

9. **完整流程整合**
   - 狀態管理：`inputMode`（輸入階段）、`loading`（生成中）、`streaming`（串流中）、`completed`（完成）
   - 階段 1：顯示 `<InputForm />` 收集參數
   - 階段 2：提交後調用 `POST /tier`，顯示 `<Loader />`
   - 階段 3：獲得 `case_id` 後同時啟動文本和音頻串流
   - 階段 4：`<TierBoard />` 顯示五個等級，`<SubjectCard />` 初始在待評區
   - 階段 5：`<StreamingText />` 逐字顯示，解析到標記時觸發 `<SubjectCard />` 動畫移動
   - 階段 6：完成後顯示「重新評價」按鈕重置狀態

10. **錯誤處理與邊界情況**
    - 使用 shadcn `Toast` 或 `Alert` 組件顯示錯誤提示
    - API 調用失敗提示（網絡錯誤、超時）
    - `case_id` 不存在的處理（[main.py](backend/main.py#L78-L82) 返回 None 會導致錯誤）
    - 串流中斷重連機制，使用 shadcn `Dialog` 詢問是否重試
    - 沒有解析到標記時的降級處理（自動放到「人上人」等級）
    - 音頻加載失敗時仍顯示文本，底部顯示 shadcn `Alert` 提示

### **階段四：視覺優化與互動增強**

11. **動畫效果**
    - SubjectCard 移動使用 **Framer Motion** 的 `layoutId` 和 shared layout animation
    - 標記觸發時使用 Tailwind 動畫類（`animate-pulse`、`animate-bounce`）實現視覺反饋
    - 等級區域高亮使用 Tailwind 的 `ring-` 和 `shadow-` 類
    - 文本打字機效果使用 Tailwind `transition-opacity` 配合狀態更新
    - 頁面過渡動畫使用 `tw-animate-css` 的預設動畫類

12. **響應式設計**
    - 使用 Tailwind 響應式前綴（`sm:`、`md:`、`lg:`、`xl:`）
    - 桌面版（≥1024px）：`lg:flex-row` Tier List 橫向排列
    - 平板版（768-1023px）：`md:flex-col` 垂直堆疊但保持完整功能
    - 移動版（<768px）：`flex-col` 簡化 UI，優先顯示文本和當前等級
    - 不需要在 [index.css](frontend/index.css) 添加媒體查詢，全部使用 Tailwind 響應式類

13. **主題與樣式**
    - 參考 [從夯到拉.png](frontend/assets/從夯到拉.png) 設計配色方案
    - **僅支持深色模式**，所有顏色已在 [index.css](frontend/index.css) 中 `.dark` 類配置
    - 五個等級配色（等級強調色可使用 Tailwind 預設顏色類）：
      - 夯：`bg-red-600 text-white`
      - 頂級：`bg-orange-600 text-white`
      - 人上人：`bg-yellow-600 text-black`
      - NPC：`bg-muted text-muted-foreground`（使用 CSS 變數）
      - 拉完了：`bg-green-600 text-white`
    - **必須使用** shadcn 設計令牌：
      - 背景：`bg-background`、`bg-card`、`bg-popover`
      - 文字：`text-foreground`、`text-muted-foreground`、`text-card-foreground`
      - 邊框：`border-border`、`border-input`
      - 強調：`bg-primary`、`bg-secondary`、`bg-accent`
    - 間距使用 Tailwind 間距系統：`p-4`、`gap-6`、`space-y-4`（避免固定 px）

### **階段五：進階功能（可選）**

14. **角色預設庫**
    - 在 [frontend/config/](frontend/config/) 創建 `roles.ts`
    - 預設常見角色（孫中山、魯迅、蔡英文等）及其 `role_description` 和推薦的 `tts_model`
    - 在 `<InputForm />` 使用 shadcn `Select` 或 `Combobox` 提供快速選擇

15. **歷史記錄**
    - 使用 `localStorage` 保存過去的銳評結果
    - 新增 `/history` 路由和頁面查看歷史
    - 點擊歷史項重新播放

16. **分享功能**
    - 生成分享鏈接（需要後端支持保存 `case_id` 結果）
    - 截圖功能（將 Tier List 導出為圖片）
    - 社交媒體分享按鈕

**Verification**

1. **手動測試流程**：
   - 在 [home.tsx](frontend/pages/home.tsx) 輸入「蔣中正」和「孫中山」
   - 提交後確認 API 調用成功（檢查 Network 面板）
   - 觀察文本逐字出現，音頻同步播放
   - 當文本中出現 `[夯]` 時，卡片應該平滑移動到「夯」等級區域
   - 文本中不應該顯示 `[夯]` 標記本身
   - 完成後能重新開始新的評價

2. **錯誤場景測試**：
   - 後端未啟動時顯示錯誤提示
   - 網絡中斷時的重連邏輯
   - 快速連續提交多個請求不會衝突

3. **響應式驗證**：
   - 在不同螢幕尺寸下檢查佈局
   - 移動裝置上的觸控操作

4. **性能檢查**：
   - 文本串流不應該卡頓（使用 `requestAnimationFrame` 優化）
   - 動畫流暢（保持 60fps）

**Decisions**

- **UI 組件庫**：使用 **shadcn/ui**，所有表單、卡片、按鈕等元素必須使用 shadcn 組件，禁止使用原生 HTML 元素直接編寫 UI
- **樣式方案**：
  - 100% 使用 **Tailwind CSS** utility classes，禁止編寫自定義 CSS 文件
  - **必須使用 CSS 變數**：優先使用 [index.css](frontend/index.css) 中定義的設計令牌（`bg-background`、`text-foreground`、`border-border` 等），禁止寫死 16 進位色碼
  - **少用固定像素值**：優先使用 Tailwind 間距系統（`p-4`、`gap-6`、`text-lg`）而非固定 px 值
  - **僅支持深色模式**：所有顏色已配置為深色模式，不需要使用 `dark:` 前綴

- **動畫庫選擇**：SubjectCard 的位置移動動畫使用 **Framer Motion**，其他小動畫（hover、淡入淡出）使用 Tailwind 動畫類或 `tw-animate-css`

- **標記解析時機**：選擇在 `StreamingText` 組件內解析而非後端處理，因為後端已經明確說明標記是給前端使用的，且需要在串流過程中即時觸發動畫

- **狀態管理方案**：使用 React Hooks（useState/useReducer）而非 Redux，因為應用複雜度不高且組件樹較淺

- **音頻處理**：使用原生 HTML5 Audio 而非 Web Audio API，因為只需要基礎播放控制，不需要複雜的音頻處理

- **串流實現**：繼續使用 Fetch API + ReadableStream（如 [home.tsx](frontend/pages/home.tsx#L42-L57) 現有方式），經過驗證可靠且瀏覽器兼容性好

---

## 📝 實現檢查清單

實現前請確認：

- ✅ 已安裝所有必需的 shadcn 組件
- ✅ 已安裝 framer-motion
- ✅ 理解 Tailwind CSS 的響應式前綴用法（`sm:`、`md:`、`lg:`）
- ✅ 理解 shadcn 設計令牌（`bg-background`、`text-foreground`、`border-border` 等）
- ✅ 理解 Framer Motion 的 `layoutId` 共享佈局動畫機制
- ✅ **熟悉 [index.css](frontend/index.css) 中定義的所有 CSS 變數**
- ✅ **承諾不寫死 16 進位色碼和盡量避免固定 px 值**
- ✅ **明白只需實現深色模式，不使用 `dark:` 前綴**

這個計劃涵蓋了從基礎 UI 到進階功能的完整實現路徑。核心功能（階段一至三）應優先完成以實現 MVP，進階功能可根據需求迭代添加。
