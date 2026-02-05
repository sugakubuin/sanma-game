# 🀄 Sanma Game （三人麻雀ゲーム）

A modern, web-based 3-player Riichi Mahjong game built with React and TypeScript.  
Focusing on a premium UI experience inspired by modern mahjong apps, with deep gameplay mechanics.

![Sanma Game](https://img.shields.io/badge/Status-Development-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features (特徴)

- **Authentic 3-Player Rules (Sanma)**:
  - 112 Tiles (Manzu 1/9, Pinzu/Souzu 1-9, Honors)
  - **North Tile (Kita)**: Treated as special "Flower Tiles" (Nuki-Dora).
  - **Special Tiles**: Red 5s, Gold 5s (5p/5s/Flower), and White Pochi (All-star tile).
- **Rich Scoring System**:
  - 50,000 points start / 50,000 points return.
  - "Tsumo loss" rules and custom scoring tables.
  - Yakuman extensions (Daisharin, Renhou, etc.).
- **Modern Web Technology**:
  - Fast development with **Vite**.
  - Type-safe logic with **TypeScript**.
  - Global state management with **Zustand**.

## 🚀 Getting Started (始め方)

### Prerequisites
- Node.js (v18 or later recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sugakubuin/sanma-game.git
   cd sanma-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Vanilla CSS (Glassmorphism & Premium UI design)

## 📜 Rules Detail (ルール詳細)

- **Players**: 3 (East, South, West)
- **Game Length**: Hanchan (East & South rounds)
- **Points**: Start 50,000 / Return 50,000
- **Dora**:
  - Red 5 (Pin/Sou x4)
  - Gold 5 (Pin/Sou/Flower x1)
  - White Pochi (Special Yaku/Bonus)
- **Pegs (Tsumibou)**: 1000 points per counter (Ron benefit +1000, Tsumo benefit +1000 all).

For full specification, please refer to:
[Game Logic Specification](./references/★三人麻雀ゲームロジック仕様_修正版.md)

---
*Created by sugakubuin*