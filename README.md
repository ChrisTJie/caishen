# 發財靈籤 - 樂透選號 (Caishen)

傳統民俗儀式感與現代前端技術結合的樂透選號網頁應用（目前 **v1.5.0**）。選號結果**僅供娛樂參考**，不會提高中獎機率。

## 特色

- 大樂透、威力彩、今彩 539，以及自定義範圍選號
- 求籤儀式會把籤詩帶到後續選號結果（不改變隨機機率）
- 一次可產生 1 或 5 組號碼，五組以甲乙丙丁戊分組檢視；歷史紀錄支援手動對獎
- 時辰真實表：查今日或指定日的十二時辰、台灣真太陽時（台北／台中／高雄經度）、農曆干支生肖，以及黃黑道十二天神。僅供民俗計時參考，與選號、開獎無關
- 正式 Tailwind 建置與 PWA 離線快取（字型以系統字為後備）

## 技術棧

- React 19 + TypeScript（`strict`）
- Vite 6 + Tailwind CSS v4（`@tailwindcss/vite`）
- Framer Motion、Web Audio API（農曆新年背景音樂＋程序化音效）
- `lunar-typescript`：農曆、干支與黃黑道輪值
- Vite PWA、Vitest、ESLint

## 環境需求

- Node.js 20 或以上

## 指令

```bash
npm install
npm run dev
npm run test
npm run lint
npm run typecheck
npm run build
```

開發伺服器預設為 `http://localhost:3000`。

## 專案結構

- `src/App.tsx`：頁面切換、音效開關與全局佈局
- `src/lib/`：不放回抽號、分享、歷史紀錄、求籤進度、音效、時辰與真太陽時、農曆與黃黑道
- `src/components/lottery/`：選號卡、自定義、歷史與對獎
- `src/components/shichen/`：時辰真實表
- `src/components/ritual/`：求籤儀式
- `src/components/layout/`：燈籠、金浪、粒子等裝飾
- `public/`：PWA 圖示與本地紋理

## 免責聲明

本專案提供的選號功能純屬娛樂用途，結果僅供參考。時辰、真太陽時與黃黑道為民俗查閱，各家黃曆可能不同，不會改變中獎機率。請理性購買樂透，切勿過度投注。

LUCKY LAB © 2026 | 祝您財星高照，馬到成功！
