# 項目完成心得記錄 | Project Accomplishments & Reflections

## 2026-04-20

**修正 README 並新增 Demo 部分 | Fix README and Add Demo Section**

- 將功能描述中的 "tier" 改回 "judge" 以準確反映評分系統的本質 | Refined wording to accurately describe the tier judgment system, restored clarity in feature descriptions
- 新增 Demo 部分，包含影片演示和功能截圖 | Added demo section with video walkthrough and feature screenshots
- 心得：完整的文檔和視覺演示是項目展示的門面。投入時間打磨 README 和 Demo 區域，能夠大幅提升第一印象和用戶轉化率 | **Reflection:** A polished README and demo section is the project's first impression. Investing time here pays dividends in user acquisition and conversion.

## 2026-04-19

**實現完整的國際化系統 (i18next) | Implement Full Internationalization (i18next)**

- 整合 i18next 和 react-i18next 實現多語言架構 | Integrated i18next and react-i18next for multi-language architecture
- 建立語言切換器，支持英文和繁體中文無縫切換 | Built language switcher supporting English and Traditional Chinese with seamless UI toggle
- 翻譯所有關鍵頁面（首頁、分享頁、404 頁面）和常數（評級列表） | Translated all key pages (home, shared tiers, 404) and app constants (tier lists, UI labels)
- 優化 SEO 元標籤和結構化數據以支持多語言 | Enhanced SEO meta tags and structured data for multi-language support
- 心得：國際化不僅是翻譯文字。需要考慮 SEO、語言上下文、結構化數據等多個層面。系統化的方法能確保代碼可維護性，為未來添加新語言做好基礎 | **Reflection:** Localization is more than translation—it demands attention to SEO, language context, and structured data. A systematic approach ensures maintainability and makes future language additions trivial.

## 2026-04-19

**優化頁面動畫和評級系統 | Refine Animation and Tier System**

- 將評級標籤從 F 改為 S，與新的評分標準對齊 | Updated tier labels from F to S to match the new tier ranking standard
- 優化 AnimatePresence 使用 popLayout mode，提升動畫流暢度 | Switched AnimatePresence to `popLayout` mode for smoother tier placement animations
- 心得：細節決定品質。看似微小的調整（標籤、動畫模式）累積起來能顯著改善用戶體驗的整體質感 | **Reflection:** Details compound. Small tweaks in naming and animation mode accumulate into a noticeably refined user experience.

## 2026-02-21

**完成反機器人驗證集成 (Turnstile) | Complete Bot Protection (Turnstile)**

- 在評分和分享功能中完整集成 Cloudflare Turnstile | Integrated Cloudflare Turnstile across tier judgment and sharing flows
- 使用 Python Turnstile 庫在後端驗證 | Implemented server-side verification with pyturnstile library
- 修復了分享時的驗證邏輯 | Fixed validation logic in the share workflow
- 改用「小明劍魔」作為預設語音，提升親和力 | Switched default TTS voice to a more personable option
- 心得：反機器人驗證雖增加開發複雜度，但對於開放平台是必要的防護。選擇合適的驗證方案（相較於 reCAPTCHA）能提升用戶體驗 | **Reflection:** Bot protection adds complexity but is essential for an open platform. Choosing Turnstile over reCAPTCHA balances security and user experience.

## 2026-02-15~16

**遷移 LLM 網關至 Cloudflare AI Gateway | Migrate to Cloudflare AI Gateway**

- 從 openrouter 遷移至 Cloudflare AI Gateway，解決配額耗盡問題 | Migrated LLM routing from OpenRouter to Cloudflare AI Gateway to resolve quota exhaustion
- 修復了多個相關的錯誤（模型名稱、提示詞等） | Fixed cascading issues: model naming, prompt formatting, and API compatibility
- 優化了前端無障礙性和動畫流暢度 | Improved frontend accessibility and animation smoothness
- 心得：及時的架構決策能解決關鍵的運營瓶頸。Cloudflare 方案提供了更好的成本效益、可靠性和集成度。當主要依賴出現問題時，要有替代方案 | **Reflection:** Timely architectural pivots solve critical operational bottlenecks. Cloudflare's solution offered better cost efficiency, reliability, and integration depth. Always have a backup strategy for critical dependencies.

## 2026-02-15

**SEO 優化和基礎設施完善 | SEO Optimization and Infrastructure Polish**

- 新增 404 頁面提升用戶體驗 | Added a custom 404 page for better user guidance
- 優化所有頁面的 SEO 元標籤和 Link 結構 | Optimized SEO meta tags and link structures across all pages
- 調整圖片動畫速度，避免過快移動 | Tuned image animation timing to prevent jarring movements
- 心得：SEO 優化是持續迭代過程。每一個小改進（標籤、結構、性能）都有累積效應。完善 404 等邊界情況是專業度的體現 | **Reflection:** SEO is an iterative game of small wins. Each improvement (tags, structure, performance) compounds. Polishing edge cases like 404 pages signals professional craftsmanship.

## 2026-02-13

**新增數據分析功能 | Add Analytics and Data Collection**

- 添加全局評審案例記錄和分析 | Added global review case logging and analytics infrastructure
- 改正年份信息 | Corrected year information in metadata
- 心得：數據驅動決策的基礎是有完整的數據收集。在產品初期就建立分析框架，能為後續優化提供寶貴的用戶行為數據 | **Reflection:** Data-driven decisions require clean data collection. Instrumenting analytics early pays dividends—you'll have rich behavioral data for future optimization.

## 2026-02-12

**完成 LLM 模型選擇系統和多項改進 | Complete LLM Model Selection System**

- 實現 LLM 模型選項功能，集成多種模型支持 | Implemented model selection UI with support for multiple Google Gemini variants
- 更新 API 服務和前端選擇器 | Updated API service layer and frontend model picker
- 修正環境變數設定 | Corrected environment variable configuration
- 調整編譯設置，移除無用變數警告 | Cleaned up compiler warnings and unused variable declarations
- 改進動畫流暢度 | Improved animation smoothness
- 心得：模型選擇是核心功能。完整的系統需要後端 API、前端 UI、環境配置的協調。看似小的代碼整理（大小寫、編譯警告）能提升開發體驗和 CI/CD 健康度 | **Reflection:** Model selection is a cornerstone feature. A complete system demands backend API, frontend UI, and environment orchestration. Small code hygiene wins (casing, compiler cleanliness) improve the entire developer experience and CI/CD health.

## 2026-02-09

**引入開源條款和響應式設計修復 | Add License and Fix Responsive Design**

- 添加開源許可證 | Added MIT license for open-source distribution
- 修復了分享按鈕和響應式布局問題 | Fixed responsive layout and share button bugs
- 完成全局狀態管理、可點擊圖片模態框和分享功能的整合 | Completed integration of global state management, clickable tier images with modals, and sharing
- 透過 Copilot PR 完成代碼審查和改進 | Conducted code review and refinements via collaborative pull requests
- 心得：開源治理從一開始就很重要。建立清晰的許可證和貢獻流程，能為項目的長期發展奠定基礎 | **Reflection:** Open-source governance matters from day one. A clear license and contribution workflow establishes the foundation for sustainable long-term growth.

## 2026-02-08

**核心功能開發和文檔完善 | Develop Core Features and Documentation**

- 實現全局狀態管理（Global State） | Built global state management using React Context
- 開發可點擊的圖片模態框和動畫效果 | Developed clickable tier images with modal dialogs and smooth animations
- 實現分享功能，包括案例分享和結果分享 | Implemented tier list sharing with persistent case storage
- 添加 TypeScript 類型安全和構建配置修復 | Added comprehensive TypeScript typing and fixed build configuration
- 編寫完整的功能文檔和架構圖 | Authored complete feature documentation and architecture diagrams
- 心得：核心功能的開發要同步進行文檔編寫。及時的文檔不僅幫助團隊協作，也是後期維護的基礎。優先處理類型安全和構建問題，能在早期避免大量技術債 | **Reflection:** Core feature development and documentation should move in parallel. Timely documentation accelerates collaboration and eases maintenance. Prioritize type safety and build health early—compound interest on technical debt is brutal.

## 2026-02-07

**前端框架搭建和後端優化 | Frontend Framework Setup and Backend Optimization**

- 安裝 Tailwind CSS 和 shadcn UI 組件庫 | Set up Tailwind CSS v4 and shadcn/ui component library
- 手動開發高質量的前端動畫效果 | Hand-crafted high-quality animations using Framer Motion
- 優化後端提示詞和邏輯 | Refined LLM prompts and backend logic for better tier judgments
- 實現自動記憶體清理機制 | Implemented automatic memory cleanup to prevent resource leaks
- 將提供系統使用文本（[從夯到拉]）從語音中隱藏 | Filtered internal system text from TTS output
- 心得：選擇合適的 UI 框架（Tailwind + shadcn）能加速開發。但核心的動畫效果仍需手工打磨才能達到理想質感。後端的細節優化（提示詞、記憶體管理）直接影響用戶體驗 | **Reflection:** The right UI framework (Tailwind + shadcn) accelerates development. But animations demand hand-crafting for polish. Backend details—prompts, memory management—directly shape the user experience.

## 2026-02-07

**項目初始化 | Project Initialization**

- 建立項目基礎架構和初始規劃 | Established project architecture and initial roadmap
- 心得：好的開始是成功的一半。初期的架構決策和規劃會影響整個項目的發展軌跡 | **Reflection:** A strong start compounds. Early architectural decisions shape the entire trajectory of the project.
