# Plan: 前端 Tier List 銳評 UI 完整實現

這是一個「從夯到拉」AI 銳評應用的前端重構計劃。目前 [home.tsx](frontend/pages/home.tsx) 僅有測試代碼，需要實現完整的 Tier List UI、表單輸入、文本標記解析、動畫效果、音頻控制等功能。核心挑戰是：(1) 解析串流文本中的 `[夯]` 等標記並觸發動畫 (2) 實現對象圖標移動到相應等級的視覺效果 (3) 同步文本顯示與音頻播放 (4) 提供友好的使用者體驗和錯誤處理。

**Steps**

### **階段一：核心 UI 組件建立**

1. **TierBoard 組件** - Tier List 主視覺化面板
   - 在 [frontend/components/](frontend/components/) 創建 `TierBoard.tsx`
   - 渲染五個等級區域（夯/頂級/人上人/NPC/拉完了）使用 [從夯到拉.png](frontend/assets/從夯到拉.png) 作為背景或參考
   - 每個等級區域支持放置「對象卡片」
   - 使用 Flexbox/Grid 佈局，響應式設計

2. **SubjectCard 組件** - 銳評對象的可視化卡片
   - 在 [frontend/components/](frontend/components/) 創建 `SubjectCard.tsx`
   - 顯示 `subject` 名稱和可選圖標
   - 支持位置動畫（從待評區移動到目標等級）
   - 使用 Framer Motion 實現平滑移動

3. **InputForm 組件** - 使用者輸入表單
   - 在 [frontend/components/](frontend/components/) 創建 `InputForm.tsx`
   - 必填欄位：`subject`（要評價的對象）、`role_name`（扮演者）
   - 可選欄位：`role_description`、`tier`、`style`、`suggestion`
   - 進階選項（摺疊/展開）：`tts_model`、`tts_speed`、`llm_model`
   - 表單驗證和提交邏輯

4. **StreamingText 組件** - 銳評文本顯示區
   - 在 [frontend/components/](frontend/components/) 創建 `StreamingText.tsx`
   - 接收文本串流並逐字顯示（打字機效果）
   - 解析並過濾 `[夯]`、`[頂級]` 等標記（不顯示給使用者）
   - 將解析出的標記通過 callback 通知父組件觸發動畫
   - 滾動到最新內容

5. **AudioPlayer 組件** - 音頻播放控制器
   - 在 [frontend/components/](frontend/components/) 創建 `AudioPlayer.tsx`
   - 整合 HTML5 Audio API，顯示播放/暫停按鈕
   - 進度條顯示當前播放位置（如果可能）
   - 音量控制和播放速度調整
   - 錯誤提示（音頻加載失敗）

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
    - API 調用失敗提示（網絡錯誤、超時）
    - `case_id` 不存在的處理（[main.py](backend/main.py#L78-L82) 返回 None 會導致錯誤）
    - 串流中斷重連機制
    - 沒有解析到標記時的降級處理（自動放到「人上人」等級）
    - 音頻加載失敗時仍顯示文本

### **階段四：視覺優化與互動增強**

11. **動畫效果**
    - 卡片移動使用 `transform` + `transition` 實現平滑動畫（1-2 秒）
    - 標記觸發時的視覺反饋（等級區域高亮、震動效果）
    - 文本打字機效果（逐字出現）
    - 頁面過渡動畫

12. **響應式設計**
    - 桌面版（≥1024px）：Tier List 橫向排列
    - 平板版（768-1023px）：垂直堆疊但保持完整功能
    - 移動版（<768px）：簡化 UI，優先顯示文本和當前等級
    - 在 [index.css](frontend/index.css) 添加媒體查詢

13. **主題與樣式**
    - 參考 [從夯到拉.png](frontend/assets/從夯到拉.png) 設計配色方案
    - 五個等級使用不同的顏色（紅色=夯、綠色=拉完了 等）
    - 深色模式優先（當前 [index.css](frontend/index.css#L10) 已設定 `#242424`）
    - 使用 Tailwind 自定義主題擴展

### **階段五：進階功能（可選）**

14. **角色預設庫**
    - 在 [frontend/config/](frontend/config/) 創建 `roles.ts`
    - 預設常見角色（孫中山、魯迅、蔡英文等）及其 `role_description` 和推薦的 `tts_model`
    - 在 `<InputForm />` 提供快速選擇選項

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

- **標記解析時機**：選擇在 `StreamingText` 組件內解析而非後端處理，因為後端已經明確說明標記是給前端使用的，且需要在串流過程中即時觸發動畫
- **動畫庫選擇**：推薦使用 CSS transitions 而非 Framer Motion，減少依賴並保持輕量，除非需要複雜的軌跡動畫

- **狀態管理方案**：使用 React Hooks（useState/useReducer）而非 Redux，因為應用複雜度不高且組件樹較淺

- **音頻處理**：使用原生 HTML5 Audio 而非 Web Audio API，因為只需要基礎播放控制，不需要複雜的音頻處理

- **串流實現**：繼續使用 Fetch API + ReadableStream（如 [home.tsx](frontend/pages/home.tsx#L42-L57) 現有方式），經過驗證可靠且瀏覽器兼容性好

---

這個計劃涵蓋了從基礎 UI 到進階功能的完整實現路徑。核心功能（階段一至三）應優先完成以實現 MVP，進階功能可根據需求迭代添加。
