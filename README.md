# AI-Tier - 銳評AI系統

這是一個使用 AI 來進行銳評（Tier List）的系統，支援語音朗讀、圖片搜尋、以及分享功能。

## 新功能

### 1. 全局狀態管理
- 使用 React Context 實現全局狀態管理
- 記錄所有銳評案例，包含時間、表單內容、回覆和 case id
- 支援 JSON 序列化和反序列化
- 即時更新串流文字到全局狀態

### 2. 點擊圖片顯示詳細資訊
- 左側 Tier List 上的圖片可以點擊
- 使用 Framer Motion 實現流暢的動畫效果
- 彈窗顯示詳細資訊：
  - 案例 ID 和時間戳
  - 評級結果
  - 銳評內容
  - 表單資訊（銳評者、風格、模型等）

### 3. 分享功能
- 點擊分享按鈕將所有案例保存到後端
- 生成唯一的分享連結
- 自動複製連結到剪貼簿
- 訪問分享連結可查看所有案例的 Tier List

## 技術架構

### 前端
- React + TypeScript
- Framer Motion - 動畫效果
- React Context - 全局狀態管理
- React Router - 路由管理
- Axios - HTTP 請求

### 後端
- FastAPI - Web 框架
- JSON 文件存儲 - 案例數據持久化

## 使用方法

### 啟動前端
```bash
npm run dev
```

### 啟動後端
```bash
npm run backend
```

### 構建項目
```bash
npm run build
```

## API 端點

- `POST /tier` - 創建新的銳評
- `GET /text/{case_id}` - 獲取串流文字
- `GET /tts/{case_id}` - 獲取語音
- `POST /save-cases` - 保存案例數據
- `GET /share/{share_id}` - 獲取分享的案例數據

## 目錄結構

```
frontend/
├── components/
│   ├── CaseDetailModal.tsx    # 案例詳情彈窗
│   ├── ShareButton.tsx         # 分享按鈕
│   └── ...
├── contexts/
│   └── ReviewCaseContext.tsx   # 全局狀態管理
├── pages/
│   ├── home.tsx                # 主頁
│   └── shared.tsx              # 分享頁面
└── ...

backend/
├── main.py                     # API 端點
├── shared_cases/               # 分享案例存儲目錄
└── ...
```

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
