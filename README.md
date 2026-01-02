<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SphereView

一個基於 React + Three.js 的 3D 隱函數曲面視覺化工具，可以即時渲染數學方程式並互動操作座標點。

## 功能特色

- 🎨 即時 3D 曲面渲染
- 🎯 互動式座標控制
- 📐 支援任意隱函數方程式 f(x,y,z) = 0
- 🌈 現代化 UI 設計
- ⚡ 使用 Vite 快速開發

## 技術棧

- **前端框架**: React 19
- **3D 渲染**: Three.js + React Three Fiber + Drei
- **數學運算**: Math.js
- **建置工具**: Vite
- **語言**: TypeScript

## 本地開發

### 前置需求

- Node.js 20 或以上版本
- npm 或 yarn

### 安裝步驟

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設定環境變數**
   
   建立 `.env.local` 檔案並設定你的 Gemini API Key：
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   
   開啟瀏覽器訪問 http://localhost:3000

### 可用指令

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建置生產版本
- `npm run preview` - 預覽生產版本
- `npm run type-check` - TypeScript 型別檢查

## 部署

### GitHub Pages 自動部署

專案已設定 GitHub Actions 自動部署流程：

1. **設定 Repository Secrets**
   
   在 GitHub Repository 設定中加入：
   - `GEMINI_API_KEY`: 你的 Gemini API Key

2. **啟用 GitHub Pages**
   
   - 前往 Repository Settings > Pages
   - Source 選擇 "GitHub Actions"

3. **推送到 main 分支**
   
   ```bash
   git push origin main
   ```
   
   GitHub Actions 會自動建置並部署到 GitHub Pages

### 手動部署

```bash
# 建置專案
npm run build

# dist 資料夾即為可部署的靜態檔案
```

## 專案結構

```
SphereView/
├── components/          # React 元件
│   └── Visualizer.tsx  # 3D 視覺化元件
├── services/           # 服務層
│   └── mathSolver.ts   # 數學運算服務
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions 部署設定
├── App.tsx             # 主應用元件
├── index.tsx           # 應用入口
├── types.ts            # TypeScript 型別定義
├── vite.config.ts      # Vite 設定
└── package.json        # 專案依賴
```

## 使用說明

1. 在左側面板輸入方程式（例如：`x^2 + y^2 + z^2 - 1` 表示單位球面）
2. 使用滑桿或輸入框調整 X、Y、Z 座標
3. 右側 3D 視圖會即時顯示曲面和座標點
4. 可以用滑鼠拖曳旋轉、滾輪縮放視角

## AI Studio

原始專案來自 AI Studio: https://ai.studio/apps/drive/1eGMflJETfWNl_Ys-NwNKrOUjezYpSp2v

## License

MIT

